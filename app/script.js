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
// DEPLOYED API
// ==========================================

const API_URL = window.location.origin;


// ==========================================
// IMAGE PREVIEW
// ==========================================

function showSelectedImage(file) {

    if (!file) return;

    selectedImage = file;

    const imageURL = URL.createObjectURL(file);

    previewImage.src = imageURL;
    previewImage.style.display = "block";

    analyzeButton.disabled = false;

    result.innerHTML = `
        <h2>📊 Analysis Result</h2>

        <p>✅ Image selected successfully.</p>

        <p>
            Click <strong>Analyze Image</strong>
            to start the AI analysis.
        </p>
    `;
}


// ==========================================
// GALLERY
// ==========================================

if (imageInput) {

    imageInput.addEventListener("change", function () {

        const file = imageInput.files[0];

        showSelectedImage(file);

    });
}


// ==========================================
// CAMERA
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

if (analyzeButton) {

    analyzeButton.addEventListener("click", async function () {

        if (!selectedImage) {

            result.innerHTML = `
                <h2>📊 Analysis Result</h2>
                <p>⚠️ Please select or take a photo first.</p>
            `;

            return;
        }

        result.innerHTML = `
            <h2>📊 Analysis Result</h2>

            <h3>🔬 Analyzing image...</h3>

            <p>
                Please wait while the AI examines the image.
            </p>
        `;

        try {

            const formData = new FormData();

            formData.append("image", selectedImage);

            console.log("📤 Sending image to AI API...");

            const response = await fetch(
                `${API_URL}/predict`,
                {
                    method: "POST",
                    body: formData
                }
            );

            console.log(
                "API status:",
                response.status
            );

            const responseText =
                await response.text();

            let data;

            try {

                data = JSON.parse(responseText);

            } catch (error) {

                throw new Error(
                    `API returned non-JSON response (HTTP ${response.status})`
                );

            }

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.details ||
                    `HTTP ${response.status}`
                );

            }

            lastResult = data;

            displayResult(data);

        } catch (error) {

            console.error(
                "❌ Prediction error:",
                error
            );

            result.innerHTML = `

                <h2>📊 Analysis Result</h2>

                <p>
                    ❌ Unable to analyze this image.
                </p>

                <p>
                    <strong>Error:</strong>
                    ${error.message}
                </p>

            `;
        }

    });
}


// ==========================================
// DISPLAY RESULT
// ==========================================

function displayResult(data) {

    const confidence =
        Number(data.confidence || 0);

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
                🧬 ${data.prediction || "Unknown"}
            </h3>

            <p>
                <strong>Confidence:</strong>
                ${confidence.toFixed(2)}%
            </p>

        </div>

        <p>
            <strong>
                Combined Suspicious Score:
            </strong>

            ${Number(
                data.suspicious_score || 0
            ).toFixed(2)}%
        </p>

        <p>
            <strong>
                Model Explanation:
            </strong>

            ${
                data.explanation ||
                "The result is based only on the model output."
            }
        </p>

        <hr>

        <h3>
            📈 Class Probabilities
        </h3>

    `;


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
// TRANSLATIONS
// ==========================================

const translations = {

    "en-US": {
        title: "AI Analysis Result",
        screening: "Overall AI Screening Result",
        prediction: "Prediction",
        confidence: "Confidence",
        suspicious: "Combined Suspicious Score",
        explanation: "Model Explanation",
        probabilities: "Class Probabilities",
        warning:
            "This AI prediction is for research and demonstration purposes only. It is not a medical diagnosis. Please consult a qualified healthcare professional."
    },

    "te-IN": {
        title: "AI విశ్లేషణ ఫలితం",
        screening: "AI స్క్రీనింగ్ ఫలితం",
        prediction: "అంచనా",
        confidence: "నమ్మక స్థాయి",
        suspicious: "అనుమానాస్పద స్కోర్",
        explanation: "మోడల్ వివరణ",
        probabilities: "తరగతి సంభావ్యతలు",
        warning:
            "ఈ AI ఫలితం పరిశోధన మరియు ప్రదర్శన ప్రయోజనాల కోసం మాత్రమే. ఇది వైద్య నిర్ధారణ కాదు. దయచేసి అర్హత కలిగిన వైద్య నిపుణుడిని సంప్రదించండి."
    },

    "hi-IN": {
        title: "AI विश्लेषण परिणाम",
        screening: "AI स्क्रीनिंग परिणाम",
        prediction: "पूर्वानुमान",
        confidence: "विश्वास स्तर",
        suspicious: "संदिग्ध स्कोर",
        explanation: "मॉडल विवरण",
        probabilities: "श्रेणी संभावनाएं",
        warning:
            "यह AI परिणाम केवल शोध और प्रदर्शन के लिए है। यह चिकित्सीय निदान नहीं है। कृपया योग्य स्वास्थ्य विशेषज्ञ से परामर्श करें।"
    },

    "ta-IN": {
        title: "AI பகுப்பாய்வு முடிவு",
        screening: "AI பரிசோதனை முடிவு",
        prediction: "கணிப்பு",
        confidence: "நம்பகத்தன்மை",
        suspicious: "சந்தேக மதிப்பெண்",
        explanation: "மாதிரி விளக்கம்",
        probabilities: "வகுப்பு சாத்தியக்கூறுகள்",
        warning:
            "இந்த AI முடிவு ஆராய்ச்சி மற்றும் விளக்க நோக்கங்களுக்காக மட்டுமே. இது மருத்துவ நோயறிதல் அல்ல. தகுதியான மருத்துவரை அணுகவும்."
    },

    "kn-IN": {
        title: "AI ವಿಶ್ಲೇಷಣೆಯ ಫಲಿತಾಂಶ",
        screening: "AI ಪರಿಶೀಲನಾ ಫಲಿತಾಂಶ",
        prediction: "ಅಂದಾಜು",
        confidence: "ವಿಶ್ವಾಸ ಮಟ್ಟ",
        suspicious: "ಅನುಮಾನಾಸ್ಪದ ಅಂಕ",
        explanation: "ಮಾದರಿ ವಿವರಣೆ",
        probabilities: "ವರ್ಗ ಸಾಧ್ಯತೆಗಳು",
        warning:
            "ಈ AI ಫಲಿತಾಂಶವು ಸಂಶೋಧನೆ ಮತ್ತು ಪ್ರದರ್ಶನ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಮಾತ್ರ. ಇದು ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ. ಅರ್ಹ ವೈದ್ಯಕೀಯ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ."
    },

    "ml-IN": {
        title: "AI വിശകലന ഫലം",
        screening: "AI പരിശോധന ഫലം",
        prediction: "പ്രവചനം",
        confidence: "വിശ്വാസ്യത",
        suspicious: "സംശയ സ്കോർ",
        explanation: "മോഡൽ വിശദീകരണം",
        probabilities: "ക്ലാസ് സാധ്യതകൾ",
        warning:
            "ഈ AI ഫലം ഗവേഷണത്തിനും പ്രദർശനത്തിനുമായി മാത്രമാണ്. ഇത് മെഡിക്കൽ രോഗനിർണയമല്ല. യോഗ്യനായ ആരോഗ്യ വിദഗ്ധനെ സമീപിക്കുക."
    },

    "mr-IN": {
        title: "AI विश्लेषण निकाल",
        screening: "AI तपासणी निकाल",
        prediction: "अंदाज",
        confidence: "विश्वास पातळी",
        suspicious: "संशयास्पद गुण",
        explanation: "मॉडेल स्पष्टीकरण",
        probabilities: "वर्ग संभाव्यता",
        warning:
            "हा AI निकाल फक्त संशोधन आणि प्रात्यक्षिकासाठी आहे. हे वैद्यकीय निदान नाही. कृपया पात्र आरोग्य तज्ञांचा सल्ला घ्या."
    },

    "bn-IN": {
        title: "AI বিশ্লেষণের ফলাফল",
        screening: "AI স্ক্রিনিং ফলাফল",
        prediction: "অনুমান",
        confidence: "বিশ্বাসের মাত্রা",
        suspicious: "সন্দেহজনক স্কোর",
        explanation: "মডেল ব্যাখ্যা",
        probabilities: "শ্রেণির সম্ভাবনা",
        warning:
            "এই AI ফলাফল শুধুমাত্র গবেষণা এবং প্রদর্শনের জন্য। এটি চিকিৎসা নির্ণয় নয়। অনুগ্রহ করে যোগ্য স্বাস্থ্য বিশেষজ্ঞের পরামর্শ নিন।"
    },

    "gu-IN": {
        title: "AI વિશ્લેષણ પરિણામ",
        screening: "AI સ્ક્રીનિંગ પરિણામ",
        prediction: "અંદાજ",
        confidence: "વિશ્વાસ સ્તર",
        suspicious: "શંકાસ્પદ સ્કોર",
        explanation: "મોડેલ સમજૂતી",
        probabilities: "વર્ગ સંભાવનાઓ",
        warning:
            "આ AI પરિણામ માત્ર સંશોધન અને પ્રદર્શન માટે છે. આ તબીબી નિદાન નથી. કૃપા કરીને યોગ્ય આરોગ્ય નિષ્ણાતની સલાહ લો."
    },

    "pa-IN": {
        title: "AI ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜਾ",
        screening: "AI ਸਕ੍ਰੀਨਿੰਗ ਨਤੀਜਾ",
        prediction: "ਅਨੁਮਾਨ",
        confidence: "ਭਰੋਸੇ ਦਾ ਪੱਧਰ",
        suspicious: "ਸ਼ੱਕੀ ਸਕੋਰ",
        explanation: "ਮਾਡਲ ਵਿਆਖਿਆ",
        probabilities: "ਸ਼੍ਰੇਣੀ ਸੰਭਾਵਨਾਵਾਂ",
        warning:
            "ਇਹ AI ਨਤੀਜਾ ਸਿਰਫ਼ ਖੋਜ ਅਤੇ ਪ੍ਰਦਰਸ਼ਨ ਲਈ ਹੈ। ਇਹ ਡਾਕਟਰੀ ਨਿਦਾਨ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਯੋਗ ਸਿਹਤ ਮਾਹਿਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।"
    },

    "ur-IN": {
        title: "AI تجزیہ کا نتیجہ",
        screening: "AI اسکریننگ کا نتیجہ",
        prediction: "پیش گوئی",
        confidence: "اعتماد کی سطح",
        suspicious: "مشکوک اسکور",
        explanation: "ماڈل کی وضاحت",
        probabilities: "کلاس کے امکانات",
        warning:
            "یہ AI نتیجہ صرف تحقیق اور مظاہرے کے لیے ہے۔ یہ طبی تشخیص نہیں ہے۔ براہ کرم کسی مستند طبی ماہر سے مشورہ کریں۔"
    },

    "or-IN": {
        title: "AI ବିଶ୍ଳେଷଣ ଫଳାଫଳ",
        screening: "AI ସ୍କ୍ରିନିଂ ଫଳାଫଳ",
        prediction: "ଅନୁମାନ",
        confidence: "ବିଶ୍ୱାସ ସ୍ତର",
        suspicious: "ସନ୍ଦେହଜନକ ସ୍କୋର",
        explanation: "ମଡେଲ ବ୍ୟାଖ୍ୟା",
        probabilities: "ଶ୍ରେଣୀ ସମ୍ଭାବନା",
        warning:
            "ଏହି AI ଫଳାଫଳ କେବଳ ଗବେଷଣା ଏବଂ ପ୍ରଦର୍ଶନ ପାଇଁ। ଏହା ଡାକ୍ତରୀ ନିର୍ଣ୍ଣୟ ନୁହେଁ। ଦୟାକରି ଯୋଗ୍ୟ ସ୍ୱାସ୍ଥ୍ୟ ବିଶେଷଜ୍ଞଙ୍କ ସହ ପରାମର୍ଶ କରନ୍ତୁ।"
    },

    "fr-FR": {
        title: "Résultat de l'analyse IA",
        screening: "Résultat du dépistage IA",
        prediction: "Prédiction",
        confidence: "Niveau de confiance",
        suspicious: "Score suspect",
        explanation: "Explication du modèle",
        probabilities: "Probabilités des classes",
        warning:
            "Cette prédiction IA est uniquement destinée à la recherche et à la démonstration. Elle ne constitue pas un diagnostic médical."
    },

    "es-ES": {
        title: "Resultado del análisis de IA",
        screening: "Resultado de detección de IA",
        prediction: "Predicción",
        confidence: "Nivel de confianza",
        suspicious: "Puntuación sospechosa",
        explanation: "Explicación del modelo",
        probabilities: "Probabilidades de clase",
        warning:
            "Esta predicción de IA es solo para investigación y demostración. No constituye un diagnóstico médico."
    },

    "de-DE": {
        title: "KI-Analyseergebnis",
        screening: "KI-Screening-Ergebnis",
        prediction: "Vorhersage",
        confidence: "Vertrauensniveau",
        suspicious: "Verdachtswert",
        explanation: "Modellerklärung",
        probabilities: "Klassenwahrscheinlichkeiten",
        warning:
            "Diese KI-Vorhersage dient nur Forschungs- und Demonstrationszwecken. Sie ist keine medizinische Diagnose."
    },

    "it-IT": {
        title: "Risultato dell'analisi IA",
        screening: "Risultato dello screening IA",
        prediction: "Previsione",
        confidence: "Livello di affidabilità",
        suspicious: "Punteggio sospetto",
        explanation: "Spiegazione del modello",
        probabilities: "Probabilità delle classi",
        warning:
            "Questa previsione IA è solo a scopo di ricerca e dimostrazione. Non costituisce una diagnosi medica."
    },

    "pt-PT": {
        title: "Resultado da análise de IA",
        screening: "Resultado da triagem de IA",
        prediction: "Previsão",
        confidence: "Nível de confiança",
        suspicious: "Pontuação suspeita",
        explanation: "Explicação do modelo",
        probabilities: "Probabilidades das classes",
        warning:
            "Esta previsão de IA destina-se apenas a investigação e demonstração. Não constitui um diagnóstico médico."
    },

    "ja-JP": {
        title: "AI分析結果",
        screening: "AIスクリーニング結果",
        prediction: "予測",
        confidence: "信頼度",
        suspicious: "疑わしいスコア",
        explanation: "モデルの説明",
        probabilities: "クラス確率",
        warning:
            "このAI予測は研究およびデモ目的のみであり、医学的診断ではありません。"
    },

    "ko-KR": {
        title: "AI 분석 결과",
        screening: "AI 검사 결과",
        prediction: "예측",
        confidence: "신뢰도",
        suspicious: "의심 점수",
        explanation: "모델 설명",
        probabilities: "클래스 확률",
        warning:
            "이 AI 결과는 연구 및 데모 목적으로만 제공되며 의학적 진단이 아닙니다."
    },

    "zh-CN": {
        title: "AI 分析结果",
        screening: "AI 筛查结果",
        prediction: "预测",
        confidence: "置信度",
        suspicious: "可疑评分",
        explanation: "模型说明",
        probabilities: "类别概率",
        warning:
            "此 AI 预测仅用于研究和演示，不构成医学诊断。"
    },

    "ru-RU": {
        title: "Результат анализа ИИ",
        screening: "Результат ИИ-скрининга",
        prediction: "Прогноз",
        confidence: "Уровень уверенности",
        suspicious: "Подозрительный балл",
        explanation: "Объяснение модели",
        probabilities: "Вероятности классов",
        warning:
            "Этот прогноз ИИ предназначен только для исследований и демонстрации и не является медицинским диагнозом."
    },

    "ar-SA": {
        title: "نتيجة تحليل الذكاء الاصطناعي",
        screening: "نتيجة فحص الذكاء الاصطناعي",
        prediction: "التوقع",
        confidence: "مستوى الثقة",
        suspicious: "درجة الاشتباه",
        explanation: "شرح النموذج",
        probabilities: "احتمالات الفئات",
        warning:
            "هذا التوقع بالذكاء الاصطناعي مخصص للبحث والعرض فقط وليس تشخيصًا طبيًا."
    }
};


// ==========================================
// TRANSLATE RESULT
// ==========================================

function translateResult() {

    if (!lastResult || !languageSelect) return;

    const language =
        languageSelect.value;

    const t =
        translations[language] ||
        translations["en-US"];

    let output = `

        <h2>
            ${t.title}
        </h2>

        <div class="prediction">

            <h3>
                🛡️ ${t.screening}:
                ${lastResult.screening_result || "Needs attention"}
            </h3>

            <h3>
                🧬 ${t.prediction}:
                ${lastResult.prediction || "Unknown"}
            </h3>

            <p>
                <strong>
                    ${t.confidence}:
                </strong>

                ${Number(
                    lastResult.confidence || 0
                ).toFixed(2)}%
            </p>

        </div>

        <p>
            <strong>
                ${t.suspicious}:
            </strong>

            ${Number(
                lastResult.suspicious_score || 0
            ).toFixed(2)}%
        </p>

        <p>
            <strong>
                ${t.explanation}:
            </strong>

            ${lastResult.explanation || ""}
        </p>

        <hr>

        <h3>
            📈 ${t.probabilities}
        </h3>
    `;


    if (lastResult.probabilities) {

        for (
            const [name, value]
            of Object.entries(lastResult.probabilities)
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

            ⚠️ ${t.warning}

        </p>
    `;


    result.innerHTML = output;
}


// ==========================================
// LANGUAGE CHANGE
// ==========================================

if (languageSelect) {

    languageSelect.addEventListener(
        "change",
        function () {

            if (!lastResult) return;

            translateResult();

            // Stop current speech
            if (
                "speechSynthesis" in window
            ) {

                window.speechSynthesis.cancel();

            }

        }
    );
}


// ==========================================
// VOICE LIST
// ==========================================

let availableVoices = [];

function loadVoices() {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }

    availableVoices =
        window.speechSynthesis.getVoices();

    console.log(
        "Available voices:",
        availableVoices
    );
}


if ("speechSynthesis" in window) {

    loadVoices();

    window.speechSynthesis
        .addEventListener(
            "voiceschanged",
            loadVoices
        );
}


// ==========================================
// FIND BEST VOICE
// ==========================================

function findBestVoice(language) {

    if (!availableVoices.length) {

        availableVoices =
            window.speechSynthesis.getVoices();

    }

    if (!availableVoices.length) {
        return null;
    }


    // Exact match first

    let voice =
        availableVoices.find(
            v =>
                v.lang &&
                v.lang.toLowerCase() ===
                language.toLowerCase()
        );


    if (voice) return voice;


    // Same language family

    const languageCode =
        language
            .split("-")[0]
            .toLowerCase();

    voice =
        availableVoices.find(
            v =>
                v.lang &&
                v.lang
                    .toLowerCase()
                    .startsWith(
                        languageCode
                    )
        );


    if (voice) return voice;


    return null;
}


// ==========================================
// CREATE SPOKEN TEXT
// ==========================================

function createSpeechText() {

    if (!lastResult) {

        return "Please select and analyze a skin image first.";

    }

    const language =
        languageSelect
            ? languageSelect.value
            : "en-US";

    const t =
        translations[language] ||
        translations["en-US"];


    let text = `

        ${t.title}.

        ${t.screening}:
        ${lastResult.screening_result || "Needs attention"}.

        ${t.prediction}:
        ${lastResult.prediction || "Unknown"}.

        ${t.confidence}:
        ${Number(
            lastResult.confidence || 0
        ).toFixed(2)} percent.

        ${t.suspicious}:
        ${Number(
            lastResult.suspicious_score || 0
        ).toFixed(2)} percent.

        ${t.warning}

    `;


    return text
        .replace(/\s+/g, " ")
        .trim();
}


// ==========================================
// VOICE ASSISTANCE
// ==========================================

if (voiceButton) {

    voiceButton.addEventListener(
        "click",
        function () {

            if (
                !("speechSynthesis" in window)
            ) {

                alert(
                    "Voice assistance is not supported by this browser."
                );

                return;
            }


            const language =
                languageSelect
                    ? languageSelect.value
                    : "en-US";


            const text =
                createSpeechText();


            // Stop previous speech

            window.speechSynthesis.cancel();


            const speak = () => {

                const voice =
                    findBestVoice(language);


                const speech =
                    new SpeechSynthesisUtterance(
                        text
                    );


                speech.lang =
                    language;


                speech.rate =
                    0.85;

                speech.pitch =
                    1;


                if (voice) {

                    speech.voice =
                        voice;

                    console.log(
                        "🔊 Using voice:",
                        voice.name,
                        voice.lang
                    );

                } else {

                    console.warn(
                        "⚠️ No matching voice found for:",
                        language
                    );

                    console.warn(
                        "Available voices:",
                        availableVoices
                            .map(v =>
                                `${v.name} (${v.lang})`
                            )
                    );
                }


                speech.onerror =
                    function (event) {

                        console.error(
                            "Speech error:",
                            event
                        );

                    };


                window.speechSynthesis.speak(
                    speech
                );
            };


            // Some mobile browsers load voices
            // asynchronously.

            if (!availableVoices.length) {

                loadVoices();

            }


            speak();

        }
    );
}


// ==========================================
// STARTUP
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
    "✅ API:",
    API_URL
);