from flask import Blueprint, request, jsonify
import os
import json
import uuid
from datetime import datetime

cart_bp = Blueprint("cart", __name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
JSON_PATH = os.path.join(BASE_DIR, "medicine_available.json")

# =========================
# In-memory carts storage
# =========================
carts = {}
# cart_id -> {
#   status: OPEN | VALIDATED | CLOSED,
#   items: [],
#   total: float,
#   created_at,
#   updated_at
# }

# =========================
# Helpers
# =========================
def load_stock():
    if not os.path.exists(JSON_PATH):
        raise FileNotFoundError("medicine_available.json not found")
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def get_med_by_id(med_id):
    data = load_stock()
    for m in data.get("medicine", []):
        if int(m["id"]) == int(med_id):
            return m
    return None

def recalculate_cart(cart):
    total = 0.0
    for it in cart["items"]:
        total += float(it["price"]) * int(it["quantity"])
    cart["total"] = round(total, 2)
    cart["updated_at"] = datetime.utcnow().isoformat()

def check_stock(med_id, qty):
    med = get_med_by_id(med_id)
    if not med:
        return False, "Medicament introuvable"
    if qty <= 0:
        return False, "Quantité invalide"
    if int(med.get("size", 0)) < qty:
        return False, f"Stock insuffisant (disponible: {med.get('size')})"
    return True, ""

def get_cart_or_404(cart_id):
    cart = carts.get(cart_id)
    if not cart:
        return None, jsonify({"error": "Cart not found"}), 404
    if cart["status"] != "OPEN":
        return None, jsonify({"error": "Cart is not editable"}), 400
    return cart, None, None

# =========================
# Routes
# =========================

# POST /cart/init
@cart_bp.route("/cart/init", methods=["POST"])
def init_cart():
    cart_id = uuid.uuid4().hex[:8]

    carts[cart_id] = {
        "status": "OPEN",
        "items": [],
        "total": 0.0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": None
    }

    return jsonify({"cart_id": cart_id}), 201


# GET /cart/<cart_id>
@cart_bp.route("/cart/<cart_id>", methods=["GET"])
def get_cart(cart_id):
    cart = carts.get(cart_id)
    if not cart:
        return jsonify({"error": "Cart not found"}), 404
    return jsonify(cart), 200


# POST /cart/add
@cart_bp.route("/cart/add", methods=["POST"])
def add_item():
    data = request.get_json(force=True)

    cart_id = data.get("cart_id")
    med_id = data.get("id")
    qty = int(data.get("quantity", 1))

    if not cart_id or med_id is None:
        return jsonify({"error": "cart_id and id are required"}), 400

    cart, err, code = get_cart_or_404(cart_id)
    if err:
        return err, code

    ok, msg = check_stock(med_id, qty)
    if not ok:
        return jsonify({"error": msg}), 400

    med = get_med_by_id(med_id)

    for it in cart["items"]:
        if it["id"] == int(med_id):
            it["quantity"] += qty
            recalculate_cart(cart)
            return jsonify(cart), 200

    cart["items"].append({
        "id": int(med["id"]),
        "label": med["label"],
        "price": float(med["price"]),
        "quantity": qty
    })

    recalculate_cart(cart)
    return jsonify(cart), 200


# POST /cart/add-list
@cart_bp.route("/cart/add-list", methods=["POST"])
def add_list():
    data = request.get_json(force=True)

    cart_id = data.get("cart_id")
    items = data.get("items")

    if not cart_id or not isinstance(items, list):
        return jsonify({"error": "cart_id and items list required"}), 400

    cart, err, code = get_cart_or_404(cart_id)
    if err:
        return err, code

    for it in items:
        ok, msg = check_stock(it["id"], int(it.get("quantity", 1)))
        if not ok:
            return jsonify({"error": msg}), 400

    for it in items:
        med = get_med_by_id(it["id"])
        qty = int(it.get("quantity", 1))

        for existing in cart["items"]:
            if existing["id"] == int(it["id"]):
                existing["quantity"] += qty
                break
        else:
            cart["items"].append({
                "id": int(med["id"]),
                "label": med["label"],
                "price": float(med["price"]),
                "quantity": qty
            })

    recalculate_cart(cart)
    return jsonify(cart), 200


# POST /cart/remove
@cart_bp.route("/cart/remove", methods=["POST"])
def remove_item():
    data = request.get_json(force=True)

    cart_id = data.get("cart_id")
    med_id = data.get("id")
    qty = int(data.get("quantity", 1))

    if not cart_id or med_id is None:
        return jsonify({"error": "cart_id and id required"}), 400

    cart, err, code = get_cart_or_404(cart_id)
    if err:
        return err, code

    for i, it in enumerate(cart["items"]):
        if it["id"] == int(med_id):
            if qty >= it["quantity"]:
                cart["items"].pop(i)
            else:
                it["quantity"] -= qty
            recalculate_cart(cart)
            return jsonify(cart), 200

    return jsonify({"error": "Item not found in cart"}), 404


# POST /cart/remove-list
@cart_bp.route("/cart/remove-list", methods=["POST"])
def remove_list():
    data = request.get_json(force=True)

    cart_id = data.get("cart_id")
    items = data.get("items")

    if not cart_id or not isinstance(items, list):
        return jsonify({"error": "cart_id and items list required"}), 400

    cart, err, code = get_cart_or_404(cart_id)
    if err:
        return err, code

    for rem in items:
        for i, it in enumerate(cart["items"]):
            if it["id"] == int(rem["id"]):
                qty = int(rem.get("quantity", 1))
                if qty >= it["quantity"]:
                    cart["items"].pop(i)
                else:
                    it["quantity"] -= qty
                break

    recalculate_cart(cart)
    return jsonify(cart), 200


# POST /cart/cancel
@cart_bp.route("/cart/cancel", methods=["POST"])
def cancel_cart():
    data = request.get_json(force=True)
    cart_id = data.get("cart_id")

    cart = carts.get(cart_id)
    if not cart:
        return jsonify({"error": "Cart not found"}), 404

    cart["status"] = "CLOSED"
    cart["items"].clear()
    cart["total"] = 0.0
    cart["updated_at"] = datetime.utcnow().isoformat()

    return jsonify({"message": "Cart cancelled"}), 200


# POST /cart/validate
@cart_bp.route("/cart/validate", methods=["POST"])
def validate_cart():
    data = request.get_json(force=True)
    cart_id = data.get("cart_id")

    cart = carts.get(cart_id)
    if not cart:
        return jsonify({"error": "Cart not found"}), 404

    if not cart["items"]:
        return jsonify({"error": "Cart is empty"}), 400

    cart["status"] = "VALIDATED"
    cart["updated_at"] = datetime.utcnow().isoformat()

    return jsonify({
        "message": "Cart validated",
        "cart_id": cart_id,
        "total": cart["total"],
        "items": cart["items"]
    }), 200
