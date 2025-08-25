import pytest
import json
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta, timezone

@pytest.fixture(autouse=True)
def clear_cache():
    """
    Objectif: Pytest fixture that automatically clears the VPN cache before each test to ensure a clean state.

    Parameters:
        - None

    Return Value:
        - None: This fixture does not return a value but yields control back to the test after clearing the cache.
    """
    from routes.stripe import vpn_check
    vpn_check.vpn_cache = {}
    yield

@pytest.mark.order(1) # LOX n°5
def test_check_vpn_blocked_country(client, monkeypatch):
    """
    Objectif: Test the /check-vpn endpoint for VPN detection from blocked countries using fallback mechanisms when VPN services return no detection.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """

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
    """
    Objectif: Test the /check-vpn endpoint for proper error handling when internal server errors occur during VPN checks.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    def mock_error(*args, **kwargs):
        """
        Objectif: Mock function that raises a generic Exception with a test error message for testing error handling scenarios.

        Parameters:
            - *args: Variable length argument list (ignored in this function). (Any)
            - **kwargs: Arbitrary keyword arguments (ignored in this function). (Any)

        Return Value:
            - None: This function does not return and always raises an Exception. (NoneType)
        """
        raise Exception("Test error")
    monkeypatch.setattr("routes.stripe.vpn_check.clean_cache", mock_error)

    response = client.post('/check-vpn', json={})
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "error" in data

@pytest.mark.order(1) # LOX n°5
def test_check_stripe_access_success(client, monkeypatch):
    """
    Objectif: Test the /check-stripe-access endpoint for successful Stripe access with valid parameters and no VPN/detection issues.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """

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
    """
    Objectif: Test the /check-stripe-access endpoint for Stripe access blocking when VPN detection and adblock/public network issues are detected.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
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

@pytest.mark.order(1) # LOX n°5
def test_check_vpn_adblock_user_agent(client, monkeypatch):
    """
    Objectif: Test the /check-vpn endpoint for adblock detection via User-Agent string patterns.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
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
    """
    Objectif: Test the /check-vpn endpoint for adblock detection via specific User-Agent string patterns (uBlock Origin).

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
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
    """
    Objectif: Test the /check-vpn endpoint for VPN detection when the IP address belongs to a hosting ASN (e.g., OVH) and all VPN detection services return no detection, relying on the fallback ISP/ASN check.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
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
    """
    Objectif: Test the cache expiration mechanism of the /check-vpn endpoint by manually expiring cache entries and verifying that a new request bypasses the cache.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
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
    """
    Objectif: Test the /check-vpn endpoint's forceRefresh functionality to ensure cache bypass when requested.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
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
    """
    Objectif: Test the /check-stripe-access endpoint when an exception occurs during IP information retrieval.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    def mock_error(*args, **kwargs):
        """
        Objectif: Mock function that raises a generic Exception with a test error message for testing error handling scenarios.

        Parameters:
            - *args: Variable length argument list (ignored in this function). (Any)
            - **kwargs: Arbitrary keyword arguments (ignored in this function). (Any)

        Return Value:
            - None: This function does not return and always raises an Exception. (NoneType)
        """
        raise Exception("Test error")
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", mock_error)

    response = client.post('/check-stripe-access', json={})
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "error" in data

@pytest.mark.order(1) # LOX n°5
def test_check_vpn_blocked_country_fallback(client, monkeypatch):
    """
    Objectif: Test the /check-vpn endpoint's fallback mechanism for country-based blocking when VPN services return no detection but the IP is from a blocked country.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """

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
    """
    Objectif: Test the cache cleaning mechanism to verify it properly removes expired entries while preserving valid cache items.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the cache state. (NoneType)
    """

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
    """
    Objectif: Test the is_known_hosting function for correctly identifying a known hosting provider by ASN number.

    Parameters:
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the function's return value. (NoneType)
    """
    from routes.stripe.vpn_check import is_known_hosting
    assert is_known_hosting("Some ISP", "AS16276") is True

@pytest.mark.order(1) # LOX n°5
def test_is_known_hosting_keyword_match(monkeypatch):
    """
    Objectif: Test the is_known_hosting function for correctly identifying a known hosting provider by keyword matching in the ISP name.

    Parameters:
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the function's return value. (NoneType)
    """
    from routes.stripe.vpn_check import is_known_hosting
    assert is_known_hosting("Google Cloud", "AS123") is True

@pytest.mark.order(1) # LOX n°5
def test_check_services_timeout(client, monkeypatch):
    """
    Objectif: Test the /check-vpn endpoint when all VPN detection services timeout or fail to respond, verifying that the system falls back to ISP/ASN-based detection.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
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
    """
    Objectif: Test the /check-vpn endpoint's early termination mechanism when a VPN is detected by one of the services, verifying that the system breaks early without waiting for all service results.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Create a counter to check how many services are called
    call_count = {"count": 0}

    def mock_service(ip):
        """
        Objectif: Mock function that simulates a VPN detection service by returning True only on the first call and False on subsequent calls, while counting the number of invocations.

        Parameters:
            - ip: The IP address being checked (ignored in this mock). (String)

        Return Value:
            - True: On the first function call. (Boolean)
            - False: On all subsequent calls. (Boolean)
        """
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
    """
    Objectif: Test the /check-vpn endpoint when the IP information service (ip-api.com) fails and all VPN detection services return no detection.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
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
    """
    Objectif: Test the cache time-to-live (TTL) settings for blocked IP addresses to ensure they use the reduced BLOCKED_CACHE_TTL duration.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the cache expiration settings. (NoneType)
    """
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
    """
    Objectif: Test the /check-vpn endpoint's exception handling when individual VPN detection services raise exceptions during their execution.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    def mock_exception(ip):
        """
        Objectif: Mock function that raises an exception to simulate a service error during testing.

        Parameters:
            - ip: The IP address being checked (ignored in this mock). (String)

        Return Value:
            - None: This function does not return and always raises an Exception. (NoneType)
        """
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
    """
    Objectif: Test the /check-stripe-access endpoint's behavior when external API keys are missing, ensuring the system continues to function without external service dependencies.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock environment variables and functions during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
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
    """
    Objectif: Test the /check-vpn endpoint when the request contains invalid JSON data.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    response = client.post('/check-vpn', data="not json")
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data

@pytest.mark.order(1) # LOX n°5
def test_stripe_access_suggestions(client, monkeypatch):
    """
    Objectif: Test the /check-stripe-access endpoint to verify it correctly returns appropriate suggestions for multiple detected issues including VPN, country blocking, and frontend configuration problems.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
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
    """
    Objectif: Test the is_known_hosting function to verify it returns False for non-hosting ISP and ASN combinations.

    Parameters:
        - client: Flask test client used for making HTTP requests (unused in this test). (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the function's return value. (NoneType)
    """

    from routes.stripe.vpn_check import is_known_hosting
    assert is_known_hosting("Residential ISP", "AS12345") is False

@pytest.mark.order(1) # LOX n°5
def test_get_ip_info_exception(monkeypatch):
    """
    Objectif: Test the get_ip_info function's exception handling when the IP information request fails.

    Parameters:
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the function's behavior. (NoneType)
    """
    monkeypatch.setattr("requests.get", MagicMock(side_effect=Exception("Test")))
    from routes.stripe.vpn_check import get_ip_info
    assert get_ip_info("8.8.8.8") is None

@pytest.mark.order(1) # LOX n°5
def test_check_iphub_exception(monkeypatch):
    """
    Objectif: Test the check_iphub function's exception handling when the IPHub API request fails.

    Parameters:
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the function's behavior. (NoneType)
    """
    monkeypatch.setattr("requests.get", MagicMock(side_effect=Exception("Test")))
    from routes.stripe.vpn_check import check_iphub
    assert check_iphub("8.8.8.8") is None

@pytest.mark.order(1) # LOX n°5
def test_check_proxycheck_exception(monkeypatch):
    """
    Objectif: Test the check_proxycheck function's exception handling when the proxycheck.io API request fails.

    Parameters:
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the function's behavior. (NoneType)
    """
    monkeypatch.setattr("requests.get", MagicMock(side_effect=Exception("Test")))
    from routes.stripe.vpn_check import check_proxycheck
    assert check_proxycheck("8.8.8.8") is None

@pytest.mark.order(1) # LOX n°5
def test_check_iphunter_exception(monkeypatch):
    """
    Objectif: Test the check_iphunter function's exception handling when the IPHunter API request fails.

    Parameters:
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the function's behavior. (NoneType)
    """
    monkeypatch.setattr("requests.get", MagicMock(side_effect=Exception("Test")))
    from routes.stripe.vpn_check import check_iphunter
    assert check_iphunter("8.8.8.8") is None

@pytest.mark.order(1) # LOX n°5
def test_check_abuseipdb_exception(monkeypatch):
    """
    Objectif: Test the check_abuseipdb function's exception handling when the AbuseIPDB API request fails.

    Parameters:
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the function's behavior. (NoneType)
    """
    monkeypatch.setattr("requests.get", MagicMock(side_effect=Exception("Test")))
    from routes.stripe.vpn_check import check_abuseipdb
    assert check_abuseipdb("8.8.8.8") is None

@pytest.mark.order(1) # LOX n°5
def test_check_vpn_multi_ips(client, monkeypatch):
    """
    Objectif: Test the /check-vpn endpoint when the X-Forwarded-For header contains multiple IP addresses, verifying that the first IP is correctly selected for processing.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    headers = {'X-Forwarded-For': '192.168.1.1, 10.0.0.1'}
    mock_ip_info = {"isp": "Home", "as": "AS123", "countryCode": "FR"}
    monkeypatch.setattr("routes.stripe.vpn_check.get_ip_info", lambda ip: mock_ip_info)

    response = client.post('/check-vpn', json={}, headers=headers)
    data = json.loads(response.data)
    assert data["ip"] == "192.168.1.1"

@pytest.mark.order(1) # LOX n°5
def test_check_vpn_cache_hit(client, monkeypatch):
    """
    Objectif: Test the /check-vpn endpoint's caching mechanism to verify that subsequent requests for the same IP address use the cached result instead of reprocessing.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response and cache behavior. (NoneType)
    """
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
    """
    Objectif: Test the /check-stripe-access endpoint when the X-Forwarded-For header contains multiple IP addresses.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    headers = {'X-Forwarded-For': '192.168.1.1, 10.0.0.1'}
    response = client.post('/check-stripe-access', json={}, headers=headers)
    assert response.status_code == 200

@pytest.mark.order(1) # LOX n°5
def test_check_stripe_cache_hit(client, monkeypatch):
    """
    Objectif: Test the /check-stripe-access endpoint's caching mechanism to verify that subsequent requests use cached results instead of reprocessing.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response and cache behavior. (NoneType)
    """
    # First request populates cache
    client.post('/check-stripe-access', json={})

    # Second request should use cache
    with patch("routes.stripe.vpn_check.get_ip_info") as mock:
        response = client.post('/check-stripe-access', json={})
        mock.assert_not_called()
    assert response.status_code == 200

@pytest.mark.order(1) # LOX n°5
def test_stripe_service_exception_handling(client, monkeypatch):
    """
    Objectif: Test the /check-stripe-access endpoint's exception handling when all VPN detection services in the thread pool raise exceptions.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    def mock_exception(ip):
        """
        Objectif: Mock function that raises an exception to simulate a service error during testing.

        Parameters:
            - ip: The IP address being checked (unused in this mock function). (String)

        Return Value:
            - None: This function does not return and always raises an Exception. (NoneType)
        """
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
    """
    Objectif: Test the /check-stripe-access endpoint's fallback mechanism for detecting hosting providers when all VPN services fail to detect threats.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)
        - monkeypatch: Pytest fixture used to mock functions and attributes during testing. (MonkeyPatch)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
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
    """
    Objectif: Test the is_known_hosting function with missing or empty ISP and ASN data to ensure it returns False in these cases.

    Parameters:
        - client: Flask test client used for making HTTP requests (unused in this test). (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the function's return value. (NoneType)
    """
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
