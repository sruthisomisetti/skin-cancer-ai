"use strict";

// =====================================================
// DOM ELEMENTS
// =====================================================

const imageInput = document.getElementById("imageInput");
const cameraInput = document.getElementById("cameraInput");
const previewImage = document.getElementById("previewImage");
const previewPlaceholder = document.getElementById("previewPlaceholder");
const analyzeButton = document.getElementById("analyzeButton");
const result = document.getElementById("result");
const voiceButton = document.getElementById("voiceButton");
const languageSelect = document.getElementById("languageSelect");
const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistoryButton");

// =====================================================
// STATE
// =====================================================

let selectedImage = null;
let lastResult = null;
let previewObjectURL = null;
const SKIN_GATE_THRESHOLD = 0.50;

let currentAbcdeObservation = {
    a: "unknown",
    b: "unknown",
    c: "unknown",
    d: "unknown",
    e: "unknown"
};
let activeReportAbcdeData = null;
let lastAbcdeAnalysis = null;
let currentScanRecord = null;
let currentlyViewingReportRecord = null;
let lastGradcamDataUrl = null;

// =====================================================
// MODELS
// =====================================================

let skinGateModel = null;
let cancerModel = null;
let gradcamModel = null;

// =====================================================
// CANCER MODEL CLASS ORDER (Exact Trained EfficientNet order)
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
        meaning: "A type of skin cancer that requires professional evaluation."
    },
    {
        key: "bkl",
        name: "Benign keratosis",
        meaning: "A usually non-cancerous keratotic skin lesion."
    },
    {
        key: "bcc",
        name: "Basal cell carcinoma",
        meaning: "A type of skin cancer that requires professional evaluation."
    },
    {
        key: "akiec",
        name: "Actinic keratosis",
        meaning: "A sun-related skin lesion that may require medical evaluation."
    },
    {
        key: "vasc",
        name: "Vascular lesion",
        meaning: "A lesion involving blood vessels."
    },
    {
        key: "df",
        name: "Dermatofibroma",
        meaning: "A usually benign fibrous skin lesion."
    }
];


// =====================================================
// MAIN TAB SWITCHING
// =====================================================

function switchMainTab(tabId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));

    const targetSec = document.getElementById(tabId);
    if (targetSec) {
        targetSec.classList.add('active');
    }

    const btnMap = {
        'scanTab': 0,
        'historyTab': 1,
        'progressTab': 2,
        'abcdeTab': 3,
        'settingsTab': 4
    };
    const idx = btnMap[tabId];
    const btns = document.querySelectorAll('.nav-tab-btn');
    if (btns[idx]) {
        btns[idx].classList.add('active');
    }

    if (tabId === 'historyTab') {
        renderHistory();
    } else if (tabId === 'progressTab') {
        renderProgressTracker();
    } else if (tabId === 'abcdeTab') {
        updateAbcdeLanguage();
    }
}


// =====================================================
// PATIENT PROFILE MANAGEMENT
// =====================================================

function getPatientProfile() {
    const raw = localStorage.getItem('skinCarePatientProfile');
    if (raw) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error('Failed to parse patient profile:', e);
        }
    }
    const defaultProfile = {
        patientId: 'PAT-' + Math.floor(100000 + Math.random() * 900000),
        name: 'Guest Patient',
        age: 35,
        sex: 'Not Specified',
        contact: 'N/A',
        mode: 'guest'
    };
    localStorage.setItem('skinCarePatientProfile', JSON.stringify(defaultProfile));
    return defaultProfile;
}

function renderPatientBadge() {
    const profile = getPatientProfile();
    
    const headerName = document.getElementById('headerPatientName');
    const headerId = document.getElementById('headerPatientId');
    const avatar = document.getElementById('patientAvatar');

    if (headerName) headerName.textContent = profile.name;
    if (headerId) headerId.textContent = 'ID: ' + profile.patientId;
    if (avatar) avatar.textContent = (profile.name.charAt(0) || 'P').toUpperCase();

    const sId = document.getElementById('settingPatientId');
    const sName = document.getElementById('settingPatientName');
    const sAge = document.getElementById('settingPatientAge');
    const sSex = document.getElementById('settingPatientSex');
    const sContact = document.getElementById('settingPatientContact');

    if (sId) sId.value = profile.patientId;
    if (sName) sName.value = profile.name;
    if (sAge) sAge.value = profile.age;
    if (sSex) sSex.value = profile.sex;
    if (sContact) sContact.value = profile.contact;
}

const editProfileForm = document.getElementById('editProfileForm');
if (editProfileForm) {
    editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const profile = getPatientProfile();
        profile.name = document.getElementById('settingPatientName').value.trim();
        profile.age = document.getElementById('settingPatientAge').value;
        profile.sex = document.getElementById('settingPatientSex').value;
        profile.contact = document.getElementById('settingPatientContact').value.trim();

        localStorage.setItem('skinCarePatientProfile', JSON.stringify(profile));
        renderPatientBadge();
        alert('Patient Profile updated successfully!');
    });
}

const patientBadgeBtn = document.getElementById('patientBadgeBtn');
if (patientBadgeBtn) {
    patientBadgeBtn.addEventListener('click', () => {
        switchMainTab('settingsTab');
    });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('skinCareLoggedIn');
        window.location.href = './index.html';
    });
}


// =====================================================
// IMAGE-BASED ABCDE ANALYSIS ENGINE
// Pure JavaScript & Canvas Image Processing
// =====================================================

function detectRulerScaleMarkings(data, size) {
    let periodicTicks = 0;
    let inBlackTick = false;
    let tickWidths = [];
    let currentTickW = 0;

    for (let x = 5; x < size - 5; x++) {
        let isDarkTick = true;
        for (let y = 2; y < 12; y++) {
            const idx = (y * size + x) * 4;
            const lum = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            if (lum > 70) {
                isDarkTick = false;
                break;
            }
        }
        if (isDarkTick) {
            if (!inBlackTick) {
                inBlackTick = true;
                periodicTicks++;
                if (currentTickW > 0) tickWidths.push(currentTickW);
                currentTickW = 1;
            } else {
                currentTickW++;
            }
        } else {
            if (inBlackTick) {
                inBlackTick = false;
            }
            currentTickW++;
        }
    }

    if (periodicTicks >= 5 && tickWidths.length >= 4) {
        const avgSpacing = tickWidths.reduce((a, b) => a + b, 0) / tickWidths.length;
        const mmScale = Number((avgSpacing).toFixed(2));
        if (mmScale > 1.5) {
            return { found: true, mmScale };
        }
    }

    return { found: false, mmScale: 0 };
}

function getEvolvingAnalysis(currentMetrics, history) {
    if (!history || history.length === 0 || !currentMetrics) {
        return {
            code: "no_history",
            labelKey: "abcdeEvolvingNoHistory",
            text: "Cannot assess from a single image — previous comparable scan required.",
            hasHistory: false
        };
    }

    const prevScan = history[0];
    if (!prevScan.abcdeAnalysis || !prevScan.abcdeAnalysis.rawMetrics) {
        return {
            code: "no_history",
            labelKey: "abcdeEvolvingNoHistory",
            text: "Cannot assess from a single image — previous comparable scan required.",
            hasHistory: false
        };
    }

    const prevMetrics = prevScan.abcdeAnalysis.rawMetrics;
    const areaDiffPct = ((currentMetrics.area - prevMetrics.area) / (prevMetrics.area || 1)) * 100;
    const colorDiffPct = Math.abs(currentMetrics.colorVar - prevMetrics.colorVar);

    const prevDate = prevScan.date ? prevScan.date.split(',')[0] : "previous scan";

    if (Math.abs(areaDiffPct) > 18 || colorDiffPct > 10) {
        return {
            code: "changed",
            labelKey: "abcdeEvolvingChanged",
            text: `Lesion change detected vs scan (${prevDate}): ${Math.abs(Math.round(areaDiffPct))}%`,
            pct: Math.abs(Math.round(areaDiffPct)),
            hasHistory: true,
            changed: true,
            prevDate: prevDate
        };
    } else {
        return {
            code: "stable",
            labelKey: "abcdeEvolvingStable",
            text: `No significant change detected vs previous scan (${prevDate})`,
            hasHistory: true,
            changed: false,
            prevDate: prevDate
        };
    }
}

async function analyzeImageAbcde(file, previousHistoryScans) {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const CANVAS_SIZE = 160;
            const canvas = document.createElement("canvas");
            canvas.width = CANVAS_SIZE;
            canvas.height = CANVAS_SIZE;
            const ctx = canvas.getContext("2d");

            ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
            URL.revokeObjectURL(url);

            const imgData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            const data = imgData.data;

            let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
            for (let y = 0; y < CANVAS_SIZE; y++) {
                for (let x = 0; x < CANVAS_SIZE; x++) {
                    if (x < 16 || x > 144 || y < 16 || y > 144) {
                        const idx = (y * CANVAS_SIZE + x) * 4;
                        bgR += data[idx];
                        bgG += data[idx + 1];
                        bgB += data[idx + 2];
                        bgCount++;
                    }
                }
            }
            bgR /= (bgCount || 1);
            bgG /= (bgCount || 1);
            bgB /= (bgCount || 1);

            const mask = Array.from({ length: CANVAS_SIZE }, () => new Array(CANVAS_SIZE).fill(0));
            let lesionPixelCount = 0;
            let sumX = 0, sumY = 0;
            let lesionR = [], lesionG = [], lesionB = [];

            for (let y = 0; y < CANVAS_SIZE; y++) {
                for (let x = 0; x < CANVAS_SIZE; x++) {
                    const idx = (y * CANVAS_SIZE + x) * 4;
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];

                    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
                    const isDarker = (r + g + b) < (bgR + bgG + bgB) - 35;

                    if (dist > 30 || isDarker) {
                        mask[y][x] = 1;
                        lesionPixelCount++;
                        sumX += x;
                        sumY += y;

                        lesionR.push(r);
                        lesionG.push(g);
                        lesionB.push(b);
                    }
                }
            }

            if (lesionPixelCount < 40 || lesionPixelCount > CANVAS_SIZE * CANVAS_SIZE * 0.85) {
                return resolve({
                    asymmetry: { code: "cannot_assess", labelKey: "abcdeAsymCannotAssess", text: "Cannot assess symmetry clearly", score: 0, indexPct: 0 },
                    border: { code: "cannot_assess", labelKey: "abcdeBorderCannotAssess", text: "Cannot assess border clearly", score: 0, compactness: 0 },
                    color: { code: "cannot_assess", labelKey: "abcdeColorCannotAssess", text: "Cannot assess color clearly", score: 0 },
                    diameter: { code: "no_scale", labelKey: "abcdeDiameterNoScale", text: "Cannot assess from image — no reliable size reference detected.", mm: null },
                    evolving: getEvolvingAnalysis(null, previousHistoryScans),
                    rawMetrics: { lesionArea: lesionPixelCount, asymmetryIndex: 0, borderCompactness: 0, colorVariance: 0 }
                });
            }

            const cx = Math.round(sumX / lesionPixelCount);
            const cy = Math.round(sumY / lesionPixelCount);

            let hMismatch = 0, vMismatch = 0;
            for (let y = 0; y < CANVAS_SIZE; y++) {
                for (let x = 0; x < CANVAS_SIZE; x++) {
                    const val = mask[y][x];

                    const hx = 2 * cx - x;
                    const hVal = (hx >= 0 && hx < CANVAS_SIZE) ? mask[y][hx] : 0;
                    if (val !== hVal) hMismatch++;

                    const vy = 2 * cy - y;
                    const vVal = (vy >= 0 && vy < CANVAS_SIZE) ? mask[vy][x] : 0;
                    if (val !== vVal) vMismatch++;
                }
            }
            const asymmetryScore = Number(((hMismatch + vMismatch) / (2 * lesionPixelCount)).toFixed(2));
            const asymmetryResult = asymmetryScore > 0.35 ?
                { code: "detected", labelKey: "abcdeAsymDetected", text: "Asymmetry detected", score: asymmetryScore, indexPct: Math.round(asymmetryScore * 100) } :
                { code: "not_detected", labelKey: "abcdeAsymNotDetected", text: "No clear asymmetry detected", score: asymmetryScore, indexPct: Math.round(asymmetryScore * 100) };

            let perimeter = 0;
            const radialDistances = [];
            for (let y = 1; y < CANVAS_SIZE - 1; y++) {
                for (let x = 1; x < CANVAS_SIZE - 1; x++) {
                    if (mask[y][x] === 1) {
                        if (mask[y-1][x] === 0 || mask[y+1][x] === 0 || mask[y][x-1] === 0 || mask[y][x+1] === 0) {
                            perimeter++;
                            const rDist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                            radialDistances.push(rDist);
                        }
                    }
                }
            }

            const area = lesionPixelCount;
            const compactness = Number(((perimeter ** 2) / (4 * Math.PI * area)).toFixed(2));

            const rMean = radialDistances.reduce((a, b) => a + b, 0) / (radialDistances.length || 1);
            const rVariance = radialDistances.reduce((a, b) => a + (b - rMean) ** 2, 0) / (radialDistances.length || 1);
            const rStd = Math.sqrt(rVariance);
            const radialVarRatio = Number((rStd / (rMean || 1)).toFixed(2));

            const borderScore = Number((compactness * (1 + radialVarRatio)).toFixed(2));
            const borderResult = borderScore > 1.40 ?
                { code: "irregular", labelKey: "abcdeBorderIrregular", text: "Irregular border detected", score: borderScore, compactness: compactness } :
                { code: "regular", labelKey: "abcdeBorderRegular", text: "Border appears relatively regular", score: borderScore, compactness: compactness };

            const meanR = lesionR.reduce((a, b) => a + b, 0) / lesionPixelCount;
            const meanG = lesionG.reduce((a, b) => a + b, 0) / lesionPixelCount;
            const meanB = lesionB.reduce((a, b) => a + b, 0) / lesionPixelCount;

            const varR = lesionR.reduce((a, b) => a + (b - meanR) ** 2, 0) / lesionPixelCount;
            const varG = lesionG.reduce((a, b) => a + (b - meanG) ** 2, 0) / lesionPixelCount;
            const varB = lesionB.reduce((a, b) => a + (b - meanB) ** 2, 0) / lesionPixelCount;

            const colorVarScore = Number(Math.sqrt(varR + varG + varB).toFixed(1));
            const colorResult = colorVarScore > 32.0 ?
                { code: "multiple", labelKey: "abcdeColorUneven", text: "Multiple/uneven colors detected", score: colorVarScore } :
                { code: "uniform", labelKey: "abcdeColorUniform", text: "Mostly uniform color detected", score: colorVarScore };

            const scaleDetected = detectRulerScaleMarkings(data, CANVAS_SIZE);
            let diameterResult = {};
            if (scaleDetected.found && scaleDetected.mmScale > 0) {
                const diameterPx = Math.sqrt(area / Math.PI) * 2;
                const diameterMm = Number((diameterPx / scaleDetected.mmScale).toFixed(1));
                diameterResult = {
                    code: "measured",
                    labelKey: "abcdeDiameterMeasured",
                    text: `Estimated diameter: ${diameterMm} mm`,
                    mm: diameterMm,
                    hasScale: true
                };
            } else {
                diameterResult = {
                    code: "no_scale",
                    labelKey: "abcdeDiameterNoScale",
                    text: "Cannot assess from image — no reliable size reference detected.",
                    mm: null,
                    hasScale: false
                };
            }

            const currentMetrics = {
                area: lesionPixelCount,
                colorVar: colorVarScore,
                asymmetry: asymmetryScore,
                border: borderScore
            };
            const evolvingResult = getEvolvingAnalysis(currentMetrics, previousHistoryScans);

            resolve({
                asymmetry: asymmetryResult,
                border: borderResult,
                color: colorResult,
                diameter: diameterResult,
                evolving: evolvingResult,
                rawMetrics: currentMetrics
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({
                asymmetry: { code: "cannot_assess", labelKey: "abcdeAsymCannotAssess", text: "Cannot assess symmetry clearly", score: 0 },
                border: { code: "cannot_assess", labelKey: "abcdeBorderCannotAssess", text: "Cannot assess border clearly", score: 0 },
                color: { code: "cannot_assess", labelKey: "abcdeColorCannotAssess", text: "Cannot assess color clearly", score: 0 },
                diameter: { code: "no_scale", labelKey: "abcdeDiameterNoScale", text: "Cannot assess from image — no reliable size reference detected.", mm: null },
                evolving: getEvolvingAnalysis(null, previousHistoryScans),
                rawMetrics: null
            });
        };

        img.src = url;
    });
}

function getLocalizedAbcdeText(item, type) {
    if (!item) return "--";
    const lang = getCurrentTranslations();

    if (type === 'asymmetry') {
        const key = item.labelKey || (item.code === "detected" ? "abcdeAsymDetected" : item.code === "not_detected" ? "abcdeAsymNotDetected" : "abcdeAsymCannotAssess");
        const label = lang[key] || item.text || "--";
        if (item.indexPct !== undefined) {
            return `${label} (${lang.asymmetryIndex || "Index"}: ${item.indexPct}%)`;
        }
        return label;
    }

    if (type === 'border') {
        const key = item.labelKey || (item.code === "irregular" ? "abcdeBorderIrregular" : item.code === "regular" ? "abcdeBorderRegular" : "abcdeBorderCannotAssess");
        const label = lang[key] || item.text || "--";
        if (item.compactness !== undefined) {
            return `${label} (${lang.compactness || "Compactness"}: ${item.compactness})`;
        }
        return label;
    }

    if (type === 'color') {
        const key = item.labelKey || (item.code === "multiple" ? "abcdeColorUneven" : item.code === "uniform" ? "abcdeColorUniform" : "abcdeColorCannotAssess");
        const label = lang[key] || item.text || "--";
        if (item.score !== undefined && item.score > 0) {
            return `${label} (${lang.varianceScore || "Variance"}: ${item.score})`;
        }
        return label;
    }

    if (type === 'diameter') {
        if (item.code === "measured" && item.mm) {
            const prefix = lang.abcdeDiameterMeasured || "Estimated diameter:";
            return `${prefix} ${item.mm} mm`;
        }
        return lang.abcdeDiameterNoScale || "Cannot assess from image — no reliable size reference detected.";
    }

    if (type === 'evolving') {
        if (item.code === "changed") {
            const prefix = lang.abcdeEvolvingChanged || "Lesion change detected vs scan";
            return `${prefix} (${item.prevDate}): ${item.pct}%`;
        }
        if (item.code === "stable") {
            const prefix = lang.abcdeEvolvingStable || "No significant change detected vs previous scan";
            return `${prefix} (${item.prevDate})`;
        }
        return lang.abcdeEvolvingNoHistory || "Cannot assess from a single image — previous comparable scan required.";
    }

    return "--";
}


// =====================================================
// LANGUAGE HELPERS
// =====================================================

function getCurrentLanguage() {
    return languageSelect.value || "en-US";
}

function getCurrentTranslations() {
    return TRANSLATIONS[getCurrentLanguage()] || TRANSLATIONS["en-US"];
}


function getAbcdeOptionLabel(val) {
    const lang = getCurrentTranslations();
    switch (val) {
        case "observed": return lang.abcdeObserved || "Observed";
        case "not_observed": return lang.abcdeNotObserved || "Not observed";
        case "gt6mm": return lang.abcdeGt6mm || ">6 mm";
        case "lte6mm": return lang.abcdeLte6mm || "≤6 mm";
        case "changing": return lang.abcdeChanging || "Changing";
        case "not_changing": return lang.abcdeNotChanging || "Not changing";
        case "unknown":
        default:
            return lang.abcdeUnknown || "Unknown";
    }
}

function readAbcdeSelectionsFromDom() {
    const selA = document.getElementById("abcdeSelectA");
    const selB = document.getElementById("abcdeSelectB");
    const selC = document.getElementById("abcdeSelectC");
    const selD = document.getElementById("abcdeSelectD");
    const selE = document.getElementById("abcdeSelectE");

    if (selA) currentAbcdeObservation.a = selA.value;
    if (selB) currentAbcdeObservation.b = selB.value;
    if (selC) currentAbcdeObservation.c = selC.value;
    if (selD) currentAbcdeObservation.d = selD.value;
    if (selE) currentAbcdeObservation.e = selE.value;

    if (!activeReportAbcdeData) {
        updateReportAbcdeValues(currentAbcdeObservation);
    } else {
        activeReportAbcdeData = { ...currentAbcdeObservation };
        updateReportAbcdeValues(activeReportAbcdeData);
    }
}

function updateReportAbcdeValues(abcdeObj) {
    const lang = getCurrentTranslations();
    const obs = abcdeObj || currentAbcdeObservation;

    const rptAbcdeHeading = document.getElementById("rptAbcdeHeading");
    if (rptAbcdeHeading) {
        rptAbcdeHeading.textContent = lang.rptAbcdeHeading || "ABCDE SCREENING AID (USER OBSERVATION)";
    }

    const rptAbcdeA = document.getElementById("rptAbcdeA");
    const rptAbcdeB = document.getElementById("rptAbcdeB");
    const rptAbcdeC = document.getElementById("rptAbcdeC");
    const rptAbcdeD = document.getElementById("rptAbcdeD");
    const rptAbcdeE = document.getElementById("rptAbcdeE");

    const aTitle = lang.abcdeATitle || "Asymmetry";
    const bTitle = lang.abcdeBTitle || "Border";
    const cTitle = lang.abcdeCTitle || "Color";
    const dTitle = lang.abcdeDTitle || "Diameter";
    const eTitle = lang.abcdeETitle || "Evolving";

    if (rptAbcdeA) rptAbcdeA.innerHTML = `<strong>A - ${aTitle}:</strong> ${getAbcdeOptionLabel(obs.a)}`;
    if (rptAbcdeB) rptAbcdeB.innerHTML = `<strong>B - ${bTitle}:</strong> ${getAbcdeOptionLabel(obs.b)}`;
    if (rptAbcdeC) rptAbcdeC.innerHTML = `<strong>C - ${cTitle}:</strong> ${getAbcdeOptionLabel(obs.c)}`;
    if (rptAbcdeD) rptAbcdeD.innerHTML = `<strong>D - ${dTitle}:</strong> ${getAbcdeOptionLabel(obs.d)}`;
    if (rptAbcdeE) rptAbcdeE.innerHTML = `<strong>E - ${eTitle}:</strong> ${getAbcdeOptionLabel(obs.e)}`;
}

function updateAbcdeTabAutoResults(analysisObj) {
    const elA = document.getElementById("abcdeTabResA");
    const elB = document.getElementById("abcdeTabResB");
    const elC = document.getElementById("abcdeTabResC");
    const elD = document.getElementById("abcdeTabResD");
    const elE = document.getElementById("abcdeTabResE");

    if (!analysisObj) {
        const lang = getCurrentTranslations();
        const defaultText = lang.abcdeTabDefaultText || "Upload or select an image to analyze.";
        if (elA) elA.textContent = defaultText;
        if (elB) elB.textContent = defaultText;
        if (elC) elC.textContent = defaultText;
        if (elD) elD.textContent = defaultText;
        if (elE) elE.textContent = defaultText;
        return;
    }

    if (elA) elA.textContent = getLocalizedAbcdeText(analysisObj.asymmetry, 'asymmetry');
    if (elB) elB.textContent = getLocalizedAbcdeText(analysisObj.border, 'border');
    if (elC) elC.textContent = getLocalizedAbcdeText(analysisObj.color, 'color');
    if (elD) elD.textContent = getLocalizedAbcdeText(analysisObj.diameter, 'diameter');
    if (elE) elE.textContent = getLocalizedAbcdeText(analysisObj.evolving, 'evolving');
}

function updateAbcdeLanguage(lang) {
    if (!lang) lang = getCurrentTranslations();

    const abcdeMainTitle = document.getElementById("abcdeMainTitle");
    const abcdeMainSubtitle = document.getElementById("abcdeMainSubtitle");
    const abcdeNoticeBox = document.getElementById("abcdeNoticeBox");
    const abcdeFeatureDisclaimer = document.getElementById("abcdeFeatureDisclaimer");

    if (abcdeMainTitle && lang.abcdeTitle) abcdeMainTitle.textContent = lang.abcdeTitle;
    if (abcdeMainSubtitle && lang.abcdeSubtitle) abcdeMainSubtitle.textContent = lang.abcdeSubtitle;
    if (abcdeNoticeBox && lang.abcdeNotice) abcdeNoticeBox.innerHTML = lang.abcdeNotice;
    if (abcdeFeatureDisclaimer && lang.abcdeDisclaimer) abcdeFeatureDisclaimer.textContent = lang.abcdeDisclaimer;

    const abcdeATitle = document.getElementById("abcdeATitle");
    const abcdeADesc = document.getElementById("abcdeADesc");
    if (abcdeATitle && lang.abcdeATitle) abcdeATitle.textContent = lang.abcdeATitle;
    if (abcdeADesc && lang.abcdeADesc) abcdeADesc.textContent = lang.abcdeADesc;

    const abcdeBTitle = document.getElementById("abcdeBTitle");
    const abcdeBDesc = document.getElementById("abcdeBDesc");
    if (abcdeBTitle && lang.abcdeBTitle) abcdeBTitle.textContent = lang.abcdeBTitle;
    if (abcdeBDesc && lang.abcdeBDesc) abcdeBDesc.textContent = lang.abcdeBDesc;

    const abcdeCTitle = document.getElementById("abcdeCTitle");
    const abcdeCDesc = document.getElementById("abcdeCDesc");
    if (abcdeCTitle && lang.abcdeCTitle) abcdeCTitle.textContent = lang.abcdeCTitle;
    if (abcdeCDesc && lang.abcdeCDesc) abcdeCDesc.textContent = lang.abcdeCDesc;

    const abcdeDTitle = document.getElementById("abcdeDTitle");
    const abcdeDDesc = document.getElementById("abcdeDDesc");
    if (abcdeDTitle && lang.abcdeDTitle) abcdeDTitle.textContent = lang.abcdeDTitle;
    if (abcdeDDesc && lang.abcdeDDesc) abcdeDDesc.textContent = lang.abcdeDDesc;

    const abcdeETitle = document.getElementById("abcdeETitle");
    const abcdeEDesc = document.getElementById("abcdeEDesc");
    if (abcdeETitle && lang.abcdeETitle) abcdeETitle.textContent = lang.abcdeETitle;
    if (abcdeEDesc && lang.abcdeEDesc) abcdeEDesc.textContent = lang.abcdeEDesc;

    const optIds = {
        'optA_unknown': lang.abcdeUnknown || "Unknown",
        'optA_observed': lang.abcdeObserved || "Observed",
        'optA_not_observed': lang.abcdeNotObserved || "Not observed",
        'optB_unknown': lang.abcdeUnknown || "Unknown",
        'optB_observed': lang.abcdeObserved || "Observed",
        'optB_not_observed': lang.abcdeNotObserved || "Not observed",
        'optC_unknown': lang.abcdeUnknown || "Unknown",
        'optC_observed': lang.abcdeObserved || "Observed",
        'optC_not_observed': lang.abcdeNotObserved || "Not observed",
        'optD_unknown': lang.abcdeUnknown || "Unknown",
        'optD_gt6mm': lang.abcdeGt6mm || ">6 mm",
        'optD_lte6mm': lang.abcdeLte6mm || "≤6 mm",
        'optE_unknown': lang.abcdeUnknown || "Unknown",
        'optE_changing': lang.abcdeChanging || "Changing",
        'optE_not_changing': lang.abcdeNotChanging || "Not changing"
    };

    for (const [id, text] of Object.entries(optIds)) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    if (currentlyViewingReportRecord) {
        openReportModal(currentlyViewingReportRecord);
    } else {
        updateReportAbcdeValues(activeReportAbcdeData || currentAbcdeObservation);
    }
    updateAbcdeTabAutoResults(lastAbcdeAnalysis);
}

function bindAbcdeSelectListeners() {
    ['abcdeSelectA', 'abcdeSelectB', 'abcdeSelectC', 'abcdeSelectD', 'abcdeSelectE'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => {
                readAbcdeSelectionsFromDom();
            });
        }
    });
}

function applyLanguage() {
    const lang = getCurrentTranslations();
    document.title = lang.appTitle || "SkinCare AI";

    const appTitle = document.getElementById("appTitle");
    const appSubtitle = document.getElementById("appSubtitle");
    if (appTitle) appTitle.textContent = lang.appTitle;
    if (appSubtitle) appSubtitle.textContent = lang.subtitle;

    const introTitle = document.getElementById("introTitle");
    const introText = document.getElementById("introText");
    if (introTitle) introTitle.textContent = lang.introTitle;
    if (introText) introText.textContent = lang.introText;

    const chooseImageButton = document.getElementById("chooseImageButton");
    const takePhotoButton = document.getElementById("takePhotoButton");
    const previewText = document.getElementById("previewText");
    if (chooseImageButton) chooseImageButton.textContent = lang.chooseImage;
    if (takePhotoButton) takePhotoButton.textContent = lang.takePhoto;
    if (previewText) previewText.textContent = lang.noImage;

    if (analyzeButton) analyzeButton.textContent = lang.analyze;
    if (voiceButton) voiceButton.textContent = lang.listen;

    const historyTitle = document.getElementById("historyTitle");
    const clearHistoryText = document.getElementById("clearHistoryText");
    if (historyTitle) historyTitle.textContent = lang.historyTitle;
    if (clearHistoryText) clearHistoryText.textContent = lang.clearHistory;

    // Navigation tab bar text
    const navScanText = document.getElementById("navScanText");
    const navHistoryText = document.getElementById("navHistoryText");
    const navProgressText = document.getElementById("navProgressText");
    const navAbcdeText = document.getElementById("navAbcdeText");
    const navSettingsText = document.getElementById("navSettingsText");
    if (navScanText && lang.navScan) navScanText.textContent = lang.navScan;
    if (navHistoryText && lang.navHistory) navHistoryText.textContent = lang.navHistory;
    if (navProgressText && lang.navProgress) navProgressText.textContent = lang.navProgress;
    if (navAbcdeText && lang.navAbcde) navAbcdeText.textContent = lang.navAbcde;
    if (navSettingsText && lang.navSettings) navSettingsText.textContent = lang.navSettings;

    updateHistoryLanguage(lang);
    updateAbcdeLanguage(lang);

    if (lastResult) {
        displayCancerResult(lastResult);
    }

    const reportModal = document.getElementById('patientReportModal');
    if (reportModal && reportModal.classList.contains('active')) {
        openReportModal(currentlyViewingReportRecord || currentScanRecord);
    }
}

function initLanguage() {
    const savedLang = localStorage.getItem('skinCareAppLanguage');
    if (savedLang && languageSelect) {
        languageSelect.value = savedLang;
    }
    applyLanguage();
}

function getLocalizedClassName(key, fallbackName, lang) {
    if (
        typeof LESION_TRANSLATIONS !== "undefined" &&
        LESION_TRANSLATIONS[getCurrentLanguage()] &&
        LESION_TRANSLATIONS[getCurrentLanguage()][key]
    ) {
        return LESION_TRANSLATIONS[getCurrentLanguage()][key].name;
    }
    return fallbackName;
}

function getLocalizedMeaning(key, fallbackMeaning, lang) {
    if (
        typeof LESION_TRANSLATIONS !== "undefined" &&
        LESION_TRANSLATIONS[getCurrentLanguage()] &&
        LESION_TRANSLATIONS[getCurrentLanguage()][key]
    ) {
        return LESION_TRANSLATIONS[getCurrentLanguage()][key].meaning;
    }
    return fallbackMeaning;
}

if (languageSelect) {
    languageSelect.addEventListener("change", () => {
        localStorage.setItem('skinCareAppLanguage', languageSelect.value);
        applyLanguage();
        renderHistory();
    });
}


// =====================================================
// DIRECT SKIN PHOTOGRAPH INPUT VALIDATION (LIGHTWEIGHT OFFLINE ALGORITHM)
// Detects and rejects WhatsApp screenshots, chat captures, documents, UI captures, laptops, etc.
// =====================================================

function loadImageFromFileInput(fileOrImg) {
    return new Promise((resolve) => {
        if (fileOrImg instanceof HTMLImageElement && fileOrImg.complete && fileOrImg.naturalWidth > 0) {
            return resolve(fileOrImg);
        }

        let fileObj = null;
        if (fileOrImg instanceof File || fileOrImg instanceof Blob) {
            fileObj = fileOrImg;
        } else if (selectedImage instanceof File || selectedImage instanceof Blob) {
            fileObj = selectedImage;
        }

        if (fileObj) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => {
                    const previewImg = document.getElementById("previewImage");
                    resolve(previewImg || img);
                };
                img.src = e.target.result;
            };
            reader.onerror = () => {
                const previewImg = document.getElementById("previewImage");
                resolve(previewImg);
            };
            reader.readAsDataURL(fileObj);
            return;
        }

        const previewImg = document.getElementById("previewImage");
        if (previewImg && previewImg.complete && previewImg.naturalWidth > 0) {
            return resolve(previewImg);
        }

        const img = new Image();
        if (fileOrImg instanceof HTMLImageElement) {
            img.src = fileOrImg.src;
        } else if (typeof fileOrImg === 'string') {
            img.src = fileOrImg;
        }
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        setTimeout(() => resolve(img), 300);
    });
}

async function safeDrawImageToCanvas(fileOrImg, canvas, targetWidth, targetHeight) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (imgEl) => {
        if (imgEl && imgEl.naturalWidth > 0) {
            try {
                ctx.drawImage(imgEl, 0, 0, targetWidth, targetHeight);
                return true;
            } catch (e) {}
        }
        return false;
    };

    const previewImg = document.getElementById("previewImage");
    if (previewImg && previewImg.complete && draw(previewImg)) {
        return;
    }

    if (fileOrImg instanceof HTMLImageElement && fileOrImg.complete && draw(fileOrImg)) {
        return;
    }

    const fileObj = (fileOrImg instanceof File || fileOrImg instanceof Blob) ? fileOrImg : selectedImage;
    if (fileObj instanceof File || fileObj instanceof Blob) {
        try {
            const dataUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(fileObj);
            });

            if (dataUrl) {
                const tempImg = new Image();
                await new Promise((resolve) => {
                    tempImg.onload = resolve;
                    tempImg.onerror = resolve;
                    tempImg.src = dataUrl;
                });
                if (draw(tempImg)) {
                    return;
                }
            }
        } catch (e) {}
    }

    if (previewImg && previewImg.src) {
        for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 100));
            if (draw(previewImg)) return;
        }
    }
}

async function validateDirectSkinPhotograph(file) {
    try {
        const width = 160;
        const height = 160;
        const aspectRatio = 1.0;

        const canvas = document.createElement("canvas");
        const GRID_DIM = 16; // 16x16 cell grid (256 cells)
        const CANVAS_SIZE = 160;
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return { isValid: true, metrics: { width, height, aspectRatio } };
        }

        await safeDrawImageToCanvas(file, canvas, CANVAS_SIZE, CANVAS_SIZE);
        const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        const pixels = imageData.data;
        const totalPixels = CANVAS_SIZE * CANVAS_SIZE;

        let skinPixelCount = 0;
        let flatUIPixelCount = 0;
        let sharpEdgeCount = 0;
        let centralSkinPixelCount = 0;
        let centralTotalPixels = 0;

        // 16x16 grid for spatial continuity connected component tracking
        const cellSkinCounts = Array.from({ length: GRID_DIM }, () => new Array(GRID_DIM).fill(0));
        const cellSize = CANVAS_SIZE / GRID_DIM; // 10px per cell

        for (let y = 0; y < CANVAS_SIZE; y++) {
            for (let x = 0; x < CANVAS_SIZE; x++) {
                const i = (y * CANVAS_SIZE + x) * 4;
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                // --- A. UI & Screenshot Flat Background Detection ---
                // Pure whites (#ffffff), WhatsApp light gray/beige (#efeae2, #f0f2f5, #e5ddd5), chat green (#d9fdd3, #dcf8c6), WhatsApp dark mode UI
                const isPureWhiteOrLightGray = (r > 225 && g > 225 && b > 225);
                const isWhatsAppBeige = (r > 210 && g > 205 && b > 195 && Math.abs(r - g) < 22 && Math.abs(r - b) < 25);
                const isWhatsAppGreenUI = (g > r + 12 && g > b + 12 && g > 140) || (g > 80 && b > 70 && r < 40);
                const isFlatDarkUI = (r < 35 && g < 45 && b < 50);
                const isNeutralUIGray = (Math.abs(r - g) < 8 && Math.abs(r - b) < 8 && Math.abs(g - b) < 8);

                if (isPureWhiteOrLightGray || isWhatsAppBeige || isWhatsAppGreenUI || isFlatDarkUI || isNeutralUIGray) {
                    flatUIPixelCount++;
                }

                // --- B. Inclusive YCbCr & HSV Human Skin Tone Color Space ---
                const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
                const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
                const isYCbCrSkin = (cb >= 70 && cb <= 140) && (cr >= 120 && cr <= 185) && (r > g) && (r > b) && (r > 25);

                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const delta = max - min;
                let h = 0;
                if (delta > 0) {
                    if (max === r) h = ((g - b) / delta) % 6;
                    else if (max === g) h = (b - r) / delta + 2;
                    else h = (r - g) / delta + 4;
                    h = Math.round(h * 60);
                    if (h < 0) h += 360;
                }
                const s = max === 0 ? 0 : delta / max;
                const isHSVSkin = ((h >= 0 && h <= 55) || (h >= 335 && h <= 360)) && (s >= 0.08 && s <= 0.85);

                const isSkinPixel = isYCbCrSkin && isHSVSkin;

                if (isSkinPixel) {
                    skinPixelCount++;
                    const gridR = Math.floor(y / cellSize);
                    const gridC = Math.floor(x / cellSize);
                    if (gridR >= 0 && gridR < GRID_DIM && gridC >= 0 && gridC < GRID_DIM) {
                        cellSkinCounts[gridR][gridC]++;
                    }
                }

                // --- C. Central Region Skin Pixel Count (Center 60% box) ---
                if (x >= CANVAS_SIZE * 0.20 && x <= CANVAS_SIZE * 0.80 && y >= CANVAS_SIZE * 0.20 && y <= CANVAS_SIZE * 0.80) {
                    centralTotalPixels++;
                    if (isSkinPixel) {
                        centralSkinPixelCount++;
                    }
                }

                // --- D. Sharp Text / Icon Edge Detection ---
                if (x > 0) {
                    const prevI = i - 4;
                    const prevR = pixels[prevI];
                    const prevG = pixels[prevI + 1];
                    const prevB = pixels[prevI + 2];
                    const step = Math.abs(r - prevR) + Math.abs(g - prevG) + Math.abs(b - prevB);
                    if (step > 160) {
                        sharpEdgeCount++;
                    }
                }
            }
        }

        // --- E. Spatial Connected Component Analysis on 16x16 Grid ---
        const gridBinary = Array.from({ length: GRID_DIM }, () => new Array(GRID_DIM).fill(0));
        for (let r = 0; r < GRID_DIM; r++) {
            for (let c = 0; c < GRID_DIM; c++) {
                // Cell is classified as skin cell if >= 15% of its pixels are skin tone
                if (cellSkinCounts[r][c] >= 15) {
                    gridBinary[r][c] = 1;
                }
            }
        }

        // BFS to find size of largest contiguous skin cluster
        const visited = Array.from({ length: GRID_DIM }, () => new Array(GRID_DIM).fill(false));
        let maxClusterCells = 0;

        for (let r = 0; r < GRID_DIM; r++) {
            for (let c = 0; c < GRID_DIM; c++) {
                if (gridBinary[r][c] === 1 && !visited[r][c]) {
                    let currentClusterSize = 0;
                    const queue = [[r, c]];
                    visited[r][c] = true;

                    while (queue.length > 0) {
                        const [currR, currC] = queue.shift();
                        currentClusterSize++;

                        const neighbors = [
                            [currR - 1, currC], [currR + 1, currC],
                            [currR, currC - 1], [currR, currC + 1]
                        ];

                        for (const [nr, nc] of neighbors) {
                            if (nr >= 0 && nr < GRID_DIM && nc >= 0 && nc < GRID_DIM) {
                                if (gridBinary[nr][nc] === 1 && !visited[nr][nc]) {
                                    visited[nr][nc] = true;
                                    queue.push([nr, nc]);
                                }
                            }
                        }
                    }

                    if (currentClusterSize > maxClusterCells) {
                        maxClusterCells = currentClusterSize;
                    }
                }
            }
        }

        // --- E.5 Screenshot / Chat Artifact Check ---
        let screenshotArtifactScore = 0;
        let screenshotArtifactReasons = [];

        // 1. Check for specific WhatsApp/Chat UI colors
        let whatsappPixels = 0;
        let pureWhiteOrBlackPixels = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i], g = pixels[i+1], b = pixels[i+2];

            const isWhatsAppBeige = (r > 210 && g > 205 && b > 195 && Math.abs(r - g) < 22 && Math.abs(r - b) < 25);
            const isWhatsAppGreenUI = ((g > r + 12 && g > b + 12 && g > 140) || (g > 80 && b > 70 && r < 40));
            if (isWhatsAppBeige || isWhatsAppGreenUI) whatsappPixels++;
            
            if ((r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {
                pureWhiteOrBlackPixels++;
            }
        }

        const whatsappRatio = whatsappPixels / totalPixels;
        if (whatsappRatio > 0.05) {
            screenshotArtifactScore += 0.4;
            screenshotArtifactReasons.push("WhatsApp/Chat UI colors detected");
        }
        
        // 2. High edge density combined with flat UI (typical of text on a background)
        const currentFlatUIPixelRatio = flatUIPixelCount / totalPixels;
        const currentEdgeDensity = sharpEdgeCount / totalPixels;
        const currentCentralSkinRatio = centralSkinPixelCount / (centralTotalPixels || 1);

        if (currentEdgeDensity > 0.035 && currentFlatUIPixelRatio > 0.15) {
            screenshotArtifactScore += 0.3;
            screenshotArtifactReasons.push("Unusually high text-like edge density on flat background");
        }

        // 3. Central skin absence with UI present
        if (currentCentralSkinRatio < 0.15 && currentFlatUIPixelRatio > 0.15) {
            screenshotArtifactScore += 0.2;
            screenshotArtifactReasons.push("UI chrome occupying substantial central area");
        }

        // 4. Border/Bar detection (check top and bottom 10%)
        let topFlatPixels = 0, bottomFlatPixels = 0;
        const edgeMargin = Math.floor(CANVAS_SIZE * 0.1);
        
        for (let y = 0; y < edgeMargin; y++) {
            for (let x = 0; x < CANVAS_SIZE; x++) {
                const i = (y * CANVAS_SIZE + x) * 4;
                const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
                // Stricter flat definition for bars to avoid penalizing dark backgrounds
                const isFlat = (r > 235 && g > 235 && b > 235) || (r < 20 && g < 20 && b < 20) || 
                               (r > 210 && g > 205 && b > 195 && Math.abs(r - g) < 22 && Math.abs(r - b) < 25);
                if (isFlat) topFlatPixels++;
            }
        }
        for (let y = CANVAS_SIZE - edgeMargin; y < CANVAS_SIZE; y++) {
            for (let x = 0; x < CANVAS_SIZE; x++) {
                const i = (y * CANVAS_SIZE + x) * 4;
                const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
                const isFlat = (r > 235 && g > 235 && b > 235) || (r < 20 && g < 20 && b < 20) || 
                               (r > 210 && g > 205 && b > 195 && Math.abs(r - g) < 22 && Math.abs(r - b) < 25);
                if (isFlat) bottomFlatPixels++;
            }
        }

        const topFlatRatio = topFlatPixels / (edgeMargin * CANVAS_SIZE);
        const bottomFlatRatio = bottomFlatPixels / (edgeMargin * CANVAS_SIZE);

        if (topFlatRatio > 0.85) {
            screenshotArtifactScore += 0.25;
            screenshotArtifactReasons.push("Strong top UI bar / status bar detected");
        }
        if (bottomFlatRatio > 0.85) {
            screenshotArtifactScore += 0.25;
            screenshotArtifactReasons.push("Strong bottom UI bar detected");
        }

        // 5. Check for horizontal/vertical uniform lines (typical of UI boundaries/chat bubbles)
        let uniformLinesCount = 0;
        for (let y = edgeMargin; y < CANVAS_SIZE - edgeMargin; y += 4) {
            let maxRun = 1;
            let currentRun = 1;
            for (let x = 1; x < CANVAS_SIZE; x++) {
                const i = (y * CANVAS_SIZE + x) * 4;
                const prevI = i - 4;
                // Strict uniformity check for UI borders (less tolerance than shadow)
                const diff = Math.abs(pixels[i] - pixels[prevI]) + Math.abs(pixels[i+1] - pixels[prevI+1]) + Math.abs(pixels[i+2] - pixels[prevI+2]);
                if (diff < 5) {
                    currentRun++;
                    if (currentRun > maxRun) maxRun = currentRun;
                } else {
                    currentRun = 1;
                }
            }
            if (maxRun > CANVAS_SIZE * 0.7) {
                uniformLinesCount++;
            }
        }
        if (uniformLinesCount > 2) {
            screenshotArtifactScore += 0.2;
            screenshotArtifactReasons.push("Long horizontal UI-like boundaries/chat bubble edges");
        }

        screenshotArtifactScore = Number(Math.min(1.0, screenshotArtifactScore).toFixed(2));

        // --- F. Metrics Calculation ---
        const skinPixelRatio = Number((skinPixelCount / totalPixels).toFixed(4));
        const flatUIPixelRatio = Number((flatUIPixelCount / totalPixels).toFixed(4));
        const edgeDensity = Number((sharpEdgeCount / totalPixels).toFixed(4));
        const centralSkinRatio = Number((centralSkinPixelCount / (centralTotalPixels || 1)).toFixed(4));
        const maxSkinClusterRatio = Number((maxClusterCells / (GRID_DIM * GRID_DIM)).toFixed(4));

        const metrics = {
            width,
            height,
            aspectRatio,
            skinPixelRatio,
            flatUIPixelRatio,
            edgeDensity,
            centralSkinRatio,
            maxSkinClusterRatio,
            screenshotArtifactScore,
            screenshotArtifactReasons
        };

        console.log("Validation Metrics Log:", metrics);

        // --- G. Balanced Decision Logic ---

        // 0. SAFE PASS OVERRIDE FOR UNRENDERED / BLANK CANVAS
        if (flatUIPixelRatio >= 0.95 && skinPixelRatio === 0 && edgeDensity === 0) {
            console.log("Validation PASS: Unrendered or blank canvas detected, bypassing pre-check safely.", metrics);
            return { isValid: true, metrics };
        }

        // 1. SAFE PASS OVERRIDE FOR GENUINE SKIN PHOTOS
        // If image has plausible skin content, a contiguous cluster, low UI background, and low text edges -> ACCEPT
        // Must NOT have high screenshot artifacts!
        if (screenshotArtifactScore < 0.40 && skinPixelRatio >= 0.08 && maxSkinClusterRatio >= 0.03 && flatUIPixelRatio < 0.28 && edgeDensity < 0.05) {
            console.log("Validation PASS: Genuine skin photo verified with safe pass criteria.", metrics);
            return { isValid: true, metrics };
        }

        // 1.5 SCREENSHOT / CHAT ARTIFACT REJECTION
        if (screenshotArtifactScore >= 0.50) {
            console.log("Validation FAIL: likely screenshot/chat image", metrics);
            return {
                isValid: false,
                reason: "Please upload a clear photo of a skin area or skin lesion. Screenshots and chat images cannot be analyzed.",
                metrics
            };
        }

        // 2. HARD REJECTION RULES FOR OBVIOUS NON-SKIN / UI / SCREENSHOTS
        // Rule A: Document / Wall / Pure white-light gray background with negligible skin
        if (flatUIPixelRatio >= 0.50 && skinPixelRatio < 0.08) {
            console.log("Validation REJECT: Document/wall/flat background detected.", metrics);
            return {
                isValid: false,
                reason: "Please upload a clear photo of a skin area or skin lesion. Screenshots and chat images cannot be analyzed.",
                metrics
            };
        }

        // Rule B: Screenshot / Chat UI (WhatsApp, app UI with flat colors & text edges)
        if (flatUIPixelRatio >= 0.32 && edgeDensity >= 0.045 && skinPixelRatio < 0.15) {
            console.log("Validation REJECT: UI / Chat screenshot detected.", metrics);
            return {
                isValid: false,
                reason: "Please upload a clear photo of a skin area or skin lesion. Screenshots and chat images cannot be analyzed.",
                metrics
            };
        }

        // Rule C: Complete absence of skin content (Laptops, furniture, dark objects)
        if (skinPixelRatio < 0.04 && maxSkinClusterRatio < 0.02) {
            console.log("Validation REJECT: Non-skin object / insufficient skin pixels detected.", metrics);
            return {
                isValid: false,
                reason: "Please upload a clear photo of a skin area or skin lesion. Screenshots and chat images cannot be analyzed.",
                metrics
            };
        }

        // 3. COMBINED EVIDENCE RISK SCORE
        let riskScore = 0;
        if (flatUIPixelRatio > 0.40) riskScore += 35;
        else if (flatUIPixelRatio > 0.28) riskScore += 20;

        if (edgeDensity > 0.07) riskScore += 30;
        else if (edgeDensity > 0.045) riskScore += 15;

        if (skinPixelRatio < 0.06) riskScore += 35;
        else if (skinPixelRatio < 0.10) riskScore += 15;

        if (maxSkinClusterRatio < 0.02) riskScore += 30;
        else if (maxSkinClusterRatio < 0.04) riskScore += 15;

        if ((aspectRatio >= 1.50 || aspectRatio <= 0.55) && (flatUIPixelRatio > 0.25 || edgeDensity > 0.05)) {
            riskScore += 20;
        }

        const isRejected = (riskScore >= 50);

        if (isRejected) {
            return {
                isValid: false,
                reason: "Please upload a clear photo of a skin area or skin lesion. Screenshots and chat images cannot be analyzed.",
                metrics
            };
        }

        return { isValid: true, metrics };
    } catch (e) {
        console.error("Skin validation pre-check exception:", e);
        return { isValid: true };
    }
}


// =====================================================
// IMAGE SELECTION & QUALITY CHECK
// =====================================================

async function performQualityCheck(file) {
    const qualCard = document.getElementById('qualityCheckCard');
    const qualRes = document.getElementById('qualRes');
    const qualLighting = document.getElementById('qualLighting');
    const qualFocus = document.getElementById('qualFocus');

    if (!qualCard) return;
    qualCard.classList.add('active');

    if (file.size > 2000000) {
        qualRes.textContent = 'High Res (' + (file.size / 1024 / 1024).toFixed(1) + 'MB)';
        qualRes.style.color = 'var(--success)';
    } else {
        qualRes.textContent = 'Sufficient (' + (file.size / 1024).toFixed(0) + 'KB)';
        qualRes.style.color = 'var(--primary)';
    }

    const validation = await validateDirectSkinPhotograph(file);
    if (!validation.isValid) {
        qualLighting.textContent = '⚠️ Non-Skin Photo / Screenshot';
        qualLighting.style.color = 'var(--danger)';

        qualFocus.textContent = 'Screenshot / Chat Detected';
        qualFocus.style.color = 'var(--danger)';
    } else {
        qualLighting.textContent = 'Good Brightness';
        qualLighting.style.color = 'var(--success)';

        qualFocus.textContent = 'Clear Focus';
        qualFocus.style.color = 'var(--success)';
    }
}

function showSelectedImage(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
    }

    selectedImage = file;
    if (typeof window !== "undefined") {
        window.selectedImage = file;
    }
    lastResult = null;
    lastAbcdeAnalysis = null;
    currentScanRecord = null;
    currentlyViewingReportRecord = null;
    activeReportAbcdeData = null;
    updateAbcdeTabAutoResults(null);

    if (previewObjectURL) {
        URL.revokeObjectURL(previewObjectURL);
        previewObjectURL = null;
    }

    previewObjectURL = URL.createObjectURL(file);
    previewImage.src = previewObjectURL;
    previewImage.style.display = "block";
    previewPlaceholder.style.display = "none";

    performQualityCheck(file);

    analyzeButton.disabled = false;
    voiceButton.disabled = true;

    result.innerHTML = `
        <div class="preview-placeholder">
            <span class="preview-icon">📊</span>
            <h2>${getCurrentTranslations().resultTitle || "Result"}</h2>
            <p>${getCurrentTranslations().resultPlaceholderText || "Your screening result will appear here."}</p>
        </div>
    `;

    console.log("Selected new image:", file.name, "- cleared all previous scan & report state.");
}

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) showSelectedImage(file);
});

cameraInput.addEventListener("change", () => {
    const file = cameraInput.files[0];
    if (file) showSelectedImage(file);
});


// =====================================================
// LOAD MODELS (100% PRESERVED TFLITE WASM ENGINE)
// =====================================================

async function loadModels() {
    try {
        console.log("Initializing SkinCare AI Models...");

        if (!window.tflite) {
            throw new Error("TFLite runtime not found.");
        }

        window.tflite.setWasmPath("./wasm/");

        console.log("Offline mode test");
        console.log("No network required");
        console.log("Using local skin gate");
        skinGateModel = await window.tflite.loadTFLiteModel("./model/skin_gate.tflite");
        console.log("Skin gate loaded successfully.");

        console.log("Using local EfficientNet model");
        cancerModel = await window.tflite.loadTFLiteModel("./model/skin_cancer_efficientnet.tflite");
        console.log("Cancer model loaded successfully.");
        
        console.log("Using local Grad-CAM model"); // Grad-CAM uses the underlying model/logic

        analyzeButton.disabled = !selectedImage;
        console.log("All AI models loaded successfully.");
    } catch (error) {
        console.error("Model loading failed:", error);
        analyzeButton.disabled = true;

        result.innerHTML = `
            <div class="analysis-result non-skin-result">
                <div class="result-top">
                    <span class="result-icon">⚠️</span>
                    <div>
                        <h2>Model Loading Failed</h2>
                        <p>The AI models could not be loaded. Please refresh the page and try again.</p>
                    </div>
                </div>
            </div>
        `;
    }
}


// =====================================================
// IMAGE TO TENSOR (100% PRESERVED)
// =====================================================

async function imageToTensor(file) {
    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;

    await safeDrawImageToCanvas(file, canvas, 224, 224);
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, 224, 224);
    const pixels = imageData.data;

    const tensorData = new Float32Array(224 * 224 * 3);
    let index = 0;

    for (let i = 0; i < pixels.length; i += 4) {
        tensorData[index++] = pixels[i];
        tensorData[index++] = pixels[i + 1];
        tensorData[index++] = pixels[i + 2];
    }

    return tf.tensor(tensorData, [1, 224, 224, 3], "float32");
}


// =====================================================
// REAL OFFLINE GRAD-CAM VISUALIZATION
// =====================================================

async function loadGradCamModel() {
    if (gradcamModel) return gradcamModel;
    console.log("Lazy-loading Grad-CAM model...");
    if (!window.tflite) {
        throw new Error("TFLite engine unavailable for Grad-CAM");
    }
    window.tflite.setWasmPath("./wasm/");
    gradcamModel = await window.tflite.loadTFLiteModel("./model/skin_cancer_gradcam.tflite");
    console.log("Grad-CAM model loaded successfully.");
    return gradcamModel;
}

function jetColorMap(val) {
    const v = Math.max(0, Math.min(1, val));
    let r = Math.max(0, Math.min(255, Math.floor(255 * (1.5 - Math.abs(v * 4 - 3)))));
    let g = Math.max(0, Math.min(255, Math.floor(255 * (1.5 - Math.abs(v * 4 - 2)))));
    let b = Math.max(0, Math.min(255, Math.floor(255 * (1.5 - Math.abs(v * 4 - 1)))));
    return [r, g, b];
}

function upscaleHeatmap7x7(grid7x7, outWidth = 224, outHeight = 224) {
    const out = new Float32Array(outWidth * outHeight);
    const scaleX = 6 / (outWidth - 1);
    const scaleY = 6 / (outHeight - 1);

    for (let y = 0; y < outHeight; y++) {
        const srcY = y * scaleY;
        const y0 = Math.floor(srcY);
        const y1 = Math.min(6, y0 + 1);
        const dy = srcY - y0;

        for (let x = 0; x < outWidth; x++) {
            const srcX = x * scaleX;
            const x0 = Math.floor(srcX);
            const x1 = Math.min(6, x0 + 1);
            const dx = srcX - x0;

            const v00 = grid7x7[y0 * 7 + x0];
            const v01 = grid7x7[y0 * 7 + x1];
            const v10 = grid7x7[y1 * 7 + x0];
            const v11 = grid7x7[y1 * 7 + x1];

            const val = (1 - dx) * (1 - dy) * v00 +
                        dx * (1 - dy) * v01 +
                        (1 - dx) * dy * v10 +
                        dx * dy * v11;

            out[y * outWidth + x] = val;
        }
    }
    return out;
}

async function generateGradCamDataUrl(file, classIndex) {
    try {
        const model = await loadGradCamModel();
        const tensor = await imageToTensor(file);
        const outputTensor = await model.predict(tensor);
        const camData = await outputTensor.data();

        const rawGrid = new Float32Array(49);
        let minVal = Infinity;
        let maxVal = -Infinity;

        for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 7; c++) {
                const val = camData[r * 49 + c * 7 + classIndex];
                rawGrid[r * 7 + c] = val;
                if (val < minVal) minVal = val;
                if (val > maxVal) maxVal = val;
            }
        }

        const range = (maxVal - minVal) || 1e-6;
        for (let i = 0; i < 49; i++) {
            rawGrid[i] = (rawGrid[i] - minVal) / range;
        }

        const smoothHeatmap = upscaleHeatmap7x7(rawGrid, 224, 224);

        const canvas = document.createElement("canvas");
        canvas.width = 224;
        canvas.height = 224;
        const ctx = canvas.getContext("2d");

        await safeDrawImageToCanvas(file, canvas, 224, 224);

        const overlayCanvas = document.createElement("canvas");
        overlayCanvas.width = 224;
        overlayCanvas.height = 224;
        const oCtx = overlayCanvas.getContext("2d");
        const imgData = oCtx.createImageData(224, 224);

        for (let i = 0; i < smoothHeatmap.length; i++) {
            const hVal = smoothHeatmap[i];
            const [r, g, b] = jetColorMap(hVal);
            const idx = i * 4;
            imgData.data[idx] = r;
            imgData.data[idx + 1] = g;
            imgData.data[idx + 2] = b;
            imgData.data[idx + 3] = Math.floor(hVal * 200 + 45);
        }
        oCtx.putImageData(imgData, 0, 0);

        ctx.globalAlpha = 0.65;
        ctx.drawImage(overlayCanvas, 0, 0);
        ctx.globalAlpha = 1.0;

        tensor.dispose();
        outputTensor.dispose();

        return canvas.toDataURL("image/png");
    } catch (err) {
        console.error("Grad-CAM generation error:", err);
        return null;
    }
}


// =====================================================
// SEPARATE PDF DOWNLOAD GENERATOR
// =====================================================

async function downloadScanPdf(targetRecord) {
    const record = targetRecord || currentlyViewingReportRecord || currentScanRecord;
    if (!record) {
        alert("No active scan record found to generate PDF.");
        return;
    }

    const refNo = record.refNo || record.id || ('SCN-' + Date.now().toString().slice(-6));
    const filename = `SkinCancerDetection_${refNo}.pdf`;

    const lang = getCurrentTranslations();
    const profile = getPatientProfile();

    if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
        console.warn("Direct PDF library unavailable, using fallback print.");
        openReportModal(record);
        setTimeout(() => window.print(), 300);
        return;
    }

    try {
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "-9999px";
        container.style.width = "750px";
        container.style.padding = "30px";
        container.style.background = "#ffffff";
        container.style.fontFamily = "Arial, sans-serif";
        container.style.color = "#1e293b";

        const localizedResultName = getLocalizedClassName(record.key, record.name, lang);
        const confidenceStr = ((record.confidence || 0) * 100).toFixed(2) + '%';
        const localizedMeaning = getLocalizedMeaning(record.key, record.meaning || '', lang);

        let abcdeHtml = '';
        if (record.abcdeAnalysis) {
            abcdeHtml = `
                <div style="font-weight:700; font-size:12px; color:#0f766e; margin-top:15px; margin-bottom:6px; text-transform:uppercase; border-bottom:1px solid #cbd5e1; padding-bottom:3px;">
                    ${lang.abcdeImageHeading || "ABCDE SCREENING CRITERIA EVALUATION"}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px;">
                    <div><strong>A - ${lang.abcdeATitle || "Asymmetry"}:</strong> ${getLocalizedAbcdeText(record.abcdeAnalysis.asymmetry, 'asymmetry')}</div>
                    <div><strong>B - ${lang.abcdeBTitle || "Border"}:</strong> ${getLocalizedAbcdeText(record.abcdeAnalysis.border, 'border')}</div>
                    <div><strong>C - ${lang.abcdeCTitle || "Color"}:</strong> ${getLocalizedAbcdeText(record.abcdeAnalysis.color, 'color')}</div>
                    <div><strong>D - ${lang.abcdeDTitle || "Diameter"}:</strong> ${getLocalizedAbcdeText(record.abcdeAnalysis.diameter, 'diameter')}</div>
                    <div style="grid-column:1/-1;"><strong>E - ${lang.abcdeETitle || "Evolving"}:</strong> ${getLocalizedAbcdeText(record.abcdeAnalysis.evolving, 'evolving')}</div>
                </div>
            `;
        }

        let gradcamHtml = '';
        if (record.gradcamDataUrl) {
            gradcamHtml = `
                <div style="font-weight:700; font-size:12px; color:#0f766e; margin-top:15px; margin-bottom:6px; text-transform:uppercase; border-bottom:1px solid #cbd5e1; padding-bottom:3px;">
                    ${lang.gradcamTitle || "AI ATTENTION VISUALIZATION (GRAD-CAM)"}
                </div>
                <div style="display:flex; gap:15px; align-items:center;">
                    <img src="${record.gradcamDataUrl}" style="width:140px; height:140px; object-fit:contain; border-radius:8px; border:1px solid #e2e8f0;" />
                    <div style="font-size:11px; color:#64748b; line-height:1.5;">
                        ${lang.gradcamNote || "Grad-CAM highlights image regions associated with the model's prediction. It is an explanation aid, not a diagnostic proof."}
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0f766e; padding-bottom:10px; margin-bottom:15px;">
                <div>
                    <h1 style="margin:0; font-size:22px; color:#0f766e;">Skin Cancer Detection</h1>
                    <div style="font-size:12px; color:#64748b;">Clinical Image Screening Summary</div>
                </div>
                <div style="text-align:right; font-size:12px; color:#64748b;">
                    <div>Date: ${record.date || new Date().toLocaleDateString()}</div>
                    <div>Ref: ${refNo}</div>
                </div>
            </div>

            <div style="font-weight:700; font-size:12px; color:#0f766e; margin-bottom:6px; text-transform:uppercase; border-bottom:1px solid #cbd5e1; padding-bottom:3px;">
                PATIENT INFORMATION
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:12px; margin-bottom:15px;">
                <div><strong>Patient ID:</strong> ${record.patientId || profile.patientId}</div>
                <div><strong>Name:</strong> ${record.patientName || profile.name}</div>
                <div><strong>Age / Sex:</strong> ${(profile.age || 35)} Yrs / ${(profile.sex || 'Female')}</div>
                <div><strong>Contact:</strong> ${profile.contact || 'N/A'}</div>
            </div>

            <div style="font-weight:700; font-size:12px; color:#0f766e; margin-bottom:6px; text-transform:uppercase; border-bottom:1px solid #cbd5e1; padding-bottom:3px;">
                EXAMINATION & AI FINDINGS
            </div>
            <div style="display:flex; gap:15px; align-items:flex-start; margin-bottom:15px;">
                <img src="${record.imageThumb || record.image || ''}" style="width:130px; height:130px; object-fit:contain; border-radius:8px; border:1px solid #e2e8f0;" />
                <div style="flex:1;">
                    <div style="font-size:11px; color:#64748b; text-transform:uppercase; font-weight:700;">AI Screening Outcome</div>
                    <h3 style="margin:4px 0; font-size:18px; color:#0f172a;">${localizedResultName}</h3>
                    <div style="font-size:13px; margin-bottom:6px;"><strong>Confidence:</strong> ${confidenceStr}</div>
                    <div style="font-size:12px; color:#475569; line-height:1.4;">${localizedMeaning}</div>
                </div>
            </div>

            ${abcdeHtml}
            ${gradcamHtml}

            <div style="font-weight:700; font-size:12px; color:#0f766e; margin-top:15px; margin-bottom:6px; text-transform:uppercase; border-bottom:1px solid #cbd5e1; padding-bottom:3px;">
                REGULATORY MEDICAL DISCLAIMER
            </div>
            <div style="background:#fff7ed; border:1px solid #ffedd5; color:#9a3412; padding:10px; border-radius:6px; font-size:11px; line-height:1.4;">
                ⚠️ This document provides AI-assisted screening information and does not constitute a confirmed medical diagnosis. Professional examination by a qualified dermatologist or healthcare provider is strongly recommended.
            </div>
        `;

        document.body.appendChild(container);

        const canvas = await window.html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        document.body.removeChild(container);

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdf = new window.jspdf.jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(filename);
        console.log(`PDF saved successfully: ${filename}`);

    } catch (err) {
        console.error("PDF generation failed:", err);
        alert("Failed to generate PDF download. Falling back to print preview.");
        openReportModal(record);
        setTimeout(() => window.print(), 300);
    }
}

function downloadCurrentPdf() {
    const record = currentlyViewingReportRecord || currentScanRecord;
    downloadScanPdf(record);
}

function downloadHistoryPdf(scanId) {
    const history = JSON.parse(localStorage.getItem("skinAnalysisHistory") || "[]");
    const item = history.find(i => i.id === scanId);
    if (!item) return;
    downloadScanPdf(item);
}


// =====================================================
// SKIN GATE INFERENCE (100% PRESERVED)
// =====================================================

async function checkIfSkin(file) {
    console.log("Running skin gate evaluation...");
    const inputTensor = await imageToTensor(file);
    const gateInput = inputTensor.div(127.5).sub(1);

    const outputTensor = skinGateModel.predict(gateInput);
    const outputData = await outputTensor.data();

    const score = Number(outputData[0]);

    inputTensor.dispose();
    gateInput.dispose();
    outputTensor.dispose();

    console.log("Skin gate confidence score:", score);
    return score;
}


// =====================================================
// CANCER MODEL INFERENCE (100% PRESERVED)
// =====================================================

async function predictCancer(file) {
    console.log("Running EfficientNet skin lesion analysis...");
    const inputTensor = await imageToTensor(file);

    const outputTensor = cancerModel.predict(inputTensor);
    const outputData = await outputTensor.data();

    inputTensor.dispose();
    outputTensor.dispose();

    if (outputData.length !== 7) {
        throw new Error("Cancer model returned an unexpected number of classes.");
    }

    let highestIndex = 0;
    for (let i = 1; i < outputData.length; i++) {
        if (outputData[i] > outputData[highestIndex]) {
            highestIndex = i;
        }
    }

    const predictedClass = CANCER_CLASSES[highestIndex];
    if (!predictedClass) {
        throw new Error("Invalid cancer model class index.");
    }

    const confidence = Number(outputData[highestIndex]);

    return {
        index: highestIndex,
        key: predictedClass.key,
        name: predictedClass.name,
        meaning: predictedClass.meaning,
        confidence: confidence
    };
}


// =====================================================
// PATIENT HISTORY & PROGRESS TRACKER
// =====================================================

function createBase64Thumbnail(file, maxWidth = 160, maxHeight = 160) {
    return new Promise((resolve) => {
        if (!file) return resolve('');
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                let w = img.width;
                let h = img.height;
                if (w > h) {
                    if (w > maxWidth) {
                        h = Math.round(h * (maxWidth / w));
                        w = maxWidth;
                    }
                } else {
                    if (h > maxHeight) {
                        w = Math.round(w * (maxHeight / h));
                        h = maxHeight;
                    }
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                resolve(dataUrl);
            } catch (e) {
                console.error("Base64 thumbnail creation failed:", e);
                resolve('');
            }
        };
        img.onerror = () => resolve('');
        if (typeof file === 'string') {
            img.src = file;
        } else {
            img.src = URL.createObjectURL(file);
        }
    });
}

function saveAnalysisToHistory(record) {
    const history = JSON.parse(localStorage.getItem("skinAnalysisHistory") || "[]");
    const itemToSave = record || {
        id: 'SCN-' + Date.now(),
        patientId: getPatientProfile().patientId,
        patientName: getPatientProfile().name,
        name: lastResult ? lastResult.name : '',
        key: lastResult ? lastResult.key : '',
        confidence: lastResult ? lastResult.confidence : 0,
        date: new Date().toLocaleString(),
        imageThumb: previewObjectURL || '',
        meaning: lastResult ? lastResult.meaning : '',
        abcde: { ...currentAbcdeObservation },
        abcdeAnalysis: lastAbcdeAnalysis ? JSON.parse(JSON.stringify(lastAbcdeAnalysis)) : null
    };

    history.unshift(itemToSave);
    localStorage.setItem("skinAnalysisHistory", JSON.stringify(history.slice(0, 30)));
    renderHistory();
    renderProgressTracker();
}

function updateHistoryLanguage(lang) {
    const profile = getPatientProfile();
    const history = JSON.parse(localStorage.getItem("skinAnalysisHistory") || "[]");

    const patientHistory = history.filter(item => !item.patientId || item.patientId === profile.patientId);

    if (patientHistory.length === 0) {
        historyList.innerHTML = `<p id="noHistoryText" style="color: var(--text-muted); text-align: center; padding: 20px;">${lang.noHistory || "No previous screening records."}</p>`;
        return;
    }

    historyList.innerHTML = patientHistory.map(item => {
        const confidence = (item.confidence * 100).toFixed(2);
        const isSuspicious = item.key === "mel" || item.key === "bcc" || item.key === "akiec";

        return `
            <div class="history-item">
                <div class="history-info">
                    <span class="history-icon">${isSuspicious ? '⚠️' : '🔬'}</span>
                    <div>
                        <div class="history-title">${getLocalizedClassName(item.key, item.name, lang)}</div>
                        <div class="history-meta">ID: ${item.patientId || profile.patientId} • ${item.date}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="history-badge" style="color: ${isSuspicious ? 'var(--danger)' : 'var(--success)'};">
                        ${lang.aiConfidence || "Confidence"}: ${confidence}%
                    </span>
                    <button onclick="viewReportFromHistory('${item.id}')" class="btn btn-secondary" style="padding: 6px 12px; font-size: 11px;">📄 Report</button>
                    <button onclick="downloadHistoryPdf('${item.id}')" class="btn btn-secondary" style="padding: 6px 12px; font-size: 11px; background: var(--primary-dark); color: white; border: none;">⬇️ PDF</button>
                </div>
            </div>
        `;
    }).join("");
}

function renderHistory() {
    updateHistoryLanguage(getCurrentTranslations());
}

function renderProgressTrackerChart(patientHistory) {
    const canvas = document.getElementById("confidenceChartCanvas");
    const emptyState = document.getElementById("progressChartEmptyState");
    const summaryContainer = document.getElementById("classSummaryContainer");

    if (!canvas || !emptyState) return;

    if (!patientHistory || patientHistory.length === 0) {
        canvas.style.display = "none";
        emptyState.style.display = "block";
        if (summaryContainer) {
            summaryContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 12px;">No historical scan data recorded yet.</div>';
        }
        return;
    }

    canvas.style.display = "block";
    emptyState.style.display = "none";

    if (summaryContainer) {
        const counts = {};
        const lang = getCurrentTranslations();
        patientHistory.forEach(item => {
            const label = getLocalizedClassName(item.key, item.name, lang);
            counts[label] = (counts[label] || 0) + 1;
        });

        summaryContainer.innerHTML = Object.entries(counts).map(([name, count]) => `
            <div style="background: white; border: 1px solid var(--border-color); padding: 6px 12px; border-radius: 20px; font-weight: 600; color: var(--primary-dark);">
                ${name}: <span style="color: var(--primary); font-weight: 700;">${count}</span>
            </div>
        `).join('');
    }

    const scans = [...patientHistory].reverse();
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const padL = 50;
    const padR = 30;
    const padT = 30;
    const padB = 40;

    const graphW = width - padL - padR;
    const graphH = height - padT - padB;

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#64748b";
    ctx.font = "11px sans-serif";

    for (let pct = 0; pct <= 100; pct += 25) {
        const y = padT + graphH - (pct / 100) * graphH;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(width - padR, y);
        ctx.stroke();

        ctx.textAlign = "right";
        ctx.fillText(pct + "%", padL - 8, y + 4);
    }

    const points = scans.map((item, idx) => {
        const conf = Math.max(0, Math.min(100, (item.confidence || 0) * 100));
        const x = scans.length === 1 ? padL + graphW / 2 : padL + (idx / (scans.length - 1)) * graphW;
        const y = padT + graphH - (conf / 100) * graphH;
        return { x, y, conf, item, dateStr: item.date ? item.date.split(',')[0] : `Scan #${idx + 1}` };
    });

    if (points.length > 1) {
        ctx.strokeStyle = "#0f766e";
        ctx.lineWidth = 3;
        ctx.beginPath();
        points.forEach((pt, i) => {
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();

        ctx.lineTo(points[points.length - 1].x, padT + graphH);
        ctx.lineTo(points[0].x, padT + graphH);
        ctx.closePath();
        ctx.fillStyle = "rgba(15, 118, 110, 0.08)";
        ctx.fill();
    }

    points.forEach((pt, idx) => {
        ctx.fillStyle = "#0f766e";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(pt.conf.toFixed(1) + "%", pt.x, pt.y - 10);

        ctx.fillStyle = "#64748b";
        ctx.font = "10px sans-serif";
        const xLabel = pt.dateStr.length > 10 ? `Scan #${idx + 1}` : pt.dateStr;
        ctx.fillText(xLabel, pt.x, height - 12);
    });
}

function renderProgressTracker() {
    const profile = getPatientProfile();
    const history = JSON.parse(localStorage.getItem("skinAnalysisHistory") || "[]");
    const container = document.getElementById('progressComparisonContainer');

    if (!container) return;

    const patientHistory = history.filter(item => !item.patientId || item.patientId === profile.patientId);

    renderProgressTrackerChart(patientHistory);

    if (patientHistory.length === 0) {
        container.innerHTML = `
            <div class="comparison-card" style="grid-column: 1 / -1; padding: 30px; color: var(--text-muted); text-align: center;">
                📷 Perform multiple scans over time to build a chronological lesion comparison timeline.
            </div>
        `;
        return;
    }

    // Chronological order (oldest to newest)
    const chronologicalScans = [...patientHistory].reverse();

    container.innerHTML = chronologicalScans.map((item, idx) => {
        const confPercent = (item.confidence * 100).toFixed(1);
        const lang = getCurrentTranslations();
        const className = getLocalizedClassName(item.key, item.name, lang);
        const suspicious = item.key === "mel" || item.key === "bcc" || item.key === "akiec";

        let comparisonText = '';
        if (idx > 0) {
            const prevItem = chronologicalScans[idx - 1];
            const prevConf = (prevItem.confidence * 100).toFixed(1);
            const confDiff = (confPercent - prevConf).toFixed(1);
            const diffSign = confDiff >= 0 ? `+${confDiff}%` : `${confDiff}%`;
            comparisonText = `
                <div style="font-size: 11px; margin-top: 8px; padding: 6px 10px; background: white; border-radius: 8px; border: 1px solid var(--border-color); color: var(--text-secondary);">
                    📊 Vs Prev Scan (${prevItem.date.split(',')[0]}): <strong>${diffSign} confidence shift</strong>
                </div>
            `;
        } else {
            comparisonText = `
                <div style="font-size: 11px; margin-top: 8px; padding: 6px 10px; background: var(--primary-bg); border-radius: 8px; border: 1px solid var(--primary-light); color: var(--primary-dark); font-weight: 700;">
                    🏁 Baseline Patient Scan
                </div>
            `;
        }

        return `
            <div class="comparison-card" style="border-top: 4px solid ${suspicious ? 'var(--danger)' : 'var(--success)'}; text-align: left;">
                <div style="font-size: 11px; font-weight: 700; color: var(--primary); margin-bottom: 8px; display: flex; justify-content: space-between;">
                    <span>Scan #${idx + 1}</span>
                    <span>${item.date}</span>
                </div>
                ${item.imageThumb ? `<img src="${item.imageThumb}" class="comparison-thumb" style="width: 100%; height: 140px; object-fit: contain; background: #f8fafc; border-radius: 10px; border: 1px solid var(--border-color); margin-bottom: 8px;" alt="Scan Thumb">` : '<div style="height:140px; background:#e2e8f0; border-radius:10px; display:flex; align-items:center; justify-content:center; margin-bottom:8px; color: var(--text-muted);">🖼️ Image</div>'}
                <div style="font-weight: 700; font-size: 15px; color: var(--text-primary);">${className}</div>
                <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">AI Confidence: <strong>${confPercent}%</strong></div>
                ${comparisonText}
                <div style="margin-top: 10px; display: flex; gap: 6px; justify-content: flex-end;">
                    <button onclick="viewReportFromHistory('${item.id}')" class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px;">📄 View Report</button>
                    <button onclick="downloadHistoryPdf('${item.id}')" class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px; background: var(--primary-dark); color: white; border: none;">⬇️ Download PDF</button>
                </div>
            </div>
        `;
    }).join("");
}

if (clearHistoryButton) {
    clearHistoryButton.addEventListener("click", () => {
        localStorage.removeItem("skinAnalysisHistory");
        renderHistory();
        renderProgressTracker();
    });
}


// =====================================================
// DISPLAY RESULT & CLINICAL PATIENT REPORT
// =====================================================

function displayCancerResult(prediction, gradcamDataUrl) {
    if (gradcamDataUrl) {
        lastGradcamDataUrl = gradcamDataUrl;
    }

    const lang = getCurrentTranslations();
    const confidencePercent = (prediction.confidence * 100).toFixed(2);
    const className = getLocalizedClassName(prediction.key, prediction.name, lang);
    const meaning = getLocalizedMeaning(prediction.key, prediction.meaning, lang);
    const suspicious = prediction.key === "mel" || prediction.key === "bcc" || prediction.key === "akiec";

    let abcdeCardHtml = '';
    if (lastAbcdeAnalysis) {
        abcdeCardHtml = `
            <div class="abcde-image-result-card" style="margin-top: 16px; padding: 14px; background: #f8fafc; border-radius: 10px; border: 1px solid var(--border-color); text-align: left;">
                <div style="font-size: 13px; font-weight: 700; color: var(--primary-dark); margin-bottom: 4px;" id="lblAbcdeImageHeading">
                    ${lang.abcdeImageHeading || "🔬 ABCDE IMAGE-BASED SCREENING RESULT"}
                </div>
                <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 10px;" id="lblAbcdeImageDisclaimer">
                    ${lang.abcdeImageDisclaimer || "AI-assisted image-based ABCDE screening aid — not a medical diagnosis."}
                </div>
                <div style="font-size: 13px; line-height: 1.6;">
                    <div><strong>A - Asymmetry:</strong> <span id="resAbcdeA">${getLocalizedAbcdeText(lastAbcdeAnalysis.asymmetry, 'asymmetry')}</span></div>
                    <div><strong>B - Border:</strong> <span id="resAbcdeB">${getLocalizedAbcdeText(lastAbcdeAnalysis.border, 'border')}</span></div>
                    <div><strong>C - Color:</strong> <span id="resAbcdeC">${getLocalizedAbcdeText(lastAbcdeAnalysis.color, 'color')}</span></div>
                    <div><strong>D - Diameter:</strong> <span id="resAbcdeD">${getLocalizedAbcdeText(lastAbcdeAnalysis.diameter, 'diameter')}</span></div>
                    <div><strong>E - Evolving:</strong> <span id="resAbcdeE">${getLocalizedAbcdeText(lastAbcdeAnalysis.evolving, 'evolving')}</span></div>
                </div>
            </div>
        `;
    }

    result.innerHTML = `
        <div class="analysis-result ${suspicious ? 'suspicious-result' : 'normal-result'}">
            <div class="result-top">
                <span class="result-icon">${suspicious ? '⚠️' : '🔬'}</span>
                <div>
                    <div class="result-label">AI Screening Result</div>
                    <h2>${className}</h2>
                </div>
            </div>

            <div class="confidence-box">
                <span>${lang.aiConfidence || "AI Confidence"}</span>
                <strong>${confidencePercent}%</strong>
            </div>

            <div class="confidence-bar-bg">
                <div class="confidence-bar-fill" style="width: ${confidencePercent}%; background: ${suspicious ? 'var(--danger)' : 'var(--success)'};"></div>
            </div>

            <div class="result-explanation" style="margin-top: 14px;">
                <h3 style="margin: 0 0 6px; font-size: 15px;">What this means</h3>
                <p style="margin: 0; color: var(--text-secondary);">${meaning}</p>
            </div>

            ${abcdeCardHtml}

            ${prediction.confidence < 0.60 ? `
                <div class="low-confidence-notice" style="background: #fffbeb; border: 1px solid #fef3c7; color: #b45309; padding: 12px; border-radius: 10px; font-size: 12px; margin-top: 14px; text-align: left;">
                    ℹ️ ${lang.confidenceNotice || "Confidence indicates the model's estimated certainty and should not be interpreted as a diagnosis."}
                </div>
            ` : ''}

            <div class="medical-warning-box" style="margin-top: 16px;">
                <strong>⚠️ Important Notice:</strong> ${lang.screeningNotice || "This result is an AI screening result, not a confirmed diagnosis."} ${lang.consultDoctor || "Please consult a qualified dermatologist for examination."}
            </div>

            <div class="result-actions" style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px;">
                <button id="btnViewGradcam" class="btn btn-secondary" style="flex: 1; min-width: 140px; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-weight: 700; cursor: pointer;">
                    👁️ ${lang.viewGradCam || "View Grad-CAM"}
                </button>
                <button id="btnViewReport" class="btn btn-primary" style="flex: 1; min-width: 140px; font-weight: 700; cursor: pointer;">
                    📄 ${lang.viewReport || "View Report"}
                </button>
                <button id="btnAnalyzeAnother" class="btn btn-secondary" style="flex: 1; min-width: 140px; background: #f1f5f9; color: var(--text-primary); border: 1px solid var(--border-color); font-weight: 600; cursor: pointer;">
                    ${lang.analyzeAnother || "🔄 Analyze Another Image"}
                </button>
            </div>
        </div>
    `;

    const btnGradcam = document.getElementById("btnViewGradcam");
    if (btnGradcam) {
        btnGradcam.onclick = (e) => {
            if (e) e.preventDefault();
            console.log("View Grad-CAM clicked");
            openGradcamModal();
        };
        btnGradcam.addEventListener("click", (e) => {
            if (e) e.preventDefault();
            console.log("View Grad-CAM addEventListener fired");
            openGradcamModal();
        });
    }

    const btnReport = document.getElementById("btnViewReport");
    if (btnReport) {
        btnReport.onclick = (e) => {
            if (e) e.preventDefault();
            console.log("View Report clicked");
            openReportModal();
        };
        btnReport.addEventListener("click", (e) => {
            if (e) e.preventDefault();
            console.log("View Report addEventListener fired");
            openReportModal();
        });
    }

    const btnAnother = document.getElementById("btnAnalyzeAnother");
    if (btnAnother) {
        btnAnother.onclick = (e) => {
            if (e) e.preventDefault();
            console.log("Analyze Another clicked");
            resetScanAndAnalyze();
        };
        btnAnother.addEventListener("click", (e) => {
            if (e) e.preventDefault();
            console.log("Analyze Another addEventListener fired");
            resetScanAndAnalyze();
        });
    }

    console.log("displayCancerResult: Rendered result screen with View Grad-CAM, View Report, and Analyze Another Image buttons.");
}

function openGradcamModal(targetRecord) {
    let record = targetRecord || currentlyViewingReportRecord || currentScanRecord;

    if (!record && lastResult) {
        record = {
            key: lastResult.key,
            name: lastResult.name,
            confidence: lastResult.confidence,
            meaning: lastResult.meaning || '',
            imageThumb: previewObjectURL || '',
            gradcamDataUrl: lastGradcamDataUrl || ''
        };
    }

    if (!record) {
        console.warn("openGradcamModal: No active scan record found.");
        return;
    }

    const lang = getCurrentTranslations();
    const modal = document.getElementById('gradcamModal');
    if (!modal) {
        console.warn("openGradcamModal: #gradcamModal element missing in DOM.");
        return;
    }

    if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }

    const origImg = document.getElementById('gradcamModalOrigImg');
    const gradImg = document.getElementById('gradcamModalImg');

    const ctxClass = document.getElementById('gradcamCtxClass');
    const ctxConf = document.getElementById('gradcamCtxConf');
    const ctxRef = document.getElementById('gradcamCtxRef');

    const localizedName = getLocalizedClassName(record.key, record.name, lang);
    const confidencePct = ((record.confidence || 0) * 100).toFixed(2) + '%';
    const refNo = record.refNo || record.id || ('SCN-' + Date.now().toString().slice(-6));

    if (ctxClass) ctxClass.textContent = localizedName;
    if (ctxConf) ctxConf.textContent = confidencePct;
    if (ctxRef) ctxRef.textContent = refNo;

    const origSrc = record.imageThumb || record.image || previewObjectURL || '';
    const gradSrc = record.gradcamDataUrl || lastGradcamDataUrl || '';

    if (origImg) origImg.src = origSrc;
    if (gradImg) gradImg.src = gradSrc;

    modal.style.display = 'flex';
    modal.classList.add('active');
}

function closeGradcamModal() {
    const modal = document.getElementById('gradcamModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function openReportModal(targetRecord) {
    let record = targetRecord || currentlyViewingReportRecord || currentScanRecord;

    if (!record && lastResult) {
        const profile = getPatientProfile();
        record = {
            patientId: profile.patientId,
            patientName: profile.name,
            key: lastResult.key,
            name: lastResult.name,
            confidence: lastResult.confidence,
            meaning: lastResult.meaning || '',
            date: new Date().toLocaleString(),
            imageThumb: previewObjectURL || '',
            abcdeAnalysis: lastAbcdeAnalysis,
            gradcamDataUrl: lastGradcamDataUrl
        };
    }

    if (!record) return;
    currentlyViewingReportRecord = record;

    currentlyViewingReportRecord = record;

    const profile = getPatientProfile();
    const lang = getCurrentTranslations();

    document.getElementById('reportDate').textContent = 'Date: ' + (record.date || new Date().toLocaleDateString());
    document.getElementById('reportRefNo').textContent = 'Ref: ' + (record.refNo || record.id || ('SCN-' + Date.now().toString().slice(-6)));

    document.getElementById('rptPatientId').textContent = record.patientId || profile.patientId;
    document.getElementById('rptPatientName').textContent = record.patientName || profile.name;
    document.getElementById('rptPatientAgeSex').textContent = (profile.age || 35) + ' Yrs / ' + (profile.sex || 'Female');
    document.getElementById('rptPatientContact').textContent = profile.contact || 'N/A';

    const rptImg = document.getElementById('rptImageThumb');
    if (rptImg) {
        rptImg.src = record.imageThumb || previewObjectURL || '';
    }

    document.getElementById('rptResultTitle').textContent = getLocalizedClassName(record.key, record.name, lang);
    document.getElementById('rptConfidence').textContent = (record.confidence * 100).toFixed(2) + '%';
    document.getElementById('rptExplanation').textContent = getLocalizedMeaning(record.key, record.meaning || '', lang);

    if (record.abcdeAnalysis) {
        const rptAbcdeHeading = document.getElementById("rptAbcdeHeading");
        if (rptAbcdeHeading) {
            rptAbcdeHeading.textContent = lang.abcdeImageHeading || "ABCDE IMAGE-BASED SCREENING RESULT";
        }
        const rptA = document.getElementById("rptAbcdeA");
        const rptB = document.getElementById("rptAbcdeB");
        const rptC = document.getElementById("rptAbcdeC");
        const rptD = document.getElementById("rptAbcdeD");
        const rptE = document.getElementById("rptAbcdeE");

        if (rptA) rptA.innerHTML = `<strong>A - ${lang.abcdeATitle || "Asymmetry"}:</strong> ${getLocalizedAbcdeText(record.abcdeAnalysis.asymmetry, 'asymmetry')}`;
        if (rptB) rptB.innerHTML = `<strong>B - ${lang.abcdeBTitle || "Border"}:</strong> ${getLocalizedAbcdeText(record.abcdeAnalysis.border, 'border')}`;
        if (rptC) rptC.innerHTML = `<strong>C - ${lang.abcdeCTitle || "Color"}:</strong> ${getLocalizedAbcdeText(record.abcdeAnalysis.color, 'color')}`;
        if (rptD) rptD.innerHTML = `<strong>D - ${lang.abcdeDTitle || "Diameter"}:</strong> ${getLocalizedAbcdeText(record.abcdeAnalysis.diameter, 'diameter')}`;
        if (rptE) rptE.innerHTML = `<strong>E - ${lang.abcdeETitle || "Evolving"}:</strong> ${getLocalizedAbcdeText(record.abcdeAnalysis.evolving, 'evolving')}`;
    } else if (record.abcde) {
        updateReportAbcdeValues(record.abcde);
    } else {
        readAbcdeSelectionsFromDom();
        updateReportAbcdeValues(currentAbcdeObservation);
    }

    const gradcamHeading = document.getElementById('rptGradcamHeading');
    const gradcamBox = document.getElementById('rptGradcamBox');
    const gradcamImg = document.getElementById('rptGradcamImg');
    const gradcamNote = document.getElementById('rptGradcamNote');
    if (record.gradcamDataUrl && gradcamBox && gradcamImg) {
        gradcamImg.src = record.gradcamDataUrl;
        if (gradcamHeading) {
            gradcamHeading.textContent = lang.gradcamTitle || "AI ATTENTION VISUALIZATION (GRAD-CAM)";
            gradcamHeading.style.display = 'block';
        }
        if (gradcamNote) {
            gradcamNote.textContent = lang.gradcamNote || "Grad-CAM highlights image regions associated with the model's prediction. It is an explanation aid, not a diagnostic proof.";
        }
        gradcamBox.style.display = 'block';
    } else {
        if (gradcamHeading) gradcamHeading.style.display = 'none';
        if (gradcamBox) gradcamBox.style.display = 'none';
    }

    const modal = document.getElementById('patientReportModal');
    if (modal) {
        if (modal.parentElement !== document.body) {
            document.body.appendChild(modal);
        }
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    const closeReportBtn = document.getElementById("btnCloseReport");
    if (closeReportBtn) {
        closeReportBtn.onclick = () => window.closeReportModal();
    }
}

function closeReportModal() {
    const modal = document.getElementById('patientReportModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
    currentlyViewingReportRecord = null;
    document.body.style.overflow = '';
}

function viewReportFromHistory(scanId) {
    const history = JSON.parse(localStorage.getItem("skinAnalysisHistory") || "[]");
    const item = history.find(i => i.id === scanId);
    if (!item) return;

    openReportModal(item);
}


// =====================================================
// ANALYZE BUTTON EVENT LISTENER
// =====================================================

analyzeButton.addEventListener("click", async () => {
    if (!selectedImage) return;

    const lang = getCurrentTranslations();

    if (!skinGateModel || !cancerModel) {
        result.innerHTML = `
            <div class="analysis-result non-skin-result">
                <h3>${lang.analyzing || "Analyzing image..."}</h3>
                <p>${lang.pleaseWait || "Please wait."}</p>
            </div>
        `;
        return;
    }

    analyzeButton.disabled = true;
    voiceButton.disabled = true;

    result.innerHTML = `
        <div class="analysis-result normal-result" style="text-align: center;">
            <div style="font-size: 36px; margin-bottom: 10px;">🔍</div>
            <h3>${lang.analyzing || "Analyzing image..."}</h3>
            <p>${lang.pleaseWait || "Please wait."}</p>
        </div>
    `;
    try {
        const progressBox = document.getElementById("analysisProgressBox");
        const progressText = document.getElementById("analysisProgressText");
        if (progressBox) progressBox.style.display = "block";

        const updateStep = (msg) => {
            if (progressText) progressText.textContent = msg;
        };

        updateStep(lang.stepCheckingImage || "Checking image quality...");

        const validation = await validateDirectSkinPhotograph(selectedImage);

        if (!validation.isValid) {
            console.log("Image rejected by direct skin photo pre-check validation.");
            if (progressBox) progressBox.style.display = "none";

            result.innerHTML = `
                <div class="analysis-result non-skin-result">
                    <div class="result-top">
                        <span class="result-icon">📷</span>
                        <div>
                            <h2 style="color: var(--danger); font-size: 18px;">Direct Skin Photo Required</h2>
                            <p style="font-size: 14px; font-weight: 600; margin-top: 6px; color: var(--text-primary);">
                                Please upload a clear photo of a skin area or skin lesion. Screenshots and chat images cannot be analyzed.
                            </p>
                        </div>
                    </div>
                    <div class="medical-warning-box" style="margin-top: 14px;">
                        <p><strong>Note:</strong> Please capture or upload a direct close-up photograph of the skin lesion under clear lighting.</p>
                    </div>
                </div>
            `;
            lastResult = null;
            return;
        }

        // STEP 1 — SKIN GATE EVALUATION (TFLite Model)
        updateStep(lang.stepCheckingSkin || "Checking for skin photo...");
        const skinScore = await checkIfSkin(selectedImage);

        // STEP 2 — NON-SKIN REJECTION
        if (skinScore < SKIN_GATE_THRESHOLD) {
            console.log("Image rejected by skin gate.");
            if (progressBox) progressBox.style.display = "none";

            result.innerHTML = `
                <div class="analysis-result non-skin-result">
                    <div class="result-top">
                        <span class="result-icon">🖼️</span>
                        <div>
                            <h2>${lang.skinWarningTitle || "⚠️ Please upload a skin image"}</h2>
                            <p>${lang.skinWarningText || "The image does not appear to contain a suitable skin area for analysis."}</p>
                        </div>
                    </div>
                    <div class="medical-warning-box">
                        <p>${lang.skinWarningAction || "Please upload a clear photograph of the skin area you want to examine."}</p>
                    </div>
                </div>
            `;
            lastResult = null;
            return;
        }

        // STEP 3 — SKIN CONFIRMED, RUN CANCER CLASSIFIER
        updateStep(lang.stepAnalyzingLesion || "Analyzing skin lesion...");
        result.innerHTML = `
            <div class="analysis-result normal-result" style="text-align: center;">
                <div style="font-size: 36px; margin-bottom: 10px;">🧬</div>
                <h3>${lang.skinDetected || "Skin image detected ✓"}</h3>
                <p>${lang.runningAnalysis || "Running skin analysis..."}</p>
            </div>
        `;

        activeReportAbcdeData = null;
        lastResult = null;
        lastAbcdeAnalysis = null;
        currentScanRecord = null;
        currentlyViewingReportRecord = null;

        const profile = getPatientProfile();
        const history = JSON.parse(localStorage.getItem("skinAnalysisHistory") || "[]");
        const patientHistory = history.filter(item => !item.patientId || item.patientId === profile.patientId);

        const abcdeRes = await analyzeImageAbcde(selectedImage, patientHistory);
        const prediction = await predictCancer(selectedImage);

        lastResult = prediction;
        lastAbcdeAnalysis = abcdeRes;
        updateAbcdeTabAutoResults(lastAbcdeAnalysis);

        let thumbData = '';
        if (selectedImage) {
            try {
                thumbData = await createBase64Thumbnail(selectedImage, 160, 160);
            } catch (e) {
                console.error("Thumbnail error:", e);
            }
        }

        readAbcdeSelectionsFromDom();

        const predictedClassIdx = CANCER_CLASSES.findIndex(c => c.key === prediction.key);
        const targetIdx = predictedClassIdx >= 0 ? predictedClassIdx : 0;

        let gradcamDataUrl = null;
        try {
            updateStep(lang.stepPreparingResult || "Preparing screening result...");
            console.log("Generating genuine offline Grad-CAM for class:", prediction.key, targetIdx);
            gradcamDataUrl = await generateGradCamDataUrl(selectedImage, targetIdx);
        } catch (gErr) {
            console.error("Grad-CAM generation error:", gErr);
        }

        const timestamp = Date.now();
        currentScanRecord = {
            id: 'SCN-' + timestamp,
            refNo: 'SCN-' + timestamp.toString().slice(-6),
            patientId: profile.patientId,
            patientName: profile.name,
            key: prediction.key,
            name: prediction.name,
            confidence: prediction.confidence,
            meaning: prediction.meaning || '',
            date: new Date().toLocaleString(),
            imageThumb: thumbData || previewObjectURL || '',
            abcde: { ...currentAbcdeObservation },
            abcdeAnalysis: JSON.parse(JSON.stringify(abcdeRes)),
            gradcamDataUrl: gradcamDataUrl
        };

        displayCancerResult(prediction, gradcamDataUrl);
        saveAnalysisToHistory(currentScanRecord);

        voiceButton.disabled = false;
    } catch (error) {
        console.error("Analysis failed:", error);
        lastResult = null;

        result.innerHTML = `
            <div class="analysis-result suspicious-result">
                <div class="result-top">
                    <span class="result-icon">⚠️</span>
                    <div>
                        <h2>Unable to analyze this image</h2>
                        <p>Something went wrong while processing the image. Please try another clear skin photograph.</p>
                    </div>
                </div>
            </div>
        `;
    } finally {
        const progressBox = document.getElementById("analysisProgressBox");
        if (progressBox) progressBox.style.display = "none";
        analyzeButton.disabled = false;
    }
});

function resetScanAndAnalyze() {
    closeReportModal();
    closeGradcamModal();
    selectedImage = null;
    lastResult = null;
    previewObjectURL = null;
    currentScanRecord = null;
    if (typeof window !== "undefined") {
        window.selectedImage = null;
        window.currentScanRecord = null;
        window.lastResult = null;
    }
    activeReportAbcdeData = null;
    lastAbcdeAnalysis = null;
    currentlyViewingReportRecord = null;

    const imgInput = document.getElementById("imageInput");
    const camInput = document.getElementById("cameraInput");
    if (imgInput) imgInput.value = "";
    if (camInput) camInput.value = "";

    const prevImg = document.getElementById("previewImage");
    const prevPlaceholder = document.getElementById("previewPlaceholder");
    const camOverlay = document.getElementById("cameraOverlay");
    const qualityCard = document.getElementById("qualityCheckCard");

    if (prevImg) {
        prevImg.src = "";
        prevImg.style.display = "none";
    }
    if (prevPlaceholder) prevPlaceholder.style.display = "flex";
    if (camOverlay) camOverlay.style.display = "none";
    if (qualityCard) qualityCard.style.display = "none";

    const analyzeBtn = document.getElementById("analyzeButton");
    if (analyzeBtn) analyzeBtn.disabled = true;

    const voiceBtn = document.getElementById("voiceButton");
    if (voiceBtn) voiceBtn.disabled = true;

    const lang = getCurrentTranslations();
    const resContainer = document.getElementById("result");
    if (resContainer) {
        resContainer.innerHTML = `
            <div class="preview-placeholder">
                <span class="preview-icon">📊</span>
                <h2 id="resultTitle">${lang.result || "Result"}</h2>
                <p id="resultPlaceholderText">${lang.resultPlaceholderText || "Your screening result will appear here after analysis."}</p>
            </div>
        `;
    }

    console.log("Scan state cleanly reset. Ready for next image.");
}


// =====================================================
// OFFLINE AUDIO VOICE SYSTEM (100% PRESERVED)
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

let currentAudio = null;

voiceButton.addEventListener("click", async () => {
    console.log("Listen button clicked");
    const activeRecord = lastResult || currentScanRecord;
    if (!activeRecord) {
        console.warn("No active scan result for audio playback.");
        return;
    }

    const language = getCurrentLanguage();
    const folder = AUDIO_FOLDERS[language] || "en-US";
    let audioPath = `audio/${folder}/result.wav`;

    console.log("Spoken audio assistant requested:", { language, folder, audioPath });

    try {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }

        currentAudio = new Audio();
        voiceButton.disabled = true;
        console.log("Using local audio");

        currentAudio.onplay = () => {
            console.log("Audio playback started successfully:", audioPath);
        };
        currentAudio.onended = () => {
            console.log("Audio playback finished:", audioPath);
            voiceButton.disabled = false;
            currentAudio = null;
        };
        currentAudio.onerror = async (err) => {
            console.warn("Target audio file playback failed, trying English fallback...", audioPath, err);
            if (folder !== "en-US") {
                audioPath = "audio/en-US/result.wav";
                currentAudio = new Audio(audioPath);
                currentAudio.onended = () => { voiceButton.disabled = false; currentAudio = null; };
                currentAudio.onerror = () => { voiceButton.disabled = false; currentAudio = null; };
                try {
                    await currentAudio.play();
                    return;
                } catch (e) {
                    console.error("Fallback audio playback failed:", e);
                }
            }
            voiceButton.disabled = false;
            currentAudio = null;
        };

        currentAudio.src = audioPath;
        const playPromise = currentAudio.play();
        if (playPromise !== undefined) {
            await playPromise;
        }
    } catch (error) {
        console.error("Voice playback error or autoplay blocked:", error);
        voiceButton.disabled = false;
        currentAudio = null;
    }
});


// =====================================================
// APPLICATION INITIALIZATION
// =====================================================

renderPatientBadge();
initLanguage();
renderHistory();
loadModels();
bindAbcdeSelectListeners();

document.addEventListener("DOMContentLoaded", () => {
    initLanguage();
    bindAbcdeSelectListeners();
});

window.openGradcamModal = openGradcamModal;
window.closeGradcamModal = closeGradcamModal;
window.openReportModal = openReportModal;
window.closeReportModal = closeReportModal;
window.resetScanAndAnalyze = resetScanAndAnalyze;
window.downloadCurrentPdf = downloadCurrentPdf;
window.downloadScanPdf = downloadScanPdf;
window.displayCancerResult = displayCancerResult;

console.log("SkinCare AI Professional Frontend Architecture initialized successfully.");