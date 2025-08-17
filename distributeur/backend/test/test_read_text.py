import base64
from pathlib import Path
from unittest.mock import patch

import pytest

# Import direct du module extractAll pour couvrir ses fonctions utilitaires
from scripts.scanner.extractAll import (
    add_background,
    correct_orientation,
    flip_image,
    getInfosPrescription,
    getInfosRectoID,
    getInfosVersoID,
    main as extract_main,
)

TEST_DIR = Path(__file__).resolve().parent
ROOT_DIR = TEST_DIR.parent
IMAGE_DIR = ROOT_DIR / "scripts" / "scanner" / "image"


# --- Helpers ---

def _encode_image_to_data_url(img_path: Path) -> str:
    mime = "image/png" if img_path.suffix.lower() == ".png" else "image/jpeg"
    with open(img_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    return f"data:{mime};base64,{b64}"


# --- Tests route /extractText avec mocks PaddleOCR ---

@pytest.mark.order(1)
@patch("scripts.scanner.extractAll.main")
def test_extract_text_prescription_success(mock_main, client):
    mock_main.return_value = {"raw_text": "Prescription text", "infos": {"medecin": {}, "patient": {}}}

    payload = {
        "base64_image": "data:image/png;base64,AAA",  # fake base64
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
        "base64_image": "data:image/png;base64,AAA",
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
        "base64_image": "data:image/png;base64,AAA",
        "type": "V",
    }
    resp = client.post("/extractText", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["raw_text"] == "Verso text"


@pytest.mark.order(1)
def test_extract_text_missing_fields(client):
    # Manque base64_image
    resp = client.post("/extractText", json={"type": "P"})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "base64_image and type are required"

    # Manque type
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
def test_add_background_keeps_center():
    import cv2
    import numpy as np

    src = IMAGE_DIR / "image1.png"
    img = cv2.imread(str(src))
    assert img is not None
    padded = add_background(img, scale_factor=1.2)
    assert padded.shape[0] > img.shape[0]
    assert padded.shape[1] > img.shape[1]


@pytest.mark.order(2)
def test_correct_orientation_creates_file(tmp_path):
    src = IMAGE_DIR / "image1.png"
    local = tmp_path / "to_fix.png"
    local.write_bytes(src.read_bytes())
    out_path = correct_orientation(str(local))
    out = Path(out_path)
    assert out.exists()
    try:
        out.unlink()
    except Exception:
        pass


@pytest.mark.order(2)
def test_flip_image_writes_output(tmp_path):
    import cv2

    src = IMAGE_DIR / "image1.png"
    out = tmp_path / "flipped.png"
    flip_image(str(src), str(out), 1)
    assert out.exists() and out.stat().st_size > 0


@pytest.mark.order(2)
def test_main_with_bytes_and_flip():
    img_path = IMAGE_DIR / "image1.png"
    raw = img_path.read_bytes()
    res = extract_main(raw, "P", is_bytes=True, flip_horizontal=True)
    assert set(res.keys()) == {"raw_text", "infos"}
    assert isinstance(res["raw_text"], str)
    assert isinstance(res["infos"], dict)


@pytest.mark.order(2)
def test_main_with_path_without_flip():
    img_path = IMAGE_DIR / "RECTO.png"
    res = extract_main(str(img_path), "R", is_bytes=False, flip_horizontal=False)
    assert set(res.keys()) == {"raw_text", "infos"}
    assert isinstance(res["raw_text"], str)
    assert isinstance(res["infos"], dict)


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
    assert infos_r.get("date_naissance") == "01/02/1990"

    verso_text = (
        "Adresse: 10RUEDEPARIS75001PARIS\nCarte valable jusqu'au 31.12.2030\n"
        "délivrée le 01-01-2021 par PREFECTURE DE POLICE"
    )
    infos_v = getInfosVersoID(verso_text)
    assert "adresse" in infos_v
    assert infos_v.get("date_validite") == "31/12/2030"
    assert infos_v.get("date_delivrance") == "01/01/2021"
