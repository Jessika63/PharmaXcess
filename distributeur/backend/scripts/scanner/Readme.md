# Python Scripts Documentation

## 1. Script: `fillDBWithFile.py`

### Description
This script reads a JSON or CSV file containing a list of doctors and sends this data to an API to populate a database.

### Usage
```sh
python3 fillDBWithFile.py <file_path>
```
- `<file_path>`: Path to the file containing doctor data (JSON or CSV).

### Functionality
1. Checks the file extension:
   - JSON: Ensures the presence of the `doctors` key.
   - CSV: Validates the required fields and processes data in batches of 180 doctors.
2. Converts the data into a usable format.
3. Sends the data to the API: `http://localhost:5000/add_list_doctors`.
4. Displays a success message or an error if something goes wrong.

---

## 2. Script: `extractAll.py`

### Description
This script analyzes an image (photo or scan) to extract text using OCR (Tesseract). It can identify medical prescriptions, ID cards, and extract relevant information.

### Usage
```sh
python3 extractAll.py <image_path> <P|R|V>
```
- `image_path`: Path to the image to be analyzed.
- `P`: Extracts a medical prescription.
- `R`: Extracts the front side of an ID card.
- `V`: Extracts the back side of an ID card.

### Functionality
1. Corrects the image orientation if necessary.
2. Applies OCR to extract text.
3. Analyzes the text to identify key information based on the document type.
4. Displays or returns the extracted data in JSON format.

---

## 3. Script: `take_picture.py`

### Description
This script captures an image from the webcam and saves it locally. It can also use an image recognition model (`MobileNetV2`) to classify objects present in the image.

### Usage
```sh
python3 take_picture.py [file_name]
```
- `file_name` (optional): Name of the image file without extension. By default, `captured_image.png` will be used.

### Functionality
1. Activates the webcam and captures an image.
2. Saves the image in the `screenFolder` directory.
3. (Disabled option) Can use an image classification model to identify objects in the photo.

---

## Notes
- The scripts use libraries such as `requests`, `cv2`, `pytesseract`, and `tensorflow`. Ensure they are installed before running (`pip install -r requirements.txt`).
- The API must be accessible locally (`http://localhost:5000`).
- For `extractAll.py`, Tesseract OCR must be installed and configured on your machine.

---

## Contact
If you encounter any issues, please contact the developer responsible for these scripts.

