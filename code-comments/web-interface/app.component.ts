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
  firstRun:Boolean;
  constructor(private db:AngularFireDatabase,private msgService: MessagingService){
    this.alarmState=false;
    this.proc=false;
    this.firstRun=true;
    this.db.object('/alarm').valueChanges().subscribe((d:any)=>{
      if (d!=null) {
        this.alarmState=d.state;
      }
    });
    if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
      this.db.object('/alarm/notify').valueChanges().subscribe((d:any)=>{
        if (this.firstRun){
          this.firstRun=false;
        } else { if (d!=null) { alert(d); } }
      });
    }
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
