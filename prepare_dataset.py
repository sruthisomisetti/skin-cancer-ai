import os
import pandas as pd
from sklearn.model_selection import train_test_split

# ==============================
# PATHS
# ==============================

METADATA_PATH = "dataset/dataset/HAM10000_metadata.tab"
IMAGE_DIR = "dataset/images"

# ==============================
# LOAD METADATA
# ==============================

print("Loading metadata...")

df = pd.read_csv(METADATA_PATH, sep="\t")

print(f"Total metadata records: {len(df)}")

# ==============================
# CHECK IMAGE FILES
# ==============================

print("Checking image files...")

available_images = {
    os.path.splitext(filename)[0]
    for filename in os.listdir(IMAGE_DIR)
    if filename.lower().endswith(".jpg")
}

df["image_path"] = df["image_id"].apply(
    lambda image_id: os.path.join(IMAGE_DIR, image_id + ".jpg")
)

df = df[df["image_id"].isin(available_images)].copy()

print(f"Images found: {len(df)}")

# ==============================
# DIAGNOSIS LABELS
# ==============================

label_map = {
    "nv": 0,
    "mel": 1,
    "bkl": 2,
    "bcc": 3,
    "akiec": 4,
    "vasc": 5,
    "df": 6
}

df["label"] = df["dx"].map(label_map)

# ==============================
# DISPLAY CLASS COUNTS
# ==============================

print("\nClass distribution:")
print(df["dx"].value_counts())

# ==============================
# TRAIN / VALIDATION / TEST SPLIT
# ==============================

train_df, temp_df = train_test_split(
    df,
    test_size=0.20,
    stratify=df["label"],
    random_state=42
)

val_df, test_df = train_test_split(
    temp_df,
    test_size=0.50,
    stratify=temp_df["label"],
    random_state=42
)

# ==============================
# SAVE CSV FILES
# ==============================

train_df.to_csv("dataset/train.csv", index=False)
val_df.to_csv("dataset/validation.csv", index=False)
test_df.to_csv("dataset/test.csv", index=False)

print("\nDataset split completed!")
print(f"Training images:   {len(train_df)}")
print(f"Validation images: {len(val_df)}")
print(f"Testing images:    {len(test_df)}")

print("\nCreated files:")
print("dataset/train.csv")
print("dataset/validation.csv")
print("dataset/test.csv")