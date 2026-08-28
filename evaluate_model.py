import pandas as pd
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

IMG_SIZE = 224
BATCH_SIZE = 32

TEST_CSV = "dataset/test.csv"
MODEL_PATH = "models/efficientnet_best.keras"

# Class names
class_names = [
    "nv",
    "mel",
    "bkl",
    "bcc",
    "akiec",
    "vasc",
    "df"
]

print("Loading test dataset...")

test_df = pd.read_csv(TEST_CSV)

print("Test images:", len(test_df))

def load_image(path, label):
    image = tf.io.read_file(path)
    image = tf.image.decode_jpeg(image, channels=3)
    image = tf.image.resize(image, [IMG_SIZE, IMG_SIZE])
    image = tf.cast(image, tf.float32)

    return image, label


test_dataset = tf.data.Dataset.from_tensor_slices(
    (
        test_df["image_path"].values,
        test_df["label"].values
    )
)

test_dataset = (
    test_dataset
    .map(load_image, num_parallel_calls=tf.data.AUTOTUNE)
    .batch(BATCH_SIZE)
    .prefetch(tf.data.AUTOTUNE)
)

print("Loading trained model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Evaluating model...")

loss, accuracy = model.evaluate(test_dataset)

print("\n==============================")
print("MODEL TEST RESULTS")
print("==============================")
print(f"Test Loss: {loss:.4f}")
print(f"Test Accuracy: {accuracy:.4f}")
print(f"Test Accuracy: {accuracy * 100:.2f}%")

# Predictions
y_true = test_df["label"].values

predictions = model.predict(test_dataset)

y_pred = np.argmax(predictions, axis=1)

print("\nClassification Report:")
print(
    classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        digits=4
    )
)

print("\nConfusion Matrix:")
print(confusion_matrix(y_true, y_pred))