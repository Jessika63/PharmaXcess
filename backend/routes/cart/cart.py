from flask import Blueprint, request, jsonify
import os
import json
import uuid
from datetime import datetime, timedelta

cart_bp = Blueprint("cart", __name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
JSON_PATH = os.path.join(BASE_DIR, "medicine_available.json")

# =========================
# In-memory carts storage
# =========================
carts = {}
CART_EXPIRATION = timedelta(hours=1)

# =========================
# Helpers
# =========================
def load_stock():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)["medicine"]

def get_med_by_id(med_id):
    for m in load_stock():
        if int(m["id"]) == int(med_id):
            return m
    return None

def recalculate_cart(cart):
    cart["total"] = round(
        sum(float(it["price"]) * int(it["quantity"]) for it in cart["items"]),
        2
    )
    cart["updated_at"] = datetime.utcnow().isoformat()

def cleanup_expired_carts():
    now = datetime.utcnow()
    to_delete = []

    for cart_id, cart in carts.items():
        if cart["status"] == "VALIDATED":
            validated_at = datetime.fromisoformat(cart["validated_at"])
            if now - validated_at > CART_EXPIRATION:
                to_delete.append(cart_id)

    for cart_id in to_delete:
        del carts[cart_id]

def get_open_cart_or_error(cart_id):
    cleanup_expired_carts()

    cart = carts.get(cart_id)
    if not cart:
        return None, jsonify({"error": "Cart not found"}), 404

    if cart["status"] != "OPEN":
        return None, jsonify({"error": "Cart is not editable"}), 400

    return cart, None, None

def check_stock(cart, med_id, qty_to_add):
    med = get_med_by_id(med_id)
    if not med:
        return False, "Medication not found"

    already_in_cart = 0
    for it in cart["items"]:
        if it["id"] == int(med_id):
            already_in_cart = it["quantity"]
            break

    available = int(med["size"]) - already_in_cart

    if available < qty_to_add:
        return False, (
            f"{med['label']} (ID={med_id}) is out of stock "
            f"(available: {available})"
        )

    return True, ""

# =========================
# Routes
# =========================

# POST /cart/init
@cart_bp.route("/cart/init", methods=["POST"])
def init_cart():
    cart_id = uuid.uuid4().hex[:10]

    carts[cart_id] = {
        "status": "OPEN",
        "items": [],
        "total": 0.0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": None,
        "validated_at": None
    }

    return jsonify({"cart_id": cart_id}), 201


# GET /cart/<cart_id>
@cart_bp.route("/cart/<cart_id>", methods=["GET"])
def get_cart(cart_id):
    cleanup_expired_carts()

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
        return jsonify({"error": "cart_id and id required"}), 400

    cart, err, code = get_open_cart_or_error(cart_id)
    if err:
        return err, code

    ok, msg = check_stock(cart, med_id, qty)
    if not ok:
        return jsonify({"error": msg}), 400

    med = get_med_by_id(med_id)

    for it in cart["items"]:
        if it["id"] == med["id"]:
            it["quantity"] += qty
            recalculate_cart(cart)
            return jsonify(cart), 200

    cart["items"].append({
        "id": med["id"],
        "label": med["label"],
        "price": float(med["price"]),
        "quantity": qty
    })

    recalculate_cart(cart)
    return jsonify(cart), 200

@cart_bp.route("/cart/add-list", methods=["POST"])
def add_list():
    data = request.get_json(force=True)
    cart_id = data.get("cart_id")
    items = data.get("items")

    if not cart_id or not isinstance(items, list):
        return jsonify({"error": "cart_id and items list required"}), 400

    cart, err, code = get_open_cart_or_error(cart_id)
    if err:
        return err, code

    not_added = []

    for item in items:
        try:
            med_id = int(item.get("id"))
            requested_qty = int(item.get("quantity", 1))
        except (TypeError, ValueError):
            continue

        med = get_med_by_id(med_id)

        if not med:
            not_added.append({
                "medicine_id": med_id,
                "medicine_name": item.get("label"),
                "requested": requested_qty,
                "added": 0,
                "reason": "not_found"
            })
            continue

        med_name = med["label"]

        already_in_cart = 0
        for it in cart["items"]:
            if it["id"] == med_id:
                already_in_cart = it["quantity"]
                break

        available = max(0, int(med["size"]) - already_in_cart)
        qty_to_add = min(requested_qty, available)

        if qty_to_add > 0:
            for it in cart["items"]:
                if it["id"] == med_id:
                    it["quantity"] += qty_to_add
                    break
            else:
                cart["items"].append({
                    "id": med["id"],
                    "label": med_name,
                    "price": float(med["price"]),
                    "quantity": qty_to_add
                })

        if qty_to_add < requested_qty:
            not_added.append({
                "medicine_id": med_id,
                "medicine_name": med_name,
                "requested": requested_qty,
                "added": qty_to_add,
                "available": available,
                "reason": "out_of_stock" if available == 0 else "exceed_stock"
            })

    recalculate_cart(cart)

    return jsonify({
        "cart": cart,
        "not_added": not_added
    }), 200


# POST /cart/remove
@cart_bp.route("/cart/remove", methods=["POST"])
def remove_item():
    data = request.get_json(force=True)
    cart_id = data.get("cart_id")
    med_id = data.get("id")
    qty = int(data.get("quantity", 1))

    cart, err, code = get_open_cart_or_error(cart_id)
    if err:
        return err, code

    for it in cart["items"]:
        if it["id"] == int(med_id):
            it["quantity"] -= qty
            if it["quantity"] <= 0:
                cart["items"].remove(it)
            recalculate_cart(cart)
            return jsonify(cart), 200

    return jsonify({"error": "Item not in cart"}), 404


# POST /cart/remove-list
@cart_bp.route("/cart/remove-list", methods=["POST"])
def remove_list():
    data = request.get_json(force=True)
    cart_id = data.get("cart_id")
    items = data.get("items")

    cart, err, code = get_open_cart_or_error(cart_id)
    if err:
        return err, code

    for rem in items:
        for it in list(cart["items"]):
            if it["id"] == int(rem["id"]):
                it["quantity"] -= int(rem.get("quantity", 1))
                if it["quantity"] <= 0:
                    cart["items"].remove(it)

    recalculate_cart(cart)
    return jsonify(cart), 200


# POST /cart/cancel
@cart_bp.route("/cart/cancel", methods=["POST"])
def cancel_cart():
    data = request.get_json(force=True)
    cart_id = data.get("cart_id")

    if cart_id not in carts:
        return jsonify({"error": "Cart not found"}), 404

    del carts[cart_id]
    return jsonify({"message": "Cart cancelled and deleted"}), 200


# POST /cart/validate
@cart_bp.route("/cart/validate", methods=["POST"])
def validate_cart():
    data = request.get_json(force=True)
    cart_id = data.get("cart_id")

    cart = carts.get(cart_id)
    if not cart:
        return jsonify({"error": "Cart not found"}), 404

    if cart["status"] != "OPEN":
        return jsonify({"error": "Cart already validated"}), 400

    if not cart["items"]:
        return jsonify({"error": "Cart is empty"}), 400

    cart["status"] = "VALIDATED"
    cart["validated_at"] = datetime.utcnow().isoformat()
    cart["updated_at"] = cart["validated_at"]

    return jsonify({
        "message": "Cart validated",
        "cart_id": cart_id,
        "total": cart["total"],
        "items": cart["items"]
    }), 200
