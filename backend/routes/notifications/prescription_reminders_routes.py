
from flask import Blueprint, request, jsonify
from datetime import datetime, date

from db_app import get_app_connection

prescription_reminders_bp = Blueprint('prescription_reminders', __name__, url_prefix='/prescription-reminders')

# ===========================
# Get all reminders for user
# ===========================
@prescription_reminders_bp.route('/<int:user_id>', methods=['GET'])
def get_prescription_reminders(user_id):
    """
    Get all prescription reminders for a specific user with ordonnance details
    """
    try:
        connection = get_app_connection()
        with connection.cursor() as cursor:
            sql = """
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
                WHERE pr.utilisateur_id = %s
                ORDER BY pr.due_date ASC
            """
            cursor.execute(sql, (user_id,))
            reminders = cursor.fetchall()

            for reminder in reminders:
                # Convert date fields to ISO format
                for key in ['due_date', 'date_prescription', 'date_expiration']:
                    if reminder.get(key):
                        reminder[key] = reminder[key].isoformat()

                # Calculate days until due (only if not completed)
                if reminder['due_date'] and not reminder['is_completed']:
                    due_date = datetime.strptime(reminder['due_date'], '%Y-%m-%d').date()
                    today = date.today()
                    reminder['days_until_due'] = (due_date - today).days
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
    Create a new prescription reminder linked to an ordonnance
    """
    try:
        data = request.get_json()
        required_fields = ['utilisateur_id', 'ordonnance_id', 'name', 'due_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        connection = get_app_connection()
        with connection.cursor() as cursor:
            # Check ordonnance ownership
            cursor.execute(
                "SELECT id FROM ordonnances WHERE id = %s AND utilisateur_id = %s",
                (data['ordonnance_id'], data['utilisateur_id'])
            )
            if not cursor.fetchone():
                return jsonify({'error': 'Ordonnance not found or does not belong to user'}), 404

            sql = """
                INSERT INTO prescription_reminders
                (utilisateur_id, ordonnance_id, name, due_date, sound, is_completed, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """

            due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()

            cursor.execute(sql, (
                data['utilisateur_id'],
                data['ordonnance_id'],
                data['name'],
                due_date,
                data.get('sound', 'Son 1'),
                data.get('is_completed', False),
                data.get('notes')
            ))

            connection.commit()
            reminder_id = cursor.lastrowid

            return jsonify({'message': 'Prescription reminder created successfully', 'id': reminder_id}), 201

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
    Update an existing prescription reminder — keeps is_completed unchanged if not provided
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
    Delete a prescription reminder
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
    Toggle prescription reminder completion status
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
@prescription_reminders_bp.route('/<int:user_id>/upcoming', methods=['GET'])
def get_upcoming_prescription_reminders(user_id):
    """
    Get upcoming prescription reminders (within next 30 days)
    """
    try:
        connection = get_app_connection()
        with connection.cursor() as cursor:
            sql = """
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
                WHERE pr.utilisateur_id = %s
                AND pr.is_completed = FALSE
                AND pr.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                ORDER BY pr.due_date ASC
            """
            cursor.execute(sql, (user_id,))
            reminders = cursor.fetchall()

            for reminder in reminders:
                for key in ['due_date', 'date_prescription', 'date_expiration']:
                    if reminder.get(key):
                        reminder[key] = reminder[key].isoformat()

            return jsonify(reminders), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

# ===========================
# Get reminders by ordonnance
# ===========================
@prescription_reminders_bp.route('/ordonnance/<int:ordonnance_id>', methods=['GET'])
def get_reminders_by_ordonnance(ordonnance_id):
    """
    Get all reminders for a specific ordonnance
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
            cursor.execute(sql, (ordonnance_id,))
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
# Get user ordonnances (for reminder creation)
# ===========================
@prescription_reminders_bp.route('/<int:user_id>/ordonnances', methods=['GET'])
def get_ordonnances_for_reminders(user_id):
    """
    Get all active ordonnances for a user that can be used to create reminders
    """
    try:
        connection = get_app_connection()
        with connection.cursor() as cursor:
            sql = """
                SELECT
                    id,
                    description,
                    medecin_nom,
                    date_prescription,
                    date_expiration,
                    statut
                FROM ordonnances
                WHERE utilisateur_id = %s
                AND statut = 'active'
                ORDER BY date_expiration DESC
            """
            cursor.execute(sql, (user_id,))
            ordonnances = cursor.fetchall()

            for ordonnance in ordonnances:
                for key in ['date_prescription', 'date_expiration']:
                    if ordonnance.get(key):
                        ordonnance[key] = ordonnance[key].isoformat()

            return jsonify(ordonnances), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()
