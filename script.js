// Global variables to store data and chart instances
let salesData = [];
let barChart = null;
let lineChart = null;
let pieChart = null;
let currentSortColumn = null;
let sortDirection = 'asc';
let realTimeInterval = null;
let updateCount = 0;
let isRealTimeActive = true;

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

// Main initialization function
async function initializeDashboard() {
    try {
        // Load data from JSON file
        await loadData();
        
        // Validate and process data
        const processedData = validateAndProcessData(salesData);
        
        // Update summary statistics
        updateStatistics(processedData);
        
        // Render charts
        renderCharts(processedData);
        
        // Populate data table
        populateDataTable(processedData);
        
        // Setup event listeners
        setupEventListeners();
        
        // Start real-time updates
        startRealTimeUpdates();
        
        // Setup dark mode
        setupDarkMode();
        
        // Show success message
        showValidationMessage('Dashboard loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showValidationMessage('Error loading dashboard. Please check the data file.', 'error');
    }
}

// Load data from JSON file
async function loadData() {
    try {
        // Fetch data from data.json file
        const response = await fetch("data.json");
        const data = await response.json();
        
        // Handle different data formats
        if (data.salesData) {
            salesData = data.salesData;
        } else if (Array.isArray(data)) {
            salesData = data;
        } else {
            throw new Error('Invalid data format');
        }
        
        console.log(`Loaded ${salesData.length} records from data.json`);
    } catch (error) {
        console.error('Error loading data:', error);
        
        // Fallback to sample data if fetch fails
        salesData = [
            {"id": 1, "product": "Laptop", "category": "Electronics", "sales": 1500, "quantity": 15, "date": "2024-01-15", "region": "North", "salesperson": "John Smith"},
            {"id": 2, "product": "Mouse", "category": "Electronics", "sales": 250, "quantity": 50, "date": "2024-01-16", "region": "South", "salesperson": "Sarah Johnson"},
            {"id": 3, "product": "Keyboard", "category": "Electronics", "sales": 450, "quantity": 30, "date": "2024-01-17", "region": "East", "salesperson": "Mike Davis"},
            {"id": 4, "product": "Monitor", "category": "Electronics", "sales": 800, "quantity": 20, "date": "2024-01-18", "region": "West", "salesperson": "Emily Wilson"},
            {"id": 5, "product": "Desk Chair", "category": "Furniture", "sales": 1200, "quantity": 12, "date": "2024-01-19", "region": "North", "salesperson": "John Smith"}
        ];
        
        console.log('Using fallback sample data');
    }
}

// Validate and process data
function validateAndProcessData(data) {
    const processedData = [];
    const validationErrors = [];
    
    data.forEach((record, index) => {
        const errors = [];
        
        // Check for required fields
        if (!record.id || record.id === '') errors.push('Missing ID');
        if (!record.product || record.product === '') errors.push('Missing Product');
        if (!record.category || record.category === '') errors.push('Missing Category');
        if (!record.sales || record.sales === '') errors.push('Missing Sales');
        if (!record.quantity || record.quantity === '') errors.push('Missing Quantity');
        if (!record.date || record.date === '') errors.push('Missing Date');
        
        // Validate data types
        if (record.sales && isNaN(record.sales)) errors.push('Sales must be a number');
        if (record.quantity && isNaN(record.quantity)) errors.push('Quantity must be a number');
        
        // Validate date format
        if (record.date && !isValidDate(record.date)) errors.push('Invalid date format');
        
        // Add validation status to record
        const processedRecord = {
            ...record,
            isValid: errors.length === 0,
            validationErrors: errors,
            originalIndex: index
        };
        
        processedData.push(processedRecord);
        
        // Log validation errors
        if (errors.length > 0) {
            validationErrors.push(`Record ${index + 1}: ${errors.join(', ')}`);
        }
    });
    
    // Show validation messages
    if (validationErrors.length > 0) {
        showValidationMessage(`Found ${validationErrors.length} validation issues:`, 'warning');
        validationErrors.forEach(error => {
            console.warn(error);
        });
    }
    
    return processedData;
}

// Helper function to validate date
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// Update summary statistics
function updateStatistics(data) {
    const validData = data.filter(record => record.isValid);
    const totalRecords = validData.length;
    const totalSales = validData.reduce((sum, record) => sum + parseFloat(record.sales), 0);
    const averageSales = totalRecords > 0 ? totalSales / totalRecords : 0;
    const totalQuantity = validData.reduce((sum, record) => sum + parseInt(record.quantity), 0);
    
    // Update DOM elements with animation
    animateValue('total-records', 0, totalRecords, 1000);
    animateValue('total-sales', 0, totalSales, 1000, '$');
    animateValue('average-sales', 0, averageSales, 1000, '$');
    animateValue('total-quantity', 0, totalQuantity, 1000);
}

// Animate numeric values
function animateValue(elementId, start, end, duration, prefix = '') {
    const element = document.getElementById(elementId);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = prefix + Math.round(current).toLocaleString();
    }, 16);
}

// Render charts
function renderCharts(data) {
    const validData = data.filter(record => record.isValid);
    
    // Prepare data for charts
    const categoryData = aggregateByCategory(validData);
    const trendData = aggregateByDate(validData);
    
    // Create charts
    createBarChart(categoryData);
    createLineChart(trendData);
    createPieChart(categoryData);
    
    // Setup chart interactions
    setupChartInteractions();
}

// Aggregate data by category
function aggregateByCategory(data) {
    const categories = {};
    
    data.forEach(record => {
        if (!categories[record.category]) {
            categories[record.category] = {
                totalSales: 0,
                totalQuantity: 0,
                count: 0
            };
        }
        categories[record.category].totalSales += parseFloat(record.sales);
        categories[record.category].totalQuantity += parseInt(record.quantity);
        categories[record.category].count += 1;
    });
    
    return categories;
}

// Aggregate data by date
function aggregateByDate(data) {
    const dates = {};
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedData.forEach(record => {
        if (!dates[record.date]) {
            dates[record.date] = 0;
        }
        dates[record.date] += parseFloat(record.sales);
    });
    
    return dates;
}

// Create bar chart
function createBarChart(categoryData) {
    const ctx = document.getElementById('barChart').getContext('2d');
    
    const labels = Object.keys(categoryData);
    const data = labels.map(category => categoryData[category].totalSales);
    
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Sales by Category',
                data: data,
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(118, 75, 162, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Create line chart
function createLineChart(dateData) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    
    const labels = Object.keys(dateData);
    const data = labels.map(date => dateData[date]);
    
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales Trend',
                data: data,
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Create pie chart
function createPieChart(categoryData) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    const labels = Object.keys(categoryData);
    const data = labels.map(category => categoryData[category].totalSales);
    
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(118, 75, 162, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': $' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Populate data table
function populateDataTable(data) {
    const tableBody = document.getElementById('table-body');
    const categoryFilter = document.getElementById('category-filter');
    
    // Clear existing table content
    tableBody.innerHTML = '';
    
    // Populate category filter
    const categories = [...new Set(data.map(record => record.category))];
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
    });
    
    // Render table rows
    data.forEach(record => {
        const row = createTableRow(record);
        tableBody.appendChild(row);
    });
}

// Create table row
function createTableRow(record) {
    const row = document.createElement('tr');
    if (!record.isValid) {
        row.classList.add('invalid');
    }
    
    row.innerHTML = `
        <td>${record.id}</td>
        <td>${record.product}</td>
        <td>${record.category}</td>
        <td>$${parseFloat(record.sales).toLocaleString()}</td>
        <td>${record.quantity}</td>
        <td>${record.date}</td>
        <td>${record.region}</td>
        <td>${record.salesperson}</td>
    `;
    
    return row;
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', filterTable);
    
    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    categoryFilter.addEventListener('change', filterTable);
    
    // Date filters
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    dateFrom.addEventListener('change', filterTable);
    dateTo.addEventListener('change', filterTable);
    
    // Price filters
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    priceMin.addEventListener('input', filterTable);
    priceMax.addEventListener('input', filterTable);
    
    // Sortable table headers
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => sortTable(header.dataset.column));
    });
    
    // Export CSV
    const exportBtn = document.getElementById('export-csv');
    exportBtn.addEventListener('click', exportToCSV);
    
    // Real-time toggle
    const realTimeToggle = document.getElementById('toggle-real-time');
    realTimeToggle.addEventListener('click', toggleRealTime);
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.addEventListener('click', refreshDashboard);
    
    // Navigation smooth scroll
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Smooth scroll to section
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Filter table based on search, category, date range, and price range
function filterTable() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    const priceMin = parseFloat(document.getElementById('price-min').value) || 0;
    const priceMax = parseFloat(document.getElementById('price-max').value) || Infinity;
    const tableRows = document.querySelectorAll('#table-body tr');
    
    tableRows.forEach(row => {
        const product = row.cells[1].textContent.toLowerCase();
        const category = row.cells[2].textContent;
        const date = row.cells[5].textContent;
        const sales = parseFloat(row.cells[3].textContent.replace('$', '').replace(',', ''));
        
        const matchesSearch = product.includes(searchInput);
        const matchesCategory = !categoryFilter || category === categoryFilter;
        const matchesDateFrom = !dateFrom || new Date(date) >= new Date(dateFrom);
        const matchesDateTo = !dateTo || new Date(date) <= new Date(dateTo);
        const matchesPriceRange = sales >= priceMin && sales <= priceMax;
        
        if (matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo && matchesPriceRange) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Refresh dashboard
async function refreshDashboard() {
    const refreshBtn = document.getElementById('refresh-btn');
    const originalText = refreshBtn.textContent;
    
    // Show loading state
    refreshBtn.innerHTML = '<span class="loading"></span> Loading...';
    refreshBtn.disabled = true;
    
    try {
        // Reload data
        await loadData();
        
        // Process and update dashboard
        const processedData = validateAndProcessData(salesData);
        updateStatistics(processedData);
        
        // Update charts
        updateCharts(processedData);
        
        // Update table
        populateDataTable(processedData);
        
        showValidationMessage('Dashboard refreshed successfully!', 'success');
        
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
        showValidationMessage('Error refreshing dashboard.', 'error');
    } finally {
        // Reset button state
        refreshBtn.textContent = originalText;
        refreshBtn.disabled = false;
    }
}

// Update charts with new data
function updateCharts(data) {
    const validData = data.filter(record => record.isValid);
    const categoryData = aggregateByCategory(validData);
    const trendData = aggregateByDate(validData);
    
    // Update bar chart
    if (barChart) {
        const labels = Object.keys(categoryData);
        const chartData = labels.map(category => categoryData[category].totalSales);
        
        barChart.data.labels = labels;
        barChart.data.datasets[0].data = chartData;
        barChart.update();
    }
    
    // Update line chart
    if (lineChart) {
        const labels = Object.keys(trendData);
        const chartData = labels.map(date => trendData[date]);
        
        lineChart.data.labels = labels;
        lineChart.data.datasets[0].data = chartData;
        lineChart.update();
    }
    
    // Update pie chart
    if (pieChart) {
        const labels = Object.keys(categoryData);
        const chartData = labels.map(category => categoryData[category].totalSales);
        
        pieChart.data.labels = labels;
        pieChart.data.datasets[0].data = chartData;
        pieChart.update();
    }
}

// Show validation messages
function showValidationMessage(message, type) {
    const validationContainer = document.getElementById('validation-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `validation-message ${type} fade-in`;
    messageDiv.textContent = message;
    
    validationContainer.appendChild(messageDiv);
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 5000);
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Sort table functionality
function sortTable(column) {
    const table = document.getElementById('data-table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Toggle sort direction
    if (currentSortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        sortDirection = 'asc';
    }
    
    // Update header classes
    document.querySelectorAll('.sortable').forEach(header => {
        header.classList.remove('sorted-asc', 'sorted-desc');
    });
    const currentHeader = document.querySelector(`[data-column="${column}"]`);
    currentHeader.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
    
    // Sort rows
    rows.sort((a, b) => {
        let aValue = a.cells[getColumnIndex(column)].textContent;
        let bValue = b.cells[getColumnIndex(column)].textContent;
        
        // Handle numeric columns
        if (column === 'id' || column === 'sales' || column === 'quantity') {
            aValue = parseFloat(aValue.replace(/[^0-9.-]/g, ''));
            bValue = parseFloat(bValue.replace(/[^0-9.-]/g, ''));
        }
        
        // Handle date column
        if (column === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

// Get column index by column name
function getColumnIndex(columnName) {
    const columnIndexMap = {
        'id': 0,
        'product': 1,
        'category': 2,
        'sales': 3,
        'quantity': 4,
        'date': 5,
        'region': 6,
        'salesperson': 7
    };
    return columnIndexMap[columnName];
}

// Export to CSV functionality
function exportToCSV() {
    const validData = salesData.filter(record => record.isValid);
    
    // Create CSV content
    const headers = ['ID', 'Product', 'Category', 'Sales', 'Quantity', 'Date', 'Region', 'Salesperson'];
    const csvContent = [
        headers.join(','),
        ...validData.map(record => [
            record.id,
            record.product,
            record.category,
            record.sales,
            record.quantity,
            record.date,
            record.region,
            record.salesperson
        ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showValidationMessage('Data exported successfully!', 'success');
}

// Dark mode functionality
function setupDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '☀️';
    }
    
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
}

// Real-time updates functionality
function startRealTimeUpdates() {
    if (realTimeInterval) {
        clearInterval(realTimeInterval);
    }
    
    realTimeInterval = setInterval(() => {
        if (isRealTimeActive) {
            simulateRealTimeUpdate();
        }
    }, 5000); // Update every 5 seconds
}

function simulateRealTimeUpdate() {
    // Simulate a random data update
    const randomIndex = Math.floor(Math.random() * salesData.length);
    const randomRecord = salesData[randomIndex];
    
    // Randomly adjust sales value
    const adjustment = (Math.random() - 0.5) * 100; // Random adjustment between -50 and +50
    randomRecord.sales = Math.max(10, parseFloat(randomRecord.sales) + adjustment);
    
    // Update dashboard
    const processedData = validateAndProcessData(salesData);
    updateStatistics(processedData);
    updateCharts(processedData);
    
    // Update counter
    updateCount++;
    document.getElementById('update-count').textContent = updateCount;
    
    // Show subtle notification
    if (updateCount % 5 === 0) {
        showValidationMessage(`Live update: ${randomRecord.product} sales updated to $${randomRecord.sales.toFixed(2)}`, 'success');
    }
}

function toggleRealTime() {
    isRealTimeActive = !isRealTimeActive;
    const toggleBtn = document.getElementById('toggle-real-time');
    const statusIndicator = document.querySelector('.status-indicator');
    
    if (isRealTimeActive) {
        toggleBtn.textContent = 'Pause';
        statusIndicator.classList.remove('paused');
        showValidationMessage('Real-time updates resumed', 'success');
    } else {
        toggleBtn.textContent = 'Resume';
        statusIndicator.classList.add('paused');
        showValidationMessage('Real-time updates paused', 'warning');
    }
}

// Enhanced chart click functionality (drill-down)
function setupChartInteractions() {
    // Bar chart click handler
    if (barChart) {
        barChart.options.onClick = function(event, elements) {
            if (elements.length > 0) {
                const element = elements[0];
                const category = this.data.labels[element.index];
                drillDownToCategory(category);
            }
        };
    }
    
    // Pie chart click handler
    if (pieChart) {
        pieChart.options.onClick = function(event, elements) {
            if (elements.length > 0) {
                const element = elements[0];
                const category = this.data.labels[element.index];
                drillDownToCategory(category);
            }
        };
    }
}

function drillDownToCategory(category) {
    // Filter data by selected category
    const categoryData = salesData.filter(record => record.category === category);
    
    // Update table to show only category data
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    
    categoryData.forEach(record => {
        const row = createTableRow(record);
        tableBody.appendChild(row);
    });
    
    // Update category filter
    document.getElementById('category-filter').value = category;
    
    // Scroll to table
    document.getElementById('data-table').scrollIntoView({ behavior: 'smooth' });
    
    showValidationMessage(`Showing ${categoryData.length} records for ${category}`, 'success');
}
