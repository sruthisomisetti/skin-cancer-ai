import numpy as np
import pandas as pd
import tensorflow as tf
from PIL import Image
from pathlib import Path

MODEL_PATH = "models/skin_cancer_efficientnet.tflite"
CSV_PATH = "dataset/test.csv"
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

# Load model
interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

input_index = input_details[0]["index"]
output_index = output_details[0]["index"]

print("Model loaded successfully.")
print("Input:", input_details[0]["shape"])
print("Output:", output_details[0]["shape"])


def predict(image_path):
    image = Image.open(image_path).convert("RGB")
    image = image.resize(IMG_SIZE)

    image = np.array(image, dtype=np.float32)
    image = np.expand_dims(image, axis=0)

    interpreter.set_tensor(input_index, image)
    interpreter.invoke()

    output = interpreter.get_tensor(output_index)[0]

    return int(np.argmax(output))


# Load test labels
df = pd.read_csv(CSV_PATH)

correct = 0
total = len(df)

class_correct = {i: 0 for i in range(7)}
class_total = {i: 0 for i in range(7)}

print(f"\nTesting {total} images...\n")

for i, row in df.iterrows():

    image_path = Path(row["image_path"])

    # Convert Windows-style path to a usable path
    image_path = Path(str(image_path).replace("\\", "/"))

    true_label = int(row["label"])

    predicted_label = predict(image_path)

    class_total[true_label] += 1

    if predicted_label == true_label:
        correct += 1
        class_correct[true_label] += 1

    if (i + 1) % 100 == 0:
        print(f"Processed {i + 1}/{total}")


accuracy = (correct / total) * 100

print("\n" + "=" * 55)
print("REAL MODEL ACCURACY")
print("=" * 55)

print(f"Correct predictions: {correct}/{total}")
print(f"Overall accuracy:    {accuracy:.2f}%")

print("\nAccuracy by class:")
print("-" * 55)

for i in range(7):
    if class_total[i] > 0:
        class_accuracy = (class_correct[i] / class_total[i]) * 100

        print(
            f"{i} - {CLASS_NAMES[i]}: "
            f"{class_correct[i]}/{class_total[i]} "
            f"({class_accuracy:.2f}%)"
        )

print("\nValidation finished.")
