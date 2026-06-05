// ========== HELPER: Safe DOM access ==========
function _safeSetDisplay(id, value) {
    const el = document.getElementById(id);
    if (el) el.style.display = value;
}
function _safeGetClassList(id) {
    const el = document.getElementById(id);
    return el ? el.classList : null;
}
function _safeHasClass(id, className) {
    const el = document.getElementById(id);
    return el ? el.classList.contains(className) : false;
}
function escapeHtml(text) {
    if (!text) return '?';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
const DEBUG = false;
function _debugLog(...args) {
    if (DEBUG) console.log(...args);
}
function _debugWarn(...args) {
    if (DEBUG) console.warn(...args);
}
function _ariaPressed(el, pressed) {
    if (el) el.setAttribute('aria-pressed', pressed ? 'true' : 'false');
}
function _ariaSelected(el, selected) {
    if (el) el.setAttribute('aria-selected', selected ? 'true' : 'false');
}
function _ariaExpanded(el, expanded) {
    if (el) el.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}
function _ariaHidden(el, hidden) {
    if (el) el.setAttribute('aria-hidden', hidden ? 'true' : 'false');
}
function _syncAllToggleSwitchAria() {
    document.querySelectorAll('.toggle-switch-btn').forEach(btn => {
        _ariaPressed(btn, btn.classList.contains('active'));
    });
}
function _syncKnockoutTabButtonsAria() {
    document.querySelectorAll('.knockout-tab-btn[data-target="knockout"]').forEach(btn => {
        _ariaHidden(btn, btn.classList.contains('hidden-tab'));
    });
}
// =============================================
function setModeUI(selectedMode) {
    document.getElementById('mode').value = selectedMode;
    
    const btnAuto = document.getElementById('btn-mode-auto');
    const btnManual = document.getElementById('btn-mode-manual');
    
    if (selectedMode === 'auto') {
        btnAuto.classList.add('active');
        btnManual.classList.remove('active');
    } else {
        btnAuto.classList.remove('active');
        btnManual.classList.add('active');
    }

    switchMode();
    _syncAllToggleSwitchAria();
    saveState();
}
function setGroupLosersTournamentMode(value) {
    groupLosersTournamentMode = value;
    
    const btnYes = document.getElementById('btn-group-losers-yes');
    const btnNo = document.getElementById('btn-group-losers-no');
    const row = document.getElementById('groupLosersQualifiedRow');
    
    if (value === 'yes') {
        btnYes.classList.add('active');
        btnNo.classList.remove('active');
        if (row) row.style.display = 'flex';
        _safeSetDisplay('groupLosersSection', 'block');
    } else {
        btnYes.classList.remove('active');
        btnNo.classList.add('active');
        if (row) row.style.display = 'none';
        _safeSetDisplay('groupLosersSection', 'none');
    }
    
    // ODŚWIEŻ WIDOCZNOŚĆ ZAKŁADEK NATYCHMIAST
    refreshKnockoutTabsVisibility();
    
    // ODŚWIEŻ PODŚWIETLENIE W GRUPACH NATYCHMIAST
    renderGroups();
    _syncAllToggleSwitchAria();
    saveState();
}

function setKnockoutSize(size) {
    const select = document.getElementById('knockoutSize');
    if (select) {
        select.value = size;
        
        const btn8 = document.getElementById('btn-knockout-8');
        const btn16 = document.getElementById('btn-knockout-16');
        
        if (size === 8) {
            btn8.classList.add('active');
            btn16.classList.remove('active');
        } else {
            btn8.classList.remove('active');
            btn16.classList.add('active');
        }
        refreshGroupLosersKnockoutButtons();
        _syncAllToggleSwitchAria();
        saveState();
    }
}

function setConsolationMode(value) {
    document.getElementById('consolationMode').value = value;
    
    const btnYes = document.getElementById('btn-consolation-yes');
    const btnNo = document.getElementById('btn-consolation-no');
    const qfField = document.getElementById('qfField');
    
    if (value === 'yes') {
        btnYes.classList.add('active');
        btnNo.classList.remove('active');
        _safeSetDisplay('consolationSection', 'block');
        if (qfField) qfField.style.display = 'none';
    } else {
        btnYes.classList.remove('active');
        btnNo.classList.add('active');
        _safeSetDisplay('consolationSection', 'none');
        if (qfField) qfField.style.display = 'flex';
    }
    
    // ODŚWIEŻ WIDOCZNOŚĆ ZAKŁADEK NATYCHMIAST
    refreshKnockoutTabsVisibility();
    
    updateClassification();
    _syncAllToggleSwitchAria();
    saveState();
}

// ========== FUNKCJA POMOCNICZA: Odśwież widoczność zakładek ==========
function refreshKnockoutTabsVisibility() {
    const consolationMode = document.getElementById('consolationMode').value;
    const glTournamentMode = groupLosersTournamentMode;
    const glConsolationMode = groupLosersConsolationMode;

    const consolationTab = document.getElementById('knockout-tab-btn-consolation');
    const losersTab = document.getElementById('knockout-tab-btn-losers');
    const losersConsolationTab = document.getElementById('knockout-tab-btn-losersConsolation');

    // Turniej Pocieszenia
    if (consolationTab) {
        if (consolationMode === 'yes') {
            consolationTab.classList.remove('hidden-tab');
        } else {
            consolationTab.classList.add('hidden-tab');
        }
    }

    // Główny - Przegrani z Grup
    if (losersTab) {
        if (glTournamentMode === 'yes') {
            losersTab.classList.remove('hidden-tab');
        } else {
            losersTab.classList.add('hidden-tab');
        }
    }

    // Pocieszenie - Przegrani z Grup
    if (losersConsolationTab) {
        if (glConsolationMode === 'yes') {
            losersConsolationTab.classList.remove('hidden-tab');
        } else {
            losersConsolationTab.classList.add('hidden-tab');
        }
    }

    // Jeśli aktywna zakładka została ukryta, przełącz na 'main'
    if (activeKnockoutTab === 'consolation' && consolationMode !== 'yes') {
        switchKnockoutTab('knockout', 'main');
    } else if (activeKnockoutTab === 'losers' && glTournamentMode !== 'yes') {
        switchKnockoutTab('knockout', 'main');
    } else if (activeKnockoutTab === 'losersConsolation' && glConsolationMode !== 'yes') {
        switchKnockoutTab('knockout', 'main');
    }
    _syncKnockoutTabButtonsAria();
}

// ================= SYSTEM TŁUMACZEŃ =================
const translations = {
    pl: {
        tournamentName: "Turniej Tenisa Stołowego",
        groupStage: "Faza grupowa",
        knockoutStage: "Faza pucharowa",
        consolationTournament: "Turniej Pocieszenia",
        settings: "Ustawienia turnieju",
        generateGroups: "Generuj tabele grupowe",
        generateBracket: "Generuj drabinkę pucharową",
        generateConsolation: "Generuj drabinkę pocieszenia",
        exportResults: "Eksportuj wyniki",
        saveTournament: "Zapisz turniej",
        loadTournament: "Wczytaj turniej",
        clearData: "Wyczyść dane turniejowe",
        collapse: "Zwiń",
        players: "Zawodnicy",
        enterPlayersAuto: "Wpisz zawodników (jeden na linijkę) - tryb auto",
        enterPlayersManual: "Wpisz zawodników (jeden na linijkę) - tryb ręczny",
        enterTournamentName: "Np. Turniej Tenisa Stołowego",
        enterCategory: "Np. Amatorzy",
        category: "Kategoria",
        groupMode: "Tryb podziału na grupy",
        autoMode: "Automatyczny",
        manualMode: "Ręczny",
        numberOfGroups: "Liczba grup",
        qualifiedPerGroup: "Liczba kwalifikujących się z grupy",
        tableView: "Tabela",
        scheduleView: "Harmonogram",
        yes: "Tak",
        no: "Nie",
        inProgress: "Trwa"
    },
    en: {
        tournamentName: "Table Tennis Tournament",
        groupStage: "Group Stage",
        knockoutStage: "Knockout Stage",
        consolationTournament: "Consolation Tournament",
        settings: "Tournament Settings",
        generateGroups: "Generate Group Tables",
        generateBracket: "Generate Knockout Bracket",
        generateConsolation: "Generate Consolation Bracket",
        exportResults: "Export Results",
        saveTournament: "Save Tournament",
        loadTournament: "Load Tournament",
        clearData: "Clear Tournament Data",
        collapse: "Collapse",
        players: "Players",
        enterPlayersAuto: "Enter players (one per line) - auto mode",
        enterPlayersManual: "Enter players (one per line) - manual mode",
        enterTournamentName: "e.g. Table Tennis Tournament",
        enterCategory: "e.g. Amateurs",
        category: "Category",
        groupMode: "Group division mode",
        autoMode: "Automatic",
        manualMode: "Manual",
        numberOfGroups: "Number of groups",
        qualifiedPerGroup: "Number of qualified per group",
        tableView: "Table",
        scheduleView: "Schedule",
        yes: "Yes",
        no: "No",
        inProgress: "Live"
    }
};

let currentLanguage = localStorage.getItem('appLanguage') || 'pl';

let appState = {
    lastSave: 0,
    isSaving: false
};


function setupAutoSave() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        const eventType = input.type === 'checkbox' ? 'change' : 'input';
        input.addEventListener(eventType, function() {
            debouncedSave();
        });
    });
    
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            setTimeout(debouncedSave, 100);
        }
    });
}

let saveTimeout;
function debouncedSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        if (!appState.isSaving) {
            saveState();
        }
    }, 500);
}

window.addEventListener('beforeunload', function() {
    _debugLog("Beforeunload - saving state");
    saveState();
});

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        _debugLog("App hidden - saving state");
        saveState();
    }
});

window.addEventListener('orientationchange', function() {
    _debugLog("Orientation change - immediate save");
    saveState();
});

setInterval(function() {
    if (!document.hidden) {
        saveState();
    }
}, 2000);

const originalSaveState = saveState;
saveState = function() {
    if (appState.isSaving) return;
    
    appState.isSaving = true;
    appState.lastSave = Date.now();
    
    try {
        originalSaveState();
        _debugLog("State saved successfully");
    } catch (error) {
        console.error("Save state error:", error);
        try {
            const fallbackData = {
                tournamentName: document.getElementById('tournamentNameInput').value,
                playersAuto: document.getElementById('playersAuto').value,
                playersManual: document.getElementById('playersManual').value,
                mode: document.getElementById('mode').value,
                consolationMode: document.getElementById('consolationMode').value,
                timestamp: Date.now()
            };
            sessionStorage.setItem('fallbackSave', JSON.stringify(fallbackData));
        } catch (e) {
            console.error("Fallback save also failed:", e);
        }
    } finally {
        appState.isSaving = false;
    }
}

const originalLoadState = loadState;
loadState = function() {
    try {
        originalLoadState();
        _debugLog("State loaded successfully");
    } catch (error) {
        console.error("Load state error:", error);
        try {
            const fallback = sessionStorage.getItem('fallbackSave');
            if (fallback) {
                const data = JSON.parse(fallback);
                document.getElementById('tournamentNameInput').value = data.tournamentName || '';
                document.getElementById('playersAuto').value = data.playersAuto || '';
                document.getElementById('playersManual').value = data.playersManual || '';
                document.getElementById('mode').value = data.mode || 'auto';
                document.getElementById('consolationMode').value = data.consolationMode || 'no';
                switchMode();
                setConsolationMode(data.consolationMode || 'no');
                _debugLog("Fallback data loaded");
            }
        } catch (e) {
            console.error("Fallback load also failed:", e);
        }
    }
}


function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('appLanguage', lang);
        applyTranslations();
        updateLanguageSwitch();
        
        renderGroups();
        displayBracket();
        displayConsolationBracket();
        displayGroupLosersBracket();
        displayGroupLosersConsolationBracket();
        if (typeof refreshKnockoutDisplay === 'function') refreshKnockoutDisplay();
        updateClassification();
        updateSubTitleDisplay();
        
        saveTournamentState();
    }
}

function t(key) {
    return translations[currentLanguage]?.[key] || translations.pl[key] || key;
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
    
    document.querySelectorAll('option[data-i18n]').forEach(option => {
        const key = option.getAttribute('data-i18n');
        option.textContent = t(key);
    });

    const playersTranslation = translations[currentLanguage].players || 'Zawodnicy';
    const groupTranslation = translations[currentLanguage].group || 'Grupa';

    const manualGroupCount = parseInt(document.getElementById('numGroupsManual').value) || 0;

    for (let i = 0; i < manualGroupCount; i++) {
        const label = document.getElementById(`manual-group-label-${i}`);
        if (label) {
            label.textContent = `${playersTranslation} ${groupTranslation} ${i + 1}:`;
        }
    }
}

function updateLanguageSwitch() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const isActive = btn.dataset.lang === currentLanguage;
        btn.classList.toggle('active', isActive);
        _ariaPressed(btn, isActive);
    });
    const langGroup = document.querySelector('.language-switcher');
    if (langGroup) langGroup.setAttribute('aria-label', currentLanguage === 'en' ? 'Language' : 'Język');
}

function detectLanguage() {
    const browserLang = navigator.language.split('-')[0];
    return ['pl', 'en'].includes(browserLang) ? browserLang : 'pl';
}

function saveTournamentState() {
    saveState();
}

// ================= ORYGINALNY KOD APLIKACJI =================
let groupLosersTournamentMode = 'no';
let groupLosersQualifiedCount = 2; // ilu dodatkowych z grupy idzie do turnieju dla przegranych
let groupLosersPlayers = []; // zawodnicy którzy trafili do tego turnieju
let groupLosersKnockoutMatches = { round16: [], quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
let groupLosersConsolationMatches = { semifinals: [], fifthPlace: null, seventhPlace: null };
let groupLosersPlayerColors = {};
let groupLosersKnockoutSize = 8;
let groupLosersConsolationMode = 'no';
let groupPlayers = [];
let groupResults = [];
let groupStandings = [];
let manualGroupPlayers = [];
let manualGroupResults = [];
let manualGroupStandings = [];
let autoSubTitle = '';
let manualSubTitle = '';
let autoKnockoutMatches = { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
let manualKnockoutMatches = { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
let autoConsolationMatches = { semifinals: [], fifthPlace: null, seventhPlace: null };
let manualConsolationMatches = { semifinals: [], fifthPlace: null, seventhPlace: null };
let autoPlayerColors = {};
let manualPlayerColors = {};
let activeGroupView = 'table';
let androidInterface = null;

var shouldSave = false;
if (typeof Android !== 'undefined') {
    androidInterface = Android;
}

const nextMatchMap = {
    // Mapowanie dla 1/16 finału -> ćwierćfinały
r16_1: { nextRound: 'quarterfinals', nextMatchIndex: 0, nextPlayer: 1, loserToConsolation: true, loserConsolationMatch: 'csf1', loserConsolationPlayer: 1 },
r16_2: { nextRound: 'quarterfinals', nextMatchIndex: 0, nextPlayer: 2, loserToConsolation: true, loserConsolationMatch: 'csf1', loserConsolationPlayer: 2 },
r16_3: { nextRound: 'quarterfinals', nextMatchIndex: 1, nextPlayer: 1, loserToConsolation: true, loserConsolationMatch: 'csf2', loserConsolationPlayer: 1 },
r16_4: { nextRound: 'quarterfinals', nextMatchIndex: 1, nextPlayer: 2, loserToConsolation: true, loserConsolationMatch: 'csf2', loserConsolationPlayer: 2 },
r16_5: { nextRound: 'quarterfinals', nextMatchIndex: 2, nextPlayer: 1, loserToConsolation: true, loserConsolationMatch: 'csf3', loserConsolationPlayer: 1 },
r16_6: { nextRound: 'quarterfinals', nextMatchIndex: 2, nextPlayer: 2, loserToConsolation: true, loserConsolationMatch: 'csf3', loserConsolationPlayer: 2 },
r16_7: { nextRound: 'quarterfinals', nextMatchIndex: 3, nextPlayer: 1, loserToConsolation: true, loserConsolationMatch: 'csf4', loserConsolationPlayer: 1 },
r16_8: { nextRound: 'quarterfinals', nextMatchIndex: 3, nextPlayer: 2, loserToConsolation: true, loserConsolationMatch: 'csf4', loserConsolationPlayer: 2 },
	qf1: { nextRound: 'semifinals', nextMatchIndex: 0, nextPlayer: 1, loserToConsolation: true, loserConsolationMatch: 'csf1', loserConsolationPlayer: 1 },
    qf2: { nextRound: 'semifinals', nextMatchIndex: 0, nextPlayer: 2, loserToConsolation: true, loserConsolationMatch: 'csf1', loserConsolationPlayer: 2 },
    qf3: { nextRound: 'semifinals', nextMatchIndex: 1, nextPlayer: 1, loserToConsolation: true, loserConsolationMatch: 'csf2', loserConsolationPlayer: 1 },
    qf4: { nextRound: 'semifinals', nextMatchIndex: 1, nextPlayer: 2, loserToConsolation: true, loserConsolationMatch: 'csf2', loserConsolationPlayer: 2 },
    sf1: { nextRound: 'final', nextPlayer: 1, loserMatchId: 'third', loserPlayerPos: 1 },
    sf2: { nextRound: 'final', nextPlayer: 2, loserMatchId: 'third', loserPlayerPos: 2 },
    third: null,
    final: null
};

const nextConsolationMatchMap = {
    // Ćwierćfinały (miejsca 13-16) -> Półfinały
    cqf1: { nextRound: 'semifinals', nextMatchIndex: 0, nextPlayer: 1 },
    cqf2: { nextRound: 'semifinals', nextMatchIndex: 0, nextPlayer: 2 },
    cqf3: { nextRound: 'semifinals', nextMatchIndex: 1, nextPlayer: 1 },
    cqf4: { nextRound: 'semifinals', nextMatchIndex: 1, nextPlayer: 2 },
    // Półfinały -> Mecz o 9. miejsce + Mecz o 11. miejsce
    csf1: { nextRound: 'final', nextPlayer: 1, loserMatch: 'eleventh', loserPlayer: 1 },
    csf2: { nextRound: 'final', nextPlayer: 2, loserMatch: 'eleventh', loserPlayer: 2 },
    final: null,
    eleventh: null
};
function setGroupLosersKnockoutSize(size) {
    // ===== BLOKADA: Jeśli główna drabinka to 1/8, nie pozwól na 1/16 =====
    const mainKnockoutSize = parseInt(document.getElementById('knockoutSize')?.value || 8);
    if (mainKnockoutSize === 8 && size === 16) {
        // Nie wykonuj zmiany - główna drabinka jest za mała
        return;
    }
    // ================================================================
    
    groupLosersKnockoutSize = size;
    const btn8 = document.getElementById('btn-gl-knockout-8');
    const btn16 = document.getElementById('btn-gl-knockout-16');
    if (btn8 && btn16) {
        if (size === 8) {
            btn8.classList.add('active');
            btn16.classList.remove('active');
        } else {
            btn8.classList.remove('active');
            btn16.classList.add('active');
        }
    }
    _syncAllToggleSwitchAria();
    saveState();
}
function refreshGroupLosersKnockoutButtons() {
    const mainKnockoutSize = parseInt(document.getElementById('knockoutSize')?.value || 8);
    const btn16 = document.getElementById('btn-gl-knockout-16');
    const btn8 = document.getElementById('btn-gl-knockout-8');
    
    if (!btn16 || !btn8) return;
    
    if (mainKnockoutSize === 8) {
        // Wyłącz 1/16 - główna drabinka jest za mała
        btn16.classList.add('disabled-btn');
        btn16.title = 'Dostępne tylko gdy główna faza pucharowa to 1/16';
        
        // Jeśli aktywny był 1/16, przełącz na 1/8
        if (btn16.classList.contains('active')) {
            btn16.classList.remove('active');
            btn8.classList.add('active');
            setGroupLosersKnockoutSize(8);
        }
    } else {
        // Włącz 1/16
        btn16.classList.remove('disabled-btn');
        btn16.title = '';
    }
}

// Automatyczne zatwierdzanie wyniku w harmonogramie grupowym
function tryUpdateMatchFromSchedule(groupIndex, player1Index, player2Index, inputElement, player) {
    const matchId = `match-${groupIndex}-${player1Index}-${player2Index}`;
    const matchItem = document.getElementById(matchId);
    if (!matchItem) return;
    
    const score1Input = matchItem.querySelector('.match-result-input:nth-child(1)');
    const score2Input = matchItem.querySelector('.match-result-input:nth-child(3)');
    const score1 = score1Input ? score1Input.value.trim() : '';
    const score2 = score2Input ? score2Input.value.trim() : '';
    
    // Zapisz tylko jeśli oba pola mają wartości
    if (score1 !== '' && score2 !== '') {
        updateMatchFromSchedule(groupIndex, player1Index, player2Index, inputElement, player);
    }
}

function saveToAndroidFile(content, filename, fileType) {
    if (androidInterface) {
        androidInterface.saveFile(content, filename, fileType);
    } else {
        fallbackSaveFile(content, filename, fileType);
    }
}

function loadFromAndroidFile() {
    if (androidInterface) {
        androidInterface.loadFile();
    } else {
        document.getElementById('fileInput').click();
    }
}

function fallbackSaveFile(content, filename, fileType) {
    const blob = new Blob([content], { type: fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function onFileLoaded(fileContent) {
    try {
        const tournamentData = JSON.parse(fileContent);
        showLoadDialog(tournamentData);
    } catch (error) {
        alert(t('loadError'));
        console.error('Error parsing tournament file:', error);
    }
}

function onFileLoadedBase64(base64Content) {
    try {
        const rawString = atob(base64Content);
        const bytes = new Uint8Array(rawString.length);
        for (let i = 0; i < rawString.length; i++) {
            bytes[i] = rawString.charCodeAt(i);
        }
        const decoder = new TextDecoder('utf-8');
        const decodedString = decoder.decode(bytes);
        onFileLoaded(decodedString);
    } catch (error) {
        alert(t('loadError'));
        console.error('Error in onFileLoadedBase64:', error);
    }
}

function onSaveComplete(filename) {
    alert(t('saveSuccess') + filename);
}

function onSaveError(error) {
    alert(t('saveError') + error);
}

function switchGroupView(view) {
    activeGroupView = view;
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        const isActive = btn.dataset.view === view;
        btn.classList.toggle('active', isActive);
        _ariaSelected(btn, isActive);
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    renderGroups();
    saveState();
}

function generateGroupMatches(groupIndex, players, groupResults) {
    const matches = [];
    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            const player1 = players[i];
            const player2 = players[j];
            const result = groupResults[i][j] || '';
            matches.push({
                player1Index: i,
                player2Index: j,
                player1: player1,
                player2: player2,
                result: result
            });
        }
    }
    return matches;
}

function renderGroupSchedule(groupIndex, players, groupResults, container) {
    const matches = generateGroupMatches(groupIndex, players, groupResults);
    if (matches.length === 0) {
        container.innerHTML = '<p>' + t('noMatches') + '</p>';
        return;
    }
    
    // ZACHOWAJ STANY "TRWA" PRZED RENDEROWANIEM
    const previousStates = {};
    matches.forEach(match => {
        const matchId = `match-${groupIndex}-${match.player1Index}-${match.player2Index}`;
        if (localStorage.getItem(`matchProgress_${matchId}`) === 'true') {
            previousStates[matchId] = true;
        }
    });
    
    let scheduleHTML = '';
    matches.forEach((match, matchIndex) => {
        const isPlayed = match.result !== '';
        const statusClass = isPlayed ? 'played' : 'pending';
        const statusText = isPlayed ? t('played') : t('waiting');
        const [score1, score2] = match.result ? match.result.split(':') : ['', ''];
        const matchId = `match-${groupIndex}-${match.player1Index}-${match.player2Index}`;
        
        // SPRAWDŹ CZY BYŁ ZAZNACZONY PRZED RENDEROWANIEM
        const wasInProgress = previousStates[matchId] === true;
        
        scheduleHTML += `
            <div class="match-item ${isPlayed ? 'match-played' : ''} ${wasInProgress ? 'match-in-progress' : ''}" id="${matchId}">
                <div class="match-players">
                    <div class="match-player">${escapeHtml(match.player1)}</div>
                    <div class="match-player vs">${t('vs')}</div>
                    <div class="match-player">${escapeHtml(match.player2)}</div>
                </div>
                <div class="match-result">
                    <input type="text" class="match-result-input" 
       placeholder="0" value="${score1}" 
       oninput="tryUpdateMatchFromSchedule(${groupIndex}, ${match.player1Index}, ${match.player2Index}, this, 'player1')"
       onchange="updateMatchFromSchedule(${groupIndex}, ${match.player1Index}, ${match.player2Index}, this, 'player1')">
                    <span>:</span>
                   <input type="text" class="match-result-input" 
       placeholder="0" value="${score2}" 
       oninput="tryUpdateMatchFromSchedule(${groupIndex}, ${match.player1Index}, ${match.player2Index}, this, 'player2')"
       onchange="updateMatchFromSchedule(${groupIndex}, ${match.player1Index}, ${match.player2Index}, this, 'player2')">
                </div>
                <div class="match-status ${statusClass}">${statusText}</div>
                        <div class="match-checkbox">
                    <label class="in-progress-label">
                        <input type="checkbox" class="match-inprogress-checkbox" 
                               ${wasInProgress ? 'checked' : ''}
                               ${isPlayed ? 'disabled' : ''}
                               onchange="toggleMatchInProgress(${groupIndex}, ${match.player1Index}, ${match.player2Index}, this)">
                        ${t('inProgress')}
                    </label>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = scheduleHTML;
}

// NOWA FUNKCJA: Zaznaczanie/odznaczanie "Trwa"
function toggleMatchInProgress(groupIndex, player1Index, player2Index, checkbox) {
    const matchId = `match-${groupIndex}-${player1Index}-${player2Index}`;
    const matchItem = document.getElementById(matchId);
    
    if (checkbox.checked) {
        matchItem.classList.add('match-in-progress');
        localStorage.setItem(`matchProgress_${matchId}`, 'true');
    } else {
        matchItem.classList.remove('match-in-progress');
        localStorage.removeItem(`matchProgress_${matchId}`);
    }
    
    saveState();
}

// I w updateMatchFromSchedule():
function updateMatchFromSchedule(groupIndex, player1Index, player2Index, inputElement, player) {
    const mode = document.getElementById('mode').value;
    const currentGroupResults = mode === 'manual' ? manualGroupResults : groupResults;
    const score1Input = inputElement.parentElement.querySelector('.match-result-input:nth-child(1)');
    const score2Input = inputElement.parentElement.querySelector('.match-result-input:nth-child(3)');
    const score1 = score1Input.value.trim();
    const score2 = score2Input.value.trim();
    
    if (score1 && score2 && (!/^\d+$/.test(score1) || !/^\d+$/.test(score2))) {
        alert(t('invalidScore'));
        score1Input.value = '';
        score2Input.value = '';
        return;
    }
    
    const matchId = `match-${groupIndex}-${player1Index}-${player2Index}`;
    const matchItem = document.getElementById(matchId);
    
    if (score1 && score2) {
        const result = `${score1}:${score2}`;
        
        // ZAPISZ WYNIK BEZ RENDEROWANIA CAŁYCH GRUP
        saveResultWithoutRender(groupIndex, player1Index, player2Index, result, mode);


        // Input traci focus - identycznie jak w pucharowym
        if (score1Input) score1Input.blur();
        if (score2Input) score2Input.blur();        
        // 1. ODZNACZ "TRWA" jeśli jest zaznaczone i ZABLOKUJ checkbox
        const checkbox = matchItem.querySelector('.match-inprogress-checkbox');
        if (checkbox) {
            checkbox.checked = false;
            checkbox.disabled = true;
            matchItem.classList.remove('match-in-progress');
            localStorage.removeItem(`matchProgress_${matchId}`);
        }
        
        // 2. DODAJ KLASĘ .match-played (ZIELONE PODŚWIETLENIE)
        matchItem.classList.add('match-played');
        
        // 3. Zaktualizuj status meczu
        const statusDiv = matchItem.querySelector('.match-status');
        if (statusDiv) {
            statusDiv.textContent = t('played');
            statusDiv.className = 'match-status played';
        }
        
    } else if (!score1 && !score2) {
        saveResultWithoutRender(groupIndex, player1Index, player2Index, '', mode);
        
        // USUŃ KLASĘ .match-played (bo usunięto wynik)
        matchItem.classList.remove('match-played');
        
        // Zaktualizuj status
        const statusDiv = matchItem.querySelector('.match-status');
        if (statusDiv) {
            statusDiv.textContent = t('waiting');
            statusDiv.className = 'match-status pending';
        }
    }
    
    saveState();
}

// NOWA FUNKCJA: Zapisz wynik bez renderowania całych grup
function saveResultWithoutRender(groupIndex, player1Index, opponentIndex, value, mode) {
    if (value && !/^\d+:\d+$/.test(value)) {
        alert(t('invalidScoreFormat'));
        return;
    }

    const currentGroupResults = mode === 'manual' ? manualGroupResults : groupResults;
    currentGroupResults[groupIndex][player1Index][opponentIndex] = value;
    if (value) {
        const [a, b] = value.split(':').map(Number);
        currentGroupResults[groupIndex][opponentIndex][player1Index] = `${b}:${a}`;
    } else {
        currentGroupResults[groupIndex][opponentIndex][player1Index] = '';
    }
    
    // NIE WYWOŁUJ renderGroups() - tylko przelicz stan
    calculateAllStandings();
}
function handleCategoryInput() {
    const mode = document.getElementById('mode').value;
    const subTitleInput = document.getElementById('subTitleInput');
    if (mode === 'manual') {
        manualSubTitle = subTitleInput.value;
    } else {
        autoSubTitle = subTitleInput.value;
    }
    updateSubTitleDisplay();
    saveState();
}

function updateTournamentTitle() {
    const input = document.getElementById('tournamentNameInput');
    const h1 = document.querySelector('h1');
    const currentPrefix = '';

    if (input && h1) {
        const newTitle = input.value.trim() === '' ? t('tournamentName') : input.value.trim();
        document.title = currentPrefix + newTitle;
        h1.textContent = currentPrefix + newTitle;
    }
}

function updateSubTitleDisplay() {
    const mode = document.getElementById('mode').value;
    const currentSubTitle = mode === 'manual' ? manualSubTitle : autoSubTitle;
    const knockoutHeader = document.getElementById('knockoutHeader');
    const groupsHeader = document.getElementById('groupsHeader');
    const settingsHeader = document.getElementById('settingsHeader');
    const consolationHeader = document.getElementById('consolationHeader');

    if (knockoutHeader) {
        knockoutHeader.textContent = currentSubTitle !== '' ? t('knockoutStage') + ' - ' + currentSubTitle : t('knockoutStage');
    }
   if (groupsHeader) {
    if (currentSubTitle !== '') {
        groupsHeader.textContent = t('groupStage') + ' - ' + currentSubTitle;
    } else {
        groupsHeader.textContent = t('groupStage');
    }
}
    if (settingsHeader) {
        settingsHeader.textContent = currentSubTitle !== '' ? t('settings') + ' - ' + currentSubTitle : t('settings');
    }
    if (consolationHeader) {
        consolationHeader.textContent = currentSubTitle !== '' ? t('consolationTournament') + ' - ' + currentSubTitle : t('consolationTournament');
    }
}

function switchMode() {
    const mode = document.getElementById('mode').value;

    const btnAuto = document.getElementById('btn-mode-auto');
    const btnManual = document.getElementById('btn-mode-manual');

    if (btnAuto && btnManual) {
        if (mode === 'auto') {
            btnAuto.classList.add('active');
            btnManual.classList.remove('active');
        } else {
            btnAuto.classList.remove('active');
            btnManual.classList.add('active');
        }
    }

    const autoPanel = document.getElementById('auto-panel');
    const manualPanel = document.getElementById('manual-panel');
    
    if (autoPanel) autoPanel.style.display = mode === 'auto' ? 'block' : 'none';
    if (manualPanel) manualPanel.style.display = mode === 'auto' ? 'none' : 'block';

    const genAutoBtn = document.getElementById('generateAutoGroupsBtn');
    const genManualBtn = document.getElementById('generateManualGroupsBtn');

    if (genAutoBtn) genAutoBtn.style.display = mode === 'auto' ? 'inline-block' : 'none';
    if (genManualBtn) genManualBtn.style.display = mode === 'auto' ? 'none' : 'inline-block';

    const autoBtnContainer = document.getElementById('generateAutoGroupsBtn')?.parentNode;
    if (autoBtnContainer) autoBtnContainer.style.textAlign = 'left';

    const subTitleInput = document.getElementById('subTitleInput');
    if (mode === 'manual') {
        if (subTitleInput) subTitleInput.value = manualSubTitle;
    } else {
        if (subTitleInput) subTitleInput.value = autoSubTitle;
    }

    renderGroups();
    displayBracket();
    displayConsolationBracket();
    updateClassification();
    updateSubTitleDisplay();
}

function renderManualGroups() {
    const manualGroupCount = parseInt(document.getElementById('numGroupsManual').value) || 0;
    const container = document.getElementById('manual-groups');
    if (!container) return;
    
    // ===== ZAPISZ ISTNIEJĄCĄ ZAWARTOŚĆ PRZED CZYSZCZENIEM =====
    const savedValues = {};
    const existingTextareas = container.querySelectorAll('textarea[id^="manual-group-"]');
    existingTextareas.forEach(textarea => {
        const match = textarea.id.match(/manual-group-(\d+)/);
        if (match) {
            savedValues[match[1]] = textarea.value;
        }
    });
    // ==========================================================
    
    container.innerHTML = '';
    
    for (let i = 0; i < manualGroupCount; i++) {
        container.innerHTML += `
            <div class="form-row vertical-form u-mb-10">
                <div class="form-col-grow">
                    <label class="styled-label" id="manual-group-label-${i}">
                        ${t('players')} ${t('group')} ${i + 1}:
                    </label>
                    <textarea id="manual-group-${i}" class="styled-input styled-textarea" 
                              data-i18n-placeholder="enterPlayersManual" 
                              placeholder="${t('enterPlayersManual')}" 
                              oninput="saveManualGroupsInput()"></textarea>
                </div>
            </div>`;
    }

    // ===== PRZYWRÓĆ ZAPISANĄ ZAWARTOŚĆ =====
    for (let i = 0; i < manualGroupCount; i++) {
        const textarea = document.getElementById(`manual-group-${i}`);
        if (textarea && savedValues[i] !== undefined) {
            textarea.value = savedValues[i];
        }
    }
    // ========================================

    applyTranslations();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function _clearMatchProgressFromStorage() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('matchProgress_match-')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
}

function _resetSharedBracketsAfterNewGroups() {
    autoKnockoutMatches = { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
    manualKnockoutMatches = { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
    autoConsolationMatches = { semifinals: [], fifthPlace: null, seventhPlace: null };
    manualConsolationMatches = { semifinals: [], fifthPlace: null, seventhPlace: null };
    groupLosersKnockoutMatches = { round16: [], quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
    groupLosersConsolationMatches = { semifinals: [], fifthPlace: null, seventhPlace: null };
    groupLosersPlayerColors = {};
    groupLosersPlayers = [];

    document.getElementById('knockout-bracket').innerHTML = '';
    document.getElementById('consolation-bracket').innerHTML = '';
    document.getElementById('groupLosers-bracket').innerHTML = '';
    document.getElementById('groupLosers-consolation-bracket').innerHTML = '';

    if (document.getElementById('consolationMode').value !== 'yes') {
        _safeSetDisplay('consolationSection', 'none');
    }
    if (groupLosersTournamentMode !== 'yes') {
        _safeSetDisplay('groupLosersSection', 'none');
        _safeSetDisplay('groupLosersConsolationSection', 'none');
    }
}

function generateGroups() {
    _clearMatchProgressFromStorage();

    const players = document.getElementById('playersAuto').value
        .trim()
        .split('\n')
        .map(p => p.trim())
        .filter(p => p);
    const numGroups = parseInt(document.getElementById('numGroupsAuto').value);

    if (players.length === 0) {
        alert(t('enterPlayersFirst'));
        return;
    }

    groupPlayers = [];
    groupResults = [];
    groupStandings = [];
    _resetSharedBracketsAfterNewGroups();

    for (let i = 0; i < numGroups; i++) {
        groupPlayers.push([]);
    }

    shuffleArray(players);

    for (let i = 0; i < players.length; i++) {
        const groupIndex = i % numGroups;
        groupPlayers[groupIndex].push(players[i]);
    }

    groupPlayers.forEach((playersInGroup, groupIndex) => {
        const groupSize = playersInGroup.length;
        groupResults[groupIndex] = Array(groupSize).fill().map(() => Array(groupSize).fill(''));
    });

    renderGroups();
    checkForDuplicatePlayers();
	displayBracket();
    displayConsolationBracket();
    displayGroupLosersBracket();
    displayGroupLosersConsolationBracket();
    updateClassification();
    handleByes();
    handleGroupLosersByes();
}

function generateManualGroups() {
    _clearMatchProgressFromStorage();

    const manualGroupCount = parseInt(document.getElementById('numGroupsManual').value);

    manualGroupPlayers = [];
    manualGroupResults = [];
    manualGroupStandings = [];
    _resetSharedBracketsAfterNewGroups();

    let atLeastOne = false;

    for (let i = 0; i < manualGroupCount; i++) {
        const elem = document.getElementById(`manual-group-${i}`);
        const txt = elem ? elem.value.trim().split('\n').map(p => p.trim()).filter(p => p) : [];
        manualGroupPlayers.push(txt);
        if (txt.length > 0) atLeastOne = true;
    }

    if (!atLeastOne) {
        alert(t('enterPlayersFirst'));
        return;
    }

    manualGroupPlayers.forEach((playersInGroup, groupIndex) => {
        const groupSize = playersInGroup.length;
        manualGroupResults[groupIndex] = Array(groupSize).fill().map(() => Array(groupSize).fill(''));
    });

    renderGroups();
    checkForDuplicatePlayers();
	displayBracket();
    displayConsolationBracket();
    displayGroupLosersBracket();
    displayGroupLosersConsolationBracket();
    updateClassification();
    handleByes();
    handleGroupLosersByes();
}

function calculateAllStandings() {
    const mode = document.getElementById('mode').value;
    const currentGroupPlayers = mode === 'manual' ? manualGroupPlayers : groupPlayers;
    const currentGroupResults = mode === 'manual' ? manualGroupResults : groupResults;
    const currentGroupStandings = mode === 'manual' ? manualGroupStandings : groupStandings;

    currentGroupStandings.length = 0;

    currentGroupPlayers.forEach((players, groupIndex) => {
        if (players.length === 0) {
            currentGroupStandings[groupIndex] = [];
            return;
        }

        let playerStats = players.map((player, index) => ({
            playerIndex: index,
            points: 0,
            setsWon: 0,
            setsLost: 0,
            playerName: player
        }));

        players.forEach((_, p1Index) => {
            players.forEach((_, p2Index) => {
                if (p1Index !== p2Index) {
                    const result = currentGroupResults[groupIndex][p1Index][p2Index];
                    if (result && result.includes(':')) {
                        const [setsWon, setsLost] = result.split(':').map(Number);
                        playerStats[p1Index].setsWon += setsWon;
                        playerStats[p1Index].setsLost += setsLost;

                        if (setsWon > setsLost) {
                            playerStats[p1Index].points += 3;
                        } else {
                            playerStats[p1Index].points += 1;
                        }
                    }
                }
            });
        });

        playerStats.forEach(stat => {
            stat.setRatio = stat.setsLost > 0 ? (stat.setsWon / stat.setsLost) : (stat.setsWon > 0 ? Infinity : 0);
        });

        playerStats.sort((a, b) => b.points - a.points);

        const finalStandings = [];
        let i = 0;
        while (i < playerStats.length) {
            let j = i;
            while (j < playerStats.length && playerStats[j].points === playerStats[i].points) {
                j++;
            }
            const tiedPlayersBlock = playerStats.slice(i, j);

            if (tiedPlayersBlock.length > 1) {
                const resolvedBlock = resolveTie(tiedPlayersBlock, groupIndex, players, currentGroupResults[groupIndex]);
                finalStandings.push(...resolvedBlock);
            } else {
                finalStandings.push(tiedPlayersBlock[0]);
            }
            i = j;
        }

        currentGroupStandings[groupIndex] = finalStandings;
    });
}

function resolveTie(tiedPlayers, groupIndex, allPlayersInGroup, groupResultsForThisGroup) {
    let miniStats = tiedPlayers.map(p => ({
        playerIndex: p.playerIndex,
        points: 0,
        setsWon: 0,
        setsLost: 0,
        playerName: p.playerName
    }));

    miniStats.forEach((p1Stat, m1Index) => {
        miniStats.forEach((p2Stat, m2Index) => {
            if (m1Index !== m2Index) {
                const originalP1Index = p1Stat.playerIndex;
                const originalP2Index = p2Stat.playerIndex;
                const result = groupResultsForThisGroup[originalP1Index][originalP2Index];
                if (result && result.includes(':')) {
                    const [setsWon, setsLost] = result.split(':').map(Number);
                    p1Stat.setsWon += setsWon;
                    p1Stat.setsLost += setsLost;
                    if (setsWon > setsLost) {
                        p1Stat.points += 3;
                    } else {
                        p1Stat.points += 1;
                    }
                }
            }
        });
    });

    miniStats.forEach(stat => {
        stat.setRatio = stat.setsLost > 0 ? (stat.setsWon / stat.setsLost) : (stat.setsWon > 0 ? Infinity : 0);
    });

    miniStats.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.setRatio !== a.setRatio) return b.setRatio - a.setRatio;
        return 0;
    });

    const resolvedBlockOrdered = miniStats.map(ms => tiedPlayers.find(tp => tp.playerIndex === ms.playerIndex));

    if (resolvedBlockOrdered.length > 2) {
        resolvedBlockOrdered.sort((a, b) => {
            const miniA = miniStats.find(ms => ms.playerIndex === a.playerIndex);
            const miniB = miniStats.find(ms => ms.playerIndex === b.playerIndex);

            if (miniB.points !== miniA.points) return miniB.points - miniA.points;
            if (miniB.setRatio !== miniA.setRatio) return miniB.setRatio - miniA.setRatio;

            if (b.setRatio !== a.setRatio) return b.setRatio - a.setRatio;
            return a.playerIndex - b.playerIndex;
        });
    }

    return resolvedBlockOrdered;
}

function renderGroups() {
    _debugLog("renderGroups() called.");

    const mode = document.getElementById('mode').value;
    const currentGroupPlayers = mode === 'manual' ? manualGroupPlayers : groupPlayers;
    const currentGroupResults = mode === 'manual' ? manualGroupResults : groupResults;
    const currentGroupStandings = mode === 'manual' ? manualGroupStandings : groupStandings;

    const container = document.getElementById('groups-container');
    if (!container) {
        console.error("Error: groups-container element not found!");
        return;
    }
    container.innerHTML = '';
    calculateAllStandings();
    const numQualified = parseInt(document.getElementById(
        mode === 'manual' ? 'numQualifiedPlayersManual' : 'numQualifiedPlayers'
    ).value);
    _debugLog(`Number of qualified players per group: ${numQualified}`);

    if (!currentGroupPlayers || currentGroupPlayers.length === 0 || currentGroupPlayers.every(g => g.length === 0)) {
        _debugWarn("No groups to render. currentGroupPlayers is empty.");
        return;
    }

    currentGroupPlayers.forEach((players, groupIndex) => {
        _debugLog(`Processing Group ${groupIndex + 1} with ${players.length} players.`);

        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-container';

        const groupTitle = document.createElement('h2');
        groupTitle.className = 'group-title';
        groupTitle.textContent = `${t('group')} ${groupIndex + 1}`;
        groupDiv.appendChild(groupTitle);
// ===== NOWY KOD - PRZYCISK =====
if (mode === 'auto') {
  const addButton = document.createElement('button');
addButton.textContent = '+ ' + t('addPlayer');
addButton.style.fontSize = '0.7rem';
addButton.style.padding = '0px 6px';
addButton.style.minHeight = '26px';
addButton.style.height = '26px';
addButton.style.marginLeft = '8px';
addButton.style.marginTop = '0';
addButton.style.marginBottom = '0';
addButton.style.verticalAlign = 'middle';
addButton.style.transform = 'translateY(-1px)';
addButton.style.display = 'inline-flex';
addButton.style.alignItems = 'center';
addButton.style.justifyContent = 'center';
addButton.style.gap = '3px';
addButton.style.background = '#27ae60';
addButton.style.whiteSpace = 'nowrap';
addButton.style.maxWidth = '100%';
addButton.onclick = (function(idx) {
    return function() { showAddPlayerDialog(idx); };
})(groupIndex);

groupTitle.appendChild(addButton);
}
// ===== PRZYCISK DLA TRYBU RĘCZNEGO =====
if (mode === 'manual') {
    const addButton = document.createElement('button');
addButton.textContent = '+ ' + t('addPlayer');
addButton.style.fontSize = '0.7rem';
addButton.style.padding = '0px 6px';
addButton.style.minHeight = '26px';
addButton.style.height = '26px';
addButton.style.marginLeft = '12px';
addButton.style.marginTop = '0';               // ZERUJEMY
addButton.style.marginBottom = '0';            // ZERUJEMY
addButton.style.verticalAlign = 'middle';      // WYRÓWNANIE
addButton.style.transform = 'translateY(-1px)'; // DOSTOSUJ
addButton.style.display = 'inline-flex';
addButton.style.alignItems = 'center';
addButton.style.justifyContent = 'center';
addButton.style.gap = '3px';
addButton.style.background = '#27ae60';
addButton.onclick = (function(idx) {
    return function() { showAddPlayerManualDialog(idx); };
})(groupIndex);

groupTitle.appendChild(addButton);
}
// ===== KONIEC NOWEGO KODU =====

        const viewContainer = document.createElement('div');
        
        if (activeGroupView === 'table') {
            const tableContainer = document.createElement('div');
            tableContainer.className = 'table-container';
            const table = document.createElement('table');
            const headerRow = document.createElement('tr');
            headerRow.appendChild(createHeaderCell(t('players')));

            players.forEach((player, idx) => {
                headerRow.appendChild(createHeaderCell(`${idx + 1}. ${player}`));
            });

            headerRow.appendChild(createHeaderCell(t('points'), 'summary-header summary-punkty'));
            headerRow.appendChild(createHeaderCell(t('setBalance'), 'summary-header summary-bilans'));
            headerRow.appendChild(createHeaderCell(t('place'), 'summary-header summary-miejsce'));
            table.appendChild(headerRow);

            if (players.length > 0) {
                players.forEach((player, playerIndex) => {
                    const row = document.createElement('tr');
                    const standing = currentGroupStandings[groupIndex].find(s => s.playerIndex === playerIndex);
                    const position = currentGroupStandings[groupIndex].findIndex(s => s.playerIndex === playerIndex) + 1;

                    if (position <= numQualified) row.classList.add('qualified');
const numQualifiedToGroupLosers = parseInt(document.getElementById('numQualifiedToGroupLosers')?.value) || 2;
if (groupLosersTournamentMode === 'yes' && position > numQualified && position <= numQualified + numQualifiedToGroupLosers) {
    row.classList.add('qualified-to-group-losers');
}

                    row.appendChild(createCell(`${playerIndex + 1}. ${player}`, 'player-header'));

                    players.forEach((opponent, opponentIndex) => {
                        const cell = document.createElement('td');

                        if (playerIndex === opponentIndex) {
                            cell.innerHTML = '<span class="bold-x">X</span>';
                        } else if (playerIndex < opponentIndex) {
                            const input = document.createElement('input');
input.type = 'text';
input.className = 'score-input';
input.value = currentGroupResults[groupIndex][playerIndex][opponentIndex] || '';
input.placeholder = '0:0';

let skipEvent = false;

input.addEventListener('input', function(e) {
    if (skipEvent) return;
    
    let val = this.value;
    
    // Sprawdź czy użytkownik WPISAŁ ręcznie dwukropek
    const oldLength = (this.oldValue || '').length;
    const newLength = val.length;
    const addedChar = newLength > oldLength ? val[newLength - 1] : '';
    
    // Jeśli użytkownik wpisał ręcznie dwukropek - ZABLOKUJ i cofnij
    if (addedChar === ':') {
        skipEvent = true;
        this.value = this.oldValue || '';
        skipEvent = false;
        return;
    }
    
    // Jeśli jest już dwukropek lub jest puste - nie formatuj
    if (val.includes(':') || val === '') {
        this.oldValue = val;
        return;
    }
    
    // Usuń wszystko poza cyframi
    let numbers = val.replace(/[^0-9]/g, '');
    if (numbers.length === 0) {
        this.oldValue = '';
        return;
    }
    
    // Formatuj
    let newValue = '';
    if (numbers.length === 1) {
        newValue = numbers + ':';
    } else if (numbers.length === 2) {
        newValue = numbers[0] + ':' + numbers[1];
    } else if (numbers.length === 3) {
        newValue = numbers[0] + numbers[1] + ':' + numbers[2];
    } else if (numbers.length >= 4) {
        newValue = numbers.slice(0, 2) + ':' + numbers.slice(2, 4);
    }
    
    if (newValue !== this.value) {
        skipEvent = true;
        this.value = newValue;
        skipEvent = false;
        this.setSelectionRange(this.value.length, this.value.length);
    }
    
    this.oldValue = this.value;
});

// Debounce dla input event
let inputTimeout;
input.addEventListener('input', (e) => {
    clearTimeout(inputTimeout);
    inputTimeout = setTimeout(() => {
        let val = e.target.value;
        
        // Zapisz tylko jeśli format jest kompletny (X:Y)
        if (!val || !/^\d+:\d+$/.test(val)) return;
        
        saveResult(groupIndex, playerIndex, opponentIndex, val, mode);
        saveState();
    }, 300);
});

input.addEventListener('change', (e) => {
    let val = e.target.value;
    
    // Walidacja
    const colonCount = (val.match(/:/g) || []).length;
    if (colonCount > 1) {
        alert('Nieprawidłowy format! Użyj formatu "3:2"');
        e.target.value = '';
        saveResult(groupIndex, playerIndex, opponentIndex, '', mode);
        saveState();
        return;
    }
    
    // Jeśli kończy się dwukropkiem, usuń go
    if (val && val.endsWith(':')) {
        val = val.slice(0, -1);
        e.target.value = val;
    }
    
    saveResult(groupIndex, playerIndex, opponentIndex, val, mode);
    saveState();
});
                            cell.appendChild(input);
                        } else {
                            const result = currentGroupResults[groupIndex][playerIndex][opponentIndex];
                            cell.textContent = result || '';
                        }
                        row.appendChild(cell);
                    });

                    row.appendChild(createCell(standing.points, 'summary-punkty'));
                    let ratioText = "";
                    if (standing.setsLost === 0 && standing.setsWon > 0) {
                        ratioText = `${standing.setsWon}:0 (?)`;
                    } else if (standing.setsWon === 0 && standing.setsLost === 0) {
                        ratioText = `0:0 (0.00)`;
                    } else {
                        ratioText = `${standing.setsWon}:${standing.setsLost} (${(standing.setRatio === Infinity ? "?" : standing.setRatio.toFixed(2))})`;
                    }
                    row.appendChild(createCell(ratioText, 'summary-bilans'));
                    row.appendChild(createCell(position, 'summary-miejsce'));
                    table.appendChild(row);
                });
            }

            tableContainer.appendChild(table);
            viewContainer.appendChild(tableContainer);
        } else {
            const scheduleContainer = document.createElement('div');
            scheduleContainer.className = 'schedule-container active';
            renderGroupSchedule(groupIndex, players, currentGroupResults[groupIndex], scheduleContainer);
            viewContainer.appendChild(scheduleContainer);
        }

        groupDiv.appendChild(viewContainer);
        container.appendChild(groupDiv);
    });
}

function createHeaderCell(text, className = '') {
    const cell = document.createElement('th');
    cell.textContent = text;
    if (className) cell.className = className;
    return cell;
}

function createCell(text, className = '') {
    const cell = document.createElement('td');
    cell.textContent = text;
    if (className) cell.className = className;
    return cell;
}

function saveResult(groupIndex, playerIndex, opponentIndex, value, mode) {
    // ===== NOWY KOD - automatyczna konwersja =====
    let correctedValue = value;
    if (value && !value.includes(':')) {
        // Sprawdź czy to 2 cyfry (np. "32" -> "3:2")
        if (/^\d{2}$/.test(value)) {
            correctedValue = value[0] + ':' + value[1];
        }
        // Sprawdź czy to 3 cyfry (np. "113" -> "11:3")
        else if (/^\d{3}$/.test(value)) {
            correctedValue = value[0] + value[1] + ':' + value[2];
        }
        // Sprawdź czy to 4 cyfry (np. "1132" -> "11:32")
        else if (/^\d{4}$/.test(value)) {
            correctedValue = value[0] + value[1] + ':' + value[2] + value[3];
        }
    }
    // ===== KONIEC NOWEGO KODU =====
    
    if (correctedValue && !/^\d+:\d+$/.test(correctedValue)) {
        alert(t('invalidScoreFormat'));
        return;
    }

    const currentGroupResults = mode === 'manual' ? manualGroupResults : groupResults;
    currentGroupResults[groupIndex][playerIndex][opponentIndex] = correctedValue;
    if (correctedValue) {
        const [a, b] = correctedValue.split(':').map(Number);
        currentGroupResults[groupIndex][opponentIndex][playerIndex] = `${b}:${a}`;
    } else {
        currentGroupResults[groupIndex][opponentIndex][playerIndex] = '';
    }
    renderGroups();
}



function generateBracket() {
    const bracketContainer = document.getElementById('knockout-bracket');
    if (!bracketContainer) return;
    
    bracketContainer.innerHTML = '';
    const mode = document.getElementById('mode').value;
    const knockoutSize = parseInt(document.getElementById('knockoutSize')?.value || 8);

    // ===== CZYSZCZENIE DRABINEK PRZEGRANYCH Z GRUP I POCIESZENIA =====
    groupLosersKnockoutMatches = { round16: [], quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
    groupLosersConsolationMatches = { semifinals: [], fifthPlace: null, seventhPlace: null };
    groupLosersPlayerColors = {};
    groupLosersPlayers = [];
    
    const groupLosersBracket = document.getElementById('groupLosers-bracket');
    const groupLosersConsolationBracket = document.getElementById('groupLosers-consolation-bracket');
    if (groupLosersBracket) groupLosersBracket.innerHTML = '';
    if (groupLosersConsolationBracket) groupLosersConsolationBracket.innerHTML = '';
    
    // Reset UI sekcji przegranych (ukryj jeśli nie są włączone w ustawieniach)
    if (groupLosersTournamentMode !== 'yes') {
        _safeSetDisplay('groupLosersSection', 'none');
        _safeSetDisplay('groupLosersConsolationSection', 'none');
    }
    // ================================================================

    if (mode === 'manual') {
        manualPlayerColors = {};
    } else {
        autoPlayerColors = {};
    }

    const currentPlayerColors = mode === 'manual' ? manualPlayerColors : autoPlayerColors;
    const numQualified = parseInt(document.getElementById(
        mode === 'manual' ? 'numQualifiedPlayersManual' : 'numQualifiedPlayers'
    ).value);
    
    let allQualifiedPlayers = [];
    calculateAllStandings();

    let allPlayersWithStandings = [];
    const currentGroupPlayers = mode === 'manual' ? manualGroupPlayers : groupPlayers;
    const currentGroupStandings = mode === 'manual' ? manualGroupStandings : groupStandings;

    currentGroupStandings.forEach((group, groupIndex) => {
        group.forEach(standing => {
            allPlayersWithStandings.push({
                player: currentGroupPlayers[groupIndex][standing.playerIndex],
                points: standing.points,
                setRatio: standing.setRatio,
                originalGroupIndex: groupIndex,
                originalPlayerIndex: standing.playerIndex
            });
        });
    });

    allPlayersWithStandings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.setRatio !== a.setRatio) return b.setRatio - a.setRatio;
        if (a.originalGroupIndex !== b.originalGroupIndex) return a.originalGroupIndex - b.originalGroupIndex;
        return a.originalPlayerIndex - b.originalPlayerIndex;
    });

    let playersConsideredForBracket = [];
    currentGroupStandings.forEach((group, groupIndex) => {
        for(let i = 0; i < Math.min(numQualified, group.length); i++) {
            playersConsideredForBracket.push(currentGroupPlayers[groupIndex][group[i].playerIndex]);
        }
    });

    allQualifiedPlayers = playersConsideredForBracket;

    if (allQualifiedPlayers.length === 0) {
        alert(t('noQualifiedPlayers'));
        return;
    }

    const targetSize = knockoutSize;
    
    while (allQualifiedPlayers.length < targetSize) {
        allQualifiedPlayers.push("WOLNY LOS");
    }
    if (allQualifiedPlayers.length > targetSize) {
        allQualifiedPlayers = allQualifiedPlayers.slice(0, targetSize);
        alert(t('tooManyPlayers'));
    }

    // Rozstawienie zawodników (system 1-16, 2-15, 3-14, itd.)
    const seededPlayers = new Array(targetSize);
    for (let i = 0; i < targetSize / 2; i++) {
        seededPlayers[i * 2] = allQualifiedPlayers[i];
        seededPlayers[i * 2 + 1] = allQualifiedPlayers[targetSize - 1 - i];
    }

    // ===== 16 KOLORÓW DLA 16 ZAWODNIKÓW =====
    const colorClasses = [
        'player-color-1', 'player-color-2', 'player-color-3', 'player-color-4',
        'player-color-5', 'player-color-6', 'player-color-7', 'player-color-8',
        'player-color-9', 'player-color-10', 'player-color-11', 'player-color-12',
        'player-color-13', 'player-color-14', 'player-color-15', 'player-color-16'
    ];
    
    // Pobierz wszystkich unikalnych zawodników (bez "WOLNY LOS")
    const allUniquePlayers = [...new Set(seededPlayers.filter(p => p !== "WOLNY LOS"))];
    
    // Przypisz kolory
    allUniquePlayers.forEach((player, index) => {
        if (!currentPlayerColors[player]) {
            currentPlayerColors[player] = colorClasses[index % colorClasses.length];
        }
    });

    const currentKnockoutMatches = mode === 'manual' ? manualKnockoutMatches : autoKnockoutMatches;
    const currentConsolationMatches = mode === 'manual' ? manualConsolationMatches : autoConsolationMatches;

    currentConsolationMatches.semifinals = [];
    currentConsolationMatches.fifthPlace = null;
    currentConsolationMatches.seventhPlace = null;

    if (targetSize === 16) {
        // Tworzenie meczów 1/16 finału
        currentKnockoutMatches.round16 = [];
        for (let i = 0; i < 8; i++) {
            currentKnockoutMatches.round16.push({
                id: `r16_${i+1}`,
                player1: seededPlayers[i*2],
                player2: seededPlayers[i*2+1],
                score1: '', score2: '', winner: null, loser: null
            });
        }
        // Ćwierćfinały jako puste (będą wypełniane po 1/16)
        currentKnockoutMatches.quarterfinals = [
            { id: 'qf1', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null },
            { id: 'qf2', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null },
            { id: 'qf3', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null },
            { id: 'qf4', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null }
        ];
    } else {
        // Standardowe ćwierćfinały (8 zawodników)
        currentKnockoutMatches.quarterfinals = [
            { id: 'qf1', player1: seededPlayers[0], player2: seededPlayers[1], score1: '', score2: '', winner: null, loser: null },
            { id: 'qf2', player1: seededPlayers[2], player2: seededPlayers[3], score1: '', score2: '', winner: null, loser: null },
            { id: 'qf3', player1: seededPlayers[4], player2: seededPlayers[5], score1: '', score2: '', winner: null, loser: null },
            { id: 'qf4', player1: seededPlayers[6], player2: seededPlayers[7], score1: '', score2: '', winner: null, loser: null }
        ];
        currentKnockoutMatches.round16 = [];
    }
    
    currentKnockoutMatches.semifinals = [
        { id: 'sf1', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null },
        { id: 'sf2', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null }
    ];
    currentKnockoutMatches.final = { id: 'final', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null };
    currentKnockoutMatches.thirdPlace = { id: 'third', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null };

    displayBracket();
    handleByes();
    updateClassification();
}

function displayBracket() {
    _debugLog("displayBracket() called.");
    const bracketContainer = document.getElementById('knockout-bracket');
    if (!bracketContainer) return;

    const mode = document.getElementById('mode').value;
    const currentKnockoutMatches = mode === 'manual' ? manualKnockoutMatches : autoKnockoutMatches;
    const knockoutSize = parseInt(document.getElementById('knockoutSize')?.value || 8);

    // Sprawdź czy są mecze do wyświetlenia
    const hasRound16 = currentKnockoutMatches.round16 && currentKnockoutMatches.round16.length > 0 && 
                       currentKnockoutMatches.round16.some(m => m.player1);
    
    // DLA 1/16: ćwierćfinały wyświetlamy ZAWSZE (nawet puste)
    // DLA 8: ćwierćfinały wyświetlamy tylko jeśli mają player1
    let hasQuarterfinals = false;
    if (knockoutSize === 16) {
        hasQuarterfinals = currentKnockoutMatches.quarterfinals && currentKnockoutMatches.quarterfinals.length > 0;
    } else {
        hasQuarterfinals = currentKnockoutMatches.quarterfinals && 
                           currentKnockoutMatches.quarterfinals.length > 0 && 
                           currentKnockoutMatches.quarterfinals.some(m => m.player1);
    }
    
    if (!hasRound16 && !hasQuarterfinals) {
        bracketContainer.innerHTML = '';
        return;
    }

    bracketContainer.innerHTML = '';
    const bracketWrapper = document.createElement('div');
    bracketWrapper.className = 'bracket';

    if (hasRound16) {
        // ===== TRYB 1/16 (16) =====
        // Kolumna 1: 1/16 finału
        const round16Column = document.createElement('div');
        round16Column.className = 'bracket-column';
        const round16Title = document.createElement('h3');
        round16Title.className = 'round-title';
        round16Title.textContent = t('round16');
        round16Column.appendChild(round16Title);
        currentKnockoutMatches.round16.forEach(match => {
            round16Column.appendChild(createMatchElement(match, 'main'));
        });
        bracketWrapper.appendChild(round16Column);
        
        // Kolumna 2: Ćwierćfinały (ZAWSZE wyświetlamy, nawet puste)
        const quartersColumn = document.createElement('div');
        quartersColumn.className = 'bracket-column';
        const quartersTitle = document.createElement('h3');
        quartersTitle.className = 'round-title';
        quartersTitle.textContent = t('quarterfinalsWithPlaces').replace('{range}', '5-8');
        quartersColumn.appendChild(quartersTitle);
        
        // Jeśli są ćwierćfinały (nawet puste) – wyświetlamy je
        if (currentKnockoutMatches.quarterfinals && currentKnockoutMatches.quarterfinals.length > 0) {
            currentKnockoutMatches.quarterfinals.forEach(match => {
                quartersColumn.appendChild(createMatchElement(match, 'main'));
            });
        } else {
            // Puste miejsca (4 mecze)
            for (let i = 0; i < 4; i++) {
                const emptyMatch = { id: `empty_qf_${i}`, player1: null, player2: null, score1: '', score2: '' };
                quartersColumn.appendChild(createMatchElement(emptyMatch, 'main'));
            }
        }
        bracketWrapper.appendChild(quartersColumn);
        
        // Kolumna 3: Półfinały + 3. miejsce + Finał
        const finalColumn = document.createElement('div');
        finalColumn.className = 'bracket-column';
        
        const semisTitle = document.createElement('h3');
        semisTitle.className = 'round-title';
        semisTitle.textContent = t('semifinals');
        finalColumn.appendChild(semisTitle);
        currentKnockoutMatches.semifinals.forEach(match => {
            finalColumn.appendChild(createMatchElement(match, 'main'));
        });
        
        const thirdPlaceTitle = document.createElement('h3');
        thirdPlaceTitle.className = 'round-title';
        thirdPlaceTitle.textContent = t('thirdPlace');
        finalColumn.appendChild(thirdPlaceTitle);
        if (currentKnockoutMatches.thirdPlace) {
            finalColumn.appendChild(createMatchElement(currentKnockoutMatches.thirdPlace, 'main'));
        }
        
        const finalTitle = document.createElement('h3');
        finalTitle.className = 'round-title';
        finalTitle.textContent = t('final');
        finalColumn.appendChild(finalTitle);
        if (currentKnockoutMatches.final) {
            finalColumn.appendChild(createMatchElement(currentKnockoutMatches.final, 'main'));
        }
        
        bracketWrapper.appendChild(finalColumn);
        
    } else {
        // ===== TRYB ĆWIERĆFINAŁY (8) ===== (bez zmian)
        const quartersColumn = document.createElement('div');
        quartersColumn.className = 'bracket-column';
        const quartersTitle = document.createElement('h3');
        quartersTitle.className = 'round-title';
        quartersTitle.textContent = t('quarterfinalsWithPlaces').replace('{range}', '5-8');
        quartersColumn.appendChild(quartersTitle);
        if (hasQuarterfinals) {
            currentKnockoutMatches.quarterfinals.forEach(match => {
                quartersColumn.appendChild(createMatchElement(match, 'main'));
            });
        }
        bracketWrapper.appendChild(quartersColumn);
        
        const semisColumn = document.createElement('div');
        semisColumn.className = 'bracket-column';
        const semisTitle = document.createElement('h3');
        semisTitle.className = 'round-title';
        semisTitle.textContent = t('semifinals');
        semisColumn.appendChild(semisTitle);
        currentKnockoutMatches.semifinals.forEach(match => {
            semisColumn.appendChild(createMatchElement(match, 'main'));
        });
        bracketWrapper.appendChild(semisColumn);
        
        const finalColumn = document.createElement('div');
        finalColumn.className = 'bracket-column';
        
        const thirdPlaceTitle = document.createElement('h3');
        thirdPlaceTitle.className = 'round-title';
        thirdPlaceTitle.textContent = t('thirdPlace');
        finalColumn.appendChild(thirdPlaceTitle);
        if (currentKnockoutMatches.thirdPlace) {
            finalColumn.appendChild(createMatchElement(currentKnockoutMatches.thirdPlace, 'main'));
        }
        
        const finalTitle = document.createElement('h3');
        finalTitle.className = 'round-title';
        finalTitle.textContent = t('final');
        finalColumn.appendChild(finalTitle);
        if (currentKnockoutMatches.final) {
            finalColumn.appendChild(createMatchElement(currentKnockoutMatches.final, 'main'));
        }
        
        bracketWrapper.appendChild(finalColumn);
    }

    bracketContainer.appendChild(bracketWrapper);
}

function createMatchElement(match, type = 'main') {
    const mode = document.getElementById('mode').value;
    const currentPlayerColors = mode === 'manual' ? manualPlayerColors : autoPlayerColors;
    let matchDiv;

    matchDiv = document.createElement('div');
    matchDiv.className = 'bracket-match';

    if (match.id === 'final' || (type === 'consolation' && match.id === 'fifth')) {
        matchDiv.classList.add('final-match');
    } else if (match.id === 'third' || (type === 'consolation' && match.id === 'seventh')) {
        matchDiv.classList.add('third-place-match');
    }

    matchDiv.dataset.id = match.id;
    matchDiv.dataset.type = type;

    // Funkcja do zapisywania wyniku (sprawdza czy oba pola są wypełnione)
    function trySaveResult() {
        const score1 = scoreInput1.value.trim();
        const score2 = scoreInput2.value.trim();
        
        // Zapisz tylko jeśli oba pola mają wartości
        if (score1 !== '' && score2 !== '') {
            if (type === 'main') {
                updateMatchResult(match, null);
            } else {
                updateConsolationMatchResult(match, null);
            }
            saveState();
        }
    }

    const player1Row = document.createElement('div');
    player1Row.className = 'bracket-player';
    if (match.player1 && currentPlayerColors[match.player1]) {
        player1Row.classList.add(currentPlayerColors[match.player1]);
    }

    const player1Name = document.createElement('span');
    player1Name.className = 'player-name';
    player1Name.textContent = match.player1 ? (match.player1 === "WOLNY LOS" ? t('bye') : match.player1) : "?";

    const scoreInput1 = document.createElement('input');
    scoreInput1.type = 'text';
    scoreInput1.className = 'score-input';
    scoreInput1.placeholder = '0';
    scoreInput1.dataset.player = '1';
    scoreInput1.value = match.score1;
    
    // Ograniczenie do 2 cyfr
    scoreInput1.addEventListener('input', function(e) {
        let val = this.value.replace(/[^0-9]/g, '');
        if (val.length === 1) {
            this.value = val;
        } else if (val.length >= 2) {
            this.value = val.slice(0, 2);
        }
        // Po każdej zmianie sprawdź czy można zapisać
        trySaveResult();
    });
    
    // Enter też zatwierdza (dla wygody)
    scoreInput1.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        }
    });

    player1Row.appendChild(player1Name);
    player1Row.appendChild(scoreInput1);

    const player2Row = document.createElement('div');
    player2Row.className = 'bracket-player';
    if (match.player2 && currentPlayerColors[match.player2]) {
        player2Row.classList.add(currentPlayerColors[match.player2]);
    }

    const player2Name = document.createElement('span');
    player2Name.className = 'player-name';
    player2Name.textContent = match.player2 ? (match.player2 === "WOLNY LOS" ? t('bye') : match.player2) : "?";

    const scoreInput2 = document.createElement('input');
    scoreInput2.type = 'text';
    scoreInput2.className = 'score-input';
    scoreInput2.placeholder = '0';
    scoreInput2.dataset.player = '2';
    scoreInput2.value = match.score2;
    
    // Ograniczenie do 2 cyfr
    scoreInput2.addEventListener('input', function(e) {
        let val = this.value.replace(/[^0-9]/g, '');
        if (val.length === 1) {
            this.value = val;
        } else if (val.length >= 2) {
            this.value = val.slice(0, 2);
        }
        // Po każdej zmianie sprawdź czy można zapisać
        trySaveResult();
    });
    
    // Enter też zatwierdza
    scoreInput2.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        }
    });

    player2Row.appendChild(player2Name);
    player2Row.appendChild(scoreInput2);

    matchDiv.appendChild(player1Row);
    matchDiv.appendChild(player2Row);

    return matchDiv;
}

function updateMatchResult(match, inputElement) {
    _debugLog(`updateMatchResult() called for match ID: ${match.id}`);
    const matchDiv = document.querySelector(`.bracket-match[data-id="${match.id}"]`);
    if (!matchDiv) {
        console.error(`Error: Match div not found for ID: ${match.id}`);
        return;
    }
    
    const scoreInput1 = matchDiv.querySelector('.score-input[data-player="1"]');
    const scoreInput2 = matchDiv.querySelector('.score-input[data-player="2"]');

    const score1 = scoreInput1.value.trim();
    const score2 = scoreInput2.value.trim();

    // Jeśli wyniki się nie zmieniły, nie rób nic
    if (match.score1 === score1 && match.score2 === score2) return;
    
    match.score1 = score1;
    match.score2 = score2;
    _debugLog(`Match ${match.id} scores: ${score1}:${score2}`);

    if (score1 && score2) {
        // Sprawdź czy wynik jest różny od 0:0
        const isActualResult = (score1 !== '0' || score2 !== '0');
        
        if (parseInt(score1) > parseInt(score2)) {
            match.winner = match.player1;
            match.loser = match.player2;
        } else {
            match.winner = match.player2;
            match.loser = match.player1;
        }
        _debugLog(`Match ${match.id} winner: ${match.winner}, loser: ${match.loser}`);
        updateNextRounds(match);
    } else {
        // Wyczyść winner/loser jeśli wyniki są puste
        match.winner = null;
        match.loser = null;
    }

    updateClassification();
    
    // ===== TYLKO odśwież drabinkę, BEZ automatycznego generowania =====
    displayBracket();
    
    // ===== WYŁĄCZONE automatyczne generowanie turnieju pocieszenia =====
    // const consolationMode = document.getElementById('consolationMode').value;
    // if (consolationMode === 'yes') {
    //     generateConsolationBracket();
    // }
    
    _debugLog("updateMatchResult() finished.");
}

function updateNextRounds(match) {
    const nextMatchInfo = nextMatchMap[match.id];
    if (!nextMatchInfo) return;

    const mode = document.getElementById('mode').value;
    const currentKnockoutMatches = mode === 'manual' ? manualKnockoutMatches : autoKnockoutMatches;
    const currentPlayerColors = mode === 'manual' ? manualPlayerColors : autoPlayerColors;

    let nextMatchForWinner;
    let nextMatchForLoser;

    if (match.id.startsWith('r16')) {
        nextMatchForWinner = currentKnockoutMatches[nextMatchInfo.nextRound][nextMatchInfo.nextMatchIndex];
    } else if (match.id.startsWith('qf')) {
        nextMatchForWinner = currentKnockoutMatches[nextMatchInfo.nextRound][nextMatchInfo.nextMatchIndex];
    } else if (match.id.startsWith('sf')) {
        nextMatchForWinner = currentKnockoutMatches.final;
        nextMatchForLoser = currentKnockoutMatches.thirdPlace;
    }

    if (nextMatchForWinner) {
        if (nextMatchInfo.nextPlayer === 1) {
            nextMatchForWinner.player1 = match.winner;
        } else {
            nextMatchForWinner.player2 = match.winner;
        }
        const nextMatchDiv = document.querySelector(`.bracket-match[data-id="${nextMatchForWinner.id}"]`);
        if (nextMatchDiv) {
            const playerRow = nextMatchDiv.querySelector(
                nextMatchInfo.nextPlayer === 1
                    ? '.bracket-player:first-child'
                    : '.bracket-player:last-child'
            );
            if (playerRow) {
                playerRow.querySelector('.player-name').textContent = match.winner === "WOLNY LOS" ? t('bye') : match.winner;
                playerRow.className = 'bracket-player ' + (currentPlayerColors[match.winner] || '');
            }
        }
    }

    if (nextMatchForLoser && match.loser) {
        if (nextMatchInfo.loserPlayerPos === 1) {
            nextMatchForLoser.player1 = match.loser;
        } else {
            nextMatchForLoser.player2 = match.loser;
        }
        const loserMatchDiv = document.querySelector(`.bracket-match[data-id="${nextMatchForLoser.id}"]`);
        if (loserMatchDiv) {
            const playerRow = loserMatchDiv.querySelector(
                nextMatchInfo.loserPlayerPos === 1
                    ? '.bracket-player:first-child'
                    : '.bracket-player:last-child'
            );
            if (playerRow) {
                playerRow.querySelector('.player-name').textContent = match.loser === "WOLNY LOS" ? t('bye') : match.loser;
                playerRow.className = 'bracket-player ' + (currentPlayerColors[match.loser] || '');
            }
        }
    }
    
    saveState();
}

function updateClassification() {
    const mode = document.getElementById('mode').value;
    const currentKnockoutMatches = mode === 'manual' ? manualKnockoutMatches : autoKnockoutMatches;
    const currentConsolationMatches = mode === 'manual' ? manualConsolationMatches : autoConsolationMatches;
    const consolationMode = document.getElementById('consolationMode').value;
    const isConsolationActive = consolationMode === 'yes';
    
    // Zapisz stan po każdej zmianie wyniku
    saveState();
}

function setClassificationBox(place, player) {
    let box = document.getElementById(`classification-place-${place}`);

    if (!box) {
        // NIE TWORZYMY nowych boxów - klasyfikacja tylko w modalu
        return;
    }

    const span = box.querySelector('.player-name');
    if (!span) return;
    
    span.textContent = (player && player !== "WOLNY LOS") ? (player === "WOLNY LOS" ? t('bye') : player) : '?';
    box.className = 'classification-box';

    const mode = document.getElementById('mode').value;
    const currentPlayerColors = mode === 'manual' ? manualPlayerColors : autoPlayerColors;

    if (currentPlayerColors[player]) {
        box.classList.add(currentPlayerColors[player]);
    }
    if (place >= 5 && place <= 8) {
        const consolationMode = document.getElementById('consolationMode').value;
        box.style.display = consolationMode === 'yes' ? '' : 'none';
    } else {
        box.style.display = '';
    }
}

let byeUpdateDepth = 0;
const MAX_BYE_DEPTH = 10;

function handleByes() {
    byeUpdateDepth = 0;
    _handleByesInternal();
}

function _handleByesInternal() {
    byeUpdateDepth++;
    if (byeUpdateDepth > MAX_BYE_DEPTH) {
        console.error('Przekroczono głębokość rekursji w handleByes!');
        return;
    }
    
    const mode = document.getElementById('mode').value;
    const currentKnockoutMatches = mode === 'manual' ? manualKnockoutMatches : autoKnockoutMatches;

    // Przetwórz wszystkie rundy w kolejności
    const allRounds = [
        ...(currentKnockoutMatches.round16 || []),
        ...(currentKnockoutMatches.quarterfinals || []),
        ...(currentKnockoutMatches.semifinals || []),
        currentKnockoutMatches.thirdPlace,
        currentKnockoutMatches.final
    ].filter(m => m);

    let anyByeResolved = false;

    allRounds.forEach(match => {
        // Sprawdź czy mecz ma WOLNY LOS i nie jest jeszcze rozstrzygnięty
        if ((match.player1 === "WOLNY LOS" || match.player2 === "WOLNY LOS") && !match.winner) {
            const isPlayer1Bye = match.player1 === "WOLNY LOS";
            const winner = isPlayer1Bye ? match.player2 : match.player1;
            const loser = isPlayer1Bye ? match.player1 : match.player2;
            
            match.score1 = isPlayer1Bye ? '0' : '3';
            match.score2 = isPlayer1Bye ? '3' : '0';
            match.winner = winner;
            match.loser = loser;

            // Znajdź element w drabince i zablokuj pola
            const matchDiv = document.querySelector(`.bracket-match[data-id="${match.id}"][data-type="main"]`);
            if (matchDiv) {
                const input1 = matchDiv.querySelector('.score-input[data-player="1"]');
                const input2 = matchDiv.querySelector('.score-input[data-player="2"]');
                if (input1) { input1.value = match.score1; input1.disabled = true; }
                if (input2) { input2.value = match.score2; input2.disabled = true; }
            }

            // Przejdź do następnej rundy
            updateNextRounds(match);
            anyByeResolved = true;
        }
    });

    // Jeśli rozstrzygnęliśmy jakiś bye, mogły powstać nowe bye w następnej rundzie
    if (anyByeResolved && byeUpdateDepth < MAX_BYE_DEPTH) {
        _handleByesInternal();
    }
}

function findMatchById(id, type = 'main') {
    const mode = document.getElementById('mode').value;
    const currentKnockoutMatches = mode === 'manual' ? manualKnockoutMatches : autoKnockoutMatches;
    const currentConsolationMatches = mode === 'manual' ? manualConsolationMatches : autoConsolationMatches;

    if (type === 'main') {
        for (const match of currentKnockoutMatches.quarterfinals) {
            if (match.id === id) return match;
        }
        for (const match of currentKnockoutMatches.semifinals) {
            if (match.id === id) return match;
        }
        if (currentKnockoutMatches.final && currentKnockoutMatches.final.id === id) return currentKnockoutMatches.final;
        if (currentKnockoutMatches.thirdPlace && currentKnockoutMatches.thirdPlace.id === id) return currentKnockoutMatches.thirdPlace;
    } else {
        for (const match of currentConsolationMatches.semifinals) {
            if (match.id === id) return match;
        }
        if (currentConsolationMatches.fifthPlace && currentConsolationMatches.fifthPlace.id === id) return currentConsolationMatches.fifthPlace;
        if (currentConsolationMatches.seventhPlace && currentConsolationMatches.seventhPlace.id === id) return currentConsolationMatches.seventhPlace;
    }
    return null;
}

function toggleConsolationVisibility() {
    const consolationMode = document.getElementById('consolationMode').value;
    if (consolationMode === 'yes') {
        _safeSetDisplay('consolationSection', 'block');
    } else {
        _safeSetDisplay('consolationSection', 'none');
    }
    updateClassification();
    saveState();
}



function generateConsolationBracket() {
    const bracketContainer = document.getElementById('consolation-bracket');
    if (!bracketContainer) return;

    bracketContainer.innerHTML = '';
    const consolationMode = document.getElementById('consolationMode').value;

    if (consolationMode !== 'yes') {
        alert(t('enableConsolationFirst'));
        return;
    }

    const mode = document.getElementById('mode').value;
    const knockoutSize = parseInt(document.getElementById('knockoutSize')?.value || 8);
    const currentKnockoutMatches = mode === 'manual' ? manualKnockoutMatches : autoKnockoutMatches;
    const currentConsolationMatches = mode === 'manual' ? manualConsolationMatches : autoConsolationMatches;
    const currentPlayerColors = mode === 'manual' ? manualPlayerColors : autoPlayerColors;

    // ===== WYCZYŚĆ ISTNIEJĄCE DANE TURNIEJU POCIESZENIA =====
    currentConsolationMatches.quarterfinals = [];
    currentConsolationMatches.semifinals = [];
    currentConsolationMatches.final = null;
    currentConsolationMatches.eleventh = null;

    // Pobierz uczestników/przegranych z głównego turnieju
    let participants = [];

    if (knockoutSize === 16) {
        // Dla 1/16: bierzemy WSZYSTKICH zawodników z meczów 1/16 (łącznie z WOLNY LOS!)
        if (currentKnockoutMatches.round16 && currentKnockoutMatches.round16.length > 0) {
            currentKnockoutMatches.round16.forEach(match => {
                if (match.player1) participants.push(match.player1);
                if (match.player2) participants.push(match.player2);
            });
            // Usuń duplikaty (na wszelki wypadek)
            participants = [...new Set(participants)];
        }
    } else {
        // Dla 1/8: bierzemy przegranych z ćwierćfinałów
        if (currentKnockoutMatches.quarterfinals && currentKnockoutMatches.quarterfinals.length > 0) {
            participants = currentKnockoutMatches.quarterfinals
                .filter(match => match.loser && match.loser !== "WOLNY LOS")
                .map(match => match.loser);
        }
    }

    // ===== SPRAWDZENIE I UZUPEŁNIENIE LICZBY UCZESTNIKÓW =====
    const requiredCount = knockoutSize === 16 ? 8 : 4;

    // Uzupełnij braki WOLNY LOS
    while (participants.length < requiredCount) {
        participants.push("WOLNY LOS");
    }

    // Jeśli za dużo, weź pierwszych requiredCount
    if (participants.length > requiredCount) {
        participants = participants.slice(0, requiredCount);
    }

    // Sprawdź czy mamy wystarczająco
    if (participants.length < requiredCount) {
        let msg;
        if (knockoutSize === 16) {
            msg = 'Brak wystarczającej liczby zawodników w 1/16 finału.\n' +
                  'Upewnij się, że drabinka 1/16 jest wygenerowana (przycisk "Generuj drabinkę").\n' +
                  `Potrzeba: ${requiredCount}, obecnie: ${participants.length}`;
        } else {
            msg = 'Brak wystarczającej liczby przegranych z ćwierćfinałów.\n' +
                  'Rozegraj najpierw mecze ćwierćfinałowe, aby wygenerować Turniej Pocieszenia.\n' +
                  `Potrzeba: ${requiredCount}, obecnie: ${participants.length}`;
        }
        alert(msg);
        return;
    }

    // Kolory dla zawodników
    const colorClasses = [
        'player-color-1', 'player-color-2', 'player-color-3', 'player-color-4',
        'player-color-5', 'player-color-6', 'player-color-7', 'player-color-8',
        'player-color-9', 'player-color-10', 'player-color-11', 'player-color-12',
        'player-color-13', 'player-color-14', 'player-color-15', 'player-color-16'
    ];
    const allPlayersInConsolation = [...new Set(participants.filter(p => p !== "WOLNY LOS"))];
    allPlayersInConsolation.forEach((player, index) => {
        if (!currentPlayerColors[player]) {
            currentPlayerColors[player] = colorClasses[index % colorClasses.length];
        }
    });

    if (knockoutSize === 16 && participants.length >= 8) {
        // ===== 16 ZAWODNIKÓW: Ćwierćfinały pocieszenia (8›4) =====
        currentConsolationMatches.quarterfinals = [
            { id: 'cqf1', player1: participants[0], player2: participants[1], score1: '', score2: '', winner: null, loser: null },
            { id: 'cqf2', player1: participants[2], player2: participants[3], score1: '', score2: '', winner: null, loser: null },
            { id: 'cqf3', player1: participants[4], player2: participants[5], score1: '', score2: '', winner: null, loser: null },
            { id: 'cqf4', player1: participants[6], player2: participants[7], score1: '', score2: '', winner: null, loser: null }
        ];

        // Półfinały pocieszenia (puste)
        currentConsolationMatches.semifinals = [
            { id: 'csf1', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null },
            { id: 'csf2', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null }
        ];

        // Finał pocieszenia (mecz o 9. miejsce) + mecz o 11. miejsce
        currentConsolationMatches.final = { id: 'final', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null };
        currentConsolationMatches.eleventh = { id: 'eleventh', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null };

    } else {
        // ===== 8 ZAWODNIKÓW: Półfinały pocieszenia (4›2) =====
        const consolationParticipants = participants.slice(0, 4);

        currentConsolationMatches.quarterfinals = [];
        currentConsolationMatches.semifinals = [
            { id: 'csf1', player1: consolationParticipants[0], player2: consolationParticipants[1], score1: '', score2: '', winner: null, loser: null },
            { id: 'csf2', player1: consolationParticipants[2], player2: consolationParticipants[3], score1: '', score2: '', winner: null, loser: null }
        ];
        currentConsolationMatches.final = { id: 'final', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null };
        currentConsolationMatches.eleventh = { id: 'eleventh', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null };
    }

    displayConsolationBracket();
    updateConsolationClassification(true);
}



function displayConsolationBracket() {
    const bracketContainer = document.getElementById('consolation-bracket');
    if (!bracketContainer) return;

    const mode = document.getElementById('mode').value;
    const currentConsolationMatches = mode === 'manual' ? manualConsolationMatches : autoConsolationMatches;
    const knockoutSize = parseInt(document.getElementById('knockoutSize')?.value || 8);

    const hasQuarterfinals = currentConsolationMatches.quarterfinals && 
                             currentConsolationMatches.quarterfinals.length > 0 && 
                             currentConsolationMatches.quarterfinals.some(m => m.player1);
    const hasSemifinals = currentConsolationMatches.semifinals && 
                          currentConsolationMatches.semifinals.length > 0 && 
                          currentConsolationMatches.semifinals.some(m => m.player1);

    if (!hasQuarterfinals && !hasSemifinals) {
        bracketContainer.innerHTML = '';
        return;
    }

    bracketContainer.innerHTML = '';
    const bracketWrapper = document.createElement('div');
    bracketWrapper.className = 'bracket';

    if (knockoutSize === 16 && hasQuarterfinals) {
        // ===== 16 ZAWODNIKÓW: 4 kolumny =====
        // Kolumna 1: Ćwierćfinały pocieszenia
        const qfColumn = document.createElement('div');
        qfColumn.className = 'bracket-column';
        const qfTitle = document.createElement('h3');
        qfTitle.className = 'round-title';
        qfTitle.textContent = t('quarterfinalsWithPlaces').replace('{range}', '13-16');
        qfColumn.appendChild(qfTitle);
        currentConsolationMatches.quarterfinals.forEach(match => {
            qfColumn.appendChild(createMatchElement(match, 'consolation'));
        });
        bracketWrapper.appendChild(qfColumn);
        
        // Kolumna 2: Półfinały pocieszenia
        const semisColumn = document.createElement('div');
        semisColumn.className = 'bracket-column';
        const semisTitle = document.createElement('h3');
        semisTitle.className = 'round-title';
        semisTitle.textContent = t('semifinals');
        semisColumn.appendChild(semisTitle);
        currentConsolationMatches.semifinals.forEach(match => {
            semisColumn.appendChild(createMatchElement(match, 'consolation'));
        });
        bracketWrapper.appendChild(semisColumn);
        
        // Kolumna 3: Mecz o 11. miejsce (półfinał) + Mecz o 9. miejsce (finał)
        const finalColumn = document.createElement('div');
        finalColumn.className = 'bracket-column';
        
        const eleventhTitle = document.createElement('h3');
        eleventhTitle.className = 'round-title';
        eleventhTitle.textContent = t('matchForPlace').replace('{place}', '11');
        finalColumn.appendChild(eleventhTitle);
        if (currentConsolationMatches.eleventh) {
            finalColumn.appendChild(createMatchElement(currentConsolationMatches.eleventh, 'consolation'));
        }
        
        const finalTitle = document.createElement('h3');
        finalTitle.className = 'round-title';
        finalTitle.textContent = t('matchForPlace').replace('{place}', '9');
        finalColumn.appendChild(finalTitle);
        if (currentConsolationMatches.final) {
            finalColumn.appendChild(createMatchElement(currentConsolationMatches.final, 'consolation'));
        }
        
        bracketWrapper.appendChild(finalColumn);
        
    } else if (hasSemifinals) {
        // ===== 8 ZAWODNIKÓW: 3 kolumny =====
        // Kolumna 1: Półfinały pocieszenia
        const semisColumn = document.createElement('div');
        semisColumn.className = 'bracket-column';
        const semisTitle = document.createElement('h3');
        semisTitle.className = 'round-title';
        semisTitle.textContent = t('semifinals');
        semisColumn.appendChild(semisTitle);
        currentConsolationMatches.semifinals.forEach(match => {
            semisColumn.appendChild(createMatchElement(match, 'consolation'));
        });
        bracketWrapper.appendChild(semisColumn);
        
        // Kolumna 2: Mecz o 7. miejsce (ELEVENTH)
        const seventhColumn = document.createElement('div');
        seventhColumn.className = 'bracket-column';
        const seventhTitle = document.createElement('h3');
        seventhTitle.className = 'round-title';
        seventhTitle.textContent = t('matchForPlace').replace('{place}', '11');
        seventhColumn.appendChild(seventhTitle);
        if (currentConsolationMatches.eleventh) {
            seventhColumn.appendChild(createMatchElement(currentConsolationMatches.eleventh, 'consolation'));
        }
        bracketWrapper.appendChild(seventhColumn);
        
        // Kolumna 3: Mecz o 5. miejsce (FINAL)
        const fifthColumn = document.createElement('div');
        fifthColumn.className = 'bracket-column';
        const fifthTitle = document.createElement('h3');
        fifthTitle.className = 'round-title';
        fifthTitle.textContent = t('matchForPlace').replace('{place}', '9');
        fifthColumn.appendChild(fifthTitle);
        if (currentConsolationMatches.final) {
            fifthColumn.appendChild(createMatchElement(currentConsolationMatches.final, 'consolation'));
        }
        bracketWrapper.appendChild(fifthColumn);
    }

    bracketContainer.appendChild(bracketWrapper);
}

function updateConsolationMatchResult(match, inputElement) {
    const matchDiv = document.querySelector(`.bracket-match[data-id="${match.id}"][data-type="consolation"]`);
    if (!matchDiv) return;
    
    const scoreInput1 = matchDiv.querySelector('.score-input[data-player="1"]');
    const scoreInput2 = matchDiv.querySelector('.score-input[data-player="2"]');
    const score1 = scoreInput1.value.trim();
    const score2 = scoreInput2.value.trim();

    match.score1 = score1;
    match.score2 = score2;

    if (score1 && score2) {
        if (parseInt(score1) > parseInt(score2)) {
            match.winner = match.player1;
            match.loser = match.player2;
        } else {
            match.winner = match.player2;
            match.loser = match.player1;
        }
        _debugLog(`Consolation match ${match.id} winner: ${match.winner}, loser: ${match.loser}`);
        updateNextConsolationRounds(match);
        
        // ODŚWIEŻ UI dla wszystkich meczów pocieszenia
        const mode = document.getElementById('mode').value;
        const currentConsolationMatches = mode === 'manual' ? manualConsolationMatches : autoConsolationMatches;
        
        // Odśwież każdy mecz w drabince pocieszenia
        if (currentConsolationMatches.quarterfinals) {
            currentConsolationMatches.quarterfinals.forEach(m => updateMatchUI(m, 'consolation'));
        }
        if (currentConsolationMatches.semifinals) {
            currentConsolationMatches.semifinals.forEach(m => updateMatchUI(m, 'consolation'));
        }
        if (currentConsolationMatches.fifthPlace) updateMatchUI(currentConsolationMatches.fifthPlace, 'consolation');
        if (currentConsolationMatches.seventhPlace) updateMatchUI(currentConsolationMatches.seventhPlace, 'consolation');
        if (currentConsolationMatches.ninthPlace) updateMatchUI(currentConsolationMatches.ninthPlace, 'consolation');
        if (currentConsolationMatches.eleventhPlace) updateMatchUI(currentConsolationMatches.eleventhPlace, 'consolation');
        
        displayConsolationBracket();
    }
    updateConsolationClassification(true);
    saveState();
}

function updateNextConsolationRounds(match) {
    const mode = document.getElementById('mode').value;
    const currentConsolationMatches = mode === 'manual' ? manualConsolationMatches : autoConsolationMatches;

    // Obsługa ćwierćfinałów (cqf1-cqf4) -> półfinały
    if (match.id.startsWith('cqf') && match.winner) {
        const index = parseInt(match.id.slice(-1)) - 1; // cqf1 -> 0, cqf2 -> 1
        const targetSemifinalIndex = Math.floor(index / 2); // 0,0,1,1
        const playerPos = (index % 2) + 1; // 1,2,1,2
        
        const semifinalMatch = currentConsolationMatches.semifinals[targetSemifinalIndex];
        if (semifinalMatch) {
            if (playerPos === 1) {
                semifinalMatch.player1 = match.winner;
            } else {
                semifinalMatch.player2 = match.winner;
            }
        }
        displayConsolationBracket();
        return;
    }

    // Obsługa półfinałów (csf1, csf2) -> Mecz o 9. miejsce + Mecz o 11. miejsce
    if (match.id.startsWith('csf') && match.winner) {
        // Zwycięzca do finału (mecz o 9. miejsce)
        const finalMatch = currentConsolationMatches.final;
        if (finalMatch) {
            if (match.id === 'csf1') {
                finalMatch.player1 = match.winner;
            } else {
                finalMatch.player2 = match.winner;
            }
        }
        
        // Przegrany do meczu o 11. miejsce
        if (match.loser) {
            const eleventhMatch = currentConsolationMatches.eleventh;
            if (eleventhMatch) {
                if (match.id === 'csf1') {
                    eleventhMatch.player1 = match.loser;
                } else {
                    eleventhMatch.player2 = match.loser;
                }
            }
        }
        displayConsolationBracket();
        return;
    }
    
    saveState();
}

function setConsolationClassificationBox(place, player) {
    const boxId = `consolation-classification-place-${place}`;
    const box = document.getElementById(boxId);
    if (!box) return;

    const span = box.querySelector('.player-name');
    if (span) {
        span.textContent = (player && player !== "WOLNY LOS") ? (player === "WOLNY LOS" ? t('bye') : player) : '?';
    }

    box.className = 'classification-box';

    const mode = document.getElementById('mode').value;
    const currentPlayerColors = mode === 'manual' ? manualPlayerColors : autoPlayerColors;

    if (currentPlayerColors[player]) {
        box.classList.add(currentPlayerColors[player]);
    }
}

function updateConsolationClassification(isActive) {
    const mode = document.getElementById('mode').value;
    const currentConsolationMatches = mode === 'manual' ? manualConsolationMatches : autoConsolationMatches;
    const knockoutSize = parseInt(document.getElementById('knockoutSize')?.value || 8);

    if (!isActive) return;

    if (knockoutSize === 16) {
        const finalMatch = currentConsolationMatches.final;
        const eleventhMatch = currentConsolationMatches.eleventh;
        
        setClassificationBox(9, finalMatch?.winner || null);
        setClassificationBox(10, finalMatch?.loser || null);
        setClassificationBox(11, eleventhMatch?.winner || null);
        setClassificationBox(12, eleventhMatch?.loser || null);
        
    } else {
        // Dla 8 zawodników
        const finalMatch = currentConsolationMatches.final;      // mecz o 5. miejsce
        const seventhMatch = currentConsolationMatches.eleventh; // mecz o 7. miejsce
        
        setClassificationBox(5, finalMatch?.winner || null);
        setClassificationBox(6, finalMatch?.loser || null);
        setClassificationBox(7, seventhMatch?.winner || null);
        setClassificationBox(8, seventhMatch?.loser || null);
    }
}

function toggleCollapse(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const button = container.querySelector('.collapse-button');
    const content = container.querySelector('.collapsible-content');

    if (container.classList.contains('collapsed')) {
        container.classList.remove('collapsed');
        if (button) button.textContent = t('collapse');
        if (content) {
            content.style.maxHeight = content.scrollHeight + 'px';
            content.addEventListener('transitionend', function handler() {
                if (!container.classList.contains('collapsed')) {
                    content.style.maxHeight = '';
                }
                content.removeEventListener('transitionend', handler);
            }, { once: true });
        }
    } else {
        if (content) {
            content.style.maxHeight = content.scrollHeight + 'px';
            void content.offsetWidth;
            content.style.maxHeight = '0';
        }
        container.classList.add('collapsed');
        if (button) button.textContent = t('expand');
    }
    if (button) _ariaExpanded(button, !container.classList.contains('collapsed'));
    saveState();
}

function getLocalStorageKey(categoryName) {
    const sanitizedName = categoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    return `tournamentData_${sanitizedName || 'default'}`;
}
function saveManualGroupsInput() {
    saveState();
}
function saveState() {
    

    const currentCat = document.getElementById('subTitleInput').value;
    const currentName = document.getElementById('tournamentNameInput').value;
    
    if (currentCat) localStorage.setItem('LAST_OPEN_CATEGORY', currentCat);
    if (currentName) localStorage.setItem('LAST_TOURNAMENT_NAME', currentName);

    const categoryName = document.getElementById('subTitleInput').value;
    const storageKey = getLocalStorageKey(categoryName);

    const dataToSave = {
        tournamentName: document.getElementById('tournamentNameInput').value,
        
        autoSubTitle: autoSubTitle,
        manualSubTitle: manualSubTitle,
        playersAutoInput: document.getElementById('playersAuto').value,
        playersManualInput: document.getElementById('playersManual').value,
        mode: document.getElementById('mode').value,
        consolationMode: document.getElementById('consolationMode').value,
        numGroupsAuto: document.getElementById('numGroupsAuto').value,
        numQualifiedPlayers: document.getElementById('numQualifiedPlayers').value,
        numGroupsManual: document.getElementById('numGroupsManual').value,
        manualGroupPlayersText: [],
        groupPlayers: groupPlayers,
        groupResults: groupResults,
        groupStandings: groupStandings,
        manualGroupPlayers: manualGroupPlayers,
        manualGroupResults: manualGroupResults,
        manualGroupStandings: manualGroupStandings,
        autoKnockoutMatches: autoKnockoutMatches,
        manualKnockoutMatches: manualKnockoutMatches,
        autoConsolationMatches: autoConsolationMatches,
        manualConsolationMatches: manualConsolationMatches,
        autoPlayerColors: autoPlayerColors,
        manualPlayerColors: manualPlayerColors,
        controlPanelCollapsed: document.getElementById('controlPanel').classList.contains('collapsed'),
        groupSectionCollapsed: document.getElementById('groupSection').classList.contains('collapsed'),
        knockoutSectionCollapsed: document.getElementById('knockoutSection').classList.contains('collapsed'),
        consolationSectionCollapsed: _safeHasClass('consolationSection', 'collapsed'),
        activeGroupView: activeGroupView,
        currentLanguage: currentLanguage,
leagueRankings: leagueRankings,
leagueSettings: leagueSettings,
currentRound: document.getElementById('currentRound')?.value || '1',
totalRounds: document.getElementById('totalRounds')?.value || '10',
tournamentMode: document.getElementById('tournamentMode').value,
groupLosersTournamentMode: groupLosersTournamentMode,
groupLosersQualifiedCount: groupLosersQualifiedCount,
groupLosersPlayers: groupLosersPlayers,
groupLosersKnockoutMatches: groupLosersKnockoutMatches,
groupLosersConsolationMatches: groupLosersConsolationMatches,
groupLosersConsolationMode: groupLosersConsolationMode,
groupLosersPlayerColors: groupLosersPlayerColors,
groupLosersKnockoutSize: groupLosersKnockoutSize,
knockoutSize: document.getElementById('knockoutSize').value,
numQualifiedPlayersManual: document.getElementById('numQualifiedPlayersManual').value,
activeKnockoutTab: activeKnockoutTab,      
    activeKnockoutView: activeKnockoutView,
    };

    const manualGroupCount = parseInt(document.getElementById('numGroupsManual').value);
    for (let i = 0; i < manualGroupCount; i++) {
        const elem = document.getElementById(`manual-group-${i}`);
        if (elem) {
            dataToSave.manualGroupPlayersText.push(elem.value);
        } else {
            dataToSave.manualGroupPlayersText.push('');
        }
    }

    try {
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    } catch (e) {
    }
}

function loadState() {
    let catInput = document.getElementById('subTitleInput');
    let nameInput = document.getElementById('tournamentNameInput');
    
    if (!catInput.value) {
        const lastCat = localStorage.getItem('LAST_OPEN_CATEGORY');
        if (lastCat) {
            catInput.value = lastCat;
            if (document.getElementById('mode').value === 'manual') manualSubTitle = lastCat;
            else autoSubTitle = lastCat;
        }
    }

    if (!nameInput.value) {
        const lastName = localStorage.getItem('LAST_TOURNAMENT_NAME');
        if (lastName) {
            nameInput.value = lastName;
            updateTournamentTitle();
        }
    }

    const categoryName = document.getElementById('subTitleInput').value;
    const storageKey = getLocalStorageKey(categoryName);

    try {
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
            const loadedData = JSON.parse(storedData);

            if (loadedData.tournamentName) {
                document.getElementById('tournamentNameInput').value = loadedData.tournamentName;
                updateTournamentTitle();
            }

            autoSubTitle = loadedData.autoSubTitle || '';
            manualSubTitle = loadedData.manualSubTitle || '';
            document.getElementById('playersAuto').value = loadedData.playersAutoInput || '';
            document.getElementById('playersManual').value = loadedData.playersManualInput || '';
            document.getElementById('mode').value = loadedData.mode || 'manual';
            
            let consolationMode = loadedData.consolationMode || 'no';
            if (loadedData.enableConsolation !== undefined) {
                consolationMode = loadedData.enableConsolation ? 'yes' : 'no';
            }
            document.getElementById('consolationMode').value = consolationMode;
            setConsolationMode(consolationMode);
            
            document.getElementById('numGroupsAuto').value = loadedData.numGroupsAuto || 4;
            document.getElementById('numQualifiedPlayers').value = loadedData.numQualifiedPlayers || 2;
            document.getElementById('numGroupsManual').value = loadedData.numGroupsManual || 4;
            activeGroupView = loadedData.activeGroupView || 'table';
            
            if (loadedData.currentLanguage) {
                currentLanguage = loadedData.currentLanguage;
            }
  
            if (loadedData.leagueRankings) leagueRankings = loadedData.leagueRankings;
            if (loadedData.leagueSettings) leagueSettings = loadedData.leagueSettings;
            if (loadedData.tournamentMode) {
                document.getElementById('tournamentMode').value = loadedData.tournamentMode;
                setTournamentMode(loadedData.tournamentMode);
            }
            if (loadedData.currentRound) document.getElementById('currentRound').value = loadedData.currentRound;
            if (loadedData.totalRounds) document.getElementById('totalRounds').value = loadedData.totalRounds;

            const modeSelect = document.getElementById('mode');
            document.getElementById('auto-panel').style.display = modeSelect.value === 'auto' ? 'block' : 'none';
            document.getElementById('manual-panel').style.display = modeSelect.value === 'auto' ? 'none' : 'block';
            document.getElementById('generateAutoGroupsBtn').style.display = modeSelect.value === 'auto' ? 'inline-block' : 'none';
            document.getElementById('generateManualGroupsBtn').style.display = modeSelect.value === 'auto' ? 'none' : 'inline-block';

            if (loadedData.manualGroupPlayersText) {
                const manualGroupCount = parseInt(document.getElementById('numGroupsManual').value);
                const container = document.getElementById('manual-groups');
                if (container) {
                     container.innerHTML = '';
                     for (let i = 0; i < manualGroupCount; i++) {
                        container.innerHTML += `
                            <div class="manual-group">
                                <label>${t('players')} ${t('group')} ${i+1}:</label>
                                <textarea id="manual-group-${i}" data-i18n-placeholder="enterPlayersManual" placeholder="${t('enterPlayersManual')}" oninput="saveManualGroupsInput()"></textarea>
                            </div>`;
                    }
                }

                for (let i = 0; i < manualGroupCount; i++) {
                    const elem = document.getElementById(`manual-group-${i}`);
                    if (elem && loadedData.manualGroupPlayersText[i] !== undefined) {
                        elem.value = loadedData.manualGroupPlayersText[i];
                    }
                }
            }

            groupPlayers = loadedData.groupPlayers || [];
            groupResults = loadedData.groupResults || [];
            groupStandings = loadedData.groupStandings || [];
            manualGroupPlayers = loadedData.manualGroupPlayers || [];
            manualGroupResults = loadedData.manualGroupResults || [];
            manualGroupStandings = loadedData.manualGroupStandings || [];
            autoKnockoutMatches = loadedData.autoKnockoutMatches || { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
            manualKnockoutMatches = loadedData.manualKnockoutMatches || { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
            autoConsolationMatches = loadedData.autoConsolationMatches || { semifinals: [], fifthPlace: null, seventhPlace: null };
            manualConsolationMatches = loadedData.manualConsolationMatches || { semifinals: [], fifthPlace: null, seventhPlace: null };
            autoPlayerColors = loadedData.autoPlayerColors || {};
            manualPlayerColors = loadedData.manualPlayerColors || {};

            autoKnockoutMatches.quarterfinals = autoKnockoutMatches.quarterfinals || [];
            autoKnockoutMatches.semifinals = autoKnockoutMatches.semifinals || [];
            manualKnockoutMatches.quarterfinals = manualKnockoutMatches.quarterfinals || [];
            manualKnockoutMatches.semifinals = manualKnockoutMatches.semifinals || [];
            autoConsolationMatches.semifinals = autoConsolationMatches.semifinals || [];
            manualConsolationMatches.semifinals = manualConsolationMatches.semifinals || [];
            
            groupLosersTournamentMode = loadedData.groupLosersTournamentMode || 'no';
            groupLosersQualifiedCount = loadedData.groupLosersQualifiedCount || 2;
            groupLosersPlayers = loadedData.groupLosersPlayers || [];
            groupLosersKnockoutMatches = loadedData.groupLosersKnockoutMatches || { round16: [], quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
            groupLosersConsolationMatches = loadedData.groupLosersConsolationMatches || { semifinals: [], fifthPlace: null, seventhPlace: null };
            groupLosersConsolationMode = loadedData.groupLosersConsolationMode || 'no';
            groupLosersPlayerColors = loadedData.groupLosersPlayerColors || {};
            groupLosersKnockoutSize = loadedData.groupLosersKnockoutSize || 8;
            
            setGroupLosersKnockoutSize(groupLosersKnockoutSize);
            setGroupLosersConsolationMode(groupLosersConsolationMode);
            setGroupLosersTournamentMode(groupLosersTournamentMode);
            document.getElementById('numQualifiedToGroupLosers').value = groupLosersQualifiedCount;

            updateSubTitleDisplay();
            renderGroups();
            displayBracket();
            toggleConsolationVisibility();
            displayConsolationBracket();
            handleByes();
            updateClassification();

            // ===== ODTWORZENIE DRABINEK PRZEGRANYCH Z GRUP =====
            if (groupLosersTournamentMode === 'yes') {
                _safeSetDisplay('groupLosersSection', 'block');
                displayGroupLosersBracket();
                handleGroupLosersByes();
                if (groupLosersConsolationMode === 'yes') {
                    _safeSetDisplay('groupLosersConsolationSection', 'block');
                    displayGroupLosersConsolationBracket();
                }
            }

            applyCollapseState('controlPanel', loadedData.controlPanelCollapsed);
            applyCollapseState('groupSection', loadedData.groupSectionCollapsed);
            applyCollapseState('knockoutSection', loadedData.knockoutSectionCollapsed);
            applyCollapseState('consolationSection', loadedData.consolationSectionCollapsed);

            document.querySelectorAll('.view-toggle-btn').forEach(btn => {
                if (btn.dataset.view === activeGroupView) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            applyTranslations();
            updateLanguageSwitch();

            const mode = document.getElementById('mode').value;
            const currentKnockoutMatches = mode === 'manual' ? manualKnockoutMatches : autoKnockoutMatches;
            const currentConsolationMatches = mode === 'manual' ? manualConsolationMatches : autoConsolationMatches;

            currentKnockoutMatches.quarterfinals.forEach(match => updateMatchUI(match, 'main'));
            currentKnockoutMatches.semifinals.forEach(match => updateMatchUI(match, 'main'));
            if (currentKnockoutMatches.final) updateMatchUI(currentKnockoutMatches.final, 'main');
            if (currentKnockoutMatches.thirdPlace) updateMatchUI(currentKnockoutMatches.thirdPlace, 'main');

            currentConsolationMatches.semifinals.forEach(match => updateMatchUI(match, 'consolation'));
            if (currentConsolationMatches.fifthPlace) updateMatchUI(currentConsolationMatches.fifthPlace, 'consolation');
            if (currentConsolationMatches.seventhPlace) updateMatchUI(currentConsolationMatches.seventhPlace, 'consolation');
            
            setTimeout(() => {
                document.querySelectorAll('.match-item').forEach(item => {
                    const id = item.id;
                    if (id && localStorage.getItem(`matchProgress_${id}`) === 'true') {
                        item.classList.add('match-in-progress');
                        const checkbox = item.querySelector('.match-inprogress-checkbox');
                        if (checkbox) checkbox.checked = true;
                    }
                });
            }, 200);
        }
    } catch (e) {
        alert(t('loadError'));
        clearTournamentData(false);
        resetTournamentUI();
    } finally {
        refreshGroupLosersKnockoutButtons();
		shouldSave = true;
    }
}

function applyCollapseState(containerId, isCollapsed) {
    const container = document.getElementById(containerId);
    if (container) {
        const button = container.querySelector('.collapse-button');
        const content = container.querySelector('.collapsible-content');
        if (isCollapsed) {
            container.classList.add('collapsed');
            if (button) button.textContent = t('expand');
            if (content) content.style.maxHeight = '0';
        } else {
            container.classList.remove('collapsed');
            if (button) button.textContent = t('collapse');
            if (content) {
                content.style.maxHeight = null;
            }
        }
        if (button) _ariaExpanded(button, true);
    }
}

function updateMatchUI(match, type) {
    const matchDiv = document.querySelector(`.bracket-match[data-id="${match.id}"][data-type="${type}"]`);
    if (!matchDiv) return;

    const mode = document.getElementById('mode').value;
    const currentPlayerColors = mode === 'manual' ? manualPlayerColors : autoPlayerColors;
    const colorClasses = [
        'player-color-1', 'player-color-2', 'player-color-3', 'player-color-4',
        'player-color-5', 'player-color-6', 'player-color-7', 'player-color-8',
        'player-color-9', 'player-color-10', 'player-color-11', 'player-color-12',
        'player-color-13', 'player-color-14', 'player-color-15', 'player-color-16'
    ];

    const input1 = matchDiv.querySelector('.score-input[data-player="1"]');
    const input2 = matchDiv.querySelector('.score-input[data-player="2"]');
    const player1NameSpan = matchDiv.querySelector('.bracket-player:first-child .player-name');
    const player2NameSpan = matchDiv.querySelector('.bracket-player:last-child .player-name');
    const player1Row = matchDiv.querySelector('.bracket-player:first-child');
    const player2Row = matchDiv.querySelector('.bracket-player:last-child');

    if (player1NameSpan) player1NameSpan.textContent = match.player1 ? (match.player1 === "WOLNY LOS" ? t('bye') : match.player1) : '?';
    if (player2NameSpan) player2NameSpan.textContent = match.player2 ? (match.player2 === "WOLNY LOS" ? t('bye') : match.player2) : '?';

    // ===== KOLORY DLA GRACZA 1 =====
    if (player1Row) {
        player1Row.className = 'bracket-player';
        if (match.player1 && currentPlayerColors[match.player1]) {
            player1Row.classList.add(currentPlayerColors[match.player1]);
        } else if (match.player1 && match.player1 !== "WOLNY LOS") {
            const usedColors = Object.values(currentPlayerColors);
            let availableColor = colorClasses.find(c => !usedColors.includes(c));
            if (!availableColor) availableColor = 'player-color-1';
            currentPlayerColors[match.player1] = availableColor;
            player1Row.classList.add(availableColor);
        }
    }
    
    // ===== KOLORY DLA GRACZA 2 =====
    if (player2Row) {
        player2Row.className = 'bracket-player';
        if (match.player2 && currentPlayerColors[match.player2]) {
            player2Row.classList.add(currentPlayerColors[match.player2]);
        } else if (match.player2 && match.player2 !== "WOLNY LOS") {
            const usedColors = Object.values(currentPlayerColors);
            let availableColor = colorClasses.find(c => !usedColors.includes(c));
            if (!availableColor) availableColor = 'player-color-1';
            currentPlayerColors[match.player2] = availableColor;
            player2Row.classList.add(availableColor);
        }
    }

    if (input1) {
        input1.value = match.score1 || '';
        input1.disabled = (match.player1 === "WOLNY LOS" || match.player2 === "WOLNY LOS") || (match.score1 !== '' && match.score2 !== '');
    }
    if (input2) {
        input2.value = match.score2 || '';
        input2.disabled = (match.player1 === "WOLNY LOS" || match.player2 === "WOLNY LOS") || (match.score1 !== '' && match.score2 !== '');
    }
}

function clearTournamentData(confirmClear = true) {
    let shouldClear = true;
    if (confirmClear) {
        const dialogHtml = `
            <div id="clearDialog" class="modal-overlay">
                <div class="modal-box">
                    <h3 class="modal-title">${t('selectDataToClear')}</h3>
                    <div class="modal-body-spacing">
                        <label class="modal-label-block">
                            <input type="checkbox" id="clearManual" class="modal-checkbox">
                            <strong>${currentLanguage === 'pl' ? 'Ręczny' : 'Manual'}</strong>
                        </label>
                        <label class="modal-label-block">
                            <input type="checkbox" id="clearAuto" class="modal-checkbox">
                            <strong>${currentLanguage === 'pl' ? 'Automatyczny' : 'Automatic'}</strong>
                        </label>
                        <label class="modal-label-block">
                            <input type="checkbox" id="clearAll" class="modal-checkbox">
                            <strong>${currentLanguage === 'pl' ? 'Wszystko' : 'Everything'}</strong>
                        </label>
                    </div>
                    <div class="modal-actions">
                        <button onclick="document.getElementById('clearDialog').remove()" class="btn-modal-cancel">${t('cancel')}</button>
                        <button onclick="processClearSelection()" class="btn-modal-danger">${t('clearSelected')}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', dialogHtml);

        setTimeout(() => {
            const clearAllCheckbox = document.getElementById('clearAll');
            const clearAutoCheckbox = document.getElementById('clearAuto');
            const clearManualCheckbox = document.getElementById('clearManual');

            if (clearAllCheckbox) {
                clearAllCheckbox.addEventListener('change', function() {
                    if (this.checked) {
                        if (clearAutoCheckbox) clearAutoCheckbox.checked = false;
                        if (clearManualCheckbox) clearManualCheckbox.checked = false;
                    }
                });
            }

            if (clearAutoCheckbox) {
                clearAutoCheckbox.addEventListener('change', function() {
                    if (this.checked && clearAllCheckbox) {
                        clearAllCheckbox.checked = false;
                    }
                });
            }

            if (clearManualCheckbox) {
                clearManualCheckbox.addEventListener('change', function() {
                    if (this.checked && clearAllCheckbox) {
                        clearAllCheckbox.checked = false;
                    }
                });
            }
        }, 100);

        window.processClearSelection = function() {
            const clearAuto = document.getElementById('clearAuto')?.checked || false;
            const clearManual = document.getElementById('clearManual')?.checked || false;
            const clearAll = document.getElementById('clearAll')?.checked || false;

            document.getElementById('clearDialog')?.remove();

            if (!clearAuto && !clearManual && !clearAll) {
                alert(t('noOptionSelected'));
                return;
            }

            let confirmMessage = "";
            if (clearAll) {
                confirmMessage = t('confirmClearAll');
            } else {
                const selectedModes = [];
                if (clearManual) selectedModes.push(currentLanguage === 'pl' ? "Ręczny" : "Manual");
                if (clearAuto) selectedModes.push(currentLanguage === 'pl' ? "Automatyczny" : "Automatic");
                confirmMessage = t('confirmClearSelected') + selectedModes.join(` ${t('and')} `) + "?";
            }

            if (!confirm(confirmMessage)) {
                _debugLog("Clearing cancelled by user in confirmation.");
                return;
            }

            const categoryName = document.getElementById('subTitleInput').value;
            const storageKey = getLocalStorageKey(categoryName);
            const tournamentName = document.getElementById('tournamentNameInput').value.trim() || 'Turniej';

            try {
                // ===== CZYSZCZENIE LOCALSTORAGE DLA CLEAR ALL =====
                if (clearAll) {
                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && (key.startsWith('tournamentData_') || key === 'LAST_OPEN_CATEGORY' || key === 'LAST_TOURNAMENT_NAME' || key === 'appLanguage')) {
                            keysToRemove.push(key);
                        }
                    }
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                    sessionStorage.clear();
                    localStorage.removeItem(`manualGroupsInputData_${tournamentName.toUpperCase()}`);
                    _debugLog("Cleared ALL localStorage keys:", keysToRemove);
                }

                const storedData = localStorage.getItem(storageKey);
                let currentData = storedData ? JSON.parse(storedData) : {};

                // ===== FUNKCJA POMOCNICZA: czyść turniej przegranych z grup =====
                function clearGroupLosersData() {
                    groupLosersKnockoutMatches = { round16: [], quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
                    groupLosersConsolationMatches = { semifinals: [], fifthPlace: null, seventhPlace: null };
                    groupLosersPlayerColors = {};
                    groupLosersPlayers = [];
                    
                    document.getElementById('groupLosers-bracket').innerHTML = '';
                    document.getElementById('groupLosers-consolation-bracket').innerHTML = '';
                    
                    if (currentData) {
                        currentData.groupLosersKnockoutMatches = groupLosersKnockoutMatches;
                        currentData.groupLosersConsolationMatches = groupLosersConsolationMatches;
                        currentData.groupLosersPlayerColors = {};
                        currentData.groupLosersPlayers = [];
                        currentData.groupLosersTournamentMode = 'no';
                        currentData.groupLosersConsolationMode = 'no';
                        currentData.groupLosersKnockoutSize = 8;
                        currentData.groupLosersQualifiedCount = 2;
                    }
                    
                    _debugLog("Cleared group losers tournament data.");
                }

                // ===== FUNKCJA POMOCNICZA: resetuj ustawienia globalne =====
                function resetGlobalSettings() {
                    setTournamentMode('single');
                    setKnockoutSize(8);
                    setConsolationMode('no');
                    setGroupLosersTournamentMode('no');
                    setGroupLosersKnockoutSize(8);
                    setGroupLosersConsolationMode('no');
                    
                    document.getElementById('numQualifiedToGroupLosers').value = 2;
                    document.getElementById('currentRound').value = 1;
                    document.getElementById('totalRounds').value = 4;
                    
                    _debugLog("Reset global settings.");
                }

                if (clearAll) {
                    resetTournamentUI();
                    alert(t('allDataCleared'));
                    return;
                }

                if (clearAuto) {
                    if (currentData) {
                        currentData.groupPlayers = [];
                        currentData.groupResults = [];
                        currentData.groupStandings = [];
                        currentData.autoKnockoutMatches = { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
                        currentData.autoConsolationMatches = { semifinals: [], fifthPlace: null, seventhPlace: null };
                        currentData.autoPlayerColors = {};
                        currentData.autoSubTitle = '';
                        currentData.playersAutoInput = '';
                        currentData.numGroupsAuto = 4;
                        currentData.numQualifiedPlayers = 2;
                    }
                    
                    localStorage.setItem(storageKey, JSON.stringify(currentData));
                    
                    document.getElementById('playersAuto').value = '';
                    _debugLog("Cleared AUTO mode data.");
                    
                    groupPlayers = [];
                    groupResults = [];
                    groupStandings = [];
                    autoKnockoutMatches = { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
                    autoConsolationMatches = { semifinals: [], fifthPlace: null, seventhPlace: null };
                    autoPlayerColors = {};
                    autoSubTitle = '';
                    
                    clearGroupLosersData();
                    resetGlobalSettings();
                    
                    renderGroups();
                    displayBracket();
                    displayConsolationBracket();
                    updateClassification();
                    
                    if (document.getElementById('mode').value === 'auto') {
                        document.getElementById('subTitleInput').value = '';
                    }
                    
                    updateSubTitleDisplay();
                }

                if (clearManual) {
                    if (currentData) {
                        currentData.manualGroupPlayers = [];
                        currentData.manualGroupResults = [];
                        currentData.manualGroupStandings = [];
                        currentData.manualKnockoutMatches = { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
                        currentData.manualConsolationMatches = { semifinals: [], fifthPlace: null, seventhPlace: null };
                        currentData.manualPlayerColors = {};
                        currentData.manualSubTitle = '';
                        currentData.playersManualInput = '';
                        currentData.manualGroupPlayersText = [];
                        currentData.numGroupsManual = 4;
                        currentData.numQualifiedPlayersManual = 2;
                    }
                    
                    localStorage.setItem(storageKey, JSON.stringify(currentData));
                    
                    document.getElementById('playersManual').value = '';
                    localStorage.removeItem(`manualGroupsInputData_${tournamentName.toUpperCase()}`);
                    _debugLog("Cleared MANUAL mode data.");
                    
                    manualGroupPlayers = [];
                    manualGroupResults = [];
                    manualGroupStandings = [];
                    manualKnockoutMatches = { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
                    manualConsolationMatches = { semifinals: [], fifthPlace: null, seventhPlace: null };
                    manualPlayerColors = {};
                    manualSubTitle = '';
                    
                    document.getElementById('numGroupsManual').value = 4;
                    document.getElementById('numQualifiedPlayersManual').value = 2;
                    
                    const manualGroupsContainer = document.getElementById('manual-groups');
                    if (manualGroupsContainer) {
                        manualGroupsContainer.innerHTML = '';
                    }
                    
                    renderManualGroups();
                    
                    for (let i = 0; i < 4; i++) {
                        const textarea = document.getElementById(`manual-group-${i}`);
                        if (textarea) {
                            textarea.value = '';
                        }
                    }
                    
                    clearGroupLosersData();
                    resetGlobalSettings();
                    
                    if (document.getElementById('mode').value === 'manual') {
                        document.getElementById('subTitleInput').value = '';
                    }
                    
                    updateSubTitleDisplay();
                }
                
                // ===== WYCZYŚĆ LAST_* DLA WSZYSTKICH TRYBÓW (poza clearAll które już czyści wszystko) =====
                if (!clearAll && (clearAuto || clearManual)) {
                    localStorage.removeItem('LAST_OPEN_CATEGORY');
                    localStorage.removeItem('LAST_TOURNAMENT_NAME');
                    _debugLog("Cleared LAST_OPEN_CATEGORY and LAST_TOURNAMENT_NAME");
                }

                localStorage.setItem(storageKey, JSON.stringify(currentData));

                renderGroups();
                displayBracket();
                displayConsolationBracket();
                updateClassification();

                const successMessages = [];
                if (clearAuto) successMessages.push(currentLanguage === 'pl' ? "Automatyczny" : "Automatic");
                if (clearManual) successMessages.push(currentLanguage === 'pl' ? "Ręczny" : "Manual");

                alert(t('dataCleared') + successMessages.join(` ${t('and')} `));

            } catch (e) {
                console.error(`Error during selective clearing:`, e);
                alert(t('clearError'));
            }
        };

        return;
    }
}

function makeDraggable(element) {
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;
    
    // Funkcja rozpoczynająca przeciąganie
    const startDrag = (clientX, clientY) => {
        isDragging = true;
        startX = clientX - element.offsetLeft;
        startY = clientY - element.offsetTop;
        scrollLeft = element.scrollLeft;
        scrollTop = element.scrollTop;
        element.style.cursor = 'grabbing';
    };
    
    // Funkcja kończąca przeciąganie
    const endDrag = () => {
        isDragging = false;
        element.style.cursor = 'grab';
    };
    
    // Funkcja przesuwająca
    const moveDrag = (clientX, clientY) => {
        if (!isDragging) return;
        const x = clientX - element.offsetLeft;
        const y = clientY - element.offsetTop;
        const walkX = (x - startX) * 1.5;
        const walkY = (y - startY) * 1.5;
        element.scrollLeft = scrollLeft - walkX;
        element.scrollTop = scrollTop - walkY;
    };
    
    // ===== OBSŁUGA MYSZKI =====
    element.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('.score-input')) {
            return;
        }
        startDrag(e.pageX, e.pageY);
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        moveDrag(e.pageX, e.pageY);
    });
    
    document.addEventListener('mouseup', () => {
        endDrag();
    });
    
    // ===== OBSŁUGA DOTYKU (TELEFONY) =====
    element.addEventListener('touchstart', (e) => {
        // Nie blokujemy inputów, ale pozwalamy na przeciąganie gdy touch startuje poza inputem
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('.score-input')) {
            return;
        }
        const touch = e.touches[0];
        startDrag(touch.pageX, touch.pageY);
        e.preventDefault();
    });
    
    element.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        moveDrag(touch.pageX, touch.pageY);
        e.preventDefault();
    });
    
    element.addEventListener('touchend', () => {
        endDrag();
    });
    
    element.style.cursor = 'grab';
    element.style.touchAction = 'none'; // Zapobiega domyślnemu przewijaniu strony
}

function resetTournamentUI() {
    groupPlayers = [];
    groupResults = [];
    groupStandings = [];
    manualGroupPlayers = [];
    manualGroupResults = [];
    manualGroupStandings = [];
    autoKnockoutMatches = { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
    manualKnockoutMatches = { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
    autoConsolationMatches = { semifinals: [], fifthPlace: null, seventhPlace: null };
    manualConsolationMatches = { semifinals: [], fifthPlace: null, seventhPlace: null };
    autoPlayerColors = {};
    manualPlayerColors = {};
    autoSubTitle = '';
    manualSubTitle = '';
    activeGroupView = 'table';

    groupLosersKnockoutMatches = { round16: [], quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
    groupLosersConsolationMatches = { semifinals: [], fifthPlace: null, seventhPlace: null };
    groupLosersPlayerColors = {};
    groupLosersPlayers = [];
    groupLosersTournamentMode = 'no';
    groupLosersConsolationMode = 'no';
    groupLosersKnockoutSize = 8;

    document.getElementById('playersAuto').value = '';
    document.getElementById('playersManual').value = '';
    document.getElementById('tournamentNameInput').value = '';
    document.getElementById('subTitleInput').value = '';
    document.getElementById('numGroupsAuto').value = 4;
    document.getElementById('numQualifiedPlayers').value = 2;
    document.getElementById('numGroupsManual').value = 4;
    document.getElementById('numQualifiedPlayersManual').value = 2;
    document.getElementById('numQualifiedToGroupLosers').value = 2;
    document.getElementById('currentRound').value = 1;
    document.getElementById('totalRounds').value = 4;
    
    setModeUI('manual');
    setTournamentMode('single');
    setKnockoutSize(8);
    setConsolationMode('no');
    setGroupLosersTournamentMode('no');
    setGroupLosersKnockoutSize(8);
    setGroupLosersConsolationMode('no');

    const manualGroupsContainer = document.getElementById('manual-groups');
    if (manualGroupsContainer) {
        manualGroupsContainer.innerHTML = '';
    }
    renderManualGroups();
    
    for (let i = 0; i < 4; i++) {
        const textarea = document.getElementById(`manual-group-${i}`);
        if (textarea) {
            textarea.value = '';
        }
    }

    renderManualGroups();
    document.getElementById('groups-container').innerHTML = '';
    document.getElementById('knockout-bracket').innerHTML = '';
    document.getElementById('consolation-bracket').innerHTML = '';
    document.getElementById('groupLosers-bracket').innerHTML = '';
    document.getElementById('groupLosers-consolation-bracket').innerHTML = '';

    for (let i = 1; i <= 8; i++) {
        const box = document.getElementById(`classification-place-${i}`);
        if (box) {
            const span = box.querySelector('.player-name');
            if (span) span.textContent = '?';
            box.className = 'classification-box';
            if (i >= 5 && i <= 8) {
                box.style.display = 'none';
            } else {
                box.style.display = '';
            }
        }
    }

    document.querySelectorAll('.score-input').forEach(input => input.disabled = false);
    toggleConsolationVisibility();
    updateTournamentTitle();
    updateSubTitleDisplay();
}
function getTournamentHeader() {
    const tournamentName = document.getElementById('tournamentNameInput').value.trim() || t('tournamentName');
    const category = document.getElementById('subTitleInput').value.trim() || '';
    const groupMode = document.getElementById('mode').value === 'auto' ? 'Automatyczny' : 'Ręczny';
    const tournamentMode = document.getElementById('tournamentMode').value;
    const tournamentModeText = tournamentMode === 'league' ? 'Ligowy' : 'Pojedynczy';
    const knockoutSize = parseInt(document.getElementById('knockoutSize')?.value || 8);
    const knockoutSizeText = knockoutSize === 16 ? '1/16 finału (16)' : 'Ćwierćfinały (8)';
    
    let header = `--- ${t('tournamentResults')}: ${tournamentName} ---\n`;
    if (category) header += `Kategoria: ${category}\n`;
    header += `Tryb podziału na grupy: ${groupMode}\n`;
    header += `Tryb turnieju: ${tournamentModeText}\n`;
    header += `Faza pucharowa: ${knockoutSizeText}\n`;
    
    // Turniej Pocieszenia
    const consolationMode = document.getElementById('consolationMode').value;
    header += `Turniej Pocieszenia: ${consolationMode === 'yes' ? 'Tak' : 'Nie'}\n`;
    
    // Turniej dla przegranych z grup
    header += `Turniej dla przegranych z grup: ${groupLosersTournamentMode === 'yes' ? 'Tak' : 'Nie'}\n`;
    
    if (groupLosersTournamentMode === 'yes') {
        // Faza pucharowa (przegrani z grup)
        const glKnockoutSize = groupLosersKnockoutSize || 8;
        const glKnockoutText = glKnockoutSize === 16 ? '1/16 finału (16)' : 'Ćwierćfinały (8)';
        header += `Faza pucharowa (przegrani z grup): ${glKnockoutText}\n`;
        
        // Turniej pocieszenia (przegrani z grup)
        header += `Turniej pocieszenia (przegrani z grup): ${groupLosersConsolationMode === 'yes' ? 'Tak' : 'Nie'}\n`;
        
        // Awans do turnieju dla przegranych z grupy
        const numQualifiedToGL = document.getElementById('numQualifiedToGroupLosers')?.value || 2;
        header += `Awans do turnieju dla przegranych z grupy: ${numQualifiedToGL}\n`;
    }
    
    if (tournamentMode === 'league') {
        const currentRound = document.getElementById('currentRound')?.value || '1';
        const totalRounds = document.getElementById('totalRounds')?.value || '?';
        header += `Runda: ${currentRound} z ${totalRounds}\n`;
    }
    
    header += `Data eksportu: ${new Date().toLocaleString()}\n`;
    header += `\n`;
    
    return header;
}

function exportResultsToText() {
    _debugLog("Exporting results to text...");

    const currentLang = currentLanguage;
    const isAutoMode = document.getElementById('mode').value === 'auto';
    const autoText = currentLang === 'pl' ? 'Automatyczny' : 'Automatic';
    const manualText = currentLang === 'pl' ? 'Ręczny' : 'Manual';
    const currentModeText = isAutoMode ? autoText : manualText;

    const selectExportModeText = currentLang === 'pl' ? translations.pl.selectExportMode : translations.en.selectExportMode;
    const currentModeLabel = currentLang === 'pl' ? translations.pl.currentMode : translations.en.currentMode;
    const bothModesText = currentLang === 'pl' ? translations.pl.bothModes : translations.en.bothModes;
    const exportText = currentLang === 'pl' ? translations.pl.export : translations.en.export;
    const cancelText = currentLang === 'pl' ? translations.pl.cancel : translations.en.cancel;
    const selectModeText = currentLang === 'pl' ? translations.pl.selectMode : translations.en.selectMode;

    const dialogHtml = `
        <div id="exportDialog" class="modal-overlay">
            <div class="modal-box">
                <h3 class="modal-title">${selectExportModeText}</h3>
                <div class="modal-body-spacing">
                    <label class="modal-label-block">
                        <input type="radio" name="exportMode" value="current" checked class="modal-checkbox">
                        <strong>${currentModeLabel}</strong> (${currentModeText})
                    </label>
                    <label class="modal-label-block">
                        <input type="radio" name="exportMode" value="auto" class="modal-checkbox">
                        ${currentLang === 'pl' ? 'Tryb' : 'Mode'} <strong>${autoText}</strong>
                    </label>
                    <label class="modal-label-block">
                        <input type="radio" name="exportMode" value="manual" class="modal-checkbox">
                        ${currentLang === 'pl' ? 'Tryb' : 'Mode'} <strong>${manualText}</strong>
                    </label>
                    <label class="modal-label-block">
                        <input type="radio" name="exportMode" value="both" class="modal-checkbox">
                        <strong>${bothModesText}</strong> ${currentLang === 'pl' ? '(jeden plik)' : '(one file)'}
                    </label>
                </div>
                <div class="modal-actions-between">
                    <button onclick="document.getElementById('exportDialog').remove()" class="btn-modal-cancel">${cancelText}</button>
                    <button onclick="processExportSelection()" class="btn-modal-primary">${exportText}</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', dialogHtml);

    window.processExportSelection = function() {
        const selectedMode = document.querySelector('input[name="exportMode"]:checked')?.value;

        document.getElementById('exportDialog')?.remove();

        if (!selectedMode) {
            alert(selectModeText);
            return;
        }

        performExport(selectedMode);
    };
}

function performExport(exportMode) {
    let textOutput = [];
    
    textOutput.push(getTournamentHeader());
    
    const tournamentName = document.getElementById('tournamentNameInput').value.trim() || t('tournamentName');
    const category = document.getElementById('subTitleInput').value.trim() || '';
    const consolationMode = document.getElementById('consolationMode').value;
    const groupLosersMode = groupLosersTournamentMode;

    const getExportData = (mode) => {
        const currentSubTitle = mode === 'manual' ? manualSubTitle : autoSubTitle;
        const currentGroupPlayers = mode === 'manual' ? manualGroupPlayers : groupPlayers;
        const currentGroupStandings = mode === 'manual' ? manualGroupStandings : groupStandings;
        const currentKnockoutMatches = mode === 'manual' ? manualKnockoutMatches : autoKnockoutMatches;
        const currentConsolationMatches = mode === 'manual' ? manualConsolationMatches : autoConsolationMatches;

        return {
            currentSubTitle,
            currentGroupPlayers,
            currentGroupStandings,
            currentKnockoutMatches,
            currentConsolationMatches,
            modeName: mode === 'auto' ? t('autoMode') : t('manualMode')
        };
    };

    const formatMatch = (match, prefix = "") => {
        if (match && match.player1 && match.player2 && match.player1 !== "WOLNY LOS" && match.player2 !== "WOLNY LOS") {
            const score1 = match.score1 || '?';
            const score2 = match.score2 || '?';
            const winner = match.winner ? ` [${t('winner')}: ${match.winner}]` : '';
            return `${prefix}${match.player1} ${score1}:${score2} ${match.player2}${winner}`;
        }
        return null;
    };
    
    const formatGroupLosersMatch = (match, prefix = "") => {
        if (match && match.player1 && match.player2 && match.player1 !== "WOLNY LOS" && match.player2 !== "WOLNY LOS") {
            const score1 = match.score1 || '?';
            const score2 = match.score2 || '?';
            const winner = match.winner ? ` [${t('winner')}: ${match.winner}]` : '';
            return `${prefix}${match.player1} ${score1}:${score2} ${match.player2}${winner}`;
        }
        return null;
    };
    
    // ========== LOGIKA EKSPORTU ==========
    if (exportMode === 'both') {
        textOutput.push(`=== ${t('bothModes')} ===`);
        textOutput.push('');
        
        // AUTO MODE
        const autoData = getExportData('auto');
        const hasAutoData = autoData.currentGroupPlayers && 
                           autoData.currentGroupPlayers.length > 0 && 
                           autoData.currentGroupPlayers.some(g => g && g.length > 0);
        
        if (hasAutoData) {
            textOutput.push(`==== ${t('autoMode')} ====`);
            if (autoData.currentSubTitle) {
                textOutput.push(`${t('category')}: ${autoData.currentSubTitle}`);
                textOutput.push('');
            }
            
            textOutput.push(`=== ${t('groupStage')} ===`);
            autoData.currentGroupStandings.forEach((standings, groupIndex) => {
                if (standings && standings.length > 0) {
                    textOutput.push(`\n${t('group')} ${groupIndex + 1}:`);
                    standings.forEach((stat, placeIndex) => {
                        if (stat && autoData.currentGroupPlayers[groupIndex]) {
                            const player = autoData.currentGroupPlayers[groupIndex][stat.playerIndex];
                            const setsInfo = `${stat.setsWon}:${stat.setsLost}`;
                            const qualified = placeIndex < parseInt(document.getElementById('numQualifiedPlayers').value) ? ` (${t('qualified')})` : "";
                            textOutput.push(`${placeIndex + 1}. ${player} - ${t('points')}: ${stat.points}, ${t('sets')}: ${setsInfo}${qualified}`);
                        }
                    });
                }
            });
            textOutput.push('');
            
            // === FAZA PUCHAROWA ===
            if (autoData.currentKnockoutMatches) {
                if (autoData.currentKnockoutMatches.round16 && autoData.currentKnockoutMatches.round16.length > 0 && 
                    autoData.currentKnockoutMatches.round16.some(m => m.player1)) {
                    textOutput.push(`=== ${t('knockoutStage')} ===`);
                    textOutput.push(`\n1/16 finału:`);
                    autoData.currentKnockoutMatches.round16.forEach(m => {
                        const formatted = formatMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                if (autoData.currentKnockoutMatches.quarterfinals && autoData.currentKnockoutMatches.quarterfinals.some(m => m.player1)) {
                    if (!textOutput.includes(`=== ${t('knockoutStage')} ===`)) {
                        textOutput.push(`=== ${t('knockoutStage')} ===`);
                    }
                    textOutput.push(`\n${t('quarterfinals')}:`);
                    autoData.currentKnockoutMatches.quarterfinals.forEach(m => {
                        const formatted = formatMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                if (autoData.currentKnockoutMatches.semifinals && autoData.currentKnockoutMatches.semifinals.some(m => m.player1)) {
                    textOutput.push(`\n${t('semifinals')}:`);
                    autoData.currentKnockoutMatches.semifinals.forEach(m => {
                        const formatted = formatMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                const thirdPlaceMatch = formatMatch(autoData.currentKnockoutMatches.thirdPlace, `${t('thirdPlace')}: `);
                if (thirdPlaceMatch) textOutput.push(`\n${thirdPlaceMatch}`);
                
                const finalMatch = formatMatch(autoData.currentKnockoutMatches.final, `${t('final')}: `);
                if (finalMatch) textOutput.push(`\n${finalMatch}`);
                textOutput.push('');
            }
            
            // === TURNIEJ POCIESZENIA ===
            if (consolationMode === 'yes' && autoData.currentConsolationMatches) {
                textOutput.push(`=== ${t('consolationTournament')} ===`);
                
                if (autoData.currentConsolationMatches.quarterfinals && autoData.currentConsolationMatches.quarterfinals.length > 0 &&
                    autoData.currentConsolationMatches.quarterfinals.some(m => m.player1)) {
                    textOutput.push(`\nĆwierćfinały pocieszenia:`);
                    autoData.currentConsolationMatches.quarterfinals.forEach(m => {
                        const formatted = formatMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                if (autoData.currentConsolationMatches.semifinals && autoData.currentConsolationMatches.semifinals.length > 0 &&
                    autoData.currentConsolationMatches.semifinals.some(m => m.player1)) {
                    textOutput.push(`\nPółfinały pocieszenia:`);
                    autoData.currentConsolationMatches.semifinals.forEach(m => {
                        const formatted = formatMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                if (autoData.currentConsolationMatches.eleventh && autoData.currentConsolationMatches.eleventh.player1) {
                    const formatted = formatMatch(autoData.currentConsolationMatches.eleventh, `Mecz o 11. miejsce: `);
                    if (formatted) textOutput.push(`\n${formatted}`);
                }
                
                if (autoData.currentConsolationMatches.final && autoData.currentConsolationMatches.final.player1) {
                    const formatted = formatMatch(autoData.currentConsolationMatches.final, `Mecz o 9. miejsce: `);
                    if (formatted) textOutput.push(`\n${formatted}`);
                }
                textOutput.push('');
            }
            
            // === TURNIEJ DLA PRZEGRANYCH Z GRUP ===
            if (groupLosersMode === 'yes') {
                textOutput.push(`=== Turniej dla przegranych z grup ===`);
                
                if (groupLosersKnockoutMatches.round16 && groupLosersKnockoutMatches.round16.length > 0 &&
                    groupLosersKnockoutMatches.round16.some(m => m.player1)) {
                    textOutput.push(`\n1/16 finału (przegrani z grup):`);
                    groupLosersKnockoutMatches.round16.forEach(m => {
                        const formatted = formatGroupLosersMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                if (groupLosersKnockoutMatches.quarterfinals && groupLosersKnockoutMatches.quarterfinals.some(m => m.player1)) {
                    textOutput.push(`\nĆwierćfinały:`);
                    groupLosersKnockoutMatches.quarterfinals.forEach(m => {
                        const formatted = formatGroupLosersMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                if (groupLosersKnockoutMatches.semifinals && groupLosersKnockoutMatches.semifinals.some(m => m.player1)) {
                    textOutput.push(`\nPółfinały (mecze o miejsca 21-24):`);
                    groupLosersKnockoutMatches.semifinals.forEach(m => {
                        const formatted = formatGroupLosersMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                const glThirdPlaceMatch = formatGroupLosersMatch(groupLosersKnockoutMatches.thirdPlace, `Mecz o 19. miejsce: `);
                if (glThirdPlaceMatch) textOutput.push(`\n${glThirdPlaceMatch}`);
                
                const glFinalMatch = formatGroupLosersMatch(groupLosersKnockoutMatches.final, `Finał (mecz o 17. miejsce): `);
                if (glFinalMatch) textOutput.push(`\n${glFinalMatch}`);
                textOutput.push('');
                
                // Turniej pocieszenia dla przegranych z nowego turnieju
                if (groupLosersConsolationMatches.semifinals && groupLosersConsolationMatches.semifinals.length > 0 &&
                    groupLosersConsolationMatches.semifinals.some(m => m.player1)) {
                    textOutput.push(`=== Turniej pocieszenia (przegrani z turnieju dla przegranych) ===`);
                    textOutput.push(`\nPółfinały pocieszenia (mecze o miejsca 29-30):`);
                    groupLosersConsolationMatches.semifinals.forEach(m => {
                        const formatted = formatGroupLosersMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                    
                    if (groupLosersConsolationMatches.eleventh && groupLosersConsolationMatches.eleventh.player1) {
                        const formatted = formatGroupLosersMatch(groupLosersConsolationMatches.eleventh, `Mecz o 27. miejsce: `);
                        if (formatted) textOutput.push(`\n${formatted}`);
                    }
                    
                    if (groupLosersConsolationMatches.final && groupLosersConsolationMatches.final.player1) {
                        const formatted = formatGroupLosersMatch(groupLosersConsolationMatches.final, `Mecz o 25. miejsce: `);
                        if (formatted) textOutput.push(`\n${formatted}`);
                    }
                    textOutput.push('');
                }
            }
            
            // === KLASYFIKACJA KOŃCOWA ===
            textOutput.push(`=== ${t('finalClassification')} (${t('autoMode')}) ===`);
            const { classification: autoClassification } = getFinalClassification(autoData.currentKnockoutMatches, 
                                                             autoData.currentConsolationMatches, 
                                                             consolationMode === 'yes');
            let maxPlacesAuto = (autoData.currentKnockoutMatches.round16 && autoData.currentKnockoutMatches.round16.length > 0) ? 16 : 8;
            
            // Dodaj klasyfikację z turnieju dla przegranych z grup
            if (groupLosersMode === 'yes') {
                maxPlacesAuto = 32;
                const glClassification = getGroupLosersFinalClassification();
                for (let place = 1; place <= 16; place++) {
                    if (glClassification[place]) {
                        autoClassification[16 + place] = glClassification[place];
                    }
                }
            }
            
            // Kompresja BYE - usuń luki w numeracji
            let displayRankAuto = 1;
            for (let i = 1; i <= maxPlacesAuto; i++) {
                const player = autoClassification[i];
                if (player && player !== "WOLNY LOS" && player !== '?' && player !== '—' && player !== null) {
                    textOutput.push(`${displayRankAuto}. ${player}`);
                    displayRankAuto++;
                }
            }
            textOutput.push('\n' + '='.repeat(40) + '\n');
        }
        
        // MANUAL MODE
        const manualData = getExportData('manual');
        const hasManualData = manualData.currentGroupPlayers && 
                             manualData.currentGroupPlayers.length > 0 && 
                             manualData.currentGroupPlayers.some(g => g && g.length > 0);
        
        if (hasManualData) {
            textOutput.push(`==== ${t('manualMode')} ====`);
            if (manualData.currentSubTitle) {
                textOutput.push(`${t('category')}: ${manualData.currentSubTitle}`);
                textOutput.push('');
            }
            
            textOutput.push(`=== ${t('groupStage')} ===`);
            manualData.currentGroupStandings.forEach((standings, groupIndex) => {
                if (standings && standings.length > 0) {
                    textOutput.push(`\n${t('group')} ${groupIndex + 1}:`);
                    standings.forEach((stat, placeIndex) => {
                        if (stat && manualData.currentGroupPlayers[groupIndex]) {
                            const player = manualData.currentGroupPlayers[groupIndex][stat.playerIndex];
                            const setsInfo = `${stat.setsWon}:${stat.setsLost}`;
                            const qualified = placeIndex < parseInt(document.getElementById('numQualifiedPlayersManual').value) ? ` (${t('qualified')})` : "";
                            textOutput.push(`${placeIndex + 1}. ${player} - ${t('points')}: ${stat.points}, ${t('sets')}: ${setsInfo}${qualified}`);
                        }
                    });
                }
            });
            textOutput.push('');
            
            // FAZA PUCHAROWA (MANUAL)
            if (manualData.currentKnockoutMatches) {
                if (manualData.currentKnockoutMatches.round16 && manualData.currentKnockoutMatches.round16.length > 0 && 
                    manualData.currentKnockoutMatches.round16.some(m => m.player1)) {
                    textOutput.push(`=== ${t('knockoutStage')} ===`);
                    textOutput.push(`\n1/16 finału:`);
                    manualData.currentKnockoutMatches.round16.forEach(m => {
                        const formatted = formatMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                if (manualData.currentKnockoutMatches.quarterfinals && manualData.currentKnockoutMatches.quarterfinals.some(m => m.player1)) {
                    if (!textOutput.includes(`=== ${t('knockoutStage')} ===`)) {
                        textOutput.push(`=== ${t('knockoutStage')} ===`);
                    }
                    textOutput.push(`\n${t('quarterfinals')}:`);
                    manualData.currentKnockoutMatches.quarterfinals.forEach(m => {
                        const formatted = formatMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                if (manualData.currentKnockoutMatches.semifinals && manualData.currentKnockoutMatches.semifinals.some(m => m.player1)) {
                    textOutput.push(`\n${t('semifinals')}:`);
                    manualData.currentKnockoutMatches.semifinals.forEach(m => {
                        const formatted = formatMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                const thirdPlaceMatchManual = formatMatch(manualData.currentKnockoutMatches.thirdPlace, `${t('thirdPlace')}: `);
                if (thirdPlaceMatchManual) textOutput.push(`\n${thirdPlaceMatchManual}`);
                
                const finalMatchManual = formatMatch(manualData.currentKnockoutMatches.final, `${t('final')}: `);
                if (finalMatchManual) textOutput.push(`\n${finalMatchManual}`);
                textOutput.push('');
            }
            
            // TURNIEJ POCIESZENIA (MANUAL)
            if (consolationMode === 'yes' && manualData.currentConsolationMatches) {
                textOutput.push(`=== ${t('consolationTournament')} ===`);
                
                if (manualData.currentConsolationMatches.quarterfinals && manualData.currentConsolationMatches.quarterfinals.length > 0 &&
                    manualData.currentConsolationMatches.quarterfinals.some(m => m.player1)) {
                    textOutput.push(`\nĆwierćfinały pocieszenia:`);
                    manualData.currentConsolationMatches.quarterfinals.forEach(m => {
                        const formatted = formatMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                if (manualData.currentConsolationMatches.semifinals && manualData.currentConsolationMatches.semifinals.length > 0 &&
                    manualData.currentConsolationMatches.semifinals.some(m => m.player1)) {
                    textOutput.push(`\nPółfinały pocieszenia:`);
                    manualData.currentConsolationMatches.semifinals.forEach(m => {
                        const formatted = formatMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                if (manualData.currentConsolationMatches.eleventh && manualData.currentConsolationMatches.eleventh.player1) {
                    const formatted = formatMatch(manualData.currentConsolationMatches.eleventh, `Mecz o 11. miejsce: `);
                    if (formatted) textOutput.push(`\n${formatted}`);
                }
                
                if (manualData.currentConsolationMatches.final && manualData.currentConsolationMatches.final.player1) {
                    const formatted = formatMatch(manualData.currentConsolationMatches.final, `Mecz o 9. miejsce: `);
                    if (formatted) textOutput.push(`\n${formatted}`);
                }
                textOutput.push('');
            }
            
            // TURNIEJ DLA PRZEGRANYCH Z GRUP (MANUAL)
            if (groupLosersMode === 'yes') {
                textOutput.push(`=== Turniej dla przegranych z grup ===`);
                
                if (groupLosersKnockoutMatches.round16 && groupLosersKnockoutMatches.round16.length > 0 &&
                    groupLosersKnockoutMatches.round16.some(m => m.player1)) {
                    textOutput.push(`\n1/16 finału (przegrani z grup):`);
                    groupLosersKnockoutMatches.round16.forEach(m => {
                        const formatted = formatGroupLosersMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                if (groupLosersKnockoutMatches.quarterfinals && groupLosersKnockoutMatches.quarterfinals.some(m => m.player1)) {
                    textOutput.push(`\nĆwierćfinały:`);
                    groupLosersKnockoutMatches.quarterfinals.forEach(m => {
                        const formatted = formatGroupLosersMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                if (groupLosersKnockoutMatches.semifinals && groupLosersKnockoutMatches.semifinals.some(m => m.player1)) {
                    textOutput.push(`\nPółfinały (mecze o miejsca 21-24):`);
                    groupLosersKnockoutMatches.semifinals.forEach(m => {
                        const formatted = formatGroupLosersMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                }
                
                const glThirdPlaceMatch = formatGroupLosersMatch(groupLosersKnockoutMatches.thirdPlace, `Mecz o 19. miejsce: `);
                if (glThirdPlaceMatch) textOutput.push(`\n${glThirdPlaceMatch}`);
                
                const glFinalMatch = formatGroupLosersMatch(groupLosersKnockoutMatches.final, `Finał (mecz o 17. miejsce): `);
                if (glFinalMatch) textOutput.push(`\n${glFinalMatch}`);
                textOutput.push('');
                
                if (groupLosersConsolationMatches.semifinals && groupLosersConsolationMatches.semifinals.length > 0 &&
                    groupLosersConsolationMatches.semifinals.some(m => m.player1)) {
                    textOutput.push(`=== Turniej pocieszenia (przegrani z turnieju dla przegranych) ===`);
                    textOutput.push(`\nPółfinały pocieszenia (mecze o miejsca 29-30):`);
                    groupLosersConsolationMatches.semifinals.forEach(m => {
                        const formatted = formatGroupLosersMatch(m, "  ");
                        if (formatted) textOutput.push(formatted);
                    });
                    
                    if (groupLosersConsolationMatches.eleventh && groupLosersConsolationMatches.eleventh.player1) {
                        const formatted = formatGroupLosersMatch(groupLosersConsolationMatches.eleventh, `Mecz o 27. miejsce: `);
                        if (formatted) textOutput.push(`\n${formatted}`);
                    }
                    
                    if (groupLosersConsolationMatches.final && groupLosersConsolationMatches.final.player1) {
                        const formatted = formatGroupLosersMatch(groupLosersConsolationMatches.final, `Mecz o 25. miejsce: `);
                        if (formatted) textOutput.push(`\n${formatted}`);
                    }
                    textOutput.push('');
                }
            }
            
            textOutput.push(`=== ${t('finalClassification')} (${t('manualMode')}) ===`);
            const { classification: manualClassification } = getFinalClassification(manualData.currentKnockoutMatches, 
                                                               manualData.currentConsolationMatches, 
                                                               consolationMode === 'yes');
            let maxPlacesManual = (manualData.currentKnockoutMatches.round16 && manualData.currentKnockoutMatches.round16.length > 0) ? 16 : 8;
            
            if (groupLosersMode === 'yes') {
                maxPlacesManual = 32;
                const glClassification = getGroupLosersFinalClassification();
                for (let place = 1; place <= 16; place++) {
                    if (glClassification[place]) {
                        manualClassification[16 + place] = glClassification[place];
                    }
                }
            }
            
            // Kompresja BYE - usuń luki w numeracji
            let displayRankManual = 1;
            for (let i = 1; i <= maxPlacesManual; i++) {
                const player = manualClassification[i];
                if (player && player !== "WOLNY LOS" && player !== '?' && player !== '—' && player !== null) {
                    textOutput.push(`${displayRankManual}. ${player}`);
                    displayRankManual++;
                }
            }
        }
        
    } else {
        // ===== POJEDYNCZY TRYB =====
        const targetMode = exportMode === 'current' ? document.getElementById('mode').value : exportMode;
        const data = getExportData(targetMode);
        let maxPlaces = (data.currentKnockoutMatches.round16 && data.currentKnockoutMatches.round16.length > 0) ? 16 : 8;

        if (data.currentGroupPlayers && data.currentGroupPlayers.length > 0 && data.currentGroupPlayers.some(g => g && g.length > 0)) {
            textOutput.push(`=== ${t('groupStage')} ===`);
            data.currentGroupStandings.forEach((standings, groupIndex) => {
                if (standings && standings.length > 0) {
                    textOutput.push(`\n${t('group')} ${groupIndex + 1}:`);
                    standings.forEach((stat, placeIndex) => {
                        if (stat && data.currentGroupPlayers[groupIndex]) {
                            const player = data.currentGroupPlayers[groupIndex][stat.playerIndex];
                            const setsInfo = `${stat.setsWon}:${stat.setsLost}`;
                            const qualified = placeIndex < parseInt(document.getElementById(targetMode === 'manual' ? 'numQualifiedPlayersManual' : 'numQualifiedPlayers').value) ? ` (${t('qualified')})` : "";
                            textOutput.push(`${placeIndex + 1}. ${player} - ${t('points')}: ${stat.points}, ${t('sets')}: ${setsInfo}${qualified}`);
                        }
                    });
                }
            });
            textOutput.push('');
        }

        if (data.currentKnockoutMatches) {
            textOutput.push(`=== ${t('knockoutStage')} ===`);
            
            if (data.currentKnockoutMatches.round16 && data.currentKnockoutMatches.round16.length > 0 && 
                data.currentKnockoutMatches.round16.some(m => m.player1)) {
                textOutput.push(`\n1/16 finału:`);
                data.currentKnockoutMatches.round16.forEach(m => {
                    const formatted = formatMatch(m, "  ");
                    if (formatted) textOutput.push(formatted);
                });
            }
            
            if (data.currentKnockoutMatches.quarterfinals && data.currentKnockoutMatches.quarterfinals.some(m => m.player1)) {
                textOutput.push(`\n${t('quarterfinals')}:`);
                data.currentKnockoutMatches.quarterfinals.forEach(m => {
                    const formatted = formatMatch(m, "  ");
                    if (formatted) textOutput.push(formatted);
                });
            }

            if (data.currentKnockoutMatches.semifinals && data.currentKnockoutMatches.semifinals.some(m => m.player1)) {
                textOutput.push(`\n${t('semifinals')}:`);
                data.currentKnockoutMatches.semifinals.forEach(m => {
                    const formatted = formatMatch(m, "  ");
                    if (formatted) textOutput.push(formatted);
                });
            }

            const thirdPlaceMatch = formatMatch(data.currentKnockoutMatches.thirdPlace, `${t('thirdPlace')}: `);
            if (thirdPlaceMatch) textOutput.push(`\n${thirdPlaceMatch}`);

            const finalMatch = formatMatch(data.currentKnockoutMatches.final, `${t('final')}: `);
            if (finalMatch) textOutput.push(`\n${finalMatch}`);
            textOutput.push('');
        }

        if (consolationMode === 'yes' && data.currentConsolationMatches) {
            textOutput.push(`=== ${t('consolationTournament')} ===`);
            
            if (data.currentConsolationMatches.quarterfinals && data.currentConsolationMatches.quarterfinals.length > 0 &&
                data.currentConsolationMatches.quarterfinals.some(m => m.player1)) {
                textOutput.push(`\nĆwierćfinały pocieszenia:`);
                data.currentConsolationMatches.quarterfinals.forEach(m => {
                    const formatted = formatMatch(m, "  ");
                    if (formatted) textOutput.push(formatted);
                });
            }
            
            if (data.currentConsolationMatches.semifinals && data.currentConsolationMatches.semifinals.length > 0 &&
                data.currentConsolationMatches.semifinals.some(m => m.player1)) {
                textOutput.push(`\nPółfinały pocieszenia:`);
                data.currentConsolationMatches.semifinals.forEach(m => {
                    const formatted = formatMatch(m, "  ");
                    if (formatted) textOutput.push(formatted);
                });
            }
            
            if (data.currentConsolationMatches.eleventh && data.currentConsolationMatches.eleventh.player1) {
                const formatted = formatMatch(data.currentConsolationMatches.eleventh, `Mecz o 11. miejsce: `);
                if (formatted) textOutput.push(`\n${formatted}`);
            }
            
            if (data.currentConsolationMatches.final && data.currentConsolationMatches.final.player1) {
                const formatted = formatMatch(data.currentConsolationMatches.final, `Mecz o 9. miejsce: `);
                if (formatted) textOutput.push(`\n${formatted}`);
            }
            textOutput.push('');
        }
        
        // === TURNIEJ DLA PRZEGRANYCH Z GRUP ===
        if (groupLosersMode === 'yes') {
            textOutput.push(`=== Turniej dla przegranych z grup ===`);
            
            if (groupLosersKnockoutMatches.round16 && groupLosersKnockoutMatches.round16.length > 0 &&
                groupLosersKnockoutMatches.round16.some(m => m.player1)) {
                textOutput.push(`\n1/16 finału (przegrani z grup):`);
                groupLosersKnockoutMatches.round16.forEach(m => {
                    const formatted = formatGroupLosersMatch(m, "  ");
                    if (formatted) textOutput.push(formatted);
                });
            }
            
            if (groupLosersKnockoutMatches.quarterfinals && groupLosersKnockoutMatches.quarterfinals.some(m => m.player1)) {
                textOutput.push(`\nĆwierćfinały:`);
                groupLosersKnockoutMatches.quarterfinals.forEach(m => {
                    const formatted = formatGroupLosersMatch(m, "  ");
                    if (formatted) textOutput.push(formatted);
                });
            }
            
            if (groupLosersKnockoutMatches.semifinals && groupLosersKnockoutMatches.semifinals.some(m => m.player1)) {
                textOutput.push(`\nPółfinały (mecze o miejsca 21-24):`);
                groupLosersKnockoutMatches.semifinals.forEach(m => {
                    const formatted = formatGroupLosersMatch(m, "  ");
                    if (formatted) textOutput.push(formatted);
                });
            }
            
            const glThirdPlaceMatch = formatGroupLosersMatch(groupLosersKnockoutMatches.thirdPlace, `Mecz o 19. miejsce: `);
            if (glThirdPlaceMatch) textOutput.push(`\n${glThirdPlaceMatch}`);
            
            const glFinalMatch = formatGroupLosersMatch(groupLosersKnockoutMatches.final, `Finał (mecz o 17. miejsce): `);
            if (glFinalMatch) textOutput.push(`\n${glFinalMatch}`);
            textOutput.push('');
            
            if (groupLosersConsolationMatches.semifinals && groupLosersConsolationMatches.semifinals.length > 0 &&
                groupLosersConsolationMatches.semifinals.some(m => m.player1)) {
                textOutput.push(`=== Turniej pocieszenia (przegrani z turnieju dla przegranych) ===`);
                textOutput.push(`\nPółfinały pocieszenia (mecze o miejsca 29-30):`);
                groupLosersConsolationMatches.semifinals.forEach(m => {
                    const formatted = formatGroupLosersMatch(m, "  ");
                    if (formatted) textOutput.push(formatted);
                });
                
                if (groupLosersConsolationMatches.eleventh && groupLosersConsolationMatches.eleventh.player1) {
                    const formatted = formatGroupLosersMatch(groupLosersConsolationMatches.eleventh, `Mecz o 27. miejsce: `);
                    if (formatted) textOutput.push(`\n${formatted}`);
                }
                
                if (groupLosersConsolationMatches.final && groupLosersConsolationMatches.final.player1) {
                    const formatted = formatGroupLosersMatch(groupLosersConsolationMatches.final, `Mecz o 25. miejsce: `);
                    if (formatted) textOutput.push(`\n${formatted}`);
                }
                textOutput.push('');
            }
        }

        textOutput.push(`=== ${t('finalClassification')} ===`);
        const { classification } = getFinalClassification(data.currentKnockoutMatches, data.currentConsolationMatches, consolationMode === 'yes');
        
        if (groupLosersMode === 'yes') {
            maxPlaces = 32;
            const glClassification = getGroupLosersFinalClassification();
            for (let place = 1; place <= 16; place++) {
                if (glClassification[place]) {
                    classification[16 + place] = glClassification[place];
                }
            }
        }
        
        // Kompresja BYE - usuń luki w numeracji
        let displayRank = 1;
        for (let i = 1; i <= maxPlaces; i++) {
            const player = classification[i];
            if (player && player !== "WOLNY LOS" && player !== '?' && player !== '—' && player !== null) {
                textOutput.push(`${displayRank}. ${player}`);
                displayRank++;
            }
        }
    }

    const finalString = textOutput.join('\n');
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    let baseName = tournamentName.replace(/[^a-zA-Z0-9]/g, '_');
    if (category) {
        baseName += '_' + category.replace(/[^a-zA-Z0-9]/g, '_');
    }
    
    const modeSuffix = exportMode === 'both' ? 'BOTH' : 
                      (exportMode === 'current' ? document.getElementById('mode').value.toUpperCase() : exportMode.toUpperCase());
    
    const filename = `${baseName}_${modeSuffix}_${date}.txt`;

    saveToAndroidFile(finalString, filename, 'text/plain');

    if (!androidInterface) {
        alert(`${t('exportSuccess')}:\n${filename}`);
    }
}
// ===== GLOBALNA FUNKCJA: sprawdza czy mecz jest faktycznie rozegrany =====
function isMatchActuallyPlayed(match) {
    if (!match) return false;
    const s1 = (match.score1 || '').toString().trim();
    const s2 = (match.score2 || '').toString().trim();
    
    // Odrzuć puste wyniki
    if (s1 === '' || s2 === '') return false;
    
    // Odrzuć 0:0 — to nie jest prawdziwy wynik meczu
    if (s1 === '0' && s2 === '0') return false;
    
    // Sprawdź czy przynajmniej jeden wynik jest > 0
    const n1 = parseInt(s1);
    const n2 = parseInt(s2);
    if (isNaN(n1) || isNaN(n2)) return false;
    if (n1 < 0 || n2 < 0) return false;
    if (n1 === 0 && n2 === 0) return false;
    
    const hasValidWinner = match.winner && match.winner !== "WOLNY LOS" && match.winner !== null;
    const hasValidLoser = match.loser && match.loser !== "WOLNY LOS" && match.loser !== null;
    
    return hasValidWinner && hasValidLoser;
}

function getFinalClassification(knockoutMatches, consolationMatches, isConsolationActive) {
    const classification = {};
    const knockoutSize = parseInt(document.getElementById('knockoutSize')?.value || 8);

    // ===== MIEJSCA 1-4: GŁÓWNY TURNIEJ =====
    if (knockoutMatches.final && isMatchActuallyPlayed(knockoutMatches.final)) {
        classification[1] = knockoutMatches.final.winner;
        classification[2] = knockoutMatches.final.loser;
    }
    if (knockoutMatches.thirdPlace && isMatchActuallyPlayed(knockoutMatches.thirdPlace)) {
        classification[3] = knockoutMatches.thirdPlace.winner;
        classification[4] = knockoutMatches.thirdPlace.loser;
    }

    if (knockoutSize === 16) {
        // ===== MIEJSCA 5-8: PRZEGRANI Z PÓŁFINAŁÓW (tylko realni) =====
        if (knockoutMatches.semifinals && knockoutMatches.semifinals.length > 0) {
            const sfLosers = knockoutMatches.semifinals
                .filter(m => isMatchActuallyPlayed(m) && m.loser && m.loser !== "WOLNY LOS")
                .map(m => m.loser);
            for (let i = 0; i < sfLosers.length && i < 4; i++) {
                classification[5 + i] = sfLosers[i];
            }
        }

        // ===== MIEJSCA 9-12: PRZEGRANI Z ĆWIERĆFINAŁÓW (tylko realni) =====
        if (knockoutMatches.quarterfinals && knockoutMatches.quarterfinals.length > 0) {
            const qfLosers = knockoutMatches.quarterfinals
                .filter(m => isMatchActuallyPlayed(m) && m.loser && m.loser !== "WOLNY LOS")
                .map(m => m.loser);
            for (let i = 0; i < qfLosers.length && i < 4; i++) {
                // Znajdź pierwsze wolne miejsce od 9
                let place = 9 + i;
                while (classification[place] && place < 13) place++;
                if (place < 13) classification[place] = qfLosers[i];
            }
        }

        // ===== MIEJSCA 13-16: PRZEGRANI Z 1/16 (tylko realni!) =====
        if (knockoutMatches.round16 && knockoutMatches.round16.length > 0) {
            const r16Losers = knockoutMatches.round16
                .filter(m => isMatchActuallyPlayed(m) && m.loser && m.loser !== "WOLNY LOS")
                .map(m => m.loser);
            for (let i = 0; i < r16Losers.length && i < 8; i++) {
                // Znajdź pierwsze wolne miejsce od 13
                let place = 13 + i;
                while (classification[place] && place < 17) place++;
                if (place < 17) classification[place] = r16Losers[i];
            }
        }

        // ===== MIEJSCA 9-16 z turnieju pocieszenia (jeśli aktywny) =====
        if (isConsolationActive && consolationMatches) {
            if (consolationMatches.final && isMatchActuallyPlayed(consolationMatches.final)) {
                let place = 9;
                while (classification[place] && place < 17) place++;
                if (place < 17) classification[place] = consolationMatches.final.winner;

                place = 9;
                while (classification[place] && place < 17) place++;
                if (place < 17) classification[place] = consolationMatches.final.loser;
            }
            if (consolationMatches.eleventh && isMatchActuallyPlayed(consolationMatches.eleventh)) {
                let place = 9;
                while (classification[place] && place < 17) place++;
                if (place < 17) classification[place] = consolationMatches.eleventh.winner;

                place = 9;
                while (classification[place] && place < 17) place++;
                if (place < 17) classification[place] = consolationMatches.eleventh.loser;
            }
            if (consolationMatches.quarterfinals && consolationMatches.quarterfinals.length > 0) {
                const cqfLosers = consolationMatches.quarterfinals
                    .filter(m => isMatchActuallyPlayed(m) && m.loser && m.loser !== "WOLNY LOS")
                    .map(m => m.loser);
                for (let i = 0; i < cqfLosers.length && i < 4; i++) {
                    let place = 9;
                    while (classification[place] && place < 17) place++;
                    if (place < 17) classification[place] = cqfLosers[i];
                }
            }
        }
    } else {
        // ===== DLA 8 ZAWODNIKÓW: MIEJSCA 5-8 =====
        if (knockoutMatches.quarterfinals && knockoutMatches.quarterfinals.length > 0) {
            const qfLosers = knockoutMatches.quarterfinals
                .filter(m => isMatchActuallyPlayed(m) && m.loser && m.loser !== "WOLNY LOS")
                .map(m => m.loser);
            for (let i = 0; i < qfLosers.length && i < 4; i++) {
                classification[5 + i] = qfLosers[i];
            }
        }

        // MIEJSCA 5-8 z turnieju pocieszenia (dla 8 zawodników)
        if (isConsolationActive && consolationMatches) {
            if (consolationMatches.final && isMatchActuallyPlayed(consolationMatches.final)) {
                let place = 5;
                while (classification[place] && place < 9) place++;
                if (place < 9) classification[place] = consolationMatches.final.winner;

                place = 5;
                while (classification[place] && place < 9) place++;
                if (place < 9) classification[place] = consolationMatches.final.loser;
            }
            if (consolationMatches.eleventh && isMatchActuallyPlayed(consolationMatches.eleventh)) {
                let place = 5;
                while (classification[place] && place < 9) place++;
                if (place < 9) classification[place] = consolationMatches.eleventh.winner;

                place = 5;
                while (classification[place] && place < 9) place++;
                if (place < 9) classification[place] = consolationMatches.eleventh.loser;
            }
        }
    }

    // ===== POLICZ MAKSYMALNE ZAJĘTE MIEJSCE W TURNIEJU GŁÓWNYM =====
    let maxMainPlace = 0;
    Object.keys(classification).forEach(key => {
        const place = parseInt(key);
        if (classification[place] && classification[place] !== "WOLNY LOS" && place > maxMainPlace) {
            maxMainPlace = place;
        }
    });

    return { classification, maxMainPlace };
}


function showFinalClassificationModal() {
    const mode = document.getElementById('mode').value;
    const knockoutSize = parseInt(document.getElementById('knockoutSize')?.value || 8);
    const currentKnockoutMatches = mode === 'manual' ? manualKnockoutMatches : autoKnockoutMatches;
    const currentConsolationMatches = mode === 'manual' ? manualConsolationMatches : autoConsolationMatches;
    const consolationMode = document.getElementById('consolationMode').value;
    const isConsolationActive = consolationMode === 'yes';

    const existingModal = document.getElementById('classificationModal');
    if (existingModal) existingModal.remove();

    // Pobierz klasyfikację główną (miejsca 1-16) z kompresją BYE
    const { classification: mainClassification, maxMainPlace } = getFinalClassification(
        currentKnockoutMatches, 
        currentConsolationMatches, 
        isConsolationActive
    );

    // Połącz wszystkie klasyfikacje
    let fullClassification = { ...mainClassification };
    let nextAvailablePlace = maxMainPlace + 1;

    // Dodaj turniej dla przegranych z grup (zaczynając od pierwszego wolnego miejsca)
    if (groupLosersTournamentMode === 'yes') {
        const glClassification = getGroupLosersFinalClassification();
        // Przesuń miejsca z turnieju przegranych - zacznij od nextAvailablePlace
        let glPlace = 1;
        while (glClassification[glPlace]) {
            while (fullClassification[nextAvailablePlace]) nextAvailablePlace++;
            fullClassification[nextAvailablePlace] = glClassification[glPlace];
            nextAvailablePlace++;
            glPlace++;
        }
    }

    const tournamentName = document.getElementById('tournamentNameInput').value.trim() || t('tournamentName');
    const category = document.getElementById('subTitleInput').value.trim() || '';

    // Policz ile realnych miejsc jest zajętych
    const occupiedPlaces = Object.keys(fullClassification)
        .map(Number)
        .filter(k => fullClassification[k] && fullClassification[k] !== "WOLNY LOS" && fullClassification[k] !== '?' && fullClassification[k] !== '—')
        .sort((a, b) => a - b);

    const maxPlace = occupiedPlaces.length > 0 ? Math.max(...occupiedPlaces) : 0;

    let html = `
        <div id="classificationModal" class="classification-modal">
            <div id="classificationModalHeader" class="classification-modal-header">
                <div class="classification-modal-header-center">
                    <div class="classification-modal-title">${t('finalClassification')} (miejsca 1-${maxPlace})</div>
                    <div class="classification-modal-subtitle">${tournamentName}${category ? ' - ' + category : ''}</div>
                </div>
                <button id="closeModalBtn" class="classification-modal-close">×</button>
            </div>
            <div class="classification-modal-body">
                <table class="classification-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>${t('players')}</th>
                         </tr>
                    </thead>
                    <tbody>
    `;

    // Wyświetl wszystkie zajęte miejsca po kolei (bez luk!)
    let hasAnyPlayer = false;
    let displayRank = 1; // Rzeczywiste miejsce wyświetlane (bez luk)

    for (let i = 1; i <= maxPlace; i++) {
        const player = fullClassification[i];

        if (player && player !== '?' && player !== '—' && player !== "WOLNY LOS" && player !== null) {
            hasAnyPlayer = true;

            let styleAttr = '';
            if (displayRank === 1) {
                styleAttr = 'background: linear-gradient(135deg, #FFD700, #FFEC8B) !important; border: 2px solid #D4AF37 !important; font-weight: bold;';
            } else if (displayRank === 2) {
                styleAttr = 'background: linear-gradient(135deg, #C0C0C0, #E8E8E8) !important; border: 2px solid #A8A8A8 !important; font-weight: bold;';
            } else if (displayRank === 3) {
                styleAttr = 'background: linear-gradient(135deg, #CD7F32, #E9B384) !important; border: 2px solid #8B4513 !important; font-weight: bold;';
            } else if (displayRank >= 4 && displayRank <= 8) {
                styleAttr = 'background: #f5f5f5;';
            }

            html += `
                <tr style="${styleAttr}">
                    <td>${displayRank}.</td>
                    <td>${escapeHtml(player)}</td>
                 </tr>
            `;
            displayRank++;
        }
    }

    if (!hasAnyPlayer) {
        html += `
            <tr>
                <td colspan="2" class="classification-empty-cell">
                    ${t('noClassificationData') || 'Brak rozegranych meczów do wyświetlenia klasyfikacji.'}
                </td>
             </tr>
        `;
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    const modal = document.getElementById('classificationModal');
    const header = document.getElementById('classificationModalHeader');
    const closeBtn = document.getElementById('closeModalBtn');

    closeBtn.onclick = function(e) {
        e.stopPropagation();
        modal.remove();
    };

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    header.addEventListener('mousedown', (e) => {
        if (e.target === closeBtn || e.target.closest('#closeModalBtn')) return;
        isDragging = true;
        const rect = modal.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        startX = e.clientX - initialLeft;
        startY = e.clientY - initialTop;
        modal.style.transform = 'none';
        modal.style.left = initialLeft + 'px';
        modal.style.top = initialTop + 'px';
        modal.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        modal.style.left = (e.clientX - startX) + 'px';
        modal.style.top = (e.clientY - startY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        modal.style.cursor = 'default';
    });
}

function saveTournamentToFile() {
    const tournamentName = document.getElementById('tournamentNameInput').value.trim() || t('tournamentName');
    const category = document.getElementById('subTitleInput').value.trim() || '';

    const tournamentData = {
        tournamentName: tournamentName,
        category: category,
        groupMode: document.getElementById('mode').value,
        tournamentMode: document.getElementById('tournamentMode').value,
        currentRound: document.getElementById('currentRound')?.value || '1',
        totalRounds: document.getElementById('totalRounds')?.value || '10',
        autoSubTitle: autoSubTitle,
        manualSubTitle: manualSubTitle,
        playersAuto: document.getElementById('playersAuto').value,
        playersManual: document.getElementById('playersManual').value,
        mode: document.getElementById('mode').value,
        consolationMode: document.getElementById('consolationMode').value,
        numGroupsAuto: document.getElementById('numGroupsAuto').value,
        numQualifiedPlayers: document.getElementById('numQualifiedPlayers').value,
        numGroupsManual: document.getElementById('numGroupsManual').value,
        numQualifiedPlayersManual: document.getElementById('numQualifiedPlayersManual').value,
        knockoutSize: document.getElementById('knockoutSize').value,
        currentLanguage: currentLanguage,
        activeKnockoutTab: activeKnockoutTab,
        activeKnockoutView: activeKnockoutView,

        autoData: {
            groupPlayers: groupPlayers,
            groupResults: groupResults,
            groupStandings: groupStandings,
            autoKnockoutMatches: autoKnockoutMatches,
            autoConsolationMatches: autoConsolationMatches,
            autoPlayerColors: autoPlayerColors
        },

        manualData: {
            manualGroupPlayers: manualGroupPlayers,
            manualGroupResults: manualGroupResults,
            manualGroupStandings: manualGroupStandings,
            manualKnockoutMatches: manualKnockoutMatches,
            manualConsolationMatches: manualConsolationMatches,
            manualPlayerColors: manualPlayerColors,
            manualGroupsInput: getManualGroupsInput()
        },

        // ===== GROUP LOSERS TOURNAMENT DATA =====
        groupLosersTournamentMode: groupLosersTournamentMode,
        groupLosersQualifiedCount: groupLosersQualifiedCount,
        groupLosersKnockoutSize: groupLosersKnockoutSize,
        groupLosersConsolationMode: groupLosersConsolationMode,
        groupLosersPlayers: groupLosersPlayers,
        groupLosersKnockoutMatches: groupLosersKnockoutMatches,
        groupLosersConsolationMatches: groupLosersConsolationMatches,
        groupLosersPlayerColors: groupLosersPlayerColors
    };

    const dataStr = JSON.stringify(tournamentData, null, 2);
    
    let baseName = tournamentName.replace(/[^a-zA-Z0-9]/g, '_');
    if (category) {
        baseName += '_' + category.replace(/[^a-zA-Z0-9]/g, '_');
    }
    
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `${baseName}_${date}.json`;

    saveToAndroidFile(dataStr, filename, 'application/json');

    if (!androidInterface) {
        alert(`${t('saveSuccess')}:\n${filename}`);
    }
}

function getManualGroupsInput() {
    const numGroups = parseInt(document.getElementById('numGroupsManual').value);
    const manualGroups = {};

    for (let i = 0; i < numGroups; i++) {
        const textarea = document.getElementById(`manual-group-${i}`);
        if (textarea) {
            manualGroups[i] = textarea.value;
        }
    }

    return manualGroups;
}

function loadTournamentFromFile() {
    loadFromAndroidFile();
}

function showLoadDialog(tournamentData) {
    if (!tournamentData) {
        alert(t('loadError'));
        return;
    }

    const hasBasicData = (tournamentData.tournamentName && tournamentData.tournamentName.trim() !== '') || 
                         (tournamentData.playersAuto && tournamentData.playersAuto.trim() !== '') ||
                         (tournamentData.playersManual && tournamentData.playersManual.trim() !== '');

    const hasAutoData = tournamentData.autoData && 
                        (tournamentData.autoData.groupPlayers?.length > 0 || tournamentData.autoData.autoKnockoutMatches);

    const hasManualData = tournamentData.manualData && 
                          (tournamentData.manualData.manualGroupPlayers?.length > 0 || tournamentData.manualData.manualKnockoutMatches);

    if (!hasBasicData && !hasAutoData && !hasManualData) {
        alert(t('noTournamentData'));
        return;
    }

    const dialog = document.createElement('div');
    dialog.id = 'loadDialog';
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1000;
        min-width: 300px;
    `;

    let optionsHtml = '';
    
    if (hasAutoData && hasManualData) {
        optionsHtml = `
            <p><strong>${t('fileContainsBoth')}</strong></p>
            <label><input type="radio" name="loadMode" value="both" checked> ${t('bothModes')}</label><br>
            <label><input type="radio" name="loadMode" value="auto"> ${t('autoModeOnly')}</label><br>
            <label><input type="radio" name="loadMode" value="manual"> ${t('manualModeOnly')}</label>
        `;
    } else if (hasAutoData) {
        optionsHtml = `
            <p><strong>${t('fileContainsAuto')}</strong></p>
            <label><input type="radio" name="loadMode" value="auto" checked> ${t('loadAuto')}</label>
        `;
    } else if (hasManualData) {
        optionsHtml = `
            <p><strong>${t('fileContainsManual')}</strong></p>
            <label><input type="radio" name="loadMode" value="manual" checked> ${t('loadManual')}</label>
        `;
    } else {
        optionsHtml = `
            <p><strong>${t('fileContainsBasic')}</strong></p>
            <label><input type="radio" name="loadMode" value="${tournamentData.mode || 'auto'}" checked> ${t('loadFormData')}</label>
        `;
    }

    dialog.innerHTML = `
        <h3>${t('loadingTournament')}: ${escapeHtml(tournamentData.tournamentName || t('noName'))}</h3>
        ${optionsHtml}
        <div class="dialog-actions-row">
            <button onclick="document.getElementById('loadDialog').remove()" class="btn-modal-cancel">${t('cancel')}</button>
            <button onclick="window.processLoadSelection(${JSON.stringify(tournamentData).replace(/"/g, '&quot;')})" class="btn-modal-primary">${t('load')}</button>
        </div>
    `;

    document.body.appendChild(dialog);
}

function loadBothModes(tournamentData) {
    autoSubTitle = tournamentData.autoSubTitle || '';
    manualSubTitle = tournamentData.manualSubTitle || '';

    if (tournamentData.autoData) {
        groupPlayers = tournamentData.autoData.groupPlayers || [];
        groupResults = tournamentData.autoData.groupResults || [];
        groupStandings = tournamentData.autoData.groupStandings || [];
        autoKnockoutMatches = tournamentData.autoData.autoKnockoutMatches || { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
        autoConsolationMatches = tournamentData.autoData.autoConsolationMatches || { semifinals: [], fifthPlace: null, seventhPlace: null };
        autoPlayerColors = tournamentData.autoData.autoPlayerColors || {};
    }

    if (tournamentData.manualData) {
        manualGroupPlayers = tournamentData.manualData.manualGroupPlayers || [];
        manualGroupResults = tournamentData.manualData.manualGroupResults || [];
        manualGroupStandings = tournamentData.manualData.manualGroupStandings || [];
        manualKnockoutMatches = tournamentData.manualData.manualKnockoutMatches || { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
        manualConsolationMatches = tournamentData.manualData.manualConsolationMatches || { semifinals: [], fifthPlace: null, seventhPlace: null };
        manualPlayerColors = tournamentData.manualData.manualPlayerColors || {};
    }
}

window.processLoadSelection = function(tournamentData) {
    const selectedMode = document.querySelector('input[name="loadMode"]:checked')?.value;
    document.getElementById('loadDialog')?.remove();

    if (!selectedMode) {
        alert(t('selectMode'));
        return;
    }

    restoreUIFromLoadedData(tournamentData);

    if (selectedMode === 'auto') {
        document.getElementById('playersManual').value = '';
        const manualGroupCount = parseInt(document.getElementById('numGroupsManual').value);
        for (let i = 0; i < manualGroupCount; i++) {
            const textarea = document.getElementById(`manual-group-${i}`);
            if (textarea) textarea.value = '';
        }
        manualSubTitle = '';
    } else if (selectedMode === 'manual') {
        document.getElementById('playersAuto').value = '';
        autoSubTitle = '';
    }

    if (selectedMode === 'both') {
        loadBothModes(tournamentData);
    } else {
        if (selectedMode === 'auto') {
            autoSubTitle = tournamentData.autoData?.autoSubTitle || tournamentData.autoSubTitle || '';
            groupPlayers = tournamentData.autoData?.groupPlayers || [];
            groupResults = tournamentData.autoData?.groupResults || [];
            groupStandings = tournamentData.autoData?.groupStandings || [];
            autoKnockoutMatches = tournamentData.autoData?.autoKnockoutMatches || { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
            autoConsolationMatches = tournamentData.autoData?.autoConsolationMatches || { semifinals: [], fifthPlace: null, seventhPlace: null };
            autoPlayerColors = tournamentData.autoData?.autoPlayerColors || {};
        } else {
            manualSubTitle = tournamentData.manualData?.manualSubTitle || tournamentData.manualSubTitle || '';
            manualGroupPlayers = tournamentData.manualData?.manualGroupPlayers || [];
            manualGroupResults = tournamentData.manualData?.manualGroupResults || [];
            manualGroupStandings = tournamentData.manualData?.manualGroupStandings || [];
            manualKnockoutMatches = tournamentData.manualData?.manualKnockoutMatches || { quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
            manualConsolationMatches = tournamentData.manualData?.manualConsolationMatches || { semifinals: [], fifthPlace: null, seventhPlace: null };
            manualPlayerColors = tournamentData.manualData?.manualPlayerColors || {};
        }
    }

    // ===== WCZYTANIE GROUP LOSERS DANYCH =====
    if (tournamentData.groupLosersTournamentMode !== undefined) {
        groupLosersTournamentMode = tournamentData.groupLosersTournamentMode;
        groupLosersQualifiedCount = tournamentData.groupLosersQualifiedCount || 2;
        groupLosersKnockoutSize = tournamentData.groupLosersKnockoutSize || 8;
        groupLosersConsolationMode = tournamentData.groupLosersConsolationMode || 'no';
        groupLosersPlayers = tournamentData.groupLosersPlayers || [];
        groupLosersKnockoutMatches = tournamentData.groupLosersKnockoutMatches || { round16: [], quarterfinals: [], semifinals: [], final: null, thirdPlace: null };
        groupLosersConsolationMatches = tournamentData.groupLosersConsolationMatches || { semifinals: [], fifthPlace: null, seventhPlace: null };
        groupLosersPlayerColors = tournamentData.groupLosersPlayerColors || {};
        
        document.getElementById('numQualifiedToGroupLosers').value = groupLosersQualifiedCount;
        setGroupLosersKnockoutSize(groupLosersKnockoutSize);
        setGroupLosersConsolationMode(groupLosersConsolationMode);
        setGroupLosersTournamentMode(groupLosersTournamentMode);
    }

    // ===== WCZYTANIE STANU ZAKŁADEK I WIDOKÓW =====
    if (tournamentData.activeKnockoutTab) {
        activeKnockoutTab = tournamentData.activeKnockoutTab;
    }
    if (tournamentData.activeKnockoutView) {
        activeKnockoutView = tournamentData.activeKnockoutView;
    }

    renderGroups();
    displayBracket();
    toggleConsolationVisibility();
    displayConsolationBracket();
    handleByes();
    updateClassification();

    // Odtworzenie drabinek przegranych z grup
    if (groupLosersTournamentMode === 'yes') {
        _safeSetDisplay('groupLosersSection', 'block');
        displayGroupLosersBracket();
        handleGroupLosersByes();
        if (groupLosersConsolationMode === 'yes') {
            _safeSetDisplay('groupLosersConsolationSection', 'block');
            displayGroupLosersConsolationBracket();
        }
    }
    
    // Odtworzenie stanu zakładek
    switchKnockoutTab('knockout', activeKnockoutTab);
    
    switchMode();
    updateSubTitleDisplay();

    applyCollapseState('controlPanel', tournamentData.controlPanelCollapsed);
    applyCollapseState('groupSection', tournamentData.groupSectionCollapsed);
    applyCollapseState('knockoutSection', tournamentData.knockoutSectionCollapsed);
    applyCollapseState('consolationSection', tournamentData.consolationSectionCollapsed);

    alert(t('loadSuccess'));
};

function restoreUIFromLoadedData(tournamentData) {
    document.getElementById('tournamentNameInput').value = tournamentData.tournamentName || '';
    document.getElementById('playersAuto').value = tournamentData.playersAuto || '';
    document.getElementById('playersManual').value = tournamentData.playersManual || '';
    document.getElementById('mode').value = tournamentData.mode || 'auto';
    
    let consolationMode = tournamentData.consolationMode || 'no';
    if (tournamentData.enableConsolation !== undefined) {
        consolationMode = tournamentData.enableConsolation ? 'yes' : 'no';
    }
    document.getElementById('consolationMode').value = consolationMode;
    setConsolationMode(consolationMode);
    
    document.getElementById('numGroupsAuto').value = tournamentData.numGroupsAuto || 4;
    document.getElementById('numQualifiedPlayers').value = tournamentData.numQualifiedPlayers || 2;
    document.getElementById('numGroupsManual').value = tournamentData.numGroupsManual || 4;
    document.getElementById('numQualifiedPlayersManual').value = tournamentData.numQualifiedPlayersManual || 2;
    
    // ===== ODTWORZENIE KNOCKOUT SIZE =====
    if (tournamentData.knockoutSize) {
        document.getElementById('knockoutSize').value = tournamentData.knockoutSize;
        setKnockoutSize(parseInt(tournamentData.knockoutSize));
    }

    autoSubTitle = tournamentData.autoSubTitle || '';
    manualSubTitle = tournamentData.manualSubTitle || '';

    const subTitleInput = document.getElementById('subTitleInput');
    if (tournamentData.mode === 'manual') {
        subTitleInput.value = manualSubTitle;
    } else {
        subTitleInput.value = autoSubTitle;
    }

    updateTournamentTitle();

    let manualGroupsData = null;
    
    if (tournamentData.manualData && tournamentData.manualData.manualGroupsInput) {
        manualGroupsData = tournamentData.manualData.manualGroupsInput;
    } else if (tournamentData.manualGroupsInput) {
        manualGroupsData = tournamentData.manualGroupsInput;
    } else if (tournamentData.manualData && tournamentData.manualData.manualGroupPlayers) {
        manualGroupsData = {};
        tournamentData.manualData.manualGroupPlayers.forEach((players, index) => {
            manualGroupsData[index] = players.join('\n');
        });
    }
    
    if (manualGroupsData) {
        const numGroups = parseInt(document.getElementById('numGroupsManual').value);
        renderManualGroups(); 
        
        for (let i = 0; i < numGroups; i++) {
            const textarea = document.getElementById(`manual-group-${i}`);
            if (textarea && manualGroupsData[i] !== undefined && manualGroupsData[i] !== null) {
                textarea.value = manualGroupsData[i];
            }
        }
    }

    // ===== ODTWORZENIE GROUP LOSERS USTAWIEŃ =====
    if (tournamentData.groupLosersTournamentMode !== undefined) {
        groupLosersTournamentMode = tournamentData.groupLosersTournamentMode;
        setGroupLosersTournamentMode(groupLosersTournamentMode);
    }
    if (tournamentData.groupLosersQualifiedCount !== undefined) {
        groupLosersQualifiedCount = tournamentData.groupLosersQualifiedCount;
        document.getElementById('numQualifiedToGroupLosers').value = groupLosersQualifiedCount;
    }
    if (tournamentData.groupLosersKnockoutSize !== undefined) {
        groupLosersKnockoutSize = tournamentData.groupLosersKnockoutSize;
        setGroupLosersKnockoutSize(groupLosersKnockoutSize);
    }
    if (tournamentData.groupLosersConsolationMode !== undefined) {
        groupLosersConsolationMode = tournamentData.groupLosersConsolationMode;
        setGroupLosersConsolationMode(groupLosersConsolationMode);
    }
}

// ================= JEDYNY window.onload =================
window.onload = function() {
    currentLanguage = localStorage.getItem('appLanguage') || detectLanguage();
    applyTranslations();
    updateLanguageSwitch();
    
    // ===== DOMYŚLNIE RĘCZNY (manual) =====
    document.getElementById('mode').value = 'manual';
    
    const numGroupsAuto = document.getElementById('numGroupsAuto');
    const numGroupsManual = document.getElementById('numGroupsManual');
    if (numGroupsAuto && numGroupsManual) {
        numGroupsManual.value = numGroupsAuto.value;
    }

    updateTournamentTitle();
    renderManualGroups();
    
    // ✅ TYLKO JEDNO wywołanie loadState() - ono już wywołuje switchMode() i updateSubTitleDisplay()
    loadState();
	 refreshGroupLosersKnockoutButtons();
    _syncAllToggleSwitchAria();
    _syncKnockoutTabButtonsAria();

    // File input do wczytywania turniejów
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'fileInput';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    fileInput.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const tournamentData = JSON.parse(e.target.result);
                showLoadDialog(tournamentData);
            } catch (error) {
                alert(t('loadError'));
            }
        };
        reader.readAsText(file);
    };
    document.body.appendChild(fileInput);

    // Event listenery dla przełączników widoku grup
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchGroupView(this.dataset.view);
        });
    });
    
    // ✅ Inicjalizacja mobilna - TUTAJ, nie w osobnym listenerze
    initMobileFeatures();
    
    // ✅ Auto-save - TUTAJ, nie w osobnym listenerze z setTimeout
    setupAutoSave();
};

function initMobileFeatures() {
    const tables = document.querySelectorAll('.table-container');
    tables.forEach(table => {
        table.addEventListener('touchstart', function(e) {
            this.style.cursor = 'grabbing';
        });
        table.addEventListener('touchend', function(e) {
            this.style.cursor = 'grab';
        });
    });
    
    // Dodaj możliwość przeciągania dla drabinek
    const knockoutBracket = document.getElementById('knockout-bracket');
    const consolationBracket = document.getElementById('consolation-bracket');

    if (knockoutBracket) {
        knockoutBracket.style.overflowX = 'auto';
        knockoutBracket.style.overflowY = 'auto';
        knockoutBracket.style.webkitOverflowScrolling = 'touch'; // płynne przewijanie na iOS
        makeDraggable(knockoutBracket);
    }

    if (consolationBracket) {
        consolationBracket.style.overflowX = 'auto';
        consolationBracket.style.overflowY = 'auto';
        consolationBracket.style.webkitOverflowScrolling = 'touch';
        makeDraggable(consolationBracket);
    }
}


// DODATKOWE TŁUMACZENIA
translations.pl.enterPlayersFirst = "Wpisz zawodników przed generowaniem grup!";
translations.pl.invalidScore = "Wynik musi być liczbą!";
translations.pl.invalidScoreFormat = "Nieprawidłowy format wyniku! Użyj formatu '3:2'";
translations.pl.noQualifiedPlayers = "Brak zakwalifikowanych zawodników do fazy pucharowej.";
translations.pl.tooManyPlayers = "Wykryto więcej niż 8 zakwalifikowanych zawodników. Do drabinki pucharowej zostanie wybranych pierwszych 8 zawodników z najwyższym rankingiem ogólnym.";
translations.pl.enableConsolationFirst = "Aby wygenerować drabinkę pocieszenia, zaznacz opcję 'Rozgrywaj Turniej Pocieszenia' w ustawieniach.";
translations.pl.notEnoughLosers = "Brak wystarczającej liczby przegranych z ćwierćfinałów (potrzeba 4) do wygenerowania Turnieju Pocieszenia.";
translations.pl.saveError = "Błąd podczas zapisu danych.";
translations.pl.loadError = "Błąd podczas wczytywania pliku.";
translations.pl.saveSuccess = "Plik został zapisany: ";
translations.pl.confirmClear = "Czy na pewno chcesz wyczyścić wszystkie dane turniejowe?";
translations.pl.clearSuccess = "Wszystkie dane turniejowe zostały wyczyszczone.";
translations.pl.noTournamentData = "Wczytany plik nie zawiera żadnych danych turniejowych.";
translations.pl.loadSuccess = "Turniej został pomyślnie wczytany!";
translations.pl.winner = "ZWYCIĘZCA";
translations.pl.qualified = "Q";
translations.pl.points = "Punkty";
translations.pl.sets = "Sety";
translations.pl.setBalance = "Bilans setów (W:P)";
translations.pl.place = "Miejsce";
translations.pl.places = "miejsca";
translations.pl.tournamentResults = "WYNIKI TURNIEJU";
translations.pl.exportDate = "Data eksportu";
translations.pl.finalClassification = "Klasyfikacja Końcowa";
translations.pl.noClassificationData = "Brak danych do wyświetlenia klasyfikacji końcowej.";
translations.pl.selectExportMode = "Wybierz tryb do eksportu";
translations.pl.currentMode = "AKTUALNY TRYB";
translations.pl.export = "Eksportuj";
translations.pl.cancel = "Anuluj";
translations.pl.exportSuccess = "Wyniki zostały wyeksportowane do pliku";
translations.pl.selectMode = "Nie wybrano tryb do eksportu.";
translations.pl.fileContainsBoth = "Plik zawiera dane obu trybów. Wybierz tryb do wczytywania:";
translations.pl.bothModes = "Oba tryby";
translations.pl.autoModeOnly = "Tylko tryb automatyczny";
translations.pl.manualModeOnly = "Tylko tryb ręczny";
translations.pl.fileContainsAuto = "Plik zawiera dane trybu automatycznego oraz formularza.";
translations.pl.loadAuto = "Wczytaj tryb automatyczny";
translations.pl.fileContainsManual = "Plik zawiera dane trybu ręcznego oraz formularza.";
translations.pl.loadManual = "Wczytaj tryb ręczny";
translations.pl.fileContainsBasic = "Plik zawiera tylko podstawowe dane formularza (Nazwa, Zawodnicy).";
translations.pl.loadFormData = "Wczytaj tylko dane formularza";
translations.pl.loadingTournament = "Wczytywanie turnieju";
translations.pl.noName = "Brak nazwy";
translations.pl.load = "Wczytaj";
translations.pl.expand = "Rozwiń";
translations.pl.noMatches = "Brak meczów do wyświetlenia.";
translations.pl.played = "Rozegrany";
translations.pl.waiting = "Oczekuje";
translations.pl.quarterfinals = "Ćwierćfinały";
translations.pl.semifinals = "Półfinały"; 
translations.pl.final = "Finał";
translations.pl.thirdPlace = "Mecz o 3. miejsce";
translations.pl.fifthPlace = "Mecz o 5. miejsce";
translations.pl.seventhPlace = "Mecz o 7. miejsce";
translations.pl.round16 = "1/16";
translations.pl.quarterfinalsWithPlaces = "Ćwierćfinały (Miejsca {range})";
translations.pl.matchForPlace = "Mecz o {place}. miejsce";
translations.pl.groupLosersConsolationWaiting = "Turniej pocieszenia pojawi się po rozegraniu meczów w turnieju dla przegranych z grup.";
translations.pl.waitingForLosers = "Oczekiwanie na więcej przegranych (potrzeba minimum 4)...";
translations.pl.newVersionAvailable = "📦 Nowa wersja dostępna";
translations.pl.refresh = "Odśwież";
translations.pl.later = "Później";
translations.pl.installApp = "Zainstaluj aplikację";
translations.pl.offlineMode = "Tryb offline - dane zapisywane lokalnie";
translations.pl.consolationSemifinals = "Półfinały Pocieszenia";
translations.pl.finalClassification = "Klasyfikacja Końcowa";
translations.pl.consolationClassification = "Klasyfikacja (miejsca 5-8)";
translations.pl.group = "Grupa";
translations.pl.groups = "Grupy";
translations.pl.groupStage = "Faza grupowa";
translations.pl.selectDataToClear = "Wybierz dane do usunięcia";
translations.pl.clearAutoMode = "Tryb AUTOMATYCZNY (grupy, wyniki, drabinka)";
translations.pl.clearManualMode = "Tryb RĘCZNY (grupy, wyniki, drabinka)";
translations.pl.clearEverything = "Wyczyść WSZYSTKO (oba tryby)";
translations.pl.clearSelected = "Wyczyść wybrane";
translations.pl.confirmClearAll = "Czy na pewno chcesz usunąć WSZYSTKIE dane turniejowe (oba tryby)? Spowoduje to usunięcie grup, wyników i drabinki pucharowej dla obu trybów.";
translations.pl.confirmClearSelected = "Czy na pewno chcesz usunąć dane dla trybów: ";
translations.pl.noOptionSelected = "Nie wybrano żadnej opcji do czyszczenia.";
translations.pl.allDataCleared = "Wszystkie dane turniejowe zostały usunięte.";
translations.pl.dataCleared = "Dane zostały usunięte: ";
translations.pl.clearError = "Błąd podczas czyszczenia danych.";
translations.pl.and = "i";
translations.pl.selectExportMode = "Wybierz tryb do eksportu";
translations.pl.currentMode = "AKTUALNY TRYB";
translations.pl.bothModes = "OBA TRYBY";
translations.pl.cancel = "Anuluj";
translations.pl.selectMode = "Nie wybrano tryb do eksportu.";
translations.pl.generateGroups = "Generuj tabele grupowe 🏓";
translations.pl.generateBracket = "Generuj drabinkę pucharową 🏓";
translations.pl.generateConsolation = "Generuj drabinkę pocieszenia 🏓";
translations.pl.knockoutStarted = "Faza pucharowa już się rozpoczęła! Nie można dodać zawodnika.";
translations.pl.addPlayer = "Dodaj zawodnika";
translations.pl.playerAdded = "Dodano {name} do grupy {group}. Nowy zawodnik musi rozegrać wszystkie mecze.";
translations.pl.tournamentMode = "Tryb turnieju";
translations.pl.singleTournament = "Pojedynczy";
translations.pl.leagueTournament = "Ligowy";
translations.pl.allPlaces = "Wszystkie miejsca";
translations.pl.topOnly = "Tylko TOP";
translations.pl.pointsForPlaces = "Punkty za miejsca (wpisz ręcznie)";
translations.pl.pointsForPhases = "Punkty za fazy (opcjonalnie)";
translations.pl.participation = "Udział";
translations.pl.quarterfinals = "Ćwierćfinały";
translations.pl.infoAfterTournament = "Po zakończeniu turnieju kliknij \"Dodaj punkty do rankingu\", aby zaktualizować tabelę główną.";
translations.pl.leaguePointsSettings = "Ustawienia punktacji ligowej";
translations.pl.leagueRanking = "Ranking ligowy";
translations.pl.addPointsToRanking = "Dodaj punkty do rankingu";
translations.pl.exportRanking = "Eksportuj ranking";
translations.pl.loadRanking = "Wczytaj ranking";
translations.pl.clearRanking = "Wyczyść ranking";
translations.pl.footerText = "© 2026 Turniej Tenisa Stołowego - aplikacje stworzył: ZIUTY. Wesprzyj rozwój na";
translations.pl.contact = "Kontakt";
translations.pl.qualified = "Awans";
translations.pl.showClassification = "Pokaż klasyfikację końcową";
translations.pl.knockoutStage = "Faza pucharowa";
translations.pl.groupLosersTournament = "Turniej dla przegranych z grup";
translations.pl.groupLosersConsolation = "Turniej pocieszenia (przegrani z turnieju dla przegranych)";
translations.pl.generateGroupLosersBracket = "Generuj drabinkę (przegrani z grup) 🏓";
translations.pl.generateGroupLosersConsolation = "Generuj drabinkę pocieszenia 🏓";
translations.pl.qualifiedToGroupLosers = "Awans do turnieju dla przegranych z grupy";
translations.pl.groupLosersKnockoutStage = "Faza pucharowa (przegrani z grup)";
translations.pl.groupLosersConsolationToggle = "Turniej pocieszenia (przegrani z grup)";
translations.pl.bye = "WOLNY LOS";
translations.pl.currentRound = "Aktualna runda";
translations.pl.totalRounds = "Liczba rund";
translations.pl.round16Label = "1/16 finału:";
translations.pl.mainTournamentTab = "Główny Turniej";
translations.pl.consolationTournamentTab = "Turniej Pocieszenia";
translations.pl.losersFromGroupsTab = "Główny - Przegrani z Grup";
translations.pl.losersConsolationTab = "Pocieszenie - Przegrani z Grup";
translations.pl.bracketView = "Drabinka";
translations.pl.scheduleViewKnockout = "Harmonogram";
translations.pl.locked = "Zablokowany";
translations.pl.matchFor17 = "Mecz o 17. miejsce";
translations.pl.matchFor19 = "Mecz o 19. miejsce";
translations.pl.matchFor25 = "Mecz o 25. miejsce";
translations.pl.matchFor27 = "Mecz o 27. miejsce";
translations.pl.qualifiedToGroupLosersLabel = "Awans do turnieju dla przegranych z grupy";
translations.pl.noGroupLosersPlayers = "Brak zawodników do turnieju dla przegranych z grup.";
translations.pl.enableGroupLosersFirst = 'Włącz najpierw opcję "Turniej dla przegranych z grup".';

translations.en.enterPlayersFirst = "Enter players before generating groups!";
translations.en.invalidScore = "Score must be a number!";
translations.en.invalidScoreFormat = "Invalid score format! Use format '3:2'";
translations.en.noQualifiedPlayers = "No qualified players for knockout stage.";
translations.en.tooManyPlayers = "Too many qualified players detected. Only the top 8 players will be selected for the knockout bracket.";
translations.en.enableConsolationFirst = "To generate consolation bracket, check the 'Play Consolation Tournament' option in settings.";
translations.en.notEnoughLosers = "Not enough quarterfinal losers (need 4) to generate Consolation Tournament.";
translations.en.saveError = "Error saving data.";
translations.en.loadError = "Error loading file.";
translations.en.saveSuccess = "File saved: ";
translations.en.confirmClear = "Are you sure you want to clear all tournament data?";
translations.en.clearSuccess = "All tournament data has been cleared.";
translations.en.noTournamentData = "The loaded file contains no tournament data.";
translations.en.loadSuccess = "Tournament successfully loaded!";
translations.en.winner = "WINNER";
translations.en.qualified = "Q";
translations.en.points = "Points";
translations.en.sets = "Sets";
translations.en.setBalance = "Set Balance (W:L)";
translations.en.place = "Place";
translations.en.places = "places";
translations.en.tournamentResults = "TOURNAMENT RESULTS";
translations.en.exportDate = "Export date";
translations.en.finalClassification = "Final Classification";
translations.en.noClassificationData = "No data to display final classification.";
translations.en.selectExportMode = "Select export mode";
translations.en.currentMode = "CURRENT MODE";
translations.en.export = "Export";
translations.en.cancel = "Cancel";
translations.en.exportSuccess = "Results exported to file";
translations.en.selectMode = "No mode selected for export.";
translations.en.fileContainsBoth = "File contains data for both modes. Select mode to load:";
translations.en.bothModes = "Both modes";
translations.en.autoModeOnly = "Auto mode only";
translations.en.manualModeOnly = "Manual mode only";
translations.en.fileContainsAuto = "File contains auto mode data and form data.";
translations.en.loadAuto = "Load auto mode";
translations.en.fileContainsManual = "File contains manual mode data and form data.";
translations.en.loadManual = "Load manual mode";
translations.en.fileContainsBasic = "File contains only basic form data (Name, Players).";
translations.en.loadFormData = "Load form data only";
translations.en.loadingTournament = "Loading tournament";
translations.en.noName = "No name";
translations.en.load = "Load";
translations.en.expand = "Expand";
translations.en.noMatches = "No matches to display.";
translations.en.played = "Played";
translations.en.waiting = "Waiting";
translations.en.quarterfinals = "Quarterfinals";
translations.en.semifinals = "Semifinals";
translations.en.final = "Final";
translations.en.thirdPlace = "3rd Place Match";
translations.en.fifthPlace = "5th Place Match"; 
translations.en.seventhPlace = "7th Place Match";
translations.en.round16 = "1/16";
translations.en.quarterfinalsWithPlaces = "Quarterfinals (Places {range})";
translations.en.matchForPlace = "Match for place {place}";
translations.en.groupLosersConsolationWaiting = "Consolation tournament will appear after matches in the group losers tournament are played.";
translations.en.waitingForLosers = "Waiting for more losers (minimum 4 required)...";
translations.en.newVersionAvailable = "📦 New version available";
translations.en.refresh = "Refresh";
translations.en.later = "Later";
translations.en.installApp = "Install app";
translations.en.offlineMode = "Offline mode - data saved locally";
translations.en.consolationSemifinals = "Consolation Semifinals";
translations.en.finalClassification = "Final Classification";
translations.en.consolationClassification = "Classification (Places 5-8)";
translations.en.group = "Group"; 
translations.en.groups = "Groups";
translations.en.groupStage = "Group Stage";
translations.en.selectDataToClear = "Select data to clear";
translations.en.clearAutoMode = "AUTO mode (groups, results, bracket)";
translations.en.clearManualMode = "MANUAL mode (groups, results, bracket)";
translations.en.clearEverything = "Clear EVERYTHING (both modes)";
translations.en.clearSelected = "Clear selected";
translations.en.confirmClearAll = "Are you sure you want to delete ALL tournament data (both modes)? This will remove groups, results and knockout bracket for both modes.";
translations.en.confirmClearSelected = "Are you sure you want to delete data for modes: ";
translations.en.noOptionSelected = "No option selected for clearing.";
translations.en.allDataCleared = "All tournament data has been cleared.";
translations.en.dataCleared = "Data cleared: ";
translations.en.clearError = "Error clearing data.";
translations.en.and = "and";
translations.en.selectExportMode = "Select export mode";
translations.en.currentMode = "CURRENT MODE";
translations.en.bothModes = "BOTH MODES";
translations.en.cancel = "Cancel";
translations.en.selectMode = "No mode selected for export.";
translations.en.generateGroups = "Generate Group Tables 🏓";
translations.en.generateBracket = "Generate Knockout Bracket 🏓";
translations.en.generateConsolation = "Generate Consolation Bracket 🏓";
translations.en.knockoutStarted = "Knockout stage has already started! Cannot add player.";
translations.en.addPlayer = "Add player";
translations.en.playerAdded = "Added {name} to group {group}. New player must play all matches.";
translations.en.tournamentMode = "Tournament mode";
translations.en.singleTournament = "Single";
translations.en.leagueTournament = "League";
translations.en.allPlaces = "All places";
translations.en.topOnly = "TOP only";
translations.en.pointsForPlaces = "Points for places (enter manually)";
translations.en.pointsForPhases = "Points for phases (optional)";
translations.en.participation = "Participation";
translations.en.quarterfinals = "Quarterfinals";
translations.en.infoAfterTournament = "After the tournament, click \"Add points to ranking\" to update the main table.";
translations.en.leaguePointsSettings = "League points settings";
translations.en.leagueRanking = "League ranking";
translations.en.addPointsToRanking = "Add points to ranking";
translations.en.exportRanking = "Export ranking";
translations.en.loadRanking = "Load ranking";
translations.en.clearRanking = "Clear ranking";
translations.en.footerText = "© 2026 Table Tennis Tournament - app created by ZIUTY. Support development on";
translations.en.contact = "Contact";
translations.en.qualified = "Qualified";
translations.en.showClassification = "Show final classification";
translations.en.knockoutStage = "Knockout stage";
translations.en.groupLosersTournament = "Tournament for group losers";
translations.en.groupLosersConsolation = "Consolation tournament (losers from group losers tournament)";
translations.en.generateGroupLosersBracket = "Generate bracket (group losers) 🏓";
translations.en.generateGroupLosersConsolation = "Generate consolation bracket 🏓";
translations.en.qualifiedToGroupLosers = "Qualified to group losers tournament";
translations.en.groupLosersKnockoutStage = "Knockout stage (group losers)";
translations.en.groupLosersConsolationToggle = "Consolation tournament (group losers)";
translations.en.bye = "BYE";
translations.en.currentRound = "Current round";
translations.en.totalRounds = "Total rounds";
translations.en.round16Label = "Round of 16:";
translations.en.mainTournamentTab = "Main Tournament";
translations.en.consolationTournamentTab = "Consolation Tournament";
translations.en.losersFromGroupsTab = "Main - Group Losers";
translations.en.losersConsolationTab = "Consolation - Group Losers";
translations.en.bracketView = "Bracket";
translations.en.scheduleViewKnockout = "Schedule";
translations.en.locked = "Locked";
translations.en.matchFor17 = "Match for 17th place";
translations.en.matchFor19 = "Match for 19th place";
translations.en.matchFor25 = "Match for 25th place";
translations.en.matchFor27 = "Match for 27th place";
translations.en.qualifiedToGroupLosersLabel = "Qualified to group losers tournament";
translations.en.noGroupLosersPlayers = "No players for group losers tournament.";
translations.en.enableGroupLosersFirst = 'First enable "Tournament for group losers" option.';

// ================= PWA - SERVICE WORKER =================
if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
  navigator.serviceWorker.register('service-worker.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateNotification(newWorker);
        }
      });
    });
  });
}

function showUpdateNotification(newWorker) {
  const notification = document.createElement('div');
  notification.id = 'updateNotification';
  notification.innerHTML = `
    <div class="pwa-update-banner">
      <span>${t('newVersionAvailable')}</span>
      <button onclick="window.location.reload()" class="pwa-update-btn-primary">${t('refresh')}</button>
      <button onclick="document.getElementById('updateNotification').remove()" class="pwa-update-btn-secondary">${t('later')}</button>
    </div>
  `;
  document.body.appendChild(notification);
}

// Detekcja instalacji PWA
window.addEventListener('appinstalled', (evt) => {
  _debugLog('Aplikacja została zainstalowana jako PWA!');
});

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

function showInstallButton() {
  // ... (pozostaw bez zmian, ale usuń setTimeout 30s jeśli chcesz)
  const installBtn = document.createElement('button');
  installBtn.id = 'installPWAButton';
  installBtn.innerHTML = t('installApp');
  installBtn.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: #3498db; color: white;
    border: none; padding: 12px 20px; border-radius: 25px; font-weight: bold;
    cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999;
    display: flex; align-items: center; gap: 8px; animation: slideIn 0.3s ease;
  `;
  installBtn.onclick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.remove();
  };
  document.body.appendChild(installBtn);
}

// Sprawdź połączenie sieciowe
window.addEventListener('online', () => {
  document.body.classList.remove('offline-mode');
});

window.addEventListener('offline', () => {
  document.body.classList.add('offline-mode');
  const offlineMsg = document.createElement('div');
  offlineMsg.id = 'offlineMessage';
  offlineMsg.innerHTML = t('offlineMode');
  offlineMsg.style.cssText = `
    position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
    background: #f39c12; color: white; padding: 10px 20px; border-radius: 5px;
    z-index: 9998; font-weight: bold; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(offlineMsg);
  setTimeout(() => offlineMsg.remove(), 5000);
});

// Wymuś zapis danych przed zamknięciem
window.addEventListener('beforeunload', () => {
  if (typeof saveState === 'function') saveState();
});
// ================= DOPISYWANIE ZAWODNIKÓW =================
function showAddPlayerDialog(groupIndex) {
    const mode = document.getElementById('mode').value;
    if (mode !== 'auto') {
        alert('Ta funkcja działa tylko w trybie automatycznym!');
        return;
    }

    // Sprawdź czy faza pucharowa się nie rozpoczęła
    const currentKnockoutMatches = autoKnockoutMatches;
    const knockoutStarted = currentKnockoutMatches.quarterfinals && 
                           currentKnockoutMatches.quarterfinals.some(m => m.player1 && m.player1 !== "WOLNY LOS" && m.player1 !== null);
    
    if (knockoutStarted) {
        alert(t('knockoutStarted'));
        return;
    }

    const playerName = prompt('Podaj imię i nazwisko nowego zawodnika:');
    if (!playerName || playerName.trim() === '') return;

    addPlayerToGroup(groupIndex, playerName.trim());
}

function addPlayerToGroup(groupIndex, playerName) {
   if (groupPlayers[groupIndex].includes(playerName)) {
    alert('Zawodnik już istnieje w tej grupie!');
    return;
}
   // 1. Dodaj zawodnika do grupy
    groupPlayers[groupIndex].push(playerName);

    // 2. Rozszerz macierz wyników
    const newSize = groupPlayers[groupIndex].length;
    const oldResults = groupResults[groupIndex];

    // Stwórz nową macierz
    const newResults = Array(newSize).fill().map(() => Array(newSize).fill(''));

    // Kopiuj stare wyniki
    for (let i = 0; i < oldResults.length; i++) {
        for (let j = 0; j < oldResults[i].length; j++) {
            if (i < newSize && j < newSize) {
                newResults[i][j] = oldResults[i][j] || '';
            }
        }
    }

    groupResults[groupIndex] = newResults;

    // 3. Jeśli są już kolory, nadaj nowemu zawodnikowi kolor
    if (Object.keys(autoPlayerColors).length > 0) {
        const colorClasses = [
            'player-color-1', 'player-color-2', 'player-color-3', 'player-color-4',
            'player-color-5', 'player-color-6', 'player-color-7', 'player-color-8'
        ];
        const usedColors = Object.values(autoPlayerColors);
        const availableColor = colorClasses.find(c => !usedColors.includes(c)) || 'player-color-1';
        autoPlayerColors[playerName] = availableColor;
    }

    // 4. Przelicz tabele
    calculateAllStandings();
    renderGroups();

    saveState();
    
    // Pokaż komunikat
    const msg = t('playerAdded').replace('{name}', playerName).replace('{group}', groupIndex + 1);
    alert(msg);
}
function showAddPlayerManualDialog(groupIndex) {
    const mode = document.getElementById('mode').value;
    if (mode !== 'manual') return;

    // Sprawdź czy faza pucharowa się nie rozpoczęła
    const currentKnockoutMatches = manualKnockoutMatches;
    const knockoutStarted = currentKnockoutMatches.quarterfinals && 
                           currentKnockoutMatches.quarterfinals.some(m => m.player1 && m.player1 !== "WOLNY LOS" && m.player1 !== null);
    
    if (knockoutStarted) {
        alert(t('knockoutStarted'));
        return;
    }

    const playerName = prompt('Podaj imię i nazwisko nowego zawodnika:');
    if (!playerName || playerName.trim() === '') return;

    addPlayerToManualGroup(groupIndex, playerName.trim());
}

function addPlayerToManualGroup(groupIndex, playerName) {
    if (manualGroupPlayers[groupIndex].includes(playerName)) {
    alert('Zawodnik już istnieje w tej grupie!');
    return;
}
		// 1. Dodaj zawodnika do grupy
    manualGroupPlayers[groupIndex].push(playerName);

    // 2. Rozszerz macierz wyników
    const newSize = manualGroupPlayers[groupIndex].length;
    const oldResults = manualGroupResults[groupIndex] || [];

    // Stwórz nową macierz
    const newResults = Array(newSize).fill().map(() => Array(newSize).fill(''));

    // Kopiuj stare wyniki
    for (let i = 0; i < oldResults.length; i++) {
        for (let j = 0; j < oldResults[i].length; j++) {
            if (i < newSize && j < newSize) {
                newResults[i][j] = oldResults[i][j] || '';
            }
        }
    }

    manualGroupResults[groupIndex] = newResults;

    // 3. Jeśli są już kolory, nadaj nowemu zawodnikowi kolor
    if (Object.keys(manualPlayerColors).length > 0) {
        const colorClasses = [
            'player-color-1', 'player-color-2', 'player-color-3', 'player-color-4',
            'player-color-5', 'player-color-6', 'player-color-7', 'player-color-8'
        ];
        const usedColors = Object.values(manualPlayerColors);
        const availableColor = colorClasses.find(c => !usedColors.includes(c)) || 'player-color-1';
        manualPlayerColors[playerName] = availableColor;
    }

    // 4. Aktualizuj pole tekstowe grupy (żeby było widać nowego zawodnika)
    const textarea = document.getElementById(`manual-group-${groupIndex}`);
    if (textarea) {
        const currentValue = textarea.value;
        textarea.value = currentValue + (currentValue ? '\n' : '') + playerName;
    }

    // 5. Przelicz tabele
    calculateAllStandings();
    renderGroups();

    saveState();
    
    // Pokaż komunikat
    const msg = t('playerAdded').replace('{name}', playerName).replace('{group}', groupIndex + 1);
    alert(msg);
}
// ================= TRYB LIGOWY =================
let leagueRankings = {};  // klucz: "nazwa_kategoria", wartość: { ranking: {}, processedRounds: {} }
let currentRankingKey = ''; // przechowuje aktualny klucz
let leagueSettings = {    // Domyślne ustawienia
   
    points: {1:50, 2:45, 3:40, 4:35, 5:30, 6:27, 7:24, 8:21},
    pointsR16: 10,
    pointsParticipation: 5
};
function getCurrentRankingKey() {
    const tournamentName = document.getElementById('tournamentNameInput').value.trim() || 'Turniej';
    const category = document.getElementById('subTitleInput').value.trim() || '';
    return `${tournamentName}_${category}`.replace(/\s+/g, '_');
}

function setTournamentMode(mode) {
    document.getElementById('tournamentMode').value = mode;
    
    // Przełączanie klas aktywnych
    document.getElementById('btn-mode-single').classList.toggle('active', mode === 'single');
    document.getElementById('btn-mode-league').classList.toggle('active', mode === 'league');
    
    // Pokazuj/ukryj panel ustawień ligowych i przyciski
    const leaguePanel = document.getElementById('league-settings-panel');
    const leagueBtn = document.getElementById('leagueRankingBtn');
    const addBtn = document.getElementById('addToRankingBtn');
    const roundsFields = document.getElementById('leagueRoundsFields');
    
    if (mode === 'league') {
        leaguePanel.style.display = 'block';
        leagueBtn.style.display = 'inline-block';
        addBtn.style.display = 'inline-block';
        if (roundsFields) roundsFields.style.display = 'flex';
    } else {
        leaguePanel.style.display = 'none';
        leagueBtn.style.display = 'none';
        addBtn.style.display = 'none';
        if (roundsFields) roundsFields.style.display = 'none';
    }
    
    _syncAllToggleSwitchAria();
    saveState();
}

function addTournamentResultsToRanking() {
    if (checkForDuplicatePlayers()) {
        alert('Nie można dodać punktów – popraw duplikaty zawodników.');
        return;
    }
    
    const mode = document.getElementById('mode').value;
    const currentKnockoutMatches = mode === 'manual' ? manualKnockoutMatches : autoKnockoutMatches;
    const currentConsolationMatches = mode === 'manual' ? manualConsolationMatches : autoConsolationMatches;
    const consolationMode = document.getElementById('consolationMode').value;
    const knockoutSize = parseInt(document.getElementById('knockoutSize')?.value || 8);
    const groupLosersMode = groupLosersTournamentMode;
    
    const tournamentName = document.getElementById('tournamentNameInput').value.trim() || 'Turniej';
    const category = document.getElementById('subTitleInput').value.trim() || '';
    const currentRound = document.getElementById('currentRound')?.value || '1';
            
    const rankingKey = getCurrentRankingKey();
    const roundKey = `${rankingKey}_runda${currentRound}`;
    
    if (!leagueRankings[rankingKey]) {
        leagueRankings[rankingKey] = {
            ranking: {},
            processedRounds: {},
            tournamentName: tournamentName,
            category: category,
            totalRounds: parseInt(document.getElementById('totalRounds')?.value) || 10
        };
    }
    
    const currentRanking = leagueRankings[rankingKey].ranking;
    const processedRounds = leagueRankings[rankingKey].processedRounds;
    
    if (processedRounds[roundKey]) {
        alert(`Runda ${currentRound} dla turnieju "${tournamentName}" została już dodana do rankingu!`);
        return;
    }
    
    // ===== ZBIERAMY TYLKO ROZEGRANE MECZE =====
    let playedMatches = [];
    
    // Z głównego turnieju
    if (currentKnockoutMatches.round16) {
        currentKnockoutMatches.round16.forEach(m => {
            if (isMatchActuallyPlayed(m)) playedMatches.push(m);
        });
    }
    if (currentKnockoutMatches.quarterfinals) {
        currentKnockoutMatches.quarterfinals.forEach(m => {
            if (isMatchActuallyPlayed(m)) playedMatches.push(m);
        });
    }
    if (currentKnockoutMatches.semifinals) {
        currentKnockoutMatches.semifinals.forEach(m => {
            if (isMatchActuallyPlayed(m)) playedMatches.push(m);
        });
    }
    if (currentKnockoutMatches.final && isMatchActuallyPlayed(currentKnockoutMatches.final)) {
        playedMatches.push(currentKnockoutMatches.final);
    }
    if (currentKnockoutMatches.thirdPlace && isMatchActuallyPlayed(currentKnockoutMatches.thirdPlace)) {
        playedMatches.push(currentKnockoutMatches.thirdPlace);
    }
    
    // Z turnieju pocieszenia
    if (consolationMode === 'yes') {
        if (currentConsolationMatches.quarterfinals) {
            currentConsolationMatches.quarterfinals.forEach(m => {
                if (isMatchActuallyPlayed(m)) playedMatches.push(m);
            });
        }
        if (currentConsolationMatches.semifinals) {
            currentConsolationMatches.semifinals.forEach(m => {
                if (isMatchActuallyPlayed(m)) playedMatches.push(m);
            });
        }
        if (currentConsolationMatches.final && isMatchActuallyPlayed(currentConsolationMatches.final)) {
            playedMatches.push(currentConsolationMatches.final);
        }
        if (currentConsolationMatches.eleventh && isMatchActuallyPlayed(currentConsolationMatches.eleventh)) {
            playedMatches.push(currentConsolationMatches.eleventh);
        }
    }
    
    const participationPoints = parseInt(document.getElementById('points-participation')?.value) || 0;
    const r16Points = parseInt(document.getElementById('points-r16')?.value) || 0;
    
    const currentGroupPlayers = mode === 'manual' ? manualGroupPlayers : groupPlayers;
    const allPlayers = [...new Set(currentGroupPlayers.flat().filter(p => p && p !== "WOLNY LOS"))];
    
    // Zbierz zawodników którzy grali w 1/16 (TYLKO z rozegranych meczów)
    const r16Players = new Set();
    if (knockoutSize === 16 && currentKnockoutMatches.round16) {
        currentKnockoutMatches.round16.forEach(match => {
            if (isMatchActuallyPlayed(match)) {
                if (match.player1 && match.player1 !== "WOLNY LOS") r16Players.add(match.player1);
                if (match.player2 && match.player2 !== "WOLNY LOS") r16Players.add(match.player2);
            }
        });
    }
    
    // Zbierz zawodników z turnieju dla przegranych z grup (TYLKO z rozegranych meczów)
    const groupLosersPlayersSet = new Set();
    if (groupLosersMode === 'yes') {
        if (groupLosersKnockoutMatches.round16) {
            groupLosersKnockoutMatches.round16.forEach(match => {
                if (isMatchActuallyPlayed(match)) {
                    if (match.player1 && match.player1 !== "WOLNY LOS") groupLosersPlayersSet.add(match.player1);
                    if (match.player2 && match.player2 !== "WOLNY LOS") groupLosersPlayersSet.add(match.player2);
                }
            });
        }
        if (groupLosersKnockoutMatches.quarterfinals) {
            groupLosersKnockoutMatches.quarterfinals.forEach(match => {
                if (isMatchActuallyPlayed(match)) {
                    if (match.player1 && match.player1 !== "WOLNY LOS") groupLosersPlayersSet.add(match.player1);
                    if (match.player2 && match.player2 !== "WOLNY LOS") groupLosersPlayersSet.add(match.player2);
                }
            });
        }
    }
    
    // ===== OBLICZANIE MIEJSC TYLKO Z ROZEGRANYCH MECZÓW =====
    // Używamy getFinalClassification która już ma isMatchActuallyPlayed
    const classification = getFinalClassification(
        currentKnockoutMatches, 
        currentConsolationMatches, 
        consolationMode === 'yes'
    );
    
    let fullClassification = { ...classification };
    
    if (knockoutSize === 16) {
        if (currentKnockoutMatches.quarterfinals) {
            const qfLosers = currentKnockoutMatches.quarterfinals
                .filter(m => isMatchActuallyPlayed(m) && m.loser && m.loser !== "WOLNY LOS")
                .map(m => m.loser);
            for (let i = 0; i < qfLosers.length && i < 4; i++) {
                fullClassification[5 + i] = qfLosers[i];
            }
        }
        
        if (consolationMode === 'yes' && currentConsolationMatches) {
            if (currentConsolationMatches.final && isMatchActuallyPlayed(currentConsolationMatches.final)) {
                fullClassification[9] = currentConsolationMatches.final.winner;
                fullClassification[10] = currentConsolationMatches.final.loser;
            }
            if (currentConsolationMatches.eleventh && isMatchActuallyPlayed(currentConsolationMatches.eleventh)) {
                fullClassification[11] = currentConsolationMatches.eleventh.winner;
                fullClassification[12] = currentConsolationMatches.eleventh.loser;
            }
            if (currentConsolationMatches.quarterfinals) {
                const cqfLosers = currentConsolationMatches.quarterfinals
                    .filter(m => isMatchActuallyPlayed(m) && m.loser && m.loser !== "WOLNY LOS")
                    .map(m => m.loser);
                for (let i = 0; i < cqfLosers.length && i < 4; i++) {
                    fullClassification[13 + i] = cqfLosers[i];
                }
            }
        } else if (currentKnockoutMatches.round16) {
            const round16Losers = currentKnockoutMatches.round16
                .filter(m => isMatchActuallyPlayed(m) && m.loser && m.loser !== "WOLNY LOS")
                .map(m => m.loser);
            for (let i = 0; i < round16Losers.length && i < 8; i++) {
                fullClassification[9 + i] = round16Losers[i];
            }
        }
    }
    
    if (groupLosersMode === 'yes') {
        const glClassification = getGroupLosersFinalClassification();
        for (let place = 1; place <= 16; place++) {
            if (glClassification[place]) {
                fullClassification[16 + place] = glClassification[place];
            }
        }
    }
    
    let addedCount = 0;
    
    allPlayers.forEach(player => {
        let playerPlace = null;
        
        for (let place = 1; place <= 32; place++) {
            if (fullClassification[place] === player) {
                playerPlace = place;
                break;
            }
        }
        
        let points = 0;
        
        if (playerPlace && playerPlace <= 8) {
            const pointsInput = document.getElementById(`points-${playerPlace}`);
            points = parseInt(pointsInput?.value) || 0;
        } 
        else if (playerPlace && playerPlace >= 9 && playerPlace <= 16) {
            points = r16Points;
        }
        else if (playerPlace && playerPlace >= 17 && playerPlace <= 32) {
            points = participationPoints;
        }
        else if (groupLosersPlayersSet.has(player)) {
            points = participationPoints;
        }
        else if (r16Players.has(player)) {
            points = r16Points;
        }
        else {
            points = participationPoints;
        }
        
        if (!currentRanking[player]) {
            currentRanking[player] = {
                punkty: 0,
                turnieje: 0,
                najlepsze_miejsce: playerPlace || 999
            };
        }
        
        currentRanking[player].turnieje++;
        currentRanking[player].punkty += points;
        
        if (playerPlace && playerPlace < currentRanking[player].najlepsze_miejsce) {
            currentRanking[player].najlepsze_miejsce = playerPlace;
        }
        
        addedCount++;
    });
    
    processedRounds[roundKey] = true;
    
    alert(`Dodano punkty do rankingu ligowego dla ${addedCount} zawodników!`);
    saveState();
}


function getGroupLosersFinalClassification() {
    const classification = {};
    const matches = groupLosersKnockoutMatches;
    const consolationMatches = groupLosersConsolationMatches;
    const isConsolationActive = groupLosersConsolationMode === 'yes';
    const knockoutSize = groupLosersKnockoutSize || 8;

    // ===== MIEJSCA 17-20: GŁÓWNY TURNIEJ DLA PRZEGRANYCH Z GRUP =====
    if (matches.final && isMatchActuallyPlayed(matches.final)) {
        classification[1] = matches.final.winner;
        classification[2] = matches.final.loser;
    }
    if (matches.thirdPlace && isMatchActuallyPlayed(matches.thirdPlace)) {
        classification[3] = matches.thirdPlace.winner;
        classification[4] = matches.thirdPlace.loser;
    }

    if (knockoutSize === 16) {
        // ===== MIEJSCA 21-24: PRZEGRANI Z ĆWIERĆFINAŁÓW =====
        if (matches.quarterfinals && matches.quarterfinals.length > 0) {
            const qfLosers = matches.quarterfinals
                .filter(m => isMatchActuallyPlayed(m) && m.loser && m.loser !== "WOLNY LOS")
                .map(m => m.loser);
            for (let i = 0; i < qfLosers.length && i < 4; i++) {
                classification[5 + i] = qfLosers[i];
            }
        }

        // ===== MIEJSCA 25-32 =====
        if (isConsolationActive && consolationMatches) {
            if (consolationMatches.final && isMatchActuallyPlayed(consolationMatches.final)) {
                let place = 9;
                while (classification[place] && place < 17) place++;
                if (place < 17) classification[place] = consolationMatches.final.winner;

                place = 9;
                while (classification[place] && place < 17) place++;
                if (place < 17) classification[place] = consolationMatches.final.loser;
            }
            if (consolationMatches.eleventh && isMatchActuallyPlayed(consolationMatches.eleventh)) {
                let place = 9;
                while (classification[place] && place < 17) place++;
                if (place < 17) classification[place] = consolationMatches.eleventh.winner;

                place = 9;
                while (classification[place] && place < 17) place++;
                if (place < 17) classification[place] = consolationMatches.eleventh.loser;
            }
            if (consolationMatches.quarterfinals && consolationMatches.quarterfinals.length > 0) {
                const cqfLosers = consolationMatches.quarterfinals
                    .filter(m => isMatchActuallyPlayed(m) && m.loser && m.loser !== "WOLNY LOS")
                    .map(m => m.loser);
                for (let i = 0; i < cqfLosers.length && i < 4; i++) {
                    let place = 9;
                    while (classification[place] && place < 17) place++;
                    if (place < 17) classification[place] = cqfLosers[i];
                }
            }
        } else {
            // Bez turnieju pocieszenia - przegrani z 1/16 finału
            if (matches.round16 && matches.round16.length > 0) {
                const r16Losers = matches.round16
                    .filter(m => isMatchActuallyPlayed(m) && m.loser && m.loser !== "WOLNY LOS")
                    .map(m => m.loser);
                for (let i = 0; i < r16Losers.length && i < 8; i++) {
                    let place = 9;
                    while (classification[place] && place < 17) place++;
                    if (place < 17) classification[place] = r16Losers[i];
                }
            }
        }
    } else {
        // ===== DLA 8 ZAWODNIKÓW =====
        if (isConsolationActive && consolationMatches) {
            // Przegrani ćwierćfinałów grają w pocieszeniu o miejsca 25-28
            if (consolationMatches.final && isMatchActuallyPlayed(consolationMatches.final)) {
                let place = 5;
                while (classification[place] && place < 9) place++;
                if (place < 9) classification[place] = consolationMatches.final.winner;

                place = 5;
                while (classification[place] && place < 9) place++;
                if (place < 9) classification[place] = consolationMatches.final.loser;
            }
            if (consolationMatches.eleventh && isMatchActuallyPlayed(consolationMatches.eleventh)) {
                let place = 5;
                while (classification[place] && place < 9) place++;
                if (place < 9) classification[place] = consolationMatches.eleventh.winner;

                place = 5;
                while (classification[place] && place < 9) place++;
                if (place < 9) classification[place] = consolationMatches.eleventh.loser;
            }
        } else {
            // Bez turnieju pocieszenia - przegrani ćwierćfinałów = miejsca 21-24
            if (matches.quarterfinals && matches.quarterfinals.length > 0) {
                const qfLosers = matches.quarterfinals
                    .filter(m => isMatchActuallyPlayed(m) && m.loser && m.loser !== "WOLNY LOS")
                    .map(m => m.loser);
                for (let i = 0; i < qfLosers.length && i < 4; i++) {
                    classification[5 + i] = qfLosers[i];
                }
            }
        }
    }

    return classification;
}

function checkForDuplicatePlayers() {
    const mode = document.getElementById('mode').value;
    const currentGroupPlayers = mode === 'manual' ? manualGroupPlayers : groupPlayers;
    const allPlayers = currentGroupPlayers.flat().filter(p => p && p !== "WOLNY LOS");
    
    // Tworzymy obiekt zliczający wystąpienia
    const playerCount = {};
    allPlayers.forEach(player => {
        playerCount[player] = (playerCount[player] || 0) + 1;
    });
    
    // Znajdujemy tych, którzy mają > 1 wystąpień
    const duplicates = Object.keys(playerCount).filter(player => playerCount[player] > 1);
    
    if (duplicates.length > 0) {
        alert(`UWAGA! Znaleziono duplikaty zawodników: ${duplicates.join(', ')}\n\nZawodnik nie może grać w dwóch grupach jednocześnie. Proszę poprawić listę zawodników.`);
        _debugWarn('Duplikaty:', duplicates);
        return true; // zwraca true jeśli są duplikaty
    }
    return false; // brak duplikatów
}
function showLeagueRanking() {
    const rankingKey = getCurrentRankingKey();
    const data = leagueRankings[rankingKey];
    
    if (!data || Object.keys(data.ranking).length === 0) {
        alert('Brak danych rankingu dla tego turnieju.');
        return;
    }
    
    const tournamentName = data.tournamentName;
    const category = data.category || '';
    const currentRound = document.getElementById('currentRound')?.value || '1';
    const totalRounds = data.totalRounds || '?';
    
    // Sortowanie: po punktach (malejąco), przy równych punktach po najlepszym miejscu
    const sorted = Object.entries(data.ranking)
        .sort((a, b) => {
            if (b[1].punkty !== a[1].punkty) {
                return b[1].punkty - a[1].punkty;
            }
            return (a[1].najlepsze_miejsce || 999) - (b[1].najlepsze_miejsce || 999);
        });
    
    // Tytuł
    let title = `🏆 ${tournamentName}`;
    if (category) title += ` - ${category}`;
    title += ` (runda ${currentRound} z ${totalRounds})`;
    
    // Liczba zawodników w rankingu
    const playersCount = sorted.length;
    
    let html = `
        <div id="leagueRankingModal" class="ranking-modal">
           <div id="rankingModalHeader" class="ranking-modal-header">
                <div>
                    <h2>${escapeHtml(title)}</h2>
                    <div class="ranking-modal-subtitle">Liczba zawodników: ${playersCount}</div>
                </div>
                <button onclick="document.getElementById('leagueRankingModal').remove()" class="ranking-modal-close">×</button>
            </div>
            <div class="ranking-modal-body">
                <table class="ranking-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Zawodnik</th>
                            <th>Punkty</th>
                            <th>Turnieje</th>
                            <th>Najlepsze miejsce</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    // Wyświetlamy TYLKO zawodników z danymi (bez pustych wierszy)
    sorted.forEach(([player, stats], index) => {
        let bgColor = '';
        if (index === 0) bgColor = '#FFF8E1';      // złoty odcień dla lidera
        else if (index === 1) bgColor = '#F5F5F5'; // srebrny
        else if (index === 2) bgColor = '#FFF3E0'; // brązowy
        else if (index % 2 === 0) bgColor = '#fafafa';
        else bgColor = '#ffffff';
        
        html += `
            <tr style="border-bottom:1px solid #eee; background:${bgColor};">
                <td>${index+1}</td>
                <td>${escapeHtml(player)}</td>
                <td>${stats.punkty}</td>
                <td>${stats.turnieje}</td>
                <td>${stats.najlepsze_miejsce === 999 ? '—' : stats.najlepsze_miejsce}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
                ${playersCount === 0 ? '<p class="ranking-empty-msg">Brak danych rankingu.</p>' : ''}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
    
    // Dodaj możliwość przeciągania
    const modal = document.getElementById('leagueRankingModal');
    const header = document.getElementById('rankingModalHeader');
    
    let isDragging = false;
    let offsetX, offsetY, startX, startY, initialLeft, initialTop;
    
    header.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        const rect = modal.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        offsetX = e.clientX - initialLeft;
        offsetY = e.clientY - initialTop;
        modal.style.transform = 'none';
        modal.style.left = initialLeft + 'px';
        modal.style.top = initialTop + 'px';
        modal.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        modal.style.left = (e.clientX - offsetX) + 'px';
        modal.style.top = (e.clientY - offsetY) + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        modal.style.cursor = 'default';
    });
}


function clearCurrentRanking() {
    const rankingKey = getCurrentRankingKey();
    
    if (!leagueRankings[rankingKey]) {
        alert('Brak rankingu do wyczyszczenia.');
        return;
    }
    
    const tournamentName = leagueRankings[rankingKey].tournamentName;
    const category = leagueRankings[rankingKey].category || '';
    
    if (confirm(`Czy na pewno wyczyścić ranking dla turnieju "${tournamentName}" ${category ? 'kategoria: ' + category : ''}?`)) {
        delete leagueRankings[rankingKey];
        saveState();
        document.getElementById('leagueRankingModal')?.remove();
        alert('Ranking wyczyszczony.');
    }
}
function exportLeagueRanking() {
    const rankingKey = getCurrentRankingKey();
    const data = leagueRankings[rankingKey];
    
    if (!data || Object.keys(data.ranking).length === 0) {
        alert('Brak danych do eksportu.');
        return;
    }
    
    const tournamentName = data.tournamentName;
    const category = data.category || '';
    const currentRound = document.getElementById('currentRound')?.value || '1';
    const totalRounds = data.totalRounds || '?';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    // Zapytaj użytkownika w jakim formacie chce zapisać
    const format = confirm('Kliknij OK aby zapisać jako JSON (do ponownego wczytania), Anuluj aby zapisać jako TXT (do odczytu).');
    
    // Generuj nazwę pliku
    let filename = `ranking_${tournamentName}`;
    if (category) filename += `_${category}`;
    filename += `_runda${currentRound}`;
    filename += `_${date}`;
    
    // Dodaj rozszerzenie
    if (format) {
        filename += `.json`;
    } else {
        filename += `.txt`;
    }
    
    // Oczyść nazwę pliku
    filename = filename.replace(/[^a-zA-Z0-9_\.]/g, '_');
    filename = filename.replace(/__+/g, '_');
    
    if (format) {
        // Zapisz jako JSON
        const exportData = {
            tournamentName: tournamentName,
            category: category,
            totalRounds: totalRounds,
            currentRound: currentRound,
            ranking: data.ranking,
            processedRounds: data.processedRounds,
            exportDate: new Date().toISOString()
        };
        
        saveToAndroidFile(JSON.stringify(exportData, null, 2), filename, 'application/json');
        
        if (!androidInterface) {
            alert(`Ranking wyeksportowany jako JSON: ${filename}`);
        }
    } else {
        // Zapisz jako TXT
        let output = getTournamentHeader();
        output += `=== RANKING LIGOWY ===\n\n`;
        
        const sorted = Object.entries(data.ranking).sort((a, b) => b[1].punkty - a[1].punkty);
        
        sorted.forEach(([player, stats], index) => {
            const najlepsze = stats.najlepsze_miejsce === 999 ? 'brak' : stats.najlepsze_miejsce;
            output += `${index+1}. ${player} - ${stats.punkty} pkt (turnieje: ${stats.turnieje}, najlepsze miejsce: ${najlepsze})\n`;
        });
        
        saveToAndroidFile(output, filename, 'text/plain');
        
        if (!androidInterface) {
            alert(`Ranking wyeksportowany jako TXT: ${filename}`);
        }
    }
}
function loadLeagueRankingFromFile() {
    // Tworzymy ukryty input type="file"
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.json'; // akceptujemy pliki tekstowe i json
    input.style.display = 'none';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                const rankingKey = getCurrentRankingKey();
                
                // Próba parsowania jako JSON (jeśli to nasz format)
                try {
                    const importedData = JSON.parse(content);
                    if (importedData.ranking && importedData.tournamentName) {
                        // To jest plik w formacie JSON
                        leagueRankings[rankingKey] = importedData;
                        saveState();
                        alert(`Ranking dla "${importedData.tournamentName}" został wczytany.`);
                        return;
                    }
                } catch (jsonError) {
                    // To nie jest JSON, może to plik tekstowy z exportu
                    alert('Wybrany plik nie jest prawidłowym plikiem rankingu.');
                }
                
            } catch (error) {
                alert('Błąd podczas wczytywania pliku.');
                console.error(error);
            }
        };
        reader.readAsText(file);
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}
function collectGroupLosersPlayers() {
    const mode = document.getElementById('mode').value;
    const currentGroupPlayers = mode === 'manual' ? manualGroupPlayers : groupPlayers;
    const currentGroupStandings = mode === 'manual' ? manualGroupStandings : groupStandings;
    const numQualifiedToMain = parseInt(document.getElementById(
        mode === 'manual' ? 'numQualifiedPlayersManual' : 'numQualifiedPlayers'
    ).value);
    const numQualifiedToLosers = parseInt(document.getElementById('numQualifiedToGroupLosers')?.value) || 2;
    
    groupLosersPlayers = [];
    
    currentGroupStandings.forEach((group, groupIndex) => {
        // Zaczynamy od miejsca (numQualifiedToMain), bierzemy kolejnych numQualifiedToLosers zawodników
        for(let i = numQualifiedToMain; i < Math.min(numQualifiedToMain + numQualifiedToLosers, group.length); i++) {
            if(group[i]) {
                groupLosersPlayers.push(currentGroupPlayers[groupIndex][group[i].playerIndex]);
            }
        }
    });
    
    return groupLosersPlayers;
}

function generateGroupLosersBracket() {
    const bracketContainer = document.getElementById('groupLosers-bracket');
    if (!bracketContainer) return;
    
    bracketContainer.innerHTML = '';
    
     if (groupLosersTournamentMode !== 'yes') {
        alert(t('enableGroupLosersFirst'));
        return;
    }
    
    const players = collectGroupLosersPlayers();
    const knockoutSize = groupLosersKnockoutSize;
    
     if (players.length === 0) {
        alert(t('noGroupLosersPlayers'));
        return;
    }
    
    // Ustaw kolory
    const colorClasses = [
        'player-color-1', 'player-color-2', 'player-color-3', 'player-color-4',
        'player-color-5', 'player-color-6', 'player-color-7', 'player-color-8',
        'player-color-9', 'player-color-10', 'player-color-11', 'player-color-12',
        'player-color-13', 'player-color-14', 'player-color-15', 'player-color-16'
    ];
    
    const uniquePlayers = [...new Set(players.filter(p => p !== "WOLNY LOS"))];
    uniquePlayers.forEach((player, index) => {
        if (!groupLosersPlayerColors[player]) {
            groupLosersPlayerColors[player] = colorClasses[index % colorClasses.length];
        }
    });
    
    let targetSize = knockoutSize;
    let allPlayers = [...players];
    
    while (allPlayers.length < targetSize) {
        allPlayers.push("WOLNY LOS");
    }
    if (allPlayers.length > targetSize) {
        allPlayers = allPlayers.slice(0, targetSize);
    }
    
    // Rozstawienie
    const seededPlayers = new Array(targetSize);
    for (let i = 0; i < targetSize / 2; i++) {
        seededPlayers[i * 2] = allPlayers[i];
        seededPlayers[i * 2 + 1] = allPlayers[targetSize - 1 - i];
    }
    
    if (targetSize === 16) {
        groupLosersKnockoutMatches.round16 = [];
        for (let i = 0; i < 8; i++) {
            groupLosersKnockoutMatches.round16.push({
                id: `gl_r16_${i+1}`,
                player1: seededPlayers[i*2],
                player2: seededPlayers[i*2+1],
                score1: '', score2: '', winner: null, loser: null
            });
        }
        groupLosersKnockoutMatches.quarterfinals = [
            { id: 'gl_qf1', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null },
            { id: 'gl_qf2', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null },
            { id: 'gl_qf3', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null },
            { id: 'gl_qf4', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null }
        ];
    } else {
        groupLosersKnockoutMatches.round16 = [];
        groupLosersKnockoutMatches.quarterfinals = [
            { id: 'gl_qf1', player1: seededPlayers[0], player2: seededPlayers[1], score1: '', score2: '', winner: null, loser: null },
            { id: 'gl_qf2', player1: seededPlayers[2], player2: seededPlayers[3], score1: '', score2: '', winner: null, loser: null },
            { id: 'gl_qf3', player1: seededPlayers[4], player2: seededPlayers[5], score1: '', score2: '', winner: null, loser: null },
            { id: 'gl_qf4', player1: seededPlayers[6], player2: seededPlayers[7], score1: '', score2: '', winner: null, loser: null }
        ];
    }
    
    groupLosersKnockoutMatches.semifinals = [
        { id: 'gl_sf1', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null },
        { id: 'gl_sf2', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null }
    ];
    groupLosersKnockoutMatches.final = { id: 'gl_final', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null };
    groupLosersKnockoutMatches.thirdPlace = { id: 'gl_third', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null };
    
    displayGroupLosersBracket();
    handleGroupLosersByes();
}

function displayGroupLosersBracket() {
    const bracketContainer = document.getElementById('groupLosers-bracket');
    if (!bracketContainer) return;
    
    const hasRound16 = groupLosersKnockoutMatches.round16 && groupLosersKnockoutMatches.round16.length > 0 && 
                       groupLosersKnockoutMatches.round16.some(m => m.player1);
    const hasQuarterfinals = groupLosersKnockoutMatches.quarterfinals && 
                             groupLosersKnockoutMatches.quarterfinals.length > 0 && 
                             groupLosersKnockoutMatches.quarterfinals.some(m => m.player1);
    
    if (!hasRound16 && !hasQuarterfinals) {
        bracketContainer.innerHTML = '';
        return;
    }
    
    bracketContainer.innerHTML = '';
    const bracketWrapper = document.createElement('div');
    bracketWrapper.className = 'bracket';
    
    if (hasRound16) {
        // 1/16
        const round16Column = document.createElement('div');
        round16Column.className = 'bracket-column';
        const round16Title = document.createElement('h3');
        round16Title.className = 'round-title';
        round16Title.textContent = t('round16');
        round16Column.appendChild(round16Title);
        groupLosersKnockoutMatches.round16.forEach(match => {
            round16Column.appendChild(createGroupLosersMatchElement(match));
        });
        bracketWrapper.appendChild(round16Column);
        
        // Ćwierćfinały
        const quartersColumn = document.createElement('div');
        quartersColumn.className = 'bracket-column';
        const quartersTitle = document.createElement('h3');
        quartersTitle.className = 'round-title';
        quartersTitle.textContent = t('quarterfinalsWithPlaces').replace('{range}', '21-24');
        quartersColumn.appendChild(quartersTitle);
        groupLosersKnockoutMatches.quarterfinals.forEach(match => {
            quartersColumn.appendChild(createGroupLosersMatchElement(match));
        });
        bracketWrapper.appendChild(quartersColumn);
        
        // Półfinały + finał
        const finalColumn = document.createElement('div');
        finalColumn.className = 'bracket-column';
        
        const semisTitle = document.createElement('h3');
        semisTitle.className = 'round-title';
        semisTitle.textContent = t('semifinals');
        finalColumn.appendChild(semisTitle);
        groupLosersKnockoutMatches.semifinals.forEach(match => {
            finalColumn.appendChild(createGroupLosersMatchElement(match));
        });
        
        const thirdTitle = document.createElement('h3');
        thirdTitle.className = 'round-title';
        thirdTitle.textContent = t('matchForPlace').replace('{place}', '19');
        finalColumn.appendChild(thirdTitle);
        if (groupLosersKnockoutMatches.thirdPlace) {
            finalColumn.appendChild(createGroupLosersMatchElement(groupLosersKnockoutMatches.thirdPlace));
        }
        
        const finalTitle = document.createElement('h3');
        finalTitle.className = 'round-title';
        finalTitle.textContent = t('matchForPlace').replace('{place}', '17');
        finalColumn.appendChild(finalTitle);
        if (groupLosersKnockoutMatches.final) {
            finalColumn.appendChild(createGroupLosersMatchElement(groupLosersKnockoutMatches.final));
        }
        
        bracketWrapper.appendChild(finalColumn);
    } else if (hasQuarterfinals) {
        // Ćwierćfinały
        const quartersColumn = document.createElement('div');
        quartersColumn.className = 'bracket-column';
        const quartersTitle = document.createElement('h3');
        quartersTitle.className = 'round-title';
        quartersTitle.textContent = t('quarterfinalsWithPlaces').replace('{range}', '21-24');
        quartersColumn.appendChild(quartersTitle);
        groupLosersKnockoutMatches.quarterfinals.forEach(match => {
            quartersColumn.appendChild(createGroupLosersMatchElement(match));
        });
        bracketWrapper.appendChild(quartersColumn);
        
        // Półfinały
        const semisColumn = document.createElement('div');
        semisColumn.className = 'bracket-column';
        const semisTitle = document.createElement('h3');
        semisTitle.className = 'round-title';
        semisTitle.textContent = t('semifinals');
        semisColumn.appendChild(semisTitle);
        groupLosersKnockoutMatches.semifinals.forEach(match => {
            semisColumn.appendChild(createGroupLosersMatchElement(match));
        });
        bracketWrapper.appendChild(semisColumn);
        
        // Finał + 3. miejsce
        const finalColumn = document.createElement('div');
        finalColumn.className = 'bracket-column';
        
        const thirdTitle = document.createElement('h3');
        thirdTitle.className = 'round-title';
        thirdTitle.textContent = t('matchForPlace').replace('{place}', '19');
        finalColumn.appendChild(thirdTitle);
        if (groupLosersKnockoutMatches.thirdPlace) {
            finalColumn.appendChild(createGroupLosersMatchElement(groupLosersKnockoutMatches.thirdPlace));
        }
        
        const finalTitle = document.createElement('h3');
        finalTitle.className = 'round-title';
        finalTitle.textContent = t('matchForPlace').replace('{place}', '17');
        finalColumn.appendChild(finalTitle);
        if (groupLosersKnockoutMatches.final) {
            finalColumn.appendChild(createGroupLosersMatchElement(groupLosersKnockoutMatches.final));
        }
        
        bracketWrapper.appendChild(finalColumn);
    }
    
    bracketContainer.appendChild(bracketWrapper);
}

function createGroupLosersMatchElement(match) {
    const matchDiv = document.createElement('div');
    matchDiv.className = 'bracket-match';
    
    if (match.id === 'gl_final') matchDiv.classList.add('final-match');
    if (match.id === 'gl_third') matchDiv.classList.add('third-place-match');
    
    matchDiv.dataset.id = match.id;
    matchDiv.dataset.type = 'groupLosers';
    
    function trySaveResult() {
        const score1 = scoreInput1.value.trim();
        const score2 = scoreInput2.value.trim();
        if (score1 !== '' && score2 !== '') {
            updateGroupLosersMatchResult(match);
        }
    }
    
    const player1Row = document.createElement('div');
    player1Row.className = 'bracket-player';
    if (match.player1 && groupLosersPlayerColors[match.player1]) {
        player1Row.classList.add(groupLosersPlayerColors[match.player1]);
    }
    
    const player1Name = document.createElement('span');
    player1Name.className = 'player-name';
    player1Name.textContent = match.player1 ? (match.player1 === "WOLNY LOS" ? t('bye') : match.player1) : '?';
    
    const scoreInput1 = document.createElement('input');
    scoreInput1.type = 'text';
    scoreInput1.className = 'score-input';
    scoreInput1.placeholder = '0';
    scoreInput1.dataset.player = '1';
    scoreInput1.value = match.score1;
    scoreInput1.addEventListener('input', function(e) {
        let val = this.value.replace(/[^0-9]/g, '');
        if (val.length >= 2) this.value = val.slice(0, 2);
        trySaveResult();
    });
    
    player1Row.appendChild(player1Name);
    player1Row.appendChild(scoreInput1);
    
    const player2Row = document.createElement('div');
    player2Row.className = 'bracket-player';
    if (match.player2 && groupLosersPlayerColors[match.player2]) {
        player2Row.classList.add(groupLosersPlayerColors[match.player2]);
    }
    
    const player2Name = document.createElement('span');
    player2Name.className = 'player-name';
    player2Name.textContent = match.player2 ? (match.player2 === "WOLNY LOS" ? t('bye') : match.player2) : '?';
    
    const scoreInput2 = document.createElement('input');
    scoreInput2.type = 'text';
    scoreInput2.className = 'score-input';
    scoreInput2.placeholder = '0';
    scoreInput2.dataset.player = '2';
    scoreInput2.value = match.score2;
    scoreInput2.addEventListener('input', function(e) {
        let val = this.value.replace(/[^0-9]/g, '');
        if (val.length >= 2) this.value = val.slice(0, 2);
        trySaveResult();
    });
    
    player2Row.appendChild(player2Name);
    player2Row.appendChild(scoreInput2);
    
    matchDiv.appendChild(player1Row);
    matchDiv.appendChild(player2Row);
    
    return matchDiv;
}

function updateGroupLosersMatchResult(match) {
    const matchDiv = document.querySelector(`.bracket-match[data-id="${match.id}"][data-type="groupLosers"]`);
    if (!matchDiv) return;
    
    const scoreInput1 = matchDiv.querySelector('.score-input[data-player="1"]');
    const scoreInput2 = matchDiv.querySelector('.score-input[data-player="2"]');
    const score1 = scoreInput1.value.trim();
    const score2 = scoreInput2.value.trim();
    
    if (match.score1 === score1 && match.score2 === score2) return;
    
    match.score1 = score1;
    match.score2 = score2;
    
    if (score1 && score2) {
        if (parseInt(score1) > parseInt(score2)) {
            match.winner = match.player1;
            match.loser = match.player2;
        } else {
            match.winner = match.player2;
            match.loser = match.player1;
        }
        updateGroupLosersNextRounds(match);
        displayGroupLosersBracket();
    }
    
    saveState();
}

function updateGroupLosersNextRounds(match) {
    const nextMatchMap = {
        gl_r16_1: { nextRound: 'quarterfinals', nextMatchIndex: 0, nextPlayer: 1 },
        gl_r16_2: { nextRound: 'quarterfinals', nextMatchIndex: 0, nextPlayer: 2 },
        gl_r16_3: { nextRound: 'quarterfinals', nextMatchIndex: 1, nextPlayer: 1 },
        gl_r16_4: { nextRound: 'quarterfinals', nextMatchIndex: 1, nextPlayer: 2 },
        gl_r16_5: { nextRound: 'quarterfinals', nextMatchIndex: 2, nextPlayer: 1 },
        gl_r16_6: { nextRound: 'quarterfinals', nextMatchIndex: 2, nextPlayer: 2 },
        gl_r16_7: { nextRound: 'quarterfinals', nextMatchIndex: 3, nextPlayer: 1 },
        gl_r16_8: { nextRound: 'quarterfinals', nextMatchIndex: 3, nextPlayer: 2 },
        gl_qf1: { nextRound: 'semifinals', nextMatchIndex: 0, nextPlayer: 1 },
        gl_qf2: { nextRound: 'semifinals', nextMatchIndex: 0, nextPlayer: 2 },
        gl_qf3: { nextRound: 'semifinals', nextMatchIndex: 1, nextPlayer: 1 },
        gl_qf4: { nextRound: 'semifinals', nextMatchIndex: 1, nextPlayer: 2 },
        gl_sf1: { nextRound: 'final', nextPlayer: 1, loserMatch: 'thirdPlace', loserPlayer: 1 },
        gl_sf2: { nextRound: 'final', nextPlayer: 2, loserMatch: 'thirdPlace', loserPlayer: 2 },
    };
    
    const info = nextMatchMap[match.id];
    if (!info) return;
    
    if (info.nextRound) {
        let nextMatch;
        if (info.nextRound === 'quarterfinals') nextMatch = groupLosersKnockoutMatches.quarterfinals[info.nextMatchIndex];
        else if (info.nextRound === 'semifinals') nextMatch = groupLosersKnockoutMatches.semifinals[info.nextMatchIndex];
        else if (info.nextRound === 'final') nextMatch = groupLosersKnockoutMatches.final;
        
        if (nextMatch && match.winner) {
            if (info.nextPlayer === 1) nextMatch.player1 = match.winner;
            else nextMatch.player2 = match.winner;
            displayGroupLosersBracket();
        }
    }
    
    if (info.loserMatch && match.loser) {
        const loserMatch = groupLosersKnockoutMatches[info.loserMatch];
        if (loserMatch) {
            if (info.loserPlayer === 1) loserMatch.player1 = match.loser;
            else loserMatch.player2 = match.loser;
            displayGroupLosersBracket();
        }
    }
    
    saveState();
}

function handleGroupLosersByes() {
    const allMatches = [
        ...groupLosersKnockoutMatches.quarterfinals,
        ...groupLosersKnockoutMatches.semifinals,
        groupLosersKnockoutMatches.final,
        groupLosersKnockoutMatches.thirdPlace
    ].filter(m => m);
    
    allMatches.forEach(match => {
        if (match.player1 && match.player2 && (match.player1 === "WOLNY LOS" || match.player2 === "WOLNY LOS") && !match.winner) {
            const isPlayer1Bye = match.player1 === "WOLNY LOS";
            match.winner = isPlayer1Bye ? match.player2 : match.player1;
            match.loser = isPlayer1Bye ? match.player1 : match.player2;
            match.score1 = isPlayer1Bye ? '0' : '3';
            match.score2 = isPlayer1Bye ? '3' : '0';
            updateGroupLosersNextRounds(match);
        }
    });
}

function generateGroupLosersConsolationBracket() {
    const bracketContainer = document.getElementById('groupLosers-consolation-bracket');
    if (!bracketContainer) return;
    
   if (groupLosersTournamentMode !== 'yes') {
        alert(t('enableGroupLosersFirst'));
        return;
    }
    
    let hasLosers = false;
    if (groupLosersKnockoutMatches.quarterfinals) {
        hasLosers = groupLosersKnockoutMatches.quarterfinals.some(m => isMatchActuallyPlayed(m) && m.loser && m.loser !== "WOLNY LOS");
    }
    if (!hasLosers && groupLosersKnockoutMatches.round16) {
        hasLosers = groupLosersKnockoutMatches.round16.some(m => isMatchActuallyPlayed(m) && m.loser && m.loser !== "WOLNY LOS");
    }
    
    if (!hasLosers) {
        bracketContainer.innerHTML = '<div class="bracket-empty-msg">' + t('groupLosersConsolationWaiting') + '</div>';
        return;
    }
    
    const knockoutSize = groupLosersKnockoutSize;
    
    let losers = [];
    
    if (groupLosersKnockoutMatches.quarterfinals) {
        groupLosersKnockoutMatches.quarterfinals.forEach(match => {
            if (isMatchActuallyPlayed(match) && match.loser && match.loser !== "WOLNY LOS") {
                losers.push(match.loser);
            }
        });
    }
    
    if (groupLosersKnockoutMatches.round16 && groupLosersKnockoutMatches.round16.length > 0) {
        groupLosersKnockoutMatches.round16.forEach(match => {
            if (isMatchActuallyPlayed(match) && match.loser && match.loser !== "WOLNY LOS") {
                losers.push(match.loser);
            }
        });
    }
    
    if (losers.length < 4) {
        bracketContainer.innerHTML = '<div class="bracket-empty-msg">' + t('waitingForLosers') + '</div>';
        return;
    }
    
    const colorClasses = [
        'player-color-1', 'player-color-2', 'player-color-3', 'player-color-4',
        'player-color-5', 'player-color-6', 'player-color-7', 'player-color-8'
    ];
    const uniqueLosers = [...new Set(losers.filter(p => p !== "WOLNY LOS"))];
    uniqueLosers.forEach((player, index) => {
        if (!groupLosersPlayerColors[player]) {
            groupLosersPlayerColors[player] = colorClasses[index % colorClasses.length];
        }
    });
    
    groupLosersConsolationMatches.quarterfinals = [];
    groupLosersConsolationMatches.semifinals = [];
    groupLosersConsolationMatches.final = null;
    groupLosersConsolationMatches.eleventh = null;
    
    if (knockoutSize === 16 && losers.length >= 8) {
        groupLosersConsolationMatches.quarterfinals = [
            { id: 'gl_cqf1', player1: losers[0], player2: losers[1], score1: '', score2: '', winner: null, loser: null },
            { id: 'gl_cqf2', player1: losers[2], player2: losers[3], score1: '', score2: '', winner: null, loser: null },
            { id: 'gl_cqf3', player1: losers[4], player2: losers[5], score1: '', score2: '', winner: null, loser: null },
            { id: 'gl_cqf4', player1: losers[6], player2: losers[7], score1: '', score2: '', winner: null, loser: null }
        ];
        groupLosersConsolationMatches.semifinals = [
            { id: 'gl_csf1', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null },
            { id: 'gl_csf2', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null }
        ];
        groupLosersConsolationMatches.final = { id: 'gl_cfinal', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null };
        groupLosersConsolationMatches.eleventh = { id: 'gl_celebenth', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null };
    } else {
        const consolationParticipants = losers.slice(0, 4);
        groupLosersConsolationMatches.semifinals = [
            { id: 'gl_csf1', player1: consolationParticipants[0], player2: consolationParticipants[1], score1: '', score2: '', winner: null, loser: null },
            { id: 'gl_csf2', player1: consolationParticipants[2], player2: consolationParticipants[3], score1: '', score2: '', winner: null, loser: null }
        ];
        groupLosersConsolationMatches.final = { id: 'gl_cfinal', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null };
        groupLosersConsolationMatches.eleventh = { id: 'gl_celebenth', player1: null, player2: null, score1: '', score2: '', winner: null, loser: null };
    }
    
    displayGroupLosersConsolationBracket();
}
function createGroupLosersConsolationMatchElement(match) {
    const matchDiv = document.createElement('div');
    matchDiv.className = 'bracket-match';
    
    if (match.id === 'gl_cfinal') matchDiv.classList.add('final-match');
    if (match.id === 'gl_celebenth') matchDiv.classList.add('third-place-match');
    
    matchDiv.dataset.id = match.id;
    matchDiv.dataset.type = 'groupLosersConsolation';
    
    function trySaveResult() {
        const score1 = scoreInput1.value.trim();
        const score2 = scoreInput2.value.trim();
        if (score1 !== '' && score2 !== '') {
            updateGroupLosersConsolationMatchResult(match);
        }
    }
    
    const player1Row = document.createElement('div');
    player1Row.className = 'bracket-player';
    if (match.player1 && groupLosersPlayerColors[match.player1]) {
        player1Row.classList.add(groupLosersPlayerColors[match.player1]);
    }
    
    const player1Name = document.createElement('span');
    player1Name.className = 'player-name';
    player1Name.textContent = match.player1 ? (match.player1 === "WOLNY LOS" ? t('bye') : match.player1) : '?';
    
    const scoreInput1 = document.createElement('input');
    scoreInput1.type = 'text';
    scoreInput1.className = 'score-input';
    scoreInput1.placeholder = '0';
    scoreInput1.dataset.player = '1';
    scoreInput1.value = match.score1;
    scoreInput1.addEventListener('input', function(e) {
        let val = this.value.replace(/[^0-9]/g, '');
        if (val.length >= 2) this.value = val.slice(0, 2);
        trySaveResult();
    });
    
    player1Row.appendChild(player1Name);
    player1Row.appendChild(scoreInput1);
    
    const player2Row = document.createElement('div');
    player2Row.className = 'bracket-player';
    if (match.player2 && groupLosersPlayerColors[match.player2]) {
        player2Row.classList.add(groupLosersPlayerColors[match.player2]);
    }
    
    const player2Name = document.createElement('span');
    player2Name.className = 'player-name';
    player2Name.textContent = match.player2 ? (match.player2 === "WOLNY LOS" ? t('bye') : match.player2) : '?';
    
    const scoreInput2 = document.createElement('input');
    scoreInput2.type = 'text';
    scoreInput2.className = 'score-input';
    scoreInput2.placeholder = '0';
    scoreInput2.dataset.player = '2';
    scoreInput2.value = match.score2;
    scoreInput2.addEventListener('input', function(e) {
        let val = this.value.replace(/[^0-9]/g, '');
        if (val.length >= 2) this.value = val.slice(0, 2);
        trySaveResult();
    });
    
    player2Row.appendChild(player2Name);
    player2Row.appendChild(scoreInput2);
    
    matchDiv.appendChild(player1Row);
    matchDiv.appendChild(player2Row);
    
    return matchDiv;
}

function displayGroupLosersConsolationBracket() {
    const bracketContainer = document.getElementById('groupLosers-consolation-bracket');
    if (!bracketContainer) return;
    
    const hasQuarterfinals = groupLosersConsolationMatches.quarterfinals && 
                             groupLosersConsolationMatches.quarterfinals.length > 0 && 
                             groupLosersConsolationMatches.quarterfinals.some(m => m.player1);
    const hasSemifinals = groupLosersConsolationMatches.semifinals && 
                          groupLosersConsolationMatches.semifinals.length > 0 && 
                          groupLosersConsolationMatches.semifinals.some(m => m.player1);
    
    if (!hasQuarterfinals && !hasSemifinals) {
        bracketContainer.innerHTML = '';
        return;
    }
    
    bracketContainer.innerHTML = '';
    const bracketWrapper = document.createElement('div');
    bracketWrapper.className = 'bracket';
    
    if (hasQuarterfinals) {
        // Ćwierćfinały (miejsca 29-32)
        const qfColumn = document.createElement('div');
        qfColumn.className = 'bracket-column';
        const qfTitle = document.createElement('h3');
        qfTitle.className = 'round-title';
        qfTitle.textContent = t('quarterfinalsWithPlaces').replace('{range}', '29-32');
        qfColumn.appendChild(qfTitle);
        groupLosersConsolationMatches.quarterfinals.forEach(match => {
            qfColumn.appendChild(createGroupLosersConsolationMatchElement(match));
        });
        bracketWrapper.appendChild(qfColumn);
        
        // Półfinały
        const semisColumn = document.createElement('div');
        semisColumn.className = 'bracket-column';
        const semisTitle = document.createElement('h3');
        semisTitle.className = 'round-title';
        semisTitle.textContent = t('semifinals');
        semisColumn.appendChild(semisTitle);
        groupLosersConsolationMatches.semifinals.forEach(match => {
            semisColumn.appendChild(createGroupLosersConsolationMatchElement(match));
        });
        bracketWrapper.appendChild(semisColumn);
        
        // Mecze finałowe
        const finalColumn = document.createElement('div');
        finalColumn.className = 'bracket-column';
        
        const eleventhTitle = document.createElement('h3');
        eleventhTitle.className = 'round-title';
        eleventhTitle.textContent = t('matchForPlace').replace('{place}', '27');
        finalColumn.appendChild(eleventhTitle);
        if (groupLosersConsolationMatches.eleventh) {
            finalColumn.appendChild(createGroupLosersConsolationMatchElement(groupLosersConsolationMatches.eleventh));
        }
        
        const finalTitle = document.createElement('h3');
        finalTitle.className = 'round-title';
        finalTitle.textContent = t('matchForPlace').replace('{place}', '25');
        finalColumn.appendChild(finalTitle);
        if (groupLosersConsolationMatches.final) {
            finalColumn.appendChild(createGroupLosersConsolationMatchElement(groupLosersConsolationMatches.final));
        }
        
        bracketWrapper.appendChild(finalColumn);
    } else if (hasSemifinals) {
        // Półfinały pocieszenia (mecze o miejsca 29-30)
        const semisColumn = document.createElement('div');
        semisColumn.className = 'bracket-column';
        const semisTitle = document.createElement('h3');
        semisTitle.className = 'round-title';
        semisTitle.textContent = t('semifinals');
        semisColumn.appendChild(semisTitle);
        groupLosersConsolationMatches.semifinals.forEach(match => {
            semisColumn.appendChild(createGroupLosersConsolationMatchElement(match));
        });
        bracketWrapper.appendChild(semisColumn);
        
        // Mecz o 31. miejsce
        const seventhColumn = document.createElement('div');
        seventhColumn.className = 'bracket-column';
        const seventhTitle = document.createElement('h3');
        seventhTitle.className = 'round-title';
        seventhTitle.textContent = t('matchForPlace').replace('{place}', '27');
        seventhColumn.appendChild(seventhTitle);
        if (groupLosersConsolationMatches.eleventh) {
            seventhColumn.appendChild(createGroupLosersConsolationMatchElement(groupLosersConsolationMatches.eleventh));
        }
        bracketWrapper.appendChild(seventhColumn);
        
        // Mecz o 29. miejsce
        const fifthColumn = document.createElement('div');
        fifthColumn.className = 'bracket-column';
        const fifthTitle = document.createElement('h3');
        fifthTitle.className = 'round-title';
        fifthTitle.textContent = t('matchForPlace').replace('{place}', '25');
        fifthColumn.appendChild(fifthTitle);
        if (groupLosersConsolationMatches.final) {
            fifthColumn.appendChild(createGroupLosersConsolationMatchElement(groupLosersConsolationMatches.final));
        }
        bracketWrapper.appendChild(fifthColumn);
    }
    
    bracketContainer.appendChild(bracketWrapper);
}


function setGroupLosersConsolationMode(value) {
    groupLosersConsolationMode = value;
    const btnYes = document.getElementById('btn-gl-consolation-yes');
    const btnNo = document.getElementById('btn-gl-consolation-no');

    if (value === 'yes') {
        btnYes.classList.add('active');
        btnNo.classList.remove('active');
        _safeSetDisplay('groupLosersConsolationSection', 'block');
    } else {
        btnYes.classList.remove('active');
        btnNo.classList.add('active');
        _safeSetDisplay('groupLosersConsolationSection', 'none');
    }

    refreshKnockoutTabsVisibility();
    _syncAllToggleSwitchAria();
    saveState();
}

function updateGroupLosersConsolationMatchResult(match) {
    const matchDiv = document.querySelector(`.bracket-match[data-id="${match.id}"][data-type="groupLosersConsolation"]`);
    if (!matchDiv) return;
    
    const scoreInput1 = matchDiv.querySelector('.score-input[data-player="1"]');
    const scoreInput2 = matchDiv.querySelector('.score-input[data-player="2"]');
    const score1 = scoreInput1.value.trim();
    const score2 = scoreInput2.value.trim();
    
    if (match.score1 === score1 && match.score2 === score2) return;
    
    match.score1 = score1;
    match.score2 = score2;
    
    if (score1 && score2) {
        if (parseInt(score1) > parseInt(score2)) {
            match.winner = match.player1;
            match.loser = match.player2;
        } else {
            match.winner = match.player2;
            match.loser = match.player1;
        }
        updateGroupLosersConsolationNextRounds(match);
        displayGroupLosersConsolationBracket();
    }
    
    saveState();
}

const nextGroupLosersConsolationMatchMap = {
    gl_cqf1: { nextRound: 'semifinals', nextMatchIndex: 0, nextPlayer: 1 },
    gl_cqf2: { nextRound: 'semifinals', nextMatchIndex: 0, nextPlayer: 2 },
    gl_cqf3: { nextRound: 'semifinals', nextMatchIndex: 1, nextPlayer: 1 },
    gl_cqf4: { nextRound: 'semifinals', nextMatchIndex: 1, nextPlayer: 2 },
    gl_csf1: { nextRound: 'final', nextPlayer: 1, loserMatch: 'eleventh', loserPlayer: 1 },
	gl_csf2: { nextRound: 'final', nextPlayer: 2, loserMatch: 'eleventh', loserPlayer: 2 },
    gl_cfinal: null,
    gl_celebenth: null
};

function updateGroupLosersConsolationNextRounds(match) {
    const info = nextGroupLosersConsolationMatchMap[match.id];
    if (!info) return;
    
    if (info.nextRound) {
        let nextMatch;
        if (info.nextRound === 'semifinals') nextMatch = groupLosersConsolationMatches.semifinals[info.nextMatchIndex];
        else if (info.nextRound === 'final') nextMatch = groupLosersConsolationMatches.final;
        
        if (nextMatch && match.winner) {
            if (info.nextPlayer === 1) nextMatch.player1 = match.winner;
            else nextMatch.player2 = match.winner;
            displayGroupLosersConsolationBracket();
        }
    }
    
    if (info.loserMatch && match.loser) {
        const loserMatch = groupLosersConsolationMatches[info.loserMatch];
        if (loserMatch) {
            if (info.loserPlayer === 1) loserMatch.player1 = match.loser;
            else loserMatch.player2 = match.loser;
            displayGroupLosersConsolationBracket();
        }
    }
    
    saveState();
}



// ========== ZMIENNE STANU DLA SEKCJI PUCHAROWYCH ==========
let activeKnockoutTab = 'main';
let activeKnockoutView = 'bracket';


// ========== PRZEŁĄCZANIE ZAKŁADEK ==========
function switchKnockoutTab(section, tab) {
    if (section !== 'knockout') return;

    activeKnockoutTab = tab;
    document.querySelectorAll('.knockout-tab-btn[data-target="knockout"]').forEach(btn => {
        const isSelected = btn.dataset.tab === tab;
        btn.classList.toggle('active', isSelected);
        _ariaSelected(btn, isSelected);
        btn.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    // Ukryj wszystkie zakładki knockout
    const allTabs = ['main', 'consolation', 'losers', 'losersConsolation', 'classification'];
    allTabs.forEach(t => {
        const el = document.getElementById('knockout-tab-' + t);
        if (el) {
            el.style.display = 'none';
            _ariaHidden(el, true);
        }
    });

    // Pokaż wybraną
    const selectedTab = document.getElementById('knockout-tab-' + tab);
    if (selectedTab) {
        selectedTab.style.display = 'block';
        _ariaHidden(selectedTab, false);
    }

    // Jeśli klasyfikacja - wygeneruj
    if (tab === 'classification') {
        showFinalClassificationInline();
    }

    saveState();
}

// ========== PRZEŁĄCZANIE WIDOKU (DRABINKA / HARMONOGRAM) ==========
function switchKnockoutSubView(tabOrView, view) {
    // Jeśli podano 2 parametry - to switchKnockoutSubView(tab, view)
    if (view !== undefined) {
        activeKnockoutTab = tabOrView;
        activeKnockoutView = view;
        
        // Aktualizuj przyciski tylko w aktywnej zakładce
        const tabElement = document.getElementById('knockout-tab-' + tabOrView);
        if (tabElement) {
            tabElement.querySelectorAll('.view-btn').forEach(btn => {
                const isActive = btn.dataset.view === view;
                btn.classList.toggle('active', isActive);
                _ariaSelected(btn, isActive);
                btn.setAttribute('tabindex', isActive ? '0' : '-1');
            });
        }
    } else {
        // Jeśli 1 parametr - to stary switchKnockoutView(view)
        activeKnockoutView = tabOrView;
        
        // Aktualizuj wszystkie przyciski view-btn
        document.querySelectorAll('.view-btn').forEach(btn => {
            const isActive = btn.dataset.view === tabOrView;
            btn.classList.toggle('active', isActive);
            _ariaSelected(btn, isActive);
            btn.setAttribute('tabindex', isActive ? '0' : '-1');
        });
    }
    
    refreshKnockoutDisplay();
    saveState();
}

function refreshKnockoutDisplay() {
    const tabIds = {
        'main': 'knockout-tab-main',
        'consolation': 'knockout-tab-consolation', 
        'losers': 'knockout-tab-losers',
        'losersConsolation': 'knockout-tab-losersConsolation',
        'classification': 'knockout-tab-classification'
    };

    const currentTabId = tabIds[activeKnockoutTab];
    if (!currentTabId) return;

    const currentTab = document.getElementById(currentTabId);
    if (!currentTab) return;

    // Find bracket and schedule containers within current tab
    const bracketEl = currentTab.querySelector('.bracket');
    const scheduleEl = currentTab.querySelector('.schedule-container');

    if (!bracketEl || !scheduleEl) return;

    if (activeKnockoutView === 'bracket') {
        bracketEl.style.display = 'block';
        scheduleEl.style.display = 'none';
        scheduleEl.classList.remove('active');

        // Refresh appropriate bracket
        if (activeKnockoutTab === 'main') displayBracket();
        else if (activeKnockoutTab === 'consolation') displayConsolationBracket();
        else if (activeKnockoutTab === 'losers') displayGroupLosersBracket();
        else if (activeKnockoutTab === 'losersConsolation') displayGroupLosersConsolationBracket();
    } else {
        bracketEl.style.display = 'none';
        scheduleEl.style.display = 'block';
        scheduleEl.classList.add('active');
        renderKnockoutSchedule();
    }
}

// ========== POBIERANIE MECZÓW DO HARMONOGRAMU ==========
function getKnockoutMatchesForSchedule(matchesObj, type) {
    const result = [];

    // Kolejność rund
    const rounds = [];

    // Nazwy rund zależne od typu turnieju
    const isConsolation = type === 'consolation';
    const isGroupLosers = type === 'groupLosers';
    const isGroupLosersConsolation = type === 'groupLosersConsolation';
    const isMain = type === 'knockout';

    if (matchesObj.round16 && matchesObj.round16.length > 0) {
        rounds.push({ name: t('round16'), matches: matchesObj.round16, roundId: 'round16' });
    }
    if (matchesObj.quarterfinals && matchesObj.quarterfinals.length > 0) {
        let range = '5-8';
        if (isConsolation) range = '13-16';
        else if (isGroupLosers) range = '21-24';
        else if (isGroupLosersConsolation) range = '29-32';
        rounds.push({ name: t('quarterfinalsWithPlaces').replace('{range}', range), matches: matchesObj.quarterfinals, roundId: 'quarterfinals' });
    }
    if (matchesObj.semifinals && matchesObj.semifinals.length > 0) {
        rounds.push({ name: t('semifinals'), matches: matchesObj.semifinals, roundId: 'semifinals' });
    }
    if (matchesObj.thirdPlace) {
        let place = '3';
        if (isGroupLosers) place = '19';
        else if (isGroupLosersConsolation) place = '27';
        rounds.push({ name: t('matchForPlace').replace('{place}', place), matches: [matchesObj.thirdPlace], roundId: 'thirdPlace' });
    }
    if (matchesObj.fifthPlace) {
        let place = '5';
        if (isGroupLosersConsolation) place = '25';
        rounds.push({ name: t('matchForPlace').replace('{place}', place), matches: [matchesObj.fifthPlace], roundId: 'fifthPlace' });
    }
    if (matchesObj.eleventh) {
        let place = '11';
        if (isGroupLosersConsolation) place = '27';
        rounds.push({ name: t('matchForPlace').replace('{place}', place), matches: [matchesObj.eleventh], roundId: 'eleventh' });
    }
    if (matchesObj.final) {
        let name = t('final');
        if (isConsolation) name = t('matchForPlace').replace('{place}', '9');
        else if (isGroupLosers) name = t('matchForPlace').replace('{place}', '17');
        else if (isGroupLosersConsolation) name = t('matchForPlace').replace('{place}', '25');
        rounds.push({ name: name, matches: [matchesObj.final], roundId: 'final' });
    }
    if (matchesObj.seventhPlace) {
        let place = '7';
        if (isGroupLosersConsolation) place = '27';
        rounds.push({ name: t('matchForPlace').replace('{place}', place), matches: [matchesObj.seventhPlace], roundId: 'seventhPlace' });
    }

    let globalIndex = 0;
    rounds.forEach(round => {
        round.matches.forEach(match => {
            if (match && (match.player1 || match.player2)) {
                result.push({
                    ...match,
                    roundName: round.name,
                    roundId: round.roundId,
                    globalIndex: globalIndex++,
                    matchType: type
                });
            }
        });
    });

    return result;
}

// ========== SPRAWDZANIE CZY MECZ JEST ZABLOKOWANY ==========
function isKnockoutMatchLocked(match, allMatches, matchesObj) {
    if (!match.player1 || !match.player2 || match.player1 === '?' || match.player2 === '?') {
        return true;
    }
    // Mecz z WOLNY LOS NIE jest zablokowany - zostanie auto-rozstrzygnięty
    if (match.player1 === "WOLNY LOS" || match.player2 === "WOLNY LOS") {
        return false;
    }
    const roundOrder = ['round16', 'quarterfinals', 'semifinals', 'thirdPlace', 'fifthPlace', 'eleventh', 'final', 'seventhPlace'];
    const matchRound = match.roundId || '';
    const matchRoundIndex = roundOrder.indexOf(matchRound);

    if (matchRoundIndex <= 0) return false;

    for (let i = 0; i < matchRoundIndex; i++) {
        const prevRoundId = roundOrder[i];
        let prevMatches = [];
        if (matchesObj[prevRoundId]) {
            prevMatches = Array.isArray(matchesObj[prevRoundId]) ? matchesObj[prevRoundId] : [matchesObj[prevRoundId]];
        }
        const hasUnfinished = prevMatches.some(m => {
            if (!m || (!m.player1 && !m.player2)) return false;
            if (m.player1 === "WOLNY LOS" || m.player2 === "WOLNY LOS") return false;
            return !m.score1 || !m.score2;
        });
        if (hasUnfinished) return true;
    }
    return false;
}

// ========== HARMONOGRAM PUCHAROWY (identyczny jak grupowy) ==========

function renderKnockoutSchedule() {
    const mode = document.getElementById('mode').value;
    let matchesObj, type, colors;

    if (activeKnockoutTab === 'main') {
        matchesObj = mode === 'manual' ? manualKnockoutMatches : autoKnockoutMatches;
        type = 'knockout';
        colors = mode === 'manual' ? manualPlayerColors : autoPlayerColors;
    } else if (activeKnockoutTab === 'consolation') {
        matchesObj = mode === 'manual' ? manualConsolationMatches : autoConsolationMatches;
        type = 'consolation';
        colors = mode === 'manual' ? manualPlayerColors : autoPlayerColors;
    } else if (activeKnockoutTab === 'losers') {
        matchesObj = groupLosersKnockoutMatches;
        type = 'groupLosers';
        colors = groupLosersPlayerColors;
    } else if (activeKnockoutTab === 'losersConsolation') {
        matchesObj = groupLosersConsolationMatches;
        type = 'groupLosersConsolation';
        colors = groupLosersPlayerColors;
    } else {
        return;
    }

    const tabId = 'knockout-tab-' + activeKnockoutTab;
    const currentTab = document.getElementById(tabId);
    if (!currentTab) return;

    const scheduleContainer = currentTab.querySelector('.schedule-container');
    if (!scheduleContainer) return;

    const matches = getKnockoutMatchesForSchedule(matchesObj, type);

    if (matches.length === 0) {
        scheduleContainer.innerHTML = '<p class="bracket-empty-msg">' + (t('noMatches') || 'Brak meczów do wyświetlenia.') + '</p>';
        return;
    }

    const previousStates = {};
    matches.forEach(match => {
        const matchId = `${type}-schedule-${match.id}`;
        if (localStorage.getItem(`matchProgress_${matchId}`) === 'true') {
            previousStates[matchId] = true;
        }
    });

    let scheduleHTML = '<div class="knockout-schedule-container">';

    matches.forEach((match, idx) => {
        const isPlayed = match.score1 !== '' && match.score2 !== '';
        const hasBye = match.player1 === "WOLNY LOS" || match.player2 === "WOLNY LOS";
        const isByeResolved = hasBye && isPlayed;
        const isLocked = !isPlayed && !hasBye && isKnockoutMatchLocked(match, matches, matchesObj);
        const statusClass = isByeResolved ? 'played' : (isPlayed ? 'played' : (isLocked ? 'locked' : 'pending'));
        const statusText = isByeResolved ? (t('played') || 'Rozegrany') : (isPlayed ? (t('played') || 'Rozegrany') : (isLocked ? (t('locked') || 'Zablokowany') : (t('waiting') || 'Oczekuje')));
        const matchId = `${type}-schedule-${match.id}`;
        const wasInProgress = previousStates[matchId] === true;

        const player1Class = match.player1 && colors[match.player1] ? colors[match.player1] : '';
        const player2Class = match.player2 && colors[match.player2] ? colors[match.player2] : '';

        const displayScore1 = match.score1 || '';
        const displayScore2 = match.score2 || '';

        scheduleHTML += `
            <div class="knockout-schedule-match ${isByeResolved ? 'match-played' : ''} ${wasInProgress ? 'match-in-progress' : ''} ${isLocked ? 'locked' : ''}" id="${matchId}" data-match-id="${match.id}" data-match-type="${type}">
                <div class="match-round-label">${match.roundName}</div>
                <div class="match-players">
                    <div class="match-player ${player1Class}">${escapeHtml(match.player1 ? (match.player1 === "WOLNY LOS" ? t('bye') : match.player1) : '?')}</div>
                    <div class="match-player vs">vs</div>
                    <div class="match-player ${player2Class}">${escapeHtml(match.player2 ? (match.player2 === "WOLNY LOS" ? t('bye') : match.player2) : '?')}</div>
                </div>
                <div class="match-result">
                    <input type="text" class="match-result-input" 
       placeholder="0" value="${displayScore1}" 
       oninput="tryUpdateKnockoutMatchFromSchedule('${match.id}', '${type}', this, 'player1')"
       onchange="updateKnockoutMatchFromSchedule('${match.id}', '${type}', this, 'player1')"
       ${isLocked || isByeResolved ? 'disabled' : ''}>
                    <span>:</span>
                    <input type="text" class="match-result-input" 
       placeholder="0" value="${displayScore2}" 
       oninput="tryUpdateKnockoutMatchFromSchedule('${match.id}', '${type}', this, 'player2')"
       onchange="updateKnockoutMatchFromSchedule('${match.id}', '${type}', this, 'player2')"
       ${isLocked || isByeResolved ? 'disabled' : ''}>
                </div>
                <div class="match-status ${statusClass}">${statusText}</div>
                <div class="match-checkbox">
                    <label class="in-progress-label">
                        <input type="checkbox" class="match-inprogress-checkbox" 
                               ${wasInProgress ? 'checked' : ''}
                               ${isLocked || isByeResolved || isPlayed ? 'disabled' : ''}
                               onchange="toggleKnockoutMatchInProgress('${match.id}', '${type}', this)">
                        ${t('inProgress') || 'Trwa'}
                    </label>
                </div>
            </div>
        `;
    });

    scheduleHTML += '</div>';
    scheduleContainer.innerHTML = scheduleHTML;

    // ===== AUTO-BYE: Po renderowaniu, auto-rozstrzygnij wszystkie mecze z WOLNY LOS =====
    setTimeout(() => {
        matches.forEach(match => {
            if ((match.player1 === "WOLNY LOS" || match.player2 === "WOLNY LOS") && !match.winner) {
                const matchEl = document.getElementById(`${type}-schedule-${match.id}`);
                if (matchEl) {
                    const input1 = matchEl.querySelector('.match-result-input:nth-child(1)');
                    if (input1) {
                        updateKnockoutMatchFromSchedule(match.id, type, input1, 'player1');
                    }
                }
            }
        });
    }, 50);
}


// ========== AKTUALIZACJA WYNIKU Z HARMONOGRAMU ==========
function updateKnockoutMatchFromSchedule(matchId, matchType, inputElement, player) {
    const mode = document.getElementById('mode').value;
    let matchesObj;

    if (matchType === 'knockout') {
        matchesObj = mode === 'manual' ? manualKnockoutMatches : autoKnockoutMatches;
    } else if (matchType === 'consolation') {
        matchesObj = mode === 'manual' ? manualConsolationMatches : autoConsolationMatches;
    } else if (matchType === 'groupLosers') {
        matchesObj = groupLosersKnockoutMatches;
    } else if (matchType === 'groupLosersConsolation') {
        matchesObj = groupLosersConsolationMatches;
    } else {
        return;
    }

    let match = null;
    const allRounds = ['round16', 'quarterfinals', 'semifinals', 'final', 'thirdPlace', 'fifthPlace', 'seventhPlace', 'eleventh'];
    for (const round of allRounds) {
        if (matchesObj[round]) {
            const roundMatches = Array.isArray(matchesObj[round]) ? matchesObj[round] : [matchesObj[round]];
            const found = roundMatches.find(m => m && m.id === matchId);
            if (found) { match = found; break; }
        }
    }
    if (!match) return;

    // ===== AUTO-BYE: WOLNY LOS auto-wygrywa 3:0 =====
    if (match.player1 === "WOLNY LOS" || match.player2 === "WOLNY LOS") {
        const isPlayer1Bye = match.player1 === "WOLNY LOS";
        const winner = isPlayer1Bye ? match.player2 : match.player1;
        const loser = isPlayer1Bye ? match.player1 : match.player2;

        match.score1 = isPlayer1Bye ? '0' : '3';
        match.score2 = isPlayer1Bye ? '3' : '0';
        match.winner = winner;
        match.loser = loser;

        const scheduleMatchId = `${matchType}-schedule-${matchId}`;
        const matchItem = document.getElementById(scheduleMatchId);
        if (matchItem) {
            const s1 = matchItem.querySelector('.match-result-input:nth-child(1)');
            const s2 = matchItem.querySelector('.match-result-input:nth-child(3)');
            if (s1) s1.value = match.score1;
            if (s2) s2.value = match.score2;
            matchItem.classList.add('match-played');
            matchItem.classList.remove('match-in-progress');
            const statusDiv = matchItem.querySelector('.match-status');
            if (statusDiv) {
                statusDiv.textContent = t('played') || 'Rozegrany';
                statusDiv.className = 'match-status played';
            }
            const cb = matchItem.querySelector('.match-inprogress-checkbox');
            if (cb) { cb.checked = false; cb.disabled = true; }
            localStorage.removeItem(`matchProgress_${scheduleMatchId}`);
        }

        if (matchType === 'knockout') {
            updateNextRounds(match);
            displayBracket();
        } else if (matchType === 'consolation') {
            updateNextConsolationRounds(match);
            displayConsolationBracket();
        } else if (matchType === 'groupLosers') {
            updateGroupLosersNextRounds(match);
            displayGroupLosersBracket();
        } else if (matchType === 'groupLosersConsolation') {
            updateGroupLosersConsolationNextRounds(match);
            displayGroupLosersConsolationBracket();
        }

        setTimeout(() => renderKnockoutSchedule(), 100);
        saveState();
        return;
    }
    // ===== KONIEC AUTO-BYE =====

    const score1Input = inputElement.parentElement.querySelector('.match-result-input:nth-child(1)');
    const score2Input = inputElement.parentElement.querySelector('.match-result-input:nth-child(3)');
    const score1 = score1Input ? score1Input.value.trim() : '';
    const score2 = score2Input ? score2Input.value.trim() : '';

    if (score1 && score2 && (!/^\d+$/.test(score1) || !/^\d+$/.test(score2))) {
        alert(t('invalidScore') || 'Wynik musi być liczbą!');
        if (score1Input) score1Input.value = '';
        if (score2Input) score2Input.value = '';
        return;
    }

    const scheduleMatchId = `${matchType}-schedule-${matchId}`;
    const matchItem = document.getElementById(scheduleMatchId);

    if (score1 && score2) {
        match.score1 = score1;
        match.score2 = score2;
        if (parseInt(score1) > parseInt(score2)) {
            match.winner = match.player1;
            match.loser = match.player2;
        } else {
            match.winner = match.player2;
            match.loser = match.player1;
        }

        if (matchType === 'knockout') {
            updateNextRounds(match);
            displayBracket();
        } else if (matchType === 'consolation') {
            updateNextConsolationRounds(match);
            displayConsolationBracket();
        } else if (matchType === 'groupLosers') {
            updateGroupLosersNextRounds(match);
            displayGroupLosersBracket();
        } else if (matchType === 'groupLosersConsolation') {
            updateGroupLosersConsolationNextRounds(match);
            displayGroupLosersConsolationBracket();
        }

        if (matchItem) {
            matchItem.classList.add('match-played');
            matchItem.classList.remove('match-in-progress');
            
            // ZABLOKUJ INPUTY (jak w drabince)
            const s1 = matchItem.querySelector('.match-result-input:nth-child(1)');
            const s2 = matchItem.querySelector('.match-result-input:nth-child(3)');
            if (s1) s1.disabled = true;
            if (s2) s2.disabled = true;
            
            const statusDiv = matchItem.querySelector('.match-status');
            if (statusDiv) {
                statusDiv.textContent = t('played') || 'Rozegrany';
                statusDiv.className = 'match-status played';
            }
            const cb = matchItem.querySelector('.match-inprogress-checkbox');
            if (cb) { cb.checked = false; cb.disabled = true; }
            localStorage.removeItem(`matchProgress_${scheduleMatchId}`);
        }
        setTimeout(() => renderKnockoutSchedule(), 100);

    } else if (!score1 && !score2) {
        match.score1 = '';
        match.score2 = '';
        match.winner = null;
        match.loser = null;

        if (matchItem) {
            matchItem.classList.remove('match-played');
            
            // ODZABLOKUJ INPUTY (wynik usunięty)
            const s1 = matchItem.querySelector('.match-result-input:nth-child(1)');
            const s2 = matchItem.querySelector('.match-result-input:nth-child(3)');
            if (s1) s1.disabled = false;
            if (s2) s2.disabled = false;
            
            const statusDiv = matchItem.querySelector('.match-status');
            if (statusDiv) {
                const isLocked = isKnockoutMatchLocked(match, [], matchesObj);
                statusDiv.textContent = isLocked ? (t('locked') || 'Zablokowany') : (t('waiting') || 'Oczekuje');
                statusDiv.className = `match-status ${isLocked ? 'locked' : 'pending'}`;
            }
            const cb = matchItem.querySelector('.match-inprogress-checkbox');
            if (cb) cb.disabled = false;
        }
        if (matchType === 'knockout') displayBracket();
        else if (matchType === 'consolation') displayConsolationBracket();
        else if (matchType === 'groupLosers') displayGroupLosersBracket();
        else if (matchType === 'groupLosersConsolation') displayGroupLosersConsolationBracket();
    }
    saveState();
}

// Automatyczne zatwierdzanie wyniku w harmonogramie pucharowym
function tryUpdateKnockoutMatchFromSchedule(matchId, matchType, inputElement, player) {
    const mode = document.getElementById('mode').value;
    let matchesObj;

    if (matchType === 'knockout') {
        matchesObj = mode === 'manual' ? manualKnockoutMatches : autoKnockoutMatches;
    } else if (matchType === 'consolation') {
        matchesObj = mode === 'manual' ? manualConsolationMatches : autoConsolationMatches;
    } else if (matchType === 'groupLosers') {
        matchesObj = groupLosersKnockoutMatches;
    } else if (matchType === 'groupLosersConsolation') {
        matchesObj = groupLosersConsolationMatches;
    } else {
        return;
    }

    let match = null;
    const allRounds = ['round16', 'quarterfinals', 'semifinals', 'final', 'thirdPlace', 'fifthPlace', 'seventhPlace', 'eleventh'];
    for (const round of allRounds) {
        if (matchesObj[round]) {
            const roundMatches = Array.isArray(matchesObj[round]) ? matchesObj[round] : [matchesObj[round]];
            const found = roundMatches.find(m => m && m.id === matchId);
            if (found) { match = found; break; }
        }
    }
    if (!match) return;

    // Pomiń jeśli WOLNY LOS
    if (match.player1 === "WOLNY LOS" || match.player2 === "WOLNY LOS") return;

    const scheduleMatchId = `${matchType}-schedule-${matchId}`;
    const matchItem = document.getElementById(scheduleMatchId);
    if (!matchItem) return;

    const score1Input = matchItem.querySelector('.match-result-input:nth-child(1)');
    const score2Input = matchItem.querySelector('.match-result-input:nth-child(3)');
    const score1 = score1Input ? score1Input.value.trim() : '';
    const score2 = score2Input ? score2Input.value.trim() : '';

    // Zapisz tylko jeśli oba pola mają wartości
    if (score1 !== '' && score2 !== '') {
        updateKnockoutMatchFromSchedule(matchId, matchType, inputElement, player);
    }
}

// ========== TOGGLE "TRWA" DLA MECZÓW PUCHAROWYCH ==========
function toggleKnockoutMatchInProgress(matchId, matchType, checkbox) {
    const scheduleMatchId = `${matchType}-schedule-${matchId}`;
    const matchItem = document.getElementById(scheduleMatchId);

    if (checkbox.checked) {
        if (matchItem) matchItem.classList.add('match-in-progress');
        localStorage.setItem(`matchProgress_${scheduleMatchId}`, 'true');
    } else {
        if (matchItem) matchItem.classList.remove('match-in-progress');
        localStorage.removeItem(`matchProgress_${scheduleMatchId}`);
    }

    saveState();
}

// ========== NAKŁADKA NA ISTNIEJĄCE FUNKCJE ==========
// Zachowujemy oryginalne displayBracket i displayConsolationBracket
// ale dodajemy wrapper, który uwzględnia widok

// const _originalDisplayBracket = displayBracket;
// displayBracket = function() {
   //  if (activeKnockoutTab === 'main' && activeKnockoutView === 'bracket') {
//        _originalDisplayBracket();
   // }
// };

// const _originalDisplayConsolationBracket = displayConsolationBracket;
//displayConsolationBracket = function() {
  //  if (activeKnockoutTab === 'consolation' && activeKnockoutView === 'bracket') {
    //    _originalDisplayConsolationBracket();
    //}
//};

//const _originalDisplayGroupLosersBracket = displayGroupLosersBracket;
//displayGroupLosersBracket = function() {
//    if (activeKnockoutTab === 'losers' && activeKnockoutView === 'bracket') {
//        _originalDisplayGroupLosersBracket();
//    }
//};

//const _originalDisplayGroupLosersConsolationBracket = displayGroupLosersConsolationBracket;
//displayGroupLosersConsolationBracket = function() {
//    if (activeKnockoutTab === 'losersConsolation' && activeKnockoutView === 'bracket') {
//        _originalDisplayGroupLosersConsolationBracket();
//   }
// };

// ========== ZAPIS/WCZYTANIE STANU ==========
// Dodajemy do saveState dodatkowe pola
const _originalSaveState = saveState;
saveState = function() {
    _originalSaveState();

    // Dodaj nowe pola do istniejącego zapisu
    try {
        const categoryName = document.getElementById('subTitleInput').value;
        const storageKey = typeof getLocalStorageKey === 'function' ? getLocalStorageKey(categoryName) : ('tournamentData_' + (categoryName || 'default'));
        const currentData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        currentData.activeKnockoutTab = activeKnockoutTab;
        currentData.activeKnockoutView = activeKnockoutView;
        localStorage.setItem(storageKey, JSON.stringify(currentData));
    } catch(e) {
        console.error('Error saving knockout state:', e);
    }
};

// Dodajemy inicjalizację z loadState
const _originalLoadState = loadState;
loadState = function() {
    _originalLoadState();

    try {
        const categoryName = document.getElementById('subTitleInput').value;
        const storageKey = typeof getLocalStorageKey === 'function' ? getLocalStorageKey(categoryName) : ('tournamentData_' + (categoryName || 'default'));
        const savedData = JSON.parse(localStorage.getItem(storageKey) || '{}');

        if (savedData.activeKnockoutTab) {
            activeKnockoutTab = savedData.activeKnockoutTab;
            switchKnockoutTab('knockout', activeKnockoutTab);
        }
        if (savedData.activeKnockoutView) {
            activeKnockoutView = savedData.activeKnockoutView;
            // Update view buttons
            document.querySelectorAll('.tab-buttons-row .view-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === activeKnockoutView);
            });
        }

        refreshKnockoutTabsVisibility();

        // Odśwież widok
        refreshKnockoutDisplay();
    } catch(e) {
        console.error('Error loading knockout state:', e);
    }
};

// ========== OBSŁUGA TOGGLE CONSOLATION ==========
// Nadpisujemy toggleConsolationVisibility, aby odświeżyć widok
const _originalToggleConsolation = toggleConsolationVisibility;
toggleConsolationVisibility = function() {
    _originalToggleConsolation();
    if (activeKnockoutTab === 'consolation') {
        refreshKnockoutDisplay();
    }
};
