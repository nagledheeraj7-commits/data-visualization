/**
 * Notification Service
 * Handles displaying validation messages and notifications
 */

/**
 * Show validation message
 * @param {string} message - The message to display
 * @param {string} type - Type of message (success, warning, error)
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
export function showValidationMessage(message, type = 'success', duration = 5000) {
    const validationContainer = document.getElementById('validation-messages');
    if (!validationContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `validation-message ${type} fade-in`;
    messageDiv.textContent = message;
    
    validationContainer.appendChild(messageDiv);
    
    // Auto-remove message after specified duration
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, duration);
}

/**
 * Initialize notification service
 */
export function initNotificationService() {
    // Listen for custom notification events
    window.addEventListener('showNotification', (event) => {
        const { message, type } = event.detail;
        showValidationMessage(message, type);
    });
    
    // Listen for refresh events
    window.addEventListener('refreshData', () => {
        showValidationMessage('Refreshing data...', 'success');
    });
    
    // Listen for category drill-down events
    window.addEventListener('categoryDrillDown', (event) => {
        const { category } = event.detail;
        showValidationMessage(`Showing data for ${category}`, 'success');
    });
}

/**
 * Clear all notifications
 */
export function clearNotifications() {
    const validationContainer = document.getElementById('validation-messages');
    if (validationContainer) {
        validationContainer.innerHTML = '';
    }
}

export default {
    showValidationMessage,
    initNotificationService,
    clearNotifications
};
