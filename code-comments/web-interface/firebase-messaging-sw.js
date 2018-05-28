// Web-worker для обработки PUSH-уведомлений. Будет работать в фоне, если пользователь разрешит получение сообщений
// взят из примера https://angularfirebase.com/lessons/send-push-notifications-in-angular-with-firebase-cloud-messaging/
//
importScripts('https://www.gstatic.com/firebasejs/5.0.4/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.0.4/firebase-messaging.js');

firebase.initializeApp({
  'messagingSenderId': '172021102120'
});

const messaging = firebase.messaging();