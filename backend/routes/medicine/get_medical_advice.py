from flask import Blueprint, Response
import json
import os
import logging

get_medical_advice_bp = Blueprint(
    "get_medical_advice",
    __name__
)

@get_medical_advice_bp.route(
    "/medicine/<int:medicine_id>/medical-advice",
    methods=["GET"]
)
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
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        json_path = os.path.join(BASE_DIR, "medicine_available.json")

        if not os.path.exists(json_path):
            return Response(
                json.dumps({"error": "Medicine data file not found"}, ensure_ascii=False),
                mimetype='application/json; charset=utf-8',
                status=404
            )

        try:
            with open(json_path, "r", encoding="utf-8") as file:
                data = json.load(file)
        except json.JSONDecodeError:
            return Response(
                json.dumps({"error": "Failed to parse medicine data file"}, ensure_ascii=False),
                mimetype='application/json; charset=utf-8',
                status=500
            )

        medicines = data.get("medicine", [])

        medicine = next((m for m in medicines if m.get("id") == medicine_id), None)
        if medicine is None:
            return Response(
                json.dumps({"error": "Medicine not found"}, ensure_ascii=False),
                mimetype='application/json; charset=utf-8',
                status=404
            )

        medical_advice = medicine.get("medicalAdvice")
        if medical_advice is None:
            return Response(
                json.dumps({"error": "Medical advice not available for this medicine"}, ensure_ascii=False),
                mimetype='application/json; charset=utf-8',
                status=404
            )

        medical_advice_clean = {
            "dosage": medical_advice.get("dosage", ""),
            "maxPerDay": medical_advice.get("maxPerDay", ""),
            "warnings": medical_advice.get("warnings", []),
            "contraIndications": medical_advice.get("contraIndications", [])
        }

        response_data = {
            "medicineId": medicine_id,
            "label": medicine.get("label", ""),
            "medicalAdvice": medical_advice_clean
        }

        return Response(
            json.dumps(response_data, ensure_ascii=False),
            mimetype='application/json; charset=utf-8',
            status=200
        )

    except Exception as e:
        logging.exception(f"Unexpected error in get_medical_advice for medicine_id={medicine_id}")
        return Response(
            json.dumps({"error": str(e) or "An unknown error occurred"}, ensure_ascii=False),
            mimetype='application/json; charset=utf-8',
            status=500
        )
