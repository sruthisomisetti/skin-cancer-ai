import tensorflow as tf
import os

MODEL_PATH = "models/efficientnet_best.keras"
TFLITE_PATH = "models/skin_cancer_efficientnet.tflite"

print("Loading trained EfficientNet model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Converting model to TensorFlow Lite...")

converter = tf.lite.TFLiteConverter.from_keras_model(model)

tflite_model = converter.convert()

os.makedirs("models", exist_ok=True)

with open(TFLITE_PATH, "wb") as f:
    f.write(tflite_model)

print("\nTensorFlow Lite conversion completed!")
print(f"Saved model: {TFLITE_PATH}")

file_size_mb = os.path.getsize(TFLITE_PATH) / (1024 * 1024)

print(f"Model size: {file_size_mb:.2f} MB")