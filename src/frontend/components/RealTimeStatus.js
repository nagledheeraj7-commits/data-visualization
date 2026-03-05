/**
 * Real-time Status Component
 * Handles real-time data updates and status display
 */
class RealTimeStatus {
    constructor() {
        this.statusIndicator = document.querySelector('.status-indicator');
        this.statusText = document.querySelector('.status-text');
        this.updateCount = document.getElementById('update-count');
        this.toggleBtn = document.getElementById('toggle-real-time');
        
        this.updateCounter = 0;
        this.isRealTimeActive = true;
        this.realTimeInterval = null;
        
        this.init();
    }

    init() {
        this.setupToggle();
        this.startRealTimeUpdates();
    }

    setupToggle() {
        this.toggleBtn.addEventListener('click', () => {
            this.toggleRealTime();
        });
    }

    startRealTimeUpdates() {
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }
        
        this.realTimeInterval = setInterval(() => {
            if (this.isRealTimeActive) {
                this.simulateRealTimeUpdate();
            }
        }, 5000); // Update every 5 seconds
    }

    simulateRealTimeUpdate() {
        // Dispatch custom event to trigger data update
        window.dispatchEvent(new CustomEvent('realTimeUpdate', {
            detail: { updateCount: this.updateCounter }
        }));
        
        this.updateCounter++;
        this.updateCount.textContent = this.updateCounter;
        
        // Show subtle notification every 5 updates
        if (this.updateCounter % 5 === 0) {
            this.showNotification('Live data update detected', 'success');
        }
    }

    toggleRealTime() {
        this.isRealTimeActive = !this.isRealTimeActive;
        
        if (this.isRealTimeActive) {
            this.toggleBtn.textContent = 'Pause';
            this.statusIndicator.classList.remove('paused');
            this.showNotification('Real-time updates resumed', 'success');
        } else {
            this.toggleBtn.textContent = 'Resume';
            this.statusIndicator.classList.add('paused');
            this.showNotification('Real-time updates paused', 'warning');
        }
    }

    showNotification(message, type) {
        // Dispatch custom event for notification display
        window.dispatchEvent(new CustomEvent('showNotification', {
            detail: { message, type }
        }));
    }

    destroy() {
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }
    }
}

export default RealTimeStatus;
