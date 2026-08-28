from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import numpy as np
import tensorflow as tf
import os


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "skin_cancer_efficientnet.tflite"
)

APP_FOLDER = BASE_DIR


# ============================================================
# FLASK APP
# ============================================================

app = Flask(
    __name__,
    static_folder=APP_FOLDER,
    static_url_path=""
)

CORS(app)


# ============================================================
# SKIN CANCER CLASSES
# ============================================================

CLASS_NAMES = [
    "Actinic keratoses (akiec)",
    "Basal cell carcinoma (bcc)",
    "Benign keratosis (bkl)",
    "Dermatofibroma (df)",
    "Melanoma (mel)",
    "Melanocytic nevi (nv)",
    "Vascular lesions (vasc)"
]


# ============================================================
# LOAD TENSORFLOW LITE MODEL
# ============================================================

print("Loading TensorFlow Lite model...")

interpreter = tf.lite.Interpreter(
    model_path=MODEL_PATH
)

interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

input_shape = input_details[0]["shape"]
output_shape = output_details[0]["shape"]

print("TFLite model loaded successfully!")
print("Input shape:", input_shape)
print("Output shape:", output_shape)


# ============================================================
# HOME PAGE
# ============================================================

@app.route("/")
def home():

    return send_from_directory(
        APP_FOLDER,
        "index.html"
    )


# ============================================================
# STATIC FILES
# ============================================================

@app.route("/<path:filename>")
def static_files(filename):

    return send_from_directory(
        APP_FOLDER,
        filename
    )


# ============================================================
# IMAGE PREDICTION
# ============================================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        # ----------------------------------------------------
        # CHECK IMAGE
        # ----------------------------------------------------

        if "image" not in request.files:

            return jsonify({
                "error": "No image was uploaded."
            }), 400


        file = request.files["image"]


        if file.filename == "":

            return jsonify({
                "error": "No image was selected."
            }), 400


        # ----------------------------------------------------
        # OPEN IMAGE
        # ----------------------------------------------------

        image = Image.open(file).convert("RGB")


        # ----------------------------------------------------
        # RESIZE IMAGE
        # ----------------------------------------------------

        image = image.resize(
            (224, 224)
        )


        # ----------------------------------------------------
        # CONVERT TO NUMPY
        # ----------------------------------------------------

        image_array = np.array(
            image,
            dtype=np.float32
        )


        # ----------------------------------------------------
        # NORMALIZE IMAGE
        # ----------------------------------------------------

        image_array = image_array / 255.0


        # ----------------------------------------------------
        # ADD BATCH DIMENSION
        # ----------------------------------------------------

        image_array = np.expand_dims(
            image_array,
            axis=0
        )


        # ----------------------------------------------------
        # RUN MODEL
        # ----------------------------------------------------

        interpreter.set_tensor(
            input_details[0]["index"],
            image_array
        )

        interpreter.invoke()


        # ----------------------------------------------------
        # GET OUTPUT
        # ----------------------------------------------------

        output = interpreter.get_tensor(
            output_details[0]["index"]
        )


        probabilities = output[0]


        # ----------------------------------------------------
        # SOFTMAX
        # ----------------------------------------------------

        probabilities = tf.nn.softmax(
            probabilities
        ).numpy()


        # ----------------------------------------------------
        # FIND PREDICTION
        # ----------------------------------------------------

        predicted_index = int(
            np.argmax(probabilities)
        )


        predicted_class = CLASS_NAMES[
            predicted_index
        ]


        confidence = float(
            probabilities[predicted_index] * 100
        )


        # ----------------------------------------------------
        # CREATE PROBABILITY RESULTS
        # ----------------------------------------------------

        probability_results = {}

        for i, class_name in enumerate(CLASS_NAMES):

            probability_results[class_name] = round(
                float(probabilities[i] * 100),
                2
            )


        # ----------------------------------------------------
        # SAFETY MESSAGE
        # ----------------------------------------------------

        warning = (
            "This AI prediction is for research and "
            "demonstration purposes only. It is not a "
            "medical diagnosis. Please consult a qualified "
            "healthcare professional for proper evaluation."
        )


        # ----------------------------------------------------
        # TERMINAL OUTPUT
        # ----------------------------------------------------

        print(
            "Prediction:",
            predicted_class
        )

        print(
            "Confidence:",
            round(confidence, 2),
            "%"
        )


        # ----------------------------------------------------
        # SEND RESULT TO WEBSITE
        # ----------------------------------------------------

        return jsonify({

            "success": True,

            "prediction": predicted_class,

            "confidence": round(
                confidence,
                2
            ),

            "probabilities":
                probability_results,

            "warning":
                warning

        })


    except Exception as error:

        print(
            "Prediction error:",
            str(error)
        )

        return jsonify({

            "success": False,

            "error":
                "Unable to analyze the image.",

            "details":
                str(error)

        }), 500


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/health")
def health():

    return jsonify({

        "status": "OK",

        "message":
            "Skin Cancer AI API is running."

    })


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print()
    print("====================================")
    print("      SKIN CANCER AI API")
    print("====================================")
    print()
    print("Server starting...")
    print()

    app.run(
        host="0.0.0.0",
        port=int(
            os.environ.get(
                "PORT",
                5000
            )
        ),
        debug=False
    )