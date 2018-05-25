import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { MessagingService } from "./messaging.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  alarmState:Boolean;
  proc:Boolean;
  constructor(private db:AngularFireDatabase,private msgService: MessagingService){
    let alarmState=false;
    let proc=false;
    this.db.object('/alarm').valueChanges().subscribe((d:any)=>{
      if (d!=null) {
        this.alarmState=d.state;
      }
    });
  }
  switchState(){
    this.proc=true;
    this.db.object('/alarm/state').set(!this.alarmState)
    .then(_=>{ this.proc=false; })
    .catch(e=>{ console.log(e); });
  }
  ngOnInit() {
    this.msgService.getPermission()
    this.msgService.receiveMessage()
    this.msgService.currentMessage.subscribe(m=>{
      if(m) alert(m.notification.body);
    });
  }
}
