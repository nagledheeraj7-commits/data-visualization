import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3001/api/sales/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ Successfully uploaded ${result.data.importedCount} records`);
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      setMessage(`❌ Upload failed: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>📊 Sales Analytics Dashboard</h1>
      
      <div style={{ 
        border: '2px dashed #ccc', 
        padding: '40px', 
        textAlign: 'center', 
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h2>📁 Upload CSV File</h2>
        <p>Select a CSV file with sales data to upload</p>
        
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ margin: '20px 0' }}
        />
        
        {file && (
          <div>
            <p>Selected file: <strong>{file.name}</strong></p>
            <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}
        
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{
            padding: '10px 20px',
            backgroundColor: uploading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            marginTop: '10px'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
        
        {message && (
          <div style={{
            margin: '20px 0',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24'
          }}>
            {message}
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3>📋 CSV Format Requirements:</h3>
        <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li>File must be in CSV format</li>
          <li>Required columns: Order ID, Product, Category, Region, Sales, Revenue, Date</li>
          <li>Categories: Electronics, Furniture, Appliances</li>
          <li>Regions: North America, Europe, Asia</li>
          <li>Date format: YYYY-MM-DD</li>
        </ul>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3>🔗 API Endpoints:</h3>
        <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li><strong>GET</strong> http://localhost:3001/api/sales - Get all sales</li>
          <li><strong>POST</strong> http://localhost:3001/api/sales/import - Upload CSV</li>
          <li><strong>GET</strong> http://localhost:3001/api/health - Health check</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
