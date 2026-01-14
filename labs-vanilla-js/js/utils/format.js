/**
 * Formatting Utilities
 * --------------------
 * Common formatting functions
 */

/**
 * Format number as currency
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
    }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date, options = {}) {
    const defaults = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return new Intl.DateTimeFormat('en-US', { ...defaults, ...options }).format(new Date(date));
}

/**
 * Pluralize a word based on count
 */
export function pluralize(count, singular, plural = null) {
    return count === 1 ? singular : (plural || `${singular}s`);
}
