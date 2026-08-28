// ==========================================
// SKIN CANCER AI - MAIN SCRIPT
// ==========================================

const imageInput = document.getElementById("imageInput");
const cameraInput = document.getElementById("cameraInput");
const previewImage = document.getElementById("previewImage");
const analyzeButton = document.getElementById("analyzeButton");
const result = document.getElementById("result");
const voiceButton = document.getElementById("voiceButton");
const languageSelect = document.getElementById("languageSelect");

let selectedImage = null;
let lastResult = null;


// ==========================================
// IMAGE PREVIEW FUNCTION
// ==========================================

function showSelectedImage(file) {

    if (!file) {
        return;
    }

    selectedImage = file;

    const imageURL = URL.createObjectURL(file);

    previewImage.src = imageURL;
    previewImage.style.display = "block";

    analyzeButton.disabled = false;

    result.innerHTML = `
        <h2>📊 Analysis Result</h2>

        <p>
            ✅ Image selected successfully.
        </p>

        <p>
            Click <strong>Analyze Image</strong>
            to start the AI analysis.
        </p>
    `;
}


// ==========================================
// GALLERY IMAGE
// ==========================================

if (imageInput) {

    imageInput.addEventListener("change", function () {

        const file = imageInput.files[0];

        showSelectedImage(file);

    });

}


// ==========================================
// CAMERA IMAGE
// ==========================================

if (cameraInput) {

    cameraInput.addEventListener("change", function () {

        const file = cameraInput.files[0];

        showSelectedImage(file);

    });

}


// ==========================================
// ANALYZE IMAGE
// ==========================================

analyzeButton.addEventListener(
    "click",
    async function () {

        if (!selectedImage) {

            result.innerHTML = `
                <h2>📊 Analysis Result</h2>

                <p>
                    ⚠️ Please select or take a photo first.
                </p>
            `;

            return;
        }


        // Show loading

        result.innerHTML = `
            <h2>📊 Analysis Result</h2>

            <h3>
                🔬 Analyzing image...
            </h3>

            <p>
                Please wait while the AI examines the image.
            </p>
        `;


        try {

            // ==================================
            // CREATE FORM DATA
            // ==================================

            const formData = new FormData();

            formData.append(
                "image",
                selectedImage
            );


            console.log(
                "Sending image to Python AI..."
            );


            // ==================================
            // SEND TO PYTHON API
            // ==================================

            const response = await fetch(
                "http://127.0.0.1:5000/predict",
                {
                    method: "POST",
                    body: formData
                }
            );


            console.log(
                "API status:",
                response.status
            );


            // ==================================
            // READ RESPONSE
            // ==================================

            const responseText =
                await response.text();

            let data;

            try {

                data = JSON.parse(responseText);

            } catch (parseError) {

                throw new Error(
                    `API returned non-JSON response (HTTP ${response.status}): ${responseText}`
                );

            }


            console.log(
                "AI response:",
                data
            );


            // ==================================
            // ERROR CHECK
            // ==================================

            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}: ${
                        data.error ||
                        data.details ||
                        responseText
                    }`
                );

            }


            // Save result

            lastResult = data;


            // ==================================
            // DISPLAY RESULT
            // ==================================

            displayResult(data);


        } catch (error) {

            console.error(
                "Prediction error:",
                error
            );


            result.innerHTML = `

                <h2>
                    📊 Analysis Result
                </h2>

                <p>
                    ❌ Unable to analyze this image.
                </p>

                <p>
                    <strong>Error:</strong>
                    ${error.message}
                </p>

                <p>
                    Please make sure the
                    Python AI server is running.
                </p>

            `;

        }

    }
);


// ==========================================
// DISPLAY RESULT
// ==========================================

function displayResult(data) {

    const confidence = Number(data.confidence);

    let output = `

        <h2>
            📊 Analysis Result
        </h2>

        <div class="prediction">

            <h3>
                🛡️ Overall AI Screening Result:
                ${data.screening_result || "Needs attention"}
            </h3>

            <h3>
                🧬 ${data.prediction}
            </h3>

            <p>
                <strong>Confidence:</strong>
                ${Number(data.confidence).toFixed(2)}%
            </p>

        </div>

        <p>
            <strong>Combined Suspicious Score:</strong>
            ${Number(data.suspicious_score || 0).toFixed(2)}%
        </p>

        <p>
            <strong>Model Explanation:</strong>
            ${data.explanation || "The result is based only on the model output."}
        </p>

        <hr>

        <h3>
            📈 Class Probabilities
        </h3>

    `;


    if (confidence < 40) {

        output += `

            <h3>
                ⚠️ Low Confidence Result
            </h3>

            <p>
                The AI is uncertain about this image because the class
                probabilities are close. This is not medical advice.
            </p>

        `;

    }


    // ======================================
    // PROBABILITIES
    // ======================================

    if (data.probabilities) {

        for (
            const [name, value]
            of Object.entries(data.probabilities)
        ) {

            output += `

                <div class="probability">

                    <p>

                        <strong>
                            ${name}
                        </strong>

                        :
                        ${Number(value).toFixed(2)}%

                    </p>

                </div>

            `;

        }

    }


    // ======================================
    // WARNING
    // ======================================

    output += `

        <hr>

        <p class="medical-warning">

            ⚠️ ${
                data.warning ||
                "This AI prediction is not a medical diagnosis. Please consult a qualified healthcare professional."
            }

        </p>

    `;


    result.innerHTML = output;

}


// ==========================================
// LANGUAGE TRANSLATIONS
// ==========================================

const translations = {

    "en-US": {
        title: "AI Analysis Result",
        prediction: "Prediction",
        confidence: "Confidence",
        warning: "This AI prediction is for research/demo purposes only and is not a substitute for professional medical advice. Please consult a qualified healthcare professional."
    },

    "te-IN": {
        title: "AI విశ్లేషణ ఫలితం",
        prediction: "అంచనా",
        confidence: "నమ్మక స్థాయి",
        warning: "ఈ AI అంచనా పరిశోధన/డెమో ప్రయోజనాల కోసం మాత్రమే. ఇది వైద్య నిర్ధారణ కాదు. దయచేసి అర్హత కలిగిన వైద్య నిపుణుడిని సంప్రదించండి."
    },

    "hi-IN": {
        title: "AI विश्लेषण परिणाम",
        prediction: "पूर्वानुमान",
        confidence: "विश्वास स्तर",
        warning: "यह AI परिणाम केवल शोध/डेमो के लिए है। यह चिकित्सीय निदान नहीं है। कृपया योग्य स्वास्थ्य विशेषज्ञ से परामर्श करें।"
    },

    "ta-IN": {
        title: "AI பகுப்பாய்வு முடிவு",
        prediction: "கணிப்பு",
        confidence: "நம்பகத்தன்மை",
        warning: "இந்த AI கணிப்பு ஆராய்ச்சி/டெமோ நோக்கங்களுக்காக மட்டுமே. இது மருத்துவ நோயறிதல் அல்ல. தகுதியான மருத்துவரை அணுகவும்."
    },

    "kn-IN": {
        title: "AI ವಿಶ್ಲೇಷಣೆಯ ಫಲಿತಾಂಶ",
        prediction: "ಅಂದಾಜು",
        confidence: "ವಿಶ್ವಾಸ ಮಟ್ಟ",
        warning: "ಈ AI ಫಲಿತಾಂಶವು ಸಂಶೋಧನೆ/ಡೆಮೊ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಮಾತ್ರ. ಇದು ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ. ಅರ್ಹ ವೈದ್ಯಕೀಯ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ."
    },

    "ml-IN": {
        title: "AI വിശകലന ഫലം",
        prediction: "പ്രവചനം",
        confidence: "വിശ്വാസ്യത",
        warning: "ഈ AI ഫലം ഗവേഷണ/ഡെമോ ആവശ്യങ്ങൾക്ക് മാത്രമുള്ളതാണ്. ഇത് മെഡിക്കൽ രോഗനിർണയമല്ല. യോഗ്യനായ ആരോഗ്യ വിദഗ്ധനെ സമീപിക്കുക."
    },

    "mr-IN": {
        title: "AI विश्लेषण निकाल",
        prediction: "अंदाज",
        confidence: "विश्वास पातळी",
        warning: "हा AI अंदाज फक्त संशोधन/डेमोसाठी आहे. हे वैद्यकीय निदान नाही. कृपया पात्र आरोग्य तज्ञांचा सल्ला घ्या."
    },

    "bn-IN": {
        title: "AI বিশ্লেষণের ফলাফল",
        prediction: "অনুমান",
        confidence: "বিশ্বাসের মাত্রা",
        warning: "এই AI ফলাফল শুধুমাত্র গবেষণা/ডেমোর জন্য। এটি চিকিৎসা নির্ণয় নয়। অনুগ্রহ করে যোগ্য স্বাস্থ্য বিশেষজ্ঞের পরামর্শ নিন।"
    },

    "gu-IN": {
        title: "AI વિશ્લેષણ પરિણામ",
        prediction: "અંદાજ",
        confidence: "વિશ્વાસ સ્તર",
        warning: "આ AI પરિણામ માત્ર સંશોધન/ડેમો માટે છે. આ તબીબી નિદાન નથી. કૃપા કરીને યોગ્ય આરોગ્ય નિષ્ણાતની સલાહ લો."
    },

    "pa-IN": {
        title: "AI ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜਾ",
        prediction: "ਅਨੁਮਾਨ",
        confidence: "ਭਰੋਸੇ ਦਾ ਪੱਧਰ",
        warning: "ਇਹ AI ਨਤੀਜਾ ਸਿਰਫ਼ ਖੋਜ/ਡੈਮੋ ਲਈ ਹੈ। ਇਹ ਡਾਕਟਰੀ ਨਿਦਾਨ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਯੋਗ ਸਿਹਤ ਮਾਹਿਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।"
    },

    "ur-IN": {
        title: "AI تجزیہ کا نتیجہ",
        prediction: "پیش گوئی",
        confidence: "اعتماد کی سطح",
        warning: "یہ AI نتیجہ صرف تحقیق/ڈیمو کے لیے ہے۔ یہ طبی تشخیص نہیں ہے۔ براہ کرم کسی مستند طبی ماہر سے مشورہ کریں۔"
    },

    "or-IN": {
        title: "AI ବିଶ୍ଳେଷଣ ଫଳାଫଳ",
        prediction: "ଅନୁମାନ",
        confidence: "ବିଶ୍ୱାସ ସ୍ତର",
        warning: "ଏହି AI ଫଳାଫଳ କେବଳ ଗବେଷଣା/ଡେମୋ ପାଇଁ। ଏହା ଡାକ୍ତରୀ ନିର୍ଣ୍ଣୟ ନୁହେଁ। ଦୟାକରି ଯୋଗ୍ୟ ସ୍ୱାସ୍ଥ୍ୟ ବିଶେଷଜ୍ଞଙ୍କ ସହ ପରାମର୍ଶ କରନ୍ତୁ।"
    },

    "as-IN": {
        title: "AI বিশ্লেষণ ফলাফল",
        prediction: "অনুমান",
        confidence: "বিশ্বাসৰ স্তৰ",
        warning: "এই AI ফলাফল কেৱল গৱেষণা/ডেমোৰ বাবে। এইটো চিকিৎসা নিৰ্ণয় নহয়। অনুগ্ৰহ কৰি যোগ্য স্বাস্থ্য বিশেষজ্ঞৰ পৰামৰ্শ লওক।"
    },

    "fr-FR": {
        title: "Résultat de l'analyse IA",
        prediction: "Prédiction",
        confidence: "Niveau de confiance",
        warning: "Cette prédiction IA est uniquement destinée à la recherche/démonstration et ne constitue pas un diagnostic médical. Consultez un professionnel de santé qualifié."
    },

    "es-ES": {
        title: "Resultado del análisis de IA",
        prediction: "Predicción",
        confidence: "Nivel de confianza",
        warning: "Esta predicción de IA es solo para investigación/demostración y no constituye un diagnóstico médico. Consulte a un profesional sanitario cualificado."
    },

    "de-DE": {
        title: "KI-Analyseergebnis",
        prediction: "Vorhersage",
        confidence: "Vertrauensniveau",
        warning: "Diese KI-Vorhersage dient nur Forschungs-/Demonstrationszwecken und ist keine medizinische Diagnose. Bitte wenden Sie sich an qualifiziertes medizinisches Fachpersonal."
    },

    "it-IT": {
        title: "Risultato dell'analisi IA",
        prediction: "Previsione",
        confidence: "Livello di affidabilità",
        warning: "Questa previsione IA è solo a scopo di ricerca/dimostrazione e non costituisce una diagnosi medica. Consultare un professionista sanitario qualificato."
    },

    "pt-PT": {
        title: "Resultado da análise de IA",
        prediction: "Previsão",
        confidence: "Nível de confiança",
        warning: "Esta previsão de IA destina-se apenas a investigação/demonstração e não constitui um diagnóstico médico. Consulte um profissional de saúde qualificado."
    },

    "ja-JP": {
        title: "AI分析結果",
        prediction: "予測",
        confidence: "信頼度",
        warning: "このAI予測は研究・デモ目的のみであり、医学的診断ではありません。資格のある医療専門家にご相談ください。"
    },

    "ko-KR": {
        title: "AI 분석 결과",
        prediction: "예측",
        confidence: "신뢰도",
        warning: "이 AI 예측은 연구/데모 목적으로만 제공되며 의학적 진단이 아닙니다. 자격을 갖춘 의료 전문가와 상담하십시오."
    },

    "zh-CN": {
        title: "AI 分析结果",
        prediction: "预测",
        confidence: "置信度",
        warning: "此 AI 预测仅用于研究/演示，不构成医学诊断。请咨询合格的医疗专业人员。"
    },

    "ru-RU": {
        title: "Результат анализа ИИ",
        prediction: "Прогноз",
        confidence: "Уровень уверенности",
        warning: "Этот прогноз ИИ предназначен только для исследований/демонстрации и не является медицинским диагнозом. Обратитесь к квалифицированному медицинскому специалисту."
    },

    "ar-SA": {
        title: "نتيجة تحليل الذكاء الاصطناعي",
        prediction: "التوقع",
        confidence: "مستوى الثقة",
        warning: "هذا التوقع بالذكاء الاصطناعي مخصص للبحث/العرض فقط وليس تشخيصًا طبيًا. يرجى استشارة أخصائي رعاية صحية مؤهل."
    }

};


// ==========================================
// VOICE ASSISTANCE
// ==========================================

voiceButton.addEventListener(
    "click",
    function () {

        const text = result.innerText;

        if (!text) {
            return;
        }

        if (!("speechSynthesis" in window)) {

            alert(
                "Voice assistance is not supported by this browser."
            );

            return;
        }


        const selectedLanguage =
            languageSelect
                ? languageSelect.value
                : "en-US";


        const speech =
            new SpeechSynthesisUtterance(text);


        speech.lang =
            selectedLanguage;


        speech.rate = 0.85;

        speech.pitch = 1;


        window.speechSynthesis.cancel();

        window.speechSynthesis.speak(
            speech
        );

    }
);


// ==========================================
// CHANGE LANGUAGE
// ==========================================

if (languageSelect) {

    languageSelect.addEventListener(
        "change",
        function () {

            if (!lastResult) {
                return;
            }

            translateResult();

        }
    );

}


// ==========================================
// TRANSLATE DISPLAYED RESULT
// ==========================================

function translateResult() {

    if (!lastResult) {
        return;
    }


    const language =
        languageSelect.value;


    const translation =
        translations[language] ||
        translations["en-US"];


    let output = `

        <h2>
            ${translation.title}
        </h2>

        <div class="prediction">

            <h3>
                🛡️ Overall AI Screening Result:
                ${lastResult.screening_result || "Needs attention"}
            </h3>

            <h3>
                🧬 ${translation.prediction}:
                ${lastResult.prediction}
            </h3>

            <p>

                <strong>
                    ${translation.confidence}:
                </strong>

                ${Number(
                    lastResult.confidence
                ).toFixed(2)}%

            </p>

        </div>

        <p>
            <strong>Combined Suspicious Score:</strong>
            ${Number(lastResult.suspicious_score || 0).toFixed(2)}%
        </p>

        <p>
            <strong>Model Explanation:</strong>
            ${lastResult.explanation || "The result is based only on the model output."}
        </p>

        <hr>

        <h3>
            📈 Class Probabilities
        </h3>

    `;


    if (lastResult.probabilities) {

        for (
            const [name, value]
            of Object.entries(
                lastResult.probabilities
            )
        ) {

            output += `

                <p>

                    <strong>
                        ${name}
                    </strong>

                    :
                    ${Number(value).toFixed(2)}%

                </p>

            `;

        }

    }


    output += `

        <hr>

        <p class="medical-warning">

            ⚠️ ${translation.warning}

        </p>

    `;


    result.innerHTML =
        output;

}


// ==========================================
// START
// ==========================================

console.log(
    "✅ Skin Cancer AI application loaded."
);

console.log(
    "✅ Gallery support enabled."
);

console.log(
    "✅ Camera support enabled."
);

console.log(
    "✅ Multilingual voice support enabled."
);

console.log(
    "✅ Python API:",
    window.location.origin
);