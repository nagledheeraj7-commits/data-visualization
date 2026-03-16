// Professional Analytics Dashboard JavaScript

// Global Variables
let uploadedData = [];
let charts = {};
let currentPage = 1;
const itemsPerPage = 10;
let filteredData = [];
let currentTheme = 'light';

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const uploadStatus = document.getElementById('uploadStatus');
const loadingOverlay = document.getElementById('loadingOverlay');
const themeToggle = document.getElementById('themeToggle');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const projectInfoBtn = document.getElementById('projectInfoBtn');
const projectInfoModal = document.getElementById('projectInfoModal');
const modalClose = document.getElementById('modalClose');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    initializeTheme();
    animateKPIs();
    setupNavigation();
    loadSampleData();
}

// Setup Event Listeners
function setupEventListeners() {
    // File Upload Events
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and Drop Events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Theme Toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Mobile Menu
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    // Sidebar
    sidebarToggle.addEventListener('click', closeSidebar);
    
    // Project Info Modal
    projectInfoBtn.addEventListener('click', openProjectInfo);
    modalClose.addEventListener('click', closeProjectInfo);
    
    // Filter Events
    document.getElementById('searchInput')?.addEventListener('input', handleFilter);
    document.getElementById('tableSearch')?.addEventListener('input', handleTableSearch);
    document.getElementById('refreshBtn')?.addEventListener('click', refreshData);
    
    // Export Events
    document.getElementById('exportCsvBtn')?.addEventListener('click', exportToCSV);
    document.getElementById('exportExcelBtn')?.addEventListener('click', exportToExcel);
    document.getElementById('exportChartsBtn')?.addEventListener('click', exportCharts);
    
    // Chart Action Buttons
    document.querySelectorAll('.chart-action-btn').forEach(btn => {
        btn.addEventListener('click', handleChartAction);
    });
}

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    currentTheme = theme;
    document.body.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
    
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    localStorage.setItem('theme', theme);
    
    // Update chart colors for theme
    updateChartsTheme();
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Navigation System
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .sidebar-item');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showSection(targetId);
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Close mobile menu
            closeSidebar();
        });
    });
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });
}

function toggleMobileMenu() {
    sidebar.classList.toggle('open');
}

function closeSidebar() {
    sidebar.classList.remove('open');
}

// Modal Management
function openProjectInfo() {
    projectInfoModal.classList.add('open');
}

function closeProjectInfo() {
    projectInfoModal.classList.remove('open');
}

// KPI Animations
function animateKPIs() {
    const kpiValues = document.querySelectorAll('.kpi-value[data-target]');
    
    kpiValues.forEach(kpi => {
        const target = parseFloat(kpi.dataset.target);
        const prefix = kpi.textContent.includes('$') ? '$' : 
                      kpi.textContent.includes('%') ? '%' : '';
        animateNumber(kpi, 0, target, prefix);
    });
}

function animateNumber(element, start, end, prefix = '') {
    const duration = 2000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (end - start) * easeOutQuart(progress);
        element.textContent = prefix + formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    } else if (num % 1 !== 0) {
        return num.toFixed(1);
    }
    return Math.round(num).toString();
}

// File Upload Functions
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        uploadFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

async function uploadFile(file) {
    if (!validateFile(file)) {
        return;
    }
    
    showLoading();
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch("http://localhost:3000/api/upload", {
            method: "POST",
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showUploadStatus('success', `✅ ${result.message}`);
            uploadedData = result.data;
            filteredData = [...uploadedData];
            
            // Update all sections
            updateDataSummary(result);
            populateFilters(result.columns);
            generateAllCharts();
            populateDataTable();
            updateTopProducts();
            
            // Show success animation
            animateSuccess();
        } else {
            showUploadStatus('error', `❌ ${result.message}`);
        }
    } catch (error) {
        console.error('Upload error:', error);
        showUploadStatus('error', '❌ Failed to upload file. Please try again.');
    } finally {
        hideLoading();
        fileInput.value = '';
    }
}

function validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    
    if (file.size > maxSize) {
        showUploadStatus('error', '❌ File size exceeds 10MB limit');
        return false;
    }
    
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        showUploadStatus('error', '❌ Only CSV and Excel files are allowed');
        return false;
    }
    
    return true;
}

function showUploadStatus(type, message) {
    uploadStatus.style.display = 'flex';
    uploadStatus.className = `upload-status ${type}`;
    
    const statusIcon = uploadStatus.querySelector('.status-icon');
    const statusMessage = uploadStatus.querySelector('.status-message');
    
    statusIcon.textContent = type === 'success' ? '✅' : '❌';
    statusMessage.textContent = message;
    
    setTimeout(() => {
        uploadStatus.style.display = 'none';
    }, 5000);
}

function showLoading() {
    loadingOverlay.classList.add('show');
}

function hideLoading() {
    loadingOverlay.classList.remove('show');
}

function animateSuccess() {
    // Animate KPI cards
    const kpiCards = document.querySelectorAll('.kpi-card');
    kpiCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'scale(1.05)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 200);
        }, index * 100);
    });
}

// Data Processing Functions
function updateDataSummary(result) {
    // Update summary info if elements exist
    const totalRecords = document.getElementById('totalRecords');
    const totalColumns = document.getElementById('totalColumns');
    const fileName = document.getElementById('fileName');
    
    if (totalRecords) totalRecords.textContent = result.rowCount;
    if (totalColumns) totalColumns.textContent = result.columns.length;
    if (fileName) fileName.textContent = result.filename;
}

function populateFilters(columns) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        columns.forEach(column => {
            const option = document.createElement('option');
            option.value = column;
            option.textContent = column;
            categoryFilter.appendChild(option);
        });
    }
}

// Chart Generation Functions
function generateAllCharts() {
    if (uploadedData.length === 0) return;
    
    // Generate main charts
    generateSalesTrendChart();
    generateRevenueCategoryChart();
    generateCategoryDistributionChart();
    generateRegionSalesChart();
    
    // Generate analytics charts
    generateMonthlyGrowthChart();
    generateRegionalPerformanceChart();
    generateKPIComparisonChart();
}

function generateSalesTrendChart() {
    const ctx = document.getElementById('salesTrendChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (charts.salesTrend) charts.salesTrend.destroy();
    
    const chartData = prepareTimeSeriesData();
    
    charts.salesTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Sales Trend',
                data: chartData.data,
                borderColor: getComputedStyle(document.body).getPropertyValue('--accent-primary'),
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--accent-primary') + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: getChartOptions('Sales Trend Over Time')
    });
}

function generateRevenueCategoryChart() {
    const ctx = document.getElementById('revenueCategoryChart');
    if (!ctx) return;
    
    if (charts.revenueCategory) charts.revenueCategory.destroy();
    
    const chartData = prepareCategoryData();
    
    charts.revenueCategory = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Revenue by Category',
                data: chartData.data,
                backgroundColor: generateGradientColors(chartData.labels.length),
                borderWidth: 0,
                borderRadius: 8
            }]
        },
        options: getChartOptions('Revenue by Category', 'bar')
    });
}

function generateCategoryDistributionChart() {
    const ctx = document.getElementById('categoryDistributionChart');
    if (!ctx) return;
    
    if (charts.categoryDistribution) charts.categoryDistribution.destroy();
    
    const chartData = prepareCategoryData();
    
    charts.categoryDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                backgroundColor: generateColors(chartData.labels.length),
                borderWidth: 2,
                borderColor: getComputedStyle(document.body).getPropertyValue('--bg-secondary')
            }]
        },
        options: getChartOptions('Category Distribution', 'doughnut')
    });
}

function generateRegionSalesChart() {
    const ctx = document.getElementById('regionSalesChart');
    if (!ctx) return;
    
    if (charts.regionSales) charts.regionSales.destroy();
    
    const chartData = prepareRegionData();
    
    charts.regionSales = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Regional Sales',
                data: chartData.data,
                backgroundColor: generateGradientColors(chartData.labels.length, 'region'),
                borderWidth: 0,
                borderRadius: 8
            }]
        },
        options: getChartOptions('Sales by Region', 'bar')
    });
}

function generateMonthlyGrowthChart() {
    const ctx = document.getElementById('monthlyGrowthChart');
    if (!ctx) return;
    
    if (charts.monthlyGrowth) charts.monthlyGrowth.destroy();
    
    const chartData = prepareGrowthData();
    
    charts.monthlyGrowth = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Monthly Growth',
                data: chartData.data,
                borderColor: getComputedStyle(document.body).getPropertyValue('--accent-success'),
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--accent-success') + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: getChartOptions('Monthly Growth Rate')
    });
}

function generateRegionalPerformanceChart() {
    const ctx = document.getElementById('regionalPerformanceChart');
    if (!ctx) return;
    
    if (charts.regionalPerformance) charts.regionalPerformance.destroy();
    
    const chartData = prepareRegionData();
    
    charts.regionalPerformance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Regional Performance',
                data: chartData.data,
                borderColor: getComputedStyle(document.body).getPropertyValue('--accent-secondary'),
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--accent-secondary') + '20',
                borderWidth: 2,
                pointRadius: 5
            }]
        },
        options: getChartOptions('Regional Performance', 'radar')
    });
}

function generateKPIComparisonChart() {
    const ctx = document.getElementById('kpiComparisonChart');
    if (!ctx) return;
    
    if (charts.kpiComparison) charts.kpiComparison.destroy();
    
    const chartData = prepareKPIComparisonData();
    
    charts.kpiComparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: chartData.datasets
        },
        options: getChartOptions('KPI Comparison', 'bar')
    });
}

// Data Preparation Functions
function prepareTimeSeriesData() {
    const monthlyData = {};
    
    filteredData.forEach(row => {
        const date = row.date || row.Date || new Date().toISOString().split('T')[0];
        const month = date.substring(0, 7);
        const value = parseFloat(row.sales || row.Sales || row.revenue || row.Revenue || 0);
        
        monthlyData[month] = (monthlyData[month] || 0) + value;
    });
    
    return {
        labels: Object.keys(monthlyData).sort(),
        data: Object.values(monthlyData)
    };
}

function prepareCategoryData() {
    const categoryData = {};
    
    filteredData.forEach(row => {
        const category = row.category || row.Category || 'Unknown';
        const value = parseFloat(row.sales || row.Sales || row.revenue || row.Revenue || 0);
        
        categoryData[category] = (categoryData[category] || 0) + value;
    });
    
    return {
        labels: Object.keys(categoryData),
        data: Object.values(categoryData)
    };
}

function prepareRegionData() {
    const regionData = {};
    
    filteredData.forEach(row => {
        const region = row.region || row.Region || 'Unknown';
        const value = parseFloat(row.sales || row.Sales || row.revenue || row.Revenue || 0);
        
        regionData[region] = (regionData[region] || 0) + value;
    });
    
    return {
        labels: Object.keys(regionData),
        data: Object.values(regionData)
    };
}

function prepareGrowthData() {
    // Simulate growth data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const growthRates = [12, 15, 18, 22, 25, 28];
    
    return {
        labels: months,
        data: growthRates
    };
}

function prepareKPIComparisonData() {
    return {
        labels: ['Revenue', 'Orders', 'Users', 'Growth'],
        datasets: [
            {
                label: 'Current',
                data: [85, 92, 78, 88],
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--accent-primary'),
                borderWidth: 0,
                borderRadius: 8
            },
            {
                label: 'Target',
                data: [90, 95, 85, 92],
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--accent-secondary'),
                borderWidth: 0,
                borderRadius: 8
            }
        ]
    };
}

// Chart Helper Functions
function getChartOptions(title, type = 'line') {
    const isDark = currentTheme === 'dark';
    const textColor = getComputedStyle(document.body).getPropertyValue('--text-primary');
    const gridColor = getComputedStyle(document.body).getPropertyValue('--border-primary');
    
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: type === 'doughnut' || type === 'radar',
                position: type === 'doughnut' ? 'right' : 'top',
                labels: {
                    color: textColor,
                    font: {
                        size: 12,
                        weight: '500'
                    }
                }
            },
            title: {
                display: true,
                text: title,
                color: textColor,
                font: {
                    size: 16,
                    weight: '600'
                }
            },
            tooltip: {
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                titleColor: textColor,
                bodyColor: textColor,
                borderColor: getComputedStyle(document.body).getPropertyValue('--border-primary'),
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        }
    };
    
    if (type === 'line' || type === 'bar') {
        baseOptions.scales = {
            y: {
                beginAtZero: true,
                grid: {
                    color: gridColor,
                    drawBorder: false
                },
                ticks: {
                    color: textColor
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: textColor
                }
            }
        };
    }
    
    if (type === 'radar') {
        baseOptions.scales = {
            r: {
                grid: {
                    color: gridColor
                },
                pointLabels: {
                    color: textColor
                },
                ticks: {
                    color: textColor,
                    backdropColor: 'transparent'
                }
            }
        };
    }
    
    return baseOptions;
}

function generateColors(count) {
    const colors = [
        getComputedStyle(document.body).getPropertyValue('--accent-primary'),
        getComputedStyle(document.body).getPropertyValue('--accent-secondary'),
        getComputedStyle(document.body).getPropertyValue('--accent-success'),
        getComputedStyle(document.body).getPropertyValue('--accent-warning'),
        getComputedStyle(document.body).getPropertyValue('--accent-danger')
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}

function generateGradientColors(count, type = 'default') {
    const gradients = {
        default: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
        ],
        region: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(239, 68, 68, 0.8)'
        ]
    };
    
    const palette = gradients[type] || gradients.default;
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(palette[i % palette.length]);
    }
    return result;
}

function updateChartsTheme() {
    // Update all existing charts with new theme colors
    Object.values(charts).forEach(chart => {
        if (chart) {
            const options = getChartOptions(chart.options.plugins.title.text, chart.config.type);
            chart.options = options;
            chart.update();
        }
    });
}

// Table Functions
function populateDataTable() {
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');
    
    if (!tableHead || !tableBody || filteredData.length === 0) return;
    
    // Clear existing content
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';
    
    // Create table header
    const columns = Object.keys(filteredData[0]);
    const headerRow = document.createElement('tr');
    
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => sortTable(column));
        headerRow.appendChild(th);
    });
    
    tableHead.appendChild(headerRow);
    
    // Create table body (paginated)
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    pageData.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = row[column] || '';
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
    
    updatePagination();
}

function sortTable(column) {
    filteredData.sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];
        
        if (!isNaN(aVal) && !isNaN(bVal)) {
            return aVal - bVal;
        }
        
        return String(aVal).localeCompare(String(bVal));
    });
    
    currentPage = 1;
    populateDataTable();
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    pagination.innerHTML = '';
    
    // Previous button
    const prevBtn = createPaginationButton('Previous', currentPage > 1, () => {
        if (currentPage > 1) {
            currentPage--;
            populateDataTable();
        }
    });
    pagination.appendChild(prevBtn);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = createPaginationButton(i, true, () => {
            currentPage = i;
            populateDataTable();
        });
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pagination.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = createPaginationButton('Next', currentPage < totalPages, () => {
        if (currentPage < totalPages) {
            currentPage++;
            populateDataTable();
        }
    });
    pagination.appendChild(nextBtn);
}

function createPaginationButton(text, enabled, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.disabled = !enabled;
    button.addEventListener('click', onClick);
    return button;
}

// Filter Functions
function handleFilter() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    
    filteredData = uploadedData.filter(row => {
        const matchesSearch = !searchTerm || Object.values(row).some(value => 
            String(value).toLowerCase().includes(searchTerm)
        );
        const matchesCategory = !categoryFilter || 
            row.category === categoryFilter || 
            row.Category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    currentPage = 1;
    populateDataTable();
    generateAllCharts();
}

function handleTableSearch() {
    const searchTerm = document.getElementById('tableSearch')?.value.toLowerCase() || '';
    
    if (!searchTerm) {
        filteredData = [...uploadedData];
    } else {
        filteredData = uploadedData.filter(row => {
            return Object.values(row).some(value => 
                String(value).toLowerCase().includes(searchTerm)
            );
        });
    }
    
    currentPage = 1;
    populateDataTable();
}

function refreshData() {
    // Add refresh animation
    const refreshBtn = document.getElementById('refreshBtn');
    const icon = refreshBtn.querySelector('i');
    icon.style.animation = 'spin 1s linear';
    
    setTimeout(() => {
        icon.style.animation = '';
        populateDataTable();
        generateAllCharts();
        updateTopProducts();
    }, 1000);
}

// Top Products
function updateTopProducts() {
    const topProductsList = document.getElementById('topProductsList');
    if (!topProductsList || filteredData.length === 0) return;
    
    // Calculate top products
    const productData = {};
    
    filteredData.forEach(row => {
        const product = row.product || row.Product || row.name || row.Name || 'Unknown';
        const value = parseFloat(row.sales || row.Sales || row.revenue || row.Revenue || 0);
        
        productData[product] = (productData[product] || 0) + value;
    });
    
    // Sort and get top 5
    const topProducts = Object.entries(productData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Clear and populate list
    topProductsList.innerHTML = '';
    
    topProducts.forEach(([product, value], index) => {
        const item = document.createElement('div');
        item.className = 'product-item';
        item.innerHTML = `
            <span class="product-name">
                <span style="margin-right: 0.5rem;">${index + 1}</span>
                ${product}
            </span>
            <span class="product-value">$${formatNumber(value)}</span>
        `;
        topProductsList.appendChild(item);
    });
}

// Export Functions
function exportToCSV() {
    if (filteredData.length === 0) {
        alert('No data to export');
        return;
    }
    
    const columns = Object.keys(filteredData[0]);
    const csvContent = [
        columns.join(','),
        ...filteredData.map(row => 
            columns.map(col => `"${row[col] || ''}"`).join(',')
        )
    ].join('\n');
    
    downloadFile(csvContent, 'data-export.csv', 'text/csv');
}

function exportToExcel() {
    // For Excel export, we would need a library like SheetJS
    // For now, export as CSV
    exportToCSV();
}

function exportCharts() {
    // Export each chart as an image
    Object.entries(charts).forEach(([name, chart]) => {
        if (chart) {
            const url = chart.toBase64Image();
            const link = document.createElement('a');
            link.download = `${name}-chart.png`;
            link.href = url;
            link.click();
        }
    });
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Chart Actions
function handleChartAction(event) {
    const chartType = event.currentTarget.dataset.chart;
    const chart = charts[chartType];
    
    if (chart) {
        // Toggle fullscreen or expand chart
        const chartContainer = event.currentTarget.closest('.chart-card');
        chartContainer.classList.toggle('expanded');
        
        // Resize chart after animation
        setTimeout(() => {
            chart.resize();
        }, 300);
    }
}

// Sample Data Loading
function loadSampleData() {
    // Load sample data for demonstration
    const sampleData = [
        { product: 'Laptop', category: 'Electronics', sales: 1500, region: 'North', date: '2024-01-15' },
        { product: 'Phone', category: 'Electronics', sales: 800, region: 'South', date: '2024-01-16' },
        { product: 'Tablet', category: 'Electronics', sales: 600, region: 'East', date: '2024-01-17' },
        { product: 'Headphones', category: 'Accessories', sales: 200, region: 'West', date: '2024-01-18' },
        { product: 'Keyboard', category: 'Accessories', sales: 150, region: 'North', date: '2024-01-19' },
        { product: 'Mouse', category: 'Accessories', sales: 100, region: 'South', date: '2024-01-20' },
        { product: 'Monitor', category: 'Electronics', sales: 300, region: 'East', date: '2024-01-21' },
        { product: 'Desk Chair', category: 'Furniture', sales: 250, region: 'West', date: '2024-01-22' }
    ];
    
    // Set as uploaded data for demonstration
    uploadedData = sampleData;
    filteredData = [...uploadedData];
    
    // Generate initial charts
    generateAllCharts();
    populateDataTable();
    updateTopProducts();
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === projectInfoModal) {
        closeProjectInfo();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeProjectInfo();
        closeSidebar();
    }
    
    // Ctrl/Cmd + K for search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        document.getElementById('searchInput')?.focus();
    }
});
