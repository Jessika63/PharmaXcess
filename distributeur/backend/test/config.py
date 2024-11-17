
dict_doctor_to_add = {
    "add_success_1" : {
        'first_name': 'John',
        'last_name': 'Doe',
        'rpps': '1234567890',
        'sector': 'General',
        'region': 'Ile-de-France'
    },
    "add_success_2" : {
        'first_name': 'Jane',
        'last_name': 'Smith',
        'rpps': '1234567890',
        'sector': 'Pediatrics',
        'region': 'Auvergne-Rhône-Alpes'
    },
    "missing_field_rpps" : {
        'first_name': 'John',
        'last_name': 'Doe',
        'sector': 'General',
        'region': 'Ile-de-France'
    },
    "missing_field_region" : {
        'first_name': 'Jane',
        'last_name': 'Smith',
        'rpps': '9876543210',
        'sector': 'Pediatrics',
    },
    "missing_field_first_name" : {
        'last_name': 'Doe',
        'rpps': '1234567890',
        'sector': 'General',
        'region': 'Ile-de-France'
    },
}

dict_doctor_not_to_add = {
    "not_added_without_rpps" : {
        'first_name': 'Jane',
        'last_name': 'Smith',
        'sector': 'Cardiology',
        'region': 'Provence-Alpes-Cote d\'Azur'
    },
    "not_added_with_first_name" : {
        'first_name': 'Jane',
        'last_name': 'Smith',
        'rpps': '9876543210',
        'sector': 'Cardiology',
        'region': 'Provence-Alpes-Cote d\'Azur'
    }
}

rpps_not_added = "0000000000"


def global_verifictaion():
    results = [
        verifictaion_not_add_in_add(),
        verifictaion_if_all_unique(),
        verification_all_fields_not_in_doctors(),
        verification_that_a_specific_rpps_not_in_doctors(),
    ]

    # Filtrer uniquement les erreurs et les ajouter à une liste plate
    errors = []
    for result in results:
        if result is not True:
            errors.extend(result)  # Ajouter directement les erreurs à la liste

    if errors:
        return errors

    return True


def verifictaion_not_add_in_add():
    errors = []
    for not_added_key, not_added_doctor in dict_doctor_not_to_add.items():
        if not_added_doctor in dict_doctor_to_add.values():
            errors.append(f"The doctor: {not_added_key} from dict_doctor_not_to_add is present in dict_doctor_to_add")
    return errors if errors else True


def verifictaion_if_all_unique():
    results = [
        verification_one_unique(dict_doctor_to_add, "dict_doctor_to_add"),
        verification_one_unique(dict_doctor_not_to_add, "dict_doctor_not_to_add"),
    ]

    # Retourner une liste plate d'erreurs
    errors = []
    for result in results:
        if result is not True:
            errors.extend(result)

    return errors if errors else True


def verification_one_unique(doctor_dict, doctor_dict_name):
    seen_doctors_add = {}
    errors = []
    for key, doctor in doctor_dict.items():
        doctor_frozen = frozenset(doctor.items())
        if doctor_frozen in seen_doctors_add:
            errors.append(f"Doctor '{key}' is the same as doctor '{seen_doctors_add[doctor_frozen]}' in {doctor_dict_name}")
        seen_doctors_add[doctor_frozen] = key
    return errors if errors else True


def verification_all_fields_not_in_doctors():
    results = [
        verification_one_field_not_in_doctor("rpps", dict_doctor_to_add, "dict_doctor_to_add", "missing_field_rpps"),
        verification_one_field_not_in_doctor("region", dict_doctor_to_add, "dict_doctor_to_add", "missing_field_region"),
        verification_one_field_not_in_doctor("rpps", dict_doctor_not_to_add, "dict_doctor_not_to_add", "not_added_without_rpps"),
        verification_one_field_not_in_doctor("first_name", dict_doctor_to_add, "dict_doctor_to_add", "missing_field_first_name"),
    ]

    errors = []
    for result in results:
        if result is not True:
            errors.append(result)

    return errors if errors else True


def verification_one_field_not_in_doctor(field, doctor_dict, doctor_dict_name, doctor_to_check):
    if field in doctor_dict[doctor_to_check]:
        return f"The doctor '{doctor_to_check}' in {doctor_dict_name} contains the {field} key"
    return True


def verification_that_a_specific_rpps_not_in_doctors():
    for doctor_key, doctor in dict_doctor_to_add.items():
        if doctor.get('rpps') == rpps_not_added:
            return [f"The value 'rpps_not_added': ({rpps_not_added}) is found in the doctor: {doctor_key} in dict_doctor_to_add"]
    return True
