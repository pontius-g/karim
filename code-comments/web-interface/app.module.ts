// Стандартный файл описания модулей приложения, создается фреймворком автоматически при генерации новго проекта
// строки к торорым не даны комментарии, присутсвуют в нем изначально (после генерации пустого проекта и добавленияя к нему опции PWA: ng new PROJECT-NAME; cd PROJECT-NAME; ng add @angular/pwa;)
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from 'angularfire2'; // подключаем библиотеку Firebase (все классы импортируются с атрибутами Module, для соответствия API фреймворка Angular)
import { AngularFireAuthModule } from 'angularfire2/auth'; // добавляем библиотеку механизмов авторизации Firebase (в данном проекте не был использован, но сохранена для масштабирования и поддержки персонализированных учетных записей)
import { AngularFireDatabaseModule } from 'angularfire2/database';  // модуль библиотеки базы данных Firebase
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    AngularFireModule.initializeApp({ //
      apiKey: "AIzaSyBa7Vg1SOw9KV8riy8-2Ywd2u7uM8P48yY", //
      authDomain: "karim-alarm.firebaseapp.com", //
      databaseURL: "https://karim-alarm.firebaseio.com", //
      projectId: "karim-alarm", //
      storageBucket: "karim-alarm.appspot.com", //
      messagingSenderId: "172021102120" //
    }), // Инициализурем модуль Firebase с укзанаием объекта содержащего публичные атрибуты для подключения к API Firebase нашего проекта в облаке
    AngularFireAuthModule, // Инициализация ранее подключенных модулей авторизации
    AngularFireDatabaseModule // и базы данных Firebase
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
