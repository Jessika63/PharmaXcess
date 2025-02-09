# Documentation des scripts Python

## 1. Script : `fillDBWithFile.py`

### Description
Ce script permet de lire un fichier JSON ou CSV contenant une liste de médecins et d'envoyer ces données à une API pour peupler une base de données.

### Utilisation
```sh
python3 fillDBWithFile.py <file_path>
```
- `<file_path>` : Chemin vers le fichier contenant les données des médecins (JSON ou CSV).

### Fonctionnement
1. Vérifie l'extension du fichier :
   - JSON : Vérifie la présence de la clé `doctors`.
   - CSV : Valide les champs nécessaires et traite les données par lots de 180 médecins.
2. Convertit les données en un format exploitable.
3. Envoie les données à l'API : `http://localhost:5000/add_list_doctors`.
4. Affiche un message de succès ou une erreur en cas de problème.

---

## 2. Script : `extractAll.py`

### Description
Ce script analyse une image (photo ou scan) pour en extraire du texte à l'aide d'OCR (Tesseract). Il peut identifier des prescriptions médicales, des cartes d'identité et extraire des informations pertinentes.

### Utilisation
```sh
python3 extractAll.py <image_path> <P|R|V>
```
- `image_path` : Chemin de l'image à analyser.
- `P` : Extraction d'une prescription médicale.
- `R` : Extraction du recto d'une carte d'identité.
- `V` : Extraction du verso d'une carte d'identité.

### Fonctionnement
1. Corrige l'orientation de l'image si nécessaire.
2. Applique l'OCR pour extraire le texte.
3. Analyse le texte pour identifier les informations clés selon le type de document.
4. Affiche ou retourne les données extraites au format JSON.

---

## 3. Script : `take_picture.py`

### Description
Ce script capture une image à partir de la webcam et enregistre le fichier localement. Il peut également utiliser un modèle de reconnaissance d'images (`MobileNetV2`) pour classer les objets présents sur l'image.

### Utilisation
```sh
python3 take_picture.py [nom_fichier]
```
- `nom_fichier` (optionnel) : Nom du fichier image sans extension. Par défaut, `captured_image.png` sera utilisé.

### Fonctionnement
1. Active la webcam et capture une image.
2. Sauvegarde l'image dans le dossier `screenFolder`.
3. (Option désactivée) Peut utiliser un modèle de classification d'images pour identifier les objets sur la photo.

---

## Notes
- Les scripts utilisent des bibliothèques comme `requests`, `cv2`, `pytesseract` et `tensorflow`. Assurez-vous qu'elles sont installées avant l'exécution (`pip install -r requirements.txt`).
- L'API utilisée doit être accessible localement (`http://localhost:5000`).
- Pour `extractAll.py`, Tesseract OCR doit être installé et configuré sur votre machine.

---

## Contact
En cas de problème, contactez le développeur responsable de ces scripts.

