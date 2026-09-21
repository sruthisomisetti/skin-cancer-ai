"use strict";

const LESION_TRANSLATIONS = {

    // =====================================================
    // ENGLISH
    // =====================================================

    "en-US": {
        nv: {
            name: "Melanocytic nevi",
            meaning: "Common moles or birthmarks."
        },
        mel: {
            name: "Melanoma",
            meaning: "A type of skin cancer that requires professional evaluation."
        },
        bkl: {
            name: "Benign keratosis",
            meaning: "A usually non-cancerous keratotic skin lesion."
        },
        bcc: {
            name: "Basal cell carcinoma",
            meaning: "A type of skin cancer that requires professional evaluation."
        },
        akiec: {
            name: "Actinic keratosis",
            meaning: "A sun-related skin lesion that may require medical evaluation."
        },
        vasc: {
            name: "Vascular lesion",
            meaning: "A lesion involving blood vessels."
        },
        df: {
            name: "Dermatofibroma",
            meaning: "A usually benign fibrous skin lesion."
        }
    },

    // =====================================================
    // TELUGU
    // =====================================================

    "te-IN": {
        nv: {
            name: "మెలనోసైటిక్ నెవి",
            meaning: "సాధారణ పుట్టుమచ్చలు లేదా జన్మమచ్చలు."
        },
        mel: {
            name: "మెలనోమా",
            meaning: "వైద్య నిపుణుల పరీక్ష అవసరమయ్యే ఒక రకమైన చర్మ క్యాన్సర్."
        },
        bkl: {
            name: "బెనైన్ కెరాటోసిస్",
            meaning: "సాధారణంగా క్యాన్సర్ కాని కెరాటిన్‌కు సంబంధించిన చర్మ గాయం."
        },
        bcc: {
            name: "బేసల్ సెల్ కార్సినోమా",
            meaning: "వైద్య నిపుణుల పరీక్ష అవసరమయ్యే ఒక రకమైన చర్మ క్యాన్సర్."
        },
        akiec: {
            name: "ఆక్టినిక్ కెరాటోసిస్",
            meaning: "సూర్యకాంతితో సంబంధం ఉన్న చర్మ గాయం; వైద్య పరీక్ష అవసరం కావచ్చు."
        },
        vasc: {
            name: "వాస్క్యులర్ లెషన్",
            meaning: "రక్తనాళాలకు సంబంధించిన చర్మ గాయం."
        },
        df: {
            name: "డెర్మటోఫైబ్రోమా",
            meaning: "సాధారణంగా హానికరం కాని ఫైబ్రస్ చర్మ గాయం."
        }
    },

    // =====================================================
    // HINDI
    // =====================================================

    "hi-IN": {
        nv: {
            name: "मेलानोसाइटिक नेवी",
            meaning: "सामान्य तिल या जन्मचिह्न।"
        },
        mel: {
            name: "मेलानोमा",
            meaning: "एक प्रकार का त्वचा कैंसर जिसके लिए चिकित्सकीय जांच आवश्यक है।"
        },
        bkl: {
            name: "बेनाइन केराटोसिस",
            meaning: "आमतौर पर कैंसर रहित केराटिन से संबंधित त्वचा का घाव।"
        },
        bcc: {
            name: "बेसल सेल कार्सिनोमा",
            meaning: "एक प्रकार का त्वचा कैंसर जिसके लिए चिकित्सकीय जांच आवश्यक है।"
        },
        akiec: {
            name: "एक्टिनिक केराटोसिस",
            meaning: "सूर्य की रोशनी से संबंधित त्वचा का घाव, जिसकी चिकित्सकीय जांच आवश्यक हो सकती है।"
        },
        vasc: {
            name: "वैस्कुलर घाव",
            meaning: "रक्त वाहिकाओं से संबंधित त्वचा का घाव।"
        },
        df: {
            name: "डर्माटोफाइब्रोमा",
            meaning: "आमतौर पर सौम्य रेशेदार त्वचा का घाव।"
        }
    },

    // =====================================================
    // TAMIL
    // =====================================================

    "ta-IN": {
        nv: {
            name: "மெலனோசைட்டிக் நெவி",
            meaning: "பொதுவான மச்சங்கள் அல்லது பிறவிக் குறிகள்."
        },
        mel: {
            name: "மெலனோமா",
            meaning: "மருத்துவ நிபுணரின் பரிசோதனை தேவைப்படும் ஒரு வகை தோல் புற்றுநோய்."
        },
        bkl: {
            name: "தீங்கற்ற கெரட்டோசிஸ்",
            meaning: "பொதுவாக புற்றுநோய் அல்லாத கெரட்டின் தொடர்பான தோல் புண்."
        },
        bcc: {
            name: "பேசல் செல் கார்சினோமா",
            meaning: "மருத்துவ நிபுணரின் பரிசோதனை தேவைப்படும் ஒரு வகை தோல் புற்றுநோய்."
        },
        akiec: {
            name: "ஆக்டினிக் கெரட்டோசிஸ்",
            meaning: "சூரிய ஒளியுடன் தொடர்புடைய தோல் புண்; மருத்துவ பரிசோதனை தேவைப்படலாம்."
        },
        vasc: {
            name: "இரத்த நாளப் புண்",
            meaning: "இரத்த நாளங்களுடன் தொடர்புடைய தோல் புண்."
        },
        df: {
            name: "டெர்மடோஃபைப்ரோமா",
            meaning: "பொதுவாக தீங்கற்ற நார்ச்சத்து கொண்ட தோல் புண்."
        }
    },

    // =====================================================
    // KANNADA
    // =====================================================

    "kn-IN": {
        nv: {
            name: "ಮೆಲನೋಸೈಟಿಕ್ ನೆವಿ",
            meaning: "ಸಾಮಾನ್ಯ ಮಚ್ಚೆಗಳು ಅಥವಾ ಜನ್ಮ ಗುರುತುಗಳು."
        },
        mel: {
            name: "ಮೆಲನೋಮಾ",
            meaning: "ವೈದ್ಯಕೀಯ ತಜ್ಞರ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿರುವ ಒಂದು ರೀತಿಯ ಚರ್ಮದ ಕ್ಯಾನ್ಸರ್."
        },
        bkl: {
            name: "ಬೆನೈನ್ ಕೆರಾಟೋಸಿಸ್",
            meaning: "ಸಾಮಾನ್ಯವಾಗಿ ಕ್ಯಾನ್ಸರ್ ಅಲ್ಲದ ಕೆರಾಟಿನ್ ಸಂಬಂಧಿತ ಚರ್ಮದ ಗಾಯ."
        },
        bcc: {
            name: "ಬೇಸಲ್ ಸೆಲ್ ಕಾರ್ಸಿನೋಮಾ",
            meaning: "ವೈದ್ಯಕೀಯ ತಜ್ಞರ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿರುವ ಒಂದು ರೀತಿಯ ಚರ್ಮದ ಕ್ಯಾನ್ಸರ್."
        },
        akiec: {
            name: "ಆಕ್ಟಿನಿಕ್ ಕೆರಾಟೋಸಿಸ್",
            meaning: "ಸೂರ್ಯನ ಬೆಳಕಿಗೆ ಸಂಬಂಧಿಸಿದ ಚರ್ಮದ ಗಾಯ; ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆ ಅಗತ್ಯವಾಗಬಹುದು."
        },
        vasc: {
            name: "ವಾಸ್ಕ್ಯುಲರ್ ಲೆಷನ್",
            meaning: "ರಕ್ತನಾಳಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ಚರ್ಮದ ಗಾಯ."
        },
        df: {
            name: "ಡರ್ಮಟೋಫೈಬ್ರೋಮಾ",
            meaning: "ಸಾಮಾನ್ಯವಾಗಿ ಹಾನಿಕರವಲ್ಲದ ನಾರಿನ ಚರ್ಮದ ಗಾಯ."
        }
    },

    // =====================================================
    // MALAYALAM
    // =====================================================

    "ml-IN": {
        nv: {
            name: "മെലനോസൈറ്റിക് നെവി",
            meaning: "സാധാരണ മറുകുകൾ അല്ലെങ്കിൽ ജന്മമുദ്രകൾ."
        },
        mel: {
            name: "മെലനോമ",
            meaning: "വിദഗ്ധ ഡോക്ടറുടെ പരിശോധന ആവശ്യമായ ഒരു തരത്തിലുള്ള ചർമ്മ കാൻസർ."
        },
        bkl: {
            name: "ബെനിൻ കെറാറ്റോസിസ്",
            meaning: "സാധാരണയായി കാൻസർ അല്ലാത്ത കെറാറ്റിൻ സംബന്ധമായ ചർമ്മത്തിലെ പാട്."
        },
        bcc: {
            name: "ബേസൽ സെൽ കാർസിനോമ",
            meaning: "വിദഗ്ധ ഡോക്ടറുടെ പരിശോധന ആവശ്യമായ ഒരു തരത്തിലുള്ള ചർമ്മ കാൻസർ."
        },
        akiec: {
            name: "ആക്റ്റിനിക് കെറാറ്റോസിസ്",
            meaning: "സൂര്യപ്രകാശവുമായി ബന്ധപ്പെട്ട ചർമ്മത്തിലെ പാട്; വൈദ്യപരിശോധന ആവശ്യമായേക്കാം."
        },
        vasc: {
            name: "വാസ്കുലർ ലെഷൻ",
            meaning: "രക്തക്കുഴലുകളുമായി ബന്ധപ്പെട്ട ചർമ്മത്തിലെ പാട്."
        },
        df: {
            name: "ഡെർമറ്റോഫൈബ്രോമ",
            meaning: "സാധാരണയായി ദോഷകരമല്ലാത്ത നാരുകളുള്ള ചർമ്മത്തിലെ പാട്."
        }
    },

    // =====================================================
    // MARATHI
    // =====================================================

    "mr-IN": {
        nv: {
            name: "मेलॅनोसायटिक नेव्ही",
            meaning: "सामान्य तीळ किंवा जन्मखूण."
        },
        mel: {
            name: "मेलानोमा",
            meaning: "त्वचेचा एक प्रकारचा कर्करोग ज्यासाठी वैद्यकीय तज्ज्ञांची तपासणी आवश्यक आहे."
        },
        bkl: {
            name: "बेनाइन केराटोसिस",
            meaning: "सामान्यतः कर्करोग नसलेला केराटिनशी संबंधित त्वचेचा घाव."
        },
        bcc: {
            name: "बेसल सेल कार्सिनोमा",
            meaning: "त्वचेचा एक प्रकारचा कर्करोग ज्यासाठी वैद्यकीय तज्ज्ञांची तपासणी आवश्यक आहे."
        },
        akiec: {
            name: "ॲक्टिनिक केराटोसिस",
            meaning: "सूर्यप्रकाशाशी संबंधित त्वचेचा घाव; वैद्यकीय तपासणी आवश्यक असू शकते."
        },
        vasc: {
            name: "व्हॅस्क्युलर घाव",
            meaning: "रक्तवाहिन्यांशी संबंधित त्वचेचा घाव."
        },
        df: {
            name: "डर्माटोफायब्रोमा",
            meaning: "सामान्यतः सौम्य तंतुमय त्वचेचा घाव."
        }
    },

    // =====================================================
    // BENGALI
    // =====================================================

    "bn-IN": {
        nv: {
            name: "মেলানোসাইটিক নেভি",
            meaning: "সাধারণ তিল বা জন্মদাগ।"
        },
        mel: {
            name: "মেলানোমা",
            meaning: "এক ধরনের ত্বকের ক্যান্সার যার জন্য চিকিৎসকের পরীক্ষা প্রয়োজন।"
        },
        bkl: {
            name: "বেনাইন কেরাটোসিস",
            meaning: "সাধারণত ক্যান্সার নয় এমন কেরাটিন-সম্পর্কিত ত্বকের ক্ষত।"
        },
        bcc: {
            name: "বেসাল সেল কার্সিনোমা",
            meaning: "এক ধরনের ত্বকের ক্যান্সার যার জন্য চিকিৎসকের পরীক্ষা প্রয়োজন।"
        },
        akiec: {
            name: "অ্যাক্টিনিক কেরাটোসিস",
            meaning: "সূর্যের আলোর সঙ্গে সম্পর্কিত ত্বকের ক্ষত; চিকিৎসা পরীক্ষা প্রয়োজন হতে পারে।"
        },
        vasc: {
            name: "ভাসকুলার ক্ষত",
            meaning: "রক্তনালীর সঙ্গে সম্পর্কিত ত্বকের ক্ষত।"
        },
        df: {
            name: "ডার্মাটোফাইব্রোমা",
            meaning: "সাধারণত ক্ষতিকর নয় এমন তন্তুযুক্ত ত্বকের ক্ষত।"
        }
    },

    // =====================================================
    // GUJARATI
    // =====================================================

    "gu-IN": {
        nv: {
            name: "મેલાનોસાઇટિક નેવી",
            meaning: "સામાન્ય તલ અથવા જન્મચિહ્નો."
        },
        mel: {
            name: "મેલાનોમા",
            meaning: "ત્વચાના કેન્સરનો એક પ્રકાર જેના માટે તબીબી નિષ્ણાતની તપાસ જરૂરી છે."
        },
        bkl: {
            name: "બેનાઇન કેરાટોસિસ",
            meaning: "સામાન્ય રીતે કેન્સર ન હોય તેવો કેરાટિન સંબંધિત ત્વચાનો ઘા."
        },
        bcc: {
            name: "બેઝલ સેલ કાર્સિનોમા",
            meaning: "ત્વચાના કેન્સરનો એક પ્રકાર જેના માટે તબીબી નિષ્ણાતની તપાસ જરૂરી છે."
        },
        akiec: {
            name: "એક્ટિનિક કેરાટોસિસ",
            meaning: "સૂર્યપ્રકાશ સાથે સંબંધિત ત્વચાનો ઘા; તબીબી તપાસ જરૂરી થઈ શકે છે."
        },
        vasc: {
            name: "વાસ્ક્યુલર લેઝન",
            meaning: "રક્તવાહિનીઓ સાથે સંબંધિત ત્વચાનો ઘા."
        },
        df: {
            name: "ડર્માટોફાઇબ્રોમા",
            meaning: "સામાન્ય રીતે સૌમ્ય તંતુયુક્ત ત્વચાનો ઘા."
        }
    },

    // =====================================================
    // PUNJABI
    // =====================================================

    "pa-IN": {
        nv: {
            name: "ਮੇਲਾਨੋਸਾਈਟਿਕ ਨੇਵੀ",
            meaning: "ਆਮ ਤਿਲ ਜਾਂ ਜਨਮ ਦੇ ਨਿਸ਼ਾਨ।"
        },
        mel: {
            name: "ਮੇਲਾਨੋਮਾ",
            meaning: "ਚਮੜੀ ਦੇ ਕੈਂਸਰ ਦੀ ਇੱਕ ਕਿਸਮ ਜਿਸ ਲਈ ਡਾਕਟਰੀ ਜਾਂਚ ਜ਼ਰੂਰੀ ਹੈ।"
        },
        bkl: {
            name: "ਬੇਨਾਈਨ ਕੇਰਾਟੋਸਿਸ",
            meaning: "ਆਮ ਤੌਰ 'ਤੇ ਕੈਂਸਰ ਰਹਿਤ ਕੇਰਾਟਿਨ ਨਾਲ ਸੰਬੰਧਿਤ ਚਮੜੀ ਦਾ ਜ਼ਖ਼ਮ।"
        },
        bcc: {
            name: "ਬੇਸਲ ਸੈਲ ਕਾਰਸਿਨੋਮਾ",
            meaning: "ਚਮੜੀ ਦੇ ਕੈਂਸਰ ਦੀ ਇੱਕ ਕਿਸਮ ਜਿਸ ਲਈ ਡਾਕਟਰੀ ਜਾਂਚ ਜ਼ਰੂਰੀ ਹੈ।"
        },
        akiec: {
            name: "ਐਕਟਿਨਿਕ ਕੇਰਾਟੋਸਿਸ",
            meaning: "ਸੂਰਜ ਦੀ ਰੌਸ਼ਨੀ ਨਾਲ ਸੰਬੰਧਿਤ ਚਮੜੀ ਦਾ ਜ਼ਖ਼ਮ; ਡਾਕਟਰੀ ਜਾਂਚ ਦੀ ਲੋੜ ਹੋ ਸਕਦੀ ਹੈ।"
        },
        vasc: {
            name: "ਵੈਸਕੁਲਰ ਜ਼ਖ਼ਮ",
            meaning: "ਖੂਨ ਦੀਆਂ ਨਾੜੀਆਂ ਨਾਲ ਸੰਬੰਧਿਤ ਚਮੜੀ ਦਾ ਜ਼ਖ਼ਮ।"
        },
        df: {
            name: "ਡਰਮਾਟੋਫਾਈਬਰੋਮਾ",
            meaning: "ਆਮ ਤੌਰ 'ਤੇ ਹਾਨੀਰਹਿਤ ਰੇਸ਼ੇਦਾਰ ਚਮੜੀ ਦਾ ਜ਼ਖ਼ਮ।"
        }
    },

    // =====================================================
    // URDU
    // =====================================================

    "ur-IN": {
        nv: {
            name: "میلانوسائٹک نیوی",
            meaning: "عام تل یا پیدائشی نشان۔"
        },
        mel: {
            name: "میلانومہ",
            meaning: "جلد کے کینسر کی ایک قسم جس کے لیے طبی ماہر کی جانچ ضروری ہے۔"
        },
        bkl: {
            name: "بینائن کیراٹوسس",
            meaning: "عام طور پر غیر سرطانی کیراٹن سے متعلق جلد کا زخم۔"
        },
        bcc: {
            name: "بیسل سیل کارسینوما",
            meaning: "جلد کے کینسر کی ایک قسم جس کے لیے طبی ماہر کی جانچ ضروری ہے۔"
        },
        akiec: {
            name: "ایکٹینک کیراٹوسس",
            meaning: "دھوپ سے متعلق جلد کا زخم؛ طبی جانچ کی ضرورت ہو سکتی ہے۔"
        },
        vasc: {
            name: "ویسکیولر زخم",
            meaning: "خون کی نالیوں سے متعلق جلد کا زخم۔"
        },
        df: {
            name: "ڈرماٹو فائبر و ما",
            meaning: "عام طور پر بے ضرر ریشے دار جلد کا زخم۔"
        }
    },

    // =====================================================
    // ODIA
    // =====================================================

    "or-IN": {
        nv: {
            name: "ମେଲାନୋସାଇଟିକ୍ ନେଭି",
            meaning: "ସାଧାରଣ ତିଳ କିମ୍ବା ଜନ୍ମ ଚିହ୍ନ।"
        },
        mel: {
            name: "ମେଲାନୋମା",
            meaning: "ଚର୍ମ କର୍କଟର ଏକ ପ୍ରକାର, ଯାହା ପାଇଁ ଡାକ୍ତରଙ୍କ ପରୀକ୍ଷା ଆବଶ୍ୟକ।"
        },
        bkl: {
            name: "ବେନାଇନ୍ କେରାଟୋସିସ୍",
            meaning: "ସାଧାରଣତଃ କର୍କଟ ନୁହେଁ ଏପରି କେରାଟିନ୍ ସମ୍ବନ୍ଧୀୟ ଚର୍ମ କ୍ଷତ।"
        },
        bcc: {
            name: "ବେସାଲ୍ ସେଲ୍ କାର୍ସିନୋମା",
            meaning: "ଚର୍ମ କର୍କଟର ଏକ ପ୍ରକାର, ଯାହା ପାଇଁ ଡାକ୍ତରଙ୍କ ପରୀକ୍ଷା ଆବଶ୍ୟକ।"
        },
        akiec: {
            name: "ଆକ୍ଟିନିକ୍ କେରାଟୋସିସ୍",
            meaning: "ସୂର୍ଯ୍ୟ କିରଣ ସହିତ ସମ୍ବନ୍ଧିତ ଚର୍ମ କ୍ଷତ; ଡାକ୍ତରୀ ପରୀକ୍ଷା ଆବଶ୍ୟକ ହୋଇପାରେ।"
        },
        vasc: {
            name: "ଭାସ୍କୁଲାର୍ କ୍ଷତ",
            meaning: "ରକ୍ତନଳୀ ସହିତ ସମ୍ବନ୍ଧିତ ଚର୍ମ କ୍ଷତ।"
        },
        df: {
            name: "ଡର୍ମାଟୋଫାଇବ୍ରୋମା",
            meaning: "ସାଧାରଣତଃ କ୍ଷତିକାରକ ନୁହେଁ ଏପରି ତନ୍ତୁମୟ ଚର୍ମ କ୍ଷତ।"
        }
    },

    // =====================================================
    // FRENCH
    // =====================================================

    "fr-FR": {
        nv: {
            name: "Nævus mélanocytaires",
            meaning: "Grains de beauté ou marques de naissance courants."
        },
        mel: {
            name: "Mélanome",
            meaning: "Un type de cancer de la peau nécessitant une évaluation médicale."
        },
        bkl: {
            name: "Kératose bénigne",
            meaning: "Une lésion cutanée kératosique généralement non cancéreuse."
        },
        bcc: {
            name: "Carcinome basocellulaire",
            meaning: "Un type de cancer de la peau nécessitant une évaluation médicale."
        },
        akiec: {
            name: "Kératose actinique",
            meaning: "Une lésion cutanée liée au soleil pouvant nécessiter une évaluation médicale."
        },
        vasc: {
            name: "Lésion vasculaire",
            meaning: "Une lésion cutanée impliquant les vaisseaux sanguins."
        },
        df: {
            name: "Dermatofibrome",
            meaning: "Une lésion cutanée fibreuse généralement bénigne."
        }
    },

    // =====================================================
    // SPANISH
    // =====================================================

    "es-ES": {
        nv: {
            name: "Nevos melanocíticos",
            meaning: "Lunares comunes o marcas de nacimiento."
        },
        mel: {
            name: "Melanoma",
            meaning: "Un tipo de cáncer de piel que requiere evaluación médica."
        },
        bkl: {
            name: "Queratosis benigna",
            meaning: "Una lesión cutánea queratósica que generalmente no es cancerosa."
        },
        bcc: {
            name: "Carcinoma basocelular",
            meaning: "Un tipo de cáncer de piel que requiere evaluación médica."
        },
        akiec: {
            name: "Queratosis actínica",
            meaning: "Una lesión cutánea relacionada con el sol que puede requerir evaluación médica."
        },
        vasc: {
            name: "Lesión vascular",
            meaning: "Una lesión cutánea relacionada con los vasos sanguíneos."
        },
        df: {
            name: "Dermatofibroma",
            meaning: "Una lesión cutánea fibrosa generalmente benigna."
        }
    },

    // =====================================================
    // GERMAN
    // =====================================================

    "de-DE": {
        nv: {
            name: "Melanozytäre Nävi",
            meaning: "Häufige Muttermale oder Leberflecken."
        },
        mel: {
            name: "Melanom",
            meaning: "Eine Form von Hautkrebs, die ärztlich untersucht werden muss."
        },
        bkl: {
            name: "Gutartige Keratose",
            meaning: "Eine meist nicht krebsartige keratotische Hautveränderung."
        },
        bcc: {
            name: "Basalzellkarzinom",
            meaning: "Eine Form von Hautkrebs, die ärztlich untersucht werden muss."
        },
        akiec: {
            name: "Aktinische Keratose",
            meaning: "Eine sonnenbedingte Hautveränderung, die ärztlich untersucht werden kann."
        },
        vasc: {
            name: "Gefäßläsion",
            meaning: "Eine Hautveränderung, die Blutgefäße betrifft."
        },
        df: {
            name: "Dermatofibrom",
            meaning: "Eine meist gutartige faserige Hautveränderung."
        }
    },

    // =====================================================
    // ITALIAN
    // =====================================================

    "it-IT": {
        nv: {
            name: "Nevi melanocitici",
            meaning: "Comuni nei o voglie."
        },
        mel: {
            name: "Melanoma",
            meaning: "Un tipo di tumore della pelle che richiede una valutazione medica."
        },
        bkl: {
            name: "Cheratosi benigna",
            meaning: "Una lesione cutanea cheratosica generalmente non cancerosa."
        },
        bcc: {
            name: "Carcinoma basocellulare",
            meaning: "Un tipo di tumore della pelle che richiede una valutazione medica."
        },
        akiec: {
            name: "Cheratosi attinica",
            meaning: "Una lesione cutanea correlata al sole che può richiedere una valutazione medica."
        },
        vasc: {
            name: "Lesione vascolare",
            meaning: "Una lesione cutanea che coinvolge i vasi sanguigni."
        },
        df: {
            name: "Dermatofibroma",
            meaning: "Una lesione cutanea fibrosa generalmente benigna."
        }
    },

    // =====================================================
    // PORTUGUESE
    // =====================================================

    "pt-PT": {
        nv: {
            name: "Nevos melanocíticos",
            meaning: "Sinais ou marcas de nascença comuns."
        },
        mel: {
            name: "Melanoma",
            meaning: "Um tipo de cancro da pele que requer avaliação médica."
        },
        bkl: {
            name: "Queratose benigna",
            meaning: "Uma lesão cutânea queratósica geralmente não cancerosa."
        },
        bcc: {
            name: "Carcinoma basocelular",
            meaning: "Um tipo de cancro da pele que requer avaliação médica."
        },
        akiec: {
            name: "Queratose actínica",
            meaning: "Uma lesão cutânea relacionada com o sol que pode necessitar de avaliação médica."
        },
        vasc: {
            name: "Lesão vascular",
            meaning: "Uma lesão cutânea que envolve vasos sanguíneos."
        },
        df: {
            name: "Dermatofibroma",
            meaning: "Uma lesão cutânea fibrosa geralmente benigna."
        }
    },

    // =====================================================
    // JAPANESE
    // =====================================================

    "ja-JP": {
        nv: {
            name: "メラノサイト母斑",
            meaning: "一般的なほくろや出生時のあざです。"
        },
        mel: {
            name: "メラノーマ",
            meaning: "専門医による評価が必要な皮膚がんの一種です。"
        },
        bkl: {
            name: "良性角化症",
            meaning: "通常はがんではない角化性の皮膚病変です。"
        },
        bcc: {
            name: "基底細胞癌",
            meaning: "専門医による評価が必要な皮膚がんの一種です。"
        },
        akiec: {
            name: "日光角化症",
            meaning: "日光に関連する皮膚病変で、医学的な評価が必要になる場合があります。"
        },
        vasc: {
            name: "血管性病変",
            meaning: "血管に関連する皮膚病変です。"
        },
        df: {
            name: "皮膚線維腫",
            meaning: "通常は良性の線維性皮膚病変です。"
        }
    },

    // =====================================================
    // KOREAN
    // =====================================================

    "ko-KR": {
        nv: {
            name: "멜라닌세포 모반",
            meaning: "흔한 점이나 선천성 반점입니다."
        },
        mel: {
            name: "흑색종",
            meaning: "전문 의료진의 평가가 필요한 피부암의 한 종류입니다."
        },
        bkl: {
            name: "양성 각화증",
            meaning: "일반적으로 암이 아닌 각화성 피부 병변입니다."
        },
        bcc: {
            name: "기저세포암",
            meaning: "전문 의료진의 평가가 필요한 피부암의 한 종류입니다."
        },
        akiec: {
            name: "광선각화증",
            meaning: "햇빛과 관련된 피부 병변으로 의료 평가가 필요할 수 있습니다."
        },
        vasc: {
            name: "혈관성 병변",
            meaning: "혈관과 관련된 피부 병변입니다."
        },
        df: {
            name: "피부섬유종",
            meaning: "일반적으로 양성인 섬유성 피부 병변입니다."
        }
    },

    // =====================================================
    // RUSSIAN
    // =====================================================

    "ru-RU": {
        nv: {
            name: "Меланоцитарные невусы",
            meaning: "Обычные родинки или родимые пятна."
        },
        mel: {
            name: "Меланома",
            meaning: "Тип рака кожи, требующий медицинского обследования."
        },
        bkl: {
            name: "Доброкачественный кератоз",
            meaning: "Обычно нераковое кератотическое поражение кожи."
        },
        bcc: {
            name: "Базальноклеточная карцинома",
            meaning: "Тип рака кожи, требующий медицинского обследования."
        },
        akiec: {
            name: "Актинический кератоз",
            meaning: "Поражение кожи, связанное с воздействием солнца; может потребоваться медицинское обследование."
        },
        vasc: {
            name: "Сосудистое поражение",
            meaning: "Поражение кожи, связанное с кровеносными сосудами."
        },
        df: {
            name: "Дерматофиброма",
            meaning: "Обычно доброкачественное фиброзное поражение кожи."
        }
    },

    // =====================================================
    // ARABIC
    // =====================================================

    "ar-SA": {
        nv: {
            name: "الشامات الميلانينية",
            meaning: "شامات أو علامات ولادية شائعة."
        },
        mel: {
            name: "الميلانوما",
            meaning: "نوع من سرطان الجلد يتطلب تقييماً طبياً متخصصاً."
        },
        bkl: {
            name: "التقرّن الحميد",
            meaning: "آفة جلدية متقرنة وغير سرطانية عادةً."
        },
        bcc: {
            name: "سرطان الخلايا القاعدية",
            meaning: "نوع من سرطان الجلد يتطلب تقييماً طبياً متخصصاً."
        },
        akiec: {
            name: "التقرّن السفعي",
            meaning: "آفة جلدية مرتبطة بالتعرض للشمس وقد تحتاج إلى تقييم طبي."
        },
        vasc: {
            name: "آفة وعائية",
            meaning: "آفة جلدية مرتبطة بالأوعية الدموية."
        },
        df: {
            name: "الورم الليفي الجلدي",
            meaning: "آفة جلدية ليفية حميدة عادةً."
        }
    }
};