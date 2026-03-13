// Test connection to backend API
async function testConnection() {
    try {
        console.log('Testing connection to backend...');
        
        // Test health endpoint
        const healthResponse = await fetch('http://localhost:3001/api/health');
        const healthData = await healthResponse.json();
        console.log('Health check:', healthData);
        
        // Test sales endpoint
        const salesResponse = await fetch('http://localhost:3001/api/sales');
        const salesData = await salesResponse.json();
        console.log('Sales data:', salesData);
        
        console.log('✅ Connection successful!');
        return true;
    } catch (error) {
        console.error('❌ Connection failed:', error);
        return false;
    }
}

// Run test
testConnection();
