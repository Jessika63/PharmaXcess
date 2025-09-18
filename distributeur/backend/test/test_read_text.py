import base64
from pathlib import Path
from unittest.mock import patch
import sys
import runpy
import pytest
import cv2
import numpy as np
import json
import types

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
    # Mock OCR response
    mock_main.return_value = {"raw_text": "Prescription text", "infos": {"medecin": {}, "patient": {}}}

    # Prepare payload with valid base64 image
    payload = {
        "base64_image": f"data:image/png;base64,{VALID_BASE64_IMAGE}",
        "type": "P",
    }

    # Send request and validate response
    resp = client.post("/extractText", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["raw_text"] == "Prescription text"
    assert "infos" in data

@pytest.mark.order(1) # LOX n°2
@patch("scripts.scanner.extractAll.main")
def test_extract_text_recto_success(mock_main, client):
    """
    Objectif: Test the /extractText endpoint for successful recto ID text extraction with mocked OCR processing.

    Parameters:
        - mock_main: Mock object for the OCR processing function. (Mock)
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    mock_main.return_value = {"raw_text": "Recto text", "infos": {"nom": "Durand"}}

    payload = {
        "base64_image": f"data:image/png;base64,{VALID_BASE64_IMAGE}",
        "type": "R",
    }
    resp = client.post("/extractText", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["raw_text"] == "Recto text"

@pytest.mark.order(1) # LOX n°2
@patch("scripts.scanner.extractAll.main")
def test_extract_text_verso_success(mock_main, client):
    """
    Objectif: Test the /extractText endpoint for successful verso ID text extraction with mocked OCR processing.

    Parameters:
        - mock_main: Mock object for the OCR processing function. (Mock)
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    mock_main.return_value = {"raw_text": "Verso text", "infos": {"adresse": "10 rue de Paris"}}

    payload = {
        "base64_image": f"data:image/png;base64,{VALID_BASE64_IMAGE}",
        "type": "V",
    }
    resp = client.post("/extractText", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["raw_text"] == "Verso text"

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
    assert resp.get_json()["error"] == "base64_image and type are required"

    # Missing type
    resp = client.post("/extractText", json={"base64_image": "data:image/png;base64,AAA"})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "base64_image and type are required"

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
    assert resp.get_json()["error"] == "Invalid document type"

@pytest.mark.order(1) # LOX n°2
def test_extract_text_invalid_base64_returns_500(client):
    """
    Objectif: Test the /extractText endpoint when invalid base64 image data is provided in the request.

    Parameters:
        - client: Flask test client used to make HTTP requests to the application. (FlaskClient)

    Return Value:
        - None: This test function does not return a value but makes assertions about the response. (NoneType)
    """
    payload = {"base64_image": "data:image/png;base64,@@NOT_BASE64@@", "type": "P"}
    resp = client.post("/extractText", json=payload)
    assert resp.status_code == 500
    data = resp.get_json()
    assert "error" in data and isinstance(data["error"], str)

@pytest.mark.order(1) # LOX n°2
def test_add_background_keeps_center(tmp_path):
    """
    Objectif: Test the add_background function to ensure it correctly pads an image while maintaining the content centered and increasing the dimensions by the specified scale factor.

    Parameters:
        - tmp_path: Pytest fixture providing a temporary directory path for test files. (Path)

    Return Value:
        - None: This test function does not return a value but makes assertions about the image dimensions. (NoneType)
    """
    # Create test image
    img_path = tmp_path / "test_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)

    # Process and validate dimensions
    img = cv2.imread(str(img_path))
    padded = add_background(img, scale_factor=1.2)
    assert padded.shape[0] > img.shape[0]
    assert padded.shape[1] > img.shape[1]

@pytest.mark.order(1) # LOX n°2
def test_add_background_with_none():
    """
    Objectif: Test the add_background function's error handling when None is passed as input.

    Parameters:
        - None

    Return Value:
        - None: This test function does not return a value but asserts that a ValueError is raised with the expected message. (NoneType)
    """
    with pytest.raises(ValueError) as excinfo:
        add_background(None)
    assert "Input image is None" in str(excinfo.value)

@pytest.mark.order(1) # LOX n°2
def test_correct_orientation_creates_file(tmp_path):
    """
    Objectif: Test the correct_orientation function to verify it creates an output file when processing an input image.

    Parameters:
        - tmp_path: Pytest fixture providing a temporary directory path for test files. (Path)

    Return Value:
        - None: This test function does not return a value but makes assertions about file existence and performs cleanup. (NoneType)
    """
    img_path = tmp_path / "test_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)

    # Process and validate output
    out_path = correct_orientation(str(img_path))
    out = Path(out_path)
    assert out.exists()
    out.unlink()  # Cleanup

@pytest.mark.order(1) # LOX n°2
def test_flip_image_writes_output(tmp_path):
    """
    Objectif: Test the flip_image function to verify it creates an output file with content when flipping an input image.

    Parameters:
        - tmp_path: Pytest fixture providing a temporary directory path for test files. (Path)

    Return Value:
        - None: This test function does not return a value but makes assertions about file existence and content. (NoneType)
    """
    src = tmp_path / "test_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(src), img)

    # Flip and validate
    out = tmp_path / "flipped.png"
    flip_image(str(src), str(out), 1)
    assert out.exists() and out.stat().st_size > 0

@pytest.mark.order(1) # LOX n°2
def test_flip_image_invalid_path(tmp_path, capsys):
    """
    Objectif: Test the flip_image function's error handling when provided with an invalid/non-existent image path.

    Parameters:
        - tmp_path: Pytest fixture providing a temporary directory path for test files. (Path)
        - capsys: Pytest fixture for capturing stdout/stderr output. (CaptureFixture)

    Return Value:
        - None: This test function does not return a value but makes assertions about error messages and file existence. (NoneType)
    """
    invalid_path = tmp_path / "nonexistent_image.png"
    out_path = tmp_path / "flipped.png"
    flip_image(str(invalid_path), str(out_path), 1)

    # Validate error message
    captured = capsys.readouterr()
    assert f"Could not read the image at {invalid_path}" in captured.out
    assert not out_path.exists()  # No output created

@pytest.mark.order(1) # LOX n°2
@patch("scripts.scanner.extractAll.PaddleOCR")
def test_main_with_bytes_and_flip(mock_paddleocr, tmp_path):
    """
    Objectif: Test the main function with byte input and horizontal flip option, verifying OCR processing and response structure.

    Parameters:
        - mock_paddleocr: Mock object for the PaddleOCR class. (Mock)
        - tmp_path: Pytest fixture providing a temporary directory path for test files. (Path)

    Return Value:
        - None: This test function does not return a value but makes assertions about the OCR processing results. (NoneType)
    """
    mock_instance = mock_paddleocr.return_value
    mock_instance.ocr.return_value = [[(None, ("Mocked OCR text", 0.99))]]

    # Create test image
    img_path = tmp_path / "test_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)

    # Process with flip option
    raw = img_path.read_bytes()
    res = extract_main(raw, "P", is_bytes=True, flip_horizontal=True)

    # Validate response
    assert set(res.keys()) == {"raw_text", "infos"}
    assert res["raw_text"] == "Mocked OCR text"
    assert isinstance(res["infos"], dict)

@pytest.mark.order(1) # LOX n°2
@patch("scripts.scanner.extractAll.PaddleOCR")
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
    res = extract_main(str(img_path), "R", is_bytes=False, flip_horizontal=False)
    assert set(res.keys()) == {"raw_text", "infos"}
    assert res["raw_text"] == "Mocked OCR text"
    assert isinstance(res["infos"], dict)

@pytest.mark.order(1) # LOX n°2
@patch("scripts.scanner.extractAll.PaddleOCR")
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

    res = extract_main(str(img_path), "R", is_bytes=False, flip_horizontal=False)
    assert "raw_text" in res  # Should still have raw_text field

@pytest.mark.order(1) # LOX n°2
@patch("scripts.scanner.extractAll.PaddleOCR")
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

    res = extract_main(str(img_path), "X", is_bytes=False, flip_horizontal=False)
    assert res["infos"] == {}  # No info extracted

@pytest.mark.order(1) # LOX n°2
@patch("scripts.scanner.extractAll.PaddleOCR")
def test_extract_text_paddleocr(mock_paddleocr, tmp_path):
    """
    Objectif: Test the extract_text_paddleocr function to verify it correctly concatenates multiple lines of text extracted by the PaddleOCR library.

    Parameters:
        - mock_paddleocr: Mock object for the PaddleOCR class. (Mock)
        - tmp_path: Pytest fixture providing a temporary directory path for test files. (Path)

    Return Value:
        - None: This test function does not return a value but makes assertions about the text extraction results. (NoneType)
    """
    mock_instance = mock_paddleocr.return_value
    mock_instance.ocr.return_value = [
        [(None, ("Line1", 0.99)), (None, ("Line2", 0.98))]
    ]

    # Create test image
    img_path = tmp_path / "test_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)

    text = extract_text_paddleocr(str(img_path))
    assert text == "Line1\nLine2"  # Verify line concatenation

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
    recto_text = (
        "Nationalité: Française\nNom: DURAND\nPrénoms: PIERRELOUIS\nSexe: M\nNée le 01-02-1990\nTaille 1,80"
    )
    infos_r = getInfosRectoID(recto_text)
    assert infos_r.get("nom") == "Durand"
    assert infos_r.get("sexe") in {"Homme", "Femme"}
    assert infos_r.get("date_naissance") == "01-02-1990"

    # Verso ID test
    verso_text = (
        "Adresse: 10RUEDEPARIS75001PARIS\nCarte valable jusqu'au 31.12.2030\n"
        "délivrée le 01-01-2021 par PREFECTURE DE POLICE"
    )
    infos_v = getInfosVersoID(verso_text)
    assert "adresse" in infos_v
    assert infos_v.get("date_validite") == "31/12/2030"
    assert infos_v.get("date_delivrance") == "01-01-2021"

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
def test_main_entry_point(tmp_path, capsys):
    """
    Objectif: Test the command-line entry point of the OCR extraction script with mocked PaddleOCR to verify proper JSON output structure.

    Parameters:
        - tmp_path: Pytest fixture providing a temporary directory path for test files. (Path)
        - capsys: Pytest fixture for capturing stdout/stderr output. (CaptureFixture)

    Return Value:
        - None: This test function does not return a value but makes assertions about the command-line output. (NoneType)
    """
    # Create test image
    img_path = tmp_path / "cli_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)

    # Mock OCR with dummy implementation
    fake_result_text = "cli fake text"
    class DummyOCR:
        def __init__(self, *args, **kwargs):
            """
            Objectif: Initializes a dummy OCR class instance for testing purposes, accepting any arguments without implementation.

            Parameters:
                - *args: Variable length argument list (ignored). (Any)
                - **kwargs: Arbitrary keyword arguments (ignored). (Any)

            Return Value:
                - None: This constructor does not return any value. (NoneType)
            """
            pass
        def ocr(self, *args, **kwargs):
            """
            Objectif: Mock OCR method that returns a fixed test result structure for testing purposes.

            Parameters:
                - *args: Variable length argument list (ignored in this mock). (Any)
                - **kwargs: Arbitrary keyword arguments (ignored in this mock). (Any)

            Return Value:
                - List containing one list of tuples with (None, (fake_text, confidence_score)) structure. (List)
            """
            return [[(None, (fake_result_text, 0.99))]]

    # Patch modules for CLI test
    fake_paddle = types.ModuleType("paddleocr")
    fake_paddle.PaddleOCR = DummyOCR
    with patch.dict(sys.modules, {"paddleocr": fake_paddle}):
        sys.modules.pop("scripts.scanner.extractAll", None)

            # Simulate CLI command
        with patch.object(sys, "argv", ["extractAll.py", str(img_path), "P"]):
            runpy.run_module("scripts.scanner.extractAll", run_name="__main__")

    # Capture and validate output
    out = capsys.readouterr().out.strip()
    printed = json.loads(out)
    assert "raw_text" in printed and "infos" in printed
    assert fake_result_text in printed["raw_text"]

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
@patch("scripts.scanner.extractAll.PaddleOCR")
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
    assert "adresse" in res["infos"]
    assert "75001" in res["infos"]["adresse"]  # Verify zip code extraction

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

    # Verify system exits with error code 1
    with pytest.raises(SystemExit) as excinfo:
        runpy.run_module("scripts.scanner.extractAll", run_name="__main__")
    assert excinfo.value.code == 1

    # Case 2: Excessive arguments
    sys.argv = ["extractAll.py", "img1.png", "R", "extra_arg"]

    # Clear module cache again
    for module in ['scripts.scanner.extractAll', 'scripts.scanner']:
        sys.modules.pop(module, None)

    # Verify system exits with error code 1
    with pytest.raises(SystemExit) as excinfo:
        runpy.run_module("scripts.scanner.extractAll", run_name="__main__")
    assert excinfo.value.code == 1

    # Restore original command-line arguments
    sys.argv = original_argv
