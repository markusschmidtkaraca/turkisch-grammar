# 🇹🇷 Türkische Grammatik Visualisierung

Interaktive Web-App zur Visualisierung türkischer Satzstruktur und Morphologie.

## Features

- **Satzglieder-Anzeige**: Subjekt, Objekte, Verb mit allen Suffixen als klickbare Boxen
- **Vokalharmonie**: Visualisierung der Großen (4-fach) und Kleinen (2-fach) Vokalharmonie
- **Konsonantenwandel**: Übersicht der Konsonantenmutationen (p→b, t→d, k→ğ, ç→c)
- **Personalendungen**: Typ I (k-Typ) und Typ II (z-Typ) farblich unterschieden
- **Zeitformen**: Alle 6 Tempora mit Konjugation (di, iyor, ir, ecek, miş, meli)
- **Verneinung**: Ein/Ausschalten der Verneinung
- **Fragepartikel**: mı/mi/mu/mü mit Vokalharmonie
- **Pluralendung**: Optionales -lar/-ler Toggle
- **Prädikatives Adjektiv**: Adjektiv als Prädikat mit Personalendung (Kopula)
- **Stammwechsel**: Verb- und Nomen-Stämme interaktiv austauschbar
- **Pronomen**: Kasus bereits eingebaut, keine doppelten Suffixe

## Live Demo

Nach Deployment auf GitHub Pages verfügbar unter:
`https://[username].github.io/[reponame]/`

## Lokale Nutzung

```bash
# Mit Node.js:
npx serve .

# Mit Python:
python -m http.server 8000

# Mit VS Code:
# Extension "Live Server" installieren, dann Rechtsklick auf index.html
```

Dann im Browser `http://localhost:8000` (bzw. Port 3000/5500) öffnen.

## Dateistruktur

```
├── index.html          # Hauptseite
├── app.js              # Gesamte Anwendungslogik
├── styles.css          # Styling
├── data/
│   ├── sentence1.json  # Satzdaten (Seni seviyorum)
│   └── sentence2.json  # Weitere Sätze
└── README.md
```

## Hinweis

Die `.py`-Dateien im Repository sind Entwicklungswerkzeuge zum Bearbeiten der JSON-Daten und werden zur Laufzeit nicht benötigt.