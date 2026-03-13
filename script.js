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
    // Initialize page navigation
    setupNavigation();
    
    // Initialize charts
    initializeCharts();
    
    // Set up file upload
    setupFileUpload();
    
    // Initialize dark mode
    initializeDarkMode();
}

// Dark mode functionality
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️ Light Mode';
    }
    
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        this.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
        localStorage.setItem('darkMode', isDarkMode);
        
        // Update charts for dark mode
        updateChartsTheme(isDarkMode);
    });
}

// Update chart colors based on theme
function updateChartsTheme(isDarkMode) {
    const textColor = isDarkMode ? '#e2e8f0' : '#333';
    const gridColor = isDarkMode ? '#4a5568' : '#e2e8f0';
    
    Object.values(charts).forEach(chart => {
        chart.options.plugins.legend.labels.color = textColor;
        if (chart.options.scales) {
            if (chart.options.scales.x) {
                chart.options.scales.x.ticks.color = textColor;
                chart.options.scales.x.grid.color = gridColor;
            }
            if (chart.options.scales.y) {
                chart.options.scales.y.ticks.color = textColor;
                chart.options.scales.y.grid.color = gridColor;
            }
        }
        chart.update();
    });
}

// Load user preferences
function loadUserPreferences() {
    // Load dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').textContent = '☀️ Light Mode';
    }
    
    // Load any saved data
    const savedData = localStorage.getItem('salesData');
    if (savedData) {
        try {
            salesData = JSON.parse(savedData);
            filteredData = [...salesData];
            updateDashboard();
            populateFilters();
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
}

// Save data to localStorage
function saveDataToStorage() {
    try {
        localStorage.setItem('salesData', JSON.stringify(salesData));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Setup navigation between pages
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-content');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and pages
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding page
            const pageId = this.getAttribute('data-page') + '-page';
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.classList.add('active');
            }
        });
    });
}

// Initialize all charts
function initializeCharts() {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            }
        }
    };

    // Bar Chart - Sales by Category
    const barCtx = document.getElementById('barChart').getContext('2d');
    charts.bar = new Chart(barCtx, {
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
            ...chartOptions,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Line Chart - Monthly Revenue Trend
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    charts.line = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Revenue',
                data: [],
                borderColor: 'rgba(118, 75, 162, 1)',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Pie Chart - Product Distribution
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    charts.pie = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(237, 100, 166, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(75, 192, 192, 0.8)'
                ]
            }]
        },
        options: chartOptions
    });

    // Doughnut Chart - Regional Sales
    const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
    charts.doughnut = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(237, 100, 166, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ]
            }]
        },
        options: chartOptions
    });

    // Scatter Chart - Revenue vs Sales
    const scatterCtx = document.getElementById('scatterChart').getContext('2d');
    charts.scatter = new Chart(scatterCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Products',
                data: [],
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Sales'
                    },
                    beginAtZero: true
                },
                y: {
                    title: {
                        display: true,
                        text: 'Revenue'
                    },
                    beginAtZero: true
                }
            }
        }
    });

    // Radar Chart - Performance Metrics
    const radarCtx = document.getElementById('radarChart').getContext('2d');
    charts.radar = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: ['Sales', 'Revenue', 'Orders', 'Products', 'Regions'],
            datasets: [{
                label: 'Current Period',
                data: [],
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(102, 126, 234, 1)'
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                r: {
                    beginAtZero: true
                }
            }
        }
    });

    // Area Chart - Cumulative Revenue
    const areaCtx = document.getElementById('areaChart').getContext('2d');
    charts.area = new Chart(areaCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Cumulative Revenue',
                data: [],
                backgroundColor: 'rgba(118, 75, 162, 0.3)',
                borderColor: 'rgba(118, 75, 162, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Comparison Chart - Initially hidden
    const comparisonCtx = document.getElementById('comparisonChart');
    if (comparisonCtx) {
        charts.comparison = new Chart(comparisonCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Total Sales', 'Total Revenue', 'Total Orders', 'Average Order Value'],
                datasets: []
            },
            options: {
                ...chartOptions,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Load initial data from JSON file
async function loadInitialData() {
    try {
        const response = await fetch('data.json');
        salesData = await response.json();
        filteredData = [...salesData];
        
        updateDashboard();
        populateFilters();
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data. Please try again.', 'error');
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
    const totalSales = filteredData.reduce((sum, item) => sum + item.sales, 0);
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = filteredData.length;
    
    // Find best selling product
    const productSales = {};
    filteredData.forEach(item => {
        if (!productSales[item.product]) {
            productSales[item.product] = 0;
        }
        productSales[item.product] += item.sales;
    });
    
    const bestProduct = Object.keys(productSales).reduce((a, b) => 
        productSales[a] > productSales[b] ? a : b, '');
    
    // Update DOM
    document.getElementById('totalSales').textContent = totalSales.toLocaleString();
    document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toLocaleString();
    document.getElementById('totalOrders').textContent = totalOrders.toLocaleString();
    document.getElementById('bestProduct').textContent = bestProduct || '-';
}

// Update all charts
function updateCharts() {
    updateBarChart();
    updateLineChart();
    updatePieChart();
    updateDoughnutChart();
    updateScatterChart();
    updateRadarChart();
    updateAreaChart();
}

// Update bar chart - Sales by Category
function updateBarChart() {
    const categorySales = {};
    filteredData.forEach(item => {
        if (!categorySales[item.category]) {
            categorySales[item.category] = 0;
        }
        categorySales[item.category] += item.sales;
    });
    
    charts.bar.data.labels = Object.keys(categorySales);
    charts.bar.data.datasets[0].data = Object.values(categorySales);
    charts.bar.update();
}

// Update line chart - Monthly Revenue Trend
function updateLineChart() {
    const monthlyRevenue = {};
    filteredData.forEach(item => {
        const month = new Date(item.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
        });
        if (!monthlyRevenue[month]) {
            monthlyRevenue[month] = 0;
        }
        monthlyRevenue[month] += item.revenue;
    });
    
    const sortedMonths = Object.keys(monthlyRevenue).sort((a, b) => {
        return new Date(a) - new Date(b);
    });
    
    charts.line.data.labels = sortedMonths;
    charts.line.data.datasets[0].data = sortedMonths.map(month => monthlyRevenue[month]);
    charts.line.update();
}

// Update pie chart - Product Distribution
function updatePieChart() {
    const productSales = {};
    filteredData.forEach(item => {
        if (!productSales[item.product]) {
            productSales[item.product] = 0;
        }
        productSales[item.product] += item.sales;
    });
    
    // Get top 5 products
    const sortedProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    charts.pie.data.labels = sortedProducts.map(item => item[0]);
    charts.pie.data.datasets[0].data = sortedProducts.map(item => item[1]);
    charts.pie.update();
}

// Update doughnut chart - Regional Sales
function updateDoughnutChart() {
    const regionSales = {};
    filteredData.forEach(item => {
        if (!regionSales[item.region]) {
            regionSales[item.region] = 0;
        }
        regionSales[item.region] += item.sales;
    });
    
    charts.doughnut.data.labels = Object.keys(regionSales);
    charts.doughnut.data.datasets[0].data = Object.values(regionSales);
    charts.doughnut.update();
}

// Update scatter chart - Revenue vs Sales
function updateScatterChart() {
    const productData = {};
    filteredData.forEach(item => {
        if (!productData[item.product]) {
            productData[item.product] = { sales: 0, revenue: 0 };
        }
        productData[item.product].sales += item.sales;
        productData[item.product].revenue += item.revenue;
    });
    
    const scatterData = Object.entries(productData).map(([product, data]) => ({
        x: data.sales,
        y: data.revenue,
        label: product
    }));
    
    charts.scatter.data.datasets[0].data = scatterData;
    charts.scatter.update();
}

// Update radar chart - Performance Metrics
function updateRadarChart() {
    const totalSales = filteredData.reduce((sum, item) => sum + item.sales, 0);
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = filteredData.length;
    const uniqueProducts = [...new Set(filteredData.map(item => item.product))].length;
    const uniqueRegions = [...new Set(filteredData.map(item => item.region))].length;
    
    // Normalize values to 0-100 scale
    const maxSales = 1000;
    const maxRevenue = 100000;
    const maxOrders = 100;
    const maxProducts = 50;
    const maxRegions = 10;
    
    charts.radar.data.datasets[0].data = [
        (totalSales / maxSales) * 100,
        (totalRevenue / maxRevenue) * 100,
        (totalOrders / maxOrders) * 100,
        (uniqueProducts / maxProducts) * 100,
        (uniqueRegions / maxRegions) * 100
    ];
    charts.radar.update();
}

// Update area chart - Cumulative Revenue
function updateAreaChart() {
    const monthlyRevenue = {};
    filteredData.forEach(item => {
        const month = new Date(item.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
        });
        if (!monthlyRevenue[month]) {
            monthlyRevenue[month] = 0;
        }
        monthlyRevenue[month] += item.revenue;
    });
    
    const sortedMonths = Object.keys(monthlyRevenue).sort((a, b) => {
        return new Date(a) - new Date(b);
    });
    
    // Calculate cumulative revenue
    let cumulative = 0;
    const cumulativeData = sortedMonths.map(month => {
        cumulative += monthlyRevenue[month];
        return cumulative;
    });
    
    charts.area.data.labels = sortedMonths;
    charts.area.data.datasets[0].data = cumulativeData;
    charts.area.update();
}

// Update data table
function updateTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    // Populate table rows
    paginatedData.forEach(item => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${item.order_id}</td>
            <td>${item.product}</td>
            <td>${item.category}</td>
            <td>${item.region}</td>
            <td>${item.sales}</td>
            <td>$${item.revenue.toLocaleString()}</td>
            <td>${new Date(item.date).toLocaleDateString()}</td>
        `;
    });
    
    // Update pagination info
    updatePagination();
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Populate filter dropdowns
function populateFilters() {
    const categories = [...new Set(salesData.map(item => item.category))];
    const regions = [...new Set(salesData.map(item => item.region))];
    
    const categoryFilter = document.getElementById('categoryFilter');
    const regionFilter = document.getElementById('regionFilter');
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionFilter.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Filter controls
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Comparison controls
    document.getElementById('compareBtn').addEventListener('click', comparePeriods);
    document.getElementById('clearComparison').addEventListener('click', clearComparison);
    
    // Search and sort
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('sortSelect').addEventListener('change', handleSort);
    
    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateTable();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateTable();
        }
    });
    
    // Export and refresh
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);
    document.getElementById('simulationBtn').addEventListener('click', toggleSimulation);
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadInitialData();
        showNotification('Dashboard refreshed successfully!', 'success');
    });
    
    // Settings event listeners
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
    document.getElementById('exportSettingsBtn').addEventListener('click', exportSettings);
    document.getElementById('importSettingsBtn').addEventListener('click', importSettings);
    
    // Settings change listeners
    document.getElementById('themeSelect').addEventListener('change', handleThemeChange);
    document.getElementById('itemsPerPage').addEventListener('change', handleItemsPerPageChange);
    document.getElementById('autoRefresh').addEventListener('change', handleAutoRefreshChange);
    document.getElementById('chartAnimation').addEventListener('change', handleChartAnimationChange);
}

// Apply filters to data
function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const region = document.getElementById('regionFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    filteredData = salesData.filter(item => {
        let matches = true;
        
        if (category && item.category !== category) {
            matches = false;
        }
        
        if (region && item.region !== region) {
            matches = false;
        }
        
        if (startDate && new Date(item.date) < new Date(startDate)) {
            matches = false;
        }
        
        if (endDate && new Date(item.date) > new Date(endDate)) {
            matches = false;
        }
        
        return matches;
    });
    
    currentPage = 1;
    updateDashboard();
    showNotification('Filters applied successfully!', 'success');
}

// Clear all filters
function clearFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('regionFilter').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    
    filteredData = [...salesData];
    currentPage = 1;
    updateDashboard();
    showNotification('Filters cleared!', 'success');
}

// Handle search functionality
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm === '') {
        filteredData = [...salesData];
    } else {
        filteredData = salesData.filter(item => 
            item.order_id.toLowerCase().includes(searchTerm) ||
            item.product.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm) ||
            item.region.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    updateDashboard();
}

// Handle sort functionality
function handleSort() {
    const sortBy = document.getElementById('sortSelect').value;
    
    filteredData.sort((a, b) => {
        switch(sortBy) {
            case 'date':
                return new Date(a.date) - new Date(b.date);
            case 'sales':
                return b.sales - a.sales;
            case 'revenue':
                return b.revenue - a.revenue;
            case 'product':
                return a.product.localeCompare(b.product);
            default:
                return 0;
        }
    });
    
    updateTable();
}

// Export data to CSV
function exportData() {
    let csv = 'Order ID,Product,Category,Region,Sales,Revenue,Date\n';
    
    filteredData.forEach(item => {
        csv += `${item.order_id},${item.product},${item.category},${item.region},${item.sales},${item.revenue},${item.date}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'sales_data_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showNotification('Data exported successfully!', 'success');
}

// Setup file upload functionality
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    
    // Click to browse
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

// Handle file upload
function handleFileUpload(file) {
    const uploadStatus = document.getElementById('uploadStatus');
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
        uploadStatus.textContent = 'Invalid file type. Please upload CSV or Excel files.';
        uploadStatus.className = 'upload-status error';
        uploadStatus.style.display = 'block';
        return;
    }
    
    uploadStatus.textContent = 'Processing file...';
    uploadStatus.className = 'upload-status';
    uploadStatus.style.display = 'block';
    
    if (file.name.endsWith('.csv')) {
        // Parse CSV file
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                if (results.data && results.data.length > 0) {
                    // Convert CSV data to match our format
                    salesData = results.data.map(row => ({
                        order_id: row.order_id || row['Order ID'] || '',
                        product: row.product || row['Product'] || '',
                        category: row.category || row['Category'] || '',
                        region: row.region || row['Region'] || '',
                        sales: parseInt(row.sales || row['Sales'] || 0),
                        revenue: parseFloat(row.revenue || row['Revenue'] || 0),
                        date: row.date || row['Date'] || new Date().toISOString().split('T')[0]
                    })).filter(item => item.order_id && item.product);
                    
                    filteredData = [...salesData];
                    updateDashboard();
                    populateFilters();
                    
                    // Save data to localStorage
                    saveDataToStorage();
                    
                    uploadStatus.textContent = `Successfully uploaded ${salesData.length} records!`;
                    uploadStatus.className = 'upload-status success';
                    
                    // Switch to dashboard page
                    document.querySelector('.nav-link[data-page="dashboard"]').click();
                    
                    showNotification('Data uploaded successfully!', 'success');
                } else {
                    uploadStatus.textContent = 'No data found in the file.';
                    uploadStatus.className = 'upload-status error';
                }
            },
            error: function(error) {
                uploadStatus.textContent = 'Error parsing file: ' + error.message;
                uploadStatus.className = 'upload-status error';
            }
        });
    } else {
        // For Excel files, you would need a library like SheetJS
        uploadStatus.textContent = 'Excel file support requires additional library. Please use CSV format.';
        uploadStatus.className = 'upload-status error';
    }
}

// Show notification message
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#10b981';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            break;
        default:
            notification.style.backgroundColor = '#667eea';
    }
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Comparison Functions
function comparePeriods() {
    const period1Start = document.getElementById('period1Start').value;
    const period1End = document.getElementById('period1End').value;
    const period2Start = document.getElementById('period2Start').value;
    const period2End = document.getElementById('period2End').value;
    
    if (!period1Start || !period1End || !period2Start || !period2End) {
        showNotification('Please select both start and end dates for both periods', 'error');
        return;
    }
    
    // Filter data for period 1
    const period1Data = salesData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(period1Start) && itemDate <= new Date(period1End);
    });
    
    // Filter data for period 2
    const period2Data = salesData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(period2Start) && itemDate <= new Date(period2End);
    });
    
    if (period1Data.length === 0 || period2Data.length === 0) {
        showNotification('No data found for selected periods', 'error');
        return;
    }
    
    // Calculate metrics for both periods
    const period1Metrics = calculatePeriodMetrics(period1Data);
    const period2Metrics = calculatePeriodMetrics(period2Data);
    
    // Update comparison chart
    updateComparisonChart(period1Metrics, period2Metrics);
    
    // Update comparison stats
    updateComparisonStats(period1Metrics, period2Metrics);
    
    // Show results
    document.getElementById('comparisonResults').style.display = 'grid';
    
    showNotification('Comparison completed successfully!', 'success');
}

function calculatePeriodMetrics(data) {
    const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = data.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
        totalSales,
        totalRevenue,
        totalOrders,
        avgOrderValue
    };
}

function updateComparisonChart(period1Metrics, period2Metrics) {
    const period1Start = document.getElementById('period1Start').value;
    const period1End = document.getElementById('period1End').value;
    const period2Start = document.getElementById('period2Start').value;
    const period2End = document.getElementById('period2End').value;
    
    const period1Label = `${new Date(period1Start).toLocaleDateString()} - ${new Date(period1End).toLocaleDateString()}`;
    const period2Label = `${new Date(period2Start).toLocaleDateString()} - ${new Date(period2End).toLocaleDateString()}`;
    
    charts.comparison.data.datasets = [
        {
            label: period1Label,
            data: [
                period1Metrics.totalSales,
                period1Metrics.totalRevenue,
                period1Metrics.totalOrders,
                period1Metrics.avgOrderValue
            ],
            backgroundColor: 'rgba(102, 126, 234, 0.8)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 1
        },
        {
            label: period2Label,
            data: [
                period2Metrics.totalSales,
                period2Metrics.totalRevenue,
                period2Metrics.totalOrders,
                period2Metrics.avgOrderValue
            ],
            backgroundColor: 'rgba(118, 75, 162, 0.8)',
            borderColor: 'rgba(118, 75, 162, 1)',
            borderWidth: 1
        }
    ];
    
    charts.comparison.update();
}

function updateComparisonStats(period1Metrics, period2Metrics) {
    const statsContainer = document.getElementById('comparisonStats');
    
    const calculateChange = (value1, value2) => {
        const change = ((value2 - value1) / value1) * 100;
        return {
            value: change,
            isPositive: change >= 0
        };
    };
    
    const salesChange = calculateChange(period1Metrics.totalSales, period2Metrics.totalSales);
    const revenueChange = calculateChange(period1Metrics.totalRevenue, period2Metrics.totalRevenue);
    const ordersChange = calculateChange(period1Metrics.totalOrders, period2Metrics.totalOrders);
    const avgOrderChange = calculateChange(period1Metrics.avgOrderValue, period2Metrics.avgOrderValue);
    
    statsContainer.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Period 1 Sales</span>
            <span class="stat-value">${period1Metrics.totalSales.toLocaleString()}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Period 2 Sales</span>
            <span class="stat-value">${period2Metrics.totalSales.toLocaleString()}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Sales Change</span>
            <span class="stat-change ${salesChange.isPositive ? 'positive' : 'negative'}">
                ${salesChange.isPositive ? '+' : ''}${salesChange.value.toFixed(1)}%
            </span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Period 1 Revenue</span>
            <span class="stat-value">$${period1Metrics.totalRevenue.toLocaleString()}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Period 2 Revenue</span>
            <span class="stat-value">$${period2Metrics.totalRevenue.toLocaleString()}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Revenue Change</span>
            <span class="stat-change ${revenueChange.isPositive ? 'positive' : 'negative'}">
                ${revenueChange.isPositive ? '+' : ''}${revenueChange.value.toFixed(1)}%
            </span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Period 1 Orders</span>
            <span class="stat-value">${period1Metrics.totalOrders.toLocaleString()}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Period 2 Orders</span>
            <span class="stat-value">${period2Metrics.totalOrders.toLocaleString()}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Orders Change</span>
            <span class="stat-change ${ordersChange.isPositive ? 'positive' : 'negative'}">
                ${ordersChange.isPositive ? '+' : ''}${ordersChange.value.toFixed(1)}%
            </span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Period 1 Avg Order</span>
            <span class="stat-value">$${period1Metrics.avgOrderValue.toFixed(2)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Period 2 Avg Order</span>
            <span class="stat-value">$${period2Metrics.avgOrderValue.toFixed(2)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Avg Order Change</span>
            <span class="stat-change ${avgOrderChange.isPositive ? 'positive' : 'negative'}">
                ${avgOrderChange.isPositive ? '+' : ''}${avgOrderChange.value.toFixed(1)}%
            </span>
        </div>
    `;
}

function clearComparison() {
    document.getElementById('period1Start').value = '';
    document.getElementById('period1End').value = '';
    document.getElementById('period2Start').value = '';
    document.getElementById('period2End').value = '';
    document.getElementById('comparisonResults').style.display = 'none';
    
    showNotification('Comparison cleared', 'success');
}

// PDF Export Function
async function exportToPDF() {
    try {
        showNotification('Generating PDF report...', 'info');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Add title
        pdf.setFontSize(20);
        pdf.text('Sales Analytics Dashboard Report', 105, 20, { align: 'center' });
        
        // Add date
        pdf.setFontSize(12);
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
        
        let yPosition = 50;
        
        // Add KPI Summary
        pdf.setFontSize(16);
        pdf.text('KPI Summary', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        const totalSales = filteredData.reduce((sum, item) => sum + item.sales, 0);
        const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0);
        const totalOrders = filteredData.length;
        
        pdf.text(`Total Sales: ${totalSales.toLocaleString()}`, 20, yPosition);
        yPosition += 7;
        pdf.text(`Total Revenue: $${totalRevenue.toLocaleString()}`, 20, yPosition);
        yPosition += 7;
        pdf.text(`Total Orders: ${totalOrders.toLocaleString()}`, 20, yPosition);
        yPosition += 15;
        
        // Add charts
        pdf.setFontSize(16);
        pdf.text('Charts', 20, yPosition);
        yPosition += 10;
        
        // Capture and add charts
        const chartIds = ['barChart', 'lineChart', 'pieChart', 'doughnutChart'];
        
        for (const chartId of chartIds) {
            const chartElement = document.getElementById(chartId);
            if (chartElement) {
                try {
                    const canvas = await html2canvas(chartElement.closest('.chart-container'), {
                        backgroundColor: '#ffffff',
                        scale: 2
                    });
                    
                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = 170;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    
                    if (yPosition + imgHeight > 270) {
                        pdf.addPage();
                        yPosition = 20;
                    }
                    
                    pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
                    yPosition += imgHeight + 10;
                } catch (error) {
                    console.error(`Error capturing chart ${chartId}:`, error);
                }
            }
        }
        
        // Add data table summary
        if (yPosition > 200) {
            pdf.addPage();
            yPosition = 20;
        }
        
        pdf.setFontSize(16);
        pdf.text('Data Summary', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        pdf.text(`Total Records: ${filteredData.length}`, 20, yPosition);
        yPosition += 7;
        
        const categories = [...new Set(filteredData.map(item => item.category))];
        pdf.text(`Categories: ${categories.join(', ')}`, 20, yPosition);
        yPosition += 7;
        
        const regions = [...new Set(filteredData.map(item => item.region))];
        pdf.text(`Regions: ${regions.join(', ')}`, 20, yPosition);
        
        // Save PDF
        pdf.save(`sales-dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`);
        
        showNotification('PDF report generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        showNotification('Error generating PDF report. Please try again.', 'error');
    }
}

// Real-time Data Simulation
function toggleSimulation() {
    const simulationBtn = document.getElementById('simulationBtn');
    
    if (isSimulating) {
        stopSimulation();
        simulationBtn.textContent = '▶️ Simulate';
        simulationBtn.classList.remove('btn-danger');
        simulationBtn.classList.add('btn-secondary');
    } else {
        startSimulation();
        simulationBtn.textContent = '⏸️ Stop';
        simulationBtn.classList.remove('btn-secondary');
        simulationBtn.classList.add('btn-danger');
    }
}

function startSimulation() {
    isSimulating = true;
    showNotification('Real-time simulation started!', 'success');
    
    // Generate initial simulated data if no data exists
    if (salesData.length === 0) {
        generateSimulatedData();
    }
    
    // Update data every 2 seconds
    simulationInterval = setInterval(() => {
        updateSimulatedData();
    }, 2000);
}

function stopSimulation() {
    isSimulating = false;
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
    showNotification('Real-time simulation stopped', 'info');
}

function generateSimulatedData() {
    const products = [
        'Laptop Pro 15', 'Wireless Mouse', 'Office Chair', 'Standing Desk',
        'Coffee Maker', 'Smartphone X', 'Bookshelf', 'Blender',
        'Tablet Pro', 'Desk Lamp', 'Air Conditioner', 'Gaming Laptop',
        'Recliner Sofa', 'Microwave Oven', 'Smart Watch', 'Desktop Computer'
    ];
    
    const categories = ['Electronics', 'Furniture', 'Appliances'];
    const regions = ['North America', 'Europe', 'Asia'];
    
    const simulatedData = [];
    const numRecords = 50;
    
    for (let i = 0; i < numRecords; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const region = regions[Math.floor(Math.random() * regions.length)];
        const sales = Math.floor(Math.random() * 100) + 10;
        const revenue = sales * (Math.random() * 500 + 100);
        const date = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
        
        simulatedData.push({
            order_id: `ORD${String(i + 1).padStart(3, '0')}`,
            product,
            category,
            region,
            sales,
            revenue: Math.round(revenue),
            date: date.toISOString().split('T')[0]
        });
    }
    
    salesData = simulatedData;
    filteredData = [...salesData];
    updateDashboard();
    populateFilters();
    saveDataToStorage();
}

function updateSimulatedData() {
    // Simulate new orders being added
    const newOrders = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < newOrders; i++) {
        const products = ['Laptop Pro 15', 'Wireless Mouse', 'Office Chair', 'Standing Desk'];
        const categories = ['Electronics', 'Furniture', 'Appliances'];
        const regions = ['North America', 'Europe', 'Asia'];
        
        const product = products[Math.floor(Math.random() * products.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const region = regions[Math.floor(Math.random() * regions.length)];
        const sales = Math.floor(Math.random() * 50) + 5;
        const revenue = sales * (Math.random() * 300 + 150);
        
        const newOrder = {
            order_id: `ORD${String(salesData.length + 1).padStart(3, '0')}`,
            product,
            category,
            region,
            sales,
            revenue: Math.round(revenue),
            date: new Date().toISOString().split('T')[0]
        };
        
        salesData.push(newOrder);
    }
    
    // Keep only last 100 records to avoid performance issues
    if (salesData.length > 100) {
        salesData = salesData.slice(-100);
    }
    
    // Update filtered data to include new records
    const currentFilters = {
        category: document.getElementById('categoryFilter').value,
        region: document.getElementById('regionFilter').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value
    };
    
    applyFiltersWithParams(currentFilters);
    
    // Show notification for new data
    if (newOrders > 0) {
        showNotification(`${newOrders} new order(s) received!`, 'info');
    }
    
    // Save to storage
    saveDataToStorage();
}

function applyFiltersWithParams(filters) {
    filteredData = salesData.filter(item => {
        let matches = true;
        
        if (filters.category && item.category !== filters.category) {
            matches = false;
        }
        
        if (filters.region && item.region !== filters.region) {
            matches = false;
        }
        
        if (filters.startDate && new Date(item.date) < new Date(filters.startDate)) {
            matches = false;
        }
        
        if (filters.endDate && new Date(item.date) > new Date(filters.endDate)) {
            matches = false;
        }
        
        return matches;
    });
    
    updateDashboard();
}

// Settings Functions
function loadUserPreferences() {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
        try {
            userSettings = { ...userSettings, ...JSON.parse(savedSettings) };
            applySettings();
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    populateSettingsUI();
}

function populateSettingsUI() {
    document.getElementById('themeSelect').value = userSettings.theme;
    document.getElementById('chartAnimation').checked = userSettings.chartAnimation;
    document.getElementById('itemsPerPage').value = userSettings.itemsPerPage;
    document.getElementById('autoRefresh').value = userSettings.autoRefresh;
    document.getElementById('showNotifications').checked = userSettings.showNotifications;
    document.getElementById('notificationDuration').value = userSettings.notificationDuration;
    document.getElementById('autoSave').checked = userSettings.autoSave;
}

function applySettings() {
    // Apply theme
    if (userSettings.theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else if (userSettings.theme === 'light') {
        document.body.classList.remove('dark-mode');
    } else if (userSettings.theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
    
    // Update items per page
    window.itemsPerPage = userSettings.itemsPerPage;
    
    // Apply chart animation setting
    updateChartAnimationSettings();
    
    // Start auto refresh if enabled
    if (userSettings.autoRefresh > 0) {
        startAutoRefresh();
    }
}

function saveSettings() {
    userSettings.theme = document.getElementById('themeSelect').value;
    userSettings.chartAnimation = document.getElementById('chartAnimation').checked;
    userSettings.itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    userSettings.autoRefresh = parseInt(document.getElementById('autoRefresh').value);
    userSettings.showNotifications = document.getElementById('showNotifications').checked;
    userSettings.notificationDuration = parseInt(document.getElementById('notificationDuration').value);
    userSettings.autoSave = document.getElementById('autoSave').checked;
    
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    applySettings();
    
    showNotification('Settings saved successfully!', 'success');
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
        userSettings = {
            theme: 'light',
            chartAnimation: true,
            itemsPerPage: 10,
            autoRefresh: 0,
            showNotifications: true,
            notificationDuration: 3,
            autoSave: true
        };
        
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
        populateSettingsUI();
        applySettings();
        
        showNotification('Settings reset to default', 'success');
    }
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        salesData = [];
        filteredData = [];
        localStorage.removeItem('salesData');
        updateDashboard();
        populateFilters();
        
        showNotification('All data cleared', 'success');
    }
}

function exportSettings() {
    const settingsData = JSON.stringify(userSettings, null, 2);
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'dashboard-settings.json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showNotification('Settings exported successfully!', 'success');
}

function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedSettings = JSON.parse(event.target.result);
                    userSettings = { ...userSettings, ...importedSettings };
                    localStorage.setItem('userSettings', JSON.stringify(userSettings));
                    populateSettingsUI();
                    applySettings();
                    
                    showNotification('Settings imported successfully!', 'success');
                } catch (error) {
                    showNotification('Error importing settings. Invalid file format.', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

function handleThemeChange(e) {
    userSettings.theme = e.target.value;
    applySettings();
}

function handleItemsPerPageChange(e) {
    userSettings.itemsPerPage = parseInt(e.target.value);
    window.itemsPerPage = userSettings.itemsPerPage;
    currentPage = 1;
    updateTable();
}

function handleAutoRefreshChange(e) {
    userSettings.autoRefresh = parseInt(e.target.value);
    if (userSettings.autoRefresh > 0) {
        startAutoRefresh();
    } else {
        stopAutoRefresh();
    }
}

function handleChartAnimationChange(e) {
    userSettings.chartAnimation = e.target.checked;
    updateChartAnimationSettings();
}

function startAutoRefresh() {
    stopAutoRefresh();
    refreshInterval = setInterval(() => {
        loadInitialData();
        showNotification('Data refreshed automatically', 'info');
    }, userSettings.autoRefresh * 1000);
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

function updateChartAnimationSettings() {
    const animationDuration = userSettings.chartAnimation ? 1000 : 0;
    
    Object.values(charts).forEach(chart => {
        if (chart.options.animation) {
            chart.options.animation.duration = animationDuration;
            chart.update();
        }
    });
}

// Data Validation and Error Handling
function validateSalesData(data) {
    const errors = [];
    const warnings = [];
    
    if (!Array.isArray(data)) {
        errors.push('Data must be an array');
        return { isValid: false, errors, warnings };
    }
    
    if (data.length === 0) {
        warnings.push('No data records found');
        return { isValid: true, errors, warnings };
    }
    
    const requiredFields = ['order_id', 'product', 'category', 'region', 'sales', 'revenue', 'date'];
    const validCategories = ['Electronics', 'Furniture', 'Appliances'];
    const validRegions = ['North America', 'Europe', 'Asia'];
    
    data.forEach((item, index) => {
        // Check required fields
        requiredFields.forEach(field => {
            if (!item[field] && item[field] !== 0) {
                errors.push(`Row ${index + 1}: Missing required field '${field}'`);
            }
        });
        
        // Validate data types
        if (item.sales && (isNaN(item.sales) || item.sales < 0)) {
            errors.push(`Row ${index + 1}: Sales must be a positive number`);
        }
        
        if (item.revenue && (isNaN(item.revenue) || item.revenue < 0)) {
            errors.push(`Row ${index + 1}: Revenue must be a positive number`);
        }
        
        // Validate categories
        if (item.category && !validCategories.includes(item.category)) {
            warnings.push(`Row ${index + 1}: Unknown category '${item.category}'`);
        }
        
        // Validate regions
        if (item.region && !validRegions.includes(item.region)) {
            warnings.push(`Row ${index + 1}: Unknown region '${item.region}'`);
        }
        
        // Validate date format
        if (item.date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(item.date)) {
                errors.push(`Row ${index + 1}: Invalid date format. Use YYYY-MM-DD`);
            } else {
                const date = new Date(item.date);
                if (isNaN(date.getTime())) {
                    errors.push(`Row ${index + 1}: Invalid date`);
                }
            }
        }
        
        // Check for duplicate order IDs
        const duplicates = data.filter(d => d.order_id === item.order_id);
        if (duplicates.length > 1) {
            errors.push(`Duplicate order ID found: ${item.order_id}`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

function handleValidationError(validation, context = 'data upload') {
    let message = '';
    
    if (validation.errors.length > 0) {
        message = `Validation failed with ${validation.errors.length} error(s):\n`;
        message += validation.errors.slice(0, 5).join('\n'); // Show first 5 errors
        if (validation.errors.length > 5) {
            message += `\n... and ${validation.errors.length - 5} more errors`;
        }
        showNotification(message, 'error');
    }
    
    if (validation.warnings.length > 0) {
        message = `Data loaded with ${validation.warnings.length} warning(s):\n`;
        message += validation.warnings.slice(0, 3).join('\n'); // Show first 3 warnings
        if (validation.warnings.length > 3) {
            message += `\n... and ${validation.warnings.length - 3} more warnings`;
        }
        showNotification(message, 'info');
    }
    
    return validation.isValid;
}

function safeParseNumber(value, defaultValue = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

function safeParseInt(value, defaultValue = 0) {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

function sanitizeString(value) {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/[<>]/g, ''); // Remove potential HTML tags
}

function validateDateRange(startDate, endDate) {
    const errors = [];
    
    if (startDate && !isValidDate(startDate)) {
        errors.push('Invalid start date format');
    }
    
    if (endDate && !isValidDate(endDate)) {
        errors.push('Invalid end date format');
    }
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        errors.push('Start date cannot be after end date');
    }
    
    return errors;
}

function isValidDate(dateString) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

function handleError(error, context = 'operation') {
    console.error(`Error in ${context}:`, error);
    
    let userMessage = 'An unexpected error occurred. Please try again.';
    
    if (error.message) {
        if (error.message.includes('Network')) {
            userMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('parse')) {
            userMessage = 'Data format error. Please check your file format.';
        } else if (error.message.includes('storage')) {
            userMessage = 'Storage error. Please clear browser data and try again.';
        }
    }
    
    showNotification(userMessage, 'error');
}

// Enhanced error handling for existing functions
function safeUpdateDashboard() {
    try {
        updateDashboard();
    } catch (error) {
        handleError(error, 'dashboard update');
    }
}

function safeUpdateCharts() {
    try {
        updateCharts();
    } catch (error) {
        handleError(error, 'chart update');
    }
}

function safeUpdateTable() {
    try {
        updateTable();
    } catch (error) {
        handleError(error, 'table update');
    }
}
