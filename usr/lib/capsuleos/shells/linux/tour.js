/**
 * Visite guidée GNOME — simulation org.gnome.Tour (cartes d'accueil + navigation).
 */
(function initGnomeTourApp(global) {
    'use strict';

    var STEPS = [
        {
            title: 'Visite guidée',
            illus: 'welcome',
            lead: 'Découvrez les principales fonctionnalités d\u2019AlmaLinux 10.',
            bullets: [
                'Super — ouvrir l\u2019Aperçu et rechercher des applications',
                'Alt+Tab — changer de fenêtre',
                'Paramètres rapides — volume, réseau, thème'
            ],
            nextLabel: 'Commencer'
        },
        {
            title: 'Ayez une vue d\u2019ensemble',
            illus: 'overview',
            lead: 'Appuyez sur la touche Super pour afficher l\u2019Aperçu : applications, fenêtres et espaces de travail.',
            bullets: [
                'Cliquez sur une application pour la lancer',
                'Tapez pour rechercher un programme ou un fichier',
                'Échap — revenir au bureau'
            ]
        },
        {
            title: 'Restez organisé avec les espaces de travail',
            illus: 'workspaces',
            lead: 'Organisez vos fenêtres sur plusieurs bureaux virtuels pour garder un bureau dégagé.',
            bullets: [
                'Super + Page Haut / Page Bas — changer d\u2019espace',
                'Glissez une fenêtre vers le bord pour la déplacer',
                'L\u2019Aperçu affiche tous vos espaces côte à côte'
            ]
        },
        {
            title: 'Une recherche puissante',
            illus: 'search',
            lead: 'La recherche intégrée trouve rapidement applications, paramètres et fichiers.',
            bullets: [
                'Super puis saisir — recherche globale',
                'Flèches — parcourir les résultats',
                'Entrée — ouvrir la sélection'
            ]
        },
        {
            title: 'C\u2019est fini !',
            illus: 'finish',
            lead: 'Personnalisez AlmaLinux dans Paramètres et explorez les applications de l\u2019Aperçu.',
            bullets: [
                'Paramètres — apparence, réseau, comptes',
                'Visite guidée — relancer depuis l\u2019Aperçu',
                'Profitez de votre bureau GNOME'
            ],
            nextLabel: 'Terminer'
        }
    ];

    var activeStep = 0;

    function getRootEl() {
        return global.document.getElementById('gnomeTourApp');
    }

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'tour') {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function syncTourDataset(root) {
        var appRoot = root || getRootEl();
        if (!appRoot) {
            return;
        }
        appRoot.dataset.tourInit = 'true';
        appRoot.dataset.tourStep = String(activeStep + 1);
        appRoot.dataset.tourFinished = appRoot.dataset.tourFinished === 'true' ? 'true' : 'false';
        appRoot.dataset.tourStepTitle = STEPS[activeStep] ? STEPS[activeStep].title : '';
    }

    function setWindowTitle(root) {
        var winEl = getWindowEl(root);
        if (!winEl) {
            return;
        }
        var wmTitle = winEl.querySelector('#windowTitle');
        if (wmTitle) {
            wmTitle.textContent = 'Visite guidée';
        }
        winEl.setAttribute('data-title', 'Visite guidée');
    }

    function renderDots(root, count, active) {
        var dots = root.querySelector('#gnome-tour-dots');
        if (!dots) {
            return;
        }
        dots.innerHTML = '';
        for (var i = 0; i < count; i += 1) {
            var dot = document.createElement('span');
            dot.className = 'gnome-tour__dot';
            dot.setAttribute('data-tour-gnome-dot', String(i + 1));
            if (i === active) {
                dot.classList.add('gnome-tour__dot--active');
            }
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', 'Étape ' + (i + 1));
            dot.setAttribute('aria-selected', i === active ? 'true' : 'false');
            dots.appendChild(dot);
        }
    }

    function renderBullets(list, items) {
        list.innerHTML = '';
        items.forEach(function (text) {
            var li = document.createElement('li');
            li.textContent = text;
            list.appendChild(li);
        });
    }

    function renderStep(root, index) {
        var step = STEPS[index];
        if (!step) {
            return;
        }
        var title = root.querySelector('#gnome-tour-title');
        var illus = root.querySelector('#gnome-tour-illus');
        var lead = root.querySelector('#gnome-tour-lead');
        var bullets = root.querySelector('#gnome-tour-bullets');
        var prev = root.querySelector('#gnome-tour-prev');
        var next = root.querySelector('#gnome-tour-next');
        if (title) {
            title.textContent = step.title;
        }
        if (illus) {
            illus.className = 'gnome-tour__illus gnome-tour__illus--' + step.illus;
            illus.setAttribute('aria-label', step.title);
            illus.setAttribute('data-tour-gnome-illus', step.illus);
        }
        if (lead) {
            lead.textContent = step.lead;
        }
        if (bullets) {
            renderBullets(bullets, step.bullets);
        }
        if (prev) {
            prev.hidden = index === 0;
        }
        if (next) {
            var isLast = index === STEPS.length - 1;
            next.textContent = step.nextLabel || (isLast ? 'Terminer' : 'Suivant');
            next.setAttribute('aria-label', isLast ? 'Terminer la visite' : 'Étape suivante');
            next.setAttribute('data-tour-gnome-action', isLast ? 'finish' : 'next');
        }
        renderDots(root, STEPS.length, index);
        syncTourDataset(root);
    }

    function goToStep(root, index) {
        if (index < 0 || index >= STEPS.length) {
            return;
        }
        activeStep = index;
        renderStep(root, activeStep);
    }

    function finishTour(root) {
        root.dataset.tourFinished = 'true';
        syncTourDataset(root);
    }

    function bindNavigation(root) {
        var prev = root.querySelector('#gnome-tour-prev');
        var next = root.querySelector('#gnome-tour-next');
        if (prev) {
            prev.addEventListener('click', function () {
                goToStep(root, activeStep - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                if (activeStep < STEPS.length - 1) {
                    goToStep(root, activeStep + 1);
                } else {
                    finishTour(root);
                }
            });
        }
    }

    function initTourApp() {
        var root = getRootEl();
        if (!root || root.dataset.tourInit === 'true') {
            return;
        }
        setWindowTitle(root);
        activeStep = 0;
        delete root.dataset.tourFinished;
        bindNavigation(root);
        renderStep(root, activeStep);
    }

    global.initTourApp = initTourApp;
}(typeof window !== 'undefined' ? window : globalThis));
