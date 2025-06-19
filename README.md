# ÜlikooliAed-Admin
Tegemist on admini liidesega Ülikooliaed mängule. 
Antud liideses on võimalik lisada, muuta, kustutada küsimusi ja vaadata mängijate edetabelit.

![img.png](img.png)


Rakenduse käivitamine lokaalselt:
Rakenduse käivituseks on vaja postgres andmebaasi ja nodejs.

Kontrolli node olemasolu:<br>
1)node --version <br>
2)npm --version

Installi sõltuvused logimiseks:<br>
1)npm install express bcrypt express-session pg <br>
2)npm install --save-dev nodemon

Lisa server.js enda postgre andmebaasi andmed.
Jooksuta DDL kaustas oled skriptid, et luua andmestruktuurid baasis.

Jooksuta server: npm start
