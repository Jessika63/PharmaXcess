import cv2
import numpy as np
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image
import joblib
import pytesseract

model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')

def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

def is_prescription(img_path):
    img_array = preprocess_image(img_path)
    features = model.predict(img_array)

    classifier = joblib.load('prescription_classifier.joblib')
    prediction = classifier.predict(features)
    return bool(prediction[0])

def extract_text_from_image(img_path):
    img = cv2.imread(img_path)

    if img is not None:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (5, 5), 0)
        adaptive_thresh = cv2.adaptiveThreshold(
            gray,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            11,
            2
        )
        kernel = np.ones((1, 1), np.uint8)
        adaptive_thresh = cv2.dilate(adaptive_thresh, kernel, iterations=1)
        adaptive_thresh = cv2.erode(adaptive_thresh, kernel, iterations=1)

        text = pytesseract.image_to_string(adaptive_thresh, lang='eng')
        return text
    else:
        return None

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python script.py <image_path>")
        sys.exit(1)

    img_path = sys.argv[1]

    if is_prescription(img_path):
        print("L'image est une ordonnance.")
        text = extract_text_from_image(img_path)
        if text:
            print("Texte: ")
            print(text)
        else:
            print("Texte non reconnu.")
    else:
        print("L'image n'est pas une ordonnance.")
