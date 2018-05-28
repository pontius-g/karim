// Сервис взаимодействия с Firebase Cloud Messaging взят из примера https://angularfirebase.com/lessons/send-push-notifications-in-angular-with-firebase-cloud-messaging/
// создан из шаблона фреймворка Angular: ng generate service messaging
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database'; // подключаем класс для взаимодействия с базой данных Firebase
import { messaging } from 'firebase'; // подключаем класс messaging для взаимодействия с функциями Firebase Cloud Messaging
import { BehaviorSubject } from 'rxjs'; // Импортируем класс из проекта RxJS, что позволит создать "потоковую" переменную с возмодностью определения первичного значения и обработки его изменений по событию
@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  currentMessage = new BehaviorSubject(null); //декларируем потоковую переменную с первичным значением "null" и наследуем свойства и метода BehaviorSubject
  constructor(private db: AngularFireDatabase) {} // в конструкторе регистрируем приватную переменную db для работы с методами взаимодействия с базой данных Firebase (по спецификации пакета angularfire2, с которого и взят класс)
  updateToken(token) { // функция создает/обновляет значения ключа-идентификатора адресата PUSH-уведомлений в поле "/fcmTokens" базы данных Firebase. В данном поле создаются key:value записи, уникальная часть для key принимается непосредственно из token'а предоставленного браузером
    this.db.object('fcmTokens/'+token.split(":")[0]).set(token) // записываем значение полученного токена в поле 'fcmTokens/<первая часть токена до двоеточия>'
    .then(_=>{},e=>{console.log(e);}) // в случае ошибки - пишем в консоль браузера для отладки
  }
  getPermission() { // функция запроса разрешения браузера на отправку уведомлений устройству 
    messaging().requestPermission() // вызываем метод ранее импортированной функции messaging из библиотеки firebase. функция инициирует диалоговое окно "разрешения" браузера, или вернет ранее полученные ответ на него пользователем
    // ниже обрабатываем асинхронную функцию вернувшую Promise()
    .then(() => { 
      console.log('Notification permission granted.'); // При согласии пользователя, пишем в консоль "радостную весть"
      return messaging().getToken() // вызываем метод получния значения ключа-идентификатора и возвращаем ее Promise() для последующей обработки
    })
    .then(token => { // из последнего промиса должны получить токен в качестве аргумента, при успешном завершении вызова функции .getToken()
      console.log(token) // для отладки пишем полученное значение в консоль браузера
      this.updateToken(token) // "отдаем" ключ-идентификатор нашей ранее описанной функции для записи в базу данных Firebase
    })
    .catch((err) => { 
      console.log('Unable to get permission to notify.', err); // в слечае ошибки - сообщаем в консоль причину "отсутствия разрешения"
    });
  }
  receiveMessage() { // функция обрабатывает PUSH-сообщения, когда Web-приложения открыто
     messaging().onMessage((payload) => { // метод возвращает объект содержащий полученое сообщение от сервиса Firebase Cloud Messages
      console.log("Message received. ", payload); // записываем полученные данные в консоль для отладки 
      this.currentMessage.next(payload) // метод .next() устанавливает новое значение "потоковой" переменной currentMessage и генеририрует событие об обновлении ее значения всем "подписавшимся" методом .subscribe()
    });

  }
}
