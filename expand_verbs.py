#!/usr/bin/env python3
"""Expand verb groups to 100 most important Turkish verbs in meaningful categories"""
import json

with open('data/sentence1.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

verb_word = None
for word in data['sentence']['words']:
    if word['role'] == 'Verb':
        verb_word = word
        break

if not verb_word:
    print("ERROR: No verb word found!")
    exit(1)

# 100+ most important Turkish verbs grouped in categories
# format: stem, full_word (infinitive), meaning
new_verb_groups = {
    "alltag": {
        "label": "Alltag",
        "items": [
            {"stem": "yap", "full_word": "yapmak", "meaning": "machen/tun"},
            {"stem": "gel", "full_word": "gelmek", "meaning": "kommen"},
            {"stem": "git", "full_word": "gitmek", "meaning": "gehen"},
            {"stem": "al", "full_word": "almak", "meaning": "nehmen/kaufen"},
            {"stem": "ver", "full_word": "vermek", "meaning": "geben"},
            {"stem": "ye", "full_word": "yemek", "meaning": "essen"},
            {"stem": "ic", "full_word": "icmek", "meaning": "trinken"},
            {"stem": "uyu", "full_word": "uyumak", "meaning": "schlafen"},
            {"stem": "giy", "full_word": "giymek", "meaning": "anziehen"},
            {"stem": "kullan", "full_word": "kullanmak", "meaning": "benutzen"},
            {"stem": "bekle", "full_word": "beklemek", "meaning": "warten"},
            {"stem": "yasa", "full_word": "yasamak", "meaning": "leben"},
        ]
    },
    "kommunikation": {
        "label": "Kommunikation",
        "items": [
            {"stem": "soyle", "full_word": "soylemek", "meaning": "sagen"},
            {"stem": "konus", "full_word": "konusmak", "meaning": "sprechen"},
            {"stem": "sor", "full_word": "sormak", "meaning": "fragen"},
            {"stem": "anlat", "full_word": "anlatmak", "meaning": "erzaehlen"},
            {"stem": "yaz", "full_word": "yazmak", "meaning": "schreiben"},
            {"stem": "oku", "full_word": "okumak", "meaning": "lesen"},
            {"stem": "dinle", "full_word": "dinlemek", "meaning": "zuhoeren"},
            {"stem": "ara", "full_word": "aramak", "meaning": "anrufen/suchen"},
            {"stem": "cevapla", "full_word": "cevaplamak", "meaning": "antworten"},
            {"stem": "acikla", "full_word": "aciklamak", "meaning": "erklaeren"},
            {"stem": "goster", "full_word": "gostermek", "meaning": "zeigen"},
            {"stem": "ogret", "full_word": "ogretmek", "meaning": "lehren"},
        ]
    },
    "bewegung": {
        "label": "Bewegung",
        "items": [
            {"stem": "kos", "full_word": "kosmak", "meaning": "rennen"},
            {"stem": "yuru", "full_word": "yurumek", "meaning": "laufen/gehen"},
            {"stem": "otur", "full_word": "oturmak", "meaning": "sitzen"},
            {"stem": "kalk", "full_word": "kalkmak", "meaning": "aufstehen"},
            {"stem": "don", "full_word": "donmek", "meaning": "zurueckkehren"},
            {"stem": "bin", "full_word": "binmek", "meaning": "einsteigen"},
            {"stem": "in", "full_word": "inmek", "meaning": "aussteigen"},
            {"stem": "dur", "full_word": "durmak", "meaning": "anhalten/stehen"},
            {"stem": "dus", "full_word": "dusmek", "meaning": "fallen"},
            {"stem": "atla", "full_word": "atlamak", "meaning": "springen"},
            {"stem": "uc", "full_word": "ucmak", "meaning": "fliegen"},
            {"stem": "gir", "full_word": "girmek", "meaning": "eintreten"},
            {"stem": "cik", "full_word": "cikmak", "meaning": "hinausgehen"},
        ]
    },
    "gefuehle": {
        "label": "Gefuehle/Denken",
        "items": [
            {"stem": "sev", "full_word": "sevmek", "meaning": "lieben"},
            {"stem": "iste", "full_word": "istemek", "meaning": "wollen"},
            {"stem": "begen", "full_word": "begenmek", "meaning": "moegen"},
            {"stem": "kork", "full_word": "korkmak", "meaning": "fuerchten"},
            {"stem": "uzul", "full_word": "uzulmek", "meaning": "traurig sein"},
            {"stem": "sevin", "full_word": "sevinmek", "meaning": "sich freuen"},
            {"stem": "kiz", "full_word": "kizmak", "meaning": "wuetend werden"},
            {"stem": "guven", "full_word": "guvenmek", "meaning": "vertrauen"},
            {"stem": "dusun", "full_word": "dusunmek", "meaning": "denken"},
            {"stem": "hatirla", "full_word": "hatirlamak", "meaning": "sich erinnern"},
            {"stem": "unut", "full_word": "unutmak", "meaning": "vergessen"},
            {"stem": "anla", "full_word": "anlamak", "meaning": "verstehen"},
            {"stem": "bil", "full_word": "bilmek", "meaning": "wissen/koennen"},
            {"stem": "san", "full_word": "sanmak", "meaning": "glauben/meinen"},
        ]
    },
    "arbeit": {
        "label": "Arbeit/Lernen",
        "items": [
            {"stem": "calis", "full_word": "calismak", "meaning": "arbeiten"},
            {"stem": "ogren", "full_word": "ogrenmek", "meaning": "lernen"},
            {"stem": "basla", "full_word": "baslamak", "meaning": "beginnen"},
            {"stem": "bitir", "full_word": "bitirmek", "meaning": "beenden"},
            {"stem": "dene", "full_word": "denemek", "meaning": "versuchen"},
            {"stem": "bul", "full_word": "bulmak", "meaning": "finden"},
            {"stem": "sec", "full_word": "secmek", "meaning": "waehlen"},
            {"stem": "topla", "full_word": "toplamak", "meaning": "sammeln"},
            {"stem": "hazirla", "full_word": "hazirlamak", "meaning": "vorbereiten"},
            {"stem": "planla", "full_word": "planlamak", "meaning": "planen"},
            {"stem": "devam et", "full_word": "devam etmek", "meaning": "fortsetzen"},
            {"stem": "tamamla", "full_word": "tamamlamak", "meaning": "vervollstaendigen"},
        ]
    },
    "haushalt": {
        "label": "Haushalt/Objekte",
        "items": [
            {"stem": "ac", "full_word": "acmak", "meaning": "oeffnen"},
            {"stem": "kapat", "full_word": "kapatmak", "meaning": "schliessen"},
            {"stem": "yika", "full_word": "yikamak", "meaning": "waschen"},
            {"stem": "pisir", "full_word": "pisirmek", "meaning": "kochen"},
            {"stem": "temizle", "full_word": "temizlemek", "meaning": "putzen"},
            {"stem": "tasi", "full_word": "tasimak", "meaning": "tragen"},
            {"stem": "koy", "full_word": "koymak", "meaning": "legen/stellen"},
            {"stem": "sat", "full_word": "satmak", "meaning": "verkaufen"},
            {"stem": "ode", "full_word": "odemek", "meaning": "bezahlen"},
            {"stem": "tut", "full_word": "tutmak", "meaning": "halten/fangen"},
            {"stem": "birak", "full_word": "birakmak", "meaning": "lassen/loslassen"},
            {"stem": "getir", "full_word": "getirmek", "meaning": "bringen"},
        ]
    },
    "sozial": {
        "label": "Sozial/Beziehung",
        "items": [
            {"stem": "tani", "full_word": "tanimak", "meaning": "kennen/erkennen"},
            {"stem": "tanis", "full_word": "tanismak", "meaning": "kennenlernen"},
            {"stem": "yardim et", "full_word": "yardim etmek", "meaning": "helfen"},
            {"stem": "paylas", "full_word": "paylasmak", "meaning": "teilen"},
            {"stem": "davet et", "full_word": "davet etmek", "meaning": "einladen"},
            {"stem": "kabul et", "full_word": "kabul etmek", "meaning": "akzeptieren"},
            {"stem": "reddet", "full_word": "reddetmek", "meaning": "ablehnen"},
            {"stem": "tesekkur et", "full_word": "tesekkur etmek", "meaning": "danken"},
            {"stem": "bulus", "full_word": "bulusmak", "meaning": "sich treffen"},
            {"stem": "evlen", "full_word": "evlenmek", "meaning": "heiraten"},
        ]
    },
    "wahrnehmung": {
        "label": "Wahrnehmung/Sinne",
        "items": [
            {"stem": "gor", "full_word": "gormek", "meaning": "sehen"},
            {"stem": "duy", "full_word": "duymak", "meaning": "hoeren/fuehlen"},
            {"stem": "bak", "full_word": "bakmak", "meaning": "schauen/gucken"},
            {"stem": "hisset", "full_word": "hissetmek", "meaning": "fuehlen/spueren"},
            {"stem": "dokun", "full_word": "dokunmak", "meaning": "beruehren"},
            {"stem": "fark et", "full_word": "fark etmek", "meaning": "bemerken"},
            {"stem": "izle", "full_word": "izlemek", "meaning": "beobachten/anschauen"},
            {"stem": "kesfet", "full_word": "kesfetmek", "meaning": "entdecken"},
            {"stem": "dikkat et", "full_word": "dikkat etmek", "meaning": "aufpassen"},
            {"stem": "tani", "full_word": "tanimak", "meaning": "erkennen"},
        ]
    },
    "veraenderung": {
        "label": "Veraenderung/Zustand",
        "items": [
            {"stem": "degis", "full_word": "degismek", "meaning": "sich aendern"},
            {"stem": "degistir", "full_word": "degistirmek", "meaning": "aendern"},
            {"stem": "buyu", "full_word": "buyumek", "meaning": "wachsen"},
            {"stem": "ol", "full_word": "olmak", "meaning": "werden/sein"},
            {"stem": "kal", "full_word": "kalmak", "meaning": "bleiben"},
            {"stem": "kaybet", "full_word": "kaybetmek", "meaning": "verlieren"},
            {"stem": "kazan", "full_word": "kazanmak", "meaning": "gewinnen/verdienen"},
            {"stem": "ogren", "full_word": "ogrenmek", "meaning": "lernen"},
            {"stem": "gelis", "full_word": "gelismek", "meaning": "sich entwickeln"},
            {"stem": "kur", "full_word": "kurmak", "meaning": "gruenden/aufbauen"},
            {"stem": "yarat", "full_word": "yaratmak", "meaning": "erschaffen"},
            {"stem": "iyiles", "full_word": "iyilesmek", "meaning": "sich verbessern/heilen"},
        ]
    }
}

total = sum(len(g["items"]) for g in new_verb_groups.values())
print(f"Total verbs: {total} in {len(new_verb_groups)} categories")

# Update the verb word's adverb_groups
verb_word['adverb_groups'] = {
    "selected_group": "alltag",
    "groups": new_verb_groups
}

# Also update stem_alternatives to include more common verbs
verb_word['stem_alternatives'] = [
    {"stem": "ver", "full_word": "vermek", "meaning": "geben"},
    {"stem": "al", "full_word": "almak", "meaning": "nehmen"},
    {"stem": "gel", "full_word": "gelmek", "meaning": "kommen"},
    {"stem": "git", "full_word": "gitmek", "meaning": "gehen"},
    {"stem": "yap", "full_word": "yapmak", "meaning": "machen"},
    {"stem": "oku", "full_word": "okumak", "meaning": "lesen"},
    {"stem": "sev", "full_word": "sevmek", "meaning": "lieben"},
    {"stem": "gör", "full_word": "görmek", "meaning": "sehen"},
    {"stem": "bil", "full_word": "bilmek", "meaning": "wissen"},
    {"stem": "ol", "full_word": "olmak", "meaning": "werden/sein"},
]

# Save
with open('data/sentence1.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Done! Updated sentence1.json with {total} verbs in {len(new_verb_groups)} categories.")