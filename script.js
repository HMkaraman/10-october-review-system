// ===== إعدادات Google Sheets =====
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';

// ===== حالة التطبيق =====
let currentLang = 'ar';
let currentStep = 1;
const totalSteps = 4;
let selectedSection = null;
let ratings = {
    service: 0,
    team: 0,
    place: 0,
    cleanliness: 0
};

// ===== تحويل الأرقام العربية إلى إنجليزية =====
const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function convertArabicToEnglish(str) {
    if (!str) return str;
    let result = str;
    for (let i = 0; i < arabicNumerals.length; i++) {
        result = result.replace(new RegExp(arabicNumerals[i], 'g'), englishNumerals[i]);
    }
    return result;
}

// ===== تهيئة التطبيق =====
document.addEventListener('DOMContentLoaded', () => {
    initSectionCards();
    initAllStarRatings();
    initPhoneInput();
    updateProgress();
});

// ===== تهيئة حقل رقم الهاتف =====
function initPhoneInput() {
    const phoneInput = document.getElementById('customerPhone');
    if (!phoneInput) return;

    // تحويل الأرقام العربية للإنجليزية أثناء الكتابة
    phoneInput.addEventListener('input', function(e) {
        let value = convertArabicToEnglish(this.value);

        // إزالة أي أحرف غير رقمية
        value = value.replace(/[^\d]/g, '');

        // إزالة الصفر من البداية إذا كان موجوداً (لأن +964 موجود)
        if (value.startsWith('0')) {
            value = value.substring(1);
        }

        // إزالة 964 من البداية إذا أدخلها المستخدم
        if (value.startsWith('964')) {
            value = value.substring(3);
        }

        // تحديد الطول الأقصى
        if (value.length > 10) {
            value = value.substring(0, 10);
        }

        this.value = value;
    });

    // منع إدخال أحرف غير رقمية
    phoneInput.addEventListener('keypress', function(e) {
        const char = String.fromCharCode(e.which);
        const arabicDigits = /[\u0660-\u0669]/;
        const englishDigits = /[0-9]/;

        if (!arabicDigits.test(char) && !englishDigits.test(char)) {
            e.preventDefault();
        }
    });
}

// ===== التنقل بين الخطوات =====
function nextStep() {
    if (!validateCurrentStep()) return;

    if (currentStep < totalSteps) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
        updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add('active');
        updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goToStep(step) {
    if (step >= 1 && step <= totalSteps) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep = step;
        document.getElementById(`step${currentStep}`).classList.add('active');
        updateProgress();
    }
}

function updateProgress() {
    // تحديث شريط التقدم
    const progressFill = document.getElementById('progressFill');
    const progressPercent = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progressPercent}%`;

    // تحديث أرقام الخطوات (لدعم كلا التنسيقين)
    document.querySelectorAll('.progress-steps .step, .progress-label').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        const stepNum = step.dataset.step ? parseInt(step.dataset.step) : index + 1;
        if (stepNum === currentStep) {
            step.classList.add('active');
        } else if (stepNum < currentStep) {
            step.classList.add('completed');
        }
    });
}

// ===== رسائل التنبيه (Toast) =====
const toastMessages = {
    selectSection: {
        ar: 'الرجاء اختيار القسم الذي زرته',
        en: 'Please select the section you visited'
    },
    rateAll: {
        ar: 'الرجاء تقييم جميع العناصر',
        en: 'Please rate all items'
    },
    rateItem: {
        ar: 'لم تقيّم: ',
        en: 'Not rated: '
    },
    enterName: {
        ar: 'الرجاء إدخال اسمك',
        en: 'Please enter your name'
    },
    enterPhone: {
        ar: 'الرجاء إدخال رقم هاتف عراقي صحيح',
        en: 'Please enter a valid Iraqi phone number'
    },
    codeCopied: {
        ar: 'تم نسخ الكود!',
        en: 'Code copied!'
    }
};

const ratingLabels = {
    service: { ar: 'جودة الخدمة', en: 'Service Quality' },
    team: { ar: 'تعامل الفريق', en: 'Team Service' },
    place: { ar: 'المكان والأجواء', en: 'Ambiance' },
    cleanliness: { ar: 'النظافة', en: 'Cleanliness' }
};

function showToast(message, type = 'warning', duration = 3000) {
    const container = document.getElementById('toastContainer');

    // إزالة أي toast موجود
    const existingToast = container.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const icons = {
        warning: '⚠️',
        error: '❌',
        success: '✅'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // إخفاء التنبيه بعد المدة المحددة
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===== التحقق من الخطوة الحالية =====
function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            if (!selectedSection) {
                const cards = document.querySelector('.section-cards');
                cards.classList.add('shake', 'needs-selection');
                setTimeout(() => {
                    cards.classList.remove('shake');
                    setTimeout(() => cards.classList.remove('needs-selection'), 2000);
                }, 300);
                showToast(toastMessages.selectSection[currentLang], 'warning');
                return false;
            }
            return true;

        case 2:
            let allRated = true;
            let unratedItems = [];

            Object.keys(ratings).forEach(type => {
                const container = document.querySelector(`.rating-item[data-rating-type="${type}"]`);
                if (!ratings[type]) {
                    if (container) {
                        container.classList.add('shake', 'needs-rating');
                        setTimeout(() => {
                            container.classList.remove('shake');
                            setTimeout(() => container.classList.remove('needs-rating'), 2000);
                        }, 300);
                    }
                    unratedItems.push(ratingLabels[type][currentLang]);
                    allRated = false;
                }
            });

            if (!allRated) {
                if (unratedItems.length === Object.keys(ratings).length) {
                    showToast(toastMessages.rateAll[currentLang], 'warning');
                } else {
                    showToast(toastMessages.rateItem[currentLang] + unratedItems.join('، '), 'warning', 4000);
                }
            }
            return allRated;

        case 3:
            return true; // الملاحظات اختيارية

        case 4:
            return validateContactForm();

        default:
            return true;
    }
}

function validateContactForm() {
    let isValid = true;
    let firstError = null;

    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const nameError = document.getElementById('nameError');
    const phoneError = document.getElementById('phoneError');
    const nameWrapper = nameInput.closest('.input-wrapper');
    const phoneWrapper = phoneInput.closest('.input-wrapper');

    // التحقق من الاسم
    if (!nameInput.value.trim()) {
        nameWrapper.classList.add('error', 'shake');
        nameError.classList.add('show');
        setTimeout(() => nameWrapper.classList.remove('shake'), 300);
        if (!firstError) firstError = 'name';
        isValid = false;
    } else {
        nameWrapper.classList.remove('error');
        nameError.classList.remove('show');
    }

    // التحقق من رقم الجوال العراقي
    const phoneValue = convertArabicToEnglish(phoneInput.value.trim());
    const iraqPhoneRegex = /^7[3-9]\d{8}$/; // يبدأ بـ 7 ثم رقم من 3-9 ثم 8 أرقام

    if (!phoneValue || !iraqPhoneRegex.test(phoneValue)) {
        phoneWrapper.classList.add('error', 'shake');
        phoneError.classList.add('show');
        setTimeout(() => phoneWrapper.classList.remove('shake'), 300);
        if (!firstError) firstError = 'phone';
        isValid = false;
    } else {
        phoneWrapper.classList.remove('error');
        phoneError.classList.remove('show');
    }

    // عرض رسالة التنبيه المناسبة
    if (!isValid) {
        if (firstError === 'name') {
            showToast(toastMessages.enterName[currentLang], 'warning');
        } else if (firstError === 'phone') {
            showToast(toastMessages.enterPhone[currentLang], 'warning');
        }
    }

    return isValid;
}

// ===== اختيار القسم =====
function initSectionCards() {
    const cards = document.querySelectorAll('.section-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedSection = card.dataset.section;

            // الانتقال للخطوة التالية تلقائياً بعد الاختيار
            setTimeout(() => nextStep(), 300);
        });
    });
}

// ===== تقييم النجوم =====
function initAllStarRatings() {
    const ratingContainers = document.querySelectorAll('.star-rating');

    ratingContainers.forEach(container => {
        // الحصول على ratingType من العنصر الأب .rating-item
        const ratingItem = container.closest('.rating-item');
        const ratingType = ratingItem ? ratingItem.dataset.ratingType : null;

        if (!ratingType) return; // تخطي إذا لم يوجد نوع

        const stars = container.querySelectorAll('.star');

        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const value = parseInt(star.dataset.value);
                highlightStarsInContainer(container, value);
            });

            star.addEventListener('mouseleave', () => {
                highlightStarsInContainer(container, ratings[ratingType] || 0);
            });

            star.addEventListener('click', () => {
                const value = parseInt(star.dataset.value);
                ratings[ratingType] = value;
                highlightStarsInContainer(container, value);

                // تحديث حالة العنصر
                const ratingItem = container.closest('.rating-item');
                if (ratingItem) {
                    ratingItem.classList.add('rated');
                    ratingItem.classList.remove('needs-rating');

                    // تحديث نص القيمة
                    const valueText = ratingItem.querySelector('.rating-value');
                    if (valueText) {
                        const ratingTexts = {
                            1: { ar: 'سيء', en: 'Poor' },
                            2: { ar: 'مقبول', en: 'Fair' },
                            3: { ar: 'جيد', en: 'Good' },
                            4: { ar: 'جيد جداً', en: 'Very Good' },
                            5: { ar: 'ممتاز', en: 'Excellent' }
                        };
                        valueText.textContent = ratingTexts[value][currentLang];
                        valueText.dataset.ar = ratingTexts[value].ar;
                        valueText.dataset.en = ratingTexts[value].en;
                    }
                }
            });
        });
    });
}

function highlightStarsInContainer(container, count) {
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < count) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
}

// ===== تبديل اللغة =====
function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';

    const html = document.documentElement;
    html.lang = currentLang;
    html.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    document.getElementById('langText').textContent = currentLang === 'ar' ? 'English' : 'عربي';

    updateTexts();
}

function updateTexts() {
    document.querySelectorAll('[data-ar][data-en]').forEach(el => {
        el.textContent = el.dataset[currentLang];
    });

    document.querySelectorAll('[data-placeholder-ar][data-placeholder-en]').forEach(el => {
        el.placeholder = el.dataset[`placeholder${currentLang === 'ar' ? 'Ar' : 'En'}`];
    });
}

// ===== إرسال النموذج =====
async function submitForm() {
    if (!validateContactForm()) return;

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.classList.add('loading');

    const formData = {
        section: selectedSection,
        sectionName: getSectionName(selectedSection),
        serviceRating: ratings.service,
        teamRating: ratings.team,
        placeRating: ratings.place,
        cleanlinessRating: ratings.cleanliness,
        averageRating: calculateAverage(),
        likes: document.getElementById('likes').value.trim(),
        suggestions: document.getElementById('suggestions').value.trim(),
        complaint: document.getElementById('complaint').value.trim(),
        customerName: document.getElementById('customerName').value.trim(),
        customerPhone: '+964' + convertArabicToEnglish(document.getElementById('customerPhone').value.trim()),
        timestamp: new Date().toISOString(),
        language: currentLang
    };

    try {
        await sendToGoogleSheets(formData);
    } catch (error) {
        console.error('Error:', error);
    }

    submitBtn.classList.remove('loading');
    generateDiscountCode();
    showSuccess();
}

function getSectionName(section) {
    const names = {
        salon: { ar: 'الصالون', en: 'Salon' },
        clinic: { ar: 'العيادة', en: 'Clinic' },
        spa: { ar: 'السبا', en: 'Spa' },
        cafe: { ar: 'المقهى', en: 'Cafe' }
    };
    return names[section] ? names[section][currentLang] : section;
}

function calculateAverage() {
    const values = Object.values(ratings).filter(v => v > 0);
    if (values.length === 0) return 0;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
}

// ===== توليد كود الخصم =====
function generateDiscountCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'OCT5-';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('discountCode').textContent = code;
    return code;
}

// ===== نسخ كود الخصم =====
function copyCode() {
    const code = document.getElementById('discountCode').textContent;
    const copyIcon = document.getElementById('copyIcon');

    const onCopySuccess = () => {
        copyIcon.textContent = '✅';
        showToast(toastMessages.codeCopied[currentLang], 'success', 2000);
        setTimeout(() => {
            copyIcon.textContent = '📋';
        }, 2000);
    };

    navigator.clipboard.writeText(code).then(onCopySuccess).catch(() => {
        // بديل للمتصفحات القديمة
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        onCopySuccess();
    });
}

// ===== إرسال البيانات لـ Google Sheets =====
async function sendToGoogleSheets(data) {
    if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
        console.log('Google Sheets URL not configured. Saving locally.');
        saveLocally(data);
        return;
    }

    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        saveLocally(data);
    } catch (error) {
        console.error('Failed to send to Google Sheets:', error);
        saveLocally(data);
        throw error;
    }
}

function saveLocally(data) {
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    reviews.push(data);
    localStorage.setItem('reviews', JSON.stringify(reviews));
    console.log('Review saved locally:', data);
}

// ===== عرض شاشة النجاح =====
function showSuccess() {
    // إخفاء جميع الخطوات
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.remove('active');
    });

    // إخفاء شريط التقدم
    document.querySelector('.progress-container').style.display = 'none';

    // عرض شاشة النجاح
    document.getElementById('successScreen').classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== إعادة تعيين النموذج =====
function resetForm() {
    // إعادة تعيين الحالة
    currentStep = 1;
    selectedSection = null;
    ratings = { service: 0, team: 0, place: 0, cleanliness: 0 };

    // إعادة تعيين الواجهة
    document.querySelectorAll('.section-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelectorAll('.star').forEach(star => {
        star.classList.remove('selected');
    });

    // إعادة تعيين الحقول
    document.getElementById('likes').value = '';
    document.getElementById('suggestions').value = '';
    document.getElementById('complaint').value = '';
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';

    // إزالة أخطاء التحقق
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-msg.show').forEach(el => el.classList.remove('show'));

    // إخفاء شاشة النجاح
    document.getElementById('successScreen').classList.remove('active');

    // إظهار شريط التقدم
    document.querySelector('.progress-container').style.display = 'block';

    // العودة للخطوة الأولى
    document.getElementById('step1').classList.add('active');
    updateProgress();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== دالة لعرض التقييمات المحفوظة =====
function getLocalReviews() {
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    console.table(reviews);
    return reviews;
}
