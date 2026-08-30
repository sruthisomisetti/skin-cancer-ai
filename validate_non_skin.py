import os
import numpy as np
import tensorflow as tf
from PIL import Image

MODEL_PATH = "app/skin_cancer_efficientnet.tflite"
SKIN_DIR = "validator/test/skin"
NON_SKIN_DIR = "validator/test/non_skin"

IMG_SIZE = (224, 224)

CLASS_NAMES = [
    "Melanocytic nevi (nv)",
    "Melanoma (mel)",
    "Benign keratosis (bkl)",
    "Basal cell carcinoma (bcc)",
    "Actinic keratoses (akiec)",
    "Vascular lesions (vasc)",
    "Dermatofibroma (df)",
]

# Load TFLite model
interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

input_index = input_details[0]["index"]
output_index = output_details[0]["index"]

print("Model loaded successfully.")
print("Input shape:", input_details[0]["shape"])
print("Output shape:", output_details[0]["shape"])


def predict(image_path):
    image = Image.open(image_path).convert("RGB")
    image = image.resize(IMG_SIZE)

    image = np.array(image, dtype=np.float32) / 255.0
    image = np.expand_dims(image, axis=0)

    interpreter.set_tensor(input_index, image)
    interpreter.invoke()

    output = interpreter.get_tensor(output_index)[0]

    predicted_class = int(np.argmax(output))
    confidence = float(np.max(output))

    return predicted_class, confidence


def get_images(folder):
    extensions = (".jpg", ".jpeg", ".png")
    return [
        os.path.join(folder, f)
        for f in os.listdir(folder)
        if f.lower().endswith(extensions)
    ]


def test_category(name, folder):
    images = get_images(folder)

    correct = 0
    high_confidence = 0

    print(f"\nTesting {name}: {len(images)} images")

    for i, image_path in enumerate(images, 1):
        predicted_class, confidence = predict(image_path)

        # A prediction is considered valid for skin images
        # if the model predicts any of its 7 trained classes.
        if name == "SKIN":
            correct += 1

        # For non-skin images, we watch for high-confidence predictions.
        if name == "NON-SKIN" and confidence >= 0.80:
            high_confidence += 1

        if i % 100 == 0:
            print(f"Processed {i}/{len(images)}")

    return len(images), high_confidence


skin_total, _ = test_category("SKIN", SKIN_DIR)
non_skin_total, non_skin_high = test_category("NON-SKIN", NON_SKIN_DIR)

print("\n" + "=" * 50)
print("VALIDATION COMPLETE")
print("=" * 50)

print(f"Skin images tested:     {skin_total}")
print(f"Non-skin images tested: {non_skin_total}")
print(f"Total images tested:    {skin_total + non_skin_total}")

print(
    f"\nNon-skin images with >=80% confidence: "
    f"{non_skin_high}/{non_skin_total}"
)

rate = (non_skin_high / non_skin_total) * 100

print(f"High-confidence non-skin rate: {rate:.2f}%")

print("\nNote:")
print("This test checks how confidently the model predicts on non-skin images.")
print("It is a validation experiment, not a medical diagnostic test.")
