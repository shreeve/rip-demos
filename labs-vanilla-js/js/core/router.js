/**
 * Simple Client-Side Router
 * -------------------------
 * Handles page navigation for single-page app behavior
 */

class Router {
    constructor() {
        this.routes = new Map();
        this.currentPage = null;
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => this.mount(document.getElementById('app')));
    }
    
    /**
     * Register a route with its page component
     */
    register(path, pageComponent) {
        this.routes.set(path, pageComponent);
    }
    
    /**
     * Navigate to a new path
     */
    navigate(path) {
        history.pushState(null, '', path);
        this.mount(document.getElementById('app'));
    }
    
    /**
     * Get current path
     */
    getCurrentPath() {
        return window.location.pathname || '/';
    }
    
    /**
     * Mount the appropriate page component
     */
    async mount(container) {
        const path = this.getCurrentPath();
        const PageComponent = this.routes.get(path) || this.routes.get('/');
        
        if (PageComponent && container) {
            // Cleanup previous page if exists
            if (this.currentPage?.destroy) {
                this.currentPage.destroy();
            }
            
            // Create and mount new page
            this.currentPage = new PageComponent();
            container.innerHTML = '';
            container.appendChild(await this.currentPage.render());
            
            // Initialize page
            if (this.currentPage.init) {
                this.currentPage.init();
            }
        }
    }
}

export const router = new Router();
