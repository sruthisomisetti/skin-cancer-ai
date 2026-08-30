/* =========================================================
   SKIN CANCER AI
   FINAL FRONTEND SCRIPT
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const imageInput =
    document.getElementById("imageInput");

const cameraInput =
    document.getElementById("cameraInput");

const previewImage =
    document.getElementById("previewImage");

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


let selectedImage = null;

let lastResult = null;


/* =========================================================
   API URL
========================================================= */

const API_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : window.location.origin;


/* =========================================================
   HISTORY STORAGE
========================================================= */

const HISTORY_KEY =
    "skinCancerAIHistory";


/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {

    "en-US": {

        mainTitle: "🩺 Skin Cancer AI",

        mainSubtitle:
            "AI-powered skin image screening and awareness tool",

        languageLabel:
            "🌐 Language",

        uploadTitle:
            "📷 Upload or Take a Skin Image",

        chooseImage:
            "🖼️ Choose Image",

        takePhoto:
            "📷 Take Photo",

        analyze:
            "🔍 Analyze Image",

        voice:
            "🔊 Voice Assistance",

        previewTitle:
            "🖼️ Image Preview",

        resultTitle:
            "📊 AI Skin Analysis Result",

        selectImage:
            "Please choose or take a skin image to begin the analysis.",

        analyzing:
            "Analyzing your image...",

        wait:
            "Please wait while the AI examines the image.",

        historyTitle:
            "🕘 Previous Analysis",

        clearHistory:
            "🗑️ Clear History",

        noHistory:
            "No previous analyses yet.",

        detected:
            "What the AI detected",

        meaning:
            "What does this mean?",

        action:
            "What should you do?",

        confidence:
            "AI Confidence",

        screening:
            "Overall AI Screening Result",

        suspicious:
            "Combined Suspicious Score",

        probabilities:
            "AI Class Probabilities",

        technical:
            "Technical model information",

        modelPrediction:
            "Model prediction",

        resultCategory:
            "Result category",

        important:
            "Important:",

        warning:
            "This AI result is for research and demonstration purposes only. It is NOT a medical diagnosis. Please consult a qualified healthcare professional for medical advice.",

        footerWarning:
            "This AI application is intended for research, educational and demonstration purposes only. It does not provide a medical diagnosis.",

        footerAdvice:
            "Please consult a qualified healthcare professional for medical advice.",

        selected:
            "Image selected successfully.",

        clickAnalyze:
            "Click Analyze Image to start the AI analysis.",

        error:
            "Unable to analyze this image.",

        historyPrediction:
            "Result",

        historyConfidence:
            "Confidence",

        historyDate:
            "Date & Time",

        historyScreening:
            "Screening"
    },


    "te-IN": {

        mainTitle:
            "🩺 చర్మ క్యాన్సర్ AI",

        mainSubtitle:
            "AI ఆధారిత చర్మ చిత్ర స్క్రీనింగ్ మరియు అవగాహన సాధనం",

        languageLabel:
            "🌐 భాష",

        uploadTitle:
            "📷 చర్మ చిత్రాన్ని అప్‌లోడ్ చేయండి లేదా ఫోటో తీయండి",

        chooseImage:
            "🖼️ చిత్రాన్ని ఎంచుకోండి",

        takePhoto:
            "📷 ఫోటో తీయండి",

        analyze:
            "🔍 చిత్రాన్ని విశ్లేషించండి",

        voice:
            "🔊 వాయిస్ సహాయం",

        previewTitle:
            "🖼️ చిత్ర ప్రివ్యూ",

        resultTitle:
            "📊 AI చర్మ విశ్లేషణ ఫలితం",

        selectImage:
            "విశ్లేషణ ప్రారంభించడానికి ముందుగా చర్మ చిత్రాన్ని ఎంచుకోండి లేదా ఫోటో తీయండి.",

        analyzing:
            "మీ చిత్రాన్ని విశ్లేషిస్తోంది...",

        wait:
            "AI చిత్రాన్ని పరిశీలిస్తోంది. దయచేసి వేచి ఉండండి.",

        historyTitle:
            "🕘 మునుపటి విశ్లేషణలు",

        clearHistory:
            "🗑️ చరిత్రను తొలగించండి",

        noHistory:
            "ఇప్పటివరకు మునుపటి విశ్లేషణలు లేవు.",

        detected:
            "AI గుర్తించిన ఫలితం",

        meaning:
            "దీని అర్థం ఏమిటి?",

        action:
            "మీరు ఏమి చేయాలి?",

        confidence:
            "AI నమ్మక స్థాయి",

        screening:
            "మొత్తం AI స్క్రీనింగ్ ఫలితం",

        suspicious:
            "సందేహాస్పద స్కోర్",

        probabilities:
            "AI వర్గ సంభావ్యతలు",

        technical:
            "మోడల్ సాంకేతిక సమాచారం",

        modelPrediction:
            "మోడల్ అంచనా",

        resultCategory:
            "ఫలిత వర్గం",

        important:
            "ముఖ్యమైనది:",

        warning:
            "ఈ AI ఫలితం పరిశోధన మరియు ప్రదర్శన కోసం మాత్రమే. ఇది వైద్య నిర్ధారణ కాదు. వైద్య సలహా కోసం అర్హత కలిగిన ఆరోగ్య నిపుణుడిని సంప్రదించండి.",

        footerWarning:
            "ఈ AI అప్లికేషన్ పరిశోధన, విద్య మరియు ప్రదర్శన కోసం మాత్రమే. ఇది వైద్య నిర్ధారణను అందించదు.",

        footerAdvice:
            "వైద్య సలహా కోసం అర్హత కలిగిన ఆరోగ్య నిపుణుడిని సంప్రదించండి.",

        selected:
            "చిత్రం విజయవంతంగా ఎంపిక చేయబడింది.",

        clickAnalyze:
            "AI విశ్లేషణ ప్రారంభించడానికి Analyze Image నొక్కండి.",

        error:
            "ఈ చిత్రాన్ని విశ్లేషించలేకపోయాము.",

        historyPrediction:
            "ఫలితం",

        historyConfidence:
            "నమ్మక స్థాయి",

        historyDate:
            "తేదీ మరియు సమయం",

        historyScreening:
            "స్క్రీనింగ్"
    },


    "hi-IN": {

        mainTitle:
            "🩺 त्वचा कैंसर AI",

        mainSubtitle:
            "AI आधारित त्वचा छवि स्क्रीनिंग और जागरूकता उपकरण",

        languageLabel:
            "🌐 भाषा",

        uploadTitle:
            "📷 त्वचा की तस्वीर अपलोड करें या फोटो लें",

        chooseImage:
            "🖼️ तस्वीर चुनें",

        takePhoto:
            "📷 फोटो लें",

        analyze:
            "🔍 तस्वीर का विश्लेषण करें",

        voice:
            "🔊 आवाज सहायता",

        previewTitle:
            "🖼️ तस्वीर का पूर्वावलोकन",

        resultTitle:
            "📊 AI त्वचा विश्लेषण परिणाम",

        selectImage:
            "विश्लेषण शुरू करने के लिए पहले त्वचा की तस्वीर चुनें या फोटो लें।",

        analyzing:
            "आपकी तस्वीर का विश्लेषण हो रहा है...",

        wait:
            "AI तस्वीर की जांच कर रहा है। कृपया प्रतीक्षा करें।",

        historyTitle:
            "🕘 पिछले विश्लेषण",

        clearHistory:
            "🗑️ इतिहास साफ करें",

        noHistory:
            "अभी तक कोई पिछला विश्लेषण नहीं है।",

        detected:
            "AI ने क्या पाया",

        meaning:
            "इसका क्या अर्थ है?",

        action:
            "आपको क्या करना चाहिए?",

        confidence:
            "AI विश्वास स्तर",

        screening:
            "कुल AI स्क्रीनिंग परिणाम",

        suspicious:
            "संदिग्ध स्कोर",

        probabilities:
            "AI वर्ग संभावनाएँ",

        technical:
            "मॉडल तकनीकी जानकारी",

        modelPrediction:
            "मॉडल का अनुमान",

        resultCategory:
            "परिणाम श्रेणी",

        important:
            "महत्वपूर्ण:",

        warning:
            "यह AI परिणाम केवल शोध और प्रदर्शन के लिए है। यह चिकित्सीय निदान नहीं है। चिकित्सा सलाह के लिए योग्य स्वास्थ्य विशेषज्ञ से संपर्क करें।",

        footerWarning:
            "यह AI एप्लिकेशन केवल शोध, शिक्षा और प्रदर्शन के लिए है। यह चिकित्सीय निदान प्रदान नहीं करता।",

        footerAdvice:
            "चिकित्सा सलाह के लिए योग्य स्वास्थ्य विशेषज्ञ से संपर्क करें।",

        selected:
            "तस्वीर सफलतापूर्वक चुनी गई।",

        clickAnalyze:
            "AI विश्लेषण शुरू करने के लिए Analyze Image दबाएँ।",

        error:
            "इस तस्वीर का विश्लेषण नहीं किया जा सका।",

        historyPrediction:
            "परिणाम",

        historyConfidence:
            "विश्वास",

        historyDate:
            "दिनांक और समय",

        historyScreening:
            "स्क्रीनिंग"
    },


    "ta-IN": {

        mainTitle:
            "🩺 தோல் புற்றுநோய் AI",

        mainSubtitle:
            "AI அடிப்படையிலான தோல் பட பரிசோதனை மற்றும் விழிப்புணர்வு கருவி",

        languageLabel:
            "🌐 மொழி",

        uploadTitle:
            "📷 தோல் படத்தை பதிவேற்றவும் அல்லது புகைப்படம் எடுக்கவும்",

        chooseImage:
            "🖼️ படத்தை தேர்ந்தெடுக்கவும்",

        takePhoto:
            "📷 புகைப்படம் எடுக்கவும்",

        analyze:
            "🔍 படத்தை பகுப்பாய்வு செய்யவும்",

        voice:
            "🔊 குரல் உதவி",

        previewTitle:
            "🖼️ பட முன்னோட்டம்",

        resultTitle:
            "📊 AI தோல் பகுப்பாய்வு முடிவு",

        selectImage:
            "பகுப்பாய்வை தொடங்க முதலில் தோல் படத்தைத் தேர்ந்தெடுக்கவும் அல்லது புகைப்படம் எடுக்கவும்.",

        analyzing:
            "உங்கள் படத்தை பகுப்பாய்வு செய்கிறது...",

        wait:
            "AI படத்தை ஆய்வு செய்கிறது. தயவுசெய்து காத்திருக்கவும்.",

        historyTitle:
            "🕘 முந்தைய பகுப்பாய்வுகள்",

        clearHistory:
            "🗑️ வரலாற்றை அழிக்கவும்",

        noHistory:
            "முந்தைய பகுப்பாய்வுகள் எதுவும் இல்லை.",

        detected:
            "AI கண்டறிந்தது",

        meaning:
            "இதன் பொருள் என்ன?",

        action:
            "நீங்கள் என்ன செய்ய வேண்டும்?",

        confidence:
            "AI நம்பிக்கை நிலை",

        screening:
            "மொத்த AI பரிசோதனை முடிவு",

        suspicious:
            "சந்தேக மதிப்பெண்",

        probabilities:
            "AI வகுப்பு சாத்தியக்கூறுகள்",

        technical:
            "மாதிரி தொழில்நுட்ப தகவல்",

        modelPrediction:
            "மாதிரி கணிப்பு",

        resultCategory:
            "முடிவு வகை",

        important:
            "முக்கியமானது:",

        warning:
            "இந்த AI முடிவு ஆராய்ச்சி மற்றும் விளக்கத்திற்காக மட்டுமே. இது மருத்துவ நோயறிதல் அல்ல. மருத்துவ ஆலோசனைக்கு தகுதியான சுகாதார நிபுணரை அணுகவும்.",

        footerWarning:
            "இந்த AI பயன்பாடு ஆராய்ச்சி, கல்வி மற்றும் விளக்கத்திற்காக மட்டுமே. இது மருத்துவ நோயறிதலை வழங்காது.",

        footerAdvice:
            "மருத்துவ ஆலோசனைக்கு தகுதியான சுகாதார நிபுணரை அணுகவும்.",

        selected:
            "படம் வெற்றிகரமாக தேர்ந்தெடுக்கப்பட்டது.",

        clickAnalyze:
            "AI பகுப்பாய்வை தொடங்க Analyze Image என்பதை அழுத்தவும்.",

        error:
            "இந்த படத்தை பகுப்பாய்வு செய்ய முடியவில்லை.",

        historyPrediction:
            "முடிவு",

        historyConfidence:
            "நம்பிக்கை",

        historyDate:
            "தேதி மற்றும் நேரம்",

        historyScreening:
            "பரிசோதனை"
    },


    "kn-IN": {

        mainTitle:
            "🩺 ಚರ್ಮ ಕ್ಯಾನ್ಸರ್ AI",

        mainSubtitle:
            "AI ಆಧಾರಿತ ಚರ್ಮದ ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಜಾಗೃತಿ ಸಾಧನ",

        languageLabel:
            "🌐 ಭಾಷೆ",

        uploadTitle:
            "📷 ಚರ್ಮದ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ",

        chooseImage:
            "🖼️ ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ",

        takePhoto:
            "📷 ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ",

        analyze:
            "🔍 ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ",

        voice:
            "🔊 ಧ್ವನಿ ಸಹಾಯ",

        previewTitle:
            "🖼️ ಚಿತ್ರ ಪೂರ್ವವೀಕ್ಷಣೆ",

        resultTitle:
            "📊 AI ಚರ್ಮ ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶ",

        selectImage:
            "ವಿಶ್ಲೇಷಣೆ ಪ್ರಾರಂಭಿಸಲು ಮೊದಲು ಚರ್ಮದ ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ.",

        analyzing:
            "ನಿಮ್ಮ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",

        wait:
            "AI ಚಿತ್ರವನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಕಾಯಿರಿ.",

        historyTitle:
            "🕘 ಹಿಂದಿನ ವಿಶ್ಲೇಷಣೆಗಳು",

        clearHistory:
            "🗑️ ಇತಿಹಾಸವನ್ನು ತೆರವುಗೊಳಿಸಿ",

        noHistory:
            "ಯಾವುದೇ ಹಿಂದಿನ ವಿಶ್ಲೇಷಣೆಗಳಿಲ್ಲ.",

        detected:
            "AI ಪತ್ತೆಹಚ್ಚಿದ್ದು",

        meaning:
            "ಇದರ ಅರ್ಥವೇನು?",

        action:
            "ನೀವು ಏನು ಮಾಡಬೇಕು?",

        confidence:
            "AI ವಿಶ್ವಾಸ ಮಟ್ಟ",

        screening:
            "ಒಟ್ಟು AI ಸ್ಕ್ರೀನಿಂಗ್ ಫಲಿತಾಂಶ",

        suspicious:
            "ಸಂದೇಹಾಸ್ಪದ ಸ್ಕೋರ್",

        probabilities:
            "AI ವರ್ಗ ಸಾಧ್ಯತೆಗಳು",

        technical:
            "ಮಾದರಿ ತಾಂತ್ರಿಕ ಮಾಹಿತಿ",

        modelPrediction:
            "ಮಾದರಿ ಮುನ್ಸೂಚನೆ",

        resultCategory:
            "ಫಲಿತಾಂಶ ವರ್ಗ",

        important:
            "ಮುಖ್ಯ:",

        warning:
            "ಈ AI ಫಲಿತಾಂಶವು ಸಂಶೋಧನೆ ಮತ್ತು ಪ್ರದರ್ಶನಕ್ಕಾಗಿ ಮಾತ್ರ. ಇದು ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ. ವೈದ್ಯಕೀಯ ಸಲಹೆಗಾಗಿ ಅರ್ಹ ಆರೋಗ್ಯ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.",

        footerWarning:
            "ಈ AI ಅಪ್ಲಿಕೇಶನ್ ಸಂಶೋಧನೆ, ಶಿಕ್ಷಣ ಮತ್ತು ಪ್ರದರ್ಶನಕ್ಕಾಗಿ ಮಾತ್ರ. ಇದು ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವನ್ನು ನೀಡುವುದಿಲ್ಲ.",

        footerAdvice:
            "ವೈದ್ಯಕೀಯ ಸಲಹೆಗಾಗಿ ಅರ್ಹ ಆರೋಗ್ಯ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.",

        selected:
            "ಚಿತ್ರವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ.",

        clickAnalyze:
            "AI ವಿಶ್ಲೇಷಣೆಯನ್ನು ಪ್ರಾರಂಭಿಸಲು Analyze Image ಒತ್ತಿರಿ.",

        error:
            "ಈ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",

        historyPrediction:
            "ಫಲಿತಾಂಶ",

        historyConfidence:
            "ವಿಶ್ವಾಸ",

        historyDate:
            "ದಿನಾಂಕ ಮತ್ತು ಸಮಯ",

        historyScreening:
            "ಸ್ಕ್ರೀನಿಂಗ್"
    },


    "ml-IN": {

        mainTitle:
            "🩺 ത്വക്ക് ക്യാൻസർ AI",

        mainSubtitle:
            "AI അടിസ്ഥാനമാക്കിയുള്ള ചർമ്മ ചിത്ര പരിശോധനയും ബോധവൽക്കരണ ഉപകരണവും",

        languageLabel:
            "🌐 ഭാഷ",

        uploadTitle:
            "📷 ചർമ്മ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക അല്ലെങ്കിൽ ഫോട്ടോ എടുക്കുക",

        chooseImage:
            "🖼️ ചിത്രം തിരഞ്ഞെടുക്കുക",

        takePhoto:
            "📷 ഫോട്ടോ എടുക്കുക",

        analyze:
            "🔍 ചിത്രം വിശകലനം ചെയ്യുക",

        voice:
            "🔊 ശബ്ദ സഹായം",

        previewTitle:
            "🖼️ ചിത്ര പ്രിവ്യൂ",

        resultTitle:
            "📊 AI ചർമ്മ വിശകലന ഫലം",

        selectImage:
            "വിശകലനം ആരംഭിക്കാൻ ആദ്യം ഒരു ചർമ്മ ചിത്രം തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ ഫോട്ടോ എടുക്കുക.",

        analyzing:
            "നിങ്ങളുടെ ചിത്രം വിശകലനം ചെയ്യുന്നു...",

        wait:
            "AI ചിത്രം പരിശോധിക്കുന്നു. ദയവായി കാത്തിരിക്കുക.",

        historyTitle:
            "🕘 മുമ്പത്തെ വിശകലനങ്ങൾ",

        clearHistory:
            "🗑️ ചരിത്രം മായ്ക്കുക",

        noHistory:
            "മുമ്പത്തെ വിശകലനങ്ങളൊന്നുമില്ല.",

        detected:
            "AI കണ്ടെത്തിയത്",

        meaning:
            "ഇതിന്റെ അർത്ഥം എന്താണ്?",

        action:
            "നിങ്ങൾ എന്ത് ചെയ്യണം?",

        confidence:
            "AI വിശ്വാസനില",

        screening:
            "മൊത്തത്തിലുള്ള AI പരിശോധന ഫലം",

        suspicious:
            "സംശയ സ്കോർ",

        probabilities:
            "AI വിഭാഗ സാധ്യതകൾ",

        technical:
            "മോഡൽ സാങ്കേതിക വിവരങ്ങൾ",

        modelPrediction:
            "മോഡൽ പ്രവചനം",

        resultCategory:
            "ഫല വിഭാഗം",

        important:
            "പ്രധാനപ്പെട്ടത്:",

        warning:
            "ഈ AI ഫലം ഗവേഷണത്തിനും പ്രദർശനത്തിനും മാത്രമാണ്. ഇത് മെഡിക്കൽ രോഗനിർണയം അല്ല. മെഡിക്കൽ ഉപദേശത്തിനായി യോഗ്യനായ ആരോഗ്യ വിദഗ്ധനെ സമീപിക്കുക.",

        footerWarning:
            "ഈ AI ആപ്ലിക്കേഷൻ ഗവേഷണം, വിദ്യാഭ്യാസം, പ്രദർശനം എന്നിവയ്ക്കായി മാത്രമാണ്. ഇത് മെഡിക്കൽ രോഗനിർണയം നൽകുന്നില്ല.",

        footerAdvice:
            "മെഡിക്കൽ ഉപദേശത്തിനായി യോഗ്യനായ ആരോഗ്യ വിദഗ്ധനെ സമീപിക്കുക.",

        selected:
            "ചിത്രം വിജയകരമായി തിരഞ്ഞെടുത്തു.",

        clickAnalyze:
            "AI വിശകലനം ആരംഭിക്കാൻ Analyze Image അമർത്തുക.",

        error:
            "ഈ ചിത്രം വിശകലനം ചെയ്യാൻ കഴിഞ്ഞില്ല.",

        historyPrediction:
            "ഫലം",

        historyConfidence:
            "വിശ്വാസം",

        historyDate:
            "തീയതിയും സമയവും",

        historyScreening:
            "പരിശോധന"
    },


    "fr-FR": {

        mainTitle:
            "🩺 IA du cancer de la peau",

        mainSubtitle:
            "Outil de dépistage et de sensibilisation des images cutanées par IA",

        languageLabel:
            "🌐 Langue",

        uploadTitle:
            "📷 Importer ou prendre une image de la peau",

        chooseImage:
            "🖼️ Choisir une image",

        takePhoto:
            "📷 Prendre une photo",

        analyze:
            "🔍 Analyser l'image",

        voice:
            "🔊 Assistance vocale",

        previewTitle:
            "🖼️ Aperçu de l'image",

        resultTitle:
            "📊 Résultat de l'analyse cutanée par IA",

        selectImage:
            "Veuillez choisir ou prendre une image de peau pour commencer.",

        analyzing:
            "Analyse de votre image...",

        wait:
            "L'IA examine votre image. Veuillez patienter.",

        historyTitle:
            "🕘 Analyses précédentes",

        clearHistory:
            "🗑️ Effacer l'historique",

        noHistory:
            "Aucune analyse précédente.",

        detected:
            "Ce que l'IA a détecté",

        meaning:
            "Qu'est-ce que cela signifie ?",

        action:
            "Que devez-vous faire ?",

        confidence:
            "Confiance de l'IA",

        screening:
            "Résultat du dépistage IA",

        suspicious:
            "Score suspect",

        probabilities:
            "Probabilités des classes IA",

        technical:
            "Informations techniques du modèle",

        modelPrediction:
            "Prédiction du modèle",

        resultCategory:
            "Catégorie du résultat",

        important:
            "Important :",

        warning:
            "Ce résultat IA est destiné uniquement à la recherche et à la démonstration. Il ne constitue pas un diagnostic médical. Consultez un professionnel de santé qualifié.",

        footerWarning:
            "Cette application IA est destinée uniquement à la recherche, à l'éducation et à la démonstration. Elle ne fournit pas de diagnostic médical.",

        footerAdvice:
            "Consultez un professionnel de santé qualifié pour obtenir des conseils médicaux.",

        selected:
            "Image sélectionnée avec succès.",

        clickAnalyze:
            "Cliquez sur Analyser l'image pour commencer.",

        error:
            "Impossible d'analyser cette image.",

        historyPrediction:
            "Résultat",

        historyConfidence:
            "Confiance",

        historyDate:
            "Date et heure",

        historyScreening:
            "Dépistage"
    },


    "es-ES": {

        mainTitle:
            "🩺 IA del cáncer de piel",

        mainSubtitle:
            "Herramienta de detección y concienciación de imágenes de piel mediante IA",

        languageLabel:
            "🌐 Idioma",

        uploadTitle:
            "📷 Subir o tomar una imagen de la piel",

        chooseImage:
            "🖼️ Elegir imagen",

        takePhoto:
            "📷 Tomar foto",

        analyze:
            "🔍 Analizar imagen",

        voice:
            "🔊 Asistencia de voz",

        previewTitle:
            "🖼️ Vista previa de la imagen",

        resultTitle:
            "📊 Resultado del análisis de piel con IA",

        selectImage:
            "Seleccione o tome una imagen de piel para comenzar.",

        analyzing:
            "Analizando su imagen...",

        wait:
            "La IA está examinando la imagen. Espere, por favor.",

        historyTitle:
            "🕘 Análisis anteriores",

        clearHistory:
            "🗑️ Borrar historial",

        noHistory:
            "No hay análisis anteriores.",

        detected:
            "Lo que detectó la IA",

        meaning:
            "¿Qué significa?",

        action:
            "¿Qué debe hacer?",

        confidence:
            "Confianza de la IA",

        screening:
            "Resultado de detección de IA",

        suspicious:
            "Puntuación sospechosa",

        probabilities:
            "Probabilidades de clases de IA",

        technical:
            "Información técnica del modelo",

        modelPrediction:
            "Predicción del modelo",

        resultCategory:
            "Categoría del resultado",

        important:
            "Importante:",

        warning:
            "Este resultado de IA es solo para investigación y demostración. No constituye un diagnóstico médico. Consulte a un profesional sanitario cualificado.",

        footerWarning:
            "Esta aplicación de IA está destinada únicamente a investigación, educación y demostración. No proporciona un diagnóstico médico.",

        footerAdvice:
            "Consulte a un profesional sanitario cualificado para obtener asesoramiento médico.",

        selected:
            "Imagen seleccionada correctamente.",

        clickAnalyze:
            "Pulse Analizar imagen para comenzar.",

        error:
            "No se pudo analizar esta imagen.",

        historyPrediction:
            "Resultado",

        historyConfidence:
            "Confianza",

        historyDate:
            "Fecha y hora",

        historyScreening:
            "Detección"
    },


    "de-DE": {

        mainTitle:
            "🩺 Hautkrebs-KI",

        mainSubtitle:
            "KI-gestütztes Tool zur Hautbildanalyse und Aufklärung",

        languageLabel:
            "🌐 Sprache",

        uploadTitle:
            "📷 Hautbild hochladen oder Foto aufnehmen",

        chooseImage:
            "🖼️ Bild auswählen",

        takePhoto:
            "📷 Foto aufnehmen",

        analyze:
            "🔍 Bild analysieren",

        voice:
            "🔊 Sprachunterstützung",

        previewTitle:
            "🖼️ Bildvorschau",

        resultTitle:
            "📊 KI-Ergebnis der Hautanalyse",

        selectImage:
            "Bitte wählen Sie zuerst ein Hautbild aus oder nehmen Sie ein Foto auf.",

        analyzing:
            "Bild wird analysiert...",

        wait:
            "Die KI untersucht Ihr Bild. Bitte warten Sie.",

        historyTitle:
            "🕘 Frühere Analysen",

        clearHistory:
            "🗑️ Verlauf löschen",

        noHistory:
            "Noch keine früheren Analysen.",

        detected:
            "Was die KI erkannt hat",

        meaning:
            "Was bedeutet das?",

        action:
            "Was sollten Sie tun?",

        confidence:
            "KI-Konfidenz",

        screening:
            "KI-Screening-Ergebnis",

        suspicious:
            "Verdachtswert",

        probabilities:
            "KI-Klassenwahrscheinlichkeiten",

        technical:
            "Technische Modellinformationen",

        modelPrediction:
            "Modellvorhersage",

        resultCategory:
            "Ergebniskategorie",

        important:
            "Wichtig:",

        warning:
            "Dieses KI-Ergebnis dient nur Forschungs- und Demonstrationszwecken. Es ist keine medizinische Diagnose. Wenden Sie sich an eine qualifizierte medizinische Fachkraft.",

        footerWarning:
            "Diese KI-Anwendung dient nur Forschungs-, Bildungs- und Demonstrationszwecken. Sie stellt keine medizinische Diagnose bereit.",

        footerAdvice:
            "Bitte wenden Sie sich für medizinische Beratung an eine qualifizierte medizinische Fachkraft.",

        selected:
            "Bild erfolgreich ausgewählt.",

        clickAnalyze:
            "Klicken Sie auf Bild analysieren, um zu beginnen.",

        error:
            "Dieses Bild konnte nicht analysiert werden.",

        historyPrediction:
            "Ergebnis",

        historyConfidence:
            "Konfidenz",

        historyDate:
            "Datum und Uhrzeit",

        historyScreening:
            "Screening"
    },


    "it-IT": {

        mainTitle:
            "🩺 IA per il cancro della pelle",

        mainSubtitle:
            "Strumento IA per lo screening e la sensibilizzazione sulle immagini della pelle",

        languageLabel:
            "🌐 Lingua",

        uploadTitle:
            "📷 Carica o scatta un'immagine della pelle",

        chooseImage:
            "🖼️ Scegli immagine",

        takePhoto:
            "📷 Scatta foto",

        analyze:
            "🔍 Analizza immagine",

        voice:
            "🔊 Assistenza vocale",

        previewTitle:
            "🖼️ Anteprima immagine",

        resultTitle:
            "📊 Risultato dell'analisi della pelle con IA",

        selectImage:
            "Seleziona o scatta prima un'immagine della pelle.",

        analyzing:
            "Analisi dell'immagine...",

        wait:
            "L'IA sta esaminando l'immagine. Attendere.",

        historyTitle:
            "🕘 Analisi precedenti",

        clearHistory:
            "🗑️ Cancella cronologia",

        noHistory:
            "Nessuna analisi precedente.",

        detected:
            "Cosa ha rilevato l'IA",

        meaning:
            "Cosa significa?",

        action:
            "Cosa dovresti fare?",

        confidence:
            "Affidabilità dell'IA",

        screening:
            "Risultato dello screening IA",

        suspicious:
            "Punteggio sospetto",

        probabilities:
            "Probabilità delle classi IA",

        technical:
            "Informazioni tecniche del modello",

        modelPrediction:
            "Previsione del modello",

        resultCategory:
            "Categoria del risultato",

        important:
            "Importante:",

        warning:
            "Questo risultato IA è destinato esclusivamente alla ricerca e alla dimostrazione. Non costituisce una diagnosi medica. Consultare un professionista sanitario qualificato.",

        footerWarning:
            "Questa applicazione IA è destinata esclusivamente a ricerca, istruzione e dimostrazione. Non fornisce una diagnosi medica.",

        footerAdvice:
            "Consultare un professionista sanitario qualificato per consigli medici.",

        selected:
            "Immagine selezionata correttamente.",

        clickAnalyze:
            "Premere Analizza immagine per iniziare.",

        error:
            "Impossibile analizzare questa immagine.",

        historyPrediction:
            "Risultato",

        historyConfidence:
            "Affidabilità",

        historyDate:
            "Data e ora",

        historyScreening:
            "Screening"
    },


    "pt-PT": {

        mainTitle:
            "🩺 IA do cancro da pele",

        mainSubtitle:
            "Ferramenta de rastreio e sensibilização de imagens da pele com IA",

        languageLabel:
            "🌐 Idioma",

        uploadTitle:
            "📷 Carregar ou tirar uma imagem da pele",

        chooseImage:
            "🖼️ Escolher imagem",

        takePhoto:
            "📷 Tirar fotografia",

        analyze:
            "🔍 Analisar imagem",

        voice:
            "🔊 Assistência por voz",

        previewTitle:
            "🖼️ Pré-visualização da imagem",

        resultTitle:
            "📊 Resultado da análise da pele por IA",

        selectImage:
            "Selecione ou tire primeiro uma imagem da pele.",

        analyzing:
            "A analisar a sua imagem...",

        wait:
            "A IA está a examinar a sua imagem. Aguarde.",

        historyTitle:
            "🕘 Análises anteriores",

        clearHistory:
            "🗑️ Limpar histórico",

        noHistory:
            "Ainda não existem análises anteriores.",

        detected:
            "O que a IA detetou",

        meaning:
            "O que significa?",

        action:
            "O que deve fazer?",

        confidence:
            "Confiança da IA",

        screening:
            "Resultado da triagem de IA",

        suspicious:
            "Pontuação suspeita",

        probabilities:
            "Probabilidades das classes de IA",

        technical:
            "Informações técnicas do modelo",

        modelPrediction:
            "Previsão do modelo",

        resultCategory:
            "Categoria do resultado",

        important:
            "Importante:",

        warning:
            "Este resultado de IA destina-se apenas a investigação e demonstração. Não constitui um diagnóstico médico. Consulte um profissional de saúde qualificado.",

        footerWarning:
            "Esta aplicação de IA destina-se apenas a investigação, educação e demonstração. Não fornece um diagnóstico médico.",

        footerAdvice:
            "Consulte um profissional de saúde qualificado para aconselhamento médico.",

        selected:
            "Imagem selecionada com sucesso.",

        clickAnalyze:
            "Prima Analisar imagem para começar.",

        error:
            "Não foi possível analisar esta imagem.",

        historyPrediction:
            "Resultado",

        historyConfidence:
            "Confiança",

        historyDate:
            "Data e hora",

        historyScreening:
            "Triagem"
    },


    "ja-JP": {

        mainTitle:
            "🩺 皮膚がん AI",

        mainSubtitle:
            "AIによる皮膚画像のスクリーニングと啓発ツール",

        languageLabel:
            "🌐 言語",

        uploadTitle:
            "📷 皮膚画像をアップロードまたは撮影",

        chooseImage:
            "🖼️ 画像を選択",

        takePhoto:
            "📷 写真を撮る",

        analyze:
            "🔍 画像を分析",

        voice:
            "🔊 音声アシスタント",

        previewTitle:
            "🖼️ 画像プレビュー",

        resultTitle:
            "📊 AI皮膚分析結果",

        selectImage:
            "分析を開始するには、皮膚画像を選択するか写真を撮ってください。",

        analyzing:
            "画像を分析しています...",

        wait:
            "AIが画像を確認しています。しばらくお待ちください。",

        historyTitle:
            "🕘 過去の分析",

        clearHistory:
            "🗑️ 履歴を消去",

        noHistory:
            "過去の分析はありません。",

        detected:
            "AIが検出したもの",

        meaning:
            "これは何を意味しますか？",

        action:
            "どうすればよいですか？",

        confidence:
            "AI信頼度",

        screening:
            "AIスクリーニング結果",

        suspicious:
            "疑わしさスコア",

        probabilities:
            "AIクラス確率",

        technical:
            "モデルの技術情報",

        modelPrediction:
            "モデル予測",

        resultCategory:
            "結果カテゴリー",

        important:
            "重要:",

        warning:
            "このAI結果は研究およびデモンストレーションのみを目的としています。医学的診断ではありません。医療専門家にご相談ください。",

        footerWarning:
            "このAIアプリケーションは研究、教育、デモンストレーションのみを目的としています。医学的診断は提供しません。",

        footerAdvice:
            "医療上のアドバイスについては、資格のある医療専門家にご相談ください。",

        selected:
            "画像が正常に選択されました。",

        clickAnalyze:
            "Analyze Imageを押して分析を開始してください。",

        error:
            "この画像を分析できませんでした。",

        historyPrediction:
            "結果",

        historyConfidence:
            "信頼度",

        historyDate:
            "日時",

        historyScreening:
            "スクリーニング"
    },


    "ko-KR": {

        mainTitle:
            "🩺 피부암 AI",

        mainSubtitle:
            "AI 기반 피부 이미지 검사 및 인식 도구",

        languageLabel:
            "🌐 언어",

        uploadTitle:
            "📷 피부 이미지를 업로드하거나 사진 촬영",

        chooseImage:
            "🖼️ 이미지 선택",

        takePhoto:
            "📷 사진 촬영",

        analyze:
            "🔍 이미지 분석",

        voice:
            "🔊 음성 지원",

        previewTitle:
            "🖼️ 이미지 미리보기",

        resultTitle:
            "📊 AI 피부 분석 결과",

        selectImage:
            "분석을 시작하려면 피부 이미지를 선택하거나 사진을 촬영하세요.",

        analyzing:
            "이미지를 분석하는 중...",

        wait:
            "AI가 이미지를 확인하고 있습니다. 잠시 기다려 주세요.",

        historyTitle:
            "🕘 이전 분석",

        clearHistory:
            "🗑️ 기록 삭제",

        noHistory:
            "이전 분석 결과가 없습니다.",

        detected:
            "AI가 감지한 내용",

        meaning:
            "무엇을 의미하나요?",

        action:
            "어떻게 해야 하나요?",

        confidence:
            "AI 신뢰도",

        screening:
            "AI 검사 결과",

        suspicious:
            "의심 점수",

        probabilities:
            "AI 클래스 확률",

        technical:
            "모델 기술 정보",

        modelPrediction:
            "모델 예측",

        resultCategory:
            "결과 범주",

        important:
            "중요:",

        warning:
            "이 AI 결과는 연구 및 시연 목적으로만 제공됩니다. 의학적 진단이 아닙니다. 의료 전문가와 상담하십시오.",

        footerWarning:
            "이 AI 애플리케이션은 연구, 교육 및 시연 목적으로만 사용됩니다. 의학적 진단을 제공하지 않습니다.",

        footerAdvice:
            "의료 상담을 위해 자격을 갖춘 의료 전문가와 상담하십시오.",

        selected:
            "이미지가 성공적으로 선택되었습니다.",

        clickAnalyze:
            "Analyze Image를 눌러 분석을 시작하세요.",

        error:
            "이 이미지를 분석할 수 없습니다.",

        historyPrediction:
            "결과",

        historyConfidence:
            "신뢰도",

        historyDate:
            "날짜 및 시간",

        historyScreening:
            "검사"
    },


    "ru-RU": {

        mainTitle:
            "🩺 ИИ для рака кожи",

        mainSubtitle:
            "Инструмент ИИ для анализа изображений кожи и повышения осведомлённости",

        languageLabel:
            "🌐 Язык",

        uploadTitle:
            "📷 Загрузите изображение кожи или сделайте фото",

        chooseImage:
            "🖼️ Выбрать изображение",

        takePhoto:
            "📷 Сделать фото",

        analyze:
            "🔍 Анализировать изображение",

        voice:
            "🔊 Голосовая помощь",

        previewTitle:
            "🖼️ Предварительный просмотр",

        resultTitle:
            "📊 Результат анализа кожи ИИ",

        selectImage:
            "Сначала выберите изображение кожи или сделайте фотографию.",

        analyzing:
            "Анализ изображения...",

        wait:
            "ИИ проверяет изображение. Пожалуйста, подождите.",

        historyTitle:
            "🕘 Предыдущие анализы",

        clearHistory:
            "🗑️ Очистить историю",

        noHistory:
            "Предыдущих анализов пока нет.",

        detected:
            "Что обнаружил ИИ",

        meaning:
            "Что это означает?",

        action:
            "Что следует сделать?",

        confidence:
            "Уверенность ИИ",

        screening:
            "Результат ИИ-скрининга",

        suspicious:
            "Подозрительный балл",

        probabilities:
            "Вероятности классов ИИ",

        technical:
            "Техническая информация модели",

        modelPrediction:
            "Предсказание модели",

        resultCategory:
            "Категория результата",

        important:
            "Важно:",

        warning:
            "Этот результат ИИ предназначен только для исследований и демонстрации. Это не медицинский диагноз. Обратитесь к квалифицированному медицинскому специалисту.",

        footerWarning:
            "Это приложение ИИ предназначено только для исследований, обучения и демонстрации. Оно не предоставляет медицинский диагноз.",

        footerAdvice:
            "Для получения медицинской консультации обратитесь к квалифицированному специалисту.",

        selected:
            "Изображение успешно выбрано.",

        clickAnalyze:
            "Нажмите Анализировать изображение, чтобы начать.",

        error:
            "Не удалось проанализировать это изображение.",

        historyPrediction:
            "Результат",

        historyConfidence:
            "Уверенность",

        historyDate:
            "Дата и время",

        historyScreening:
            "Скрининг"
    },


    "ar-SA": {

        mainTitle:
            "🩺 الذكاء الاصطناعي لسرطان الجلد",

        mainSubtitle:
            "أداة لفحص صور الجلد والتوعية باستخدام الذكاء الاصطناعي",

        languageLabel:
            "🌐 اللغة",

        uploadTitle:
            "📷 تحميل صورة الجلد أو التقاط صورة",

        chooseImage:
            "🖼️ اختيار صورة",

        takePhoto:
            "📷 التقاط صورة",

        analyze:
            "🔍 تحليل الصورة",

        voice:
            "🔊 المساعدة الصوتية",

        previewTitle:
            "🖼️ معاينة الصورة",

        resultTitle:
            "📊 نتيجة تحليل الجلد بالذكاء الاصطناعي",

        selectImage:
            "يرجى اختيار صورة للجلد أو التقاط صورة أولاً لبدء التحليل.",

        analyzing:
            "جارٍ تحليل الصورة...",

        wait:
            "يقوم الذكاء الاصطناعي بفحص الصورة. يرجى الانتظار.",

        historyTitle:
            "🕘 التحليلات السابقة",

        clearHistory:
            "🗑️ مسح السجل",

        noHistory:
            "لا توجد تحليلات سابقة.",

        detected:
            "ما اكتشفه الذكاء الاصطناعي",

        meaning:
            "ماذا يعني ذلك؟",

        action:
            "ماذا يجب أن تفعل؟",

        confidence:
            "ثقة الذكاء الاصطناعي",

        screening:
            "نتيجة فحص الذكاء الاصطناعي",

        suspicious:
            "درجة الاشتباه",

        probabilities:
            "احتمالات الفئات",

        technical:
            "المعلومات التقنية للنموذج",

        modelPrediction:
            "تنبؤ النموذج",

        resultCategory:
            "فئة النتيجة",

        important:
            "مهم:",

        warning:
            "هذه النتيجة مخصصة للبحث والعرض فقط. وهي ليست تشخيصًا طبيًا. يرجى استشارة متخصص صحي مؤهل.",

        footerWarning:
            "هذا التطبيق مخصص للبحث والتعليم والعرض فقط. ولا يقدم تشخيصًا طبيًا.",

        footerAdvice:
            "يرجى استشارة متخصص صحي مؤهل للحصول على المشورة الطبية.",

        selected:
            "تم اختيار الصورة بنجاح.",

        clickAnalyze:
            "اضغط على تحليل الصورة لبدء التحليل.",

        error:
            "تعذر تحليل هذه الصورة.",

        historyPrediction:
            "النتيجة",

        historyConfidence:
            "الثقة",

        historyDate:
            "التاريخ والوقت",

        historyScreening:
            "الفحص"
    }

};


/* =========================================================
   FALLBACK TRANSLATIONS
   For languages where the full UI can use English fallback.
========================================================= */

const defaultTranslation =
    translations["en-US"];


/* =========================================================
   GET CURRENT LANGUAGE
========================================================= */

function getCurrentLanguage() {

    if (!languageSelect) {
        return "en-US";
    }

    return translations[languageSelect.value]
        ? languageSelect.value
        : "en-US";
}


/* =========================================================
   GET TRANSLATION
========================================================= */

function getTranslation() {

    return translations[getCurrentLanguage()]
        || defaultTranslation;
}


/* =========================================================
   TRANSLATE PAGE
========================================================= */

function translatePage() {

    const t = getTranslation();

    document.documentElement.lang =
        getCurrentLanguage();

    document.title =
        t.mainTitle
            .replace("🩺", "")
            .trim();

    setText(
        "mainTitle",
        t.mainTitle
    );

    setText(
        "mainSubtitle",
        t.mainSubtitle
    );

    setText(
        "languageLabel",
        t.languageLabel
    );

    setText(
        "uploadTitle",
        t.uploadTitle
    );

    setText(
        "chooseImageButton",
        t.chooseImage
    );

    setText(
        "takePhotoButton",
        t.takePhoto
    );

    setText(
        "analyzeButton",
        t.analyze
    );

    setText(
        "voiceButton",
        t.voice
    );

    setText(
        "previewTitle",
        t.previewTitle
    );

    setText(
        "historyTitle",
        t.historyTitle
    );

    setText(
        "clearHistoryButton",
        t.clearHistory
    );

    setText(
        "footerImportant",
        t.important
    );

    setText(
        "footerWarning",
        t.footerWarning
    );

    setText(
        "footerAdvice",
        t.footerAdvice
    );

    if (!lastResult) {

        setText(
            "resultTitle",
            t.resultTitle
        );

        setText(
            "resultMessage",
            t.selectImage
        );
    }

    renderHistory();

    if (lastResult) {
        displayResult(lastResult);
    }
}


/* =========================================================
   SET TEXT HELPER
========================================================= */

function setText(id, text) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = text;
    }
}


/* =========================================================
   MEDICAL INFORMATION
========================================================= */

const lesionInformation = {

    "Melanocytic nevi (nv)": {

        simpleName:
            "Common Mole / Melanocytic Nevus",

        explanation:
            "A melanocytic nevus is commonly known as a mole. Most moles are harmless, although changes in a mole should be checked by a healthcare professional.",

        action:
            "Monitor the area for changes in size, shape, colour, or appearance. If it changes or looks unusual, consider seeing a dermatologist.",

        level:
            "Usually benign"
    },


    "Melanoma (mel)": {

        simpleName:
            "Possible Melanoma",

        explanation:
            "Melanoma is a type of skin cancer that can be serious. An AI result cannot confirm melanoma, so a healthcare professional should evaluate a concerning lesion.",

        action:
            "Please consider getting the area checked by a dermatologist, especially if the lesion is changing, bleeding, growing, or looks unusual.",

        level:
            "Needs professional evaluation"
    },


    "Benign keratosis (bkl)": {

        simpleName:
            "Benign Keratosis",

        explanation:
            "This result corresponds to a type of benign skin growth called keratosis. Benign means it is generally not cancerous.",

        action:
            "If the growth is new, changing, irritated, bleeding, or concerning to you, have it evaluated by a healthcare professional.",

        level:
            "Usually benign"
    },


    "Basal cell carcinoma (bcc)": {

        simpleName:
            "Possible Basal Cell Carcinoma",

        explanation:
            "Basal cell carcinoma is a type of skin cancer. An AI screening result cannot confirm cancer and should be reviewed by a healthcare professional.",

        action:
            "Please consider a dermatology evaluation, particularly if the area is growing, bleeding, crusting, or does not heal.",

        level:
            "Needs professional evaluation"
    },


    "Actinic keratosis (akiec)": {

        simpleName:
            "Possible Actinic Keratosis",

        explanation:
            "Actinic keratosis is a skin change commonly associated with long-term sun exposure. Some actinic keratoses can require medical evaluation and treatment.",

        action:
            "Consider having the area examined by a dermatologist, especially if it persists, changes, becomes painful, or bleeds.",

        level:
            "Needs professional evaluation"
    },


    "Vascular lesion (vasc)": {

        simpleName:
            "Vascular Skin Lesion",

        explanation:
            "This category represents a skin lesion related to blood vessels. Many vascular skin lesions are not cancerous, but unusual or changing lesions should be assessed.",

        action:
            "If the lesion is changing, bleeding, painful, or concerning, consider having it examined by a healthcare professional.",

        level:
            "Usually benign, but should be assessed if unusual"
    },


    "Dermatofibroma (df)": {

        simpleName:
            "Dermatofibroma",

        explanation:
            "A dermatofibroma is a commonly benign skin growth. It is generally harmless, although an unusual or changing lesion should still be checked.",

        action:
            "Monitor the area and seek professional evaluation if it changes, grows, bleeds, becomes painful, or looks unusual.",

        level:
            "Usually benign"
    }

};


/* =========================================================
   LOCALIZED LESION NAMES
========================================================= */

const localizedLesionNames = {

    "en-US": {
        nv: "Common Mole / Melanocytic Nevus",
        mel: "Possible Melanoma",
        bkl: "Benign Keratosis",
        bcc: "Possible Basal Cell Carcinoma",
        akiec: "Possible Actinic Keratosis",
        vasc: "Vascular Skin Lesion",
        df: "Dermatofibroma"
    },

    "te-IN": {
        nv: "సాధారణ పుట్టుమచ్చ",
        mel: "మెలనోమా ఉండే అవకాశం",
        bkl: "బెనైన్ కెరటోసిస్",
        bcc: "బేసల్ సెల్ కార్సినోమా ఉండే అవకాశం",
        akiec: "ఆక్టినిక్ కెరటోసిస్ ఉండే అవకాశం",
        vasc: "రక్తనాళాలకు సంబంధించిన చర్మ గాయం",
        df: "డెర్మటోఫైబ్రోమా"
    },

    "hi-IN": {
        nv: "सामान्य तिल",
        mel: "मेलानोमा की संभावित संभावना",
        bkl: "सौम्य केराटोसिस",
        bcc: "बेसल सेल कार्सिनोमा की संभावित संभावना",
        akiec: "एक्टिनिक केराटोसिस की संभावित संभावना",
        vasc: "रक्त वाहिका संबंधी त्वचा घाव",
        df: "डर्माटोफाइब्रोमा"
    },

    "ta-IN": {
        nv: "பொதுவான மச்சம்",
        mel: "மெலனோமா இருக்கக்கூடிய வாய்ப்பு",
        bkl: "தீங்கற்ற கெரட்டோசிஸ்",
        bcc: "பேசல் செல் கார்சினோமா இருக்கக்கூடிய வாய்ப்பு",
        akiec: "ஆக்டினிக் கெரட்டோசிஸ் இருக்கக்கூடிய வாய்ப்பு",
        vasc: "இரத்த நாள தோல் காயம்",
        df: "டெர்மடோஃபைப்ரோமா"
    },

    "kn-IN": {
        nv: "ಸಾಮಾನ್ಯ ಮಚ್ಚೆ",
        mel: "ಮೆಲನೋಮಾ ಇರುವ ಸಾಧ್ಯತೆ",
        bkl: "ಬೆನೈನ್ ಕೆರಾಟೋಸಿಸ್",
        bcc: "ಬೇಸಲ್ ಸೆಲ್ ಕಾರ್ಸಿನೋಮಾ ಇರುವ ಸಾಧ್ಯತೆ",
        akiec: "ಆಕ್ಟಿನಿಕ್ ಕೆರಾಟೋಸಿಸ್ ಇರುವ ಸಾಧ್ಯತೆ",
        vasc: "ರಕ್ತನಾಳದ ಚರ್ಮದ ಗಾಯ",
        df: "ಡರ್ಮಟೋಫೈಬ್ರೋಮಾ"
    },

    "ml-IN": {
        nv: "സാധാരണ മറുക്",
        mel: "മെലനോമ ഉണ്ടാകാനുള്ള സാധ്യത",
        bkl: "ബെനിൻ കെറാറ്റോസിസ്",
        bcc: "ബേസൽ സെൽ കാർസിനോമ ഉണ്ടാകാനുള്ള സാധ്യത",
        akiec: "ആക്ടിനിക് കെറാറ്റോസിസ് ഉണ്ടാകാനുള്ള സാധ്യത",
        vasc: "രക്തക്കുഴലുമായി ബന്ധപ്പെട്ട ചർമ്മ പാട്",
        df: "ഡെർമറ്റോഫൈബ്രോമ"
    },

    "fr-FR": {
        nv: "Grain de beauté courant",
        mel: "Mélanome possible",
        bkl: "Kératose bénigne",
        bcc: "Carcinome basocellulaire possible",
        akiec: "Kératose actinique possible",
        vasc: "Lésion cutanée vasculaire",
        df: "Dermatofibrome"
    },

    "es-ES": {
        nv: "Lunar común",
        mel: "Posible melanoma",
        bkl: "Queratosis benigna",
        bcc: "Posible carcinoma basocelular",
        akiec: "Posible queratosis actínica",
        vasc: "Lesión vascular de la piel",
        df: "Dermatofibroma"
    },

    "de-DE": {
        nv: "Gewöhnlicher Leberfleck",
        mel: "Mögliches Melanom",
        bkl: "Gutartige Keratose",
        bcc: "Mögliches Basalzellkarzinom",
        akiec: "Mögliche aktinische Keratose",
        vasc: "Vaskuläre Hautläsion",
        df: "Dermatofibrom"
    },

    "it-IT": {
        nv: "Nevo comune",
        mel: "Possibile melanoma",
        bkl: "Cheratosi benigna",
        bcc: "Possibile carcinoma basocellulare",
        akiec: "Possibile cheratosi attinica",
        vasc: "Lesione cutanea vascolare",
        df: "Dermatofibroma"
    },

    "pt-PT": {
        nv: "Sinal comum",
        mel: "Possível melanoma",
        bkl: "Queratose benigna",
        bcc: "Possível carcinoma basocelular",
        akiec: "Possível queratose actínica",
        vasc: "Lesão cutânea vascular",
        df: "Dermatofibroma"
    },

    "ja-JP": {
        nv: "一般的なほくろ",
        mel: "メラノーマの可能性",
        bkl: "良性角化症",
        bcc: "基底細胞がんの可能性",
        akiec: "日光角化症の可能性",
        vasc: "血管性皮膚病変",
        df: "皮膚線維腫"
    },

    "ko-KR": {
        nv: "일반적인 점",
        mel: "흑색종 가능성",
        bkl: "양성 각화증",
        bcc: "기저세포암 가능성",
        akiec: "광선각화증 가능성",
        vasc: "혈관성 피부 병변",
        df: "피부섬유종"
    },

    "ru-RU": {
        nv: "Обычная родинка",
        mel: "Возможная меланома",
        bkl: "Доброкачественный кератоз",
        bcc: "Возможная базальноклеточная карцинома",
        akiec: "Возможный актинический кератоз",
        vasc: "Сосудистое поражение кожи",
        df: "Дерматофиброма"
    },

    "ar-SA": {
        nv: "شامة جلدية شائعة",
        mel: "احتمال وجود ميلانوما",
        bkl: "تقرن حميد",
        bcc: "احتمال وجود سرطان الخلايا القاعدية",
        akiec: "احتمال وجود التقرن السفعي",
        vasc: "آفة جلدية وعائية",
        df: "ورم ليفي جلدي"
    }

};


/* =========================================================
   FIND LESION INFORMATION
========================================================= */

function getLesionInfo(prediction) {

    if (!prediction) {

        return {

            simpleName:
                "Unknown result",

            explanation:
                "The AI could not provide a clear classification.",

            action:
                "Please try another clear image or consult a healthcare professional if you are concerned.",

            level:
                "Needs attention"
        };
    }

    const text =
        String(prediction).toLowerCase();

    for (
        const [key, info]
        of Object.entries(lesionInformation)
    ) {

        if (
            text.includes(
                key.toLowerCase()
            )
        ) {

            return info;
        }
    }

    if (text.includes("melanoma")) {

        return lesionInformation[
            "Melanoma (mel)"
        ];
    }

    if (text.includes("basal cell")) {

        return lesionInformation[
            "Basal cell carcinoma (bcc)"
        ];
    }

    if (text.includes("dermatofibroma")) {

        return lesionInformation[
            "Dermatofibroma (df)"
        ];
    }

    if (text.includes("keratosis")) {

        return lesionInformation[
            "Benign keratosis (bkl)"
        ];
    }

    if (text.includes("actinic")) {

        return lesionInformation[
            "Actinic keratosis (akiec)"
        ];
    }

    if (text.includes("vascular")) {

        return lesionInformation[
            "Vascular lesion (vasc)"
        ];
    }

    if (
        text.includes("nev") ||
        text.includes("melanocytic")
    ) {

        return lesionInformation[
            "Melanocytic nevi (nv)"
        ];
    }

    return {

        simpleName:
            prediction,

        explanation:
            "The AI produced this classification based on visual features in the uploaded image.",

        action:
            "This result should not be used as a diagnosis. If the skin area is concerning or changing, consult a healthcare professional.",

        level:
            "Needs professional evaluation"
    };
}


/* =========================================================
   GET SHORT LESION CODE
========================================================= */

function getLesionCode(prediction) {

    const text =
        String(prediction || "")
            .toLowerCase();

    if (
        text.includes("melanoma") ||
        text.includes("(mel)")
    ) {
        return "mel";
    }

    if (
        text.includes("basal") ||
        text.includes("(bcc)")
    ) {
        return "bcc";
    }

    if (
        text.includes("actinic") ||
        text.includes("(akiec)")
    ) {
        return "akiec";
    }

    if (
        text.includes("vascular") ||
        text.includes("(vasc)")
    ) {
        return "vasc";
    }

    if (
        text.includes("dermatofibroma") ||
        text.includes("(df)")
    ) {
        return "df";
    }

    if (
        text.includes("keratosis") ||
        text.includes("(bkl)")
    ) {
        return "bkl";
    }

    if (
        text.includes("nev") ||
        text.includes("melanocytic") ||
        text.includes("(nv)")
    ) {
        return "nv";
    }

    return null;
}


/* =========================================================
   GET LOCALIZED LESION NAME
========================================================= */

function getLocalizedLesionName(prediction) {

    const language =
        getCurrentLanguage();

    const code =
        getLesionCode(prediction);

    if (
        code &&
        localizedLesionNames[language] &&
        localizedLesionNames[language][code]
    ) {

        return localizedLesionNames[
            language
        ][code];
    }

    const info =
        getLesionInfo(prediction);

    return info.simpleName;
}


/* =========================================================
   SHOW SELECTED IMAGE
========================================================= */

function showSelectedImage(file) {

    if (!file) {
        return;
    }

    if (
        !file.type ||
        !file.type.startsWith("image/")
    ) {

        const t =
            getTranslation();

        if (result) {

            result.innerHTML = `
                <h2>📊 ${t.resultTitle}</h2>
                <p>❌ ${t.error}</p>
            `;
        }

        return;
    }

    selectedImage = file;

    if (previewImage) {

        previewImage.src =
            URL.createObjectURL(file);

        previewImage.style.display =
            "block";
    }

    if (analyzeButton) {

        analyzeButton.disabled =
            false;
    }

    const t =
        getTranslation();

    if (result) {

        result.innerHTML = `
            <h2>📊 ${t.resultTitle}</h2>

            <p>✅ ${t.selected}</p>

            <p>${t.clickAnalyze}</p>
        `;
    }
}


/* =========================================================
   GALLERY
========================================================= */

if (imageInput) {

    imageInput.addEventListener(
        "change",
        function () {

            const file =
                imageInput.files &&
                imageInput.files[0];

            showSelectedImage(file);
        }
    );
}


/* =========================================================
   CAMERA
========================================================= */

if (cameraInput) {

    cameraInput.addEventListener(
        "change",
        function () {

            const file =
                cameraInput.files &&
                cameraInput.files[0];

            showSelectedImage(file);
        }
    );
}


/* =========================================================
   ANALYZE IMAGE
========================================================= */

if (analyzeButton) {

    analyzeButton.addEventListener(
        "click",
        async function () {

            if (!selectedImage) {

                const t =
                    getTranslation();

                if (result) {

                    result.innerHTML = `
                        <h2>📊 ${t.resultTitle}</h2>

                        <p>⚠️ ${t.selectImage}</p>
                    `;
                }

                return;
            }

            const t =
                getTranslation();

            if (result) {

                result.innerHTML = `
                    <h2>📊 ${t.resultTitle}</h2>

                    <h3>🔬 ${t.analyzing}</h3>

                    <p>${t.wait}</p>
                `;
            }

            analyzeButton.disabled =
                true;

            try {

                const formData =
                    new FormData();

                formData.append(
                    "image",
                    selectedImage
                );

                console.log(
                    "📤 Sending image to AI API..."
                );

                console.log(
                    "API URL:",
                    API_URL
                );

                const response =
                    await fetch(
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

                    data =
                        JSON.parse(
                            responseText
                        );

                } catch (jsonError) {

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

                lastResult =
                    data;

                displayResult(data);

                saveToHistory(data);

                renderHistory();

            } catch (error) {

                console.error(
                    "❌ AI analysis error:",
                    error
                );

                if (result) {

                    result.innerHTML = `
                        <h2>📊 ${t.resultTitle}</h2>

                        <p>
                            ❌ <strong>
                                ${t.error}
                            </strong>
                        </p>

                        <p>
                            ${escapeHTML(
                                error.message
                            )}
                        </p>

                        <p>
                            Please make sure the image is clear and try again.
                        </p>
                    `;
                }

            } finally {

                analyzeButton.disabled =
                    false;
            }
        }
    );
}


/* =========================================================
   DISPLAY RESULT
========================================================= */

function displayResult(data) {

    if (!result) {
        return;
    }

    const t =
        getTranslation();

    const prediction =
        data.prediction ||
        "Unknown";

    const info =
        getLesionInfo(prediction);

    const localizedName =
        getLocalizedLesionName(
            prediction
        );

    const confidence =
        Number(
            data.confidence || 0
        );

    const suspiciousScore =
        Number(
            data.suspicious_score || 0
        );

    const screening =
        data.screening_result ||
        (
            confidence >= 70
                ? "AI result available"
                : "Result needs attention"
        );


    let output = `

        <h2>
            📊 ${t.resultTitle}
        </h2>


        <div class="prediction">

            <h3>
                🩺 ${t.detected}
            </h3>

            <h2>
                ${escapeHTML(
                    localizedName
                )}
            </h2>

            <p>
                <strong>
                    ${t.confidence}:
                </strong>

                ${confidence.toFixed(2)}%
            </p>

            <p>
                <strong>
                    ${t.screening}:
                </strong>

                ${escapeHTML(
                    translateScreening(
                        screening
                    )
                )}
            </p>

        </div>


        <div class="human-result">

            <h3>
                📖 ${t.meaning}
            </h3>

            <p>
                ${escapeHTML(
                    getLocalizedExplanation(
                        prediction
                    )
                )}
            </p>


            <h3>
                💡 ${t.action}
            </h3>

            <p>
                ${escapeHTML(
                    getLocalizedAction(
                        prediction
                    )
                )}
            </p>


            <p>

                <strong>
                    ${t.resultCategory}:
                </strong>

                ${escapeHTML(
                    getLocalizedLevel(
                        info.level
                    )
                )}

            </p>

        </div>


        <hr>


        <div class="technical-result">

            <h3>
                🔬 ${t.technical}
            </h3>

            <p>

                <strong>
                    ${t.modelPrediction}:
                </strong>

                ${escapeHTML(
                    prediction
                )}

            </p>


            <p>

                <strong>
                    ${t.suspicious}:
                </strong>

                ${suspiciousScore.toFixed(2)}%

            </p>

        </div>


        <hr>


        <h3>
            📈 ${t.probabilities}
        </h3>

    `;


    if (data.probabilities) {

        for (
            const [name, value]
            of Object.entries(
                data.probabilities
            )
        ) {

            const percentage =
                Number(value);

            output += `

                <div class="probability">

                    <p>

                        <strong>
                            ${escapeHTML(
                                name
                            )}
                        </strong>:

                        ${percentage.toFixed(2)}%

                    </p>

                </div>

            `;
        }
    }


    output += `

        <hr>


        <div class="medical-warning">

            <p>
                ⚠️
                <strong>
                    ${t.important}
                </strong>
            </p>

            <p>
                ${t.warning}
            </p>

        </div>

    `;


    result.innerHTML =
        output;
}


/* =========================================================
   LOCALIZED MEDICAL TEXT
========================================================= */

function getLocalizedExplanation(prediction) {

    const language =
        getCurrentLanguage();

    const code =
        getLesionCode(prediction);

    const info =
        getLesionInfo(prediction);

    const explanations = {

        "te-IN": {

            nv:
                "మెలనోసైటిక్ నెవస్‌ను సాధారణంగా పుట్టుమచ్చ అంటారు. చాలా పుట్టుమచ్చలు ప్రమాదకరం కావు, అయితే వాటిలో మార్పులు ఉంటే వైద్య నిపుణుడి ద్వారా పరీక్షించాలి.",

            mel:
                "మెలనోమా ఒక తీవ్రమైన చర్మ క్యాన్సర్ రకం. AI ఫలితం మెలనోమాను నిర్ధారించదు. అనుమానాస్పద ప్రాంతాన్ని వైద్య నిపుణుడు పరిశీలించాలి.",

            bkl:
                "ఇది సాధారణంగా క్యాన్సర్ కాని చర్మ పెరుగుదల అయిన బెనైన్ కెరటోసిస్‌కు సంబంధించిన ఫలితం.",

            bcc:
                "బేసల్ సెల్ కార్సినోమా ఒక చర్మ క్యాన్సర్ రకం. AI స్క్రీనింగ్ ఫలితం క్యాన్సర్‌ను నిర్ధారించదు.",

            akiec:
                "ఆక్టినిక్ కెరటోసిస్ దీర్ఘకాల సూర్యకాంతి ప్రభావంతో సంబంధం ఉన్న చర్మ మార్పు.",

            vasc:
                "ఈ వర్గం రక్తనాళాలకు సంబంధించిన చర్మ గాయాలను సూచిస్తుంది.",

            df:
                "డెర్మటోఫైబ్రోమా సాధారణంగా ప్రమాదకరం కాని చర్మ పెరుగుదల."
        },

        "hi-IN": {

            nv:
                "मेलानोसाइटिक नेवस को आमतौर पर तिल कहा जाता है। अधिकांश तिल हानिरहित होते हैं, लेकिन उनमें बदलाव होने पर स्वास्थ्य विशेषज्ञ से जांच करवानी चाहिए।",

            mel:
                "मेलानोमा त्वचा कैंसर का एक गंभीर प्रकार हो सकता है। AI परिणाम मेलानोमा की पुष्टि नहीं करता।",

            bkl:
                "यह सौम्य केराटोसिस नामक आमतौर पर गैर-कैंसरकारी त्वचा वृद्धि से संबंधित परिणाम है।",

            bcc:
                "बेसल सेल कार्सिनोमा त्वचा कैंसर का एक प्रकार है। AI स्क्रीनिंग कैंसर की पुष्टि नहीं करती।",

            akiec:
                "एक्टिनिक केराटोसिस लंबे समय तक सूर्य के संपर्क से जुड़ा त्वचा परिवर्तन है।",

            vasc:
                "यह श्रेणी रक्त वाहिकाओं से संबंधित त्वचा घावों को दर्शाती है।",

            df:
                "डर्माटोफाइब्रोमा आमतौर पर एक सौम्य त्वचा वृद्धि है।"
        }

    };


    if (
        code &&
        explanations[language] &&
        explanations[language][code]
    ) {

        return explanations[
            language
        ][code];
    }

    return info.explanation;
}


/* =========================================================
   LOCALIZED ACTION
========================================================= */

function getLocalizedAction(prediction) {

    const language =
        getCurrentLanguage();

    const code =
        getLesionCode(prediction);

    const info =
        getLesionInfo(prediction);

    const actions = {

        "te-IN": {

            nv:
                "ప్రాంతం పరిమాణం, ఆకారం లేదా రంగులో మార్పులు ఉన్నాయా గమనించండి. అసాధారణంగా కనిపిస్తే చర్మ వైద్యుడిని సంప్రదించండి.",

            mel:
                "ముఖ్యంగా గాయం మారుతున్నట్లయితే, రక్తస్రావం, పెరుగుదల లేదా అసాధారణ రూపం ఉంటే చర్మ వైద్యుడిని సంప్రదించండి.",

            bkl:
                "పెరుగుదల కొత్తగా ఉంటే, మారుతున్నట్లయితే, చికాకు లేదా రక్తస్రావం ఉంటే వైద్య నిపుణుడిని సంప్రదించండి.",

            bcc:
                "ప్రాంతం పెరుగుతున్నట్లయితే, రక్తస్రావం లేదా పొరలు ఏర్పడుతున్నట్లయితే చర్మ వైద్యుడిని సంప్రదించండి.",

            akiec:
                "ఇది కొనసాగితే, మారితే, నొప్పిగా మారితే లేదా రక్తస్రావం అయితే చర్మ వైద్యుడిని సంప్రదించండి.",

            vasc:
                "గాయం మారుతున్నట్లయితే, రక్తస్రావం లేదా నొప్పి ఉంటే వైద్య నిపుణుడిని సంప్రదించండి.",

            df:
                "పరిమాణం లేదా రూపంలో మార్పు, నొప్పి లేదా రక్తస్రావం ఉంటే వైద్య నిపుణుడిని సంప్రదించండి."
        },

        "hi-IN": {

            nv:
                "क्षेत्र के आकार, आकृति या रंग में बदलाव देखें। यदि यह असामान्य लगे तो त्वचा विशेषज्ञ से संपर्क करें।",

            mel:
                "विशेष रूप से यदि घाव बदल रहा है, खून बह रहा है, बढ़ रहा है या असामान्य दिख रहा है तो त्वचा विशेषज्ञ से जांच करवाएं।",

            bkl:
                "यदि वृद्धि नई है, बदल रही है, जलन या रक्तस्राव हो रहा है तो स्वास्थ्य विशेषज्ञ से जांच करवाएं।",

            bcc:
                "यदि क्षेत्र बढ़ रहा है, खून बह रहा है, पपड़ी बन रही है या ठीक नहीं हो रहा है तो त्वचा विशेषज्ञ से संपर्क करें।",

            akiec:
                "यदि यह बना रहता है, बदलता है, दर्द करता है या खून बहता है तो त्वचा विशेषज्ञ से संपर्क करें।",

            vasc:
                "यदि घाव बदल रहा है, खून बह रहा है या दर्द हो रहा है तो स्वास्थ्य विशेषज्ञ से जांच करवाएं।",

            df:
                "यदि इसमें बदलाव, वृद्धि, दर्द या रक्तस्राव हो तो स्वास्थ्य विशेषज्ञ से संपर्क करें।"
        }

    };


    if (
        code &&
        actions[language] &&
        actions[language][code]
    ) {

        return actions[
            language
        ][code];
    }

    return info.action;
}


/* =========================================================
   LOCALIZED LEVEL
========================================================= */

function getLocalizedLevel(level) {

    const language =
        getCurrentLanguage();

    if (language === "te-IN") {

        if (
            level.toLowerCase()
                .includes("benign")
        ) {
            return "సాధారణంగా ప్రమాదకరం కాదు";
        }

        return "వైద్య నిపుణుల పరిశీలన అవసరం";
    }

    if (language === "hi-IN") {

        if (
            level.toLowerCase()
                .includes("benign")
        ) {
            return "आमतौर पर सौम्य";
        }

        return "स्वास्थ्य विशेषज्ञ की जांच आवश्यक";
    }

    return level;
}


/* =========================================================
   SCREENING TRANSLATION
========================================================= */

function translateScreening(text) {

    const language =
        getCurrentLanguage();

    const lower =
        String(text)
            .toLowerCase();

    if (language === "te-IN") {

        if (
            lower.includes("available")
        ) {
            return "AI ఫలితం అందుబాటులో ఉంది";
        }

        return "ఫలితానికి మరింత శ్రద్ధ అవసరం";
    }

    if (language === "hi-IN") {

        if (
            lower.includes("available")
        ) {
            return "AI परिणाम उपलब्ध है";
        }

        return "परिणाम पर अधिक ध्यान आवश्यक है";
    }

    return text;
}


/* =========================================================
   SAVE HISTORY
========================================================= */

function saveToHistory(data) {

    try {

        const history =
            getHistory();

        const item = {

            id:
                Date.now(),

            timestamp:
                new Date().toISOString(),

            prediction:
                data.prediction ||
                "Unknown",

            confidence:
                Number(
                    data.confidence || 0
                ),

            suspicious_score:
                Number(
                    data.suspicious_score || 0
                ),

            screening_result:
                data.screening_result ||
                "Result needs attention",

            probabilities:
                data.probabilities ||
                {}

        };


        history.unshift(item);


        const limitedHistory =
            history.slice(0, 50);


        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(
                limitedHistory
            )
        );


        console.log(
            "✅ Analysis saved to history."
        );

    } catch (error) {

        console.error(
            "❌ Could not save history:",
            error
        );
    }
}


/* =========================================================
   GET HISTORY
========================================================= */

function getHistory() {

    try {

        const stored =
            localStorage.getItem(
                HISTORY_KEY
            );

        if (!stored) {
            return [];
        }

        const parsed =
            JSON.parse(stored);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "❌ Could not read history:",
            error
        );

        return [];
    }
}


/* =========================================================
   RENDER HISTORY
========================================================= */

function renderHistory() {

    if (!historyList) {
        return;
    }

    const history =
        getHistory();

    const t =
        getTranslation();


    if (!history.length) {

        historyList.innerHTML = `
            <p>
                ${t.noHistory}
            </p>
        `;

        return;
    }


    historyList.innerHTML =
        history.map(
            function (item) {

                const date =
                    formatDateTime(
                        item.timestamp
                    );

                const localizedName =
                    getLocalizedLesionName(
                        item.prediction
                    );

                return `

                    <div class="history-item">

                        <h3>
                            🩺
                            ${escapeHTML(
                                localizedName
                            )}
                        </h3>


                        <p>

                            <strong>
                                ${t.historyPrediction}:
                            </strong>

                            ${escapeHTML(
                                item.prediction
                            )}

                        </p>


                        <p>

                            <strong>
                                ${t.historyConfidence}:
                            </strong>

                            ${Number(
                                item.confidence || 0
                            ).toFixed(2)}%

                        </p>


                        <p>

                            <strong>
                                ${t.historyScreening}:
                            </strong>

                            ${escapeHTML(
                                translateScreening(
                                    item.screening_result
                                )
                            )}

                        </p>


                        <p>

                            <strong>
                                ${t.historyDate}:
                            </strong>

                            ${escapeHTML(
                                date
                            )}

                        </p>

                    </div>

                `;
            }
        ).join("");
}


/* =========================================================
   FORMAT DATE AND TIME
========================================================= */

function formatDateTime(timestamp) {

    try {

        const date =
            new Date(timestamp);

        return date.toLocaleString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    } catch (error) {

        return String(timestamp);
    }
}


/* =========================================================
   CLEAR HISTORY
========================================================= */

if (clearHistoryButton) {

    clearHistoryButton.addEventListener(
        "click",
        function () {

            const language =
                getCurrentLanguage();

            const messages = {

                "en-US":
                    "Are you sure you want to clear all previous analyses?",

                "te-IN":
                    "మునుపటి అన్ని విశ్లేషణలను తొలగించాలనుకుంటున్నారా?",

                "hi-IN":
                    "क्या आप सभी पिछले विश्लेषणों को हटाना चाहते हैं?",

                "ta-IN":
                    "முந்தைய அனைத்து பகுப்பாய்வுகளையும் அழிக்க விரும்புகிறீர்களா?",

                "kn-IN":
                    "ಎಲ್ಲಾ ಹಿಂದಿನ ವಿಶ್ಲೇಷಣೆಗಳನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ?",

                "ml-IN":
                    "മുമ്പത്തെ എല്ലാ വിശകലനങ്ങളും മായ്ക്കണോ?",

                "fr-FR":
                    "Voulez-vous supprimer toutes les analyses précédentes?",

                "es-ES":
                    "¿Desea eliminar todos los análisis anteriores?",

                "de-DE":
                    "Möchten Sie alle bisherigen Analysen löschen?",

                "it-IT":
                    "Vuoi eliminare tutte le analisi precedenti?",

                "pt-PT":
                    "Pretende eliminar todas as análises anteriores?",

                "ja-JP":
                    "過去のすべての分析を削除しますか？",

                "ko-KR":
                    "이전 분석을 모두 삭제하시겠습니까?",

                "ru-RU":
                    "Удалить все предыдущие анализы?",

                "ar-SA":
                    "هل تريد حذف جميع التحليلات السابقة؟"
            };


            const message =
                messages[language]
                || messages["en-US"];


            if (
                confirm(message)
            ) {

                localStorage.removeItem(
                    HISTORY_KEY
                );

                renderHistory();

                console.log(
                    "🗑️ History cleared."
                );
            }
        }
    );
}


/* =========================================================
   LANGUAGE CHANGE
========================================================= */

if (languageSelect) {

    languageSelect.addEventListener(
        "change",
        function () {

            translatePage();

            stopSpeaking();
        }
    );
}


/* =========================================================
   VOICE ASSISTANCE
========================================================= */

let availableVoices = [];


/* =========================================================
   LOAD VOICES
========================================================= */

function loadVoices() {

    if (
        !(
            "speechSynthesis"
            in window
        )
    ) {
        return;
    }

    availableVoices =
        window.speechSynthesis
            .getVoices();

    console.log(
        "Available browser voices:",
        availableVoices.map(
            function (voice) {

                return (
                    voice.name +
                    " (" +
                    voice.lang +
                    ")"
                );
            }
        )
    );
}


if (
    "speechSynthesis"
    in window
) {

    loadVoices();

    window.speechSynthesis
        .addEventListener(
            "voiceschanged",
            loadVoices
        );
}


/* =========================================================
   VOICE LANGUAGE ALIASES
========================================================= */

const VOICE_LANGUAGE_ALIASES = {

    "en-US":
        ["en-US", "en-IN", "en-GB", "en"],

    "te-IN":
        ["te-IN", "te"],

    "hi-IN":
        ["hi-IN", "hi"],

    "ta-IN":
        ["ta-IN", "ta"],

    "kn-IN":
        ["kn-IN", "kn"],

    "ml-IN":
        ["ml-IN", "ml"],

    "mr-IN":
        ["mr-IN", "mr"],

    "bn-IN":
        ["bn-IN", "bn"],

    "gu-IN":
        ["gu-IN", "gu"],

    "pa-IN":
        ["pa-IN", "pa"],

    "ur-IN":
        ["ur-IN", "ur-PK", "ur"],

    "or-IN":
        ["or-IN", "od-IN", "or"],

    "fr-FR":
        ["fr-FR", "fr"],

    "es-ES":
        ["es-ES", "es"],

    "de-DE":
        ["de-DE", "de"],

    "it-IT":
        ["it-IT", "it"],

    "pt-PT":
        ["pt-PT", "pt-BR", "pt"],

    "ja-JP":
        ["ja-JP", "ja"],

    "ko-KR":
        ["ko-KR", "ko"],

    "ru-RU":
        ["ru-RU", "ru"],

    "ar-SA":
        ["ar-SA", "ar"]
};


/* =========================================================
   FIND BEST VOICE
========================================================= */

function findBestVoice(language) {

    if (
        !(
            "speechSynthesis"
            in window
        )
    ) {
        return null;
    }


    availableVoices =
        window.speechSynthesis
            .getVoices();


    if (
        !availableVoices.length
    ) {
        return null;
    }


    const requested =
        String(
            language || "en-US"
        ).toLowerCase();


    const aliases =
        (
            VOICE_LANGUAGE_ALIASES[
                language
            ]
            || [language]
        )
        .map(
            function (code) {

                return code
                    .toLowerCase();
            }
        );


    /* Exact match */

    let voice =
        availableVoices.find(
            function (v) {

                return (
                    v.lang &&
                    v.lang
                        .toLowerCase()
                    === requested
                );
            }
        );


    if (voice) {
        return voice;
    }


    /* Alias match */

    voice =
        availableVoices.find(
            function (v) {

                if (!v.lang) {
                    return false;
                }

                return aliases.includes(
                    v.lang.toLowerCase()
                );
            }
        );


    if (voice) {
        return voice;
    }


    /* Same language code */

    const languageCode =
        requested.split("-")[0];


    voice =
        availableVoices.find(
            function (v) {

                if (!v.lang) {
                    return false;
                }

                return (
                    v.lang
                        .toLowerCase()
                        .split("-")[0]
                    === languageCode
                );
            }
        );


    return voice || null;
}


/* =========================================================
   SPEECH TEXT
========================================================= */

function createSpeechText() {

    if (!lastResult) {

        const t =
            getTranslation();

        return t.selectImage;
    }


    const t =
        getTranslation();


    const prediction =
        lastResult.prediction
        || "Unknown";


    const localizedName =
        getLocalizedLesionName(
            prediction
        );


    const explanation =
        getLocalizedExplanation(
            prediction
        );


    const action =
        getLocalizedAction(
            prediction
        );


    const confidence =
        Number(
            lastResult.confidence || 0
        );


    const screening =
        lastResult.screening_result
        || "Result needs attention";


    return `

        ${t.resultTitle}.

        ${t.detected}:
        ${localizedName}.

        ${t.meaning}:
        ${explanation}.

        ${t.action}:
        ${action}.

        ${t.confidence}:
        ${confidence.toFixed(2)} percent.

        ${t.screening}:
        ${translateScreening(
            screening
        )}.

        ${t.warning}

    `
    .replace(/\s+/g, " ")
    .trim();
}


/* =========================================================
   STOP SPEAKING
========================================================= */

function stopSpeaking() {

    if (
        "speechSynthesis"
        in window
    ) {

        window.speechSynthesis.cancel();
    }
}


/* =========================================================
   WAIT FOR VOICES
========================================================= */

function waitForVoices() {

    return new Promise(
        function (resolve) {

            if (
                !(
                    "speechSynthesis"
                    in window
                )
            ) {

                resolve([]);

                return;
            }


            const voices =
                window.speechSynthesis
                    .getVoices();


            if (voices.length) {

                resolve(voices);

                return;
            }


            let finished =
                false;


            const finish =
                function () {

                    if (finished) {
                        return;
                    }

                    finished = true;

                    window.speechSynthesis
                        .removeEventListener(
                            "voiceschanged",
                            finish
                        );

                    resolve(
                        window.speechSynthesis
                            .getVoices()
                    );
                };


            window.speechSynthesis
                .addEventListener(
                    "voiceschanged",
                    finish
                );


            setTimeout(
                finish,
                2000
            );
        }
    );
}


/* =========================================================
   VOICE BUTTON
========================================================= */

if (voiceButton) {

    voiceButton.addEventListener(
        "click",
        async function () {

            if (
                !(
                    "speechSynthesis"
                    in window
                )
            ) {

                alert(
                    "Voice assistance is not supported by this browser. Please use Google Chrome or Microsoft Edge."
                );

                return;
            }


            const language =
                getCurrentLanguage();


            const text =
                createSpeechText();


            stopSpeaking();


            await waitForVoices();


            const voice =
                findBestVoice(
                    language
                );


            console.log(
                "Selected language:",
                language
            );


            console.log(
                "Selected voice:",
                voice
            );


            if (!voice) {

                const voiceNames = {

                    "te-IN":
                        "Telugu",

                    "hi-IN":
                        "Hindi",

                    "ta-IN":
                        "Tamil",

                    "kn-IN":
                        "Kannada",

                    "ml-IN":
                        "Malayalam",

                    "mr-IN":
                        "Marathi",

                    "bn-IN":
                        "Bengali",

                    "gu-IN":
                        "Gujarati",

                    "pa-IN":
                        "Punjabi",

                    "ur-IN":
                        "Urdu",

                    "or-IN":
                        "Odia",

                    "fr-FR":
                        "French",

                    "es-ES":
                        "Spanish",

                    "de-DE":
                        "German",

                    "it-IT":
                        "Italian",

                    "pt-PT":
                        "Portuguese",

                    "ja-JP":
                        "Japanese",

                    "ko-KR":
                        "Korean",

                    "ru-RU":
                        "Russian",

                    "ar-SA":
                        "Arabic"
                };


                const voiceName =
                    voiceNames[
                        language
                    ] || language;


                alert(
                    `Your browser does not currently have a ${voiceName} speech voice installed. Windows language installation alone does not always install a browser speech voice.`
                );


                return;
            }


            const speech =
                new SpeechSynthesisUtterance(
                    text
                );


            speech.lang =
                voice.lang || language;


            speech.voice =
                voice;


            speech.rate =
                0.82;


            speech.pitch =
                1;


            speech.volume =
                1;


            speech.onstart =
                function () {

                    console.log(
                        "🔊 Speech started:",
                        language,
                        voice.name,
                        voice.lang
                    );
                };


            speech.onend =
                function () {

                    console.log(
                        "🔊 Speech finished."
                    );
                };


            speech.onerror =
                function (event) {

                    console.error(
                        "❌ Speech error:",
                        event.error
                    );

                    alert(
                        "Voice could not be played. Please check that the selected language has a speech voice installed."
                    );
                };


            window.speechSynthesis
                .speak(speech);

        }
    );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   STARTUP
========================================================= */

translatePage();

renderHistory();


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
    "✅ History storage enabled."
);

console.log(
    "✅ Multilingual interface enabled."
);

console.log(
    "✅ Voice assistance enabled."
);

console.log(
    "✅ API:",
    API_URL
);