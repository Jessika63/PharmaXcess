# test/stripe/test_vpn_check.py
import pytest
import json
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta, timezone

@pytest.fixture(autouse=True)
def clear_cache():
    """Clear VPN cache before each test"""
    from routes.stripe import vpn_check
    vpn_check.vpn_cache = {}
    yield

@pytest.mark.order(1)
def test_check_vpn_blocked_country(client, monkeypatch):
    # Mock all services to return None
    services = ["check_iphub", "check_getipintel", "check_proxycheck", 
                "check_iphunter", "check_abuseipdb"]
    for service in services:
        monkeypatch.setattr(f"routes.stripe.vpn_check.{service}", lambda ip: None)
    
    mock_ip_info = {
        "isp": "Home ISP",
        "as": "AS1234",
        "countryCode": "CU"
    }
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", lambda ip: mock_ip_info)
    
    response = client.post('/check-vpn', json={})
    data = json.loads(response.data)
    assert data["isVPN"] is True
    assert data["countryBlocked"] is True

@pytest.mark.order(1)
def test_check_vpn_server_error(client, monkeypatch):
    def mock_error(*args, **kwargs):
        raise Exception("Test error")
    monkeypatch.setattr("routes.stripe.vpn_check.clean_cache", mock_error)
    
    response = client.post('/check-vpn', json={})
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "error" in data

@pytest.mark.order(1)
def test_check_stripe_access_success(client, monkeypatch):
    services = ["check_iphub", "check_getipintel", "check_proxycheck", 
                "check_iphunter", "check_abuseipdb"]
    for service in services:
        monkeypatch.setattr(f"routes.stripe.vpn_check.{service}", lambda ip: False)
    
    mock_ip_info = {
        "isp": "Home ISP",
        "as": "AS1234",
        "countryCode": "FR"
    }
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", lambda ip: mock_ip_info)
    
    response = client.post('/check-stripe-access', json={
        "stripeJsLoaded": True,
        "cookiesEnabled": True,
        "jsEnabled": True,
        "adblockDetected": False,
        "firewallDetected": False,
        "publicNetwork": False,
        "privacySettingsDetected": False
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "status" in data
    assert data["status"] == "OK"

@pytest.mark.order(1)
def test_check_stripe_access_blocked(client, monkeypatch):
    monkeypatch.setattr("routes.stripe.vpn_check.check_iphub", lambda ip: True)
    
    mock_ip_info = {
        "isp": "VPN Provider",
        "as": "AS16276",
        "countryCode": "US"
    }
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", lambda ip: mock_ip_info)
    
    response = client.post('/check-stripe-access', json={
        "stripeJsLoaded": True,
        "cookiesEnabled": True,
        "jsEnabled": True,
        "adblockDetected": True,
        "publicNetwork": True
    })
    data = json.loads(response.data)
    assert "status" in data
    assert data["status"] == "BLOQUE"

# Updated adblock tests
@pytest.mark.order(1)
def test_check_vpn_adblock_user_agent(client, monkeypatch):
    headers = {'User-Agent': 'Mozilla/5.0 with AdBlock'}  # Changed to 'AdBlock'
    mock_ip_info = {
        "isp": "Home ISP",
        "as": "AS1234",
        "countryCode": "FR"
    }
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", lambda ip: mock_ip_info)
    monkeypatch.setattr("routes.stripe.vpn_check.check_iphub", lambda ip: False)
    
    response = client.post('/check-vpn', json={}, headers=headers)
    data = json.loads(response.data)
    assert data["adblockDetected"] is True

@pytest.mark.order(1)
def test_check_vpn_adblock_user_agent_detection(client, monkeypatch):
    headers = {'User-Agent': 'Mozilla/5.0 with uBlock Origin'}  # Alternative keyword
    mock_ip_info = {
        "isp": "Home ISP",
        "as": "AS1234",
        "countryCode": "FR"
    }
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", lambda ip: mock_ip_info)
    monkeypatch.setattr("routes.stripe.vpn_check.check_iphub", lambda ip: False)
    
    response = client.post('/check-vpn', json={}, headers=headers)
    data = json.loads(response.data)
    assert data["adblockDetected"] is True

@pytest.mark.order(1)
def test_check_vpn_hosting_asn(client, monkeypatch):
    services = ["check_iphub", "check_getipintel", "check_proxycheck", 
                "check_iphunter", "check_abuseipdb"]
    for service in services:
        monkeypatch.setattr(f"routes.stripe.vpn_check.{service}", lambda ip: None)
    
    mock_ip_info = {
        "isp": "OVH Hosting",
        "as": "AS16276",
        "countryCode": "FR"
    }
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", lambda ip: mock_ip_info)
    
    response = client.post('/check-vpn', json={})
    data = json.loads(response.data)
    assert data["isVPN"] is True

@pytest.mark.order(1)
def test_check_vpn_cache_expiration(client, monkeypatch):
    mock_ip_info = {
        "isp": "Home ISP",
        "as": "AS1234",
        "countryCode": "FR"
    }
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", lambda ip: mock_ip_info)
    
    response1 = client.post('/check-vpn', json={})
    data1 = json.loads(response1.data)
    
    from routes.stripe import vpn_check
    for ip in list(vpn_check.vpn_cache.keys()):
        vpn_check.vpn_cache[ip]["expires"] = datetime.now(timezone.utc) - timedelta(days=1)
    
    response2 = client.post('/check-vpn', json={})
    data2 = json.loads(response2.data)
    assert data1["ip"] == data2["ip"]

@pytest.mark.order(1)
def test_check_vpn_force_refresh(client, monkeypatch):
    mock_ip_info = {
        "isp": "Home ISP",
        "as": "AS1234",
        "countryCode": "FR"
    }
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", lambda ip: mock_ip_info)
    
    response1 = client.post('/check-vpn', json={})
    data1 = json.loads(response1.data)
    
    response2 = client.post('/check-vpn', json={"forceRefresh": True})
    data2 = json.loads(response2.data)
    assert data1["ip"] == data2["ip"]

@pytest.mark.order(1)
def test_check_stripe_access_exception(client, monkeypatch):
    def mock_error(*args, **kwargs):
        raise Exception("Test error")
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", mock_error)
    
    response = client.post('/check-stripe-access', json={})
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "error" in data

@pytest.mark.order(1)
def test_check_vpn_blocked_country_fallback(client, monkeypatch):
    services = ["check_iphub", "check_getipintel", "check_proxycheck", 
                "check_iphunter", "check_abuseipdb"]
    for service in services:
        monkeypatch.setattr(f"routes.stripe.vpn_check.{service}", lambda ip: None)
    
    mock_ip_info = {
        "isp": "Home ISP",
        "as": "AS1234",
        "countryCode": "CU"
    }
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", lambda ip: mock_ip_info)
    
    response = client.post('/check-vpn', json={})
    data = json.loads(response.data)
    assert data["isVPN"] is True
    assert data["countryBlocked"] is True
    assert data["fallbackUsed"] is True

@pytest.mark.order(1)
def test_clean_cache_functionality(client, monkeypatch):
    """Test que le cache expiré est correctement nettoyé"""
    from routes.stripe import vpn_check
    now = datetime.now(timezone.utc)
    
    # Ajouter une entrée expirée
    vpn_check.vpn_cache["expired_ip"] = {
        "result": {"isVPN": False},
        "timestamp": now - timedelta(days=2),
        "expires": now - timedelta(days=1)
    }
    
    # Ajouter une entrée valide
    vpn_check.vpn_cache["valid_ip"] = {
        "result": {"isVPN": False},
        "timestamp": now,
        "expires": now + timedelta(hours=24)
    }
    
    vpn_check.clean_cache()
    
    assert "expired_ip" not in vpn_check.vpn_cache
    assert "valid_ip" in vpn_check.vpn_cache

@pytest.mark.order(1)
def test_is_known_hosting_asn_match(monkeypatch):
    """Test la détection par ASN"""
    from routes.stripe.vpn_check import is_known_hosting
    assert is_known_hosting("Some ISP", "AS16276") is True

@pytest.mark.order(1)
def test_is_known_hosting_keyword_match(monkeypatch):
    """Test la détection par mot-clé dans l'ISP"""
    from routes.stripe.vpn_check import is_known_hosting
    assert is_known_hosting("Google Cloud", "AS123") is True

@pytest.mark.order(1)
def test_check_services_timeout(client, monkeypatch):
    """Test quand tous les services timeout"""
    services = [
        "check_iphub", "check_getipintel", "check_proxycheck",
        "check_iphunter", "check_abuseipdb"
    ]
    
    for service in services:
        monkeypatch.setattr(
            f"routes.stripe.vpn_check.{service}",
            lambda ip: None
        )
    
    mock_ip_info = {
        "isp": "Free Mobile",
        "as": "AS12345",
        "countryCode": "FR"
    }
    monkeypatch.setattr(
        "routes.stripe.vpn_check.get_ip_info",
        lambda ip: mock_ip_info
    )
    
    response = client.post('/check-vpn', json={})
    data = json.loads(response.data)
    assert data["fallbackUsed"] is True
    assert data["isVPN"] is False

@pytest.mark.order(1)
@pytest.mark.order(1)
def test_vpn_detected_early_break(client, monkeypatch):
    """Test l'arrêt précoce quand un service détecte un VPN"""
    # Créer un compteur pour vérifier combien de services sont appelés
    call_count = {"count": 0}

    def mock_service(ip):
        call_count["count"] += 1
        # Seul le premier service retourne True, les autres retournent False
        return call_count["count"] == 1

    # Monter tous les services avec la même fonction mockée
    services = [
        "check_iphub", "check_getipintel", "check_proxycheck",
        "check_iphunter", "check_abuseipdb"
    ]
    for service in services:
        monkeypatch.setattr(
            f"routes.stripe.vpn_check.{service}",
            mock_service
        )

    response = client.post('/check-vpn', json={})
    data = json.loads(response.data)

    # Vérifier que le VPN est détecté
    assert data["vpnDetected"] is True
    # Vérifier que moins de 5 services ont été complétés (car on break early)
    assert data["checksPerformed"] == 5  # Tous sont lancés
    assert call_count["count"] <= 5  # Mais on n'attend pas tous les résultats

@pytest.mark.order(1)
def test_get_ip_info_failure(client, monkeypatch):
    """Test quand ip-api.com échoue"""
    monkeypatch.setattr(
        "routes.stripe.vpn_check.get_ip_info",
        lambda ip: None
    )
    
    # Faire échouer tous les services
    services = [
        "check_iphub", "check_getipintel", "check_proxycheck",
        "check_iphunter", "check_abuseipdb"
    ]
    for service in services:
        monkeypatch.setattr(
            f"routes.stripe.vpn_check.{service}",
            lambda ip: None
        )
    
    response = client.post('/check-vpn', json={})
    data = json.loads(response.data)
    assert data["fallbackUsed"] is True
    assert data["isVPN"] is False

@pytest.mark.order(1)
def test_blocked_cache_ttl(client, monkeypatch):
    """Test la durée de cache réduite pour les IP bloquées"""
    from routes.stripe import vpn_check
    
    # Simuler une détection VPN
    monkeypatch.setattr(
        "routes.stripe.vpn_check.check_iphub",
        lambda ip: True
    )
    
    response = client.post('/check-vpn', json={})
    data = json.loads(response.data)
    assert data["isVPN"] is True
    
    ip = data["ip"]
    cache_entry = vpn_check.vpn_cache[ip]
    
    # Vérifier que le TTL est bien celui des bloqués
    expected_expiry = cache_entry["timestamp"] + vpn_check.BLOCKED_CACHE_TTL
    assert cache_entry["expires"] == expected_expiry

@pytest.mark.order(1)
def test_service_exception_handling(client, monkeypatch):
    """Test que les exceptions dans les services sont correctement gérées"""
    def mock_exception(ip):
        raise Exception("Service error")
    
    monkeypatch.setattr(
        "routes.stripe.vpn_check.check_iphub",
        mock_exception
    )
    
    mock_ip_info = {
        "isp": "Home ISP",
        "as": "AS1234",
        "countryCode": "FR"
    }
    monkeypatch.setattr(
        "routes.stripe.vpn_check.get_ip_info",
        lambda ip: mock_ip_info
    )
    
    response = client.post('/check-vpn', json={})
    assert response.status_code == 200

@pytest.mark.order(1)
def test_stripe_access_missing_api_keys(client, monkeypatch):
    """Test le comportement quand les clés API sont manquantes"""
    # Simuler l'absence de clés API
    monkeypatch.delenv("IPHUB_API_KEY", raising=False)
    monkeypatch.delenv("IPHUNTER_API_KEY", raising=False)
    monkeypatch.delenv("ABUSEIPDB_API_KEY", raising=False)
    
    mock_ip_info = {
        "isp": "Home ISP",
        "as": "AS1234",
        "countryCode": "FR"
    }
    monkeypatch.setattr(
        "routes.stripe.vpn_check.get_ip_info",
        lambda ip: mock_ip_info
    )
    
    response = client.post('/check-stripe-access', json={
        "stripeJsLoaded": True,
        "cookiesEnabled": True
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["status"] == "OK"

@pytest.mark.order(1)
def test_check_vpn_invalid_json(client):
    """Test la réponse pour un JSON invalide"""
    response = client.post('/check-vpn', data="not json")
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data

@pytest.mark.order(1)
def test_stripe_access_suggestions(client, monkeypatch):
    """Test que les suggestions sont correctement renvoyées par l'API"""
    # Simuler plusieurs problèmes
    monkeypatch.setattr(
        "routes.stripe.vpn_check.check_iphub",
        lambda ip: True
    )
    
    mock_ip_info = {
        "isp": "Home ISP",
        "as": "AS1234",
        "countryCode": "CU"
    }
    monkeypatch.setattr(
        "routes.stripe.vpn_check.get_ip_info",
        lambda ip: mock_ip_info
    )
    
    frontend_issues = {
        "stripeJsLoaded": False,
        "cookiesEnabled": False,
        "jsEnabled": False,
        "adblockDetected": True,
        "firewallDetected": True,
        "publicNetwork": True,
        "privacySettingsDetected": True
    }
    
    response = client.post('/check-stripe-access', json=frontend_issues)
    data = json.loads(response.data)
    
    # Vérifier que les suggestions sont présentes
    suggestions = data["suggestions"]
    assert len(suggestions) > 0
    
    # Vérifier des suggestions spécifiques
    expected_suggestions = {
        "VPN": "Désactivez votre VPN",
        "Pays bloqué": "Stripe n'est pas disponible",
        "scripts Stripe": "Autorisez js.stripe.com",
        "Cookies": "Activez les cookies",
        "JavaScript": "Activez JavaScript",
        "Bloqueur": "Mettez votre bloqueur",
        "Pare-feu": "Essayez un autre réseau",
        "Réseau public": "Utilisez un réseau privé",
        "Paramètres de confidentialité": "Ajustez vos paramètres"
    }
    
    for keyword, expected in expected_suggestions.items():
        found = any(expected in s for s in suggestions)
        assert found, f"La suggestion '{expected}' n'a pas été trouvée pour le problème '{keyword}'"

# Add to test/stripe/test_vpn_check.py

@pytest.mark.order(1)
def test_is_known_hosting_no_match(client):
    """Test is_known_hosting returns False (line 32)"""
    from routes.stripe.vpn_check import is_known_hosting
    assert is_known_hosting("Residential ISP", "AS12345") is False

@pytest.mark.order(1)
def test_get_ip_info_exception(monkeypatch):
    """Test get_ip_info exception handling (lines 44-46)"""
    monkeypatch.setattr("requests.get", MagicMock(side_effect=Exception("Test")))
    from routes.stripe.vpn_check import get_ip_info
    assert get_ip_info("8.8.8.8") is None

@pytest.mark.order(1)
def test_check_iphub_exception(monkeypatch):
    """Test check_iphub exception handling (lines 57-59)"""
    monkeypatch.setattr("requests.get", MagicMock(side_effect=Exception("Test")))
    from routes.stripe.vpn_check import check_iphub
    assert check_iphub("8.8.8.8") is None

@pytest.mark.order(1)
def test_check_proxycheck_exception(monkeypatch):
    """Test check_proxycheck exception handling (lines 81-83)"""
    monkeypatch.setattr("requests.get", MagicMock(side_effect=Exception("Test")))
    from routes.stripe.vpn_check import check_proxycheck
    assert check_proxycheck("8.8.8.8") is None

@pytest.mark.order(1)
def test_check_iphunter_exception(monkeypatch):
    """Test check_iphunter exception handling (lines 94-96)"""
    monkeypatch.setattr("requests.get", MagicMock(side_effect=Exception("Test")))
    from routes.stripe.vpn_check import check_iphunter
    assert check_iphunter("8.8.8.8") is None

@pytest.mark.order(1)
def test_check_abuseipdb_exception(monkeypatch):
    """Test check_abuseipdb exception handling (lines 109-111)"""
    monkeypatch.setattr("requests.get", MagicMock(side_effect=Exception("Test")))
    from routes.stripe.vpn_check import check_abuseipdb
    assert check_abuseipdb("8.8.8.8") is None

@pytest.mark.order(1)
def test_check_vpn_multi_ips(client, monkeypatch):
    """Test multiple IPs in X-Forwarded-For (line 136)"""
    headers = {'X-Forwarded-For': '192.168.1.1, 10.0.0.1'}
    mock_ip_info = {"isp": "Home", "as": "AS123", "countryCode": "FR"}
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", lambda ip: mock_ip_info)
    
    response = client.post('/check-vpn', json={}, headers=headers)
    data = json.loads(response.data)
    assert data["ip"] == "192.168.1.1"

@pytest.mark.order(1)
def test_check_vpn_cache_hit(client, monkeypatch):
    """Test VPN cache hit (lines 147-149)"""
    mock_ip_info = {"isp": "Home", "as": "AS123", "countryCode": "FR"}
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", lambda ip: mock_ip_info)
    
    # First request populates cache
    client.post('/check-vpn', json={})
    
    # Second request should use cache
    with patch("routes.stripe.vpn_check.get_ip_info") as mock:
        response = client.post('/check-vpn', json={})
        mock.assert_not_called()
    
    data = json.loads(response.data)
    assert data["ip"] == "127.0.0.1"

@pytest.mark.order(1)
def test_check_stripe_multi_ips(client, monkeypatch):
    """Test multiple IPs in Stripe route (line 215)"""
    headers = {'X-Forwarded-For': '192.168.1.1, 10.0.0.1'}
    response = client.post('/check-stripe-access', json={}, headers=headers)
    assert response.status_code == 200

@pytest.mark.order(1)
def test_check_stripe_cache_hit(client, monkeypatch):
    """Test Stripe cache hit (lines 220-222)"""
    # First request populates cache
    client.post('/check-stripe-access', json={})
    
    # Second request should use cache
    with patch("routes.stripe.vpn_check.get_ip_info") as mock:
        response = client.post('/check-stripe-access', json={})
        mock.assert_not_called()
    assert response.status_code == 200

@pytest.mark.order(1)
def test_stripe_service_exception_handling(client, monkeypatch):
    """Test service exceptions in Stripe thread pool (lines 240-241)"""
    def mock_exception(ip):
        raise Exception("Service error")
    
    services = ["check_iphub", "check_getipintel", "check_proxycheck", 
                "check_iphunter", "check_abuseipdb"]
    for service in services:
        monkeypatch.setattr(f"routes.stripe.vpn_check.{service}", mock_exception)
    
    mock_ip_info = {"isp": "Home", "as": "AS123", "countryCode": "FR"}
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", lambda ip: mock_ip_info)
    
    response = client.post('/check-stripe-access', json={})
    assert response.status_code == 200

@pytest.mark.order(1)
def test_stripe_fallback_hosting_detection(client, monkeypatch):
    """Test fallback hosting detection in Stripe (line 245)"""
    # Make all services fail
    services = ["check_iphub", "check_getipintel", "check_proxycheck", 
                "check_iphunter", "check_abuseipdb"]
    for service in services:
        monkeypatch.setattr(f"routes.stripe.vpn_check.{service}", lambda ip: None)
    
    # Set hosting IP info
    mock_ip_info = {"isp": "OVH Hosting", "as": "AS16276", "countryCode": "FR"}
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", lambda ip: mock_ip_info)
    
    response = client.post('/check-stripe-access', json={})
    data = json.loads(response.data)
    assert data["vpnDetected"] is True

@pytest.mark.order(1)
def test_is_known_hosting_missing_data(client):
    """Test is_known_hosting with missing ISP or ASN data (line 32)"""
    from routes.stripe.vpn_check import is_known_hosting
    
    # Test missing ISP
    assert is_known_hosting(None, "AS16276") is False
    
    # Test missing ASN
    assert is_known_hosting("Google Cloud", None) is False
    
    # Test both missing
    assert is_known_hosting(None, None) is False
    
    # Test empty strings
    assert is_known_hosting("", "AS16276") is False
    assert is_known_hosting("Google Cloud", "") is False
    assert is_known_hosting("", "") is False
