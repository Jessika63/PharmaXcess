
# Dictionary containing doctors to add with valid and invalid fields for testing
dict_doctor_to_add = {
    # Doctor with valid fields
    "add_success_1" : {
        'first_name': 'John',
        'last_name': 'Doe',
        'rpps': '1234567890',
        'sector': 'General',
        'region': 'Ile-de-France'
    },
    # Another doctor with valid fields
    "add_success_2" : {
        'first_name': 'Jane',
        'last_name': 'Smith',
        'rpps': '1234567890',
        'sector': 'Pediatrics',
        'region': 'Auvergne-Rhône-Alpes'
    },
    # Doctor missing the RPPS field
    "missing_field_rpps" : {
        'first_name': 'John',
        'last_name': 'Doe',
        'sector': 'General',
        'region': 'Ile-de-France'
    },
    # Doctor missing the region field
    "missing_field_region" : {
        'first_name': 'Jane',
        'last_name': 'Smith',
        'rpps': '9876543210',
        'sector': 'Pediatrics',
    },
    # Doctor missing the first name field
    "missing_field_first_name" : {
        'last_name': 'Doe',
        'rpps': '1234567890',
        'sector': 'General',
        'region': 'Ile-de-France'
    },
}

# Dictionary of doctors not to add, with missing fields
dict_doctor_not_to_add = {
    # Doctor missing the RPPS field
    "not_added_without_rpps" : {
        'first_name': 'Jane',
        'last_name': 'Smith',
        'sector': 'Cardiology',
        'region': 'Provence-Alpes-Cote d\'Azur'
    },
    # Doctor missing the RPPS field but has other details
    "not_added_with_first_name" : {
        'first_name': 'Jane',
        'last_name': 'Smith',
        'rpps': '9876543210',
        'sector': 'Cardiology',
        'region': 'Provence-Alpes-Cote d\'Azur'
    }
}

# RPPS value that is not added in any doctor
rpps_not_added = "0000000000"


# Function to perform global verification on doctor data
def global_verification():
    # Running multiple verification functions
    results = [
        verification_not_add_in_add(),
        verification_if_all_unique(),
        verification_all_fields_not_in_doctors(),
        verification_that_a_specific_rpps_not_in_doctors(),
    ]

    # Filter only errors and add them to a flat list
    errors = []
    for result in results:
        if result is not True:
            errors.extend(result)

    # If there are any errors, return them
    return errors or True


# Function to verify that doctors from dict_doctor_not_to_add are not present in dict_doctor_to_add
def verification_not_add_in_add():
    errors = []
    errors.extend(
        f"The doctor: {not_added_key} from dict_doctor_not_to_add is present in dict_doctor_to_add"
        for not_added_key, not_added_doctor in dict_doctor_not_to_add.items()
        if not_added_doctor in dict_doctor_to_add.values()
    )
    return errors or True


# Function to verify that each dictionary has unique doctor entries
def verification_if_all_unique():
    results = [
        verification_one_unique(dict_doctor_to_add, "dict_doctor_to_add"),
        verification_one_unique(dict_doctor_not_to_add, "dict_doctor_not_to_add"),
    ]

    # Return a flat list of errors
    errors = []
    for result in results:
        if result is not True:
            errors.extend(result)

    return errors or True


# Function to verify that each doctor in a dictionary has unique entries based on their details
def verification_one_unique(doctor_dict, doctor_dict_name):
    seen_doctors_add = {}
    errors = []
    for key, doctor in doctor_dict.items():
        doctor_frozen = frozenset(doctor.items())  # Freeze the doctor's details to make them hashable
        if doctor_frozen in seen_doctors_add:
            errors.append(f"Doctor '{key}' is the same as doctor '{seen_doctors_add[doctor_frozen]}' in {doctor_dict_name}")
        seen_doctors_add[doctor_frozen] = key
    return errors or True


# Function to verify that all fields are present in the doctor dictionaries
def verification_all_fields_not_in_doctors():
    results = [
        verification_one_field_not_in_doctor("rpps", dict_doctor_to_add, "dict_doctor_to_add", "missing_field_rpps"),
        verification_one_field_not_in_doctor("region", dict_doctor_to_add, "dict_doctor_to_add", "missing_field_region"),
        verification_one_field_not_in_doctor("rpps", dict_doctor_not_to_add, "dict_doctor_not_to_add", "not_added_without_rpps"),
        verification_one_field_not_in_doctor("first_name", dict_doctor_to_add, "dict_doctor_to_add", "missing_field_first_name"),
    ]

    errors = []
    errors.extend(result for result in results if result is not True)
    return errors or True


# Function to check if a specific field is missing in a doctor's entry
def verification_one_field_not_in_doctor(field, doctor_dict, doctor_dict_name, doctor_to_check):
    if field in doctor_dict[doctor_to_check]:
        return f"The doctor '{doctor_to_check}' in {doctor_dict_name} contains the {field} key"
    return True


# Function to verify that a specific RPPS value is not present in any doctor dictionary
def verification_that_a_specific_rpps_not_in_doctors():
    return next(
        (
            [
                f"The value 'rpps_not_added': ({rpps_not_added}) is found in the doctor: {doctor_key} in dict_doctor_to_add"
            ]
            for doctor_key, doctor in dict_doctor_to_add.items()
            if doctor.get('rpps') == rpps_not_added
        ),
        True,
    )
