from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image

model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')

def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

prescription_images = ['zz.jpg','zz.jpg']  # Ordonnances
non_prescription_images = ['aa.jpg', 'aa.jpg']  # Images random

X = []
y = []

for img_path in prescription_images:
    img_array = preprocess_image(img_path)
    features = model.predict(img_array)
    X.append(features.flatten())
    y.append(1)

for img_path in non_prescription_images:
    img_array = preprocess_image(img_path)
    features = model.predict(img_array)
    X.append(features.flatten())
    y.append(0)

X = np.array(X)
y = np.array(y)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

classifier = RandomForestClassifier(n_estimators=100, random_state=42)
classifier.fit(X_train, y_train)

y_pred = classifier.predict(X_test)
print(f'Pourcentge: {accuracy_score(y_test, y_pred)}')

joblib.dump(classifier, 'prescription_classifier.joblib')
