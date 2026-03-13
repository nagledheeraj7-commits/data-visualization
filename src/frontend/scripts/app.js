/**
 * Main Application Entry Point
 * Initializes and coordinates all dashboard components
 */

import Header from '../components/Header.js';
import Navigation from '../components/Navigation.js';
import StatsCards from '../components/StatsCards.js';
import DataTable from '../components/DataTable.js';
import Charts from '../components/Charts.js';
import RealTimeStatus from '../components/RealTimeStatus.js';
import { loadData, calculateStatistics, simulateRealTimeUpdate } from '../utils/dataService.js';
import { initNotificationService } from '../utils/notificationService.js';

/**
 * Dashboard Application Class
 */
class DashboardApp {
    constructor() {
        this.components = {};
        this.data = [];
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            // Initialize notification service first
            initNotificationService();
            
            // Load data
            await this.loadData();
            
            // Initialize components
            this.initializeComponents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render initial data
            this.renderDashboard();
            
            this.isInitialized = true;
            
            // Show success message
            window.dispatchEvent(new CustomEvent('showNotification', {
                detail: { message: 'Dashboard loaded successfully!', type: 'success' }
            }));
            
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            window.dispatchEvent(new CustomEvent('showNotification', {
                detail: { 
                    message: 'Error loading dashboard. Please check the data file.', 
                    type: 'error' 
                }
            }));
        }
    }

    async loadData() {
        this.data = await loadData();
        window.salesData = this.data; // Make data globally available
    }

    initializeComponents() {
        this.components.header = new Header();
        this.components.navigation = new Navigation();
        this.components.statsCards = new StatsCards();
        this.components.dataTable = new DataTable();
        this.components.charts = new Charts();
        this.components.realTimeStatus = new RealTimeStatus();
    }

    setupEventListeners() {
        // Listen for refresh events
        window.addEventListener('refreshData', () => {
            this.refreshDashboard();
        });
        
        // Listen for real-time updates
        window.addEventListener('realTimeUpdate', (event) => {
            this.handleRealTimeUpdate(event.detail);
        });
        
        // Listen for category drill-down events
        window.addEventListener('categoryDrillDown', (event) => {
            this.handleCategoryDrillDown(event.detail.category);
        });
        
        // Listen for window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    renderDashboard() {
        // Update statistics
        const stats = calculateStatistics(this.data);
        this.components.statsCards.updateStats(this.data);
        
        // Create charts
        this.components.charts.createCharts(this.data);
        
        // Populate data table
        this.components.dataTable.populateTable(this.data);
    }

    async refreshDashboard() {
        try {
            // Show loading state
            const refreshBtn = document.getElementById('refresh-btn');
            const originalText = refreshBtn.textContent;
            refreshBtn.innerHTML = '<span class="loading"></span> Loading...';
            refreshBtn.disabled = true;
            
            // Reload data
            await this.loadData();
            
            // Re-render dashboard
            this.renderDashboard();
            
            // Reset button state
            refreshBtn.textContent = originalText;
            refreshBtn.disabled = false;
            
            window.dispatchEvent(new CustomEvent('showNotification', {
                detail: { message: 'Dashboard refreshed successfully!', type: 'success' }
            }));
            
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
            window.dispatchEvent(new CustomEvent('showNotification', {
                detail: { message: 'Error refreshing dashboard.', type: 'error' }
            }));
        }
    }

    handleRealTimeUpdate(detail) {
        // Simulate data update
        this.data = simulateRealTimeUpdate(this.data);
        
        // Update statistics
        this.components.statsCards.updateStats(this.data);
        
        // Update charts
        this.components.charts.updateCharts(this.data);
        
        // Update table if visible
        if (this.isTableVisible()) {
            this.components.dataTable.populateTable(this.data);
        }
    }

    handleCategoryDrillDown(category) {
        // Filter data by selected category
        const categoryData = this.data.filter(record => record.category === category);
        
        // Update table to show only category data
        this.components.dataTable.populateTable(categoryData);
        
        // Update category filter
        document.getElementById('category-filter').value = category;
        
        // Scroll to table
        document.getElementById('data-table').scrollIntoView({ behavior: 'smooth' });
    }

    handleResize() {
        // Handle responsive chart resizing
        if (this.components.charts) {
            this.components.charts.updateCharts(this.data);
        }
    }

    isTableVisible() {
        const tableSection = document.getElementById('data-table');
        const rect = tableSection.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    destroy() {
        // Clean up components
        Object.values(this.components).forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
        
        // Remove event listeners
        window.removeEventListener('refreshData', this.refreshDashboard);
        window.removeEventListener('realTimeUpdate', this.handleRealTimeUpdate);
        window.removeEventListener('categoryDrillDown', this.handleCategoryDrillDown);
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
});

// Export for global access
export default DashboardApp;
