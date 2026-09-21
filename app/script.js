"use strict";


// =====================================================
// DOM
// =====================================================

const imageInput =
    document.getElementById("imageInput");

const cameraInput =
    document.getElementById("cameraInput");

const previewImage =
    document.getElementById("previewImage");

const previewPlaceholder =
    document.getElementById("previewPlaceholder");

const analyzeButton =
    document.getElementById("analyzeButton");

const result =
    document.getElementById("result");

const voiceButton =
    document.getElementById("voiceButton");

const languageSelect =
    document.getElementById("languageSelect");

const historyList =
    document.getElementById("historyList");

const clearHistoryButton =
    document.getElementById("clearHistoryButton");


// =====================================================
// STATE
// =====================================================

let selectedImage = null;

let lastResult = null;

let previewObjectURL = null;

const SKIN_GATE_THRESHOLD = 0.50;


// =====================================================
// MODELS
// =====================================================

let skinGateModel = null;

let cancerModel = null;


// =====================================================
// CANCER MODEL CLASS ORDER
// IMPORTANT:
// Must match trained EfficientNet model.
// =====================================================

const CANCER_CLASSES = [

    {
        key: "nv",
        name: "Melanocytic nevi",
        meaning: "Common moles or birthmarks."
    },

    {
        key: "mel",
        name: "Melanoma",
        meaning:
            "A type of skin cancer that requires professional evaluation."
    },

    {
        key: "bkl",
        name: "Benign keratosis",
        meaning:
            "A usually non-cancerous keratotic skin lesion."
    },

    {
        key: "bcc",
        name: "Basal cell carcinoma",
        meaning:
            "A type of skin cancer that requires professional evaluation."
    },

    {
        key: "akiec",
        name: "Actinic keratosis",
        meaning:
            "A sun-related skin lesion that may require medical evaluation."
    },

    {
        key: "vasc",
        name: "Vascular lesion",
        meaning:
            "A lesion involving blood vessels."
    },

    {
        key: "df",
        name: "Dermatofibroma",
        meaning:
            "A usually benign fibrous skin lesion."
    }

];


// =====================================================
// LANGUAGE
// =====================================================

function getCurrentLanguage() {

    return (
        languageSelect.value ||
        "en-US"
    );

}


function getCurrentTranslations() {

    return (
        TRANSLATIONS[getCurrentLanguage()] ||
        TRANSLATIONS["en-US"]
    );

}


// =====================================================
// LANGUAGE UI
// =====================================================

function applyLanguage() {

    const lang =
        getCurrentTranslations();


    document.title =
        lang.appTitle;


    const appTitle =
        document.getElementById("appTitle");

    const appSubtitle =
        document.getElementById("appSubtitle");


    if (appTitle) {

        appTitle.textContent =
            lang.appTitle;

    }


    if (appSubtitle) {

        appSubtitle.textContent =
            lang.subtitle;

    }


    // -------------------------------------------------
    // INTRO
    // -------------------------------------------------

    const introTitle =
        document.getElementById("introTitle");

    const introText =
        document.getElementById("introText");


    if (introTitle) {

        introTitle.textContent =
            lang.introTitle;

    }


    if (introText) {

        introText.textContent =
            lang.introText;

    }


    // -------------------------------------------------
    // IMAGE
    // -------------------------------------------------

    const chooseImageButton =
        document.getElementById(
            "chooseImageButton"
        );

    const takePhotoButton =
        document.getElementById(
            "takePhotoButton"
        );

    const previewText =
        document.getElementById(
            "previewText"
        );


    if (chooseImageButton) {

        chooseImageButton.textContent =
            lang.chooseImage;

    }


    if (takePhotoButton) {

        takePhotoButton.textContent =
            lang.takePhoto;

    }


    if (previewText) {

        previewText.textContent =
            lang.noImage;

    }


    // -------------------------------------------------
    // ANALYZE
    // -------------------------------------------------

    if (analyzeButton) {

        analyzeButton.textContent =
            lang.analyze;

    }


    // -------------------------------------------------
    // VOICE
    // -------------------------------------------------

    if (voiceButton) {

        voiceButton.textContent =
            lang.listen;

    }


    // -------------------------------------------------
    // HISTORY
    // -------------------------------------------------

    const historyTitle =
        document.getElementById(
            "historyTitle"
        );

    const clearHistoryText =
        document.getElementById(
            "clearHistoryText"
        );


    if (historyTitle) {

        historyTitle.textContent =
            lang.historyTitle;

    }


    if (clearHistoryText) {

        clearHistoryText.textContent =
            lang.clearHistory;

    }


    // -------------------------------------------------
    // HISTORY
    // -------------------------------------------------

    updateHistoryLanguage(
        lang
    );


    // -------------------------------------------------
    // CURRENT RESULT
    // -------------------------------------------------

    if (lastResult) {

        displayCancerResult(
            lastResult
        );

    }

}


// =====================================================
// HISTORY LANGUAGE
// =====================================================

function updateHistoryLanguage(lang) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "skinAnalysisHistory"
            ) || "[]"
        );


    if (history.length === 0) {

        historyList.innerHTML = `

            <p id="noHistoryText">
                ${lang.noHistory}
            </p>

        `;

        return;

    }


    historyList.innerHTML =
        history.map(item => {

            const confidence =
                (
                    item.confidence *
                    100
                ).toFixed(2);


            return `

                <div class="history-item">

                    <div class="history-result-name">

                        ${getLocalizedClassName(
                            item.key,
                            item.name,
                            lang
                        )}

                    </div>


                    <div class="history-confidence">

                        ${lang.aiConfidence}:
                        ${confidence}%

                    </div>


                    <small>

                        ${item.date}

                    </small>

                </div>

            `;

        }).join("");

}


// =====================================================
// LOCALIZED LESION NAME
// =====================================================

function getLocalizedClassName(
    key,
    fallbackName,
    lang
) {

    if (

        typeof LESION_TRANSLATIONS !==
        "undefined" &&

        LESION_TRANSLATIONS[
            getCurrentLanguage()
        ] &&

        LESION_TRANSLATIONS[
            getCurrentLanguage()
        ][key]

    ) {

        return LESION_TRANSLATIONS[
            getCurrentLanguage()
        ][key].name;

    }


    return fallbackName;

}


// =====================================================
// LOCALIZED LESION MEANING
// =====================================================

function getLocalizedMeaning(
    key,
    fallbackMeaning,
    lang
) {

    if (

        typeof LESION_TRANSLATIONS !==
        "undefined" &&

        LESION_TRANSLATIONS[
            getCurrentLanguage()
        ] &&

        LESION_TRANSLATIONS[
            getCurrentLanguage()
        ][key]

    ) {

        return LESION_TRANSLATIONS[
            getCurrentLanguage()
        ][key].meaning;

    }


    return fallbackMeaning;

}


// =====================================================
// LANGUAGE CHANGE
// =====================================================

languageSelect.addEventListener(
    "change",
    () => {

        applyLanguage();

        renderHistory();

    }
);


// =====================================================
// IMAGE SELECTION
// =====================================================

function showSelectedImage(file) {

    if (!file) {

        return;

    }


    if (!file.type.startsWith("image/")) {

        alert(
            "Please select an image."
        );

        return;

    }


    selectedImage =
        file;


    // -------------------------------------------------
    // Revoke old preview URL
    // -------------------------------------------------

    if (previewObjectURL) {

        URL.revokeObjectURL(
            previewObjectURL
        );

        previewObjectURL =
            null;

    }


    // -------------------------------------------------
    // Create preview
    // -------------------------------------------------

    previewObjectURL =
        URL.createObjectURL(
            file
        );


    previewImage.src =
        previewObjectURL;


    previewImage.style.display =
        "block";


    previewPlaceholder.style.display =
        "none";


    // -------------------------------------------------
    // Enable analysis
    // -------------------------------------------------

    analyzeButton.disabled =
        false;


    // -------------------------------------------------
    // Voice unavailable
    // -------------------------------------------------

    voiceButton.disabled =
        true;


    // -------------------------------------------------
    // Clear old result
    // -------------------------------------------------

    result.innerHTML =
        `

        <div class="result-placeholder">

            <span class="result-placeholder-icon">
                📊
            </span>

            <h2>
                ${getCurrentTranslations().resultTitle ||
                "Result"}
            </h2>

            <p>
                ${getCurrentTranslations().resultPlaceholderText ||
                "Your screening result will appear here."}
            </p>

        </div>

        `;


    lastResult =
        null;


    console.log(
        "Selected image:",
        file.name
    );

}


// =====================================================
// GALLERY
// =====================================================

imageInput.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files[0];

        if (file) {

            showSelectedImage(
                file
            );

        }

    }
);


// =====================================================
// CAMERA
// =====================================================

cameraInput.addEventListener(
    "change",
    () => {

        const file =
            cameraInput.files[0];

        if (file) {

            showSelectedImage(
                file
            );

        }

    }
);


// =====================================================
// LOAD MODELS
// =====================================================

async function loadModels() {

    try {

        console.log(
            "Initializing SkinCare AI..."
        );


        if (!window.tflite) {

            throw new Error(
                "TFLite runtime not found."
            );

        }


        window.tflite.setWasmPath(
            "./wasm/"
        );


        // -------------------------------------------------
        // SKIN GATE
        // -------------------------------------------------

        console.log(
            "Loading skin gate..."
        );


        skinGateModel =
            await window.tflite.loadTFLiteModel(
                "./model/skin_gate.tflite"
            );


        console.log(
            "Skin gate loaded."
        );


        // -------------------------------------------------
        // CANCER MODEL
        // -------------------------------------------------

        console.log(
            "Loading cancer model..."
        );


        cancerModel =
            await window.tflite.loadTFLiteModel(
                "./model/skin_cancer_efficientnet.tflite"
            );


        console.log(
            "Cancer model loaded."
        );


        analyzeButton.disabled =
            !selectedImage;


        console.log(
            "All models loaded successfully."
        );


    } catch (error) {

        console.error(
            "Model loading failed:",
            error
        );


        analyzeButton.disabled =
            true;


        result.innerHTML = `

            <div class="error-result">

                <div class="result-icon">
                    ⚠️
                </div>

                <h3>
                    Model loading failed
                </h3>

                <p>
                    The AI models could not be loaded.
                    Please refresh the page and try again.
                </p>

            </div>

        `;

    }

}


// =====================================================
// IMAGE → TENSOR
// =====================================================

async function imageToTensor(file) {

    const bitmap =
        await createImageBitmap(
            file
        );


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        224;

    canvas.height =
        224;


    const ctx =
        canvas.getContext(
            "2d"
        );


    if (!ctx) {

        bitmap.close();

        throw new Error(
            "Could not create canvas context."
        );

    }


    ctx.drawImage(
        bitmap,
        0,
        0,
        224,
        224
    );


    const imageData =
        ctx.getImageData(
            0,
            0,
            224,
            224
        );


    const pixels =
        imageData.data;


    const tensorData =
        new Float32Array(
            224 *
            224 *
            3
        );


    let index =
        0;


    for (
        let i = 0;
        i < pixels.length;
        i += 4
    ) {

        tensorData[index++] =
            pixels[i];

        tensorData[index++] =
            pixels[i + 1];

        tensorData[index++] =
            pixels[i + 2];

    }


    bitmap.close();


    return tf.tensor(
        tensorData,
        [1, 224, 224, 3],
        "float32"
    );

}


// =====================================================
// SKIN GATE
// =====================================================

async function checkIfSkin(file) {

    console.log(
        "Running skin gate..."
    );


    const inputTensor =
        await imageToTensor(
            file
        );


    const gateInput =
        inputTensor
            .div(127.5)
            .sub(1);


    const outputTensor =
        skinGateModel.predict(
            gateInput
        );


    const outputData =
        await outputTensor.data();


    const score =
        Number(
            outputData[0]
        );


    inputTensor.dispose();

    gateInput.dispose();

    outputTensor.dispose();


    console.log(
        "Skin gate score:",
        score
    );


    return score;

}


// =====================================================
// CANCER MODEL
// =====================================================

async function predictCancer(file) {

    console.log(
        "Running EfficientNet skin analysis..."
    );


    const inputTensor =
        await imageToTensor(
            file
        );


    const outputTensor =
        cancerModel.predict(
            inputTensor
        );


    const outputData =
        await outputTensor.data();


    inputTensor.dispose();

    outputTensor.dispose();


    if (outputData.length !== 7) {

        throw new Error(
            "Cancer model returned an unexpected number of classes."
        );

    }


    let highestIndex =
        0;


    for (
        let i = 1;
        i < outputData.length;
        i++
    ) {

        if (
            outputData[i] >
            outputData[highestIndex]
        ) {

            highestIndex =
                i;

        }

    }


    const predictedClass =
        CANCER_CLASSES[
            highestIndex
        ];


    if (!predictedClass) {

        throw new Error(
            "Invalid cancer model class index."
        );

    }


    const confidence =
        Number(
            outputData[
                highestIndex
            ]
        );


    return {

        index:
            highestIndex,

        key:
            predictedClass.key,

        name:
            predictedClass.name,

        meaning:
            predictedClass.meaning,

        confidence:
            confidence

    };

}


// =====================================================
// SAVE HISTORY
// =====================================================

function saveAnalysisToHistory(
    prediction
) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "skinAnalysisHistory"
            ) || "[]"
        );


    const item = {

        name:
            prediction.name,

        key:
            prediction.key,

        confidence:
            prediction.confidence,

        date:
            new Date().toLocaleString()

    };


    history.unshift(
        item
    );


    localStorage.setItem(
        "skinAnalysisHistory",
        JSON.stringify(
            history.slice(
                0,
                20
            )
        )
    );


    renderHistory();

}


// =====================================================
// RENDER HISTORY
// =====================================================

function renderHistory() {

    updateHistoryLanguage(
        getCurrentTranslations()
    );

}


// =====================================================
// DISPLAY RESULT
// =====================================================

function displayCancerResult(
    prediction
) {

    const lang =
        getCurrentTranslations();


    const confidencePercent =
        (
            prediction.confidence *
            100
        ).toFixed(2);


    const className =
        getLocalizedClassName(
            prediction.key,
            prediction.name,
            lang
        );


    const meaning =
        getLocalizedMeaning(
            prediction.key,
            prediction.meaning,
            lang
        );


    const suspicious =
        prediction.key === "mel" ||
        prediction.key === "bcc" ||
        prediction.key === "akiec";


    // -------------------------------------------------
    // Suspicious result
    // -------------------------------------------------

    if (suspicious) {

        result.innerHTML = `

            <div class="analysis-result suspicious-result">

                <div class="result-top">

                    <div class="result-icon warning-icon">
                        ⚠️
                    </div>

                    <div>

                        <div class="result-label">
                            AI screening result
                        </div>

                        <h2>
                            ${className}
                        </h2>

                    </div>

                </div>


                <div class="confidence-box">

                    <span>
                        ${lang.aiConfidence}
                    </span>

                    <strong>
                        ${confidencePercent}%
                    </strong>

                </div>


                <div class="result-explanation">

                    <h3>
                        What this means
                    </h3>

                    <p>
                        ${meaning}
                    </p>

                </div>


                <div class="medical-warning">

                    <h3>
                        ⚠️ Important
                    </h3>

                    <p>
                        ${lang.screeningNotice}
                    </p>

                    <p>
                        ${lang.consultDoctor}
                    </p>

                </div>

            </div>

        `;

        return;

    }


    // -------------------------------------------------
    // Normal / lower-risk result
    // -------------------------------------------------

    result.innerHTML = `

        <div class="analysis-result normal-result">

            <div class="result-top">

                <div class="result-icon normal-icon">
                    🔬
                </div>

                <div>

                    <div class="result-label">
                        AI screening result
                    </div>

                    <h2>
                        ${className}
                    </h2>

                </div>

            </div>


            <div class="confidence-box">

                <span>
                    ${lang.aiConfidence}
                </span>

                <strong>
                    ${confidencePercent}%
                </strong>

            </div>


            <div class="result-explanation">

                <h3>
                    What this means
                </h3>

                <p>
                    ${meaning}
                </p>

            </div>


            <div class="medical-info">

                <p>
                    ${lang.screeningNotice}
                </p>

            </div>

        </div>

    `;

}


// =====================================================
// ANALYZE
// =====================================================

analyzeButton.addEventListener(
    "click",
    async () => {

        if (!selectedImage) {

            return;

        }


        const lang =
            getCurrentTranslations();


        if (
            !skinGateModel ||
            !cancerModel
        ) {

            result.innerHTML = `

                <div class="loading-result">

                    <div class="loading-icon">
                        ⏳
                    </div>

                    <h3>
                        ${lang.analyzing}
                    </h3>

                    <p>
                        ${lang.pleaseWait}
                    </p>

                </div>

            `;

            return;

        }


        analyzeButton.disabled =
            true;

        voiceButton.disabled =
            true;


        // -------------------------------------------------
        // ANALYZING
        // -------------------------------------------------

        result.innerHTML = `

            <div class="loading-result">

                <div class="loading-icon">
                    🔍
                </div>

                <h3>
                    ${lang.analyzing}
                </h3>

                <p>
                    ${lang.pleaseWait}
                </p>

            </div>

        `;


        try {

            // =============================================
            // STEP 1 — SKIN GATE
            // =============================================

            const skinScore =
                await checkIfSkin(
                    selectedImage
                );


            // =============================================
            // STEP 2 — NON-SKIN
            // =============================================

            if (
                skinScore <
                SKIN_GATE_THRESHOLD
            ) {

                console.log(
                    "Image rejected by skin gate."
                );


                result.innerHTML = `

                    <div class="analysis-result non-skin-result">

                        <div class="result-icon">
                            🖼️
                        </div>

                        <h2>
                            ${lang.skinWarningTitle}
                        </h2>

                        <p>
                            ${lang.skinWarningText}
                        </p>

                        <div class="medical-info">

                            <p>
                                ${lang.skinWarningAction}
                            </p>

                        </div>

                    </div>

                `;


                lastResult =
                    null;


                return;

            }


            // =============================================
            // STEP 3 — SKIN DETECTED
            // =============================================

            result.innerHTML = `

                <div class="loading-result">

                    <div class="loading-icon">
                        🧬
                    </div>

                    <h3>
                        ${lang.skinDetected}
                    </h3>

                    <p>
                        ${lang.runningAnalysis}
                    </p>

                </div>

            `;


            // =============================================
            // STEP 4 — CANCER MODEL
            // =============================================

            const prediction =
                await predictCancer(
                    selectedImage
                );


            // =============================================
            // STEP 5 — DISPLAY
            // =============================================

            lastResult =
                prediction;


            displayCancerResult(
                prediction
            );


            // =============================================
            // STEP 6 — HISTORY
            // =============================================

            saveAnalysisToHistory(
                prediction
            );


            // =============================================
            // STEP 7 — VOICE
            // =============================================

            voiceButton.disabled =
                false;

        } catch (error) {

            console.error(
                "Analysis failed:",
                error
            );


            lastResult =
                null;


            result.innerHTML = `

                <div class="error-result">

                    <div class="result-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to analyze this image
                    </h2>

                    <p>
                        Something went wrong while
                        processing the image.
                    </p>

                    <p>
                        Please try another clear
                        skin image.
                    </p>

                </div>

            `;

        } finally {

            analyzeButton.disabled =
                false;

        }

    }
);


// =====================================================
// CLEAR HISTORY
// =====================================================

clearHistoryButton.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "skinAnalysisHistory"
        );


        historyList.innerHTML = `

            <p id="noHistoryText">
                ${getCurrentTranslations().noHistory}
            </p>

        `;

    }
);


// =====================================================
// OFFLINE VOICE
// =====================================================

const AUDIO_FOLDERS = {

    "en-US": "en-US",

    "te-IN": "te-IN",
    "hi-IN": "hi-IN",
    "ta-IN": "ta-IN",
    "kn-IN": "kn-IN",
    "ml-IN": "ml-IN",
    "mr-IN": "mr-IN",
    "bn-IN": "bn-IN",
    "gu-IN": "gu-IN",
    "pa-IN": "pa-IN",
    "ur-IN": "ur-IN",
    "or-IN": "or-IN",

    "fr-FR": "fr-FR",
    "es-ES": "es-ES",
    "de-DE": "de-DE",
    "it-IT": "it-IT",
    "pt-PT": "pt-PT",

    "ja-JP": "ja-JP",
    "ko-KR": "ko-KR",
    "ru-RU": "ru-RU",
    "ar-SA": "ar-SA"

};


let currentAudio =
    null;


// =====================================================
// VOICE BUTTON
// =====================================================

voiceButton.addEventListener(
    "click",
    async () => {

        if (!lastResult) {

            return;

        }


        const language =
            getCurrentLanguage();


        const folder =
            AUDIO_FOLDERS[
                language
            ];


        if (!folder) {

            console.error(
                "No audio folder for:",
                language
            );

            return;

        }


        const audioPath =
            `audio/${folder}/result.wav`;


        try {

            if (currentAudio) {

                currentAudio.pause();

                currentAudio.currentTime =
                    0;

                currentAudio =
                    null;

            }


            currentAudio =
                new Audio(
                    audioPath
                );


            voiceButton.disabled =
                true;


            currentAudio.onplay =
                () => {

                    console.log(
                        "Playing:",
                        audioPath
                    );

                };


            currentAudio.onended =
                () => {

                    voiceButton.disabled =
                        false;

                    currentAudio =
                        null;

                };


            currentAudio.onerror =
                () => {

                    console.error(
                        "Audio could not be played:",
                        audioPath
                    );

                    voiceButton.disabled =
                        false;

                    currentAudio =
                        null;

                };


            await currentAudio.play();

        } catch (error) {

            console.error(
                "Voice playback failed:",
                error
            );

            voiceButton.disabled =
                false;

            currentAudio =
                null;

        }

    }
);


// =====================================================
// START APP
// =====================================================

applyLanguage();

renderHistory();

loadModels();


console.log(
    "SkinCare AI JavaScript loaded successfully."
);