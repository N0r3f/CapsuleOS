/**
 * Composer tickets : insertion lien / capture et rendu message enrichi.
 */
(function (global) {
    'use strict';

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function readCsrf() {
        var csrfEl = document.querySelector('[data-csrf]');
        if (csrfEl) {
            return csrfEl.getAttribute('data-csrf') || '';
        }
        var meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.content : '';
    }

    function accountApiBase() {
        if (typeof global.CAPSULE_PORTAL_API_BASE === 'string' && global.CAPSULE_PORTAL_API_BASE) {
            var base = global.CAPSULE_PORTAL_API_BASE;
            return base.endsWith('/') ? base : base + '/';
        }
        var accountRoot = document.querySelector('[data-portal-account]');
        var fromRoot = accountRoot
            ? (accountRoot.getAttribute('data-portal-api-base') || 'portal/api/')
            : 'portal/api/';
        if (!fromRoot.endsWith('/')) {
            fromRoot += '/';
        }
        return fromRoot;
    }

    function apiUrl(path) {
        var base = accountApiBase();
        return '/' + base.replace(/^\/+/, '') + String(path || '').replace(/^\/+/, '');
    }

    function isSafeHttpUrl(url) {
        if (!url) {
            return false;
        }
        try {
            var parsed = new URL(url, global.location.origin);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    function insertAtCursor(textarea, text) {
        if (!textarea) {
            return;
        }
        var start = typeof textarea.selectionStart === 'number' ? textarea.selectionStart : textarea.value.length;
        var end = typeof textarea.selectionEnd === 'number' ? textarea.selectionEnd : textarea.value.length;
        var before = textarea.value.slice(0, start);
        var after = textarea.value.slice(end);
        textarea.value = before + text + after;
        var caret = start + text.length;
        if (typeof textarea.setSelectionRange === 'function') {
            textarea.setSelectionRange(caret, caret);
        }
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function composerToolbarHtml() {
        return '<div class="portal-ticket-composer-toolbar" role="toolbar" aria-label="Ajouter un lien ou une capture">'
            + '<button type="button" class="portal-ticket-composer-btn" data-ticket-insert-link'
            + ' title="Insérer un lien" aria-label="Insérer un lien">'
            + '<i class="fa-solid fa-link" aria-hidden="true"></i>'
            + '<span class="portal-ticket-composer-btn-label">Lien</span></button>'
            + '<button type="button" class="portal-ticket-composer-btn" data-ticket-insert-screenshot'
            + ' title="Insérer une capture d\'écran" aria-label="Insérer une capture d\'écran">'
            + '<i class="fa-solid fa-image" aria-hidden="true"></i>'
            + '<span class="portal-ticket-composer-btn-label">Capture</span></button>'
            + '<input type="file" class="portal-ticket-composer-file" data-ticket-screenshot-input'
            + ' accept="image/png,image/jpeg,image/gif,image/webp" hidden>'
            + '</div>';
    }

    function wrapTextareaHtml(textareaAttrs) {
        return '<div class="portal-ticket-composer" data-ticket-composer>'
            + composerToolbarHtml()
            + '<textarea ' + textareaAttrs + '></textarea>'
            + '</div>';
    }

    function uploadScreenshot(file, options) {
        var opts = options || {};
        var csrf = opts.csrf != null ? opts.csrf : readCsrf();
        var fd = new FormData();
        fd.append('file', file);
        fd.append('_csrf', csrf);
        return fetch(apiUrl('ticket-media.php'), {
            method: 'POST',
            credentials: 'include',
            headers: { 'X-CSRF-Token': csrf },
            body: fd,
        }).then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) {
                if (!res.ok) {
                    throw new Error(data.error || 'Échec envoi capture');
                }
                var url = data.url || (data.media && data.media.url) || '';
                if (!url) {
                    throw new Error('Réponse capture invalide');
                }
                return url;
            });
        });
    }

    function attachImageFromFile(textarea, file, options) {
        if (!file || !textarea) {
            return Promise.resolve();
        }
        var btn = textarea.closest('[data-ticket-composer]');
        if (btn) {
            btn.setAttribute('data-ticket-composer-busy', '1');
        }
        return uploadScreenshot(file, options).then(function (url) {
            insertAtCursor(textarea, '\n![Capture](' + url + ')\n');
            textarea.focus();
        }).finally(function () {
            if (btn) {
                btn.removeAttribute('data-ticket-composer-busy');
            }
        });
    }

    function bindTextareaEnterSubmit(textarea) {
        if (!textarea || textarea.getAttribute('data-ticket-enter-submit-bound') === '1') {
            return;
        }
        textarea.setAttribute('data-ticket-enter-submit-bound', '1');
        textarea.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
                return;
            }
            var form = textarea.closest('form');
            if (!form) {
                return;
            }
            event.preventDefault();
            if (typeof form.requestSubmit === 'function') {
                form.requestSubmit();
                return;
            }
            var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.click();
            }
        });
    }

    function bindSubmitOnEnter(root) {
        var scope = root || document;
        scope.querySelectorAll(
            '[data-ticket-composer] textarea, [data-ticket-reply-form] textarea,'
            + ' [data-ticket-form] textarea, [data-dev-ticket-form] textarea, [data-ticket-reply] textarea',
        ).forEach(function (textarea) {
            bindTextareaEnterSubmit(textarea);
        });
    }

    function bindComposer(root, options) {
        var scope = root || document;
        scope.querySelectorAll('[data-ticket-composer]:not([data-ticket-composer-bound])').forEach(function (composer) {
            composer.setAttribute('data-ticket-composer-bound', '1');
            var textarea = composer.querySelector('textarea');
            if (!textarea) {
                return;
            }
            var linkBtn = composer.querySelector('[data-ticket-insert-link]');
            var shotBtn = composer.querySelector('[data-ticket-insert-screenshot]');
            var fileInput = composer.querySelector('[data-ticket-screenshot-input]');

            if (linkBtn) {
                linkBtn.addEventListener('click', function () {
                    var url = global.prompt('URL du lien :', 'https://');
                    if (!url) {
                        return;
                    }
                    url = String(url).trim();
                    if (!isSafeHttpUrl(url)) {
                        global.alert('URL invalide (http ou https uniquement).');
                        return;
                    }
                    var label = global.prompt('Texte du lien (optionnel) :', url);
                    var insertion = label && String(label).trim() && String(label).trim() !== url
                        ? '[' + String(label).trim() + '](' + url + ')'
                        : url;
                    insertAtCursor(textarea, insertion);
                    textarea.focus();
                });
            }

            if (shotBtn && fileInput) {
                shotBtn.addEventListener('click', function () {
                    fileInput.click();
                });
                fileInput.addEventListener('change', function () {
                    var file = fileInput.files && fileInput.files[0];
                    if (!file) {
                        return;
                    }
                    attachImageFromFile(textarea, file, options).catch(function (err) {
                        global.alert(err && err.message ? err.message : 'Échec envoi capture');
                    }).finally(function () {
                        fileInput.value = '';
                    });
                });
            }

            textarea.addEventListener('paste', function (event) {
                var items = event.clipboardData && event.clipboardData.items;
                if (!items) {
                    return;
                }
                var i;
                for (i = 0; i < items.length; i += 1) {
                    if (items[i].type && items[i].type.indexOf('image') === 0) {
                        var blob = items[i].getAsFile();
                        if (!blob) {
                            return;
                        }
                        event.preventDefault();
                        attachImageFromFile(textarea, blob, options).catch(function (err) {
                            global.alert(err && err.message ? err.message : 'Échec collage capture');
                        });
                        return;
                    }
                }
            });
            bindTextareaEnterSubmit(textarea);
        });
        bindSubmitOnEnter(scope);
    }

    function renderMessageBody(text) {
        var raw = String(text || '');
        if (!raw) {
            return '';
        }
        var parts = [];
        var regex = /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|https?:\/\/[^\s<>"')]+/g;
        var lastIndex = 0;
        var match;
        while ((match = regex.exec(raw)) !== null) {
            if (match.index > lastIndex) {
                parts.push({ type: 'text', value: raw.slice(lastIndex, match.index) });
            }
            if (match[1] !== undefined) {
                parts.push({ type: 'image', alt: match[1], url: match[2] });
            } else if (match[3] !== undefined) {
                parts.push({ type: 'link', text: match[3], url: match[4] });
            } else {
                parts.push({ type: 'link', text: match[0], url: match[0] });
            }
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < raw.length) {
            parts.push({ type: 'text', value: raw.slice(lastIndex) });
        }
        var html = '';
        parts.forEach(function (part) {
            if (part.type === 'text') {
                html += escapeHtml(part.value);
            } else if (part.type === 'image' && isSafeHttpUrl(part.url)) {
                html += '<figure class="portal-ticket-message-figure">'
                    + '<img class="portal-ticket-message-image" src="' + escapeHtml(part.url) + '" alt="'
                    + escapeHtml(part.alt || 'Capture') + '" loading="lazy">'
                    + '</figure>';
            } else if (part.type === 'link' && isSafeHttpUrl(part.url)) {
                html += '<a class="portal-ticket-message-link" href="' + escapeHtml(part.url)
                    + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(part.text) + '</a>';
            } else if (part.type === 'image') {
                html += escapeHtml('![' + (part.alt || 'Capture') + '](' + part.url + ')');
            } else {
                html += escapeHtml(part.text || '');
            }
        });
        return '<div class="portal-ticket-message-content">' + html + '</div>';
    }

    global.CapsulePortalTicketComposer = {
        bindComposer: bindComposer,
        bindSubmitOnEnter: bindSubmitOnEnter,
        renderMessageBody: renderMessageBody,
        wrapTextareaHtml: wrapTextareaHtml,
        composerToolbarHtml: composerToolbarHtml,
        insertAtCursor: insertAtCursor,
        uploadScreenshot: uploadScreenshot,
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            bindComposer(document);
            bindSubmitOnEnter(document);
        });
    } else {
        bindComposer(document);
        bindSubmitOnEnter(document);
    }
}(typeof window !== 'undefined' ? window : globalThis));
