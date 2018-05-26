const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
exports.notify=functions.https.onRequest((req,res)=>{
    if(typeof req.query.id !== 'undefined'){
        let payload = {
            notification: {
                title: 'Alarm Detected!!!',
                body: `Движение на датчике ${req.query.id}(${Date.now()})`,
                icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Angular_full_color_logo.svg/250px-Angular_full_color_logo.svg.png"
            }
        }
        admin.database().ref('/alarm/state').once("value", s=>{
            if (s.val()===true){
                admin.database().ref('/alarm/notify').set(payload.notification.body)
                .catch(e=>{ res.status(403).send("notify write failed: " + e.code); });
                admin.database().ref('/fcmTokens/').once("value", d=>{
                    let tokens=[];
                    Object.keys(d.val()).forEach(k=>{ tokens.push(d.val()[k]); });
                    admin.messaging().sendToDevice(tokens, payload)
                    .then(_=>{res.status(200).send("OK"); return true;})
                    .catch(e=>{res.status(500).send("Error accured: " + e.code);})
                }, e=>{
                    res.status(403).send("db read failed: " + e.code);
                });
            } else { res.status(200).send("OFF"); }
        });
    } else {
        res.status(403).send("no ID");
    }
});
