/**
 * Calculatrice GNOME (mode De base) — simulation Mint / org.gnome.Calculator
 */
(function initGnomeCalculatorApp(global) {
    'use strict';

    var GNOME_CALC_SESSION_KEY = 'capsule-gnome-calculator-session';
    var calcGnomeToastTimer = null;

    var OP_SYMBOL = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷'
    };

    /* Exposants unicode pour notation scientifique (gnome-calculator number-format: 'scientific') */
    var SUPERSCRIPT_MAP = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'
    };

    function toSuperscript(n) {
        return String(n).split('').map(function (c) {
            return SUPERSCRIPT_MAP[c] || c;
        }).join('');
    }

    function trimDecimalZeros(fixed) {
        return fixed.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
    }

    /**
     * Formate un résultat selon les règles VM Mint :
     *   number-format: 'scientific', accuracy: 9 (→ 9 décimales mantisse).
     *   exp === 0 (1 ≤ |v| < 10) → décimal plain avec virgule.
     *   Sinon → mantisse×10^exp avec superscripts unicode.
     *   Jamais de séparateurs de milliers (show-thousands: false).
     */
    function formatResult(value) {
        if (!isFinite(value)) {
            return 'Erreur';
        }
        if (value === 0) {
            return '0';
        }
        var abs = Math.abs(value);
        var sign = value < 0 ? '-' : '';
        /* correction flottante : log10(1000) peut valoir 2.9999… */
        var exp = Math.floor(Math.log10(abs) + 1e-10);

        if (exp === 0) {
            return sign + trimDecimalZeros(abs.toFixed(9)).replace('.', ',');
        }

        var mantissa = abs / Math.pow(10, exp);
        /* clamp flottant */
        if (mantissa >= 10 - 1e-9) {
            mantissa /= 10;
            exp += 1;
        } else if (mantissa < 1 && mantissa < 1 - 1e-9) {
            mantissa *= 10;
            exp -= 1;
        }
        var mFixed = trimDecimalZeros(mantissa.toFixed(9));
        return sign + mFixed.replace('.', ',') + '×10' + toSuperscript(exp);
    }

    /* Formate la chaîne interne (point décimal) pour l'affichage en cours de saisie. */
    function formatInput(numStr) {
        return String(numStr).replace('.', ',');
    }

    /* Tronque le résultat dans l'historique inline (parité VM : 8 chars + '...'). */
    function truncateHistResult(str) {
        if (str.length <= 8) {
            return str;
        }
        return str.slice(0, 8) + '...';
    }

    function parseDisplay(text) {
        if (!text || text === 'Erreur') {
            return 0;
        }
        var normalized = String(text).replace(/\s/g, '').replace(/,/g, '.');
        var num = parseFloat(normalized);
        return isNaN(num) ? 0 : num;
    }

    function compute(a, b, op) {
        if (op === '+') { return a + b; }
        if (op === '-') { return a - b; }
        if (op === '*') { return a * b; }
        if (op === '/') {
            if (b === 0) { return NaN; }
            return a / b;
        }
        return b;
    }

    function prefersGnomeCalculatorLayout() {
        var bodyId = global.document.body && global.document.body.id;
        return bodyId === 'rocky'
            || bodyId === 'fedora'
            || bodyId === 'alma'
            || bodyId === 'ubuntu'
            || bodyId === 'popos'
            || bodyId === 'anduinos';
    }

    function showCalcGnomeToast(root, message) {
        if (!root) {
            return;
        }
        var toast = root.querySelector('[data-calc-gnome-toast]');
        if (!toast) {
            return;
        }
        toast.textContent = message || 'Copié dans le presse-papiers';
        toast.hidden = false;
        if (calcGnomeToastTimer) {
            global.clearTimeout(calcGnomeToastTimer);
        }
        calcGnomeToastTimer = global.setTimeout(function hideCalcToast() {
            toast.hidden = true;
        }, 2200);
    }

    function syncCalcGnomeDataset(root, state) {
        if (!root || !prefersGnomeCalculatorLayout()) {
            return;
        }
        root.dataset.calcGnomeMode = state.mode || 'basic';
        root.dataset.calcGnomeHistoryCount = String(state.historyCount || 0);
        root.dataset.calcGnomeValue = state.displayValue || '0';
        if (typeof state.copied === 'boolean') {
            root.dataset.calcGnomeCopied = state.copied ? 'true' : 'false';
        }
    }

    function copyCalcGnomeResult(root, displayText) {
        var text = String(displayText || '0');
        syncCalcGnomeDataset(root, {
            mode: root.dataset.calcGnomeMode || 'basic',
            historyCount: parseInt(root.dataset.calcGnomeHistoryCount || '0', 10),
            displayValue: text,
            copied: true
        });
        if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
            global.navigator.clipboard.writeText(text.replace(/\s/g, '').replace(/,/g, '.')).catch(function noop() {
                /* presse-papiers indisponible hors HTTPS */
            });
        }
        showCalcGnomeToast(root, 'Copié dans le presse-papiers');
    }

    function initCalculatorApp() {
        var root = global.document.getElementById('gnomeCalculatorApp');
        if (!root || root.dataset.calcInit === 'true') {
            return;
        }
        root.dataset.calcInit = 'true';
        root.setAttribute('tabindex', '0');

        var exprEl = global.document.getElementById('gnome-calc-expr');
        var valueEl = global.document.getElementById('gnome-calc-value');
        var keypad = global.document.getElementById('gnome-calc-keypad');
        if (!exprEl || !valueEl || !keypad) {
            return;
        }

        /* État calculatrice */
        var accumulator = null;
        var operator = null;
        var current = '0';        /* chaîne interne : point décimal */
        var fresh = true;         /* vrai : le prochain chiffre démarre une nouvelle saisie */
        var hasDecimal = false;
        /* exprDisplay : expression construite pour l'affichage (symboles ÷×+−) */
        var exprDisplay = '';
        /* justComputed : vrai juste après "=" ou fonction — affiche formatResult(current) */
        var justComputed = false;

        function syncOpHighlight() {
            root.querySelectorAll('.gnome-calc__key--op[data-op]').forEach(function (btn) {
                var active = operator && btn.getAttribute('data-op') === operator;
                btn.classList.toggle('is-active', !!active);
            });
        }

        /* Texte affiché dans la zone valeur selon l'état courant. */
        function getValueDisplay() {
            if (current === 'Erreur') {
                return 'Erreur';
            }
            if (justComputed) {
                return formatResult(parseFloat(current));
            }
            if (fresh) {
                return exprDisplay || '0';
            }
            return exprDisplay + formatInput(current);
        }

        /* Ajoute une ligne dans le bandeau historique inline (zone exprEl). */
        function addInlineHistory(exprStr, resultFormatted) {
            var line = global.document.createElement('div');
            line.className = 'gnome-calc__history-line';
            var exprSpan = global.document.createElement('span');
            exprSpan.className = 'gnome-calc__history-expr';
            exprSpan.textContent = exprStr;
            var eqSpan = global.document.createElement('span');
            eqSpan.className = 'gnome-calc__history-eq';
            eqSpan.textContent = ' = ';
            var resSpan = global.document.createElement('span');
            resSpan.className = 'gnome-calc__history-res';
            resSpan.textContent = truncateHistResult(resultFormatted);
            line.appendChild(exprSpan);
            line.appendChild(eqSpan);
            line.appendChild(resSpan);
            exprEl.appendChild(line);
            /* Garder au plus 10 lignes — le CSS overflow cache les plus anciennes */
            while (exprEl.children.length > 10) {
                exprEl.removeChild(exprEl.firstChild);
            }
        }

        function render() {
            valueEl.textContent = getValueDisplay();
            syncOpHighlight();
            publishCalcState();
        }

        function clearAll() {
            accumulator = null;
            operator = null;
            current = '0';
            fresh = true;
            hasDecimal = false;
            exprDisplay = '';
            justComputed = false;
            render();
        }

        function inputDigit(digit) {
            if (justComputed) {
                /* Nouvelle expression après un résultat */
                justComputed = false;
                accumulator = null;
                operator = null;
                exprDisplay = '';
                current = digit;
                fresh = false;
                hasDecimal = false;
            } else if (fresh) {
                current = digit;
                fresh = false;
                hasDecimal = false;
            } else if (current === '0') {
                current = digit;
            } else {
                current = current + digit;
            }
            render();
        }

        function inputDecimal() {
            if (justComputed) {
                justComputed = false;
                accumulator = null;
                operator = null;
                exprDisplay = '';
                current = '0.';
                fresh = false;
                hasDecimal = true;
                render();
                return;
            }
            if (fresh) {
                current = '0.';
                fresh = false;
                hasDecimal = true;
                render();
                return;
            }
            if (!hasDecimal) {
                current = current + '.';
                hasDecimal = true;
                render();
            }
        }

        function applyPercent() {
            if (current === 'Erreur') {
                return;
            }
            if (justComputed) {
                justComputed = false;
            }
            var val = parseFloat(current) / 100;
            current = String(val);
            hasDecimal = current.indexOf('.') !== -1;
            justComputed = true;
            fresh = true;
            render();
        }

        function applyNegate() {
            if (current === 'Erreur') {
                return;
            }
            if (justComputed) {
                justComputed = false;
            }
            var val = parseFloat(current) * -1;
            current = String(val === 0 ? 0 : val);
            hasDecimal = current.indexOf('.') !== -1;
            fresh = false;
            render();
        }

        function setOperator(op) {
            if (current === 'Erreur') {
                return;
            }

            if (justComputed) {
                /* Continuer depuis un résultat */
                var jval = parseFloat(current) || 0;
                justComputed = false;
                accumulator = jval;
                exprDisplay = formatResult(jval) + OP_SYMBOL[op];
                operator = op;
                current = '0';
                fresh = true;
                render();
                return;
            }

            if (fresh && operator) {
                /* Remplacement de l'opérateur (dernier car. de exprDisplay) */
                operator = op;
                exprDisplay = exprDisplay.slice(0, -1) + OP_SYMBOL[op];
                render();
                return;
            }

            var val = parseFloat(current) || 0;

            if (accumulator !== null && !fresh && operator) {
                /* Chaînage : calcul intermédiaire */
                var chain = compute(accumulator, val, operator);
                if (!isFinite(chain)) {
                    current = 'Erreur';
                    accumulator = null;
                    operator = null;
                    fresh = true;
                    exprDisplay = '';
                    render();
                    return;
                }
                accumulator = chain;
                exprDisplay = formatResult(chain) + OP_SYMBOL[op];
            } else {
                accumulator = val;
                exprDisplay = formatInput(current) + OP_SYMBOL[op];
            }

            operator = op;
            current = '0';
            fresh = true;
            render();
        }

        function equals() {
            if (operator === null || accumulator === null || fresh) {
                render();
                return;
            }
            if (current === 'Erreur') {
                return;
            }
            var val = parseFloat(current) || 0;
            var result = compute(accumulator, val, operator);
            var histExpr = exprDisplay + formatInput(current);

            if (!isFinite(result)) {
                addInlineHistory(histExpr, 'Erreur');
                current = 'Erreur';
                accumulator = null;
                operator = null;
                fresh = true;
                exprDisplay = '';
                justComputed = false;
            } else {
                var resultFmt = formatResult(result);
                addInlineHistory(histExpr, resultFmt);
                pushHistory(histExpr + '  =  ' + resultFmt, result);
                current = String(result);
                accumulator = null;
                operator = null;
                fresh = true;
                exprDisplay = '';
                justComputed = true;
            }
            render();
        }

        function onKeyClick(event) {
            var btn = event.target.closest('[data-calc]');
            if (!btn || !root.contains(btn)) {
                return;
            }
            var action = btn.getAttribute('data-calc');
            if (action === 'clear' || action === 'noop') {
                if (action === 'clear') {
                    clearAll();
                }
                return;
            }
            if (action === 'backspace') {
                if (justComputed) {
                    clearAll();
                    return;
                }
                if (fresh || current === '0' || current === 'Erreur') {
                    return;
                }
                if (current.length <= 1) {
                    current = '0';
                    fresh = true;
                } else {
                    current = current.slice(0, -1);
                    hasDecimal = current.indexOf('.') !== -1;
                }
                render();
                return;
            }
            if (action === 'negate') {
                applyNegate();
                return;
            }
            if (action === 'percent') {
                applyPercent();
                return;
            }
            if (action === 'decimal') {
                inputDecimal();
                return;
            }
            if (action === 'digit') {
                inputDigit(btn.getAttribute('data-digit'));
                return;
            }
            if (action === 'op') {
                setOperator(btn.getAttribute('data-op'));
                return;
            }
            if (action === 'equals') {
                equals();
                return;
            }
            if (action === 'fn') {
                applyScientificFn(btn.getAttribute('data-fn'));
            }
        }

        function onGnomeActionClick(event) {
            var btn = event.target.closest('[data-calc-gnome-action]');
            if (!btn || !root.contains(btn)) {
                return;
            }
            var action = btn.getAttribute('data-calc-gnome-action');
            if (action === 'copy-result') {
                event.preventDefault();
                copyCalcGnomeResult(root, valueEl ? valueEl.textContent : '0');
            }
            if (action === 'mode-basic' || action === 'mode-advanced' || action === 'mode-programming') {
                event.preventDefault();
                event.stopPropagation();
                setMode(action.replace('mode-', ''));
            }
        }

        root.addEventListener('click', onKeyClick);
        root.addEventListener('click', onGnomeActionClick);

        var modeBtn = global.document.getElementById('gnome-calc-mode');
        var modePopover = global.document.getElementById('gnome-calc-mode-popover');
        var menuBtn = global.document.getElementById('gnome-calc-menu');
        var menuPopover = global.document.getElementById('gnome-calc-menu-popover');
        var advancedKeypad = global.document.getElementById('gnome-calc-keypad-advanced');
        var historyPanel = global.document.getElementById('gnome-calc-history-panel');
        var historyList = global.document.getElementById('gnome-calc-history-list');
        var historyToggle = root.querySelector('[data-calc="history-toggle"]');
        var calcHistory = [];
        var currentMode = 'basic';

        function toggleMenuPopover(forceOpen) {
            if (!menuPopover || !menuBtn) {
                return;
            }
            var open = typeof forceOpen === 'boolean' ? forceOpen : menuPopover.hidden;
            menuPopover.hidden = !open;
            menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        if (menuBtn && menuPopover) {
            menuBtn.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                toggleMenuPopover();
            });
            menuPopover.addEventListener('click', function () {
                toggleMenuPopover(false);
            });
            global.document.addEventListener('click', function (event) {
                if (!menuPopover.hidden
                    && !menuPopover.contains(event.target)
                    && event.target !== menuBtn) {
                    toggleMenuPopover(false);
                }
            });
        }

        function publishCalcState() {
            syncCalcGnomeDataset(root, {
                mode: currentMode,
                historyCount: calcHistory.length,
                displayValue: valueEl ? valueEl.textContent : '0'
            });
        }

        if (historyToggle) {
            historyToggle.addEventListener('click', function onHistoryToggle(event) {
                event.preventDefault();
                event.stopPropagation();
                toggleHistoryPanel();
                toggleMenuPopover(false);
            });
        }

        function renderHistory() {
            if (!historyList) {
                return;
            }
            historyList.innerHTML = '';
            var i;
            for (i = calcHistory.length - 1; i >= 0; i -= 1) {
                var entry = calcHistory[i];
                var li = global.document.createElement('li');
                var histBtn = global.document.createElement('button');
                histBtn.type = 'button';
                histBtn.className = 'gnome-calc__history-item';
                histBtn.setAttribute('data-calc-history-idx', String(i));
                histBtn.textContent = entry.label;
                li.appendChild(histBtn);
                historyList.appendChild(li);
            }
            publishCalcState();
        }

        function pushHistory(label, value) {
            calcHistory.push({ label: label, value: value });
            if (calcHistory.length > 20) {
                calcHistory.shift();
            }
            renderHistory();
        }

        function toggleHistoryPanel(forceOpen) {
            if (!historyPanel || !historyToggle) {
                return;
            }
            var open = typeof forceOpen === 'boolean' ? forceOpen : historyPanel.hidden;
            historyPanel.hidden = !open;
            historyToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            historyToggle.classList.toggle('is-active', open);
        }

        function applyScientificFn(fnName) {
            if (current === 'Erreur') {
                return;
            }
            if (justComputed) {
                justComputed = false;
            }
            var val = parseFloat(current) || 0;
            if (fnName === 'pi') {
                current = String(Math.PI);
                fresh = false;
                hasDecimal = true;
                render();
                return;
            }
            var result;
            if (fnName === 'sin') {
                result = Math.sin(val * Math.PI / 180);
            } else if (fnName === 'cos') {
                result = Math.cos(val * Math.PI / 180);
            } else if (fnName === 'tan') {
                result = Math.tan(val * Math.PI / 180);
            } else if (fnName === 'sqrt') {
                result = Math.sqrt(val);
            } else if (fnName === 'square') {
                result = val * val;
            } else {
                return;
            }
            if (!isFinite(result)) {
                current = 'Erreur';
                fresh = true;
                justComputed = false;
            } else {
                current = String(result);
                hasDecimal = current.indexOf('.') !== -1;
                justComputed = true;
                fresh = true;
            }
            render();
        }

        var CALC_MODE_PANEL_IDS = ['basic', 'advanced', 'financial', 'programming', 'keyboard'];

        /** Géométrie VM mesurée (gnome-screenshot, Mint Cinnamon) — wmctrl hors marge CSD. */
        var MINT_CALC_MODE_SIZE = {
            basic: { width: 360, height: 486 },
            advanced: { width: 680, height: 539 },
            financial: { width: 680, height: 539 },
            programming: { width: 680, height: 659 },
            keyboard: { width: 360, height: 486 }
        };

        function applyMintWindowSize(mode) {
            if (!global.document.body || global.document.body.id !== 'mint') {
                return;
            }
            var win = root.closest('.windowElement[data-link="calculator"]');
            if (!win) {
                return;
            }
            var size = MINT_CALC_MODE_SIZE[mode] || MINT_CALC_MODE_SIZE.basic;
            win.style.width = size.width + 'px';
            win.style.height = size.height + 'px';
            win.style.minWidth = size.width + 'px';
            win.style.minHeight = size.height + 'px';
        }

        function syncAdvancedKeypad() {
            var showAdvanced = currentMode === 'advanced' || currentMode === 'programming';
            root.classList.toggle('gnome-calc--advanced', showAdvanced);
            root.classList.toggle('gnome-calc--programming', currentMode === 'programming');
            root.classList.toggle('gnome-calc--financial', currentMode === 'financial');
            if (advancedKeypad) {
                advancedKeypad.hidden = !showAdvanced;
            }
            CALC_MODE_PANEL_IDS.forEach(function (mode) {
                var panel = global.document.getElementById('gnome-calc-keypad-' + mode);
                if (panel) {
                    panel.hidden = mode !== currentMode;
                }
            });
            applyMintWindowSize(currentMode);
        }

        function setMode(mode) {
            currentMode = mode;
            var labels = {
                basic: 'Basique',
                advanced: 'Avancé',
                financial: 'Financier',
                programming: 'Programmation',
                keyboard: 'Clavier'
            };
            var modeLabel = global.document.getElementById('gnome-calc-mode-label');
            if (modeLabel) {
                modeLabel.textContent = labels[mode] || 'Basique';
            }
            if (modeBtn) {
                modeBtn.setAttribute('aria-expanded', 'false');
            }
            syncAdvancedKeypad();
            if (modePopover) {
                modePopover.hidden = true;
                modePopover.querySelectorAll('.gnome-calc__mode-option').forEach(function (opt) {
                    opt.classList.toggle('is-active', opt.getAttribute('data-calc-mode') === mode);
                });
            }
            clearAll();
            /* Vider le bandeau historique inline lors d'un changement de mode */
            while (exprEl.firstChild) {
                exprEl.removeChild(exprEl.firstChild);
            }
        }

        function toggleModePopover() {
            if (!modePopover || !modeBtn) {
                return;
            }
            var open = modePopover.hidden;
            modePopover.hidden = !open;
            modeBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        if (historyList) {
            historyList.addEventListener('click', function onHistoryClick(event) {
                var item = event.target.closest('[data-calc-history-idx]');
                if (!item) {
                    return;
                }
                var idx = parseInt(item.getAttribute('data-calc-history-idx'), 10);
                var entry = calcHistory[idx];
                if (entry) {
                    current = String(entry.value);
                    hasDecimal = current.indexOf('.') !== -1;
                    fresh = true;
                    exprDisplay = '';
                    justComputed = true;
                    toggleHistoryPanel(false);
                    render();
                }
            });
        }

        if (modeBtn && modePopover) {
            modeBtn.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                toggleModePopover();
            });
            modePopover.querySelectorAll('[data-calc-mode]').forEach(function (opt) {
                opt.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    setMode(opt.getAttribute('data-calc-mode'));
                });
            });
            global.document.addEventListener('click', function (event) {
                if (!modePopover.hidden
                    && !modePopover.contains(event.target)
                    && event.target !== modeBtn) {
                    modePopover.hidden = true;
                    modeBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }

        root.addEventListener('keydown', function onKeyboard(event) {
            var key = event.key;
            if (key >= '0' && key <= '9') {
                event.preventDefault();
                inputDigit(key);
                return;
            }
            if (key === ',' || key === '.') {
                event.preventDefault();
                inputDecimal();
                return;
            }
            if (key === 'Enter' || key === '=') {
                event.preventDefault();
                equals();
                return;
            }
            if (key === 'Escape') {
                event.preventDefault();
                clearAll();
                return;
            }
            if (key === '+') {
                event.preventDefault();
                setOperator('+');
                return;
            }
            if (key === '-') {
                event.preventDefault();
                setOperator('-');
                return;
            }
            if (key === '*') {
                event.preventDefault();
                setOperator('*');
                return;
            }
            if (key === '/') {
                event.preventDefault();
                setOperator('/');
            }
        });

        syncAdvancedKeypad();
        clearAll();
        publishCalcState();
    }

    global.GNOME_CALC_SESSION_KEY = GNOME_CALC_SESSION_KEY;
    global.copyCalcGnomeResult = copyCalcGnomeResult;
    global.initCalculatorApp = initCalculatorApp;
}(typeof window !== 'undefined' ? window : this));
