/**
 * Stats Cards Component
 * Handles the display and animation of summary statistics
 */
class StatsCards {
    constructor() {
        this.cards = {
            totalRecords: document.getElementById('total-records'),
            totalSales: document.getElementById('total-sales'),
            averageSales: document.getElementById('average-sales'),
            totalQuantity: document.getElementById('total-quantity')
        };
    }

    updateStats(data) {
        const validData = data.filter(record => record.isValid);
        const totalRecords = validData.length;
        const totalSales = validData.reduce((sum, record) => sum + parseFloat(record.sales), 0);
        const averageSales = totalRecords > 0 ? totalSales / totalRecords : 0;
        const totalQuantity = validData.reduce((sum, record) => sum + parseInt(record.quantity), 0);

        // Animate value updates
        this.animateValue('total-records', 0, totalRecords, 1000);
        this.animateValue('total-sales', 0, totalSales, 1000, '$');
        this.animateValue('average-sales', 0, averageSales, 1000, '$');
        this.animateValue('total-quantity', 0, totalQuantity, 1000);
    }

    animateValue(elementId, start, end, duration, prefix = '') {
        const element = this.cards[elementId];
        if (!element) return;

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
}

export default StatsCards;
