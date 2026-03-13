// Import API service
import { apiService } from './src/services/api.js';

// Global variables
let salesData = [];
let filteredData = [];
let charts = {};
let currentPage = 1;
const itemsPerPage = 10;
let simulationInterval = null;
let isSimulating = false;
let userSettings = {
    theme: 'light',
    chartAnimation: true,
    itemsPerPage: 10,
    autoRefresh: 0,
    showNotifications: true,
    notificationDuration: 3,
    autoSave: true
};
let refreshInterval = null;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    loadInitialData();
    loadUserPreferences();
});

// Initialize dashboard components
function initializeDashboard() {
    initializeCharts();
    setupFilters();
    setupThemeToggle();
    setupRealTimeUpdates();
    updateKPICards();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Filter controls
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    const refreshBtn = document.getElementById('refresh-btn');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (dateFrom) dateFrom.addEventListener('change', applyFilters);
    if (dateTo) dateTo.addEventListener('change', applyFilters);
    if (refreshBtn) refreshBtn.addEventListener('click', loadInitialData);

    // Import/Export controls
    const importBtn = document.getElementById('import-btn');
    const exportBtn = document.getElementById('export-btn');
    const fileInput = document.getElementById('file-input');

    if (importBtn) importBtn.addEventListener('click', () => fileInput?.click());
    if (exportBtn) exportBtn.addEventListener('click', exportData);
    if (fileInput) fileInput.addEventListener('change', handleFileUpload);

    // Manual entry
    const manualEntryBtn = document.getElementById('manual-entry-btn');
    const manualEntryModal = document.getElementById('manual-entry-modal');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const manualEntryForm = document.getElementById('manual-entry-form');

    if (manualEntryBtn) manualEntryBtn.addEventListener('click', showManualEntryModal);
    if (closeBtn) closeBtn.addEventListener('click', hideManualEntryModal);
    if (cancelBtn) cancelBtn.addEventListener('click', hideManualEntryModal);
    if (manualEntryForm) manualEntryForm.addEventListener('submit', handleManualEntrySubmit);
}

// Load initial data from backend API
async function loadInitialData() {
    try {
        const result = await apiService.sales.getAll();
        
        if (result.success) {
            salesData = result.data;
            filteredData = [...salesData];
            
            updateDashboard();
            populateFilters();
            showNotification('Data loaded successfully', 'success');
        } else {
            console.error('API Error:', result.message);
            showNotification('Error loading data from server.', 'error');
        }
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error connecting to server. Please check if backend is running.', 'error');
    }
}

// Update all dashboard components
function updateDashboard() {
    updateKPICards();
    updateCharts();
    updateTable();
}

// Update KPI cards
function updateKPICards() {
    const totalRecords = filteredData.length;
    const totalSales = filteredData.reduce((sum, item) => sum + (item.sales || 0), 0);
    const totalRevenue = filteredData.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const avgSales = totalRecords > 0 ? totalSales / totalRecords : 0;

    updateKPI('total-records', totalRecords);
    updateKPI('total-sales', totalSales);
    updateKPI('total-revenue', totalRevenue);
    updateKPI('average-sales', avgSales);
}

// Update individual KPI
function updateKPI(id, value) {
    const element = document.getElementById(id);
    if (element) {
        if (id.includes('revenue') || id.includes('sales')) {
            element.textContent = `$${value.toLocaleString()}`;
        } else {
            element.textContent = value.toLocaleString();
        }
    }
}

// Initialize charts
function initializeCharts() {
    // Bar Chart - Sales by Category
    const barCtx = document.getElementById('barChart')?.getContext('2d');
    if (barCtx) {
        charts.barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Sales',
                    data: [],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Line Chart - Sales Trend
    const lineCtx = document.getElementById('lineChart')?.getContext('2d');
    if (lineCtx) {
        charts.lineChart = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Revenue',
                    data: [],
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Pie Chart - Category Distribution
    const pieCtx = document.getElementById('pieChart')?.getContext('2d');
    if (pieCtx) {
        charts.pieChart = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

// Update charts with data
function updateCharts() {
    if (!filteredData.length) return;

    // Update Bar Chart - Sales by Category
    if (charts.barChart) {
        const categoryData = {};
        filteredData.forEach(item => {
            const category = item.category || 'Unknown';
            categoryData[category] = (categoryData[category] || 0) + (item.sales || 0);
        });

        charts.barChart.data.labels = Object.keys(categoryData);
        charts.barChart.data.datasets[0].data = Object.values(categoryData);
        charts.barChart.update();
    }

    // Update Line Chart - Sales Trend
    if (charts.lineChart) {
        const trendData = {};
        filteredData.forEach(item => {
            const date = item.date ? item.date.split('T')[0] : 'Unknown';
            trendData[date] = (trendData[date] || 0) + (item.revenue || 0);
        });

        const sortedDates = Object.keys(trendData).sort();
        charts.lineChart.data.labels = sortedDates;
        charts.lineChart.data.datasets[0].data = sortedDates.map(date => trendData[date]);
        charts.lineChart.update();
    }

    // Update Pie Chart - Category Distribution
    if (charts.pieChart) {
        const categoryCount = {};
        filteredData.forEach(item => {
            const category = item.category || 'Unknown';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        charts.pieChart.data.labels = Object.keys(categoryCount);
        charts.pieChart.data.datasets[0].data = Object.values(categoryCount);
        charts.pieChart.update();
    }
}

// Update data table
function updateTable() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);

    tbody.innerHTML = '';
    pageData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id || ''}</td>
            <td>${item.product || ''}</td>
            <td>${item.category || ''}</td>
            <td>${item.sales || 0}</td>
            <td>${item.quantity || 0}</td>
            <td>${item.date || ''}</td>
            <td>${item.region || ''}</td>
            <td>${item.salesperson || ''}</td>
        `;
        tbody.appendChild(row);
    });
}

// Populate filter dropdowns
function populateFilters() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;

    const categories = [...new Set(filteredData.map(item => item.category).filter(Boolean))];
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('category-filter')?.value || '';
    const dateFrom = document.getElementById('date-from')?.value;
    const dateTo = document.getElementById('date-to')?.value;

    filteredData = salesData.filter(item => {
        const matchesSearch = !searchTerm || 
            (item.product && item.product.toLowerCase().includes(searchTerm)) ||
            (item.category && item.category.toLowerCase().includes(searchTerm)) ||
            (item.region && item.region.toLowerCase().includes(searchTerm));

        const matchesCategory = !categoryFilter || item.category === categoryFilter;

        const matchesDateFrom = !dateFrom || (item.date && new Date(item.date) >= new Date(dateFrom));
        const matchesDateTo = !dateTo || (item.date && new Date(item.date) <= new Date(dateTo));

        return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
    });

    currentPage = 1;
    updateDashboard();
}

// Handle file upload
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const result = await apiService.sales.import(formData);
        
        if (result.success) {
            showNotification(`Successfully uploaded ${result.data.importedCount} records!`, 'success');
            loadInitialData();
        } else {
            showNotification(`Upload failed: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification(`Upload failed: ${error.message}`, 'error');
    }

    // Clear file input
    event.target.value = '';
}

// Export data
function exportData() {
    if (!filteredData.length) {
        showNotification('No data to export', 'warning');
        return;
    }

    const csv = convertToCSV(filteredData);
    downloadCSV(csv, 'sales_data.csv');
    showNotification('Data exported successfully', 'success');
}

// Convert data to CSV
function convertToCSV(data) {
    const headers = ['ID', 'Product', 'Category', 'Sales', 'Quantity', 'Date', 'Region', 'Salesperson'];
    const csvContent = [
        headers.join(','),
        ...data.map(row => [
            row.id || '',
            row.product || '',
            row.category || '',
            row.sales || 0,
            row.quantity || 0,
            row.date || '',
            row.region || '',
            row.salesperson || ''
        ].join(','))
    ].join('\n');

    return csvContent;
}

// Download CSV file
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Navigation handler
function handleNavigation(event) {
    event.preventDefault();
    const targetPage = event.target.getAttribute('data-page');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');

    // Show/hide pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = 'none';
    });

    const targetElement = document.getElementById(`${targetPage}-page`);
    if (targetElement) {
        targetElement.style.display = 'block';
    }
}

// Theme toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('dark-mode-toggle');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.innerHTML = isDark ? '<span class="theme-icon">☀️</span>' : '<span class="theme-icon">🌙</span>';
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<span class="theme-icon">☀️</span>';
    }
}

// Real-time updates
function setupRealTimeUpdates() {
    const toggleBtn = document.getElementById('toggle-real-time');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
        isSimulating = !isSimulating;
        toggleBtn.textContent = isSimulating ? 'Pause' : 'Resume';
        
        if (isSimulating) {
            startRealTimeUpdates();
        } else {
            stopRealTimeUpdates();
        }
    });
}

function startRealTimeUpdates() {
    if (simulationInterval) return;
    
    simulationInterval = setInterval(() => {
        // Simulate real-time data updates
        const randomIndex = Math.floor(Math.random() * salesData.length);
        if (salesData[randomIndex]) {
            salesData[randomIndex].sales += Math.floor(Math.random() * 10) - 5;
            salesData[randomIndex].revenue += Math.floor(Math.random() * 100) - 50;
            updateDashboard();
        }
    }, 3000);
}

function stopRealTimeUpdates() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
}

// Manual entry modal
function showManualEntryModal() {
    const modal = document.getElementById('manual-entry-modal');
    if (modal) {
        modal.classList.add('show');
        // Set today's date as default
        const dateInput = document.getElementById('manual-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }
}

function hideManualEntryModal() {
    const modal = document.getElementById('manual-entry-modal');
    if (modal) {
        modal.classList.remove('show');
        // Reset form
        const form = document.getElementById('manual-entry-form');
        if (form) form.reset();
    }
}

// Handle manual entry submission
async function handleManualEntrySubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        product: formData.get('product'),
        category: formData.get('category'),
        sales: parseInt(formData.get('sales')),
        quantity: parseInt(formData.get('quantity')),
        date: formData.get('date'),
        region: formData.get('region'),
        salesperson: formData.get('salesperson')
    };

    try {
        const result = await apiService.sales.create(data);
        if (result.success) {
            showNotification('Record added successfully!', 'success');
            hideManualEntryModal();
            loadInitialData();
        } else {
            showNotification(`Failed to add record: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error adding record:', error);
        showNotification(`Failed to add record: ${error.message}`, 'error');
    }
}

// Load user preferences
function loadUserPreferences() {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
        Object.assign(userSettings, JSON.parse(savedSettings));
    }
}

// Save user preferences
function saveUserPreferences() {
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
}

// Setup filters
function setupFilters() {
    // Filter functionality is handled in applyFilters function
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
