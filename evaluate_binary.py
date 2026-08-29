import numpy as np
import pandas as pd
import tensorflow as tf
from PIL import Image
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_curve,
    roc_auc_score,
)


TEST_CSV = "dataset/test.csv"
MODEL_PATH = "models/efficientnet_best.keras"
IMAGE_SIZE = (224, 224)

CLASS_NAMES = [
    "nv",
    "mel",
    "bkl",
    "bcc",
    "akiec",
    "vasc",
    "df",
]

CLASS_TO_INDEX = {
    class_name: class_index
    for class_index, class_name in enumerate(CLASS_NAMES)
}

SUSPICIOUS_CLASSES = {"mel", "bcc", "akiec"}


print("Loading test dataset...")
test_df = pd.read_csv(TEST_CSV)
print("Test images:", len(test_df))

print("Loading trained model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("Model loaded successfully.")


print("Running predictions...")
y_true = []
predicted_probabilities = []

for _, row in test_df.iterrows():
    image_path = row["image_path"]

    with Image.open(image_path) as image:
        image = image.convert("RGB")
        image = image.resize(IMAGE_SIZE)
        image_array = np.asarray(image, dtype=np.float32)

    image_array = np.expand_dims(image_array, axis=0)

    prediction = model.predict(image_array, verbose=0)[0]

    y_true.append(CLASS_TO_INDEX[row["dx"]])
    predicted_probabilities.append(prediction)

y_true = np.asarray(y_true)
predicted_probabilities = np.asarray(predicted_probabilities)
y_pred = np.argmax(predicted_probabilities, axis=1)

probability_table = pd.DataFrame(
    predicted_probabilities,
    columns=[f"{class_name}_probability" for class_name in CLASS_NAMES],
)

suspicious_indices = {
    CLASS_TO_INDEX[class_name]
    for class_name in SUSPICIOUS_CLASSES
}
actual_suspicious = np.isin(y_true, list(suspicious_indices))
suspicious_score = (
    predicted_probabilities[:, CLASS_TO_INDEX["mel"]]
    + predicted_probabilities[:, CLASS_TO_INDEX["bcc"]]
    + predicted_probabilities[:, CLASS_TO_INDEX["akiec"]]
)


print("\n======================================")
print("PREDICTED CLASS PROBABILITIES")
print("======================================")
print(probability_table.to_string(index=False))


print("\nPredicted probability summary by class:")
print(probability_table.describe().loc[["min", "max", "mean", "50%", "std"]].to_string())


def print_score_distribution(label, scores):
    print(f"\n{label}:")
    print(f"Minimum:              {np.min(scores):.6f}")
    print(f"Maximum:              {np.max(scores):.6f}")
    print(f"Mean:                 {np.mean(scores):.6f}")
    print(f"Median:               {np.median(scores):.6f}")
    print(f"Standard deviation:   {np.std(scores):.6f}")


print("\n======================================")
print("COMBINED SUSPICIOUS SCORE")
print("======================================")
print("Score = mel probability + bcc probability + akiec probability")
print("This score is not a probability of cancer.")
print_score_distribution("All test images", suspicious_score)
print_score_distribution(
    "Actual suspicious cases (mel, bcc, akiec)",
    suspicious_score[actual_suspicious],
)
print_score_distribution(
    "Other classes",
    suspicious_score[~actual_suspicious],
)

suspicious_score_roc_auc = roc_auc_score(
    actual_suspicious,
    suspicious_score,
)
false_positive_rate, true_positive_rate, thresholds = roc_curve(
    actual_suspicious,
    suspicious_score,
)
youden_index = np.argmax(true_positive_rate - false_positive_rate)
experimental_threshold = thresholds[youden_index]

print(f"\nCombined suspicious-score ROC-AUC: {suspicious_score_roc_auc:.4f}")
print(
    "Experimental test-set threshold (Youden's J; analysis only): "
    f"{experimental_threshold:.6f}"
)
print("This threshold is not used by the application.")


print("\n======================================")
print("7-CLASS MODEL EVALUATION")
print("======================================")
print("\nClassification Report:")
print(
    classification_report(
        y_true,
        y_pred,
        labels=range(len(CLASS_NAMES)),
        target_names=CLASS_NAMES,
        zero_division=0,
    )
)

print("Confusion Matrix:")
print(
    confusion_matrix(
        y_true,
        y_pred,
        labels=range(len(CLASS_NAMES)),
    )
)


print("\n======================================")
print("ONE-VS-REST CLASS METRICS")
print("======================================")

for class_name in ("mel", "bcc", "akiec"):
    class_index = CLASS_TO_INDEX[class_name]
    actual = (y_true == class_index).astype(int)
    predicted = (y_pred == class_index).astype(int)

    precision = precision_score(actual, predicted, zero_division=0)
    recall = recall_score(actual, predicted, zero_division=0)
    f1 = f1_score(actual, predicted, zero_division=0)
    roc_auc = roc_auc_score(
        actual,
        predicted_probabilities[:, class_index],
    )

    print(f"\n{class_name}:")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"ROC-AUC:   {roc_auc:.4f}")


print("\n======================================")
print("SUSPICIOUS-CATEGORY SCREENING EXPERIMENT")
print("======================================")

detected_suspicious = np.isin(y_pred, list(suspicious_indices))

print("Suspicious classes:", ", ".join(sorted(SUSPICIOUS_CLASSES)))
print("Actual suspicious cases:", int(actual_suspicious.sum()))
print(
    "Detected suspicious cases:",
    int(np.sum(actual_suspicious & detected_suspicious)),
)
print("\nScreening classification report:")
print(
    classification_report(
        actual_suspicious,
        detected_suspicious,
        target_names=["other categories", "suspicious categories"],
        zero_division=0,
    )
)
print("Screening confusion matrix:")
print(confusion_matrix(actual_suspicious, detected_suspicious))

print("\nIMPORTANT:")
print("This is an experimental evaluation only.")
print("It cannot diagnose cancer or determine cancer stage.")