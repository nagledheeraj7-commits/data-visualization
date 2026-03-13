/**
 * Header Component
 * Handles the main dashboard header with title, subtitle, and controls
 */
class Header {
    constructor() {
        this.container = document.querySelector('.header-content');
        this.darkModeToggle = document.getElementById('dark-mode-toggle');
        this.exportBtn = document.getElementById('export-csv');
        this.themeIcon = document.querySelector('.theme-icon');
        
        this.init();
    }

    init() {
        this.setupDarkMode();
        this.setupExport();
    }

    setupDarkMode() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            this.themeIcon.textContent = '☀️';
        }

        this.darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            this.themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        });
    }

    setupExport() {
        this.exportBtn.addEventListener('click', () => {
            this.exportToCSV();
        });
    }

    exportToCSV() {
        // Import the export functionality from utils
        import('../utils/export.js').then(module => {
            module.exportToCSV();
        });
    }
}

export default Header;
