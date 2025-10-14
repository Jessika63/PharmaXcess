
from flask import Blueprint, request, jsonify
from datetime import datetime, date
from profile.profile_access import get_current_user_id, profile_access_condition

from db_app import get_app_connection

prescription_reminders_bp = Blueprint('prescription_reminders', __name__, url_prefix='/prescription-reminders')

# ===========================
# Get all reminders for user
# ===========================
@prescription_reminders_bp.route('', methods=['GET'])
def get_prescription_reminders():
    """
    Objective:
    Retrieves all prescription reminders for a specific user, including details from the associated prescription.

    Parameters:
    - user_id: The unique identifier of the user whose prescription reminders are requested. (Integer)

    Process:
    - Queries the 'prescription_reminders' table for all reminders linked to the given user.
    - Performs a LEFT JOIN with the 'prescription' table to include prescription details such as description, prescribing doctor, prescription date, expiration date, and status.
    - Converts all relevant date fields to ISO 8601 string format.
    - Calculates the number of days until each reminder is due, but only if the reminder is not completed.

    Return Value:
    - Success: Returns a JSON list of prescription reminders with associated prescription details and computed 'days_until_due', along with HTTP status code 200. (Response)
    - Failure: Returns a JSON error message with HTTP status code 500 in case of a database or processing error. (Response)
    """

    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    condition = profile_access_condition()

    try:
        connection = get_app_connection()
        with connection.cursor() as cursor:
            query = f"""
                SELECT
                    pr.id,
                    pr.utilisateur_id,
                    pr.ordonnance_id,
                    pr.name,
                    pr.due_date,
                    pr.sound,
                    pr.is_completed,
                    pr.notes,
                    pr.created_at,
                    pr.updated_at,
                    o.description AS ordonnance_description,
                    o.medecin_nom,
                    o.date_prescription,
                    o.date_expiration,
                    o.statut AS ordonnance_statut
                FROM prescription_reminders pr
                LEFT JOIN ordonnances o ON pr.ordonnance_id = o.id
                WHERE {condition}
                ORDER BY pr.due_date ASC
            """
            cursor.execute(query, (current_user_id, current_user_id))
            reminders = cursor.fetchall()

            for reminder in reminders:
                for key in ['due_date', 'date_prescription', 'date_expiration']:
                    if reminder.get(key):
                        reminder[key] = reminder[key].isoformat()

                if reminder['due_date'] and not reminder['is_completed']:
                    due_date = datetime.strptime(reminder['due_date'], '%Y-%m-%d').date()
                    reminder['days_until_due'] = (due_date - date.today()).days
                else:
                    reminder['days_until_due'] = None

            return jsonify(reminders), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()


# ===========================
# Create new reminder
# ===========================
@prescription_reminders_bp.route('', methods=['POST'])
def create_prescription_reminder():
    """
    Objective:
    Creates a new prescription reminder linked to an existing prescription for a specific user.

    Expected JSON Body:
    - utilisateur_id: ID of the user to whom the reminder belongs. (Integer)
    - prescription_id: ID of the prescription the reminder is associated with. (Integer)
    - name: Name or title of the reminder. (String)
    - due_date: Date when the reminder is due, in 'YYYY-MM-DD' format. (String)
    - sound (optional): Sound to play when the reminder triggers. Defaults to 'Son 1'. (String)
    - is_completed (optional): Boolean flag indicating if the reminder has already been completed. Defaults to False. (Boolean)
    - notes (optional): Additional notes related to the reminder. (String)

    Process:
    - Validates that all required fields are provided.
    - Confirms that the given prescription exists and belongs to the specified user.
    - Converts the 'due_date' field to a Python date object.
    - Inserts the new reminder into the 'prescription_reminders' table.
    - Commits the transaction to persist the new record.

    Return Value:
    - Success: Returns a JSON message with the new reminder's ID and HTTP status code 201. (Response)
    - Failure: Returns a JSON error message with HTTP status code 400 (missing/invalid fields), 404 (prescription not found), or 500 (database error). (Response)
    """

    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    condition = profile_access_condition()
    data = request.get_json()
    required_fields = ['utilisateur_id', 'prescription_id', 'name', 'due_date']

    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    try:
        connection = get_app_connection()
        with connection.cursor() as cursor:
            # Vérifier que la prescription appartient à un profil accessible
            query = f"""
                SELECT id FROM ordonnances
                WHERE id = %s AND {condition}
            """
            cursor.execute(query, (data['prescription_id'], current_user_id, current_user_id))
            if not cursor.fetchone():
                return jsonify({'error': 'Prescription not found or not accessible'}), 404

            sql = """
                INSERT INTO prescription_reminders
                (utilisateur_id, ordonnance_id, name, due_date, sound, is_completed, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """

            due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
            cursor.execute("""
                INSERT INTO prescription_reminders
                (utilisateur_id, ordonnance_id, name, due_date, sound, is_completed, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                data['utilisateur_id'],
                data['prescription_id'],
                data['name'],
                due_date,
                data.get('sound', 'Son 1'),
                data.get('is_completed', False),
                data.get('notes')
            ))

            connection.commit()
            return jsonify({'message': 'Reminder created successfully', 'id': cursor.lastrowid}), 201

    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    except Exception as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

# ===========================
# Update existing reminder
# ===========================
@prescription_reminders_bp.route('/<reminder_id>', methods=['PUT'])
def update_prescription_reminder(reminder_id):
    """
    Objective:
    Update an existing prescription reminder with new values for one or more fields.

    Parameters:
    - reminder_id: ID of the prescription reminder to update. (Integer)

    Expected JSON Body (any combination):
    - name: Updated name or title of the reminder. (String)
    - due_date: Updated due date in 'YYYY-MM-DD' format. (String)
    - sound: Updated sound for the reminder. (String)
    - is_completed: Updated completion status. (Boolean)
    - notes: Updated notes. (String)

    Process:
    - Validates that the reminder exists.
    - Dynamically updates only the fields provided in the request.
    - Leaves 'is_completed' unchanged if not provided.
    - Updates the 'updated_at' timestamp automatically.
    - Commits the changes to the database.

    Return Value:
    - Success: Returns a JSON message confirming update with HTTP status code 200. (Response)
    - Failure: Returns a JSON error message with HTTP status code 400 (invalid fields or date format), 404 (reminder not found), or 500 (database error). (Response)
    """

    try:
        data = request.get_json()
        connection = get_app_connection()

        with connection.cursor() as cursor:
            # Vérifier l'existence
            cursor.execute("SELECT * FROM prescription_reminders WHERE id = %s", (reminder_id,))
            existing = cursor.fetchone()
            if not existing:
                return jsonify({'error': 'Prescription reminder not found'}), 404

            # Préparer les champs à mettre à jour dynamiquement
            update_fields = []
            values = []

            if 'name' in data:
                update_fields.append("name = %s")
                values.append(data['name'])

            if 'due_date' in data:
                due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
                update_fields.append("due_date = %s")
                values.append(due_date)

            if 'sound' in data:
                update_fields.append("sound = %s")
                values.append(data['sound'])

            if 'is_completed' in data:
                update_fields.append("is_completed = %s")
                values.append(data['is_completed'])

            if 'notes' in data:
                update_fields.append("notes = %s")
                values.append(data['notes'])

            # Si aucun champ fourni → erreur
            if not update_fields:
                return jsonify({'error': 'No valid fields provided for update'}), 400

            # Ajouter updated_at
            update_fields.append("updated_at = CURRENT_TIMESTAMP")

            sql = f"""
                UPDATE prescription_reminders
                SET {', '.join(update_fields)}
                WHERE id = %s
            """

            values.append(reminder_id)
            cursor.execute(sql, tuple(values))
            connection.commit()

            return jsonify({'message': 'Prescription reminder updated successfully'}), 200

    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    except Exception as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

# ===========================
# Delete reminder
# ===========================
@prescription_reminders_bp.route('/<reminder_id>', methods=['DELETE'])
def delete_prescription_reminder(reminder_id):
    """
    Objective:
    Delete a prescription reminder by its ID.

    Parameters:
    - reminder_id: ID of the prescription reminder to delete. (Integer)

    Process:
    - Checks if the prescription reminder exists in the database.
    - Deletes the reminder if found.
    - Commits the deletion to the database.

    Return Value:
    - Success: Returns a JSON message confirming deletion with HTTP status code 200. (Response)
    - Failure: Returns a JSON error message with HTTP status code 404 (reminder not found) or 500 (database error). (Response)
    """

    try:
        connection = get_app_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM prescription_reminders WHERE id = %s", (reminder_id,))
            if not cursor.fetchone():
                return jsonify({'error': 'Prescription reminder not found'}), 404

            cursor.execute("DELETE FROM prescription_reminders WHERE id = %s", (reminder_id,))
            connection.commit()
            return jsonify({'message': 'Prescription reminder deleted successfully'}), 200

    except Exception as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

# ===========================
# Toggle completion
# ===========================
@prescription_reminders_bp.route('/<reminder_id>/toggle', methods=['PUT'])
def toggle_prescription_reminder(reminder_id):
    """
    Objective:
    Toggle the completion status of a prescription reminder by its ID.

    Parameters:
    - reminder_id: ID of the prescription reminder to toggle. (Integer)

    Process:
    - Retrieves the current `is_completed` status of the reminder.
    - Switches the status from True to False or vice versa.
    - Updates the database with the new status and current timestamp.

    Return Value:
    - Success: Returns a JSON message confirming the status update along with the new `is_completed` value and HTTP status code 200. (Response)
    - Failure: Returns a JSON error message with HTTP status code 404 (reminder not found) or 500 (database error). (Response)
    """

    try:
        connection = get_app_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT is_completed FROM prescription_reminders WHERE id = %s", (reminder_id,))
            result = cursor.fetchone()
            if not result:
                return jsonify({'error': 'Prescription reminder not found'}), 404

            new_status = not result['is_completed']
            cursor.execute(
                "UPDATE prescription_reminders SET is_completed = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (new_status, reminder_id)
            )
            connection.commit()

            return jsonify({'message': 'Status updated successfully', 'is_completed': new_status}), 200

    except Exception as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

# ===========================
# Upcoming reminders (30 days)
# ===========================
@prescription_reminders_bp.route('/upcoming', methods=['GET'])
def get_upcoming_prescription_reminders():
    """
    Objective:
    Retrieve upcoming prescription reminders for a specific user within the next 30 days that are not yet completed.

    Parameters:
    - user_id: ID of the user whose upcoming prescription reminders are being requested. (Integer)

    Process:
    - Queries the database for reminders linked to the user where `is_completed` is False.
    - Filters reminders with `due_date` between today and 30 days from today.
    - Joins each reminder with its related prescription to include additional details.
    - Converts date fields to ISO 8601 format for consistency.

    Return Value:
    - Success: Returns a JSON list of upcoming prescription reminders with prescription details and HTTP status code 200. (Response)
    - Failure: Returns a JSON error message with HTTP status code 500 in case of database or server errors. (Response)
    """

    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    condition = profile_access_condition()

    try:
        connection = get_app_connection()
        with connection.cursor() as cursor:
            query = f"""
                SELECT
                    pr.id,
                    pr.utilisateur_id,
                    pr.ordonnance_id,
                    pr.name,
                    pr.due_date,
                    pr.sound,
                    pr.is_completed,
                    pr.notes,
                    pr.created_at,
                    pr.updated_at,
                    o.description AS ordonnance_description,
                    o.medecin_nom,
                    o.date_prescription,
                    o.date_expiration,
                    o.statut AS ordonnance_statut
                FROM prescription_reminders pr
                LEFT JOIN ordonnances o ON pr.ordonnance_id = o.id
                WHERE {condition}
                AND pr.is_completed = FALSE
                AND pr.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                ORDER BY pr.due_date ASC
            """
            cursor.execute(query, (current_user_id, current_user_id))
            reminders = cursor.fetchall()

            for r in reminders:
                for key in ['due_date', 'date_prescription', 'date_expiration']:
                    if r.get(key):
                        r[key] = r[key].isoformat()

            return jsonify(reminders), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

# ===========================
# Get reminders by prescription
# ===========================
@prescription_reminders_bp.route('/prescriptions', methods=['GET'])
def get_prescription_for_reminders():
    """
    Objective:
    Retrieve all prescription reminders associated with a specific prescription.

    Parameters:
    - prescription_id: ID of the prescription for which reminders are requested. (Integer)

    Process:
    - Queries the database for all reminders linked to the given prescription.
    - Orders the results by due_date in descending order.
    - Converts the `due_date` field to ISO 8601 format for consistency.

    Return Value:
    - Success: Returns a JSON list of reminders for the specified prescription with HTTP status code 200. (Response)
    - Failure: Returns a JSON error message with HTTP status code 500 in case of database or server errors. (Response)
    """

    try:
        connection = get_app_connection()
        with connection.cursor() as cursor:
            sql = """
                SELECT
                    id,
                    utilisateur_id,
                    ordonnance_id,
                    name,
                    due_date,
                    sound,
                    is_completed,
                    notes,
                    created_at,
                    updated_at
                FROM prescription_reminders
                WHERE ordonnance_id = %s
                ORDER BY due_date DESC
            """
            cursor.execute(sql, (prescription_id,))
            reminders = cursor.fetchall()

            for reminder in reminders:
                if reminder['due_date']:
                    reminder['due_date'] = reminder['due_date'].isoformat()

            return jsonify(reminders), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

# ===========================
# Get user prescription (for reminder creation)
# ===========================
@prescription_reminders_bp.route('/<int:user_id>/prescription', methods=['GET'])
def get_prescription_for_reminders(user_id):
    """
    Objective:
    Retrieve all active prescription for a specific user that are eligible for creating prescription reminders.

    Parameters:
    - user_id: ID of the user whose active prescription are requested. (Integer)

    Process:
    - Queries the database for prescription linked to the given user with status 'active'.
    - Orders the results by expiration date in descending order.
    - Converts date fields (`date_prescription` and `date_expiration`) to ISO 8601 format.

    Return Value:
    - Success: Returns a JSON list of active prescription with HTTP status code 200. (Response)
    - Failure: Returns a JSON error message with HTTP status code 500 in case of database or server errors. (Response)
    """

    current_user_id, error_response, status = get_current_user_id()
    if error_response:
        return error_response, status

    condition = profile_access_condition()

    try:
        connection = get_app_connection()
        with connection.cursor() as cursor:
            query = f"""
                SELECT
                    id,
                    description,
                    medecin_nom,
                    date_prescription,
                    date_expiration,
                    statut
                FROM ordonnances
                WHERE {condition} AND statut = 'active'
                ORDER BY date_expiration DESC
            """
            cursor.execute(query, (current_user_id, current_user_id))
            ordonnances = cursor.fetchall()

            for o in ordonnances:
                for key in ['date_prescription', 'date_expiration']:
                    if o.get(key):
                        o[key] = o[key].isoformat()

            return jsonify(ordonnances), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()
