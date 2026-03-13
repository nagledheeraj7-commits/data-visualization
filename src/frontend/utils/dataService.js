/**
 * Data Service
 * Handles data fetching, validation, and processing
 */

/**
 * Load data from API or local source
 * @returns {Promise<Array>} The sales data
 */
export async function loadData() {
    try {
        // Try to load from API first
        const response = await fetch('/api/sales');
        if (response.ok) {
            const data = await response.json();
            return validateAndProcessData(data);
        }
    } catch (error) {
        console.warn('API not available, falling back to local data');
    }
    
    // Fallback to local data
    try {
        const response = await fetch('/data/sales.json');
        const data = await response.json();
        return validateAndProcessData(data.salesData || data);
    } catch (error) {
        console.error('Error loading data:', error);
        throw new Error('Failed to load data from any source');
    }
}

/**
 * Validate and process data records
 * @param {Array} data - Raw data to validate
 * @returns {Array} Processed data with validation status
 */
export function validateAndProcessData(data) {
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
        window.dispatchEvent(new CustomEvent('showNotification', {
            detail: { 
                message: `Found ${validationErrors.length} validation issues`, 
                type: 'warning' 
            }
        }));
        
        validationErrors.forEach(error => {
            console.warn(error);
        });
    }
    
    return processedData;
}

/**
 * Validate date string
 * @param {string} dateString - Date string to validate
 * @returns {boolean} Whether the date is valid
 */
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

/**
 * Calculate summary statistics
 * @param {Array} data - Processed data
 * @returns {Object} Summary statistics
 */
export function calculateStatistics(data) {
    const validData = data.filter(record => record.isValid);
    const totalRecords = validData.length;
    const totalSales = validData.reduce((sum, record) => sum + parseFloat(record.sales), 0);
    const averageSales = totalRecords > 0 ? totalSales / totalRecords : 0;
    const totalQuantity = validData.reduce((sum, record) => sum + parseInt(record.quantity), 0);
    
    return {
        totalRecords,
        totalSales,
        averageSales,
        totalQuantity
    };
}

/**
 * Simulate real-time data update
 * @param {Array} data - Current data
 * @returns {Array} Updated data
 */
export function simulateRealTimeUpdate(data) {
    const updatedData = [...data];
    const randomIndex = Math.floor(Math.random() * updatedData.length);
    const randomRecord = updatedData[randomIndex];
    
    // Randomly adjust sales value
    const adjustment = (Math.random() - 0.5) * 100; // Random adjustment between -50 and +50
    randomRecord.sales = Math.max(10, parseFloat(randomRecord.sales) + adjustment);
    
    return updatedData;
}

export default {
    loadData,
    validateAndProcessData,
    calculateStatistics,
    simulateRealTimeUpdate
};
