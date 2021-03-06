// Функция, помещаемая на платформу Firebase Cloud Functions для обработки HTTP-сообщений от модуля ESP8266 
// Используется GET-метод HTTP с вычитывание переменных из секции query
//
const functions = require('firebase-functions'); // библиотека реализации функций на платформе
const admin = require("firebase-admin"); // библиотека поддержки административного доступа к ресурсам проекта в среде Firebase
// в нашем случае, для доступа к базе-данных и функциям Firebase Cloud Messaging, для отправки уведомлений
//
admin.initializeApp(functions.config().firebase); // инициализация приложения, вычитавет параметры и ключи взаимодействия с ресурсам из переменных окружения Firebase
// Иными словами, так как функция фактически выполняется на серверах Firebase в конфигурация подключения к проекту уже содержиться в параметрах среды
//
exports.notify=functions.https.onRequest((req,res)=>{ //добавляем метод (функцию) для нашего проекта для обслуживания в Firebase Cloud Functions 
    // для обработки HTTP запросов, поступающих от "датчика", используем и наследуем реализацию нативной функции платформы functions.https.onRequest()
    //
    if(typeof req.query.id !== 'undefined'){ //Проверяем, присутствует ли переменная "id" в query поступившего запроса
        let payload = { // создаем переменную с сообщением, что будет отправлятся в сервис PUSH-уведомлений. Используется стандартизированый формат объекта сообщения
            notification: { 
                title: 'Alarm Detected!!!', // тема сообщения
                body: `Движение на датчике ${req.query.id}(${Date.now()})`, // в тело сообщения добавляем идентификатор сенсора полученый в запросе от ESP8266 и добавляем timestamp для уникальности (это фикс для отработки уведомлений в iOS)
                icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Angular_full_color_logo.svg/250px-Angular_full_color_logo.svg.png" // картинка что будет в сообщении
            }
        }
        admin.database().ref('/alarm/state').once("value", s=>{ // подключаемся к базе данных для полчения значения в поле "/alarm/state"
            //после обработки запроса, в callback функции получаем переменную s содержащую вспомагательные методы
            //
            if (s.val()===true){ // используя метод .val() получаем непосредсвенное значение поля /alarm/state, что для потребителя означает "состояние вкл/выкл сигнализации"
                admin.database().ref('/alarm/notify').set(payload.notification.body) // так как iOS не поддерживает PUSH-уведомлений для Web-приложений, записываем тело сообщения в поле /alarm/notify базы данных (вызывается асинхронная функция, но она не имеет выхода в исправном сосотоянии и не помешает дальнейшему выполнению кода)
                .catch(e=>{ res.status(403).send("notify write failed: " + e.code); }); // в случае ошибки фугкция прекратит сою работу и вернет HTTP-ответ с кодом 403
                admin.database().ref('/fcmTokens/').once("value", d=>{ // запрашиваем содержимое поля fcmTokens, в нем содержаться ключи-идентификаторы устройств для отправки им PUSH-уведомлений
                    let tokens=[]; // создаем пустой массив
                    Object.keys(d.val()).forEach(k=>{ tokens.push(d.val()[k]); });  // заполняем ранее созданный массив значениями каждого элемента полученного объекта из поля /fcmTokens
                    admin.messaging().sendToDevice(tokens, payload) // вызываем функцию отправки уведомлений из библитеки Firebase, первым аргументом указываем массив со строчными значениями ключей-идентификаторов, второрй аргумент - переменная с шаблонным объектом, содержащим сообщение для PUSH-уведомления
                    .then(_=>{res.status(200).send("OK"); return true;}) // обработка успешного выхода асинхронной функции, и формирование HTTP-ответа (200 ОК) сенсору и завершение выполнения функции на платформе
                    .catch(e=>{res.status(500).send("Error accured: " + e.code);}) // обработка ошибки выполнения функции и возврат HTTP-ответа с кодом 500 и ошибкой
                }, e=>{
                    res.status(403).send("db read failed: " + e.code); // обработка ошибки при чтении поля /fcmTokens/ и отправка HTTP-ответа с ошибкой
                });
            } else { res.status(200).send("OFF"); } // "если сигналиция отключена", т.е. /alarm/state не равно true, не выполняем отправки сообщения и отвечаем HTTP-сообщением "OFF"
        });
    } else {
        res.status(403).send("no ID"); // если в query URI HTTP-запроса не присутствовало аргумента id формируем HTTP-ответ Forbidden c текстом ошибки "no ID"
    }
});
