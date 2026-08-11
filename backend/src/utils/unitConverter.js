/**
 * Convert any Indian land area unit to Hectares (Ha)
 * Based on Indian Survey & Revenue Measurement Standards:
 * - 1 Hectare = 1.0 Ha
 * - 1 Acre = 0.404686 Ha
 * - 1 Guntha = 0.010117 Ha
 * - 1 Bigha = 0.252929 Ha
 * - 1 Cent = 0.00404686 Ha
 * - 1 Sq Meter = 0.0001 Ha
 * - 1 Sq Feet = 0.000092903 Ha
 */
export const convertToHectares = (areaValue, unitName) => {
    const area = parseFloat(String(areaValue || '0').replace(/[^0-9.]/g, '')) || 0;
    if (area <= 0) return 0;
    if (!unitName || typeof unitName !== 'string') return area;

    const u = unitName.toLowerCase().trim();

    if (u.includes('hectare') || u === 'ha' || u === 'hectares') {
        return area;
    } else if (u.includes('acre') || u === 'acres' || u === 'ac') {
        return parseFloat((area * 0.404686).toFixed(4));
    } else if (u.includes('guntha') || u.includes('gunta') || u === 'gunthas') {
        return parseFloat((area * 0.010117).toFixed(4));
    } else if (u.includes('bigha') || u === 'bighas') {
        return parseFloat((area * 0.252929).toFixed(4));
    } else if (u.includes('cent') || u === 'cents') {
        return parseFloat((area * 0.00404686).toFixed(4));
    } else if (u.includes('sq') && (u.includes('meter') || u.includes('metre') || u.includes('m'))) {
        return parseFloat((area * 0.0001).toFixed(6));
    } else if (u.includes('sq') && (u.includes('feet') || u.includes('ft'))) {
        return parseFloat((area * 0.000092903).toFixed(6));
    }

    // Default assume area is already in Hectares if unmapped
    return area;
};
