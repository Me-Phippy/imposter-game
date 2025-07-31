# Firebase Setup Anleitung

## 1. Firebase Projekt erstellen
1. Gehe zu https://console.firebase.google.com/
2. Klicke auf "Projekt hinzufügen"
3. Nenne dein Projekt "imposter-game" (oder einen anderen Namen)
4. Wähle dein Land und akzeptiere die Bedingungen

## 2. Realtime Database einrichten
1. In der Firebase Console, gehe zu "Realtime Database"
2. Klicke "Datenbank erstellen"
3. Wähle Standort (Europe-west1 empfohlen für Deutschland)
4. Starte im **"Testmodus"** (für den Anfang)

## 3. Firebase Config erhalten
1. Gehe zu Projekteinstellungen (Zahnrad-Symbol)
2. Klicke auf "Allgemein" Tab
3. Scrolle runter zu "Deine Apps"
4. Klicke auf "Web-App hinzufügen" (</> Symbol)
5. Nenne die App "Imposter Game Web"
6. Kopiere die Firebase-Konfiguration

## 4. Config in deine App einfügen
Öffne `lib/firebase.ts` und ersetze die Platzhalter:

```typescript
const firebaseConfig = {
  apiKey: "dein-echter-api-key",
  authDomain: "dein-projekt.firebaseapp.com",
  databaseURL: "https://dein-projekt-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dein-projekt-id",
  storageBucket: "dein-projekt.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345"
}
```

## 5. Database Rules (für Passwort-Schutz)
In Firebase Console > Realtime Database > Rules:

```json
{
  "rules": {
    "words": {
      ".read": true,
      ".write": true
    }
  }
}
```

**WICHTIG**: Diese Rules erlauben jedem das Lesen und Schreiben. Für eine echte App solltest du Firebase Authentication verwenden.

## 6. Test deine Verbindung
Nach dem Setup sollte deine App automatisch mit Firebase verbunden sein.
Die grüne "Online"-Anzeige zeigt eine erfolgreiche Verbindung.

## 7. Deine erste Wörter hinzufügen
1. Gib das Admin-Passwort ein
2. Füge ein paar Test-Wörter hinzu
3. Sie erscheinen sofort in der Firebase Console unter Database

## Security Hinweis
Aktuell ist die Datenbank öffentlich zugänglich. Für Produktion solltest du:
- Firebase Authentication aktivieren
- Bessere Security Rules schreiben
- API-Keys als Umgebungsvariablen verwenden
