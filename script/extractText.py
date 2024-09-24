import cv2
import numpy as np
import pytesseract

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

    text = extract_text_from_image(img_path)
    if text:
        # print("Texte: ")
        print(text)
    else:
        print("Texte non reconnu.")
            