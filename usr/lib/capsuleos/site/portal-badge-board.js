/**
 * Infobulle des badges gamification (survol, fixée au-dessus du badge).
 */
(function () {
    'use strict';

    var activeBoard = null;
    var activeTile = null;
    var activePopover = null;
    var popSize = null;

    function portalPopover(board, pop) {
        if (pop.parentNode !== document.body) {
            document.body.appendChild(pop);
        }
        pop.dataset.portalBadgePopoverBoard = board.getAttribute('data-portal-badge-board') || '1';
    }

    function restorePopover(board, pop) {
        if (!board || !pop || pop.parentNode !== document.body) {
            return;
        }
        board.appendChild(pop);
    }

    function closePopover(board) {
        var target = board || activeBoard;
        if (!target) {
            return;
        }
        var pop = activePopover || target.querySelector('[data-portal-badge-popover]');
        if (pop) {
            pop.hidden = true;
            restorePopover(target, pop);
        }
        target.querySelectorAll('[data-portal-badge-tile][aria-expanded="true"]').forEach(function (btn) {
            btn.setAttribute('aria-expanded', 'false');
        });
        if (activeBoard === target) {
            activeBoard = null;
            activeTile = null;
            activePopover = null;
            popSize = null;
        }
    }

    function measurePopover(pop) {
        pop.hidden = false;
        var prevVisibility = pop.style.visibility;
        pop.style.visibility = 'hidden';
        pop.style.left = '0px';
        pop.style.top = '0px';
        var rect = pop.getBoundingClientRect();
        pop.style.visibility = prevVisibility;
        return {
            width: rect.width,
            height: rect.height,
        };
    }

    function positionPopoverAtTile(pop, tile) {
        var gap = 10;
        var margin = 8;
        if (!popSize) {
            popSize = measurePopover(pop);
        }
        var tileRect = tile.getBoundingClientRect();
        var popWidth = popSize.width;
        var popHeight = popSize.height;
        var anchorX = tileRect.left + tileRect.width / 2;
        var anchorY = tileRect.top;
        var left = anchorX - popWidth / 2;
        var top = anchorY - popHeight - gap;
        var maxLeft = window.innerWidth - popWidth - margin;
        if (maxLeft < margin) {
            maxLeft = margin;
        }
        if (left < margin) {
            left = margin;
        } else if (left > maxLeft) {
            left = maxLeft;
        }
        if (top < margin) {
            top = margin;
        }
        pop.style.left = left + 'px';
        pop.style.top = top + 'px';
        pop.style.setProperty('--popover-pointer-x', (anchorX - left) + 'px');
        pop.hidden = false;
    }

    function refreshPopoverPosition() {
        if (!activePopover || activePopover.hidden || !activeTile) {
            return;
        }
        positionPopoverAtTile(activePopover, activeTile);
    }

    function setPopoverContent(pop, tile) {
        var labelEl = pop.querySelector('[data-portal-badge-popover-label]');
        var descEl = pop.querySelector('[data-portal-badge-popover-desc]');
        if (!labelEl || !descEl) {
            return false;
        }
        labelEl.textContent = tile.getAttribute('data-badge-label') || '';
        descEl.textContent = tile.getAttribute('data-badge-desc') || '';
        popSize = null;
        return true;
    }

    function resolvePopover(board) {
        if (activeBoard === board && activePopover) {
            return activePopover;
        }
        var inBoard = board.querySelector('[data-portal-badge-popover]');
        if (inBoard) {
            return inBoard;
        }
        return document.querySelector('[data-portal-badge-popover]');
    }

    function openPopover(board, tile) {
        var pop = resolvePopover(board);
        if (!pop || !setPopoverContent(pop, tile)) {
            return;
        }
        if (activeBoard && activeBoard !== board) {
            closePopover(activeBoard);
        }
        portalPopover(board, pop);
        activeBoard = board;
        activeTile = tile;
        activePopover = pop;
        tile.setAttribute('aria-expanded', 'true');
        requestAnimationFrame(function () {
            positionPopoverAtTile(pop, tile);
        });
    }

    function initBoard(board) {
        if (!board || board.getAttribute('data-portal-badge-board-init') === '1') {
            return;
        }
        board.setAttribute('data-portal-badge-board-init', '1');

        board.addEventListener('mouseover', function (event) {
            var tile = event.target.closest('[data-portal-badge-tile]');
            if (!tile || !board.contains(tile)) {
                return;
            }
            if (activeBoard !== board || activeTile !== tile) {
                openPopover(board, tile);
            }
        });

        board.addEventListener('mouseleave', function () {
            closePopover(board);
        });

        board.querySelectorAll('[data-portal-badge-tile]').forEach(function (tile) {
            if (tile.getAttribute('data-portal-badge-tile-bound') === '1') {
                return;
            }
            tile.setAttribute('data-portal-badge-tile-bound', '1');
            tile.addEventListener('focus', function () {
                openPopover(board, tile);
            });
            tile.addEventListener('blur', function () {
                closePopover(board);
            });
        });
    }

    function initAll() {
        document.querySelectorAll('[data-portal-badge-board]').forEach(initBoard);
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closePopover();
        }
    });

    window.addEventListener('resize', refreshPopoverPosition);
    window.addEventListener('scroll', refreshPopoverPosition, true);

    window.CapsulePortalBadgeBoard = {
        init: initAll,
        initBoard: initBoard,
        closePopover: closePopover,
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
}());
