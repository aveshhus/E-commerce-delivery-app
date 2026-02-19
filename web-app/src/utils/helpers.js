export const formatUnit = (value, unit) => {
    if (!value || !unit) return '';

    const val = parseFloat(value);

    // Convert Liters to Milliliters if < 1
    if (unit === 'l' && val < 1) {
        return `${val * 1000} ml`;
    }

    // Convert Kg to Grams if < 1
    if (unit === 'kg' && val < 1) {
        return `${val * 1000} g`;
    }

    return `${val} ${unit}`;
};

export const getQtyLabel = (qty, unit) => {
    if (unit === 'l' || unit === 'ml') return `${qty}`; // Hide unit for liquids in counter to avoid "1 l" confusion
    return `${qty} ${unit}`;
};
