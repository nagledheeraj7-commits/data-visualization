document.addEventListener("DOMContentLoaded", function() {

    if (localStorage.getItem("loggedIn") === "true") {

        const loginModal = document.getElementById("login-modal");

        if (loginModal) {
            loginModal.style.display = "none";
        }

    }

});
// Global variables to store data and chart instances
let salesData = [];
let barChart = null;
let lineChart = null;
let pieChart = null;
let currentSortColumn = null;
let sortDirection = 'asc';
let realTimeInterval = null;
let updateCount = 0;
let isRealTimeActive = true;

// User and audit trail variables
let currentUser = null;
let auditTrail = [];
let isLoggedIn = false;
let users = []; // Store user database

// Import functionality
function setupImportExport() {
    const importBtn = document.getElementById('import-btn');
    const exportBtn = document.getElementById('export-btn');
    const fileInput = document.getElementById('file-input');
    
    if (importBtn) {
        importBtn.addEventListener('click', () => fileInput.click());
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileImport);
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
}

// Manual data entry functionality
function setupManualEntry() {
    const manualEntryBtn = document.getElementById('manual-entry-btn');
    const modal = document.getElementById('manual-entry-modal');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const form = document.getElementById('manual-entry-form');
    
    if (manualEntryBtn) {
        manualEntryBtn.addEventListener('click', () => {
            openManualEntryModal();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeManualEntryModal();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeManualEntryModal();
        });
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeManualEntryModal();
            }
        });
    }
    
    // Handle form submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleManualEntrySubmit();
        });
    }
}

// Open manual entry modal
function openManualEntryModal() {
    const modal = document.getElementById('manual-entry-modal');
    const dateInput = document.getElementById('manual-date');
    
    if (modal) {
        modal.classList.add('show');
        
        // Set default date to today
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = document.getElementById('manual-product');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
}

// Close manual entry modal
function closeManualEntryModal() {
    const modal = document.getElementById('manual-entry-modal');
    const form = document.getElementById('manual-entry-form');
    
    if (modal) {
        modal.classList.remove('show');
        
        // Reset form
        if (form) {
            form.reset();
            
            // Clear any validation states
            const inputs = form.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.classList.remove('invalid');
            });
        }
    }
}

// Handle manual entry form submission
function handleManualEntrySubmit() {
    // Check if user has permission
    if (!hasPermission('MANUAL_ENTRY')) {
        showValidationMessage('❌ Permission denied: Administrator access required for manual data entry', 'error');
        return;
    }
    
    const form = document.getElementById('manual-entry-form');
    const formData = new FormData(form);
    
    // Create new record object
    const newRecord = {
        id: salesData.length > 0 ? Math.max(...salesData.map(r => r.id || 0)) + 1 : 1,
        product: formData.get('product').trim(),
        category: formData.get('category').trim(),
        sales: parseFloat(formData.get('sales')),
        quantity: parseInt(formData.get('quantity')),
        date: formData.get('date'),
        region: formData.get('region').trim() || 'Unknown',
        salesperson: formData.get('salesperson').trim() || 'Unassigned',
        addedBy: currentUser.id,
        addedByName: currentUser.name,
        addedAt: new Date()
    };
    
    // Validate the new record
    const validationErrors = validateManualEntry(newRecord);
    
    if (validationErrors.length > 0) {
        showValidationMessage(`Please fix the following errors: ${validationErrors.join(', ')}`, 'error');
        return;
    }
    
    try {
        // Add to sales data
        salesData.push(newRecord);
        
        // Add to audit trail
        addAuditEntry('MANUAL_ENTRY', `Added record: ${newRecord.product} (${newRecord.category}) - ₹${newRecord.sales.toLocaleString('en-IN')} by ${currentUser.name} (${currentUser.role})`);
        
        // Update dashboard
        updateStatistics(salesData);
        renderCharts(salesData);
        populateDataTable(salesData);
        updateCategoryFilter(salesData);
        
        // Show success message
        showValidationMessage(`✅ Successfully added: ${newRecord.product} (₹${newRecord.sales.toLocaleString('en-IN')})`, 'success');
        
        // Close modal
        closeManualEntryModal();
        
        console.log('New record added:', newRecord);
        
    } catch (error) {
        console.error('Error adding manual entry:', error);
        showValidationMessage('Failed to add record. Please try again.', 'error');
    }
}

// Validate manual entry data
function validateManualEntry(record) {
    const errors = [];
    
    // Check required fields
    if (!record.product || record.product === '') {
        errors.push('Product name is required');
    }
    
    if (!record.category || record.category === '') {
        errors.push('Category is required');
    }
    
    if (isNaN(record.sales) || record.sales <= 0) {
        errors.push('Sales amount must be a positive number');
    }
    
    if (isNaN(record.quantity) || record.quantity <= 0) {
        errors.push('Quantity must be a positive number');
    }
    
    if (!record.date || record.date === '') {
        errors.push('Date is required');
    } else if (!isValidDate(record.date)) {
        errors.push('Invalid date format');
    }
    
    return errors;
}

// Login functionality
function setupLogin() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resetForm = document.getElementById('reset-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Setup tab switching
    setupTabSwitching();
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (resetForm) {
        resetForm.addEventListener('submit', handlePasswordReset);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Load users from storage
    loadUsers();
    
    // Check if user is already logged in
    checkExistingLogin();
}

// Tab switching functionality
function setupTabSwitching() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show target tab
    const targetContent = document.querySelector(`#${tabName}-form`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Activate corresponding button
    const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
}

function showLoginTab() {
    switchTab('login');
}

// Handle user registration
function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        id: formData.get('employeeId').trim(),
        name: formData.get('name').trim(),
        email: formData.get('email').trim(),
        password: formData.get('password'),
        role: formData.get('role'),
        createdAt: new Date(),
        isActive: true,
        emailVerified: false
    };
    
    // Validation
    const errors = validateRegistration(userData);
    if (errors.length > 0) {
        showValidationMessage(`Registration errors: ${errors.join(', ')}`, 'error');
        return;
    }
    
    // Check if user already exists
    if (users.find(u => u.id === userData.id)) {
        showValidationMessage('Employee ID already exists', 'error');
        return;
    }
    
    if (users.find(u => u.email === userData.email)) {
        showValidationMessage('Email already registered', 'error');
        return;
    }
    
    // Add user
    users.push(userData);
    saveUsers();
    
    // Add to audit trail
    addAuditEntry('USER_REGISTERED', `New user registered: ${userData.name} (${userData.id}) - Role: ${userData.role}`);
    
    showValidationMessage(`✅ Registration successful! Please check your email for verification.`, 'success');
    
    // Send verification email (demo)
    sendVerificationEmail(userData);
    
    // Switch to login tab
    setTimeout(() => {
        showLoginTab();
        e.target.reset();
    }, 2000);
}

// Handle password reset
function handlePasswordReset(e) {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value.trim();
    
    const user = users.find(u => u.email === email);
    if (!user) {
        showValidationMessage('Email not found in our system', 'error');
        return;
    }
    
    // Generate reset code
    const resetCode = generateResetCode();
    user.resetCode = resetCode;
    user.resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    saveUsers();
    
    // Add to audit trail
    addAuditEntry('PASSWORD_RESET_REQUESTED', `Password reset requested for: ${user.name} (${user.id})`);
    
    // Send reset code (demo - show in console)
    console.log(`Password reset code for ${user.email}: ${resetCode}`);
    showValidationMessage(`📧 Reset code sent to ${email}. Check console for demo code: ${resetCode}`, 'info');
    
    // Show reset code input
    showResetCodeInput(email);
}

// Show reset code input
function showResetCodeInput(email) {
    const resetForm = document.getElementById('reset-form');
    resetForm.innerHTML = `
        <div class="form-group">
            <label for="reset-code">Verification Code *</label>
            <input type="text" id="reset-code" name="resetCode" required placeholder="Enter 6-digit code">
        </div>
        <div class="form-group">
            <label for="new-password">New Password *</label>
            <input type="password" id="new-password" name="newPassword" required placeholder="Enter new password">
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="showLoginTab()">Cancel</button>
            <button type="submit" class="btn btn-primary">Reset Password</button>
        </div>
        <div class="reset-info">
            <p><small>Enter the 6-digit code sent to ${email}</small></p>
        </div>
    `;
    
    // Update form submit handler
    resetForm.onsubmit = (e) => handlePasswordResetConfirm(e, email);
}

// Handle password reset confirmation
function handlePasswordResetConfirm(e, email) {
    e.preventDefault();
    
    const resetCode = document.getElementById('reset-code').value;
    const newPassword = document.getElementById('new-password').value;
    
    const user = users.find(u => u.email === email);
    if (!user) {
        showValidationMessage('User not found', 'error');
        return;
    }
    
    // Verify reset code
    if (user.resetCode !== resetCode) {
        showValidationMessage('Invalid verification code', 'error');
        return;
    }
    
    // Check expiry
    if (new Date() > user.resetCodeExpiry) {
        showValidationMessage('Verification code expired', 'error');
        return;
    }
    
    // Update password
    user.password = newPassword;
    delete user.resetCode;
    delete user.resetCodeExpiry;
    saveUsers();
    
    // Add to audit trail
    addAuditEntry('PASSWORD_RESET', `Password reset completed for: ${user.name} (${user.id})`);
    
    showValidationMessage('✅ Password reset successful! Please login with your new password.', 'success');
    
    // Switch to login tab
    setTimeout(() => {
        showLoginTab();
    }, 2000);
}

// Enhanced login handler
loginForm.addEventListener('submit', handleLogin);

function handleLogin(e) {
    e.preventDefault();

    const employeeId = document.getElementById('login-employee-id').value.trim();
    const password = document.getElementById('login-password').value;

    if (employeeId === "12345678" && password === "1234567878") {

        localStorage.setItem("loggedIn", "true");

        // reload page after login
        window.location.reload();

    } else {
        alert("Invalid Employee ID or Password");
    }
}
    
    // Simple validation
    if (!employeeId || !password) {
        showValidationMessage('Please enter both employee ID and password', 'error');
        return;
    }
    
    // Find user
    const user = users.find(u => u.id === employeeId);
    
    // Demo: If no users exist, allow specific admin credentials
    if (users.length === 0 && employeeId === '12345678' && password === '1234567878') {
        currentUser = {
            id: employeeId,
            name: `Administrator ${employeeId}`,
            role: 'administrator',
            email: `admin${employeeId}@company.com`,
            loginTime: new Date()
        };
        
        isLoggedIn = true;
        updateUserInfo();
        closeLoginModal();
        addAuditEntry('LOGIN', `First-time administrator ${employeeId} logged in`);
        saveUserSession();
        showValidationMessage(`✅ Welcome, Administrator! (${currentUser.role})`, 'success');
        initializeDashboard();
        return;
    }
    
    // Check user credentials
    if (!user) {
        showValidationMessage('Employee ID not found', 'error');
        return;
    }
    
    if (!user.isActive) {
        showValidationMessage('Account is deactivated', 'error');
        return;
    }
    
    if (user.password !== password) {
        showValidationMessage('Invalid password', 'error');
        return;
    }
    
    // Login successful
    currentUser = {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        loginTime: new Date()
    };
    
    isLoggedIn = true;
    updateUserInfo();
    closeLoginModal();
    addAuditEntry('LOGIN', `User ${user.id} logged in as ${user.role}`);
    saveUserSession();
    showValidationMessage(`✅ Welcome, ${currentUser.name}! (${user.role})`, 'success');
    initializeDashboard();
}

// Validation functions
function validateRegistration(userData) {
    const errors = [];
    
    if (!userData.id || userData.id.length < 3) {
        errors.push('Employee ID must be at least 3 characters');
    }
    
    if (!userData.name || userData.name.length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    
    if (!userData.email || !isValidEmail(userData.email)) {
        errors.push('Valid email is required');
    }
    
    if (!userData.password || userData.password.length < 4) {
        errors.push('Password must be at least 4 characters');
    }
    
    if (!userData.role) {
        errors.push('Role must be selected');
    }
    
    return errors;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Email functions (demo)
function sendVerificationEmail(user) {
    // In production, this would send a real email
    console.log(`Verification email sent to ${user.email}`);
    console.log(`User: ${user.name}, ID: ${user.id}, Role: ${user.role}`);
    
    // Auto-verify for demo
    setTimeout(() => {
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex].emailVerified = true;
            saveUsers();
            addAuditEntry('EMAIL_VERIFIED', `Email verified for: ${user.name} (${user.id})`);
        }
    }, 5000);
}

// User management functions
function loadUsers() {
    const saved = localStorage.getItem('users');
    if (saved) {
        try {
            users = JSON.parse(saved);
        } catch (error) {
            console.error('Error loading users:', error);
            users = [];
        }
    }
}

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Permission checking function
function hasPermission(action) {
    if (!currentUser || !isLoggedIn) {
        return false;
    }
    
    // Administrators have all permissions
    if (currentUser.role === 'administrator') {
        return true;
    }
    
    // Define employee permissions
    const employeePermissions = {
        'VIEW_DATA': true,
        'EXPORT_DATA': true,
        'SEARCH_FILTER': true,
        'VIEW_AUDIT': true
    };
    
    return employeePermissions[action] || false;
}

// Handle logout
function handleLogout() {
    if (currentUser) {
        addAuditEntry('LOGOUT', `User ${currentUser.id} logged out`);
    }
    
    currentUser = null;
    isLoggedIn = false;
    
    // Clear session
    localStorage.removeItem('userSession');
    
    // Update UI
    updateUserInfo();
    showLoginModal();
    
    showValidationMessage('Logged out successfully', 'info');
}

// Check existing login
function checkExistingLogin() {
    const savedSession = localStorage.getItem('userSession');
    if (savedSession) {
        try {
            const session = JSON.parse(savedSession);
            // Check if session is still valid (24 hours)
            const loginTime = new Date(session.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
                currentUser = session.user;
                isLoggedIn = true;
                updateUserInfo();
                closeLoginModal();
                
                // Add audit entry for session restore
                addAuditEntry('SESSION_RESTORE', `User ${currentUser.id} session restored`);
                
                // Initialize dashboard
                initializeDashboard();
                return;
            }
        } catch (error) {
            console.error('Error parsing session:', error);
        }
    }
    
    // Show login modal if no valid session
    showLoginModal();
}

// Save user session
function saveUserSession() {
    if (currentUser) {
        const session = {
            user: currentUser,
            loginTime: currentUser.loginTime
        };
        localStorage.setItem('userSession', JSON.stringify(session));
    }
}

// Update user info in UI
function updateUserInfo() {
    const userName = document.getElementById('current-user-name');
    const userId = document.getElementById('current-user-id');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (currentUser && isLoggedIn) {
        userName.textContent = `${currentUser.name} (${currentUser.role})`;
        userId.textContent = `ID: ${currentUser.id}`;
        logoutBtn.style.display = 'inline-block';
        
        // Apply role-based UI changes
        applyRoleBasedUI();
    } else {
        userName.textContent = 'Guest User';
        userId.textContent = 'Not logged in';
        logoutBtn.style.display = 'none';
    }
}

// Apply role-based UI changes
function applyRoleBasedUI() {
    if (!currentUser) return;
    
    const isAdmin = currentUser.role === 'administrator';
    
    // Show/hide admin-only features
    const adminFeatures = document.querySelectorAll('.admin-only');
    adminFeatures.forEach(feature => {
        feature.style.display = isAdmin ? 'block' : 'none';
    });
    
    // Enable/disable features based on role
    const restrictedFeatures = document.querySelectorAll('.restricted');
    restrictedFeatures.forEach(feature => {
        if (!isAdmin) {
            feature.disabled = true;
            feature.title = 'Administrator access required';
        } else {
            feature.disabled = false;
            feature.title = '';
        }
    });
}

// Show/hide login modal
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Audit trail functionality
function setupAuditTrail() {
    const clearAuditBtn = document.getElementById('clear-audit-btn');
    const exportAuditBtn = document.getElementById('export-audit-btn');
    
    if (clearAuditBtn) {
        clearAuditBtn.addEventListener('click', clearAuditTrail);
    }
    
    if (exportAuditBtn) {
        exportAuditBtn.addEventListener('click', exportAuditTrail);
    }
    
    // Load existing audit trail
    loadAuditTrail();
}

// Add audit entry
function addAuditEntry(action, details) {
    const entry = {
        timestamp: new Date(),
        user: currentUser ? currentUser.id : 'System',
        action: action,
        details: details,
        ipAddress: getClientIP()
    };
    
    auditTrail.unshift(entry); // Add to beginning
    
    // Keep only last 100 entries
    if (auditTrail.length > 100) {
        auditTrail = auditTrail.slice(0, 100);
    }
    
    // Update UI
    updateAuditTable();
    
    // Save to localStorage
    saveAuditTrail();
    
    console.log('Audit entry added:', entry);
}

// Update audit table
function updateAuditTable() {
    const tbody = document.getElementById('audit-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    auditTrail.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDateTime(entry.timestamp)}</td>
            <td>${entry.user}</td>
            <td>${entry.action}</td>
            <td>${entry.details}</td>
            <td>${entry.ipAddress}</td>
        `;
        tbody.appendChild(row);
    });
}

// Clear audit trail
function clearAuditTrail() {
    if (confirm('Are you sure you want to clear all audit history?')) {
        auditTrail = [];
        updateAuditTable();
        localStorage.removeItem('auditTrail');
        
        addAuditEntry('AUDIT_CLEARED', 'Audit trail cleared by user');
        showValidationMessage('Audit trail cleared', 'info');
    }
}

// Export audit trail
function exportAuditTrail() {
    const headers = ['Timestamp', 'User', 'Action', 'Details', 'IP Address'];
    const csvContent = [
        headers.join(','),
        ...auditTrail.map(entry => [
            formatDateTime(entry.timestamp),
            entry.user,
            entry.action,
            `"${entry.details}"`,
            entry.ipAddress
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showValidationMessage('Audit trail exported successfully', 'success');
}

// Load/save audit trail
function loadAuditTrail() {
    const saved = localStorage.getItem('auditTrail');
    if (saved) {
        try {
            auditTrail = JSON.parse(saved).map(entry => ({
                ...entry,
                timestamp: new Date(entry.timestamp)
            }));
            updateAuditTable();
        } catch (error) {
            console.error('Error loading audit trail:', error);
            auditTrail = [];
        }
    }
}

function saveAuditTrail() {
    localStorage.setItem('auditTrail', JSON.stringify(auditTrail));
}

// Utility functions
function getClientIP() {
    // In a real application, you'd get this from the server
    // For demo, return a placeholder
    return '192.168.1.100';
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Handle file import
async function handleFileImport(event) {
    // Check if user has permission
    if (!hasPermission('FILE_IMPORT')) {
        showValidationMessage('❌ Permission denied: Administrator access required for file imports', 'error');
        return;
    }
    
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('Importing file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    try {
        showValidationMessage('Processing file...', 'info');
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        console.log('File extension:', fileExtension);
        
        let importedData;
        
        if (fileExtension === 'csv') {
            importedData = await parseCSV(file);
        } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            importedData = await parseExcel(file);
        } else {
            throw new Error('Unsupported file format. Please use CSV format.');
        }
        
        console.log('Imported data count:', importedData.length);
        console.log('Sample imported data:', importedData.slice(0, 2));
        
        // Validate and merge data
        const validatedData = validateImportedData(importedData);
        console.log('Validated data count:', validatedData.length);
        
        if (validatedData.length === 0) {
            throw new Error('No valid records found in the file. Please check your data format and ensure all required fields are present.');
        }
        
        // Add user info to imported records
        const enrichedData = validatedData.map(record => ({
            ...record,
            addedBy: currentUser.id,
            addedByName: currentUser.name,
            addedAt: new Date()
        }));
        
        // Add to existing data
        const originalLength = salesData.length;
        salesData = [...salesData, ...enrichedData];
        console.log('Total data after import:', salesData.length);
        
        // Add to audit trail
        addAuditEntry('FILE_IMPORT', `Imported ${enrichedData.length} records from ${file.name} by ${currentUser.name} (${currentUser.role})`);
        
        // Update ALL dashboard components without validation filtering
        updateStatistics(salesData);
        renderCharts(salesData);
        populateDataTable(salesData);
        updateCategoryFilter(salesData);
        
        // Show success message with details
        const newRecordsCount = salesData.length - originalLength;
        showValidationMessage(
            `✅ Successfully imported ${newRecordsCount} new records! Total records: ${salesData.length}`, 
            'success'
        );
        
        // Clear file input
        event.target.value = '';
        
    } catch (error) {
        console.error('Import error:', error);
        showValidationMessage(`❌ Import failed: ${error.message}`, 'error');
        
        // Clear file input
        event.target.value = '';
    }
}

// Parse CSV file
async function parseCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                
                // Find the maximum existing ID
                const maxId = salesData.length > 0 ? Math.max(...salesData.map(record => record.id || 0)) : 0;
                
                const data = [];
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim() === '') continue;
                    
                    const values = lines[i].split(',').map(v => v.trim());
                    const record = {};
                    
                    headers.forEach((header, index) => {
                        record[header] = values[index];
                    });
                    
                    // Convert sales to number
                    if (record.sales) {
                        record.sales = parseFloat(record.sales.replace(/[^0-9.-]/g, '')) || 0;
                    }
                    
                    // Convert quantity to number
                    if (record.quantity) {
                        record.quantity = parseInt(record.quantity) || 0;
                    }
                    
                    // Generate ID if not present - continue from max existing ID
                    if (!record.id) {
                        record.id = maxId + i;
                    }
                    
                    data.push(record);
                }
                
                console.log(`Generated IDs from ${maxId + 1} to ${maxId + data.length}`);
                resolve(data);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// Parse Excel file (simplified CSV-like approach)
async function parseExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                
                // Convert Excel to CSV-like format
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheet];
                
                // Convert to JSON and then to our format
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                // Find the maximum existing ID
                const maxId = salesData.length > 0 ? Math.max(...salesData.map(record => record.id || 0)) : 0;
                
                const processedData = jsonData.map((row, index) => {
                    const record = {};
                    
                    // Map common Excel column names to our schema
                    const columnMapping = {
                        'ID': 'id',
                        'PRODUCT': 'product',
                        'Product': 'product',
                        'product name': 'product',
                        'CATEGORY': 'category',
                        'Category': 'category',
                        'SALES': 'sales',
                        'Sales': 'sales',
                        'AMOUNT': 'sales',
                        'Amount': 'sales',
                        'REVENUE': 'sales',
                        'QUANTITY': 'quantity',
                        'Quantity': 'quantity',
                        'Qty': 'quantity',
                        'DATE': 'date',
                        'Date': 'date',
                        'REGION': 'region',
                        'Region': 'region',
                        'SALESPERSON': 'salesperson',
                        'Salesperson': 'salesperson',
                        'Sales Person': 'salesperson',
                        'AGENT': 'salesperson'
                    };
                    
                    // Map columns to our schema
                    Object.keys(row).forEach(key => {
                        const normalizedKey = key.toLowerCase().trim();
                        const mappedKey = columnMapping[key] || columnMapping[normalizedKey] || key.toLowerCase();
                        
                        if (mappedKey === 'sales' || mappedKey === 'quantity') {
                            record[mappedKey] = parseFloat(row[key]) || 0;
                        } else if (mappedKey === 'id') {
                            record[mappedKey] = parseInt(row[key]) || maxId + index + 1;
                        } else {
                            record[mappedKey] = String(row[key] || '').trim();
                        }
                    });
                    
                    // Ensure required fields have defaults
                    if (!record.product) record.product = 'Unknown Product';
                    if (!record.category) record.category = 'Uncategorized';
                    if (!record.date) record.date = new Date().toISOString().split('T')[0];
                    if (!record.region) record.region = 'Unknown';
                    if (!record.salesperson) record.salesperson = 'Unassigned';
                    
                    return record;
                });
                
                console.log(`Excel parsed successfully: ${processedData.length} records`);
                resolve(processedData);
                
            } catch (error) {
                console.error('Excel parsing error:', error);
                // Fallback: try to read as CSV if Excel parsing fails
                try {
                    const text = new TextDecoder().decode(data);
                    const lines = text.split('\n');
                    const headers = lines[0].split(',').map(h => h.trim());
                    
                    const processedData = [];
                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i].trim() === '') continue;
                        
                        const values = lines[i].split(',').map(v => v.trim());
                        const record = {};
                        
                        headers.forEach((header, index) => {
                            record[header] = values[index];
                        });
                        
                        // Convert data types
                        if (record.sales) {
                            record.sales = parseFloat(record.sales) || 0;
                        }
                        if (record.quantity) {
                            record.quantity = parseInt(record.quantity) || 0;
                        }
                        if (!record.id) {
                            record.id = maxId + i;
                        }
                        
                        processedData.push(record);
                    }
                    
                    resolve(processedData);
                } catch (fallbackError) {
                    reject(new Error(`Failed to parse Excel file: "${file.name}". Please ensure it's a valid Excel file with proper headers.`));
                }
            }
        };
        
        reader.onerror = () => reject(new Error('Failed to read Excel file'));
        reader.readAsArrayBuffer(file);
    });
}

// Validate imported data (more flexible)
function validateImportedData(data) {
    const validatedData = [];
    const errors = [];
    let skippedCount = 0;
    
    console.log('Starting validation for', data.length, 'records');
    
    data.forEach((record, index) => {
        const recordErrors = [];
        let processedRecord = { ...record };
        
        // Debug log for first few records
        if (index < 3) {
            console.log(`Record ${index + 1}:`, record);
        }
        
        // Check and fix required fields
        if (!processedRecord.product || processedRecord.product.trim() === '') {
            processedRecord.product = 'Unknown Product';
        }
        
        if (!processedRecord.category || processedRecord.category.trim() === '') {
            processedRecord.category = 'Uncategorized';
        }
        
        // Fix sales data - more flexible validation
        if (!processedRecord.sales || processedRecord.sales === '') {
            processedRecord.sales = 1000; // Default sales amount
            recordErrors.push('Used default sales amount (1000)');
        } else {
            // Convert to number if it's a string
            const salesValue = parseFloat(String(processedRecord.sales).replace(/[^0-9.-]/g, ''));
            if (isNaN(salesValue) || salesValue <= 0) {
                processedRecord.sales = 1000;
                recordErrors.push('Invalid sales amount, used default (1000)');
            } else {
                processedRecord.sales = salesValue;
            }
        }
        
        // Fix quantity data - more flexible validation
        if (!processedRecord.quantity || processedRecord.quantity === '') {
            processedRecord.quantity = 1; // Default quantity
            recordErrors.push('Used default quantity (1)');
        } else {
            // Convert to number if it's a string
            const quantityValue = parseInt(String(processedRecord.quantity).replace(/[^0-9]/g, ''));
            if (isNaN(quantityValue) || quantityValue <= 0) {
                processedRecord.quantity = 1;
                recordErrors.push('Invalid quantity, used default (1)');
            } else {
                processedRecord.quantity = quantityValue;
            }
        }
        
        // Fix date - more flexible validation
        if (!processedRecord.date || processedRecord.date.trim() === '') {
            processedRecord.date = new Date().toISOString().split('T')[0];
            recordErrors.push('Used current date');
        } else if (!isValidDate(processedRecord.date)) {
            // Try to convert Excel date number or other formats
            try {
                const dateValue = new Date(processedRecord.date);
                if (!isNaN(dateValue)) {
                    processedRecord.date = dateValue.toISOString().split('T')[0];
                } else {
                    processedRecord.date = new Date().toISOString().split('T')[0];
                    recordErrors.push('Invalid date format, used current date');
                }
            } catch (error) {
                processedRecord.date = new Date().toISOString().split('T')[0];
                recordErrors.push('Invalid date format, used current date');
            }
        }
        
        // Fix optional fields
        if (!processedRecord.region || processedRecord.region.trim() === '') {
            processedRecord.region = 'Unknown';
        }
        
        if (!processedRecord.salesperson || processedRecord.salesperson.trim() === '') {
            processedRecord.salesperson = 'Unassigned';
        }
        
        // Ensure ID exists
        if (!processedRecord.id || processedRecord.id === '') {
            const maxId = salesData.length > 0 ? Math.max(...salesData.map(r => r.id || 0)) : 0;
            processedRecord.id = maxId + index + 1;
        }
        
        // Log warnings but still accept the record
        if (recordErrors.length > 0) {
            errors.push(`Row ${index + 1}: ${recordErrors.join(', ')}`);
            skippedCount++;
        }
        
        // Always accept the record after fixing issues
        validatedData.push(processedRecord);
    });
    
    console.log('Validation complete:', {
        totalRecords: data.length,
        acceptedRecords: validatedData.length,
        warnings: errors.length,
        sampleFixedRecord: validatedData[0]
    });
    
    if (errors.length > 0) {
        console.warn('Import validation warnings:', errors);
        showValidationMessage(`⚠️ Imported ${validatedData.length} records with ${errors.length} warnings. Check console for details.`, 'warning');
    } else {
        showValidationMessage(`✅ Successfully imported ${validatedData.length} records!`, 'success');
    }
    
    return validatedData;
}

// Validate date
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// Enhanced export function
function exportToCSV() {
    const headers = ['ID', 'Product', 'Category', 'Sales', 'Quantity', 'Date', 'Region', 'Salesperson'];
    const csvContent = [
        headers.join(','),
        ...salesData.map(record => [
            record.id,
            `"${record.product}"`,
            record.category,
            `₹${record.sales.toLocaleString('en-IN')}`,
            record.quantity,
            record.date,
            record.region,
            `"${record.salesperson}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showValidationMessage('Data exported successfully!', 'success');
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup login first
    setupLogin();
});

// Main initialization function
async function initializeDashboard() {
    try {
        // Check if user is logged in
        if (!isLoggedIn) {
            return; // Wait for login
        }
        
        // Load data from JSON file
        await loadData();
        
        // Validate and process data
        const processedData = validateAndProcessData(salesData);
        
        // Update summary statistics
        updateStatistics(processedData);
        
        // Render charts
        renderCharts(processedData);
        
        // Populate data table
        populateDataTable(processedData);
        
        // Setup event listeners
        setupEventListeners();
        
        // Setup import/export functionality
        setupImportExport();
        
        // Setup manual data entry
        setupManualEntry();
        
        // Setup audit trail
        setupAuditTrail();
        
        // Start real-time updates
        startRealTimeUpdates();
        
        // Setup dark mode
        setupDarkMode();
        
        // Show success message
        showValidationMessage('Dashboard loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showValidationMessage('Error loading dashboard. Please check the data file.', 'error');
    }
}

// Load data from JSON file
async function loadData() {
    try {
        // Fetch data from data.json file
        const response = await fetch("data.json");
        const data = await response.json();
        
        // Handle different data formats
        if (data.salesData) {
            salesData = data.salesData;
        } else if (Array.isArray(data)) {
            salesData = data;
        } else {
            throw new Error('Invalid data format');
        }
        
        console.log(`Loaded ${salesData.length} records from data.json`);
    } catch (error) {
        console.error('Error loading data:', error);
        
        // Fallback to sample data if fetch fails
        salesData = [
            {"id": 1, "product": "Laptop", "category": "Electronics", "sales": 124500, "quantity": 15, "date": "2024-01-15", "region": "North", "salesperson": "John Smith"},
            {"id": 2, "product": "Mouse", "category": "Electronics", "sales": 20750, "quantity": 50, "date": "2024-01-16", "region": "South", "salesperson": "Sarah Johnson"},
            {"id": 3, "product": "Keyboard", "category": "Electronics", "sales": 37350, "quantity": 30, "date": "2024-01-17", "region": "East", "salesperson": "Mike Davis"},
            {"id": 4, "product": "Monitor", "category": "Electronics", "sales": 66400, "quantity": 20, "date": "2024-01-18", "region": "West", "salesperson": "Emily Wilson"},
            {"id": 5, "product": "Desk Chair", "category": "Furniture", "sales": 99600, "quantity": 12, "date": "2024-01-19", "region": "North", "salesperson": "John Smith"},
            {"id": 6, "product": "Desk Lamp", "category": "Furniture", "sales": 12450, "quantity": 25, "date": "2024-01-20", "region": "South", "salesperson": "Sarah Johnson"},
            {"id": 7, "product": "Notebook", "category": "Stationery", "sales": 4150, "quantity": 100, "date": "2024-01-21", "region": "East", "salesperson": "Mike Davis"},
            {"id": 8, "product": "Pen Set", "category": "Stationery", "sales": 2490, "quantity": 75, "date": "2024-01-22", "region": "West", "salesperson": "Emily Wilson"},
            {"id": 9, "product": "Headphones", "category": "Electronics", "sales": 49800, "quantity": 18, "date": "2024-01-23", "region": "North", "salesperson": "John Smith"},
            {"id": 10, "product": "Webcam", "category": "Electronics", "sales": 29050, "quantity": 22, "date": "2024-01-24", "region": "South", "salesperson": "Sarah Johnson"},
            {"id": 11, "product": "Standing Desk", "category": "Furniture", "sales": 149400, "quantity": 8, "date": "2024-01-25", "region": "East", "salesperson": "Mike Davis"},
            {"id": 12, "product": "Bookshelf", "category": "Furniture", "sales": 78850, "quantity": 10, "date": "2024-01-26", "region": "West", "salesperson": "Emily Wilson"},
            {"id": 13, "product": "Calculator", "category": "Stationery", "sales": 3735, "quantity": 40, "date": "2024-01-27", "region": "North", "salesperson": "John Smith"},
            {"id": 14, "product": "Stapler", "category": "Stationery", "sales": 2075, "quantity": 30, "date": "2024-01-28", "region": "South", "salesperson": "Sarah Johnson"},
            {"id": 15, "product": "USB Hub", "category": "Electronics", "sales": 14940, "quantity": 35, "date": "2024-01-29", "region": "East", "salesperson": "Mike Davis"},
            {"id": 16, "product": "Tablet", "category": "Electronics", "sales": 62250, "quantity": 12, "date": "2024-01-30", "region": "West", "salesperson": "Emily Wilson"},
            {"id": 17, "product": "Office Chair", "category": "Furniture", "sales": 70550, "quantity": 15, "date": "2024-01-31", "region": "North", "salesperson": "John Smith"},
            {"id": 18, "product": "Highlighters", "category": "Stationery", "sales": 2905, "quantity": 60, "date": "2024-02-01", "region": "South", "salesperson": "Sarah Johnson"},
            {"id": 19, "product": "Router", "category": "Electronics", "sales": 34860, "quantity": 25, "date": "2024-02-02", "region": "East", "salesperson": "Mike Davis"},
            {"id": 20, "product": "Filing Cabinet", "category": "Furniture", "sales": 53950, "quantity": 8, "date": "2024-02-03", "region": "West", "salesperson": "Emily Wilson"},
            {"id": 21, "product": "Binder Clips", "category": "Stationery", "sales": 1245, "quantity": 120, "date": "2024-02-04", "region": "North", "salesperson": "John Smith"},
            {"id": 22, "product": "Smartphone", "category": "Electronics", "sales": 78850, "quantity": 10, "date": "2024-02-05", "region": "South", "salesperson": "Sarah Johnson"},
            {"id": 23, "product": "Conference Table", "category": "Furniture", "sales": 182600, "quantity": 3, "date": "2024-02-06", "region": "East", "salesperson": "Mike Davis"},
            {"id": 24, "product": "Whiteboard", "category": "Furniture", "sales": 37350, "quantity": 6, "date": "2024-02-07", "region": "West", "salesperson": "Emily Wilson"},
            {"id": 25, "product": "Markers", "category": "Stationery", "sales": 3320, "quantity": 80, "date": "2024-02-08", "region": "North", "salesperson": "John Smith"},
            {"id": 26, "product": "External Drive", "category": "Electronics", "sales": 23240, "quantity": 30, "date": "2024-02-09", "region": "South", "salesperson": "Sarah Johnson"},
            {"id": 27, "product": "Reception Desk", "category": "Furniture", "sales": 124500, "quantity": 2, "date": "2024-02-10", "region": "East", "salesperson": "Mike Davis"},
            {"id": 28, "product": "Paper Clips", "category": "Stationery", "sales": 1660, "quantity": 150, "date": "2024-02-11", "region": "West", "salesperson": "Emily Wilson"},
            {"id": 29, "product": "Printer", "category": "Electronics", "sales": 45650, "quantity": 7, "date": "2024-02-12", "region": "North", "salesperson": "John Smith"},
            {"id": 30, "product": "Storage Ottoman", "category": "Furniture", "sales": 31540, "quantity": 14, "date": "2024-02-13", "region": "South", "salesperson": "Sarah Johnson"},
            {"id": 31, "product": "Envelope Set", "category": "Stationery", "sales": 4565, "quantity": 45, "date": "2024-02-14", "region": "East", "salesperson": "Mike Davis"},
            {"id": 32, "product": "Wireless Mouse", "category": "Electronics", "sales": 26560, "quantity": 28, "date": "2024-02-15", "region": "West", "salesperson": "Emily Wilson"},
            {"id": 33, "product": "Lounge Chair", "category": "Furniture", "sales": 78850, "quantity": 5, "date": "2024-02-16", "region": "North", "salesperson": "John Smith"},
            {"id": 34, "product": "Sticky Notes", "category": "Stationery", "sales": 2075, "quantity": 90, "date": "2024-02-17", "region": "South", "salesperson": "Sarah Johnson"},
            {"id": 35, "product": "Bluetooth Speaker", "category": "Electronics", "sales": 14940, "quantity": 40, "date": "2024-02-18", "region": "East", "salesperson": "Mike Davis"},
            {"id": 36, "product": "Coffee Table", "category": "Furniture", "sales": 62250, "quantity": 9, "date": "2024-02-19", "region": "West", "salesperson": "Emily Wilson"},
            {"id": 37, "product": "File Folders", "category": "Stationery", "sales": 5395, "quantity": 55, "date": "2024-02-20", "region": "North", "salesperson": "John Smith"},
            {"id": 38, "product": "Power Bank", "category": "Electronics", "sales": 7885, "quantity": 65, "date": "2024-02-21", "region": "South", "salesperson": "Sarah Johnson"},
            {"id": 39, "product": "Side Table", "category": "Furniture", "sales": 26560, "quantity": 11, "date": "2024-02-22", "region": "East", "salesperson": "Mike Davis"},
            {"id": 40, "product": "Tape Dispenser", "category": "Stationery", "sales": 3735, "quantity": 35, "date": "2024-02-23", "region": "West", "salesperson": "Emily Wilson"},
            {"id": 41, "product": "HDMI Cable", "category": "Electronics", "sales": 6225, "quantity": 85, "date": "2024-02-24", "region": "North", "salesperson": "John Smith"},
            {"id": 42, "product": "Executive Chair", "category": "Furniture", "sales": 103750, "quantity": 4, "date": "2024-02-25", "region": "South", "salesperson": "Sarah Johnson"},
            {"id": 43, "product": "Legal Pads", "category": "Stationery", "sales": 7055, "quantity": 70, "date": "2024-02-26", "region": "East", "salesperson": "Mike Davis"},
            {"id": 44, "product": "USB Cable", "category": "Electronics", "sales": 2905, "quantity": 95, "date": "2024-02-27", "region": "West", "salesperson": "Emily Wilson"},
            {"id": 45, "product": "Credenza", "category": "Furniture", "sales": 149400, "quantity": 3, "date": "2024-02-28", "region": "North", "salesperson": "John Smith"},
            {"id": 46, "product": "Scissors", "category": "Stationery", "sales": 2490, "quantity": 50, "date": "2024-02-29", "region": "South", "salesperson": "Sarah Johnson"},
            {"id": 47, "product": "Laptop Stand", "category": "Electronics", "sales": 12450, "quantity": 32, "date": "2024-03-01", "region": "East", "salesperson": "Mike Davis"},
            {"id": 48, "product": "Bookcase", "category": "Furniture", "sales": 70550, "quantity": 7, "date": "2024-03-02", "region": "West", "salesperson": "Emily Wilson"},
            {"id": 49, "product": "Eraser Set", "category": "Stationery", "sales": 1660, "quantity": 110, "date": "2024-03-03", "region": "North", "salesperson": "John Smith"},
            {"id": 50, "product": "Wireless Charger", "category": "Electronics", "sales": 10375, "quantity": 45, "date": "2024-03-04", "region": "South", "salesperson": "Sarah Johnson"}
        ];
        
        console.log('Using fallback sample data');
    }
}

// Validate and process data
function validateAndProcessData(data) {
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
        showValidationMessage(`Found ${validationErrors.length} validation issues:`, 'warning');
        validationErrors.forEach(error => {
            console.warn(error);
        });
    }
    
    return processedData;
}

// Helper function to validate date
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// Update summary statistics
function updateStatistics(data) {
    // Use all data, not just valid records
    const totalRecords = data.length;
    const totalSales = data.reduce((sum, record) => sum + parseFloat(record.sales || 0), 0);
    const averageSales = totalRecords > 0 ? totalSales / totalRecords : 0;
    const totalQuantity = data.reduce((sum, record) => sum + parseInt(record.quantity || 0), 0);
    
    // Update DOM elements with animation
    animateValue('total-records', 0, totalRecords, 1000);
    animateValue('total-sales', 0, totalSales, 1000, '₹');
    animateValue('average-sales', 0, averageSales, 1000, '₹');
    animateValue('total-quantity', 0, totalQuantity, 1000);
    
    console.log('Statistics updated:', { totalRecords, totalSales, averageSales, totalQuantity });
}

// Animate numeric values
function animateValue(elementId, start, end, duration, prefix = '') {
    const element = document.getElementById(elementId);
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

// Render charts
function renderCharts(data) {
    // Use all data, not just valid records
    const allData = data;
    
    // Prepare data for charts
    const categoryData = aggregateByCategory(allData);
    const trendData = aggregateByDate(allData);
    
    // Destroy existing charts before creating new ones
    destroyCharts();
    
    // Create charts
    createBarChart(categoryData);
    createLineChart(trendData);
    createPieChart(categoryData);
    
    // Setup chart interactions
    setupChartInteractions();
    
    console.log('Charts rendered with data count:', allData.length);
}

// Update category filter dropdown
function updateCategoryFilter(data) {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;
    
    // Get unique categories
    const categories = [...new Set(data.map(record => record.category).filter(Boolean))];
    
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    console.log('Category filter updated with categories:', categories);
}

// Destroy existing charts
function destroyCharts() {
    if (barChart) {
        barChart.destroy();
        barChart = null;
    }
    if (lineChart) {
        lineChart.destroy();
        lineChart = null;
    }
    if (pieChart) {
        pieChart.destroy();
        pieChart = null;
    }
}

// Aggregate data by category
function aggregateByCategory(data) {
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

// Aggregate data by date
function aggregateByDate(data) {
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

// Create bar chart
function createBarChart(categoryData) {
    const ctx = document.getElementById('barChart').getContext('2d');
    
    const labels = Object.keys(categoryData);
    const data = labels.map(category => categoryData[category].totalSales);
    
    barChart = new Chart(ctx, {
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
                            return '₹' + context.parsed.y.toLocaleString('en-IN');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
}

// Create line chart
function createLineChart(dateData) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    
    const labels = Object.keys(dateData);
    const data = labels.map(date => dateData[date]);
    
    lineChart = new Chart(ctx, {
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
                            return '₹' + context.parsed.y.toLocaleString('en-IN');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
}

// Create pie chart
function createPieChart(categoryData) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    const labels = Object.keys(categoryData);
    const data = labels.map(category => categoryData[category].totalSales);
    
    pieChart = new Chart(ctx, {
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
                            return context.label + ': ₹' + context.parsed.toLocaleString('en-IN') + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Populate data table
function populateDataTable(data) {
    const tableBody = document.getElementById('table-body');
    const categoryFilter = document.getElementById('category-filter');
    
    // Clear existing table content
    tableBody.innerHTML = '';
    
    // Populate category filter
    const categories = [...new Set(data.map(record => record.category))];
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
    });
    
    // Render table rows
    data.forEach(record => {
        const row = createTableRow(record);
        tableBody.appendChild(row);
    });
}

// Create table row
function createTableRow(record) {
    const row = document.createElement('tr');
    if (!record.isValid) {
        row.classList.add('invalid');
    }
    
    row.innerHTML = `
        <td>${record.id}</td>
        <td>${record.product}</td>
        <td>${record.category}</td>
        <td>₹${parseFloat(record.sales).toLocaleString('en-IN')}</td>
        <td>${record.quantity}</td>
        <td>${record.date}</td>
        <td>${record.region}</td>
        <td>${record.salesperson}</td>
    `;
    
    return row;
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', filterTable);
    
    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    categoryFilter.addEventListener('change', filterTable);
    
    // Date filters
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    dateFrom.addEventListener('change', filterTable);
    dateTo.addEventListener('change', filterTable);
    
    // Price filters
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    priceMin.addEventListener('input', filterTable);
    priceMax.addEventListener('input', filterTable);
    
    // Sortable table headers
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => sortTable(header.dataset.column));
    });
    
    // Export CSV
    const exportBtn = document.getElementById('export-csv');
    exportBtn.addEventListener('click', exportToCSV);
    
    // Real-time toggle
    const realTimeToggle = document.getElementById('toggle-real-time');
    realTimeToggle.addEventListener('click', toggleRealTime);
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.addEventListener('click', refreshDashboard);
    
    // Navigation smooth scroll
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Smooth scroll to section
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Filter table based on search, category, date range, and price range
function filterTable() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    const priceMin = parseFloat(document.getElementById('price-min').value) || 0;
    const priceMax = parseFloat(document.getElementById('price-max').value) || Infinity;
    const tableRows = document.querySelectorAll('#table-body tr');
    
    let visibleRows = [];
    let categoryStats = {};
    
    tableRows.forEach(row => {
        const product = row.cells[1].textContent.toLowerCase();
        const category = row.cells[2].textContent;
        const date = row.cells[5].textContent;
        const sales = parseFloat(row.cells[3].textContent.replace('₹', '').replace(/,/g, ''));
        
        const matchesSearch = product.includes(searchInput);
        const matchesCategory = !categoryFilter || category === categoryFilter;
        const matchesDateFrom = !dateFrom || new Date(date) >= new Date(dateFrom);
        const matchesDateTo = !dateTo || new Date(date) <= new Date(dateTo);
        const matchesPriceRange = sales >= priceMin && sales <= priceMax;
        
        if (matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo && matchesPriceRange) {
            row.style.display = '';
            visibleRows.push(row);
            
            // Calculate category statistics
            if (!categoryStats[category]) {
                categoryStats[category] = {
                    count: 0,
                    totalSales: 0,
                    totalQuantity: 0
                };
            }
            categoryStats[category].count++;
            categoryStats[category].totalSales += sales;
            categoryStats[category].totalQuantity += parseInt(row.cells[4].textContent);
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update search statistics
    updateSearchStatistics(categoryStats, visibleRows.length);
}

// Update search statistics display
function updateSearchStatistics(categoryStats, visibleCount) {
    const searchStats = document.getElementById('search-stats');
    if (!searchStats) return;
    
    if (categoryStats && Object.keys(categoryStats).length > 0) {
        let statsHTML = '<h4>📊 Search Results</h4><div class="stats-grid">';
        
        // Overall stats
        const totalRecords = Object.values(categoryStats).reduce((sum, cat) => sum + cat.count, 0);
        const totalSales = Object.values(categoryStats).reduce((sum, cat) => sum + cat.totalSales, 0);
        const totalQuantity = Object.values(categoryStats).reduce((sum, cat) => sum + cat.totalQuantity, 0);
        
        statsHTML += `
            <div class="stat-item">
                <span class="stat-label">Total Records:</span>
                <span class="stat-value">${visibleCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Sales:</span>
                <span class="stat-value">₹${totalSales.toLocaleString('en-IN')}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Quantity:</span>
                <span class="stat-value">${totalQuantity.toLocaleString()}</span>
            </div>
        `;
        
        // Category-wise stats
        Object.entries(categoryStats).forEach(([category, stats]) => {
            statsHTML += `
                <div class="stat-item">
                    <span class="stat-label">${category}:</span>
                    <span class="stat-value">${stats.count} items</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">${category} Sales:</span>
                    <span class="stat-value">₹${stats.totalSales.toLocaleString('en-IN')}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">${category} Quantity:</span>
                    <span class="stat-value">${stats.totalQuantity.toLocaleString()}</span>
                </div>
            `;
        });
        
        statsHTML += '</div>';
        searchStats.innerHTML = statsHTML;
        searchStats.classList.add('show');
    } else {
        searchStats.classList.remove('show');
        searchStats.innerHTML = '';
    }
}

// Refresh dashboard
async function refreshDashboard() {
    const refreshBtn = document.getElementById('refresh-btn');
    const originalText = refreshBtn.textContent;
    
    // Show loading state
    refreshBtn.innerHTML = '<span class="loading"></span> Loading...';
    refreshBtn.disabled = true;
    
    try {
        // Reload data
        await loadData();
        
        // Process and update dashboard
        const processedData = validateAndProcessData(salesData);
        updateStatistics(processedData);
        
        // Update charts
        updateCharts(processedData);
        
        // Update table
        populateDataTable(processedData);
        
        showValidationMessage('Dashboard refreshed successfully!', 'success');
        
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
        showValidationMessage('Error refreshing dashboard.', 'error');
    } finally {
        // Reset button state
        refreshBtn.textContent = originalText;
        refreshBtn.disabled = false;
    }
}

// Update charts with new data
function updateCharts(data) {
    const validData = data.filter(record => record.isValid);
    const categoryData = aggregateByCategory(validData);
    const trendData = aggregateByDate(validData);
    
    // Update bar chart
    if (barChart) {
        const labels = Object.keys(categoryData);
        const chartData = labels.map(category => categoryData[category].totalSales);
        
        barChart.data.labels = labels;
        barChart.data.datasets[0].data = chartData;
        barChart.update();
    }
    
    // Update line chart
    if (lineChart) {
        const labels = Object.keys(trendData);
        const chartData = labels.map(date => trendData[date]);
        
        lineChart.data.labels = labels;
        lineChart.data.datasets[0].data = chartData;
        lineChart.update();
    }
    
    // Update pie chart
    if (pieChart) {
        const labels = Object.keys(categoryData);
        const chartData = labels.map(category => categoryData[category].totalSales);
        
        pieChart.data.labels = labels;
        pieChart.data.datasets[0].data = chartData;
        pieChart.update();
    }
}

// Show validation messages
function showValidationMessage(message, type) {
    const validationContainer = document.getElementById('validation-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `validation-message ${type} fade-in`;
    messageDiv.textContent = message;
    
    validationContainer.appendChild(messageDiv);
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 5000);
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Sort table functionality
function sortTable(column) {
    const table = document.getElementById('data-table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Toggle sort direction
    if (currentSortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        sortDirection = 'asc';
    }
    
    // Update header classes
    document.querySelectorAll('.sortable').forEach(header => {
        header.classList.remove('sorted-asc', 'sorted-desc');
    });
    const currentHeader = document.querySelector(`[data-column="${column}"]`);
    currentHeader.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
    
    // Sort rows
    rows.sort((a, b) => {
        let aValue = a.cells[getColumnIndex(column)].textContent;
        let bValue = b.cells[getColumnIndex(column)].textContent;
        
        // Handle numeric columns
        if (column === 'id' || column === 'sales' || column === 'quantity') {
            aValue = parseFloat(aValue.replace(/[^0-9.-]/g, ''));
            bValue = parseFloat(bValue.replace(/[^0-9.-]/g, ''));
        }
        
        // Handle date column
        if (column === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

// Get column index by column name
function getColumnIndex(columnName) {
    const columnIndexMap = {
        'id': 0,
        'product': 1,
        'category': 2,
        'sales': 3,
        'quantity': 4,
        'date': 5,
        'region': 6,
        'salesperson': 7
    };
    return columnIndexMap[columnName];
}

// Export to CSV functionality
function exportToCSV() {
    const validData = salesData.filter(record => record.isValid);
    
    // Create CSV content
    const headers = ['ID', 'Product', 'Category', 'Sales', 'Quantity', 'Date', 'Region', 'Salesperson'];
    const csvContent = [
        headers.join(','),
        ...validData.map(record => [
            record.id,
            record.product,
            record.category,
            record.sales,
            record.quantity,
            record.date,
            record.region,
            record.salesperson
        ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showValidationMessage('Data exported successfully!', 'success');
}

// Dark mode functionality
function setupDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '☀️';
    }
    
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
}

// Real-time updates functionality
function startRealTimeUpdates() {
    if (realTimeInterval) {
        clearInterval(realTimeInterval);
    }
    
    realTimeInterval = setInterval(() => {
        if (isRealTimeActive) {
            simulateRealTimeUpdate();
        }
    }, 5000); // Update every 5 seconds
}

function simulateRealTimeUpdate() {
    // Simulate a random data update
    const randomIndex = Math.floor(Math.random() * salesData.length);
    const randomRecord = salesData[randomIndex];
    const adjustment = (Math.random() - 0.5) * 1000; // Random adjustment between -500 and +500
    randomRecord.sales = Math.max(10, parseFloat(randomRecord.sales) + adjustment);
    
    // Update dashboard
    const processedData = validateAndProcessData(salesData);
    updateStatistics(processedData);
    updateCharts(processedData);
    populateDataTable(processedData);
    
    updateCount++;
    
    // Show subtle notification
    if (updateCount % 5 === 0) {
        showValidationMessage(`🔄 Live update: ${randomRecord.product} sales updated to ₹${randomRecord.sales.toFixed(2)}`, 'success');
    }
}

function toggleRealTime() {
    isRealTimeActive = !isRealTimeActive;
    const toggleBtn = document.getElementById('toggle-real-time');
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    
    if (isRealTimeActive) {
        toggleBtn.textContent = '⏸️ Pause';
        toggleBtn.title = 'Pause Live Updates';
        statusIndicator.classList.remove('paused');
        statusText.innerHTML = 'Live Updates: <span id="update-count">' + updateCount + '</span>';
        showValidationMessage('▶️ Real-time updates resumed', 'success');
    } else {
        toggleBtn.textContent = '▶️ Start';
        toggleBtn.title = 'Start Live Updates';
        statusIndicator.classList.add('paused');
        statusText.innerHTML = 'Updates Paused: <span id="update-count">' + updateCount + '</span>';
        showValidationMessage('⏸️ Real-time updates paused', 'warning');
    }
}

// Enhanced chart click functionality (drill-down)
function setupChartInteractions() {
    // Bar chart click handler
    if (barChart) {
        barChart.options.onClick = function(event, elements) {
            if (elements.length > 0) {
                const element = elements[0];
                const category = this.data.labels[element.index];
                drillDownToCategory(category);
            }
        };
    }
    
    // Pie chart click handler
    if (pieChart) {
        pieChart.options.onClick = function(event, elements) {
            if (elements.length > 0) {
                const element = elements[0];
                const category = this.data.labels[element.index];
                drillDownToCategory(category);
            }
        };
    }
}

function drillDownToCategory(category) {
    // Filter data by selected category
    const categoryData = salesData.filter(record => record.category === category);
    
    // Update table to show only category data
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    
    categoryData.forEach(record => {
        const row = createTableRow(record);
        tableBody.appendChild(row);
    });
    
    // Update category filter
    document.getElementById('category-filter').value = category;
    
    // Scroll to table
    document.getElementById('data-table').scrollIntoView({ behavior: 'smooth' });
    
    showValidationMessage(`Showing ${categoryData.length} records for ${category}`, 'success');
}
