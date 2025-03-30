const { Service } = require('node-windows');
const path = require('path');

// تحديد مسار النود والسكريبت الذي سيتم تشغيله
const svc = new Service({
  name: 'Karim Portfolio',
  description: 'Next.js application for Karim Portfolio',
  script: path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next.js'),
  scriptOptions: 'dev',
  nodeOptions: [],
  workingDirectory: __dirname,
  allowServiceLogon: true
});

// عندما تبدأ الخدمة
svc.on('install', function() {
  console.log('تم تثبيت الخدمة بنجاح!');
  svc.start();
});

// رسائل البدء
svc.on('start', function() {
  console.log('تم بدء الخدمة بنجاح!');
});

// أي أخطاء
svc.on('error', function(err) {
  console.error('حدث خطأ في الخدمة:', err);
});

// تثبيت الخدمة
svc.install(); 