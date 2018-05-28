// Код работы основного компонента, который рендерит и описывает работу кнопки на интерфейсе
// а также инициирует функции обработки PUSH-сообщени, когда web-приложение запущено
// компонент создан автоматически фреймворком при генерации проекта, дополнительные компоненты вводятся путем выполнения комманды: ng generate component COMPONENT-NAME;
// Строки без комментариев присутсвуют в нем при создании, обеспечивают базовую инициализацию скрипта в качестве компонента
// Фреймворк Angular создает проект с использованием TypeScript (расширение файлов .ts), что является мета-языком надстройкой над Javascript и помимо синтаксисических особенностей вводит поддержку контроля типа данных в переменных, "чего так не хватает програмистам"
import { Component, OnInit } from '@angular/core'; // добавляем импорт класса OnInit для использования данной функции внутри компонента
import { AngularFireDatabase } from 'angularfire2/database'; // подключаем класс для взаимодействия с базой данных Firebase
import { MessagingService } from "./messaging.service"; // подключаем класс обработки PUSH-сообщений, созданный нами как дополнительный сервис

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  alarmState:Boolean; // декларируем переменную с типом Boolean (true/false), будет использована для хранения текущего "состояния сигнализации" вычитанного из базы данных
  proc:Boolean; // декларируем переменную с типом Boolean (true/false), будет принимать значение TRUE во время обработки запроса к базе данных функцией switchState()
  firstRun:Boolean; // декларируем переменную с типом Boolean (true/false), будет использована для игнорирования существующих данных в поле '/alarm/notify' при первом подключении к базе, это позволит не показывать "старых сообщений" iOS пользователям, для которых и создано это поле, с целью обойти временное отсутствие поддержки PUSH в веб-приложениях iOS
  constructor(private db:AngularFireDatabase,private msgService: MessagingService){ // создаем приватные функции db и msgService из ранее подключенных классов базы данных Firebase и сервиса обработки сообщений, соответственно в конструкторе класса компонента
    this.alarmState=false; // выставляем значение по умолчанию для избежания ошибок при работе с переменной
    this.proc=false; // выставляем значение по умолчанию для избежания ошибок при работе с переменной
    this.firstRun=true; // выставляем значение по умолчанию TRUE, она будет переведена в FALSE после первого получения значения поля '/alarm/notify' от базы данных Firebase
    this.db.object('/alarm').valueChanges().subscribe((d:any)=>{ // создаем подключение к базе данных Firebase и объявляем функцию-обработчик для получаемых данных при каждом изменении поля '/alarm'
      if (d!=null) { // проверям, содержал ли ответ базы данные
        this.alarmState=d.state; // так как нам известна структура базы, потому ответ всегда будет представлен в виде объекта с ключами state и notify; переносим значение во внутренню переменную компонента alarmState. Согласно данной переменной изменя/тся текстовые поля состояния сигналзации и кнопки "вкл/выкл" на интерфейсе пользователя
      }
    });
    if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) { // секция выполняется только на iOS-устройствах, для определения используется регулярное выражение проверяющее значение переменной среды navigator.platform браузера клиента 
      this.db.object('/alarm/notify').valueChanges().subscribe((d:any)=>{ // создаем подключение к базе данных Firebase и объявляем функцию-обработчик для получаемых данных при каждом изменении поля '/alarm/notify'
        if (this.firstRun){ // При первом запуске компонента данная переменная будет TRUE, так как поле '/alarm/notify' не "чиститься после его прочтения", потому первые полученные данные из базы мы хотим игнорировать, ибо они не будут актуальны новому подключению пользователя
          this.firstRun=false; // переводим переменную в состояние FALSE, для обработки последующих изменений поля вторым условием
        } else { if (d!=null) { alert(d); } } // Если "это не были первые данные", тогда проверим содержал ли ответ базы данные в переменной "d" и выдадим сообщение "alert" браузера с текстом полученного ответа
      });
    }
  }
  switchState(){ // функция переключения "состояния сигнализации"
    this.proc=true; // переводим переменную в положительное состоние, таким образом на время процессинга запроса, на пользовательском интерфейсе будет спрятана кнопка "вкл/выкл" и отображена надпись "ожидаем ответа сервера"
    this.db.object('/alarm/state').set(!this.alarmState) // отправляем запрос записи в поле '/alarm/state' базы данных Firebase. Устанавливаем инвертное состоние текущему. Состоние сообщений на интерфейсе пользователя будет обработано ранее описанной функцией прослушивающей изменения поля '/alarm'
    .then(_=>{ this.proc=false; }) // Так как вызванная функция асинхронная и возвращает Promise и спользуем обработчик метод .then для возврата переменной proc в состояние FALSE  при успешном выполнении запроса к базе данных
    .catch(e=>{ console.log(e); }); // Если запись выполнить не удалось,  пишем ошибку в консоль для диагностики
  }
  ngOnInit() { // функция выполняетс при инициализации компонента в приложении
    this.msgService.getPermission(); // выполняем функцию запроса резерешения браузера на отправку уведомлений пользователю, описана в созданном нами отдельном "сервисе" Messaging
    this.msgService.receiveMessage(); // функция, также, описана в созданном нами отдельном "сервисе" Messaging, запускает обработчик сообщений при открытом web-приложении
    this.msgService.currentMessage.subscribe(m=>{ // внутри сервиса Messaging зарегистрирована "потоковая" переменная currentMessage, наследующая метода BehaviorSubject фреймворка RxJS, таким образом позволяет обрабатывать свое изменение по событию. Она принимает значения "нового" сообщения полученного от сервиса PUSH-уведомлений Firebase Cloud Messaging
      if(m) alert(m.notification.body); // если сообщение не было "пустым" (null - установлено в качестве первичного значения переменной currentMessage), выводим "alert" средствами браузера с текстом сообщения
    });
  }
}
