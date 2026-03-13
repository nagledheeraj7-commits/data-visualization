/**
 * Data Table Component
 * Handles the display, filtering, and sorting of the data table
 */
class DataTable {
    constructor() {
        this.tableBody = document.getElementById('table-body');
        this.searchInput = document.getElementById('search-input');
        this.categoryFilter = document.getElementById('category-filter');
        this.dateFrom = document.getElementById('date-from');
        this.dateTo = document.getElementById('date-to');
        this.priceMin = document.getElementById('price-min');
        this.priceMax = document.getElementById('price-max');
        this.refreshBtn = document.getElementById('refresh-btn');
        
        this.currentData = [];
        this.currentSortColumn = null;
        this.sortDirection = 'asc';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSorting();
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', () => this.filterTable());
        this.categoryFilter.addEventListener('change', () => this.filterTable());
        this.dateFrom.addEventListener('change', () => this.filterTable());
        this.dateTo.addEventListener('change', () => this.filterTable());
        this.priceMin.addEventListener('input', () => this.filterTable());
        this.priceMax.addEventListener('input', () => this.filterTable());
        this.refreshBtn.addEventListener('click', () => this.refresh());
    }

    setupSorting() {
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                this.sortTable(header.dataset.column);
            });
        });
    }

    populateTable(data) {
        this.currentData = data;
        this.tableBody.innerHTML = '';
        
        // Populate category filter
        this.populateCategoryFilter(data);
        
        // Create table rows
        data.forEach(record => {
            const row = this.createTableRow(record);
            this.tableBody.appendChild(row);
        });
    }

    populateCategoryFilter(data) {
        const categories = [...new Set(data.map(record => record.category))];
        this.categoryFilter.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(category => {
            this.categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
        });
    }

    createTableRow(record) {
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

    filterTable() {
        const searchInput = this.searchInput.value.toLowerCase();
        const categoryFilter = this.categoryFilter.value;
        const dateFrom = this.dateFrom.value;
        const dateTo = this.dateTo.value;
        const priceMin = parseFloat(this.priceMin.value) || 0;
        const priceMax = parseFloat(this.priceMax.value) || Infinity;
        const tableRows = this.tableBody.querySelectorAll('tr');
        
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

    sortTable(column) {
        // Toggle sort direction
        if (this.currentSortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSortColumn = column;
            this.sortDirection = 'asc';
        }
        
        // Update header classes
        document.querySelectorAll('.sortable').forEach(header => {
            header.classList.remove('sorted-asc', 'sorted-desc');
        });
        const currentHeader = document.querySelector(`[data-column="${column}"]`);
        currentHeader.classList.add(this.sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
        
        // Sort and re-render
        const sortedData = [...this.currentData].sort((a, b) => {
            let aValue = a[column];
            let bValue = b[column];
            
            // Handle numeric columns
            if (column === 'id' || column === 'sales' || column === 'quantity') {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            }
            
            // Handle date column
            if (column === 'date') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            
            if (this.sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        this.populateTable(sortedData);
    }

    refresh() {
        // Dispatch custom event to trigger data refresh
        window.dispatchEvent(new CustomEvent('refreshData'));
    }
}

export default DataTable;
