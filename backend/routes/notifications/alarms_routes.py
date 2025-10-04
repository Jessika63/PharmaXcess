
from flask import Blueprint, request, jsonify
import json
from datetime import datetime, date
from db_app import get_app_connection

alarms_bp = Blueprint('alarms', __name__, url_prefix='/alarms')

# Alarm Routes
@alarms_bp.route('/<int:user_id>', methods=['GET'])
def get_alarms(user_id):
    """
    Get all alarms for a specific user
    """
    try:
        connection = get_app_connection()
        with connection.cursor() as cursor:
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
    Create a new alarm
    """
    try:
        data = request.get_json()
        required_fields = ['utilisateur_id', 'medicine_name', 'time', 'days', 'sound', 'dosage']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        connection = get_app_connection()
        with connection.cursor() as cursor:
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
    Update an existing alarm
    """
    try:
        data = request.get_json()

        connection = get_app_connection()
        with connection.cursor() as cursor:
            # Check if alarm exists
            cursor.execute("SELECT id FROM alarmes WHERE id = %s", (alarm_id,))
            if not cursor.fetchone():
                return jsonify({'error': 'Alarm not found'}), 404

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
    Delete an alarm
    """
    try:
        connection = get_app_connection()
        with connection.cursor() as cursor:
            # Check if alarm exists
            cursor.execute("SELECT id FROM alarmes WHERE id = %s", (alarm_id,))
            if not cursor.fetchone():
                return jsonify({'error': 'Alarm not found'}), 404

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
    Toggle alarm active status
    """
    try:
        connection = get_app_connection()
        with connection.cursor() as cursor:
            # Check if alarm exists and get current status
            cursor.execute("SELECT is_active FROM alarmes WHERE id = %s", (alarm_id,))
            result = cursor.fetchone()
            if not result:
                return jsonify({'error': 'Alarm not found'}), 404

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
