from flask import Blueprint, request, jsonify
import requests
import os
import concurrent.futures
from datetime import datetime, timedelta, timezone
import traceback

vpn_check_bp = Blueprint("vpn_check", __name__)

# Cache structure: {ip: {'result': dict, 'timestamp': datetime, 'expires': datetime}}
vpn_cache = {}
CACHE_TTL = timedelta(hours=24)
BLOCKED_CACHE_TTL = timedelta(minutes=1)  # 1 minut pour les bloqués

# ASN & ISP detection lists
KNOWN_HOSTING = {
    "ASN": {
        'AS16276', 'AS14061', 'AS13335', 'AS15169', 'AS14618', 'AS8075',
        'AS16509', 'AS20473', 'AS2906', 'AS60068', 'AS2635', 'AS12876',
        'AS46606', 'AS36351', 'AS40021', 'AS3257', 'AS174', 'AS7922'
    },
    "ISP_KEYWORDS": {
        'OVH', 'DIGITALOCEAN', 'CLOUDFLARE', 'GOOGLE', 'AMAZON', 'MICROSOFT',
        'AWS', 'HETZNER', 'LINODE', 'VULTR', 'ALIBABA', 'TENCENT', 'UPCLOUD',
        'RACKSPACE', 'IBM CLOUD', 'ORACLE CLOUD', 'ADBLOCK', 'UBLOCK', 'PROXY',
        'VPN', 'TOR', 'ANONYMOUS', 'HOSTING', 'DATACENTER', 'SERVER', 'AZURE'
    }
}

def is_known_hosting(isp, asn):
    """
    Objectif: Determines if a given ISP and ASN correspond to a known hosting provider.

    Parameters:
        - isp: The Internet Service Provider name to check. (String)
        - asn: The Autonomous System Number to check. (String or Integer)

    Return Value:
        - True: If the ASN is in the known hosting list or ISP contains hosting keywords. (Boolean)
        - False: If either parameter is empty or no hosting match is found. (Boolean)
    """
    if not isp or not asn:
        return False
    if asn in KNOWN_HOSTING["ASN"]:
        return True
    isp_upper = isp.upper()
    return any(keyword in isp_upper for keyword in KNOWN_HOSTING["ISP_KEYWORDS"])

def get_ip_info(ip):
    """
    Objectif: Fetches geographical and network information for a given IP address using the ip-api.com API.

    Parameters:
        - ip: The IP address to look up information for. (String)

    Return Value:
        - On success: Dictionary containing detailed IP information (country, ISP, ASN, etc.) from ip-api.com. (Dict)
        - On failure: None if the request fails, times out, or returns a non-200 status code. (NoneType)
    """
    try:
        r = requests.get(f"http://ip-api.com/json/{ip}?fields=66842623", timeout=2)
        if r.status_code == 200:
            return r.json()
    except:
        pass
    return None

def check_iphub(ip):
    """
    Objectif: Checks if an IP address is blocked using the IPHub API.

    Parameters:
        - ip: The IP address to check for blocking status. (String)

    Return Value:
        - True: If the IP is blocked according to IPHub API. (Boolean)
        - None: If the API key is missing, the request fails, or an error occurs. (NoneType)
    """
    try:
        api_key = os.getenv("IPHUB_API_KEY")
        if not api_key:
            return None
        r = requests.get(f"http://v2.api.iphub.info/ip/{ip}",
                        headers={"X-Key": api_key}, timeout=2)
        if r.status_code == 200:
            return r.json().get("block", 0) >= 1
    except:
        pass
    return None

def check_getipintel(ip):
    """
    Objectif: Checks if an IP address is likely to be a VPN or proxy using the GetIPIntel service.

    Parameters:
        - ip: The IP address to check. (String)

    Return Value:
        - True: If the IP is considered high risk (result > 0.95). (Boolean)
        - None: If the API request fails, times out, or returns an invalid response. (NoneType)
    """
    try:
        contact_email = os.getenv("GETIPINTEL_CONTACT", "admin@yourdomain.com")
        r = requests.get("http://check.getipintel.net/check.php",
                        params={"ip": ip, "contact": contact_email, "format": "json"},
                        timeout=2)
        if r.status_code == 200:
            data = r.json()
            return data.get("result", 0) > 0.95
    except:
        pass
    return None

def check_proxycheck(ip):
    """
    Objectif: Checks if an IP address is identified as a proxy by the proxycheck.io API.

    Parameters:
        - ip: The IP address to check. (String)

    Return Value:
        - True: If the IP is classified as a proxy. (Boolean)
        - None: If the API request fails, times out, or returns an invalid response. (NoneType)
    """
    try:
        r = requests.get(f"https://proxycheck.io/v2/{ip}",
                        params={"vpn": 1}, timeout=2)
        if r.status_code == 200:
            data = r.json()
            return data.get(ip, {}).get("proxy") == "yes"
    except:
        pass
    return None

def check_iphunter(ip):
    """
    Objectif: Checks if an IP address is blocked using the IPHunter API.

    Parameters:
        - ip: The IP address to check for blocking status. (String)

    Return Value:
        - True: If the IP is blocked according to IPHunter API. (Boolean)
        - None: If the API key is missing, the request fails, or an error occurs. (NoneType)
    """
    try:
        api_key = os.getenv("IPHUNTER_API_KEY")
        if not api_key:
            return None
        r = requests.get(f"https://www.iphunter.info:8082/v1/ip/{ip}",
                        headers={"X-Key": api_key}, timeout=2)
        if r.status_code == 200:
            return r.json().get("data", {}).get("block") == "1"
    except:
        pass
    return None

def check_abuseipdb(ip):
    """
    Objectif: Checks an IP address against the AbuseIPDB database for a high abuse confidence score.

    Parameters:
        - ip: The IP address to check. (String)

    Return Value:
        - True: If the IP has an abuse confidence score greater than 80. (Boolean)
        - None: If the API key is missing, the request fails, or an error occurs. (NoneType)
    """
    try:
        api_key = os.getenv("ABUSEIPDB_API_KEY")
        if not api_key:
            return None
        r = requests.get("https://api.abuseipdb.com/api/v2/check",
                        params={"ipAddress": ip},
                        headers={"Key": api_key, "Accept": "application/json"},
                        timeout=2)
        if r.status_code == 200:
            return r.json().get("data", {}).get("abuseConfidenceScore", 0) > 80
    except:
        pass
    return None

# Cache cleaning function
def clean_cache():
    """
    Objectif: Removes expired entries from the global VPN cache based on their expiration time.

    Parameters:
        - None

    Return Value:
        - None: This function modifies the global vpn_cache in place and does not return a value.
    """
    now = datetime.now(timezone.utc)
    global vpn_cache
    expired_ips = [ip for ip, entry in vpn_cache.items() if now > entry["expires"]]
    for ip in expired_ips:
        del vpn_cache[ip]

@vpn_check_bp.route("/check-vpn", methods=["POST"])
def check_vpn():
    """
    Objectif: Checks the client's IP address for VPN, proxy, blocked country, and adblock detection, utilizing multiple external APIs and a caching mechanism.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body:
        - adBlockDetected: Indicates if adblock is detected by the client. Defaults to false if not provided. (Boolean, Optional)
        - forceRefresh: If true, forces a fresh check ignoring the cache. Defaults to false if not provided. (Boolean, Optional)

    Return Value:
        - 200: JSON response containing VPN detection details including IP, checks performed, and detection status. (Object)
        - 400: JSON error response if the request contains invalid JSON. (Object)
        - 500: JSON error response for server errors or API failures. (Object)
    """
    try:
        # Clear the cache before starting
        clean_cache()

        # Check if the JSON is valid
        if not request.is_json:
            return jsonify({"error": "Invalid JSON"}), 400

        data = request.get_json()
        adblock_detected = data.get('adBlockDetected', False)
        force_refresh = data.get('forceRefresh', False)

        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        if "," in client_ip:
            client_ip = client_ip.split(",")[0].strip()

        # Additional detection via User-Agent
        user_agent = request.headers.get('User-Agent', '').lower()
        adblock_keywords = ['ublock', 'adblock', 'adguard', 'ghostery', 'privacybadger']
        if any(keyword in user_agent for keyword in adblock_keywords):
            adblock_detected = True

        # Cache check with the ability to force refresh
        now = datetime.now(timezone.utc)
        if client_ip in vpn_cache and not force_refresh:
            cached = vpn_cache[client_ip]
            # Check the expiration date
            if now < cached["expires"]:
                return jsonify(cached["result"])

        # Parallel API calls with timeout
        services = [check_iphub, check_getipintel, check_proxycheck, check_iphunter, check_abuseipdb]
        vpn_detected = False
        successful_checks = 0

        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = [executor.submit(f, client_ip) for f in services]
            for future in concurrent.futures.as_completed(futures, timeout=3):
                try:
                    result = future.result()
                    if result is not None:
                        successful_checks += 1
                        if result:
                            vpn_detected = True
                            # Break early if VPN detected
                            break
                except:
                    pass

        ip_info = get_ip_info(client_ip)
        if successful_checks == 0 and ip_info:
            vpn_detected = is_known_hosting(ip_info.get("isp"), ip_info.get("as"))

        # Country check
        country = ip_info.get("countryCode") if ip_info else None
        blocked_countries = {"CU", "IR", "KP", "SY"}
        country_blocked = country in blocked_countries

        result = {
            "isVPN": vpn_detected or country_blocked or (adblock_detected and not force_refresh),
            "ip": client_ip,
            "checksPerformed": len(services),
            "fallbackUsed": successful_checks == 0,
            "adblockDetected": adblock_detected,
            "vpnDetected": vpn_detected,
            "countryBlocked": country_blocked
        }

        # Determine the cache duration
        cache_ttl = BLOCKED_CACHE_TTL if result["isVPN"] else CACHE_TTL

        # Cache result with expiration
        vpn_cache[client_ip] = {
            "result": result,
            "timestamp": now,
            "expires": now + cache_ttl
        }

        return jsonify(result)

    except Exception as e:
        # Log the error for debugging
        print(f"Error in /check-vpn: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "error": f"Erreur serveur: {str(e)}"
        }), 500

@vpn_check_bp.route("/check-stripe-access", methods=["POST"])
def check_stripe_access():
    """
    Objectif: Performs a comprehensive check of the client's environment (network and browser) to determine if it meets the requirements for accessing Stripe's payment services.

    Parameters:
        - None

    Query parameters:
        - None

    Request Body:
        - stripeJsLoaded: Indicates if Stripe.js was successfully loaded. (Boolean, Optional)
        - cookiesEnabled: Indicates if cookies are enabled in the browser. (Boolean, Optional)
        - jsEnabled: Indicates if JavaScript is enabled in the browser. (Boolean, Optional)
        - adblockDetected: Indicates if an adblocker is detected. (Boolean, Optional)
        - firewallDetected: Indicates if a firewall is detected. (Boolean, Optional)
        - publicNetwork: Indicates if the network is public. (Boolean, Optional)
        - privacySettingsDetected: Indicates if restrictive privacy settings are detected. (Boolean, Optional)

    Return Value:
        - 200: JSON response containing the access status, detected issues, and suggested fixes. (Object)
        - 500: JSON error response if an internal server error occurs during the check. (Object)
    """
    try:
        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        if "," in client_ip:
            client_ip = client_ip.split(",")[0].strip()

        # Cache check
        now = datetime.now(timezone.utc)
        if client_ip in vpn_cache:
            cached = vpn_cache[client_ip]
            if now - cached["timestamp"] < CACHE_TTL:
                return jsonify(cached["result"]), 200

        # Parallel API calls avec timeout
        services = [check_iphub, check_getipintel, check_proxycheck, check_iphunter, check_abuseipdb]
        vpn_detected = False
        successful_checks = 0

        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = [executor.submit(f, client_ip) for f in services]
            for future in concurrent.futures.as_completed(futures, timeout=3):
                try:
                    result = future.result()
                    if result is not None:
                        successful_checks += 1
                        if result:
                            vpn_detected = True
                            # Break early if VPN detected
                            break
                except:
                    pass

        ip_info = get_ip_info(client_ip)
        if successful_checks == 0 and ip_info:
            vpn_detected = is_known_hosting(ip_info.get("isp"), ip_info.get("as"))

        # Country check
        country = ip_info.get("countryCode") if ip_info else None
        blocked_countries = {"CU", "IR", "KP", "SY"}
        country_blocked = country in blocked_countries

        # Frontend checks
        frontend_data = request.json or {}
        stripe_js_loaded = frontend_data.get("stripeJsLoaded", True)
        cookies_enabled = frontend_data.get("cookiesEnabled", True)
        js_enabled = frontend_data.get("jsEnabled", True)
        adblock_detected = frontend_data.get("adblockDetected", False)
        firewall_detected = frontend_data.get("firewallDetected", False)
        public_network = frontend_data.get("publicNetwork", False)
        privacy_settings_detected = frontend_data.get("privacySettingsDetected", False)

        # Issues
        issues = []
        if vpn_detected:
            issues.append("VPN/Proxy/Tor détecté")
        if country_blocked:
            issues.append(f"Pays bloqué par Stripe ({country})")
        if not stripe_js_loaded:
            issues.append("Impossible de charger les scripts Stripe")
        if not cookies_enabled:
            issues.append("Cookies désactivés")
        if not js_enabled:
            issues.append("JavaScript désactivé")
        if adblock_detected:
            issues.append("Bloqueur de publicités/détection de trackers actif")
        if firewall_detected:
            issues.append("Pare-feu ou réseau d'entreprise détecté")
        if public_network:
            issues.append("Réseau public non sécurisé détecté")
        if privacy_settings_detected:
            issues.append("Paramètres de confidentialité du navigateur restrictifs")

        status = "BLOQUE" if issues else "OK"
        result = {
            "status": status,
            "ip": client_ip,
            "country": country,
            "vpnDetected": vpn_detected,
            "countryBlocked": country_blocked,
            "frontendChecks": {
                "stripeJsLoaded": stripe_js_loaded,
                "cookiesEnabled": cookies_enabled,
                "jsEnabled": js_enabled,
                "adblockDetected": adblock_detected,
                "firewallDetected": firewall_detected,
                "publicNetwork": public_network,
                "privacySettingsDetected": privacy_settings_detected
            },
            "issues": issues,
            "suggestions": suggest_fixes(issues)
        }

        # Cache result
        vpn_cache[client_ip] = {"result": result, "timestamp": now}
        return jsonify(result), 200

    except Exception as e:
        # Log the error for debugging
        print(f"Error in /check-stripe-access: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e), "ip": client_ip}), 500

def suggest_fixes(issues):
    """
    Objectif: Generates a list of user-friendly suggestions to resolve issues that may prevent access to Stripe's payment services.

    Parameters:
        - issues: A list of string descriptions of detected issues. (List of Strings)

    Return Value:
        - suggestions: A list of string suggestions corresponding to the input issues. (List of Strings)
    """
    suggestions = []
    for issue in issues:
        if "VPN" in issue:
            suggestions.append("Désactivez votre VPN ou proxy puis rechargez la page")
        elif "Pays bloqué" in issue:
            suggestions.append("Stripe n'est pas disponible dans votre pays")
        elif "scripts Stripe" in issue:
            suggestions.append("Autorisez js.stripe.com dans votre bloqueur ou pare-feu")
        elif "Cookies" in issue:
            suggestions.append("Activez les cookies dans votre navigateur")
        elif "JavaScript" in issue:
            suggestions.append("Activez JavaScript dans votre navigateur")
        elif "Bloqueur" in issue:
            suggestions.append("Mettez votre bloqueur de pubs en pause pour ce site")
        elif "Pare-feu" in issue:
            suggestions.append("Essayez un autre réseau ou configurez le pare-feu")
        elif "Réseau public" in issue:
            suggestions.append("Utilisez un réseau privé ou sécurisé")
        elif "Paramètres de confidentialité" in issue:
            suggestions.append("Ajustez vos paramètres de confidentialité du navigateur")
    return suggestions
