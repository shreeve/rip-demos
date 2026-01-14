/**
 * Icon Utilities
 * --------------
 * Wrapper for Lucide icon initialization
 */

/**
 * Initialize all Lucide icons in the DOM
 */
export function initIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/**
 * Create an icon element
 */
export function createIcon(name, options = {}) {
    const { width = 16, height = 16, className = '' } = options;
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', name);
    icon.setAttribute('width', width);
    icon.setAttribute('height', height);
    if (className) {
        icon.className = className;
    }
    return icon;
}
