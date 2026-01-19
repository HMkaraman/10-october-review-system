# تعليمات ربط Google Sheets

## الخطوة 1: إنشاء جدول Google Sheets

1. اذهب إلى [Google Sheets](https://sheets.google.com)
2. أنشئ جدول جديد باسم "10 October Reviews"
3. في الصف الأول، أضف العناوين التالية:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Timestamp | Section | Section Name | Rating | Comment | Customer Name | Language |

## الخطوة 2: إنشاء Google Apps Script

1. من قائمة الجدول، اختر **Extensions** > **Apps Script**
2. احذف أي كود موجود واستبدله بالكود التالي:

```javascript
function doPost(e) {
  try {
    // الحصول على البيانات المرسلة
    var data = JSON.parse(e.postData.contents);

    // فتح الجدول النشط
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // إضافة صف جديد
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.section,
      data.sectionName,
      data.rating,
      data.comment || '',
      data.customerName || 'مجهول',
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

// دالة للاختبار
function doGet(e) {
  return ContentService
    .createTextOutput('Google Sheets API is working!')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

3. احفظ الملف (Ctrl+S أو Cmd+S)
4. أعطه اسم مثل "Review Handler"

## الخطوة 3: نشر كـ Web App

1. اضغط على زر **Deploy** > **New deployment**
2. اختر **Type** > **Web app**
3. املأ الإعدادات:
   - **Description**: 10 October Review Handler
   - **Execute as**: Me
   - **Who has access**: Anyone
4. اضغط **Deploy**
5. وافق على الأذونات المطلوبة
6. **انسخ رابط الـ Web App** الذي يظهر

## الخطوة 4: ربط الرابط بالصفحة

1. افتح ملف `script.js`
2. ابحث عن السطر:
```javascript
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
```
3. استبدل `YOUR_GOOGLE_SCRIPT_URL_HERE` بالرابط الذي نسخته:
```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```
4. احفظ الملف

## الخطوة 5: اختبار النظام

1. افتح `index.html` في المتصفح
2. قم بإرسال تقييم تجريبي
3. تحقق من جدول Google Sheets للتأكد من وصول البيانات

---

## ملاحظات مهمة

### الحفظ المحلي
- حتى بدون ربط Google Sheets، التقييمات تُحفظ في `localStorage`
- يمكنك عرضها بفتح Console في المتصفح وكتابة: `getLocalReviews()`

### التحديثات
- إذا عدلت كود Apps Script، يجب إنشاء **deployment جديد**
- الرابط سيتغير مع كل deployment جديد

### الأمان
- رابط الـ Web App متاح للجميع (Anyone)
- هذا ضروري لاستقبال البيانات من الصفحة
- البيانات آمنة في Google Drive الخاص بك

### استكشاف الأخطاء
- إذا لم تصل البيانات، تحقق من:
  1. صحة الرابط في `script.js`
  2. أذونات الـ Web App (Anyone)
  3. Console في المتصفح للأخطاء

---

## عرض التقييمات

### من Google Sheets
- البيانات تظهر مباشرة في الجدول
- يمكنك إنشاء Charts لتحليل التقييمات

### من localStorage (للتطوير)
افتح Console في المتصفح واكتب:
```javascript
getLocalReviews()
```
