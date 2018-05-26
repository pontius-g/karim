import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { messaging } from 'firebase';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  currentMessage = new BehaviorSubject(null);
  constructor(private db: AngularFireDatabase) {}
  updateToken(token) {
    this.db.object('fcmTokens/'+token.split(":")[0]).set(token)
    .then(_=>{},e=>{console.log(e);})
  }
  getPermission() {
    messaging().requestPermission()
    .then(() => {
      console.log('Notification permission granted.');
      return messaging().getToken()
    })
    .then(token => {
      console.log(token)
      this.updateToken(token)
    })
    .catch((err) => {
      console.log('Unable to get permission to notify.', err);
    });
  }
  receiveMessage() {
     messaging().onMessage((payload) => {
      console.log("Message received. ", payload);
      this.currentMessage.next(payload)
    });

  }
}
