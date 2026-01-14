/**
 * Base Component Class
 * --------------------
 * Lightweight component abstraction for vanilla JS
 */

export class Component {
    constructor() {
        this.element = null;
        this.eventListeners = [];
    }
    
    /**
     * Override to return rendered HTML element
     */
    render() {
        throw new Error('Component must implement render()');
    }
    
    /**
     * Called after render, use for event binding
     */
    init() {}
    
    /**
     * Cleanup method for removing event listeners
     */
    destroy() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }
    
    /**
     * Helper to add tracked event listeners
     */
    on(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }
    
    /**
     * Create element from HTML string
     */
    createElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }
    
    /**
     * Query within component
     */
    $(selector) {
        return this.element?.querySelector(selector);
    }
    
    /**
     * Query all within component
     */
    $$(selector) {
        return this.element?.querySelectorAll(selector) || [];
    }
}
