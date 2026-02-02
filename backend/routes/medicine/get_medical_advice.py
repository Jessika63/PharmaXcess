from flask import Blueprint, Response
import json
import os
import logging

get_medical_advice_bp = Blueprint("get_medical_advice",__name__)

@get_medical_advice_bp.route("/medicine/<int:medicine_id>/medical-advice",methods=["GET"])
def get_medical_advice(medicine_id):
    """
    Objectif: Retrieve medical advice associated with a given medicine.

    Parameters:
        - medicine_id (int): medicine identifier
    
    Query parameters:
        - None

    Returns:
        - 200: JSON response containing the medical advice for the specified medicine (Object)
        - 404: JSON error response if the medicine or its advice is not found (Object)
        - 500: JSON error response if an internal error occurs (Object)
    """
    try:
        # Compute the path to the JSON data file
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        json_path = os.path.join(BASE_DIR, "medicine_available.json")

        # Check if the JSON file exists
        if not os.path.exists(json_path):
            return Response(
                json.dumps({"error": "Medicine data file not found"}, ensure_ascii=False),
                mimetype='application/json; charset=utf-8',
                status=404
            )

        # Load the JSON file
        try:
            with open(json_path, "r", encoding="utf-8") as file:
                data = json.load(file)
        except json.JSONDecodeError:
            # File exists but is not valid JSON
            return Response(
                json.dumps({"error": "Failed to parse medicine data file"}, ensure_ascii=False),
                mimetype='application/json; charset=utf-8',
                status=500
            )

        # Get the list of medicines
        medicines = data.get("medicine", [])

        # Find the medicine with the requested ID
        medicine = next(
            (m for m in medicines if m.get("id") == medicine_id),
            None
        )

        # Medicine not found
        if medicine is None:
            return Response(
                json.dumps({"error": "Medicine not found"}, ensure_ascii=False),
                mimetype='application/json; charset=utf-8',
                status=404
            )

        # Ensure required fields exist
        required_fields = ["id", "name", "category", "price"]
        for field in required_fields:
            # Missing essential data = internal error
            if field not in medicine:
                return Response(
                    json.dumps({"error": f"Missing required field: {field}"}, ensure_ascii=False),
                    mimetype="application/json; charset=utf-8",
                    status=500
                )

        # Optional fields with defaults
        description = medicine.get("description", "")
        product_info = medicine.get("productInfo", {})
        product_info_clean = {
            "form": product_info.get("form", ""),
            "dosage": product_info.get("dosage", ""),
            "presentation": product_info.get("presentation", ""),
            "laboratory": product_info.get("laboratory", "")
        }

        # Ensure lists are valid
        usage_advice = medicine.get("usageAdvice", [])
        if not isinstance(usage_advice, list):
            usage_advice = []
        
        warnings = medicine.get("warnings", [])
        if not isinstance(warnings, list):
            warnings = []

        # Build the response data
        response_data = {
            "id": medicine.get("id"),
            "name": medicine.get("name"),
            "category": medicine.get("category"),
            "price": medicine.get("price"),
            "description": description,
            "productInfo": product_info_clean,
            "usageAdvice": usage_advice,
            "warnings": warnings
        }

        # Return the data as JSON
        return Response(
            json.dumps(response_data, ensure_ascii=False),
            mimetype='application/json; charset=utf-8',
            status=200
        )

    except Exception as e:
        # Catch any unexpected errors and log them
        logging.exception(f"Unexpected error in get_medical_advice for medicine_id={medicine_id}")
        return Response(
            json.dumps({"error": str(e) or "An unknown error occurred"}, ensure_ascii=False),
            mimetype='application/json; charset=utf-8',
            status=500
        )
