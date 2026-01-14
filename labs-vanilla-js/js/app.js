/**
 * App Entry Point
 * ---------------
 * Initializes the application and mounts pages
 */

import { router } from './core/router.js';
import { initIcons } from './core/icons.js';

// Import pages
import { OrdersPage } from './pages/orders.js';

// Register routes
router.register('/', OrdersPage);
router.register('/orders', OrdersPage);

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    const app = document.getElementById('app');
    
    // Mount current route
    await router.mount(app);
    
    // Initialize icons after DOM is ready
    initIcons();
});
