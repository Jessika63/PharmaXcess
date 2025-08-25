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
    add_background,
    correct_orientation,
    flip_image,
    getInfosPrescription,
    getInfosRectoID,
    getInfosVersoID,
    extract_text_paddleocr,
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
    Test case: Successful prescription text extraction.

    - Mocks OCR processing to return prescription data
    - Sends POST request with valid base64 image and type 'P'
    - Verifies 200 status code and expected response structure
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
    Test case: Successful recto ID text extraction.

    - Mocks OCR processing to return recto ID data
    - Sends POST request with valid base64 image and type 'R'
    - Verifies 200 status code and expected text in response
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
    Test case: Successful verso ID text extraction.

    - Mocks OCR processing to return verso ID data
    - Sends POST request with valid base64 image and type 'V'
    - Verifies 200 status code and expected text in response
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
    Test case: Missing required fields in request.

    - Sends request missing base64_image field
    - Sends request missing type field
    - Verifies 400 status code and error message for both cases
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
    Test case: Invalid document type specified.

    - Sends request with invalid document type 'X'
    - Verifies 400 status code and error message
    """
    payload = {"base64_image": "data:image/png;base64,AAA", "type": "X"}
    resp = client.post("/extractText", json=payload)
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Invalid document type"

@pytest.mark.order(1) # LOX n°2
def test_extract_text_invalid_base64_returns_500(client):
    """
    Test case: Invalid base64 image data handling.

    - Sends request with malformed base64 data
    - Verifies 500 status code and error in response
    """
    payload = {"base64_image": "data:image/png;base64,@@NOT_BASE64@@", "type": "P"}
    resp = client.post("/extractText", json=payload)
    assert resp.status_code == 500
    data = resp.get_json()
    assert "error" in data and isinstance(data["error"], str)

@pytest.mark.order(1) # LOX n°2
def test_add_background_keeps_center(tmp_path):
    """
    Test case: Image padding maintains content center.

    - Creates test black image
    - Applies padding with scale factor 1.2
    - Verifies output dimensions are larger than original
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
    Test case: Error handling for None input.

    - Passes None to add_background function
    - Verifies ValueError is raised with proper message
    """
    with pytest.raises(ValueError) as excinfo:
        add_background(None)
    assert "Input image is None" in str(excinfo.value)

@pytest.mark.order(1) # LOX n°2
def test_correct_orientation_creates_file(tmp_path):
    """
    Test case: Orientation correction outputs file.

    - Creates test image file
    - Runs orientation correction
    - Verifies output file exists
    - Cleans up output file
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
    Test case: Image flip creates output file.

    - Creates test image
    - Applies horizontal flip
    - Verifies output file exists with content
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
    Test case: Error handling for invalid image path.

    - Attempts to flip non-existent image
    - Verifies error message in stdout
    - Confirms no output file created
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
    Test case: OCR processing with byte input and flip.

    - Mocks PaddleOCR to return test text
    - Creates test image and processes as bytes
    - Enables horizontal flip option
    - Verifies OCR response structure
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
    Test case: OCR processing with file path input.

    - Mocks PaddleOCR to return test text
    - Processes image from file path without flipping
    - Verifies OCR response structure
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
    Test case: OCR processing with blank image.

    - Mocks PaddleOCR to return test text
    - Processes blank white image
    - Verifies raw_text exists in response
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
    Test case: Processing with invalid document type.

    - Mocks PaddleOCR to return test text
    - Processes with invalid type 'X'
    - Verifies empty infos in response
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
    Test case: PaddleOCR text extraction.

    - Mocks PaddleOCR to return two text lines
    - Processes test image
    - Verifies concatenated text output
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
    Test case: Prescription parser edge cases.

    - Tests parsing without patient information
    - Tests parsing with incomplete patient name
    - Tests parsing with correctly formatted patient name
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
    Test case: Recto ID parser edge cases.

    - Tests parsing without nationality field
    - Tests parsing without height field
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
    Test case: Verso ID parser edge cases.

    - Tests parsing without authority information
    - Tests parsing with different date formats
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
    Test case: Parsers with synthetic text inputs.

    - Tests prescription parser with complete data
    - Tests recto ID parser with complete data
    - Tests verso ID parser with complete data
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
    Test case: Prescription without patient but with date.

    - Tests prescription with doctor info and date
    - Verifies patient is missing but date is captured
    """
    text = "Dr Jean DUPONT\nRPPS: 12345678901\nLe 12 mars 2023"
    infos = getInfosPrescription(text)
    assert "patient" not in infos
    assert infos.get("date_prescription") == "12 mars 2023"

@pytest.mark.order(1) # LOX n°2
def test_recto_multiple_prenoms():
    """
    Test case: Recto ID with multiple first names.

    - Tests name parsing with compound first name
    - Verifies first names are captured as list
    - Checks name normalization
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
    Test case: Command-line entry point execution.

    - Creates test image file
    - Mocks PaddleOCR with dummy implementation
    - Simulates CLI execution with arguments
    - Verifies JSON output structure
    """
    # Create test image
    img_path = tmp_path / "cli_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)

    # Mock OCR with dummy implementation
    fake_result_text = "cli fake text"
    class DummyOCR:
        def __init__(self, *args, **kwargs): pass
        def ocr(self, *args, **kwargs): return [[(None, (fake_result_text, 0.99))]]

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
    Test case: Prescription parsing ignores empty lines.

    - Tests prescription text with empty lines
    - Verifies medication parsing skips empty lines
    - Checks correct medication data extraction
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
    Test case: Processing verso document type.

    - Mocks PaddleOCR to return address text
    - Processes as verso document type
    - Verifies address extraction in infos
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
    Test case: CLI argument validation errors.

    - Tests with insufficient arguments (only image path)
    - Tests with excessive arguments (extra parameter)
    - Verifies system exits with code 1 in both cases
    - Ensures original command-line arguments are restored
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
