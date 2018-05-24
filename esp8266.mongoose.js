// requires
load('api_gpio.js');
load('api_sys.js');
load('api_timer.js');
load('api_events.js');
load('api_net.js');
load('api_http.js');
// VARs
let led = 2;
let relay = 4;
let motion = 5;
let motionBlocked=0;
let evs = null;
let ntfyUrl="http://us-central1-karim-alarm.cloudfunctions.net/notify?id=MainSensor0";
let stateUrl="https://karim-alarm.firebaseio.com/alarm/state.json";
let state=1;
// GPIO INIT
GPIO.set_mode(relay, GPIO.MODE_OUTPUT);
GPIO.set_mode(led, GPIO.MODE_OUTPUT);
GPIO.set_mode(motion, GPIO.MODE_INPUT);
//
let cMotion=0; // current Motion state
GPIO.write(relay, state); // default enable relay
// Functions
Timer.set(25000, Timer.REPEAT, function (){
    if (evs === 'GOT_IP'){
        HTTP.query({
            url:stateUrl,
            success: function(b,h){ state=(b==="true")? 1:0; GPIO.write(relay,state); },
            error: function(err){ sys.reboot(); }
        });
    } else { sys.reboot(); }
},null);
function ntfy(){
  if (evs === 'GOT_IP' && state){
    HTTP.query({
      url: ntfyUrl,
      success: function(b,h){ GPIO.write(led, false); }
    });
  }
}
//handle motion
Timer.set(250, Timer.REPEAT, function (){
  if(evs !== 'GOT_IP') {
    GPIO.toggle(led); //blink while conecting WiFi
  }
  if (GPIO.read(motion)!==cMotion && motionBlocked<Timer.now()){
    cMotion=GPIO.read(motion);
    GPIO.write(led,(1-cMotion));
    if (cMotion) {
        ntfy();  // notification sent
        motionBlocked=Timer.now()+30; //block motion detection for 30 sec
    }   
  }
},null);
// Monitor network connectivity.
Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  if (ev === Net.STATUS_DISCONNECTED) {
    evs = 'DISCONNECTED';
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
  }
  print('== Net event:', ev, evs);
}, null);
