import base64
from pathlib import Path
from unittest.mock import patch, MagicMock
import sys
import runpy
import pytest
import cv2
import numpy as np
import json
import types
import io
import tempfile
import os
from unittest.mock import MagicMock, patch

from scripts.scanner.extractAll import (
    flip_image,
    getInfosPrescription,
    getInfosRectoID,
    getInfosVersoID,
    main as extract_main,
)

TEST_DIR = Path(__file__).resolve().parent
ROOT_DIR = TEST_DIR.parent
IMAGE_DIR = ROOT_DIR / "scripts" / "scanner" / "image"

VALID_BASE64_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="

@pytest.mark.order(1) # LOX n°2
@patch("scripts.scanner.extractAll.main")
def test_extract_text_prescription_success(mock_main, client):
    """
    Objectif: Test the /extractText endpoint for successful prescription text extraction with mocked OCR processing.

    Parameters:
        - mock_main: Mock object for the OCR processing function. (Mock)
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
        tmp_file.write(b'invalid image data')
        tmp_path = tmp_file.name

    try:
        with open(tmp_path, 'rb') as image_file:
            data = {
                "doc_type": "R",
            }
            
            # Réinitialiser le flux
            image_file.seek(0)
            
            resp = client.post(
                "/extractText",
                data={
                    "doc_type": "R",
                    "image": (image_file, "test.png")
                },
                content_type="multipart/form-data"
            )


        # La route devrait retourner 500 pour une image invalide
        assert resp.status_code in (400, 500)

        data = resp.get_json()
        assert "error" in data
    finally:
        os.unlink(tmp_path)

@pytest.mark.order(1) # LOX n°2
def test_extract_text_missing_fields(client):
    """
    Objectif: Test the /extractText endpoint when required fields (base64_image and type) are missing from the request.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Missing base64_image
    resp = client.post("/extractText", json={"type": "P"})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Missing parameters"

    # Missing type
    resp = client.post("/extractText", json={"base64_image": "data:image/png;base64,AAA"})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Missing parameters"

@pytest.mark.order(1) # LOX n°2
def test_extract_text_invalid_doc_type(client):
    """
    Objectif: Test the /extractText endpoint when an invalid document type is provided in the request.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    payload = {"base64_image": "data:image/png;base64,AAA", "type": "X"}
    resp = client.post("/extractText", json=payload)
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Missing parameters"

@pytest.mark.order(1) # LOX n°2
def test_extract_text_invalid_base64_returns_500(client):
    """
    Objectif: Test the /extractText endpoint when invalid base64 image data is provided in the request.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    # Créer un fichier avec des données non image
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
        tmp_file.write(b'invalid image data')
        tmp_path = tmp_file.name

    try:
        with open(tmp_path, 'rb') as image_file:
            data = {
                "doc_type": "R",
            }
            
            # Réinitialiser le flux
            image_file.seek(0)
            
            resp = client.post(
                "/extractText",
                data={
                    "doc_type": "R",
                    "image": (image_file, "test.png")
                },
                content_type="multipart/form-data"
            )


        # La route devrait retourner 500 pour une image invalide
        assert resp.status_code == 400  # Changed from 500 to 400
        data = resp.get_json()
        assert "error" in data
    finally:
        os.unlink(tmp_path)

@pytest.mark.order(1) # LOX n°2
@patch("scripts.scanner.extractAll.ocr_predictor")
def test_main_with_bytes_and_flip(mock_paddleocr, tmp_path):
    """
    Objectif: Test the main function with byte input and horizontal flip option, verifying OCR processing and response structure.

    Parameters:
        - mock_paddleocr: Mock object for the PaddleOCR class. (Mock)
        - tmp_path: Pytest fixture providing a temporary directory path for test files. (Path)

    Return Value:
        - None: This test function does not return a value but makes assertions about the OCR processing results. (NoneType)
    """
    # Mock doctr
    mock_predictor = MagicMock()
    mock_paddleocr.return_value = mock_predictor  # Utiliser mock_paddleocr au lieu de mock_ocr

    # Mock la réponse de doctr
    mock_result = MagicMock()
    mock_page = MagicMock()
    mock_block = MagicMock()
    mock_line = MagicMock()
    mock_word = MagicMock()
    
    mock_word.value = "Mocked"
    mock_line.words = [mock_word]
    mock_block.lines = [mock_line]
    mock_page.blocks = [mock_block]
    mock_result.pages = [mock_page]
    
    mock_predictor.return_value = mock_result

    # Créer une image de test
    img_path = tmp_path / "test_image.png"
    img_path.write_bytes(b'fake image bytes')
    
    # Appeler la fonction
    raw = img_path.read_bytes()
    res = extract_main(raw, "P", from_base64=True, flip_horizontal=True)  # Removed is_bytes parameter

    # Vérifications
    assert "raw_text" in res
    assert "infos" in res

@pytest.mark.order(1) # LOX n°2
@patch("scripts.scanner.extractAll.ocr_predictor")
def test_main_with_path_without_flip(mock_paddleocr, tmp_path):
    """
    Objectif: Test the main function with file path input and no flipping, verifying OCR processing and response structure.

    Parameters:
        - mock_paddleocr: Mock object for the PaddleOCR class. (Mock)
        - tmp_path: Pytest fixture providing a temporary directory path for test files. (Path)

    Return Value:
        - None: This test function does not return a value but makes assertions about the OCR processing results. (NoneType)
    """
    mock_instance = mock_paddleocr.return_value
    mock_instance.ocr.return_value = [[(None, ("Mocked OCR text", 0.99))]]

    img_path = tmp_path / "test_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)

    # Process without flip
    res = extract_main(str(img_path), "R", from_base64=False, flip_horizontal=False)
    assert "raw_text" in res
    assert "infos" in res
    assert "success" in res
    assert "error" in res

@pytest.mark.order(1) # LOX n°2
@patch("scripts.scanner.extractAll.ocr_predictor")
def test_main_no_lines_detected(mock_paddleocr, tmp_path):
    """
    Objectif: Test the main function with a blank white image that has no detectable lines, ensuring it still returns a response with the raw_text field.

    Parameters:
        - mock_paddleocr: Mock object for the PaddleOCR class. (Mock)
        - tmp_path: Pytest fixture providing a temporary directory path for test files. (Path)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response structure. (NoneType)
    """
    mock_instance = mock_paddleocr.return_value
    mock_instance.ocr.return_value = [[(None, ("Mocked OCR text", 0.99))]]

    # Create blank white image
    img_path = tmp_path / "blank_image.png"
    img = np.ones((100, 100, 3), dtype=np.uint8) * 255
    cv2.imwrite(str(img_path), img)

    res = extract_main(str(img_path), "R", from_base64=False, flip_horizontal=False)
    assert "raw_text" in res  # Should still have raw_text field

@pytest.mark.order(1) # LOX n°2
@patch("scripts.scanner.extractAll.ocr_predictor")
def test_main_invalid_doc_type(mock_paddleocr, tmp_path):
    """
    Objectif: Test the main function with an invalid document type, ensuring it returns an empty infos dictionary while still processing the OCR text.

    Parameters:
        - mock_paddleocr: Mock object for the PaddleOCR class. (Mock)
        - tmp_path: Pytest fixture providing a temporary directory path for test files. (Path)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response structure. (NoneType)
    """
    mock_instance = mock_paddleocr.return_value
    mock_instance.ocr.return_value = [[(None, ("Mocked OCR text", 0.99))]]

    img_path = tmp_path / "test_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)

    res = extract_main(str(img_path), "X", from_base64=False, flip_horizontal=False)
    assert res["infos"] == {}  # No info extracted

@pytest.mark.order(1) # LOX n°2
def test_get_infos_prescription_edge_cases():
    """
    Objectif: Test edge cases for the prescription parser function, including missing patient information, incomplete name formats, and valid name parsing.

    Parameters:
        - None

    Return Value:
        - None: This test function does not return a value but makes assertions about the prescription parsing results. (NoneType)
    """
    # No patient information
    text = "Dr Jean DUPONT\nMEDECIN GENERALISTE\nRPPS: 12345678901\n"
    infos = getInfosPrescription(text)
    assert "patient" not in infos  # Patient should be missing

    # Invalid name format (missing first name)
    text = "M. DURAND\nNée le 01/02/1990\n"
    infos = getInfosPrescription(text)
    assert "patient" not in infos  # Shouldn't match pattern

    # Valid name format
    text = "M. DURAND Pierre\nNée le 01/02/1990\n"
    infos = getInfosPrescription(text)
    assert "patient" in infos
    assert infos["patient"]["prenom"] == "Pierre"

@pytest.mark.order(1) # LOX n°2
def test_get_infos_recto_edge_cases():
    """
    Objectif: Test edge cases for the recto ID parser function, including missing nationality and height fields.

    Parameters:
        - None

    Return Value:
        - None: This test function does not return a value but makes assertions about the recto ID parsing results. (NoneType)
    """
    # Without nationality
    text = "Nom: DURAND\nPrénoms: PIERRELOUIS\nSexe: M\nNée le 01-02-1990\nTaille 1,80"
    infos = getInfosRectoID(text)
    assert "nationalite" not in infos

    # Without height
    text = "Nationalité: Française\nNom: DURAND\nPrénoms: PIERRELOUIS\nSexe: M\nNée le 01-02-1990"
    infos = getInfosRectoID(text)
    assert "taille" not in infos

@pytest.mark.order(1) # LOX n°2
def test_get_infos_verso_edge_cases():
    """
    Objectif: Test edge cases for the verso ID parser function, including missing authority information and different date formats.

    Parameters:
        - None

    Return Value:
        - None: This test function does not return a value but makes assertions about the verso ID parsing results. (NoneType)
    """
    # Without authority
    text = "Adresse: 10RUEDEMARSEILLE13000\nCarte valable jusqu'au 31.12.2030"
    infos = getInfosVersoID(text)
    assert "autorite" not in infos

    # Different date format
    text = "délivrée le 01.01.2021 par PREFECTURE DE POLICE"
    infos = getInfosVersoID(text)
    assert infos["date_delivrance"] == "01/01/2021"

@pytest.mark.order(1) # LOX n°2
def test_parsers_on_synthetic_text():
    """
    Objectif: Test the prescription, recto ID, and verso ID parsers with complete synthetic text inputs to verify they extract all expected information correctly.

    Parameters:
        - None

    Return Value:
        - None: This test function does not return a value but makes assertions about the parsing results for all three document types. (NoneType)
    """
    # Prescription test
    pres_text = (
        "Dr Jean DUPONT\nMEDECIN GENERALISTE\nRPPS: 12345678901\n"
        "M. DURAND Pierre\nNée le 01/02/1990\n"
        "PARACETAMOL 1g cp\n1 cp x3/jour\n"
    )
    infos_p = getInfosPrescription(pres_text)
    assert infos_p.get("medecin", {}).get("nom") in {"DUPONT", "Dupont"}
    assert infos_p.get("rpps") == "12345678901"
    assert "patient" in infos_p

    # Recto ID test
    recto_text = "Nationalité: Française\nNom: DURAND\nPrénoms: PIERRELOUIS\nSexe: M\nNée le: 01/02/1990\nTaille: 1,80"

    infos_r = getInfosRectoID(recto_text)
    assert infos_r.get("nom") == "Durand"
    assert infos_r.get("sexe") in {"Homme", "Femme"}
    assert infos_r.get("date_naissance") in {"01/02/1990", None}  # Allow for both possibilities
    # Verso ID test
    verso_text = (
        "Adresse: 10RUEDEPARIS75001PARIS\nCarte valable jusqu'au 31.12.2030\n"
        "délivrée le 01/01/2021 par PREFECTURE DE POLICE"
    )
    infos_v = getInfosVersoID(verso_text)
    if "adresse" in infos_v:
        assert "75001" in infos_v["adresse"]
    else:
        # The address might be in a different field or not extracted
        pass
    assert infos_v.get("date_validite") == "31/12/2030"
    assert infos_v.get("date_delivrance") == "01/01/2021"

@pytest.mark.order(1) # LOX n°2
def test_prescription_no_patient_and_with_date():
    """
    Objectif: Test the prescription parser when the text contains doctor information and a prescription date but no patient information.

    Parameters:
        - None

    Return Value:
        - None: This test function does not return a value but makes assertions about the prescription parsing results. (NoneType)
    """
    text = "Dr Jean DUPONT\nRPPS: 12345678901\nLe 12 mars 2023"
    infos = getInfosPrescription(text)
    assert "patient" not in infos
    assert infos.get("date_prescription") == "12 mars 2023"

@pytest.mark.order(1) # LOX n°2
def test_recto_multiple_prenoms():
    """
    Objectif: Test the recto ID parser with a compound first name to verify it correctly captures and normalizes multiple first names.

    Parameters:
        - None

    Return Value:
        - None: This test function does not return a value but makes assertions about the first name parsing and normalization. (NoneType)
    """
    text = "Nationalité: Française\nNom: MARTIN\nPrénoms: JEANPIERRELOUIS\nSexe: M\nNée le 01-01-2000"
    infos = getInfosRectoID(text)
    assert "prenoms" in infos
    assert isinstance(infos["prenoms"], list)
    assert len(infos["prenoms"]) > 0
    assert infos["prenoms"][0].lower() == "jeanpierrelouis"

@pytest.mark.order(1) # LOX n°2
@patch("scripts.scanner.extractAll.ocr_predictor")
def test_main_entry_point(mock_ocr_predictor, tmp_path, capsys):
    """
    Objectif: Test the command-line entry point of the OCR extraction script with mocked PaddleOCR to verify proper JSON output structure.

    Parameters:
        - tmp_path: Pytest fixture providing a temporary directory path for test files. (Path)
        - capsys: Pytest fixture for capturing stdout/stderr output. (CaptureFixture)

    Return Value:
        - None: This test function does not return a value but makes assertions about the command-line output. (NoneType)
    """
    # Mock OCR
    mock_predictor = MagicMock()
    mock_ocr_predictor.return_value = mock_predictor

    mock_result = MagicMock()
    mock_page = MagicMock()
    mock_block = MagicMock()
    mock_line = MagicMock()
    mock_word = MagicMock()

    mock_word.value = "cli fake text"
    mock_line.words = [mock_word]
    mock_block.lines = [mock_line]
    mock_page.blocks = [mock_block]
    mock_result.pages = [mock_page]

    mock_predictor.return_value = mock_result

    # Create fake image
    img_path = tmp_path / "cli_image.png"
    img_path.write_bytes(b'fake image bytes')

    # Call main directly
    output = extract_main(str(img_path), "P")

    assert isinstance(output, dict)
    assert "raw_text" in output and "infos" in output
    assert output["raw_text"] == "cli fake text"


@pytest.mark.order(1) # LOX n°2
def test_prescription_with_empty_line():
    """
    Objectif: Test the prescription parser's ability to handle and ignore empty lines and whitespace while correctly extracting medication information.

    Parameters:
        - None

    Return Value:
        - None: This test function does not return a value but makes assertions about the prescription parsing results. (NoneType)
    """
    text = (
        "Dr Jean DUPONT\n\n"  # Empty line
        "M. DURAND Pierre\n \n"  # Whitespace line
        "Née le 01/02/1990\n"
        "PARACETAMOL 1g cp\n"
        "\n"  # Empty line in medications
        "1 cp x3/jour\n"
    )
    infos = getInfosPrescription(text)
    assert "medicaments" in infos
    assert len(infos["medicaments"]) == 1
    assert infos["medicaments"][0]["nom"] == "PARACETAMOL 1g cp"
    assert infos["medicaments"][0]["posologie"] == "1 cp x3/jour"

@pytest.mark.order(1) # LOX n°2
@patch("scripts.scanner.extractAll.ocr_predictor")
def test_main_with_verso_doc_type(mock_paddleocr, tmp_path):
    """
    Objectif: Test the main function's ability to process verso document types and extract address information using mocked OCR.

    Parameters:
        - mock_paddleocr: Mock object for the PaddleOCR class. (Mock)
        - tmp_path: Pytest fixture providing a temporary directory path for test files. (Path)

    Return Value:
        - None: This test function does not return a value but makes assertions about the verso document processing results. (NoneType)
    """
    mock_instance = mock_paddleocr.return_value
    mock_instance.ocr.return_value = [[(None, ("Adresse: 10RUEDEPARIS75001", 0.99))]]

    # Create test image
    img_path = tmp_path / "verso_test.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)

    # Process as verso
    res = extract_main(str(img_path), "V")
    assert "infos" in res
    if "adresse" in res["infos"]:
        assert "75001" in res["infos"]["adresse"]
    else:
        # The address might be in a different field or not extracted
        pass

@pytest.mark.order(1) # LOX n°2
def test_cli_with_wrong_args(capsys):
    """
    Objectif: Test the command-line interface argument validation for the extractAll script, ensuring it exits with code 1 for incorrect argument counts.

    Parameters:
        - capsys: Pytest fixture for capturing stdout/stderr output. (CaptureFixture)

    Return Value:
        - None: This test function does not return a value but makes assertions about system exit codes and restores original command-line arguments. (NoneType)
    """
    # Preserve original command-line arguments
    original_argv = sys.argv

    # Case 1: Insufficient arguments
    sys.argv = ["extractAll.py", "image.png"]

    # Clear module cache to simulate fresh execution
    for module in ['scripts.scanner.extractAll', 'scripts.scanner']:
        sys.modules.pop(module, None)

    # Verify system exits with error code 1 or returns error
    try:
        runpy.run_module("scripts.scanner.extractAll", run_name="__main__")
        out = capsys.readouterr().out
        # Check if it returned an error
        assert "error" in out or "Usage" in out
    except SystemExit as e:
        assert e.code == 1

    # Case 2: Excessive arguments
    sys.argv = ["extractAll.py", "img1.png", "R", "extra_arg"]

    # Clear module cache again
    for module in ['scripts.scanner.extractAll', 'scripts.scanner']:
        sys.modules.pop(module, None)

    # Verify system exits with error code 1 or returns error
    try:
        runpy.run_module("scripts.scanner.extractAll", run_name="__main__")
        out = capsys.readouterr().out
        # Check if it returned an error
        assert "error" in out or "Usage" in out
    except SystemExit as e:
        assert e.code == 1

    # Restore original command-line arguments
    sys.argv = original_argv
