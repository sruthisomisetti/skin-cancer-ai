import tensorflow as tf
import numpy as np
from PIL import Image
import os

# ==============================
# SETTINGS
# ==============================

MODEL_PATH = "models/skin_cancer_efficientnet.tflite"
IMG_SIZE = 224

CLASS_NAMES = {
    0: "Melanocytic nevi (nv)",
    1: "Melanoma (mel)",
    2: "Benign keratosis (bkl)",
    3: "Basal cell carcinoma (bcc)",
    4: "Actinic keratosis (akiec)",
    5: "Vascular lesion (vasc)",
    6: "Dermatofibroma (df)"
}

# ==============================
# LOAD TFLITE MODEL
# ==============================

print("Loading TensorFlow Lite model...")

interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print("TFLite model loaded successfully!")

# ==============================
# SHOW MODEL INPUT / OUTPUT
# ==============================

print("\nInput shape:", input_details[0]["shape"])
print("Input type:", input_details[0]["dtype"])
print("Output shape:", output_details[0]["shape"])

# ==============================
# ASK FOR IMAGE
# ==============================

image_path = input("\nEnter the path of a skin image: ").strip().strip('"')

if not os.path.exists(image_path):
    print("ERROR: Image file not found.")
    exit()

# ==============================
# LOAD AND PREPARE IMAGE
# ==============================

print("\nPreparing image...")

image = Image.open(image_path).convert("RGB")
image = image.resize((IMG_SIZE, IMG_SIZE))

image_array = np.array(image, dtype=np.float32)

# Add batch dimension
image_array = np.expand_dims(image_array, axis=0)

# ==============================
# RUN TFLITE MODEL
# ==============================

interpreter.set_tensor(
    input_details[0]["index"],
    image_array
)

interpreter.invoke()

output = interpreter.get_tensor(
    output_details[0]["index"]
)

probabilities = output[0]

# ==============================
# GET PREDICTION
# ==============================

predicted_class = int(np.argmax(probabilities))
confidence = float(probabilities[predicted_class]) * 100

print("\n==============================")
print("SKIN LESION PREDICTION")
print("==============================")

print("Prediction:", CLASS_NAMES[predicted_class])
print(f"Confidence: {confidence:.2f}%")

print("\nAll class probabilities:")

for class_id, probability in enumerate(probabilities):
    print(
        f"{CLASS_NAMES[class_id]}: "
        f"{probability * 100:.2f}%"
    )

print("\nNote: This is an AI research/demo result and")
print("should NOT be used as a medical diagnosis.")