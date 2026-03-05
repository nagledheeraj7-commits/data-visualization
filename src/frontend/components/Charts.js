/**
 * Charts Component
 * Handles the creation and management of data visualization charts
 */
class Charts {
    constructor() {
        this.barChart = null;
        this.lineChart = null;
        this.pieChart = null;
        
        this.init();
    }

    init() {
        this.setupChartInteractions();
    }

    createCharts(data) {
        const validData = data.filter(record => record.isValid);
        const categoryData = this.aggregateByCategory(validData);
        const trendData = this.aggregateByDate(validData);
        
        this.createBarChart(categoryData);
        this.createLineChart(trendData);
        this.createPieChart(categoryData);
    }

    updateCharts(data) {
        const validData = data.filter(record => record.isValid);
        const categoryData = this.aggregateByCategory(validData);
        const trendData = this.aggregateByDate(validData);
        
        this.updateBarChart(categoryData);
        this.updateLineChart(trendData);
        this.updatePieChart(categoryData);
    }

    aggregateByCategory(data) {
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

    aggregateByDate(data) {
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

    createBarChart(categoryData) {
        const ctx = document.getElementById('barChart').getContext('2d');
        
        const labels = Object.keys(categoryData);
        const data = labels.map(category => categoryData[category].totalSales);
        
        this.barChart = new Chart(ctx, {
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

    createLineChart(dateData) {
        const ctx = document.getElementById('lineChart').getContext('2d');
        
        const labels = Object.keys(dateData);
        const data = labels.map(date => dateData[date]);
        
        this.lineChart = new Chart(ctx, {
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

    createPieChart(categoryData) {
        const ctx = document.getElementById('pieChart').getContext('2d');
        
        const labels = Object.keys(categoryData);
        const data = labels.map(category => categoryData[category].totalSales);
        
        this.pieChart = new Chart(ctx, {
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

    updateBarChart(categoryData) {
        if (this.barChart) {
            const labels = Object.keys(categoryData);
            const data = labels.map(category => categoryData[category].totalSales);
            
            this.barChart.data.labels = labels;
            this.barChart.data.datasets[0].data = data;
            this.barChart.update();
        }
    }

    updateLineChart(dateData) {
        if (this.lineChart) {
            const labels = Object.keys(dateData);
            const data = labels.map(date => dateData[date]);
            
            this.lineChart.data.labels = labels;
            this.lineChart.data.datasets[0].data = data;
            this.lineChart.update();
        }
    }

    updatePieChart(categoryData) {
        if (this.pieChart) {
            const labels = Object.keys(categoryData);
            const data = labels.map(category => categoryData[category].totalSales);
            
            this.pieChart.data.labels = labels;
            this.pieChart.data.datasets[0].data = data;
            this.pieChart.update();
        }
    }

    setupChartInteractions() {
        // Bar chart click handler
        if (this.barChart) {
            this.barChart.options.onClick = (event, elements) => {
                if (elements.length > 0) {
                    const element = elements[0];
                    const category = this.barChart.data.labels[element.index];
                    this.drillDownToCategory(category);
                }
            };
        }
        
        // Pie chart click handler
        if (this.pieChart) {
            this.pieChart.options.onClick = (event, elements) => {
                if (elements.length > 0) {
                    const element = elements[0];
                    const category = this.pieChart.data.labels[element.index];
                    this.drillDownToCategory(category);
                }
            };
        }
    }

    drillDownToCategory(category) {
        // Dispatch custom event for category drill-down
        window.dispatchEvent(new CustomEvent('categoryDrillDown', {
            detail: { category }
        }));
    }
}

export default Charts;
