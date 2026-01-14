/**
 * Orders Page
 * -----------
 * Lab test ordering interface
 */

import { Component } from '../core/component.js';
import { createStore } from '../core/state.js';
import { initIcons } from '../core/icons.js';
import { formatCurrency, pluralize } from '../utils/format.js';
import { medicalTests, calculateTotals } from '../data/medical-tests.js';

export class OrdersPage extends Component {
    constructor() {
        super();

        // Initialize state
        this.store = createStore({
            searchTerm: '',
            selectedTests: new Set()
        });
    }

    render() {
        this.element = this.createElement(/* html */`
            <div class="h-screen flex flex-col items-center justify-center p-4">
                <div class="card w-full max-w-3xl flex flex-col h-[40rem] max-h-[90vh]">

                    <!-- Header -->
                    <div class="card-header shrink-0 z-10">
                        <div class="flex justify-between items-center mb-6">
                            <div class="flex items-center gap-3">
                                <div class="logo">LO</div>
                                <div>
                                    <h1 class="text-lg font-semibold tracking-tight leading-tight">New Order</h1>
                                    <p class="text-xs text-secondary mt-0.5">Select tests for patient #89201</p>
                                </div>
                            </div>
                            <button class="p-2 hover:bg-gray-50 rounded-lg text-muted hover:text-secondary transition-colors">
                                <i data-lucide="more-horizontal" width="20" height="20"></i>
                            </button>
                        </div>

                        <!-- Search -->
                        <div class="search-input-wrapper">
                            <i data-lucide="search" class="search-icon" width="16" height="16"></i>
                            <input
                                type="text"
                                id="searchInput"
                                class="search-input"
                                placeholder="Search by test name or code..."
                                autocomplete="off"
                            >
                        </div>
                    </div>

                    <!-- List -->
                    <div class="card-body flex-1 relative" id="scrollContainer">
                        <div id="testList" class="w-full pb-2"></div>

                        <!-- Empty State -->
                        <div id="emptyState" class="empty-state">
                            <div class="empty-state-icon">
                                <i data-lucide="flask-conical" width="24" height="24"></i>
                            </div>
                            <h3 class="empty-state-title">No matching tests</h3>
                            <p class="empty-state-description">Try adjusting your search terms.</p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="card-footer shrink-0 z-20">
                        <div class="flex flex-col gap-4">
                            <div class="space-y-2">
                                <div class="flex justify-between text-xs text-secondary font-medium">
                                    <span>Selected Tests</span>
                                    <span id="countDisplay">0 items</span>
                                </div>
                                <div class="flex justify-between text-xs text-secondary font-medium">
                                    <span>Retail Value</span>
                                    <span id="retailDisplay" class="line-through opacity-50">$0.00</span>
                                </div>
                                <div class="flex justify-between items-center pt-3 border-t border-gray-200/60">
                                    <span class="text-sm font-semibold">Total</span>
                                    <span id="totalDisplay" class="text-lg font-semibold tracking-tight">$0.00</span>
                                </div>
                            </div>

                            <button class="btn btn-primary w-full group">
                                <span>Create Order</span>
                                <i data-lucide="arrow-right" class="btn-icon" width="16" height="16"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);

        return this.element;
    }

    init() {
        // Cache DOM references
        this.listContainer = this.$('#testList');
        this.searchInput = this.$('#searchInput');
        this.emptyState = this.$('#emptyState');
        this.countDisplay = this.$('#countDisplay');
        this.retailDisplay = this.$('#retailDisplay');
        this.totalDisplay = this.$('#totalDisplay');

        // Bind events
        this.on(this.searchInput, 'input', (e) => {
            this.store.setState({ searchTerm: e.target.value });
        });

        // Subscribe to state changes
        this.store.subscribe(() => this.update());

        // Initial render
        this.renderList();
        initIcons();
    }

    update() {
        this.renderList();
        this.updateTotals();
        initIcons();
    }

    toggleSelection(id) {
        const { selectedTests } = this.store.getState();
        const newSelected = new Set(selectedTests);

        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }

        this.store.setState({ selectedTests: newSelected });
    }

    renderList() {
        const { searchTerm, selectedTests } = this.store.getState();
        const searchLower = searchTerm.toLowerCase();

        // Filter: matches search OR is selected
        const filtered = medicalTests.filter(test => {
            const matches = test.name.toLowerCase().includes(searchLower) ||
                           test.code.toLowerCase().includes(searchLower);
            return matches || selectedTests.has(test.id);
        });

        // Sort: selected first, then by ID
        filtered.sort((a, b) => {
            const aSelected = selectedTests.has(a.id) ? 1 : 0;
            const bSelected = selectedTests.has(b.id) ? 1 : 0;
            return bSelected - aSelected || a.id - b.id;
        });

        // Update empty state
        this.emptyState.classList.toggle('visible', filtered.length === 0);

        // Render items
        this.listContainer.innerHTML = filtered.map(test => {
            const isSelected = selectedTests.has(test.id);
            return /* html */`
                <div class="list-item ${isSelected ? 'selected' : ''}" data-id="${test.id}">
                    <div class="flex items-center gap-4 overflow-hidden pointer-events-none">
                        <div class="checkbox ${isSelected ? 'checked' : ''}">
                            <svg class="checkbox-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <div class="flex flex-col min-w-0">
                            <div class="flex items-center gap-2 mb-0.5">
                                <span class="badge">${test.code}</span>
                            </div>
                            <span class="text-sm font-medium truncate pr-4">${test.name}</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-0.5 whitespace-nowrap pl-4 pointer-events-none">
                        <span class="price-current">${formatCurrency(test.discount)}</span>
                        <span class="price-original">${formatCurrency(test.retail)}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Bind click events to items
        this.$$('.list-item').forEach(item => {
            item.onclick = (e) => {
                e.preventDefault();
                this.toggleSelection(parseInt(item.dataset.id));
            };
        });
    }

    updateTotals() {
        const { selectedTests } = this.store.getState();
        const { count, retail, discount } = calculateTotals(selectedTests);

        this.countDisplay.textContent = `${count} ${pluralize(count, 'item')}`;
        this.retailDisplay.textContent = formatCurrency(retail);
        this.totalDisplay.textContent = formatCurrency(discount);
        this.retailDisplay.style.opacity = count > 0 ? '1' : '0.5';
    }
}
