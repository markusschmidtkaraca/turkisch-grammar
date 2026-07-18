// Turkish vowel harmony highlighting
function highlightVowels(text, mode) {
    if (!text) return '';
    if (!mode) mode = 'suffix';
    var result = '';
    var darkVowels = 'aıouAIOU';
    var lightVowels = 'eiöüEİÖÜ';
    var grosseVH = 'ıiuüoöIİUÜOÖ';
    var kleineVH = 'aeAE';
    for (var idx = 0; idx < text.length; idx++) {
        var ch = text[idx];
        var isDark = darkVowels.indexOf(ch) !== -1;
        var isLight = lightVowels.indexOf(ch) !== -1;
        if (isDark || isLight) {
            var color = isDark ? '#000' : '#999';
            if (mode === 'stem') {
                result += '<span style="color:' + color + ';">' + ch + '</span>';
            } else {
                var isKleine = kleineVH.indexOf(ch) !== -1;
                var style = isKleine ? 'font-weight:bold;' : 'font-style:italic;';
                result += '<span style="color:' + color + ';' + style + 'font-size:1.1em;">' + ch + '</span>';
            }
        } else {
            if (mode === 'stem' && idx === text.length - 1 && stemConsonantChanges[ch.toLowerCase()]) {
                result += '<span style="color:#e65100;font-weight:bold;">' + ch + '</span>';
                continue;
            }
            if (mode === 'suffix' && idx === 0 && (ch === 't' || ch === 'd')) {
                result += '<span style="color:#e65100;font-weight:bold;">' + ch + '</span>';
                continue;
            }
            if (mode === 'suffix' && idx === 0 && ch === 'y') {
                result += '<span style="color:#00897b;font-weight:bold;">' + ch + '</span>';
                continue;
            }
            result += '<span style="color:#1565c0;font-weight:400;">' + ch + '</span>';
        }
    }
    return result;
}

function getLastVowel(word) {
    var allVowels = 'aeıioöuüAEIİOÖUÜ';
    for (var i = word.length - 1; i >= 0; i--) { if (allVowels.indexOf(word[i]) !== -1) return word[i].toLowerCase(); }
    return 'e';
}
function harmonizeKlein(lastVowel) { return 'aıou'.indexOf(lastVowel) !== -1 ? 'a' : 'e'; }
function harmonizeGross(lastVowel) {
    if (lastVowel === 'a' || lastVowel === 'ı') return 'ı';
    if (lastVowel === 'e' || lastVowel === 'i') return 'i';
    if (lastVowel === 'o' || lastVowel === 'u') return 'u';
    if (lastVowel === 'ö' || lastVowel === 'ü') return 'ü';
    return 'i';
}
function harmonizeSuffix(suffix, stem) {
    var lastV = getLastVowel(stem); var result = '';
    for (var i = 0; i < suffix.length; i++) {
        var ch = suffix[i];
        if (ch === 'a' || ch === 'e') result += harmonizeKlein(lastV);
        else if (ch === 'ı' || ch === 'i' || ch === 'u' || ch === 'ü') result += harmonizeGross(lastV);
        else result += ch;
    }
    return result;
}
var voicelessConsonants = 'pçtkfhsş';
var stemConsonantChanges = { 'p': 'b', 't': 'd', 'k': 'ğ', 'ç': 'c' };
var allVowelsStr = 'aeıioöuüAEIİOÖUÜ';
function needsBufferConsonant(stem, suffix) {
    if (!stem || !suffix) return false;
    return allVowelsStr.indexOf(stem[stem.length-1].toLowerCase()) !== -1 && allVowelsStr.indexOf(suffix[0].toLowerCase()) !== -1;
}
function insertBufferConsonant(stem, suffix) { return needsBufferConsonant(stem, suffix) ? 'y' + suffix : suffix; }
function applyConsonantHarmony(suffix, stem) {
    if (!suffix || !stem) return suffix;
    suffix = insertBufferConsonant(stem, suffix);
    if (suffix[0] === 'd' && voicelessConsonants.indexOf(stem[stem.length-1].toLowerCase()) !== -1) suffix = 't' + suffix.slice(1);
    return suffix;
}
function applyStemChange(stem, suffix) {
    if (!suffix || !stem) return stem;
    var allVowels = 'aeıioöuü';
    if (allVowels.indexOf(suffix[0]) !== -1 && stemConsonantChanges[stem[stem.length-1]]) return stem.slice(0, -1) + stemConsonantChanges[stem[stem.length-1]];
    return stem;
}
function buildHarmonizedWord(stem, suffixTemplate) {
    var cleanSuffix = suffixTemplate.replace(/^-/, '');
    var harmonized = harmonizeSuffix(cleanSuffix, stem);
    harmonized = applyConsonantHarmony(harmonized, stem);
    return applyStemChange(stem, harmonized) + harmonized;
}

// Personal ending extraction
function getPersonalEnding(word) {
    if (!word || word.role !== 'Verb') return '';
    var person = getCurrentPerson();
    var tense = word.current_tense || 'di';
    if (word.conjugation && word.conjugation[tense] && word.conjugation[tense][person]) {
        var form = word.conjugation[tense][person];
        var parts = form.suffix.split('-').filter(function(p) { return p !== ''; });
        if (parts.length >= 2) return '-' + parts[parts.length - 1];
        return '\u2205';
    }
    // Fallback: compute personal ending from known patterns
    return getDefaultPersonalEnding(person, tense);
}
// Default personal endings by person and tense
function getDefaultPersonalEnding(person, tense) {
    var endings = {
        'di':   {'1sg':'-m','2sg':'-n','3sg':'\u2205','1pl':'-k','2pl':'-niz','3pl':'-ler'},
        'iyor': {'1sg':'-um','2sg':'-sun','3sg':'\u2205','1pl':'-uz','2pl':'-sunuz','3pl':'-lar'},
        'ir':   {'1sg':'-im','2sg':'-sin','3sg':'\u2205','1pl':'-iz','2pl':'-siniz','3pl':'-ler'},
        'ecek': {'1sg':'-im','2sg':'-sin','3sg':'\u2205','1pl':'-iz','2pl':'-siniz','3pl':'-ler'},
        'mis':  {'1sg':'-im','2sg':'-sin','3sg':'\u2205','1pl':'-iz','2pl':'-siniz','3pl':'-ler'},
        'meli': {'1sg':'-yim','2sg':'-sin','3sg':'\u2205','1pl':'-yiz','2pl':'-siniz','3pl':'-ler'}
    };
    if (endings[tense] && endings[tense][person]) return endings[tense][person];
    return '\u2205';
}
// Determine if tense uses Typ I (k-type) or Typ II (z-type) personal endings
function getPersonalEndingType(tense) {
    // Typ I (k-Typ): di-Vergangenheit, Konditional
    if (tense === 'di') return 1;
    // Typ II (z-Typ): iyor, ir, ecek, mis, meli, copula
    return 2;
}
// Get tense-only suffix (without personal ending) for display in tense box
function getTenseSuffix(word) {
    if (!word || word.role !== 'Verb') return '';
    var person = getCurrentPerson();
    var tense = word.current_tense || 'di';
    if (word.conjugation && word.conjugation[tense] && word.conjugation[tense][person]) {
        var form = word.conjugation[tense][person];
        var parts = form.suffix.split('-').filter(function(p) { return p !== ''; });
        if (parts.length >= 2) return '-' + parts.slice(0, -1).join('-');
        return form.suffix;
    }
    // Fallback: use suffix from variations or default
    if (word.suffixes && word.suffixes.length > 0 && word.suffixes[0].variations) {
        var found = '';
        word.suffixes[0].variations.forEach(function(v) {
            if (v.tense_key === tense) found = v.suffix;
        });
        if (found) return found;
    }
    return word.suffixes && word.suffixes.length > 0 ? word.suffixes[0].suffix : '';
}
function getPersonLabel(person) {
    var labels = {'1sg':'1.Sg (ich)','2sg':'2.Sg (du)','3sg':'3.Sg (er/sie/es)','1pl':'1.Pl (wir)','2pl':'2.Pl (ihr/Sie)','3pl':'3.Pl (sie)'};
    return labels[person] || person;
}
function getPersonLabelShort(person) {
    var labels = {'1sg':'1.Sg','2sg':'2.Sg','3sg':'3.Sg','1pl':'1.Pl','2pl':'2.Pl','3pl':'3.Pl'};
    return labels[person] || person;
}
function getPersonLabelDeutsch(person) {
    var labels = {'1sg':'ich','2sg':'du','3sg':'er/sie/es','1pl':'wir','2pl':'ihr/Sie','3pl':'sie (Pl.)'};
    return labels[person] || person;
}
// Adjective predicate personal endings (copula)
function getAdjPersonalEnding(adjStem, person) {
    if (!adjStem || !person) return '\u2205';
    var lastV = getLastVowel(adjStem);
    var lastChar = adjStem[adjStem.length - 1];
    var endsInVowel = allVowelsStr.indexOf(lastChar) !== -1;
    var vGross = harmonizeGross(lastV); // ı/i/u/ü
    if (person === '1sg') {
        return '-' + (endsInVowel ? 'y' : '') + vGross + 'm';
    } else if (person === '2sg') {
        return '-s' + vGross + 'n';
    } else if (person === '3sg') {
        return '\u2205';
    } else if (person === '1pl') {
        return '-' + (endsInVowel ? 'y' : '') + vGross + 'z';
    } else if (person === '2pl') {
        return '-s' + vGross + 'n' + vGross + 'z';
    } else if (person === '3pl') {
        return '\u2205';
    }
    return '\u2205';
}


// Show personal ending popup for verbs (all persons overview)
function showPersonalEndingPopup(event, wordIdx) {
    clearTimeout(stemPopupTimer);
    hideStemPopup();
    var word = currentSentence.words[wordIdx];
    if (!word || word.role !== 'Verb') return;
    var tense = word.current_tense || 'di';
    var currentPerson = getCurrentPerson();
    var peType = getPersonalEndingType(tense);
    var peTypeLabel = peType === 1 ? 'Typ I (k-Typ)' : 'Typ II (z-Typ)';
    var tenseLabels = {
        'di': 'di-Vergangenheit',
        'iyor': 'Pr\u00e4sens (-iyor)',
        'ir': 'Aorist (-ir)',
        'ecek': 'Futur (-ecek)',
        'mis': 'mi\u015f-Vergangenheit',
        'meli': 'Notwendigkeit (-meli)'
    };
    var tenseLabel = tenseLabels[tense] || tense;

    var popup = document.createElement('div');
    popup.className = 'popup-panel visible';
    popup.id = 'stem-popup';
    popup.onmouseenter = function() { clearTimeout(stemPopupTimer); };
    popup.onmouseleave = function() { scheduleStemPopupHide(); };

    var html = '<div class="variations-title" style="font-size:1em;margin-bottom:6px;">Personalendungen \u2013 ' + peTypeLabel + '</div>';
    html += '<div style="font-size:0.8em;color:#666;margin-bottom:10px;text-align:center;">' + tenseLabel + ' \u2013 Stamm: <b>' + word.stem + '</b></div>';

    // Table with all persons
    html += '<table class="pe-table">';
    html += '<tr><th>Person</th><th>Endung</th><th>Vollform</th><th>Bedeutung</th></tr>';

    var persons = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'];
    persons.forEach(function(p) {
        var isActive = (p === currentPerson);
        var rowClass = isActive ? ' class="pe-active"' : '';
        var ending = '';
        var fullWord = '';
        var meaning = '';

        if (word.conjugation && word.conjugation[tense] && word.conjugation[tense][p]) {
            var form = word.conjugation[tense][p];
            var parts = form.suffix.split('-').filter(function(part) { return part !== ''; });
            if (parts.length >= 2) {
                ending = '-' + parts[parts.length - 1];
            } else {
                ending = '\u2205';
            }
            fullWord = form.full_word;
            meaning = form.meaning;
        } else {
            ending = getDefaultPersonalEnding(p, tense);
            fullWord = '';
            meaning = '';
        }

        var endingDisplay = (ending === '\u2205') ? '\u2205' : ending;
        html += '<tr' + rowClass + '>';
        html += '<td class="pe-person">' + getPersonLabelShort(p) + ' <span class="pe-deutsch">(' + getPersonLabelDeutsch(p) + ')</span></td>';
        html += '<td class="pe-ending">' + endingDisplay + '</td>';
        html += '<td class="pe-fullword">' + fullWord + '</td>';
        html += '<td class="pe-meaning">' + meaning + '</td>';
        html += '</tr>';
    });
    html += '</table>';

    // Type comparison info
    html += '<div style="margin-top:10px;padding-top:8px;border-top:1px solid #eee;font-size:0.75em;color:#888;text-align:center;">';
    html += '<b>Typ I (k-Typ):</b> -m, -n, \u2205, -k, -niz, -ler &nbsp;|&nbsp; ';
    html += '<b>Typ II (z-Typ):</b> -im, -sin, \u2205, -iz, -siniz, -ler';
    html += '</div>';

    popup.innerHTML = html;
    document.body.appendChild(popup);
    stemPopupElement = popup;
    var rect = event.target.closest('.suffix-box').getBoundingClientRect();
    popup.style.left = Math.max(10, rect.left - 80) + 'px';
    popup.style.top = (rect.bottom + 8 + window.scrollY) + 'px';
}

// Show personal ending popup for adjectives (copula, all persons)
function showAdjPersonalEndingPopup(event, wordIdx) {
    clearTimeout(stemPopupTimer);
    hideStemPopup();
    var word = currentSentence.words[wordIdx];
    if (!word || word.role !== 'Adjektiv' || !word.full_word) return;
    var currentPerson = getCurrentPerson();
    var adjStem = word.full_word;

    var popup = document.createElement('div');
    popup.className = 'popup-panel visible';
    popup.id = 'stem-popup';
    popup.onmouseenter = function() { clearTimeout(stemPopupTimer); };
    popup.onmouseleave = function() { scheduleStemPopupHide(); };

    var html = '<div class="variations-title" style="font-size:1em;margin-bottom:6px;">Personalendungen (Kopula) \u2013 Typ II</div>';
    html += '<div style="font-size:0.8em;color:#666;margin-bottom:10px;text-align:center;">Adjektiv als Pr\u00e4dikat: <b>' + adjStem + '</b></div>';

    html += '<table class="pe-table">';
    html += '<tr><th>Person</th><th>Endung</th><th>Vollform</th></tr>';

    var persons = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'];
    persons.forEach(function(p) {
        var isActive = (p === currentPerson);
        var rowClass = isActive ? ' class="pe-active"' : '';
        var ending = getAdjPersonalEnding(adjStem, p);
        var endingDisplay = (ending === '\u2205') ? '\u2205' : ending;
        var fullForm = adjStem;
        if (ending !== '\u2205') {
            fullForm = adjStem + ending.replace(/^-/, '');
        }

        html += '<tr' + rowClass + '>';
        html += '<td class="pe-person">' + getPersonLabelShort(p) + ' <span class="pe-deutsch">(' + getPersonLabelDeutsch(p) + ')</span></td>';
        html += '<td class="pe-ending">' + endingDisplay + '</td>';
        html += '<td class="pe-fullword">' + fullForm + '</td>';
        html += '</tr>';
    });
    html += '</table>';

    popup.innerHTML = html;
    document.body.appendChild(popup);
    stemPopupElement = popup;
    var rect = event.target.closest('.suffix-box').getBoundingClientRect();
    popup.style.left = Math.max(10, rect.left - 80) + 'px';
    popup.style.top = (rect.bottom + 8 + window.scrollY) + 'px';
}


// Get the question pronoun for a given sentence role
function getFragewort(word) {
    if (!word || !word.role) return '';
    switch(word.role) {
        case 'Subjekt':
            return 'Kim? / Ne?';
        case 'Direktes Objekt':
            return 'Kimi? / Neyi?';
        case 'Indirektes Objekt':
            return 'Kime? / Neye?';
        case 'Herkunftsangabe':
            return 'Kimden? / Nereden?';
        case 'Ortsangabe':
            return 'Kimde? / Nerede?';
        case 'Adjektiv':
            return 'Nas\u0131l?';
        case 'Adverb':
            return 'Nas\u0131l? / Ne zaman?';
        default:
            return '';
    }
}
function getFragewortDE(word) {
    if (!word || !word.role) return '';
    switch(word.role) {
        case 'Subjekt':
            return 'Wer? / Was?';
        case 'Direktes Objekt':
            return 'Wen? / Was?';
        case 'Indirektes Objekt':
            return 'Wem?';
        case 'Herkunftsangabe':
            return 'Woher?';
        case 'Ortsangabe':
            return 'Wo?';
        case 'Adjektiv':
            return 'Wie?';
        case 'Adverb':
            return 'Wie? / Wann?';
        default:
            return '';
    }
}


// Show Genitiv endings popup - all persons with correct vowel
function showGenitivPopup(event, wordIdx) {
    clearTimeout(stemPopupTimer);
    hideStemPopup();
    var word = currentSentence.words[wordIdx];
    if (!word || !word.possessive || !word.possessive.active) return;
    var selectedOwner = word.possessive.selected_owner;
    var owner = word.possessive.owners[selectedOwner];
    var ownerStem = owner.stem;

    // Compute the genitive suffix for the selected noun
    var lastV = getLastVowel(ownerStem);
    var lastChar = ownerStem[ownerStem.length - 1];
    var endsInVowel = allVowelsStr.indexOf(lastChar) !== -1;
    var vGross = harmonizeGross(lastV);
    var nounSuffix = endsInVowel ? '-n' + vGross + 'n' : '-' + vGross + 'n';

    var popup = document.createElement('div');
    popup.className = 'popup-panel visible';
    popup.id = 'stem-popup';
    popup.onmouseenter = function() { clearTimeout(stemPopupTimer); };
    popup.onmouseleave = function() { scheduleStemPopupHide(); };

    var html = '<div class="variations-title" style="font-size:1em;margin-bottom:6px;">Genitiv-Endungen (Wessen?)</div>';

    html += '<table class="pe-table">';
    html += '<tr><th>Person</th><th>Endung</th><th>Form</th></tr>';
    html += '<tr><td class="pe-person">1.Sg (mein)</td><td class="pe-ending">-(i)m</td><td class="pe-fullword">benim</td></tr>';
    html += '<tr><td class="pe-person">2.Sg (dein)</td><td class="pe-ending">-(i)n</td><td class="pe-fullword">senin</td></tr>';
    html += '<tr><td class="pe-person">3.Sg (sein/ihr)</td><td class="pe-ending">-(n)' + vGross + 'n</td><td class="pe-fullword">onun</td></tr>';
    html += '<tr><td class="pe-person">1.Pl (unser)</td><td class="pe-ending">-(i)m</td><td class="pe-fullword">bizim</td></tr>';
    html += '<tr><td class="pe-person">2.Pl (euer)</td><td class="pe-ending">-(i)n</td><td class="pe-fullword">sizin</td></tr>';
    html += '<tr><td class="pe-person">3.Pl (ihr)</td><td class="pe-ending">-lar' + vGross + 'n</td><td class="pe-fullword">onlar\u0131n</td></tr>';
    html += '<tr class="pe-active" style="border-top:2px solid #ddd;"><td class="pe-person">' + ownerStem + '</td><td class="pe-ending">' + nounSuffix + '</td><td class="pe-fullword">' + owner.genitive + '</td></tr>';
    html += '</table>';

    popup.innerHTML = html;
    document.body.appendChild(popup);
    stemPopupElement = popup;
    var rect = event.target.closest('.suffix-box').getBoundingClientRect();
    popup.style.left = Math.max(10, rect.left - 80) + 'px';
    popup.style.top = (rect.bottom + 8 + window.scrollY) + 'px';
}

// Show Possessiv endings popup - all persons with vowel harmony for selected word
function showPossessivPopup(event, wordIdx) {
    clearTimeout(stemPopupTimer);
    hideStemPopup();
    var word = currentSentence.words[wordIdx];
    if (!word || !word.possessive || !word.possessive.active) return;
    var possession = word.possessive.possessions[word.possessive.selected_possession];
    var stem = possession.stem;

    var popup = document.createElement('div');
    popup.className = 'popup-panel visible';
    popup.id = 'stem-popup';
    popup.onmouseenter = function() { clearTimeout(stemPopupTimer); };
    popup.onmouseleave = function() { scheduleStemPopupHide(); };

    // Compute possessive suffix for each person based on vowel harmony of the stem
    var lastV = getLastVowel(stem);
    var lastChar = stem[stem.length - 1];
    var endsInVowel = allVowelsStr.indexOf(lastChar) !== -1;
    var vGross = harmonizeGross(lastV);

    var possPersons = [];
    // 1.Sg: -(I)m
    var s1 = endsInVowel ? '-m' : '-' + vGross + 'm';
    var f1 = stem + (endsInVowel ? 'm' : vGross + 'm');
    possPersons.push({person: '1.Sg', suffix: s1, form: f1, meaning: 'mein(e) ' + possession.meaning});
    // 2.Sg: -(I)n
    var s2 = endsInVowel ? '-n' : '-' + vGross + 'n';
    var f2 = stem + (endsInVowel ? 'n' : vGross + 'n');
    possPersons.push({person: '2.Sg', suffix: s2, form: f2, meaning: 'dein(e) ' + possession.meaning});
    // 3.Sg: -(s)I
    var s3 = endsInVowel ? '-s' + vGross : '-' + vGross;
    var f3 = stem + (endsInVowel ? 's' + vGross : vGross);
    possPersons.push({person: '3.Sg', suffix: s3, form: f3, meaning: 'sein(e) ' + possession.meaning});
    // 1.Pl: -(I)mIz
    var s4 = endsInVowel ? '-m' + vGross + 'z' : '-' + vGross + 'm' + vGross + 'z';
    var f4 = stem + (endsInVowel ? 'm' + vGross + 'z' : vGross + 'm' + vGross + 'z');
    possPersons.push({person: '1.Pl', suffix: s4, form: f4, meaning: 'unser(e) ' + possession.meaning});
    // 2.Pl: -(I)nIz
    var s5 = endsInVowel ? '-n' + vGross + 'z' : '-' + vGross + 'n' + vGross + 'z';
    var f5 = stem + (endsInVowel ? 'n' + vGross + 'z' : vGross + 'n' + vGross + 'z');
    possPersons.push({person: '2.Pl', suffix: s5, form: f5, meaning: 'euer/Ihr(e) ' + possession.meaning});
    // 3.Pl: -lArI
    var plV = harmonizeKlein(lastV);
    var s6 = '-l' + plV + 'r' + vGross;
    var f6 = stem + 'l' + plV + 'r' + vGross;
    possPersons.push({person: '3.Pl', suffix: s6, form: f6, meaning: 'ihr(e) ' + possession.meaning + ' (Pl.)'});

    var html = '<div class="variations-title" style="font-size:1em;margin-bottom:6px;">Possessiv-Endungen (' + stem + ')</div>';
    html += '<div style="font-size:0.8em;color:#666;margin-bottom:10px;text-align:center;">Aktuell: <b>' + possession.possessed + '</b> (' + possession.meaning + ')</div>';

    html += '<table class="pe-table">';
    html += '<tr><th>Person</th><th>Suffix</th><th>Form</th><th>Bedeutung</th></tr>';
    possPersons.forEach(function(pp) {
        var isActive = (pp.person === '3.Sg');
        var rowClass = isActive ? ' class="pe-active"' : '';
        html += '<tr' + rowClass + '>';
        html += '<td class="pe-person">' + pp.person + '</td>';
        html += '<td class="pe-ending">' + pp.suffix + '</td>';
        html += '<td class="pe-fullword">' + pp.form + '</td>';
        html += '<td class="pe-meaning">' + pp.meaning + '</td>';
        html += '</tr>';
    });
    html += '</table>';

    popup.innerHTML = html;
    document.body.appendChild(popup);
    stemPopupElement = popup;
    var rect = event.target.closest('.suffix-box').getBoundingClientRect();
    popup.style.left = Math.max(10, rect.left - 80) + 'px';
    popup.style.top = (rect.bottom + 8 + window.scrollY) + 'px';
}


function loadSentence(jsonPath) {
    fetch(jsonPath).then(function(r) { if (!r.ok) throw new Error('Nicht gefunden: '+jsonPath); return r.json(); })
    .then(function(data) { renderSentence(data.sentence); })
    .catch(function(e) { document.getElementById('app').innerHTML='<p style="color:red;">'+e.message+'</p>'; });
}

function renderSentence(sentence) {
    hideStemPopup();
    currentSentence = sentence;
    var app = document.getElementById('app');
    var html = '';
    var dynamicMeaning = '';
    sentence.words.forEach(function(w) { if (w.full_word && w.meaning && w.meaning !== '(kein Wort)') { if (dynamicMeaning) dynamicMeaning += ' '; dynamicMeaning += w.meaning; } });
    var isQuestion = false;
    sentence.words.forEach(function(w) { if (w._question) isQuestion = true; });
    // Harmony Visualizations (flex row)
    html += '<div class="harmony-row">';
    // Vowel Harmony Visualization - single grid, explicit row placement
    html += '<div class="vh-container">';
    html += '<div class="vh-title">Vokalharmonie</div>';
    html += '<div class="vh-table">';
    // Headers (row 1)
    html += '<div class="vh-header" style="grid-column:1;grid-row:1;">Vokale</div>';
    html += '<div class="vh-header" style="grid-column:2;grid-row:1;">Gro\u00dfe VH (4)</div>';
    html += '<div class="vh-header" style="grid-column:3;grid-row:1;">Kleine VH (2)</div>';
    // Column 1: vowels (rows 2-9)
    html += '<div class="vh-vowel dark" style="grid-column:1;grid-row:2;">a</div>';
    html += '<div class="vh-vowel dark" style="grid-column:1;grid-row:3;">\u0131</div>';
    html += '<div class="vh-vowel dark" style="grid-column:1;grid-row:4;">o</div>';
    html += '<div class="vh-vowel dark" style="grid-column:1;grid-row:5;">u</div>';
    html += '<div class="vh-vowel light" style="grid-column:1;grid-row:6;">e</div>';
    html += '<div class="vh-vowel light" style="grid-column:1;grid-row:7;">i</div>';
    html += '<div class="vh-vowel light" style="grid-column:1;grid-row:8;">\u00f6</div>';
    html += '<div class="vh-vowel light" style="grid-column:1;grid-row:9;">\u00fc</div>';
    // Column 2: Gro\u00dfe VH (each spans 2 rows)
    html += '<div class="vh-group dark-bg" style="grid-column:2;grid-row:2/4;"><span class="vh-result italic">\u0131</span></div>';
    html += '<div class="vh-group dark-bg" style="grid-column:2;grid-row:4/6;"><span class="vh-result italic">u</span></div>';
    html += '<div class="vh-group light-bg" style="grid-column:2;grid-row:6/8;"><span class="vh-result italic">i</span></div>';
    html += '<div class="vh-group light-bg" style="grid-column:2;grid-row:8/10;"><span class="vh-result italic">\u00fc</span></div>';
    // Column 3: Kleine VH (each spans 4 rows)
    html += '<div class="vh-group dark-bg" style="grid-column:3;grid-row:2/6;"><span class="vh-result bold">a</span></div>';
    html += '<div class="vh-group light-bg" style="grid-column:3;grid-row:6/10;"><span class="vh-result bold">e</span></div>';
    html += '</div></div>';
    // Consonant Mutation Visualization
    html += '<div class="vh-container kons-container">';
    html += '<div class="vh-title">Konsonantenwandel</div>';
    html += '<div class="kons-grid">';
    // Stammauslaut vor Vokal-Suffix: p->b, t->d, k->\u011f, \u00e7->c
    html += '<div class="kons-section">';
    html += '<div class="kons-label">Stammauslaut + Vokal-Suffix</div>';
    html += '<div class="kons-row"><span class="kons-from">p</span><span class="kons-arrow">\u2192</span><span class="kons-to">b</span></div>';
    html += '<div class="kons-row"><span class="kons-from">t</span><span class="kons-arrow">\u2192</span><span class="kons-to">d</span></div>';
    html += '<div class="kons-row"><span class="kons-from">k</span><span class="kons-arrow">\u2192</span><span class="kons-to">\u011f</span></div>';
    html += '<div class="kons-row"><span class="kons-from">\u00e7</span><span class="kons-arrow">\u2192</span><span class="kons-to">c</span></div>';
    html += '</div>';
    // Suffix-Anlaut nach stimmlosem Konsonant: d->t
    html += '<div class="kons-section">';
    html += '<div class="kons-label">Suffix nach stimmlosem K.</div>';
    html += '<div class="kons-row"><span class="kons-from">d</span><span class="kons-arrow">\u2192</span><span class="kons-to">t</span></div>';
    html += '<div class="kons-info">nach: p, \u00e7, t, k, f, h, s, \u015f</div>';
    html += '</div>';
    // Bindekonsonant
    html += '<div class="kons-section">';
    html += '<div class="kons-label">Bindekonsonant (Hiat)</div>';
    html += '<div class="kons-row"><span class="kons-from">V</span><span class="kons-arrow">+</span><span class="kons-to">y</span><span class="kons-arrow">+</span><span class="kons-from">V</span></div>';
    html += '<div class="kons-info">Vokal + Vokal \u2192 y eingef\u00fcgt</div>';
    html += '</div>';
    html += '</div></div>';
    html += '</div>'; // close harmony-row
    html += '<div class="section-title">\ud83d\udcdd Satzglieder &amp; Morphologie</div>';
    html += '<p class="hint-text">\ud83d\udca1 Klicke auf Suffixe, Subjekt, oder Verneinungs-Button</p>';
    html += '<div class="sentence-container">';
    sentence.words.forEach(function(word, wordIdx) {
        var hasWordVariations = word.variations && word.variations.length > 0;
        var wordClickClass = hasWordVariations ? ' clickable-word' : '';
        var wordClickAttr = hasWordVariations ? ' onclick="showSubjectVariations('+wordIdx+')"' : '';
        var isEmpty = !word.full_word || word.full_word === '' || word._hiddenByPredicative;
        var emptyClass = isEmpty ? ' empty-word' : '';
        var predicativeClass = (word.role === 'Adjektiv' && word._predicative) ? ' predicative-adj' : '';
        var fragewort = getFragewort(word);
        var fragewortDE = getFragewortDE(word);
        if (fragewort && word.role !== 'Verb') {
            html += '<div class="word-wrapper">';
            html += '<div class="fragewort-box"><span class="fragewort-tr">' + fragewort + '</span><span class="fragewort-de">' + fragewortDE + '</span></div>';
        } else {
            html += '<div class="word-wrapper">';
        }
        html += '<div class="word-box'+wordClickClass+emptyClass+predicativeClass+'"'+wordClickAttr+'>';
        if (isEmpty) {
            var hiddenLabel = word._hiddenByPredicative ? '(entf\u00e4llt bei Pr\u00e4dikat-Adj.)' : '(nicht verwendet)';
            html += '<div class="word-text" style="color:#ccc;font-size:0.9em;">('+word.role_de+')</div>';
            html += '<div class="word-meaning" style="color:#bbb;">'+hiddenLabel+'</div>';
        } else {
            // When predicative adjective mode is active, show subject/pronoun in parentheses (optional)
            var isSubjInPredicative = (word.role === 'Subjekt') && word.meaning && word.meaning.indexOf('Pronomen') !== -1 && currentSentence.words.some(function(w) { return w.role === 'Adjektiv' && w._predicative; });
            if (isSubjInPredicative) {
                html += '<div class="word-text" style="opacity:0.7;">('+highlightVowels(word.full_word,'stem')+')</div>';
                html += '<div class="word-meaning" style="font-size:0.7em;color:#999;">optional (Pronomen)</div>';
            } else if (word.role === 'Adjektiv' && word._predicative && word.full_word) {
                // Show adjective + personal ending as combined word
                var adjEndFull = getAdjPersonalEnding(word.full_word, getCurrentPerson());
                var adjCombined = word.full_word;
                if (adjEndFull && adjEndFull !== '\u2205') {
                    adjCombined = word.full_word + adjEndFull.replace(/^-/, '');
                }
                html += '<div class="word-text">'+highlightVowels(adjCombined,'stem')+'</div>';
                html += '<div class="word-meaning">'+word.meaning+'</div>';
            } else if (word._plural && word.stem && word.role !== 'Verb' && word.role !== 'Adjektiv') {
                // Show noun with plural suffix included in full word
                var plV = getLastVowel(word.stem);
                var plSfx = ('a\u0131ou'.indexOf(plV) !== -1) ? 'lar' : 'ler';
                var pluralStem = word.stem + plSfx;
                // If there are case suffixes, rebuild with plural stem
                var pluralFullWord = pluralStem;
                if (word.suffixes && word.suffixes.length > 0 && word.suffixes[0].suffix) {
                    var caseSuffix = word.suffixes[0].suffix.replace(/^-/, '');
                    // Re-harmonize case suffix to plural stem
                    var harmCase = harmonizeSuffix(caseSuffix, pluralStem);
                    harmCase = applyConsonantHarmony(harmCase, pluralStem);
                    pluralFullWord = pluralStem + harmCase;
                }
                html += '<div class="word-text">'+highlightVowels(pluralFullWord,'stem')+'</div>';
                html += '<div class="word-meaning">'+word.meaning+' (Plural)</div>';
            } else {
                html += '<div class="word-text">'+highlightVowels(word.full_word,'stem')+'</div>';
                html += '<div class="word-meaning">'+word.meaning+'</div>';
            }
        }
        var roleLabel = word.role_de;
        if (word.role === 'Adjektiv' && word._predicative) roleLabel = 'Adjektiv (= Pr\u00e4dikat)';
        html += '<div class="word-role">'+roleLabel+'</div>';
        html += '<div class="morph-boxes">';
        var hasStemAlts = word.stem_alternatives && word.stem_alternatives.length > 0;
        var stemClickClass = hasStemAlts ? ' clickable-stem' : '';
        var stemClickAttr = hasStemAlts ? ' onmouseenter="showStemPopup(event,'+wordIdx+')" onmouseleave="scheduleStemPopupHide()"' : '';
        var stemDisplay = isEmpty ? '\u2795' : highlightVowels(word.stem, 'stem');
        if (word.possessive && word.possessive.active) {
            var owner = word.possessive.owners[word.possessive.selected_owner];
            var possession = word.possessive.possessions[word.possessive.selected_possession];
            html += '<div class="stem-box'+stemClickClass+'"'+stemClickAttr+'><div class="morph-text">'+highlightVowels(owner.stem,'stem')+'</div><div class="morph-label">Besitzer</div></div>';
            html += '<div class="connector">+</div><div class="suffix-box" onmouseenter="showGenitivPopup(event,'+wordIdx+')" onmouseleave="scheduleStemPopupHide()" style="cursor:pointer;"><div class="morph-text">'+highlightVowels(owner.suffix)+'</div><div class="morph-label">Genitiv</div></div>';
            html += '<div class="connector">+</div><div class="stem-box'+stemClickClass+'"'+stemClickAttr+'><div class="morph-text">'+highlightVowels(possession.stem,'stem')+'</div><div class="morph-label">Besitz</div></div>';
            html += '<div class="connector">+</div><div class="suffix-box" onmouseenter="showPossessivPopup(event,'+wordIdx+')" onmouseleave="scheduleStemPopupHide()" style="cursor:pointer;"><div class="morph-text">'+highlightVowels(possession.suffix)+'</div><div class="morph-label">Possessiv</div></div>';
        } else {
            html += '<div class="stem-box'+stemClickClass+'"'+stemClickAttr+'><div class="morph-text">'+stemDisplay+'</div><div class="morph-label">'+(isEmpty?'hinzuf\u00fcgen':'Stamm')+'</div></div>';
        }
        // Plural suffix for nouns (optional, toggleable) - not for pronouns
        if (!isEmpty && !isPronoun && word.role !== 'Verb' && word.role !== 'Adjektiv' && word.role !== 'Adverb' && word.stem) {
            var pluralActive = word._plural ? true : false;
            var pluralText = '\u2014';
            if (pluralActive) {
                var plLastV = getLastVowel(word.stem);
                var plSuffix = ('a\u0131ou'.indexOf(plLastV) !== -1) ? 'lar' : 'ler';
                pluralText = highlightVowels(plSuffix);
            }
            var plStyle = pluralActive ? 'background:#e3f2fd;border-color:#64b5f6;' : 'background:#e3f2fd;border-color:#64b5f6;opacity:0.4;';
            html += '<div class="connector">+</div>';
            html += '<div class="suffix-box clickable" style="'+plStyle+'" onclick="event.stopPropagation();togglePlural('+wordIdx+')">';
            html += '<div class="morph-text">'+pluralText+'</div>';
            html += '<div class="morph-label">Plural</div>';
            html += '<div class="morph-description">'+(pluralActive ? '-lar/-ler' : 'Singular')+'</div>';
            html += '</div>';
        }
        // Question particle moved to end (after personal ending)
        if (word.negation) {
            html += '<div class="connector">+</div>';
            var negRaw = word._negated ? (word._neg_suffix||'-me') : '\u2014';
            var negText = word._negated ? highlightVowels(negRaw) : negRaw;
            var negStyle = word._negated ? ' style="background:#ffcdd2;"' : ' style="opacity:0.5;"';
            html += '<div class="neg-box"'+negStyle+' onclick="event.stopPropagation();toggleNegation('+wordIdx+')" onmouseenter="showNegationPopup(event,'+wordIdx+')" onmouseleave="scheduleStemPopupHide()"><div class="morph-text">'+negText+'</div><div class="morph-label">Verneinung</div></div>';
        }
        var isPronoun = !isEmpty && word.meaning && word.meaning.indexOf('Pronomen') !== -1;
        if (!isEmpty && !isPronoun) word.suffixes.forEach(function(suffix, suffixIdx) {
            html += '<div class="connector">+</div>';
            var hasVariations = suffix.variations && suffix.variations.length > 0;
            var isVerb = (word.role === 'Verb');
            var clickAttr = '';
            if (hasVariations && isVerb) clickAttr = ' onmouseenter="showSuffixPopup(event,'+wordIdx+','+suffixIdx+',true)" onmouseleave="scheduleStemPopupHide()"';
            else if (hasVariations) clickAttr = ' onmouseenter="showSuffixPopup(event,'+wordIdx+','+suffixIdx+',false)" onmouseleave="scheduleStemPopupHide()"';
            var clickClass = hasVariations ? ' clickable' : '';
            // Color verb tense box border to hint at personal ending type
            var tenseColorStyle = '';
            if (isVerb && suffix.variations && suffix.variations.length > 0) {
                var cTense = word.current_tense || 'di';
                var cType = getPersonalEndingType(cTense);
                tenseColorStyle = cType === 1 ? ' style="border-right:4px solid #ab47bc;"' : ' style="border-right:4px solid #26c6da;"';
            }
            html += '<div class="suffix-box'+clickClass+'"'+clickAttr+(tenseColorStyle ? tenseColorStyle : '')+'>';
            // For verbs with conjugation: show only tense suffix (without personal ending)
            var displaySuffix = suffix.suffix;
            if (isVerb && word.conjugation) {
                var tensOnly = getTenseSuffix(word);
                if (tensOnly) displaySuffix = tensOnly;
            }
            html += '<div class="morph-text">'+highlightVowels(displaySuffix)+'</div>';
            html += '<div class="morph-label">'+suffix["function"]+'</div>';
            // For verb tense suffix: add type hint in description
            if (isVerb && suffix.variations && suffix.variations.length > 0) {
                var curTense = word.current_tense || 'di';
                var tType = getPersonalEndingType(curTense);
                var tTypeHint = tType === 1 ? '\u2192 Typ I (k-Typ)' : '\u2192 Typ II (z-Typ)';
                html += '<div class="morph-description">'+tTypeHint+'</div>';
            } else {
                html += '<div class="morph-description">'+suffix.description+'</div>';
            }
            html += '</div>';
        });
        // Personal ending box for adjectives (predicate use, Typ II = copula)
        if (word.role === 'Adjektiv' && !isEmpty && word.full_word) {
            var adjPerson = getCurrentPerson();
            var adjEnding = getAdjPersonalEnding(word.full_word, adjPerson);
            var adjEndingDisplay = adjEnding === '\u2205' ? '\u2205' : highlightVowels(adjEnding.replace(/^-/, ''));
            var predActive = word._predicative ? true : false;
            var adjPeStyle = predActive ? 'background:#e0f7fa;border-color:#26c6da;' : 'background:#e0f7fa;border-color:#26c6da;opacity:0.5;';
            html += '<div class="connector">+</div>';
            html += '<div class="suffix-box clickable" style="'+adjPeStyle+'" onclick="event.stopPropagation();togglePredicative('+wordIdx+')" onmouseenter="showAdjPersonalEndingPopup(event,'+wordIdx+')" onmouseleave="scheduleStemPopupHide()">';
            html += '<div class="morph-text">'+adjEndingDisplay+'</div>';
            html += '<div class="morph-label">'+(predActive ? '= Pr\u00e4dikat' : 'Personalendung')+'</div>';
            html += '<div class="morph-description">'+getPersonLabel(adjPerson)+' \u2013 Typ II (z-Typ)'+(predActive ? '' : ' (optional)')+'</div>';
            html += '</div>';
        }
        // NEW: Personal ending box for verbs (colored by type)
        if (word.role === 'Verb' && !isEmpty) {
            var persEnding = getPersonalEnding(word);
            var person = getCurrentPerson();
            var verbTense = word.current_tense || 'di';
            var peType = getPersonalEndingType(verbTense);
            var peStyle = peType === 1 ? 'background:#f3e5f5;border-color:#ab47bc;' : 'background:#e0f7fa;border-color:#26c6da;';
            var peTypeLabel = peType === 1 ? 'Typ I (k-Typ)' : 'Typ II (z-Typ)';
            var endingDisplay = persEnding === '\u2205' ? '\u2205' : highlightVowels(persEnding.replace(/^-/, ''));
            html += '<div class="connector">+</div>';
            html += '<div class="suffix-box" style="'+peStyle+'" onmouseenter="showPersonalEndingPopup(event,'+wordIdx+')" onmouseleave="scheduleStemPopupHide()">';
            html += '<div class="morph-text">'+endingDisplay+'</div>';
            html += '<div class="morph-label">Personalendung</div>';
            html += '<div class="morph-description">'+getPersonLabel(person)+' \u2013 '+peTypeLabel+'</div>';
            html += '</div>';
        }
        // Question particle at the very end (separate word in Turkish)
        if (word.role === 'Verb' && !isEmpty) {
            html += '<div class="connector">+</div>';
            var baseVerbForm = word.full_word ? word.full_word.split(' ')[0] : '';
            var qParticle = word._question ? harmonizeQuestion(baseVerbForm) : '\u2014';
            var qStyle = word._question ? ' style="background:#e3f2fd;"' : ' style="opacity:0.5;"';
            var qText = word._question ? highlightVowels(qParticle) : qParticle;
            html += '<div class="suffix-box clickable"'+qStyle+' onclick="event.stopPropagation();toggleQuestion('+wordIdx+')"><div class="morph-text">'+qText+'</div><div class="morph-label">Frage</div></div>';
        }
        html += '</div>'; // morph-boxes
        html += '</div>'; // word-box
        html += '</div>'; // word-wrapper
    });
    html += '</div>'; // sentence-container
    html += '<div id="variations-panel" style="display:none;"></div>';
    app.innerHTML = html;
}

function getCurrentPerson() {
    for (var i = 0; i < currentSentence.words.length; i++) {
        if (currentSentence.words[i].role === 'Subjekt' && currentSentence.words[i].person) return currentSentence.words[i].person;
    }
    return '3sg';
}

function showSubjectVariations(wordIdx) {
    var word = currentSentence.words[wordIdx];
    var variations = word.variations;
    if (!variations || variations.length === 0) return;
    var panel = document.getElementById('variations-panel');
    var html = '<div class="variations-panel subject-panel"><div class="variations-title">Subjekt / Pronomen</div><div class="variations-grid">';
    variations.forEach(function(v, varIdx) {
        var isActive = v.full_word === word.full_word ? ' active' : '';
        html += '<div class="variation-card'+isActive+'" onclick="applySubjectVariation('+wordIdx+','+varIdx+')"><div class="var-word">'+v.full_word+'</div><div class="var-meaning">'+v.meaning+'</div><div class="var-description">'+v.description+'</div></div>';
    });
    html += '</div></div>';
    panel.innerHTML = html;
    panel.style.display = 'block';
    panel.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function applySubjectVariation(wordIdx, varIdx) {
    var word = currentSentence.words[wordIdx];
    var variation = word.variations[varIdx];
    word.full_word = variation.full_word;
    word.stem = variation.stem;
    word.meaning = variation.meaning;
    word.person = variation.person;
    updateVerbForPerson(variation.person);
    renderSentence(currentSentence);
    showSubjectVariations(wordIdx);
}

function updateVerbForPerson(person) {
    var verbWord = null;
    for (var i = 0; i < currentSentence.words.length; i++) {
        if (currentSentence.words[i].role === 'Verb') { verbWord = currentSentence.words[i]; break; }
    }
    if (!verbWord || !verbWord.conjugation) return;
    var tense = verbWord.current_tense || 'di';
    if (verbWord.conjugation[tense] && verbWord.conjugation[tense][person]) {
        var form = verbWord.conjugation[tense][person];
        verbWord.full_word = form.full_word;
        verbWord.meaning = form.meaning;
        if (verbWord.suffixes.length > 0) {
            verbWord.suffixes[0].suffix = form.suffix;
            verbWord.suffixes[0].description = person + ' - ' + form.meaning;
        }
    }
}

function applyVariation(wordIdx, suffixIdx, varIdx) {
    var word = currentSentence.words[wordIdx];
    var suffix = word.suffixes[suffixIdx];
    var variation = suffix.variations[varIdx];
    if (variation.tense_key) {
        word.current_tense = variation.tense_key;
        suffix['function'] = variation['function'];
        suffix.description = variation.description;
        rebuildVerbWord(word);
    } else {
        word.full_word = variation.full_word;
        word.meaning = variation.meaning;
        suffix.suffix = variation.suffix;
        suffix['function'] = variation['function'];
        suffix.description = variation.description;
    }
    renderSentence(currentSentence);
}

function rebuildVerbWord(word) {
    if (!word || word.role !== 'Verb') return;
    var tense = word.current_tense || 'di';
    var person = getCurrentPerson();
    if (word._negated) {
        var negation = word.negation;
        if (negation && negation.forms) {
            var tenseFormIdx = 0;
            if (tense === 'iyor') tenseFormIdx = 1;
            else if (tense === 'ir') tenseFormIdx = 2;
            else if (tense === 'ecek') tenseFormIdx = 3;
            var negForm = negation.forms[Math.min(tenseFormIdx, negation.forms.length-1)];
            word.full_word = negForm.full_word;
            word._neg_suffix = negForm.neg_suffix || '-me';
            if (word.suffixes.length > 0) word.suffixes[0].suffix = negForm.tense_suffix || negForm.suffix;
        }
    } else {
        if (word.conjugation && word.conjugation[tense] && word.conjugation[tense][person]) {
            var form = word.conjugation[tense][person];
            word.full_word = form.full_word;
            word.meaning = form.meaning;
            if (word.suffixes.length > 0) word.suffixes[0].suffix = form.suffix;
        } else if (word.suffixes && word.suffixes.length > 0) {
            // No conjugation table for this stem - build dynamically
            var tenseSuffix = '-di';
            if (word.suffixes[0].variations) {
                word.suffixes[0].variations.forEach(function(v) {
                    if (v.tense_key === tense) tenseSuffix = v.suffix;
                });
            }
            var baseWord = buildHarmonizedWord(word.stem, tenseSuffix);
            // Append personal ending to the full word
            var persEnd = getDefaultPersonalEnding(person, tense);
            if (persEnd && persEnd !== '\u2205') {
                var endingClean = persEnd.replace(/^-/, '');
                // Apply vowel harmony to personal ending
                var harmonizedEnding = harmonizeSuffix(endingClean, baseWord);
                baseWord = baseWord + harmonizedEnding;
            }
            word.full_word = baseWord;
            word.suffixes[0].suffix = tenseSuffix;
        }
    }
    if (word._question) {
        word.full_word = word.full_word + ' ' + harmonizeQuestion(word.full_word);
    }
}

function harmonizeQuestion(word) {
    var lastV = getLastVowel(word);
    return 'm' + harmonizeGross(lastV);
}

function togglePlural(wordIdx) {
    var word = currentSentence.words[wordIdx];
    word._plural = !word._plural;
    // Rebuild the full_word with plural suffix inserted before case suffix
    if (word._plural) {
        var lastV = getLastVowel(word.stem);
        var pluralSuffix = (lastV === 'a' || lastV === '\u0131' || lastV === 'o' || lastV === 'u') ? 'lar' : 'ler';
        word._pluralSuffix = '-' + pluralSuffix;
    } else {
        word._pluralSuffix = '';
    }
    hideStemPopup();
    renderSentence(currentSentence);
}

function togglePredicative(wordIdx) {
    var word = currentSentence.words[wordIdx];
    word._predicative = !word._predicative;
    // When predicative: hide verb, objects; when not: restore them
    currentSentence.words.forEach(function(w) {
        if (word._predicative) {
            // Hide: Verb, Direktes Objekt, Indirektes Objekt, Adverb
            if (w.role === 'Verb' || w.role === 'Direktes Objekt' || w.role === 'Indirektes Objekt' || w.role === 'Adverb') {
                w._hiddenByPredicative = true;
                w._savedFullWord = w._savedFullWord || w.full_word;
                w._savedMeaning = w._savedMeaning || w.meaning;
            }
        } else {
            // Restore hidden words
            if (w._hiddenByPredicative) {
                w._hiddenByPredicative = false;
            }
        }
    });
    hideStemPopup();
    renderSentence(currentSentence);
}

function toggleNegation(wordIdx) {
    var word = currentSentence.words[wordIdx];
    if (!word.negation) return;
    word._negated = !word._negated;
    rebuildVerbWord(word);
    hideStemPopup();
    renderSentence(currentSentence);
}

function toggleQuestion(wordIdx) {
    var word = currentSentence.words[wordIdx];
    word._question = !word._question;
    rebuildVerbWord(word);
    hideStemPopup();
    renderSentence(currentSentence);
}

function applyStemAlternative(wordIdx, altIdx) {
    var word = currentSentence.words[wordIdx];
    var alt = word.stem_alternatives[altIdx];
    word.stem = alt.stem;
    word.full_word = alt.full_word;
    word.meaning = alt.meaning;
    if (word.possessive) word.possessive.active = false;
    if (alt.person) { word.person = alt.person; updateVerbForPerson(alt.person); }
    if (word.role === 'Verb') {
        // If stem changed and conjugation doesn't match, clear it
        if (word.conjugation) {
            var testForm = word.conjugation['di'] && word.conjugation['di']['3sg'];
            if (testForm && testForm.full_word && testForm.full_word.indexOf(alt.stem) !== 0) {
                word.conjugation = null;
            }
        }
        rebuildVerbWord(word);
    }
    var isAltPronoun = alt.meaning && alt.meaning.indexOf('Pronomen') !== -1;
    if (alt.stem && word.suffixes && word.suffixes.length > 0 && word.role !== 'Verb' && !isAltPronoun) {
        word.suffixes.forEach(function(suffix) {
            if (suffix.suffix) {
                var oldSuffix = suffix.suffix.replace(/^-/, '');
                if (oldSuffix[0] === 'y' && allVowelsStr.indexOf(oldSuffix[1]) !== -1) oldSuffix = oldSuffix.slice(1);
                if (oldSuffix[0] === 't') oldSuffix = 'd' + oldSuffix.slice(1);
                var newSuffix = harmonizeSuffix(oldSuffix, alt.stem);
                newSuffix = applyConsonantHarmony(newSuffix, alt.stem);
                suffix.suffix = '-' + newSuffix;
                var changedStem = applyStemChange(alt.stem, newSuffix);
                word.full_word = changedStem + newSuffix;
            }
        });
    }
    renderSentence(currentSentence);
}

function applyPossessive(wordIdx, ownerIdx, possessionIdx) {
    var word = currentSentence.words[wordIdx];
    var poss = word.possessive;
    poss.active = true; poss.selected_owner = ownerIdx; poss.selected_possession = possessionIdx;
    var owner = poss.owners[ownerIdx]; var possession = poss.possessions[possessionIdx];
    word.full_word = owner.genitive + ' ' + possession.possessed;
    word.stem = owner.genitive + ' ' + possession.stem;
    word.meaning = possession.meaning + ' ' + owner.meaning;
    renderSentence(currentSentence);
}

function applyAdverb(wordIdx, stem, fullWord, meaning) {
    var word = currentSentence.words[wordIdx];
    word.stem = stem; word.full_word = fullWord; word.meaning = meaning;
    // For verbs: clear conjugation and rebuild with current tense/person
    if (word.role === 'Verb' && stem) {
        if (word.conjugation) {
            var testForm = word.conjugation['di'] && word.conjugation['di']['3sg'];
            if (testForm && testForm.full_word && testForm.full_word.indexOf(stem) !== 0) {
                word.conjugation = null;
            }
        }
        rebuildVerbWord(word);
    }
    renderSentence(currentSentence);
}

function changeAdverbGroup(wordIdx, groupKey) {
    var word = currentSentence.words[wordIdx];
    if (word.adverb_groups) word.adverb_groups.selected_group = groupKey;
    hideStemPopup();
    showStemPopupForWord(wordIdx);
}

function showStemPopupForWord(wordIdx) {
    var boxes = document.querySelectorAll('.word-box');
    if (boxes[wordIdx]) {
        var box = boxes[wordIdx].querySelector('.stem-box');
        if (box) { var fakeEvent = {target:box}; showStemPopup(fakeEvent, wordIdx); }
    }
}

// Popup management
var stemPopupTimer = null;
var stemPopupElement = null;

function showStemPopup(event, wordIdx) {
    clearTimeout(stemPopupTimer);
    hideStemPopup();
    var word = currentSentence.words[wordIdx];
    var alts = word.stem_alternatives;
    if ((!alts || alts.length === 0) && !word.adverb_groups) return;
    var popup = document.createElement('div');
    popup.className = 'popup-panel visible';
    popup.id = 'stem-popup';
    popup.onmouseenter = function() { clearTimeout(stemPopupTimer); };
    popup.onmouseleave = function() { scheduleStemPopupHide(); };
    var html = '<div class="variations-title" style="font-size:1em;margin-bottom:12px;">Wort austauschen: '+word.role_de+'</div>';
    var nouns = []; var pronouns = [];
    if (alts) alts.forEach(function(alt, altIdx) { alt._idx = altIdx; if (alt.meaning && alt.meaning.indexOf('Pronomen') !== -1) pronouns.push(alt); else nouns.push(alt); });
    if (nouns.length > 0) {
        var nounGroupLabel = word.role === 'Verb' ? 'Verben' : 'Substantive';
        html += '<div class="group-separator">'+nounGroupLabel+'</div><div class="variations-grid" style="gap:8px;">';
        nouns.forEach(function(alt) {
            var isActive = alt.stem === word.stem ? ' active' : '';
            html += '<div class="variation-card'+isActive+'" onclick="applyStemAlternative('+wordIdx+','+alt._idx+');hideStemPopup();" style="min-width:100px;max-width:140px;padding:8px;"><div class="var-word" style="font-size:1em;">'+alt.full_word+'</div><div class="var-meaning" style="font-size:0.7em;">'+alt.meaning+'</div></div>';
        });
        html += '</div>';
    }
    if (pronouns.length > 0) {
        html += '<div class="group-separator">Pronomen</div><div class="variations-grid" style="gap:8px;">';
        pronouns.forEach(function(alt) {
            var isActive = alt.stem === word.stem ? ' active' : '';
            html += '<div class="variation-card'+isActive+'" onclick="applyStemAlternative('+wordIdx+','+alt._idx+');hideStemPopup();" style="min-width:100px;max-width:140px;padding:8px;border-color:#90caf9;background:#e3f2fd;"><div class="var-word" style="font-size:1em;">'+alt.full_word+'</div><div class="var-meaning" style="font-size:0.7em;">'+alt.meaning+'</div></div>';
        });
        html += '</div>';
    }
    if (word.adverb_groups) {
        var groups = word.adverb_groups.groups;
        var selectedGroup = word.adverb_groups.selected_group || Object.keys(groups)[0];
        html += '<div class="group-separator">Kategorie</div>';
        html += '<div style="text-align:center;margin-bottom:8px;"><select onchange="changeAdverbGroup('+wordIdx+',this.value)" style="padding:4px 10px;border-radius:6px;border:1px solid #ccc;font-size:0.85em;">';
        Object.keys(groups).forEach(function(key) { var sel = key === selectedGroup ? ' selected' : ''; html += '<option value="'+key+'"'+sel+'>'+groups[key].label+'</option>'; });
        html += '</select></div>';
        var items = groups[selectedGroup].items;
        html += '<div class="variations-grid" style="gap:6px;">';
        items.forEach(function(item) {
            var isActive = item.stem === word.stem ? ' active' : '';
            html += '<div class="variation-card'+isActive+'" onclick="applyAdverb('+wordIdx+',\''+item.stem.replace(/'/g,"\\\'")+'\''+',\''+item.full_word.replace(/'/g,"\\\'")+'\''+',\''+item.meaning.replace(/'/g,"\\\'")+'\''+');hideStemPopup();" style="min-width:90px;max-width:130px;padding:6px;"><div class="var-word" style="font-size:0.95em;">'+item.full_word+'</div><div class="var-meaning" style="font-size:0.65em;">'+item.meaning+'</div></div>';
        });
        html += '</div>';
    }
    if (word.possessive) {
        html += '<div class="group-separator">Possessivkompositum</div>';
        html += '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">';
        html += '<div style="flex:1;min-width:120px;"><div style="font-size:0.7em;color:#666;text-align:center;margin-bottom:4px;">BESITZER</div><div class="variations-grid" style="gap:6px;">';
        word.possessive.owners.forEach(function(o, oIdx) {
            var isActive = word.possessive.active && word.possessive.selected_owner === oIdx;
            html += '<div class="variation-card'+(isActive?' active':'')+'" onclick="applyPossessive('+wordIdx+','+oIdx+','+word.possessive.selected_possession+')" style="min-width:80px;max-width:120px;padding:6px;"><div style="font-size:0.9em;font-weight:bold;">'+o.genitive+'</div><div style="font-size:0.65em;color:#777;">'+o.meaning+'</div></div>';
        });
        html += '</div></div>';
        html += '<div style="flex:1;min-width:120px;"><div style="font-size:0.7em;color:#666;text-align:center;margin-bottom:4px;">BESITZ</div><div class="variations-grid" style="gap:6px;">';
        word.possessive.possessions.forEach(function(p, pIdx) {
            var isActive = word.possessive.active && word.possessive.selected_possession === pIdx;
            html += '<div class="variation-card'+(isActive?' active':'')+'" onclick="applyPossessive('+wordIdx+','+word.possessive.selected_owner+','+pIdx+')" style="min-width:80px;max-width:120px;padding:6px;"><div style="font-size:0.9em;font-weight:bold;">'+p.possessed+'</div><div style="font-size:0.65em;color:#777;">'+p.meaning+'</div></div>';
        });
        html += '</div></div></div>';
    }
    popup.innerHTML = html;
    document.body.appendChild(popup);
    stemPopupElement = popup;
    var rect = event.target.closest('.stem-box').getBoundingClientRect();
    popup.style.left = Math.max(10, rect.left - 50) + 'px';
    popup.style.top = (rect.bottom + 8 + window.scrollY) + 'px';
}

function showSuffixPopup(event, wordIdx, suffixIdx, isClickable) {
    clearTimeout(stemPopupTimer); hideStemPopup();
    var word = currentSentence.words[wordIdx];
    var suffix = word.suffixes[suffixIdx];
    var variations = suffix.variations;
    if (!variations || variations.length === 0) return;
    var popup = document.createElement('div');
    popup.className = 'popup-panel visible'; popup.id = 'stem-popup';
    popup.onmouseenter = function() { clearTimeout(stemPopupTimer); };
    popup.onmouseleave = function() { scheduleStemPopupHide(); };
    var html = '<div class="variations-title" style="font-size:1em;margin-bottom:10px;">'+(isClickable?'Zeitformen':'\u00dcbersicht')+': '+word.stem+'</div>';
    var person = getCurrentPerson();
    html += '<div class="variations-grid" style="gap:8px;">';
    variations.forEach(function(v, varIdx) {
        var displayWord = v.full_word;
        if (v.tense_key && word.conjugation && word.conjugation[v.tense_key] && word.conjugation[v.tense_key][person]) {
            displayWord = word.conjugation[v.tense_key][person].full_word;
        } else if (word.stem && v.suffix) {
            // Always build from current stem when no matching conjugation
            displayWord = buildHarmonizedWord(word.stem, v.suffix);
        }
        var isActive = displayWord === word.full_word ? ' active' : '';
        var clickHandler = isClickable ? ' onclick="applyVariation('+wordIdx+','+suffixIdx+','+varIdx+');hideStemPopup();"' : '';
        var cardBorderColor = '';
        if (v.tense_key) { var vType = getPersonalEndingType(v.tense_key); cardBorderColor = vType === 1 ? 'border-right:4px solid #ab47bc;' : 'border-right:4px solid #26c6da;'; }
        html += '<div class="variation-card'+isActive+'"'+clickHandler+' style="min-width:100px;max-width:150px;padding:8px;'+cardBorderColor+(isClickable?'':'cursor:default;')+'"><div class="var-word" style="font-size:1em;">'+displayWord+'</div><div class="var-suffix" style="font-size:0.75em;">'+v.suffix+'</div><div class="var-meaning" style="font-size:0.65em;">'+v.meaning+'</div></div>';
    });
    html += '</div>';
    popup.innerHTML = html;
    document.body.appendChild(popup); stemPopupElement = popup;
    var rect = event.target.closest('.suffix-box').getBoundingClientRect();
    popup.style.left = Math.max(10, rect.left - 50) + 'px';
    popup.style.top = (rect.bottom + 8 + window.scrollY) + 'px';
}

function showNegationPopup(event, wordIdx) {
    clearTimeout(stemPopupTimer); hideStemPopup();
    var word = currentSentence.words[wordIdx];
    if (!word.negation) return;
    var popup = document.createElement('div');
    popup.className = 'popup-panel visible'; popup.id = 'stem-popup';
    popup.onmouseenter = function() { clearTimeout(stemPopupTimer); };
    popup.onmouseleave = function() { scheduleStemPopupHide(); };
    popup.innerHTML = '<div style="text-align:center;font-size:0.85em;color:#666;">Klicken um Verneinung ein/auszuschalten</div><div style="text-align:center;margin-top:8px;font-weight:bold;color:#c62828;">'+word.negation.negation_suffix+'</div>';
    document.body.appendChild(popup); stemPopupElement = popup;
    var rect = event.target.closest('.neg-box').getBoundingClientRect();
    popup.style.left = Math.max(10, rect.left - 30) + 'px';
    popup.style.top = (rect.bottom + 8 + window.scrollY) + 'px';
}

function scheduleStemPopupHide() { stemPopupTimer = setTimeout(hideStemPopup, 300); }
function hideStemPopup() { if (stemPopupElement) { stemPopupElement.remove(); stemPopupElement = null; } }

// Initial load
loadSentence('data/sentence1.json');
