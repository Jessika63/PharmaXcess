# /backend/routes/cart.py

from flask import Blueprint, request, jsonify, current_app
import os
import json
import stripe
from datetime import datetime

cart_bp = Blueprint('cart', __name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
JSON_PATH = os.path.join(BASE_DIR, 'medicine_available.json')

cart = {
    "items": [],
    "total": 0.0,
    "updated_at": None
}

payment_reservations = {}

def load_stock():
    if not os.path.exists(JSON_PATH):
        raise FileNotFoundError(f"Stock file not found: {JSON_PATH}")
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_stock(data):
    tmp_path = JSON_PATH + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    os.replace(tmp_path, JSON_PATH)

def get_med_by_id(med_id):
    data = load_stock()
    for m in data.get("medicine", []):
        if int(m["id"]) == int(med_id):
            return m
    return None

def recalculate_cart():
    total = 0.0
    for it in cart["items"]:
        total += float(it["price"]) * int(it["quantity"])
    cart["total"] = round(total, 2)
    cart["updated_at"] = datetime.utcnow().isoformat()

def check_stock(med_id, req_qty):
    med = get_med_by_id(med_id)
    if not med:
        return False, "Medicament introuvable"
    available = int(med.get("size", 0))
    if req_qty <= 0:
        return False, "Quantité invalide"
    if available < req_qty:
        return False, f"Stock insuffisant pour {med.get('label')} (disponible: {available})"
    return True, ""

def decrement_stock_bulk(items):
    data = load_stock()
    meds = data.get("medicine", [])
    med_map = {int(m["id"]): m for m in meds}
    for it in items:
        mid = int(it["id"])
        qty = int(it["quantity"])
        if mid not in med_map:
            return False, f"Medicament id {mid} introuvable"
        if med_map[mid].get("size", 0) < qty:
            return False, f"Stock insuffisant pour {med_map[mid].get('label')} (id {mid})"
    for it in items:
        mid = int(it["id"])
        qty = int(it["quantity"])
        med_map[mid]["size"] = int(med_map[mid].get("size", 0)) - qty
        if med_map[mid]["size"] < 0:
            med_map[mid]["size"] = 0
    new_meds = []
    for m in meds:
        new_meds.append(med_map[int(m["id"])])
    data["medicine"] = new_meds
    save_stock(data)
    return True, "Stock mis à jour"

# GET /cart
@cart_bp.route("/cart", methods=["GET"])
def get_cart():
    recalculate_cart()
    return jsonify(cart), 200

# POST /cart/add
@cart_bp.route("/cart/add", methods=["POST"])
def add_item():
    payload = request.get_json() or {}
    if "id" not in payload:
        return jsonify({"error": "Missing 'id' in body"}), 400
    try:
        med_id = int(payload["id"])
    except Exception:
        return jsonify({"error": "Invalid id"}), 400
    qty = int(payload.get("quantity", 1))
    if qty <= 0:
        return jsonify({"error": "Quantity must be >= 1"}), 400
    ok, msg = check_stock(med_id, qty)
    if not ok:
        return jsonify({"error": msg}), 400
    med = get_med_by_id(med_id)
    found = False
    for it in cart["items"]:
        if int(it["id"]) == med_id:
            it["quantity"] = int(it["quantity"]) + qty
            found = True
            break
    if not found:
        cart["items"].append({
            "id": int(med["id"]),
            "label": med.get("label"),
            "price": float(med.get("price")),
            "quantity": qty
        })
    recalculate_cart()
    return jsonify({"message": "Item ajouté au panier", "cart": cart}), 200

# POST /cart/add-list
@cart_bp.route("/cart/add-list", methods=["POST"])
def add_list():
    payload = request.get_json() or {}
    items = payload.get("items")
    if not items or not isinstance(items, list):
        return jsonify({"error": "Missing 'items' list in body"}), 400
    for it in items:
        try:
            mid = int(it["id"])
            qty = int(it.get("quantity", 1))
        except Exception:
            return jsonify({"error": f"Invalid item format: {it}"}), 400
        ok, msg = check_stock(mid, qty)
        if not ok:
            return jsonify({"error": f"Item {mid} failed stock check: {msg}"}), 400
    for it in items:
        mid = int(it["id"])
        qty = int(it.get("quantity", 1))
        med = get_med_by_id(mid)
        found = False
        for existing in cart["items"]:
            if int(existing["id"]) == mid:
                existing["quantity"] = int(existing["quantity"]) + qty
                found = True
                break
        if not found:
            cart["items"].append({
                "id": int(med["id"]),
                "label": med.get("label"),
                "price": float(med.get("price")),
                "quantity": qty
            })
    recalculate_cart()
    return jsonify({"message": "Items ajoutés au panier", "cart": cart}), 200

# POST /cart/remove
@cart_bp.route("/cart/remove", methods=["POST"])
def remove_item():
    payload = request.get_json() or {}
    if "id" not in payload:
        return jsonify({"error": "Missing 'id' in body"}), 400
    try:
        mid = int(payload["id"])
    except Exception:
        return jsonify({"error": "Invalid id"}), 400
    qty = int(payload.get("quantity", 1))
    if qty <= 0:
        return jsonify({"error": "Quantity must be >= 1"}), 400
    for idx, it in enumerate(cart["items"]):
        if int(it["id"]) == mid:
            if qty >= int(it["quantity"]):
                cart["items"].pop(idx)
            else:
                it["quantity"] = int(it["quantity"]) - qty
            recalculate_cart()
            return jsonify({"message": "Item retiré/quantité modifiée", "cart": cart}), 200
    return jsonify({"error": "Item non trouvé dans le panier"}), 404

# POST /cart/remove-list
@cart_bp.route("/cart/remove-list", methods=["POST"])
def remove_list():
    payload = request.get_json() or {}
    items = payload.get("items")
    if not items or not isinstance(items, list):
        return jsonify({"error": "Missing 'items' list in body"}), 400
    for it in items:
        try:
            mid = int(it["id"])
            qty = int(it.get("quantity", 1))
        except Exception:
            continue
        for idx, existing in enumerate(cart["items"]):
            if int(existing["id"]) == mid:
                if qty >= int(existing["quantity"]):
                    cart["items"].pop(idx)
                else:
                    existing["quantity"] = int(existing["quantity"]) - qty
                break
    recalculate_cart()
    return jsonify({"message": "Suppression(s) effectuée(s)", "cart": cart}), 200

# POST /cart/cancel
@cart_bp.route("/cart/cancel", methods=["POST"])
def cancel_cart():
    cart["items"].clear()
    recalculate_cart()
    return jsonify({"message": "Panier vidé", "cart": cart}), 200

# POST /cart/validate
@cart_bp.route("/cart/validate", methods=["POST"])
def validate_cart():
    if not cart["items"]:
        return jsonify({"error": "Panier vide"}), 400
    data = load_stock()
    meds = data.get("medicine", [])
    med_map = {int(m["id"]): m for m in meds}
    items_for_payment = []
    for it in cart["items"]:
        mid = int(it["id"])
        qty = int(it["quantity"])
        if mid not in med_map:
            return jsonify({"error": f"Medicament id {mid} introuvable"}), 400
        available = int(med_map[mid].get("size", 0))
        if available < qty:
            return jsonify({"error": f"Stock insuffisant pour {med_map[mid].get('label')} (disponible: {available})"}), 400
        price = float(med_map[mid].get("price"))
        items_for_payment.append({"id": mid, "label": med_map[mid].get("label"), "quantity": qty, "unit_price": price})
    total = round(sum(it["unit_price"] * it["quantity"] for it in items_for_payment), 2)
    amount_cents = int(total * 100)
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    if not stripe.api_key:
        return jsonify({"error": "Stripe API key not configured"}), 500
    try:
        pi = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="eur",
            metadata={"cart_total": str(total), "cart_items_count": str(len(items_for_payment))},
            automatic_payment_methods={"enabled": True},
        )
    except stripe.error.StripeError as e:
        return jsonify({"error": f"Stripe error: {str(e)}"}), 500
    payment_reservations[pi.id] = {"items": items_for_payment, "created_at": datetime.utcnow().isoformat()}
    return jsonify({"message": "PaymentIntent créé pour le panier", "clientSecret": pi.client_secret, "paymentIntentId": pi.id, "amount": amount_cents}), 200

# POST /stripe/webhook
@cart_bp.route("/stripe/webhook", methods=["POST"])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature", None)
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    event = None
    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        else:
            event = json.loads(payload)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    ev_type = event.get("type") if isinstance(event, dict) else getattr(event, "type", None)
    if isinstance(event, dict):
        data_obj = event.get("data", {}).get("object", {})
    else:
        data_obj = event.data.object
    if ev_type == "payment_intent.succeeded":
        payment_intent_id = data_obj.get("id") or data_obj.get("payment_intent")
        reservation = payment_reservations.get(payment_intent_id)
        if not reservation:
            return jsonify({"message": "No reservation found; nothing to decrement"}), 200
        items = reservation.get("items", [])
        dec_list = [{"id": it["id"], "quantity": it["quantity"]} for it in items]
        ok, msg = decrement_stock_bulk(dec_list)
        if not ok:
            return jsonify({"error": f"Failed to decrement stock: {msg}"}), 500
        try:
            del payment_reservations[payment_intent_id]
        except KeyError:
            pass
        cart["items"].clear()
        recalculate_cart()
        return jsonify({"message": "Payment processed and stock updated"}), 200
    return jsonify({"message": f"Ignored event type {ev_type}"}), 200
