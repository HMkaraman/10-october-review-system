# إعداد Google Sheets لنظام تقييم 10 October
# Google Sheets Setup for 10 October Review System

---

## الخطوة 1: إنشاء جدول Google Sheets
## Step 1: Create Google Sheets

1. اذهب إلى [Google Sheets](https://sheets.google.com)
2. أنشئ جدول جديد باسم **"10 October Reviews"**
3. في الصف الأول، أضف العناوين التالية:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Timestamp | Section | Section Name | Service Rating | Team Rating | Place Rating | Cleanliness Rating | Average | Likes | Suggestions | Complaint | Customer Name | Phone | Language |

### وصف الأعمدة:
| العمود | الوصف |
|--------|-------|
| Timestamp | تاريخ ووقت التقييم |
| Section | رمز القسم (salon, clinic, spa, cafe) |
| Section Name | اسم القسم بالعربي/الإنجليزي |
| Service Rating | تقييم جودة الخدمة (1-5) |
| Team Rating | تقييم تعامل الفريق (1-5) |
| Place Rating | تقييم المكان والأجواء (1-5) |
| Cleanliness Rating | تقييم النظافة (1-5) |
| Average | متوسط التقييم |
| Likes | ما أعجب العميل |
| Suggestions | اقتراحات التحسين |
| Complaint | الشكاوى |
| Customer Name | اسم العميل |
| Phone | رقم الهاتف (+964) |
| Language | لغة التقييم (ar/en) |

---

## الخطوة 2: إنشاء Google Apps Script
## Step 2: Create Google Apps Script

1. من قائمة الجدول، اختر **Extensions** > **Apps Script**
2. احذف أي كود موجود واستبدله بالكود التالي:

```javascript
function doPost(e) {
  try {
    // الحصول على البيانات المرسلة
    var data = JSON.parse(e.postData.contents);

    // فتح الجدول النشط
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // إضافة صف جديد بجميع البيانات
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.section,
      data.sectionName,
      data.serviceRating,
      data.teamRating,
      data.placeRating,
      data.cleanlinessRating,
      data.averageRating,
      data.likes || '',
      data.suggestions || '',
      data.complaint || '',
      data.customerName,
      data.customerPhone,
      data.language
    ]);

    // إرجاع رد نجاح
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // إرجاع رد خطأ
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// دالة للاختبار - تظهر رسالة عند فتح الرابط في المتصفح
function doGet(e) {
  return ContentService
    .createTextOutput('10 October Review API is working!')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

3. احفظ الملف (**Ctrl+S** أو **Cmd+S**)
4. أعطه اسم مثل **"Review Handler"**

---

## الخطوة 3: نشر كـ Web App
## Step 3: Deploy as Web App

1. اضغط على زر **Deploy** > **New deployment**
2. اضغط على أيقونة الترس ⚙️ واختر **Web app**
3. املأ الإعدادات:
   - **Description**: `10 October Review Handler`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. اضغط **Deploy**
5. وافق على الأذونات المطلوبة (قد تظهر تحذيرات، اضغط "Advanced" ثم "Go to...")
6. **انسخ رابط الـ Web App** الذي يظهر

> الرابط سيكون بهذا الشكل:
> `https://script.google.com/macros/s/AKfycb.../exec`

---

## الخطوة 4: ربط الرابط بالصفحة
## Step 4: Connect URL to Page

1. افتح ملف `script.js`
2. في السطر الثاني، ابحث عن:
```javascript
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
```
3. استبدل `YOUR_GOOGLE_SCRIPT_URL_HERE` بالرابط الذي نسخته:
```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```
4. احفظ الملف

---

## الخطوة 5: اختبار النظام
## Step 5: Test the System

1. افتح `index.html` في المتصفح
2. قم بإرسال تقييم تجريبي كامل
3. تحقق من جدول Google Sheets للتأكد من وصول البيانات
4. تأكد من ظهور جميع الـ 14 عمود بالبيانات الصحيحة

---

## ملاحظات مهمة
## Important Notes

### الحفظ المحلي (Backup)
- حتى بدون ربط Google Sheets، التقييمات تُحفظ تلقائياً في `localStorage`
- لعرض التقييمات المحفوظة محلياً، افتح Console في المتصفح واكتب:
```javascript
getLocalReviews()
```

### التحديثات
- إذا عدلت كود Apps Script، يجب إنشاء **deployment جديد**
- اذهب إلى **Deploy** > **New deployment**
- الرابط سيتغير مع كل deployment جديد
- لا تنس تحديث الرابط في `script.js`

### الأمان
- رابط الـ Web App متاح للجميع (Anyone) - هذا ضروري لاستقبال البيانات
- البيانات آمنة في Google Drive الخاص بك
- لا يمكن لأحد الوصول للجدول إلا أنت

### استكشاف الأخطاء
إذا لم تصل البيانات، تحقق من:
1. ✅ صحة الرابط في `script.js`
2. ✅ أذونات الـ Web App (يجب أن تكون "Anyone")
3. ✅ Console في المتصفح (F12) للأخطاء
4. ✅ تم نشر آخر تحديث للـ Apps Script

### اختبار الرابط
يمكنك اختبار أن الرابط يعمل بفتحه في المتصفح مباشرة:
- إذا ظهرت رسالة `10 October Review API is working!` فالرابط صحيح

---

## تحليل البيانات
## Data Analysis

### من Google Sheets
- البيانات تظهر مباشرة في الجدول
- يمكنك إنشاء **Charts** لتحليل التقييمات
- استخدم **Filters** لتصفية حسب القسم أو التاريخ
- استخدم **AVERAGE** لحساب متوسط كل قسم

### صيغ مفيدة:
```
// متوسط تقييم الخدمة لقسم الصالون
=AVERAGEIF(B:B,"salon",D:D)

// عدد التقييمات لكل قسم
=COUNTIF(B:B,"salon")

// متوسط كل التقييمات
=AVERAGE(H:H)
```

---

## الدعم
## Support

إذا واجهت أي مشكلة، تحقق من:
1. Console المتصفح (F12 > Console)
2. Apps Script Execution Log (في محرر Apps Script)
3. صلاحيات Google Drive

---

تم إعداد هذا النظام لـ **10 October Beauty Center** 🌟
