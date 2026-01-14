/**
 * Simple State Management
 * -----------------------
 * Reactive state with subscription support
 */

export class Store {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = new Set();
    }
    
    /**
     * Get current state
     */
    getState() {
        return this.state;
    }
    
    /**
     * Update state and notify listeners
     */
    setState(updater) {
        const newState = typeof updater === 'function' 
            ? updater(this.state) 
            : { ...this.state, ...updater };
        
        this.state = newState;
        this.notify();
    }
    
    /**
     * Subscribe to state changes
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    
    /**
     * Notify all listeners
     */
    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

/**
 * Create a simple reactive store
 */
export function createStore(initialState) {
    return new Store(initialState);
}
