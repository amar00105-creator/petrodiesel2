# PetroDiesel Mobile App

تم إنشاء كود المصدر (Source Code) لتطبيق الهاتف بنجاح.

## خطوات التشغيل

1. ** فتح سطر الأوامر (Terminal) في مجلد التطبيق**:
   ```bash
   cd "c:\xampp\htdocs\PETRODIESEL - 2\mobile_app"
   ```

2. **تحميل المكتبات**:
   ```bash
   flutter pub get
   ```

3. **تشغيل التطبيق**:
   * لتشغيله على المتصفح (للتيست السريع):
     ```bash
     flutter run -d chrome
     ```
   * لتشغيله على محاكي Android:
     تأكد من فتح المحاكي أولاً ثم:
     ```bash
     flutter run
     ```

## ملاحظات هامة
* **عنوان السيرفر (IP Address)**:
  تم إعداد التطبيق للاتصال بـ `http://10.0.2.2/PETRODIESEL/public/api/v1` وهو العنوان الخاص بـ `localhost` عند استخدام محاكي Android.
  إذا كنت تستغل التطبيق على جهاز حقيقي أو iPhone، يجب تغيير هذا العنوان في ملف `lib/controllers/auth_controller.dart` إلى عنوان IP جهاز الكمبيوتر الخاص بك (مثلاً `192.168.1.X`).

* **تسجيل الدخول**:
  استخدم نفس بيانات الدخول الموجودة في نظام الويب.
