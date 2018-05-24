import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
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
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyBa7Vg1SOw9KV8riy8-2Ywd2u7uM8P48yY",
      authDomain: "karim-alarm.firebaseapp.com",
      databaseURL: "https://karim-alarm.firebaseio.com",
      projectId: "karim-alarm",
      storageBucket: "karim-alarm.appspot.com",
      messagingSenderId: "172021102120"
    }),
    AngularFireAuthModule,
    AngularFireDatabaseModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
