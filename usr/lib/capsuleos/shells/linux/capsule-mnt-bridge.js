// SPDX-FileCopyrightText: 2020-2026 les contributeurs CapsuleOS
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Pont Firefox → modules pédagogiques /mnt (événement capsule:open-mnt-scenario).
 */
(function initCapsuleMntBridge(global) {
    'use strict';

    if (global.__capsuleMntBridgeInit) {
        return;
    }
    global.__capsuleMntBridgeInit = true;

    function getModuleEntry(moduleId) {
        const index = global.CAPSULE_SIMULATED_WEB_INDEX || {};
        const modules = index.modules || {};
        return modules[moduleId] || null;
    }

    function mountIdFromModuleEntry(entry, moduleId) {
        if (!entry || !entry.path) {
            return null;
        }
        const parts = String(entry.path).replace(/^mnt\/?/, '').split('/').filter(Boolean);
        if (parts.length >= 2) {
            return parts[0] + '/' + parts[1];
        }
        return null;
    }

    function openChecklistWindow() {
        if (typeof global.openWindowByDataLink !== 'function') {
            return false;
        }
        const slot = global.document && global.document.querySelector('[data-link="checklist"]');
        if (!slot) {
            return false;
        }
        global.openWindowByDataLink('checklist');
        return true;
    }

    function dispatchScenarioStarted(detail) {
        if (!global.document) {
            return;
        }
        global.document.dispatchEvent(new CustomEvent('capsule:mnt-scenario-opened', {
            detail: detail || {},
        }));
    }

    function runFirstScenarioStep(moduleId, scenarioId) {
        const entry = getModuleEntry(moduleId);
        const mountId = mountIdFromModuleEntry(entry, moduleId);
        const modulesApi = global.CapsuleMntModules;
        if (!mountId || !modulesApi || typeof modulesApi.loadModule !== 'function') {
            return;
        }

        modulesApi.loadModule(mountId).then(function onModuleLoaded(payload) {
            const scenarios = payload && payload.scenarios ? payload.scenarios : [];
            let scenario = null;
            for (let i = 0; i < scenarios.length; i += 1) {
                if (scenarios[i] && scenarios[i].id === scenarioId) {
                    scenario = scenarios[i];
                    break;
                }
            }
            if (!scenario && scenarios.length) {
                scenario = scenarios[0];
            }
            if (!scenario || !Array.isArray(scenario.steps) || !scenario.steps.length) {
                return;
            }
            const first = scenario.steps[0];
            if (first && first.slot && typeof global.openWindowByDataLink === 'function') {
                global.openWindowByDataLink(first.slot);
            }
        }).catch(function onModuleError() {
            /* module non monté ou fetch impossible — panneau Firefox suffit */
        });
    }

    function handleOpenMntScenario(event) {
        const detail = event && event.detail ? event.detail : {};
        const moduleId = detail.moduleId;
        if (!moduleId) {
            return;
        }

        const entry = getModuleEntry(moduleId);
        const scenarioId = detail.scenarioId
            || (entry && entry.defaultScenario)
            || null;

        openChecklistWindow();
        dispatchScenarioStarted({
            moduleId: moduleId,
            scenarioId: scenarioId,
            path: detail.path || (entry && entry.path) || '',
            label: (entry && entry.labelFr) || moduleId,
        });

        global.setTimeout(function deferFirstStep() {
            runFirstScenarioStep(moduleId, scenarioId);
        }, 350);
    }

    if (global.document) {
        global.document.addEventListener('capsule:open-mnt-scenario', handleOpenMntScenario);
    }
}(typeof window !== 'undefined' ? window : globalThis));
