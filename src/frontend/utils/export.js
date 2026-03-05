/**
 * Export Utility
 * Handles CSV export functionality
 */

/**
 * Export data to CSV format
 * @param {Array} data - The data to export
 * @param {string} filename - The filename for the exported file
 */
export function exportToCSV(data = null, filename = null) {
    // Get data from global scope if not provided
    if (!data) {
        data = window.salesData || [];
    }
    
    // Filter valid data
    const validData = data.filter(record => record.isValid);
    
    // Create CSV content
    const headers = ['ID', 'Product', 'Category', 'Sales', 'Quantity', 'Date', 'Region', 'Salesperson'];
    const csvContent = [
        headers.join(','),
        ...validData.map(record => [
            record.id,
            `"${record.product}"`,
            record.category,
            record.sales,
            record.quantity,
            record.date,
            record.region,
            `"${record.salesperson}"`
        ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `sales_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Show success notification
    window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: 'Data exported successfully!', type: 'success' }
    }));
}

/**
 * Export filtered data based on current filters
 */
export function exportFilteredData() {
    const tableRows = document.querySelectorAll('#table-body tr:not([style*="display: none"])');
    const filteredData = [];
    
    tableRows.forEach(row => {
        filteredData.push({
            id: row.cells[0].textContent,
            product: row.cells[1].textContent,
            category: row.cells[2].textContent,
            sales: row.cells[3].textContent.replace('$', '').replace(',', ''),
            quantity: row.cells[4].textContent,
            date: row.cells[5].textContent,
            region: row.cells[6].textContent,
            salesperson: row.cells[7].textContent,
            isValid: true
        });
    });
    
    exportToCSV(filteredData, `filtered_sales_data_${new Date().toISOString().split('T')[0]}.csv`);
}

export default {
    exportToCSV,
    exportFilteredData
};
