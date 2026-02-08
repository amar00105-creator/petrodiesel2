---
description: كيفية نشر التحديثات للموقع الحي مع الحفاظ على البيانات
---

# نشر التحديثات للموقع الحي

## 1. تحديثات الكود فقط (الأكثر شيوعاً)

// turbo-all

```bash
# 1. بناء الأصول
npm run build

# 2. إضافة التغييرات
git add .

# 3. حفظ التغييرات
git commit -m "وصف التغيير"

# 4. رفع للـ GitHub
git push origin main
```

✅ GitHub Actions سينشر تلقائياً
✅ البيانات على الخادم الحي لن تتأثر

---

## 2. إضافة جداول/أعمدة جديدة

### أ. أنشئ ملف migration:

```sql
-- database/migrations/XXX_description.sql
ALTER TABLE table_name ADD COLUMN column_name TYPE DEFAULT value;
```

### ب. نفذ الملف على الخادم الحي:

1. افتح phpMyAdmin من cPanel
2. اختر قاعدة البيانات
3. تبويب SQL → الصق الأمر → Go

---

## 3. ⚠️ تحذيرات مهمة

❌ **لا ترفع نسخة قاعدة بيانات كاملة** - تمسح البيانات!
❌ **لا تستخدم DROP TABLE** إلا للضرورة
❌ **لا تستخدم TRUNCATE** على جداول الخادم الحي

---

## 4. استثناء: رفع قاعدة بيانات كاملة (نادراً)

فقط عند:

- إعادة تهيئة كاملة للنظام
- نقل لخادم جديد

```bash
# إنشاء نسخة
cmd /c "c:\xampp\mysql\bin\mysqldump.exe -u root petrodiesel_db > database\backup.sql"
```

ثم في phpMyAdmin:

1. `SET FOREIGN_KEY_CHECKS = 0;`
2. Drop all tables
3. Import backup.sql
4. `SET FOREIGN_KEY_CHECKS = 1;`
