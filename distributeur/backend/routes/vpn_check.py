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
    if not isp or not asn:
        return False
    if asn in KNOWN_HOSTING["ASN"]:
        return True
    isp_upper = isp.upper()
    return any(keyword in isp_upper for keyword in KNOWN_HOSTING["ISP_KEYWORDS"])

# --- API check functions ---
def get_ip_info(ip):
    try:
        r = requests.get(f"http://ip-api.com/json/{ip}?fields=66842623", timeout=2)
        if r.status_code == 200:
            return r.json()
    except:
        pass
    return None

def check_iphub(ip):
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

# Fonction de nettoyage du cache
def clean_cache():
    now = datetime.now(timezone.utc)
    global vpn_cache
    expired_ips = [ip for ip, entry in vpn_cache.items() if now > entry["expires"]]
    for ip in expired_ips:
        del vpn_cache[ip]

@vpn_check_bp.route("/check-vpn", methods=["POST"])
def check_vpn():
    try:
        clean_cache()  # Nettoyer le cache avant de commencer
        
        # Vérifier si le JSON est valide
        if not request.is_json:
            return jsonify({"error": "Invalid JSON"}), 400
            
        data = request.get_json()
        adblock_detected = data.get('adBlockDetected', False)
        force_refresh = data.get('forceRefresh', False)

        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        if "," in client_ip:
            client_ip = client_ip.split(",")[0].strip()

        # Détection supplémentaire via User-Agent
        user_agent = request.headers.get('User-Agent', '').lower()
        adblock_keywords = ['ublock', 'adblock', 'adguard', 'ghostery', 'privacybadger']
        if any(keyword in user_agent for keyword in adblock_keywords):
            adblock_detected = True

        # Cache check avec possibilité de forcer le rafraîchissement
        now = datetime.now(timezone.utc)
        if client_ip in vpn_cache and not force_refresh:
            cached = vpn_cache[client_ip]
            if now < cached["expires"]:  # Vérifier la date d'expiration
                return jsonify(cached["result"])

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

        result = {
            "isVPN": vpn_detected or country_blocked or (adblock_detected and not force_refresh),
            "ip": client_ip,
            "checksPerformed": len(services),
            "fallbackUsed": successful_checks == 0,
            "adblockDetected": adblock_detected,
            "vpnDetected": vpn_detected,
            "countryBlocked": country_blocked
        }

        # Déterminer la durée de cache
        cache_ttl = BLOCKED_CACHE_TTL if result["isVPN"] else CACHE_TTL

        # Cache result avec expiration
        vpn_cache[client_ip] = {
            "result": result, 
            "timestamp": now,
            "expires": now + cache_ttl
        }

        return jsonify(result)

    except Exception as e:
        # Log l'erreur pour le débogage
        print(f"Error in /check-vpn: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "error": f"Erreur serveur: {str(e)}"
        }), 500

# --- Route existante pour Stripe ---
@vpn_check_bp.route("/check-stripe-access", methods=["POST"])
def check_stripe_access():
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
            issues.append("Pare-feu ou réseau d’entreprise détecté")
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
        # Log l'erreur pour le débogage
        print(f"Error in /check-stripe-access: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e), "ip": client_ip}), 500

def suggest_fixes(issues):
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