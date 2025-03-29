// تكوين عناوين API
const PRODUCTION_API_URL = 'https://[your-username].pythonanywhere.com';  // قم بتغيير [your-username] إلى اسم المستخدم الخاص بك على PythonAnywhere
const DEVELOPMENT_API_URL = 'http://127.0.0.1:5001';

// تحديد البيئة الحالية
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// اختيار عنوان API المناسب بناءً على البيئة
const API_URL = isDevelopment ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;

// تصدير المتغيرات للاستخدام في الملفات الأخرى
export { API_URL };