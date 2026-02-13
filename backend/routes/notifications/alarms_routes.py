
from flask import Blueprint, request, jsonify
import json
from datetime import datetime, date
from db_app import get_app_connection
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from routes.profile.profile_access import get_current_user_id, profile_access_condition, profile_target_access_condition

alarms_bp = Blueprint('alarms', __name__, url_prefix='/alarms')

# Alarm Routes
@alarms_bp.route('/<int:user_id>', methods=['GET'])
def get_alarms(user_id):
    """
    Objective:
    Retrieves all alarms associated with a specific user from the database, formats the data, and returns it as a JSON response.

    Parameters:
    - user_id: The unique identifier of the user whose alarms are being retrieved. (Integer)

    Process:
    - Establishes a connection to the application database.
    - Executes an SQL query to select all alarm records linked to the given user ID.
    - Converts certain fields for better JSON compatibility:
        * 'days' (stored as JSON string) is converted to a Python list.
        * 'next_alarm' (stored as datetime) is converted to an ISO 8601 string.
    - Returns the list of alarms sorted by time and medicine name.

    Return Value:
    - Success: Returns a JSON array containing all alarms and an HTTP status code 200. (Response)
    - Failure: Returns a JSON object with an error message and an HTTP status code 500. (Response)
    """
    # ensure requester has access to the target user_id
    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    try:
        connection = get_app_connection()
        with connection.cursor() as cursor:
            condition = profile_target_access_condition('id')
            cursor.execute(f"SELECT id FROM utilisateurs WHERE {condition}", (user_id, current_user_id, current_user_id))
            if not cursor.fetchone():
                return jsonify({'error': 'Not authorized to view alarms for this user'}), 403

            sql = """
                SELECT id, utilisateur_id, medicine_name, time, days, sound,
                       is_active, dosage, next_alarm, created_at, updated_at
                FROM alarmes
                WHERE utilisateur_id = %s
                ORDER BY time, medicine_name
            """
            cursor.execute(sql, (user_id,))
            alarms = cursor.fetchall()

            # Convert days from JSON string to list
            for alarm in alarms:
                if alarm['days']:
                    alarm['days'] = json.loads(alarm['days'])
                # Convert next_alarm to string if exists
                if alarm['next_alarm']:
                    alarm['next_alarm'] = alarm['next_alarm'].isoformat()

            return jsonify(alarms), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

@alarms_bp.route('', methods=['POST'])
def create_alarm():
    """
    Objective:
    Creates a new alarm entry in the database using the data provided in the JSON request body.

    Parameters:
    - None directly (the JSON payload is read from the request body).

    Expected JSON Fields:
    - utilisateur_id: The ID of the user associated with the alarm. (Integer)
    - medicine_name: The name of the medicine linked to the alarm. (String)
    - time: The time at which the alarm should trigger (in HH:MM:SS format). (String)
    - days: A list of days on which the alarm should repeat. (List)
    - sound: The sound type or file associated with the alarm. (String)
    - dosage: The dosage information for the medicine. (String)
    - is_active (optional): Whether the alarm is active. Defaults to True. (Boolean)
    - next_alarm (optional): The next scheduled alarm time in ISO 8601 format. (String)

    Process:
    - Validates that all required fields are present.
    - Serializes the 'days' field to JSON for database storage.
    - Converts the optional 'next_alarm' field from ISO format to a Python datetime object.
    - Inserts the new alarm into the 'alarmes' table.
    - Commits the transaction and retrieves the newly created alarm ID.

    Return Value:
    - Success: Returns a JSON object with a success message and the new alarm ID, along with HTTP status code 201. (Response)
    - Failure: Returns a JSON object with an error message and HTTP status code 400 (missing fields) or 500 (database error). (Response)
    """

    try:
        current_user_id, error_response, status = get_current_user_id()
        if error_response:
            return error_response, status

        data = request.get_json()
        required_fields = ['utilisateur_id', 'medicine_name', 'time', 'days', 'sound', 'dosage']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        # ensure provided utilisateur_id is accessible by current user
        connection = get_app_connection()
        with connection.cursor() as cursor:
            condition = profile_target_access_condition('id')
            cursor.execute(f"SELECT id FROM utilisateurs WHERE {condition}", (data['utilisateur_id'], current_user_id, current_user_id))
            if not cursor.fetchone():
                return jsonify({'error': 'Target user not found or not accessible'}), 403

            sql = """
                INSERT INTO alarmes
                (utilisateur_id, medicine_name, time, days, sound, is_active, dosage, next_alarm)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """

            days_json = json.dumps(data['days'])
            next_alarm = datetime.fromisoformat(data['next_alarm'].replace('Z', '+00:00')) if data.get('next_alarm') else None

            cursor.execute(sql, (
                data['utilisateur_id'],
                data['medicine_name'],
                data['time'],
                days_json,
                data['sound'],
                data.get('is_active', True),
                data['dosage'],
                next_alarm
            ))

            connection.commit()
            alarm_id = cursor.lastrowid  # <-- ID auto-incrémenté réel

            return jsonify({'message': 'Alarm created successfully', 'id': alarm_id}), 201

    except Exception as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

@alarms_bp.route('/<alarm_id>', methods=['PUT'])
def update_alarm(alarm_id):
    """
    Objective:
    Updates an existing alarm record in the database with the provided JSON data.

    Parameters:
    - alarm_id: The unique identifier of the alarm to update, passed as a URL path parameter. (Integer)

    Expected JSON Fields:
    - medicine_name: The updated name of the medicine linked to the alarm. (String)
    - time: The updated alarm trigger time (in HH:MM:SS format). (String)
    - days: A list of updated days when the alarm should repeat. (List)
    - sound: The updated sound type or file associated with the alarm. (String)
    - is_active: The updated activation status of the alarm. (Boolean)
    - dosage: The updated dosage information. (String)
    - next_alarm (optional): The next scheduled alarm time in ISO 8601 format. (String)

    Process:
    - Checks if the alarm with the given ID exists in the 'alarmes' table.
    - If it does not exist, returns a 404 error.
    - Converts the 'days' list to a JSON string for database storage.
    - Parses the 'next_alarm' field to a Python datetime object if provided.
    - Updates all relevant fields in the database and refreshes the 'updated_at' timestamp.
    - Commits the changes to persist the update.

    Return Value:
    - Success: Returns a JSON message confirming the successful update with HTTP status code 200. (Response)
    - Failure: Returns a JSON error message and HTTP status code 404 (not found) or 500 (database error). (Response)
    """

    try:
        current_user_id, error_response, status = get_current_user_id()
        if error_response:
            return error_response, status

        data = request.get_json()

        connection = get_app_connection()
        with connection.cursor() as cursor:
            # Check if alarm exists and belongs to an accessible profile
            condition = profile_access_condition('a.utilisateur_id')
            cursor.execute(f"SELECT id FROM alarmes a WHERE a.id = %s AND {condition}", (alarm_id, current_user_id, current_user_id))
            if not cursor.fetchone():
                return jsonify({'error': 'Alarm not found or not accessible'}), 404

            sql = """
                UPDATE alarmes
                SET medicine_name = %s, time = %s, days = %s, sound = %s,
                    is_active = %s, dosage = %s, next_alarm = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """

            # Convert days list to JSON string
            days_json = json.dumps(data['days']) if 'days' in data else None

            # Handle next_alarm
            next_alarm = None
            if data.get('next_alarm'):
                next_alarm = datetime.fromisoformat(data['next_alarm'].replace('Z', '+00:00'))

            cursor.execute(sql, (
                data.get('medicine_name'),
                data.get('time'),
                days_json,
                data.get('sound'),
                data.get('is_active'),
                data.get('dosage'),
                next_alarm,
                alarm_id
            ))

            connection.commit()

            return jsonify({'message': 'Alarm updated successfully'}), 200

    except Exception as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

@alarms_bp.route('/<alarm_id>', methods=['DELETE'])
def delete_alarm(alarm_id):
    """
    Objective:
    Deletes a specific alarm from the database based on its unique ID.

    Parameters:
    - alarm_id: The unique identifier of the alarm to delete, passed as a URL path parameter. (Integer)

    Process:
    - Checks if the alarm with the given ID exists in the 'alarmes' table.
    - If the alarm does not exist, returns a 404 error.
    - Deletes the alarm record from the database.
    - Commits the transaction to persist the deletion.

    Return Value:
    - Success: Returns a JSON message confirming the deletion with HTTP status code 200. (Response)
    - Failure: Returns a JSON error message and HTTP status code 404 (not found) or 500 (database error). (Response)
    """

    try:
        current_user_id, error_response, status = get_current_user_id()
        if error_response:
            return error_response, status

        connection = get_app_connection()
        with connection.cursor() as cursor:
            # Check if alarm exists and belongs to an accessible profile
            condition = profile_access_condition('a.utilisateur_id')
            cursor.execute(f"SELECT id FROM alarmes a WHERE a.id = %s AND {condition}", (alarm_id, current_user_id, current_user_id))
            if not cursor.fetchone():
                return jsonify({'error': 'Alarm not found or not accessible'}), 404

            cursor.execute("DELETE FROM alarmes WHERE id = %s", (alarm_id,))
            connection.commit()

            return jsonify({'message': 'Alarm deleted successfully'}), 200

    except Exception as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

@alarms_bp.route('/<alarm_id>/toggle', methods=['PUT'])
def toggle_alarm(alarm_id):
    """
    Objective:
    Toggles the active status of a specific alarm. If the alarm is currently active, it will be deactivated, and vice versa.

    Parameters:
    - alarm_id: The unique identifier of the alarm to toggle, passed as a URL path parameter. (Integer)

    Process:
    - Checks if the alarm with the given ID exists in the 'alarmes' table.
    - Retrieves the current 'is_active' status of the alarm.
    - Inverts the status (True becomes False, False becomes True).
    - Updates the 'is_active' field in the database and refreshes the 'updated_at' timestamp.
    - Commits the transaction to persist the change.

    Return Value:
    - Success: Returns a JSON message confirming the status update, including the new 'is_active' value, with HTTP status code 200. (Response)
    - Failure: Returns a JSON error message and HTTP status code 404 (not found) or 500 (database error). (Response)
    """

    try:
        current_user_id, error_response, status = get_current_user_id()
        if error_response:
            return error_response, status

        connection = get_app_connection()
        with connection.cursor() as cursor:
            # Check if alarm exists and belongs to an accessible profile
            condition = profile_access_condition('a.utilisateur_id')
            cursor.execute(f"SELECT is_active FROM alarmes a WHERE a.id = %s AND {condition}", (alarm_id, current_user_id, current_user_id))
            result = cursor.fetchone()
            if not result:
                return jsonify({'error': 'Alarm not found or not accessible'}), 404

            new_status = not result['is_active']

            cursor.execute(
                "UPDATE alarmes SET is_active = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (new_status, alarm_id)
            )

            connection.commit()

            return jsonify({
                'message': 'Alarm status updated successfully',
                'is_active': new_status
            }), 200

    except Exception as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()
