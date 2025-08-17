import base64
from pathlib import Path
from unittest.mock import patch
import sys
import runpy
import pytest
import cv2
import numpy as np
import subprocess
import json

# Import direct du module extractAll pour couvrir ses fonctions utilitaires
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

@pytest.mark.order(1)
@patch("scripts.scanner.extractAll.main")
def test_extract_text_prescription_success(mock_main, client):
    mock_main.return_value = {"raw_text": "Prescription text", "infos": {"medecin": {}, "patient": {}}}

    payload = {
        "base64_image": f"data:image/png;base64,{VALID_BASE64_IMAGE}",
        "type": "P",
    }
    resp = client.post("/extractText", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["raw_text"] == "Prescription text"
    assert "infos" in data

@pytest.mark.order(1)
@patch("scripts.scanner.extractAll.main")
def test_extract_text_recto_success(mock_main, client):
    mock_main.return_value = {"raw_text": "Recto text", "infos": {"nom": "Durand"}}

    payload = {
        "base64_image": f"data:image/png;base64,{VALID_BASE64_IMAGE}",
        "type": "R",
    }
    resp = client.post("/extractText", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["raw_text"] == "Recto text"

@pytest.mark.order(1)
@patch("scripts.scanner.extractAll.main")
def test_extract_text_verso_success(mock_main, client):
    mock_main.return_value = {"raw_text": "Verso text", "infos": {"adresse": "10 rue de Paris"}}

    payload = {
        "base64_image": f"data:image/png;base64,{VALID_BASE64_IMAGE}",
        "type": "V",
    }
    resp = client.post("/extractText", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["raw_text"] == "Verso text"

@pytest.mark.order(1)
def test_extract_text_missing_fields(client):
    resp = client.post("/extractText", json={"type": "P"})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "base64_image and type are required"

    resp = client.post("/extractText", json={"base64_image": "data:image/png;base64,AAA"})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "base64_image and type are required"

@pytest.mark.order(1)
def test_extract_text_invalid_doc_type(client):
    payload = {"base64_image": "data:image/png;base64,AAA", "type": "X"}
    resp = client.post("/extractText", json=payload)
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Invalid document type"

@pytest.mark.order(1)
def test_extract_text_invalid_base64_returns_500(client):
    payload = {"base64_image": "data:image/png;base64,@@NOT_BASE64@@", "type": "P"}
    resp = client.post("/extractText", json=payload)
    assert resp.status_code == 500
    data = resp.get_json()
    assert "error" in data and isinstance(data["error"], str)

# --- Tests directs des fonctions utilitaires d'extractAll ---

@pytest.mark.order(2)
def test_add_background_keeps_center(tmp_path):
    img_path = tmp_path / "test_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)
    
    img = cv2.imread(str(img_path))
    assert img is not None
    padded = add_background(img, scale_factor=1.2)
    assert padded.shape[0] > img.shape[0]
    assert padded.shape[1] > img.shape[1]

@pytest.mark.order(2)
def test_add_background_with_none():
    with pytest.raises(ValueError) as excinfo:
        add_background(None)
    assert "Input image is None" in str(excinfo.value)

@pytest.mark.order(2)
def test_correct_orientation_creates_file(tmp_path):
    img_path = tmp_path / "test_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)
    
    out_path = correct_orientation(str(img_path))
    out = Path(out_path)
    assert out.exists()
    out.unlink()

@pytest.mark.order(2)
def test_flip_image_writes_output(tmp_path):
    src = tmp_path / "test_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(src), img)
    
    out = tmp_path / "flipped.png"
    flip_image(str(src), str(out), 1)
    assert out.exists() and out.stat().st_size > 0

@pytest.mark.order(2)
def test_flip_image_invalid_path(tmp_path, capsys):
    invalid_path = tmp_path / "nonexistent_image.png"
    out_path = tmp_path / "flipped.png"
    flip_image(str(invalid_path), str(out_path), 1)
    
    captured = capsys.readouterr()
    assert f"Could not read the image at {invalid_path}" in captured.out
    assert not out_path.exists()

@pytest.mark.order(2)
@patch("scripts.scanner.extractAll.PaddleOCR")
def test_main_with_bytes_and_flip(mock_paddleocr, tmp_path):
    mock_instance = mock_paddleocr.return_value
    mock_instance.ocr.return_value = [
        [(None, ("Mocked OCR text", 0.99))]
    ]
    
    img_path = tmp_path / "test_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)
    
    raw = img_path.read_bytes()
    res = extract_main(raw, "P", is_bytes=True, flip_horizontal=True)
    assert set(res.keys()) == {"raw_text", "infos"}
    assert res["raw_text"] == "Mocked OCR text"
    assert isinstance(res["infos"], dict)

@pytest.mark.order(2)
@patch("scripts.scanner.extractAll.PaddleOCR")
def test_main_with_path_without_flip(mock_paddleocr, tmp_path):
    mock_instance = mock_paddleocr.return_value
    mock_instance.ocr.return_value = [
        [(None, ("Mocked OCR text", 0.99))]
    ]
    
    img_path = tmp_path / "test_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)
    
    res = extract_main(str(img_path), "R", is_bytes=False, flip_horizontal=False)
    assert set(res.keys()) == {"raw_text", "infos"}
    assert res["raw_text"] == "Mocked OCR text"
    assert isinstance(res["infos"], dict)

@pytest.mark.order(2)
@patch("scripts.scanner.extractAll.PaddleOCR")
def test_main_no_lines_detected(mock_paddleocr, tmp_path):
    mock_instance = mock_paddleocr.return_value
    mock_instance.ocr.return_value = [
        [(None, ("Mocked OCR text", 0.99))]
    ]
    
    img_path = tmp_path / "blank_image.png"
    img = np.ones((100, 100, 3), dtype=np.uint8) * 255
    cv2.imwrite(str(img_path), img)
    
    res = extract_main(str(img_path), "R", is_bytes=False, flip_horizontal=False)
    assert "raw_text" in res

@pytest.mark.order(2)
@patch("scripts.scanner.extractAll.PaddleOCR")
def test_main_invalid_doc_type(mock_paddleocr, tmp_path):
    mock_instance = mock_paddleocr.return_value
    mock_instance.ocr.return_value = [
        [(None, ("Mocked OCR text", 0.99))]
    ]
    
    img_path = tmp_path / "test_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)
    
    res = extract_main(str(img_path), "X", is_bytes=False, flip_horizontal=False)
    assert res["infos"] == {}

@pytest.mark.order(2)
@patch("scripts.scanner.extractAll.PaddleOCR")
def test_extract_text_paddleocr(mock_paddleocr, tmp_path):
    mock_instance = mock_paddleocr.return_value
    mock_instance.ocr.return_value = [
        [(None, ("Line1", 0.99)), (None, ("Line2", 0.98))]
    ]
    
    img_path = tmp_path / "test_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)
    
    text = extract_text_paddleocr(str(img_path))
    assert text == "Line1\nLine2"

@pytest.mark.order(3)
def test_get_infos_prescription_edge_cases():
    # Test without patient information
    text = "Dr Jean DUPONT\nMEDECIN GENERALISTE\nRPPS: 12345678901\n"
    infos = getInfosPrescription(text)
    assert "patient" not in infos
    
    # Test with patient name but no first name
    text = "M. DURAND\nNée le 01/02/1990\n"
    infos = getInfosPrescription(text)
    # The pattern requires both first and last name, so no match
    assert "patient" not in infos
    
    # Test with patient name in correct format
    text = "M. DURAND Pierre\nNée le 01/02/1990\n"
    infos = getInfosPrescription(text)
    assert "patient" in infos
    assert infos["patient"]["prenom"] == "Pierre"

@pytest.mark.order(3)
def test_get_infos_recto_edge_cases():
    # Test without nationality
    text = "Nom: DURAND\nPrénoms: PIERRELOUIS\nSexe: M\nNée le 01-02-1990\nTaille 1,80"
    infos = getInfosRectoID(text)
    assert "nationalite" not in infos
    
    # Test without height
    text = "Nationalité: Française\nNom: DURAND\nPrénoms: PIERRELOUIS\nSexe: M\nNée le 01-02-1990"
    infos = getInfosRectoID(text)
    assert "taille" not in infos

@pytest.mark.order(3)
def test_get_infos_verso_edge_cases():
    # Test without authority information
    text = "Adresse: 10RUEDEMARSEILLE13000\nCarte valable jusqu'au 31.12.2030"
    infos = getInfosVersoID(text)
    assert "autorite" not in infos
    
    # Test with different date formats
    text = "délivrée le 01.01.2021 par PREFECTURE DE POLICE"
    infos = getInfosVersoID(text)
    assert infos["date_delivrance"] == "01/01/2021"

@pytest.mark.order(3)
def test_parsers_on_synthetic_text():
    pres_text = (
        "Dr Jean DUPONT\nMEDECIN GENERALISTE\nRPPS: 12345678901\n"
        "M. DURAND Pierre\nNée le 01/02/1990\n"
        "PARACETAMOL 1g cp\n1 cp x3/jour\n"
    )
    infos_p = getInfosPrescription(pres_text)
    assert infos_p.get("medecin", {}).get("nom") in {"DUPONT", "Dupont"}
    assert infos_p.get("rpps") == "12345678901"
    assert "patient" in infos_p

    recto_text = (
        "Nationalité: Française\nNom: DURAND\nPrénoms: PIERRELOUIS\nSexe: M\nNée le 01-02-1990\nTaille 1,80"
    )
    infos_r = getInfosRectoID(recto_text)
    assert infos_r.get("nom") == "Durand"
    assert infos_r.get("sexe") in {"Homme", "Femme"}
    assert infos_r.get("date_naissance") == "01-02-1990"

    verso_text = (
        "Adresse: 10RUEDEPARIS75001PARIS\nCarte valable jusqu'au 31.12.2030\n"
        "délivrée le 01-01-2021 par PREFECTURE DE POLICE"
    )
    infos_v = getInfosVersoID(verso_text)
    assert "adresse" in infos_v
    assert infos_v.get("date_validite") == "31/12/2030"
    assert infos_v.get("date_delivrance") == "01-01-2021"

# --- Nouveaux tests pour atteindre 100% coverage ---

@pytest.mark.order(4)
def test_prescription_no_patient_and_with_date():
    text = "Dr Jean DUPONT\nRPPS: 12345678901\nLe 12 mars 2023"
    infos = getInfosPrescription(text)
    assert "patient" not in infos
    assert infos.get("date_prescription") == "12 mars 2023"

@pytest.mark.order(4)
def test_recto_multiple_prenoms():
    text = "Nationalité: Française\nNom: MARTIN\nPrénoms: JEANPIERRELOUIS\nSexe: M\nNée le 01-01-2000"
    infos = getInfosRectoID(text)
    assert "prenoms" in infos
    assert isinstance(infos["prenoms"], list)
    assert len(infos["prenoms"]) > 0
    # Vérifie que le prénom unique a bien été extrait
    assert infos["prenoms"][0].lower() == "jeanpierrelouis"

@pytest.mark.order(4)
def test_main_entry_point(tmp_path):
    # Créer une image factice
    img_path = tmp_path / "cli_image.png"
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), img)

    fake_result = {"raw_text": "fake text", "infos": {"key": "value"}}

    with patch("scripts.scanner.extractAll.main", return_value=fake_result):
        result = subprocess.run(
            [sys.executable, "-m", "scripts.scanner.extractAll", str(img_path), "X"],
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0
        output = json.loads(result.stdout.strip())
        assert output == fake_result
