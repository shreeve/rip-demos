/**
 * DOM Utilities
 * -------------
 * Helper functions for DOM manipulation
 */

/**
 * Create element from HTML string
 */
export function html(strings, ...values) {
    const result = strings.reduce((acc, str, i) => {
        const value = values[i] ?? '';
        return acc + str + (Array.isArray(value) ? value.join('') : value);
    }, '');
    
    const template = document.createElement('template');
    template.innerHTML = result.trim();
    return template.content.firstChild;
}

/**
 * Query selector shorthand
 */
export function $(selector, context = document) {
    return context.querySelector(selector);
}

/**
 * Query selector all shorthand
 */
export function $$(selector, context = document) {
    return [...context.querySelectorAll(selector)];
}

/**
 * Add event listener with automatic cleanup tracking
 */
export function on(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
}

/**
 * Delegate event handling
 */
export function delegate(container, selector, event, handler) {
    const delegatedHandler = (e) => {
        const target = e.target.closest(selector);
        if (target && container.contains(target)) {
            handler(e, target);
        }
    };
    container.addEventListener(event, delegatedHandler);
    return () => container.removeEventListener(event, delegatedHandler);
}

/**
 * Toggle class based on condition
 */
export function toggleClass(element, className, condition) {
    element.classList.toggle(className, condition);
}
