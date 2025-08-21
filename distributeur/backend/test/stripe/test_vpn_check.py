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

@pytest.mark.order(1) # LOX n°5
def test_check_vpn_blocked_country(client, monkeypatch):
    """Test VPN detection for requests from blocked countries (e.g., Cuba)
    using fallback mechanism when all VPN services return no detection."""

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

@pytest.mark.order(1) # LOX n°5
def test_check_vpn_server_error(client, monkeypatch):
    """Test proper error handling when internal server errors occur during VPN checks."""

    def mock_error(*args, **kwargs):
        raise Exception("Test error")
    monkeypatch.setattr("routes.stripe.vpn_check.clean_cache", mock_error)

    response = client.post('/check-vpn', json={})
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "error" in data

@pytest.mark.order(1) # LOX n°5
def test_check_stripe_access_success(client, monkeypatch):
    """Test successful Stripe access with valid parameters and no VPN/detection issues."""

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

@pytest.mark.order(1) # LOX n°5
def test_check_stripe_access_blocked(client, monkeypatch):
    """Test Stripe access blocking when VPN detection and adblock/public network are detected."""

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
@pytest.mark.order(1) # LOX n°5
def test_check_vpn_adblock_user_agent(client, monkeypatch):
    """Test adblock detection for different User-Agent patterns (uBlock Origin)."""

    headers = {'User-Agent': 'Mozilla/5.0 with AdBlock'}
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

@pytest.mark.order(1) # LOX n°5
def test_check_vpn_adblock_user_agent_detection(client, monkeypatch):
    """Test VPN detection for IPs belonging to hosting/cloud ASNs (e.g., OVH)."""

    headers = {'User-Agent': 'Mozilla/5.0 with uBlock Origin'}
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

@pytest.mark.order(1) # LOX n°5
def test_check_vpn_hosting_asn(client, monkeypatch):
    """Test cache expiration mechanism by manually expiring cache entries."""

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

@pytest.mark.order(1) # LOX n°5
def test_check_vpn_cache_expiration(client, monkeypatch):
    """Test cache bypassing when forceRefresh parameter is provided."""

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

@pytest.mark.order(1) # LOX n°5
def test_check_vpn_force_refresh(client, monkeypatch):
    """Test error handling for exceptions during IP information retrieval."""

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

@pytest.mark.order(1) # LOX n°5
def test_check_stripe_access_exception(client, monkeypatch):
    """Test fallback to country-based blocking when VPN services don't detect proxies."""

    def mock_error(*args, **kwargs):
        raise Exception("Test error")
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", mock_error)

    response = client.post('/check-stripe-access', json={})
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "error" in data

@pytest.mark.order(1) # LOX n°5
def test_check_vpn_blocked_country_fallback(client, monkeypatch):
    """Test that the system correctly falls back to country-based blocking
    when VPN services don't detect threats but the IP is from a blocked country."""

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

@pytest.mark.order(1) # LOX n°5
def test_clean_cache_functionality(client, monkeypatch):
    """Test that the cache cleaning mechanism properly removes expired entries
    while preserving valid cache items."""

    from routes.stripe import vpn_check
    now = datetime.now(timezone.utc)

    # Add expired entry
    vpn_check.vpn_cache["expired_ip"] = {
        "result": {"isVPN": False},
        "timestamp": now - timedelta(days=2),
        "expires": now - timedelta(days=1)
    }

    # Add a valid entry
    vpn_check.vpn_cache["valid_ip"] = {
        "result": {"isVPN": False},
        "timestamp": now,
        "expires": now + timedelta(hours=24)
    }

    vpn_check.clean_cache()

    assert "expired_ip" not in vpn_check.vpn_cache
    assert "valid_ip" in vpn_check.vpn_cache

@pytest.mark.order(1) # LOX n°5
def test_is_known_hosting_asn_match(monkeypatch):
    """Test ASN detection"""
    from routes.stripe.vpn_check import is_known_hosting
    assert is_known_hosting("Some ISP", "AS16276") is True

@pytest.mark.order(1) # LOX n°5
def test_is_known_hosting_keyword_match(monkeypatch):
    """Test keyword detection in ISP"""
    from routes.stripe.vpn_check import is_known_hosting
    assert is_known_hosting("Google Cloud", "AS123") is True

@pytest.mark.order(1) # LOX n°5
def test_check_services_timeout(client, monkeypatch):
    """Test when all services timeout"""
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

@pytest.mark.order(1) # LOX n°5
def test_vpn_detected_early_break(client, monkeypatch):
    """Test early shutdown when a service detects a VPN"""
    # Create a counter to check how many services are called
    call_count = {"count": 0}

    def mock_service(ip):
        call_count["count"] += 1
        # Only the first service returns True, the others return False
        return call_count["count"] == 1

    # Mount all services with the same mocked function
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

    # Check that the VPN is detected
    assert data["vpnDetected"] is True
    # Check that less than 5 services have been completed (because we break early)
    assert data["checksPerformed"] == 5  # All are launched
    assert call_count["count"] <= 5  # But we don't wait for all the results

@pytest.mark.order(1) # LOX n°5
def test_get_ip_info_failure(client, monkeypatch):
    """Test when ip-api.com fails"""
    monkeypatch.setattr(
        "routes.stripe.vpn_check.get_ip_info",
        lambda ip: None
    )

    # Fail all services
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

@pytest.mark.order(1) # LOX n°5
def test_blocked_cache_ttl(client, monkeypatch):
    """Test reduced cache time for blocked IPs"""
    from routes.stripe import vpn_check

    # Simulate VPN detection
    monkeypatch.setattr(
        "routes.stripe.vpn_check.check_iphub",
        lambda ip: True
    )

    response = client.post('/check-vpn', json={})
    data = json.loads(response.data)
    assert data["isVPN"] is True

    ip = data["ip"]
    cache_entry = vpn_check.vpn_cache[ip]

    # Check that the TTL is the same as the blocked ones
    expected_expiry = cache_entry["timestamp"] + vpn_check.BLOCKED_CACHE_TTL
    assert cache_entry["expires"] == expected_expiry

@pytest.mark.order(1) # LOX n°5
def test_service_exception_handling(client, monkeypatch):
    """Test that exceptions in services are handled correctly"""
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

@pytest.mark.order(1) # LOX n°5
def test_stripe_access_missing_api_keys(client, monkeypatch):
    """Test behavior when API keys are missing"""

    # Simulate the absence of API keys
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

@pytest.mark.order(1) # LOX n°5
def test_check_vpn_invalid_json(client):
    """Test the response for invalid JSON"""
    response = client.post('/check-vpn', data="not json")
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data

@pytest.mark.order(1) # LOX n°5
def test_stripe_access_suggestions(client, monkeypatch):
    """Test that suggestions are correctly returned by the API"""

    # Simulate multiple problems
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

    # Check that the suggestions are present
    suggestions = data["suggestions"]
    assert len(suggestions) > 0

    # Check specific suggestions
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

@pytest.mark.order(1) # LOX n°5
def test_is_known_hosting_no_match(client):
    """Test is_known_hosting returns False"""

    from routes.stripe.vpn_check import is_known_hosting
    assert is_known_hosting("Residential ISP", "AS12345") is False

@pytest.mark.order(1) # LOX n°5
def test_get_ip_info_exception(monkeypatch):
    """Test get_ip_info exception handling"""

    monkeypatch.setattr("requests.get", MagicMock(side_effect=Exception("Test")))
    from routes.stripe.vpn_check import get_ip_info
    assert get_ip_info("8.8.8.8") is None

@pytest.mark.order(1) # LOX n°5
def test_check_iphub_exception(monkeypatch):
    """Test check_iphub exception handling"""

    monkeypatch.setattr("requests.get", MagicMock(side_effect=Exception("Test")))
    from routes.stripe.vpn_check import check_iphub
    assert check_iphub("8.8.8.8") is None

@pytest.mark.order(1) # LOX n°5
def test_check_proxycheck_exception(monkeypatch):
    """Test check_proxycheck exception handling"""

    monkeypatch.setattr("requests.get", MagicMock(side_effect=Exception("Test")))
    from routes.stripe.vpn_check import check_proxycheck
    assert check_proxycheck("8.8.8.8") is None

@pytest.mark.order(1) # LOX n°5
def test_check_iphunter_exception(monkeypatch):
    """Test check_iphunter exception handling"""

    monkeypatch.setattr("requests.get", MagicMock(side_effect=Exception("Test")))
    from routes.stripe.vpn_check import check_iphunter
    assert check_iphunter("8.8.8.8") is None

@pytest.mark.order(1) # LOX n°5
def test_check_abuseipdb_exception(monkeypatch):
    """Test check_abuseipdb exception handling"""

    monkeypatch.setattr("requests.get", MagicMock(side_effect=Exception("Test")))
    from routes.stripe.vpn_check import check_abuseipdb
    assert check_abuseipdb("8.8.8.8") is None

@pytest.mark.order(1) # LOX n°5
def test_check_vpn_multi_ips(client, monkeypatch):
    """Test multiple IPs in X-Forwarded-For"""

    headers = {'X-Forwarded-For': '192.168.1.1, 10.0.0.1'}
    mock_ip_info = {"isp": "Home", "as": "AS123", "countryCode": "FR"}
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", lambda ip: mock_ip_info)

    response = client.post('/check-vpn', json={}, headers=headers)
    data = json.loads(response.data)
    assert data["ip"] == "192.168.1.1"

@pytest.mark.order(1) # LOX n°5
def test_check_vpn_cache_hit(client, monkeypatch):
    """Test VPN cache hit"""

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

@pytest.mark.order(1) # LOX n°5
def test_check_stripe_multi_ips(client, monkeypatch):
    """Test multiple IPs in Stripe route"""

    headers = {'X-Forwarded-For': '192.168.1.1, 10.0.0.1'}
    response = client.post('/check-stripe-access', json={}, headers=headers)
    assert response.status_code == 200

@pytest.mark.order(1) # LOX n°5
def test_check_stripe_cache_hit(client, monkeypatch):
    """Test Stripe cache hit"""

    # First request populates cache
    client.post('/check-stripe-access', json={})

    # Second request should use cache
    with patch("routes.stripe.vpn_check.get_ip_info") as mock:
        response = client.post('/check-stripe-access', json={})
        mock.assert_not_called()
    assert response.status_code == 200

@pytest.mark.order(1) # LOX n°5
def test_stripe_service_exception_handling(client, monkeypatch):
    """Test service exceptions in Stripe thread pool"""

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

@pytest.mark.order(1) # LOX n°5
def test_stripe_fallback_hosting_detection(client, monkeypatch):
    """Test fallback hosting detection in Stripe"""

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

@pytest.mark.order(1) # LOX n°5
def test_is_known_hosting_missing_data(client):
    """Test is_known_hosting with missing ISP or ASN data"""

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
