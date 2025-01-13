import cv2
import numpy as np
import tensorflow as tf
import os
import sys

name_screen = "captured_image.png"
if len(sys.argv) == 2:
    name_screen = sys.argv[1] + ".png"

model = tf.keras.applications.MobileNetV2(weights="imagenet")

def preprocess_image(image):
    image = cv2.resize(image, (224, 224))
    image = np.expand_dims(image, axis=0)
    image = tf.keras.applications.mobilenet_v2.preprocess_input(image)
    return image

def decode_predictions(predictions):
    return tf.keras.applications.mobilenet_v2.decode_predictions(predictions, top=5)[0]

folder_name = "screenFolder"

if not os.path.exists(folder_name):
    os.makedirs(folder_name)

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Erreur: Impossible d'ouvrir la caméra")
else:
    ret, frame = cap.read()
    if ret:
        file_name = os.path.join(folder_name, name_screen)
        
        cv2.imwrite(file_name, frame)
        print(f"Image enregistrée dans {file_name}")

        img_preprocessed = preprocess_image(frame)

        predictions = model.predict(img_preprocessed)

        decoded_preds = decode_predictions(predictions)

        predictions_list = []
        
        
        # Prediction of image (iwhat appear on the screen) 
        # for i, (imagenet_id, label, score) in enumerate(decoded_preds):
        #     print(f"Objet {i + 1}: {label}, avec une probabilité de {score * 100:.2f}%")
        #     objet = {
        #         'label': label,
        #         'score': score
        #     }
        #     predictions_list.append(objet)

        # print("\nListe des prédictions :")
        # print(predictions_list)
        
        
    else:
        print("Erreur: Impossible de capturer l'image")

# Display the image
# cv2.imshow('Captured Image', frame)
# cv2.waitKey(0)

cap.release()
cv2.destroyAllWindows()
