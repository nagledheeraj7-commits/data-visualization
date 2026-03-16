// Global variables
let uploadedData = [];
let charts = {};
let currentPage = 1;
const itemsPerPage = 10;
let filteredData = [];

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const uploadStatus = document.getElementById('uploadStatus');
const summarySection = document.getElementById('summarySection');
const chartsSection = document.getElementById('chartsSection');
const tableSection = document.getElementById('tableSection');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // File upload events
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Chart type buttons
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
        btn.addEventListener('click', handleChartTypeChange);
    });
    
    // Generate charts button
    document.getElementById('generateCharts').addEventListener('click', generateCharts);
    
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Export functionality
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        uploadFile(file);
    }
}

// Handle drag over
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

// Handle file drop
function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

// Upload file to backend
async function uploadFile(file) {
    // Validate file
    if (!validateFile(file)) {
        return;
    }
    
    // Show loading
    showLoading();
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Success
            showUploadStatus('success', `✅ ${result.message}`);
            uploadedData = result.data;
            filteredData = [...uploadedData];
            
            // Update UI
            updateDataSummary(result);
            populateColumnSelectors(result.columns);
            showSections();
            
            // Auto-generate charts if possible
            if (result.columns.length >= 2) {
                autoSelectColumns(result.columns);
            }
        } else {
            // Error
            showUploadStatus('error', `❌ ${result.message}`);
        }
    } catch (error) {
        console.error('Upload error:', error);
        showUploadStatus('error', '❌ Failed to upload file. Please try again.');
    } finally {
        hideLoading();
        // Reset file input
        fileInput.value = '';
    }
}

// Validate file
function validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
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

// Show upload status
function showUploadStatus(type, message) {
    uploadStatus.style.display = 'flex';
    uploadStatus.className = `upload-status ${type}`;
    
    const statusIcon = uploadStatus.querySelector('.status-icon');
    const statusMessage = uploadStatus.querySelector('.status-message');
    
    statusIcon.textContent = type === 'success' ? '✅' : '❌';
    statusMessage.textContent = message;
    
    // Hide after 5 seconds
    setTimeout(() => {
        uploadStatus.style.display = 'none';
    }, 5000);
}

// Update data summary
function updateDataSummary(result) {
    document.getElementById('totalRecords').textContent = result.rowCount;
    document.getElementById('totalColumns').textContent = result.columns.length;
    document.getElementById('fileName').textContent = result.filename;
}

// Populate column selectors
function populateColumnSelectors(columns) {
    const xAxisSelect = document.getElementById('xAxis');
    const yAxisSelect = document.getElementById('yAxis');
    
    // Clear existing options
    xAxisSelect.innerHTML = '<option value="">Select column...</option>';
    yAxisSelect.innerHTML = '<option value="">Select column...</option>';
    
    // Add column options
    columns.forEach(column => {
        const option1 = new Option(column, column);
        const option2 = new Option(column, column);
        xAxisSelect.add(option1);
        yAxisSelect.add(option2);
    });
}

// Auto-select columns for charts
function autoSelectColumns(columns) {
    const xAxisSelect = document.getElementById('xAxis');
    const yAxisSelect = document.getElementById('yAxis');
    
    // Try to select first non-numeric column for X-axis
    const textColumns = columns.filter(col => isTextColumn(col));
    const numericColumns = columns.filter(col => isNumericColumn(col));
    
    if (textColumns.length > 0 && numericColumns.length > 0) {
        xAxisSelect.value = textColumns[0];
        yAxisSelect.value = numericColumns[0];
    } else if (columns.length >= 2) {
        xAxisSelect.value = columns[0];
        yAxisSelect.value = columns[1];
    }
}

// Check if column contains text data
function isTextColumn(column) {
    const sample = uploadedData.slice(0, 10);
    const nonEmptyValues = sample.filter(row => row[column] && row[column].trim());
    
    if (nonEmptyValues.length === 0) return true;
    
    return nonEmptyValues.some(val => isNaN(parseFloat(val[column])));
}

// Check if column contains numeric data
function isNumericColumn(column) {
    const sample = uploadedData.slice(0, 10);
    const nonEmptyValues = sample.filter(row => row[column] && row[column].trim());
    
    if (nonEmptyValues.length === 0) return false;
    
    return nonEmptyValues.every(val => !isNaN(parseFloat(val[column])));
}

// Show sections after upload
function showSections() {
    summarySection.style.display = 'block';
    chartsSection.style.display = 'block';
    tableSection.style.display = 'block';
}

// Generate charts
function generateCharts() {
    const xAxis = document.getElementById('xAxis').value;
    const yAxis = document.getElementById('yAxis').value;
    
    if (!xAxis || !yAxis) {
        alert('Please select both X and Y axis columns');
        return;
    }
    
    // Prepare data for charts
    const chartData = prepareChartData(xAxis, yAxis);
    
    // Generate all chart types
    createBarChart(chartData, xAxis, yAxis);
    createLineChart(chartData, xAxis, yAxis);
    createPieChart(chartData, xAxis, yAxis);
    
    // Show first chart by default
    showChartType('bar');
    
    // Populate data table
    populateDataTable();
}

// Prepare data for charts
function prepareChartData(xAxis, yAxis) {
    const groupedData = {};
    
    filteredData.forEach(row => {
        const xValue = row[xAxis] || 'Unknown';
        const yValue = parseFloat(row[yAxis]) || 0;
        
        if (groupedData[xValue]) {
            groupedData[xValue] += yValue;
        } else {
            groupedData[xValue] = yValue;
        }
    });
    
    return {
        labels: Object.keys(groupedData),
        data: Object.values(groupedData)
    };
}

// Create bar chart
function createBarChart(chartData, xAxis, yAxis) {
    const ctx = document.getElementById('barChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts.bar) {
        charts.bar.destroy();
    }
    
    charts.bar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: yAxis,
                data: chartData.data,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: `${yAxis} by ${xAxis}`
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: yAxis
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: xAxis
                    }
                }
            }
        }
    });
}

// Create line chart
function createLineChart(chartData, xAxis, yAxis) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts.line) {
        charts.line.destroy();
    }
    
    charts.line = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: yAxis,
                data: chartData.data,
                borderColor: 'rgba(118, 75, 162, 1)',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: `${yAxis} by ${xAxis}`
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: yAxis
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: xAxis
                    }
                }
            }
        }
    });
}

// Create pie chart
function createPieChart(chartData, xAxis, yAxis) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts.pie) {
        charts.pie.destroy();
    }
    
    // Generate colors for pie chart
    const colors = generateColors(chartData.labels.length);
    
    charts.pie = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right'
                },
                title: {
                    display: true,
                    text: `${yAxis} Distribution by ${xAxis}`
                }
            }
        }
    });
}

// Generate colors for charts
function generateColors(count) {
    const colors = [
        'rgba(102, 126, 234, 0.8)',
        'rgba(118, 75, 162, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}

// Handle chart type change
function handleChartTypeChange(event) {
    const chartType = event.target.dataset.chart;
    showChartType(chartType);
}

// Show specific chart type
function showChartType(chartType) {
    // Update button states
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-chart="${chartType}"]`).classList.add('active');
    
    // Show/hide chart containers
    document.getElementById('barChartContainer').style.display = chartType === 'bar' ? 'block' : 'none';
    document.getElementById('lineChartContainer').style.display = chartType === 'line' ? 'block' : 'none';
    document.getElementById('pieChartContainer').style.display = chartType === 'pie' ? 'block' : 'none';
}

// Populate data table
function populateDataTable() {
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');
    
    // Clear existing content
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) return;
    
    // Create table header
    const columns = Object.keys(filteredData[0]);
    const headerRow = document.createElement('tr');
    
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
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
    
    // Update pagination
    updatePagination();
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    if (searchTerm === '') {
        filteredData = [...uploadedData];
    } else {
        filteredData = uploadedData.filter(row => {
            return Object.values(row).some(value => 
                value && value.toString().toLowerCase().includes(searchTerm)
            );
        });
    }
    
    currentPage = 1;
    populateDataTable();
}

// Update pagination
function updatePagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    pagination.innerHTML = '';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            populateDataTable();
        }
    };
    pagination.appendChild(prevBtn);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'active' : '';
        pageBtn.onclick = () => {
            currentPage = i;
            populateDataTable();
        };
        pagination.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            populateDataTable();
        }
    };
    pagination.appendChild(nextBtn);
}

// Export to CSV
function exportToCSV() {
    if (filteredData.length === 0) {
        alert('No data to export');
        return;
    }
    
    // Convert data to CSV
    const columns = Object.keys(filteredData[0]);
    const csvContent = [
        columns.join(','),
        ...filteredData.map(row => 
            columns.map(col => `"${row[col] || ''}"`).join(',')
        )
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Show loading overlay
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.style.display = 'none';
}
