(function initCapsuleAppSearch() {
    const normalize = (value) => String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

    const scoreField = (field, query, baseScore) => {
        const normalized = normalize(field);
        if (!normalized || !query) {
            return null;
        }
        if (normalized === query) {
            return baseScore;
        }
        if (normalized.startsWith(query)) {
            return baseScore + 10;
        }
        if (normalized.includes(query)) {
            return baseScore + 30 + normalized.indexOf(query);
        }
        return null;
    };

    const scoreItem = (item, query) => {
        const scores = [];
        const labelScore = scoreField(item.label, query, 0);
        if (labelScore !== null) {
            scores.push(labelScore);
        }

        (item.aliases || []).forEach((alias) => {
            const aliasScore = scoreField(alias, query, 100);
            if (aliasScore !== null) {
                scores.push(aliasScore);
            }
        });

        const descriptionScore = scoreField(item.description, query, 220);
        if (descriptionScore !== null) {
            scores.push(descriptionScore);
        }

        return scores.length ? Math.min(...scores) : null;
    };

    const search = (query, items, options = {}) => {
        const normalizedQuery = normalize(query);
        const limit = Number.isFinite(options.limit) ? options.limit : 12;
        if (!normalizedQuery) {
            return [];
        }

        return (items || [])
            .map((item, index) => ({
                item,
                index,
                score: scoreItem(item, normalizedQuery)
            }))
            .filter((entry) => entry.score !== null)
            .sort((a, b) => a.score - b.score || a.index - b.index)
            .slice(0, limit)
            .map((entry) => entry.item);
    };

    window.CapsuleAppSearch = { normalize, search };
})();
