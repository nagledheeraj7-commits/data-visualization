# File Upload Debugging Guide

## 🔍 Current Status Analysis

### ✅ Frontend (script.js) - Already Correct
```javascript
// ✅ Event listeners set up
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('drop', handleDrop);

// ✅ File upload function exists
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData
    });
}
```

### ✅ Backend (server-simple.js) - Already Correct
```javascript
// ✅ CORS enabled
app.use(cors());

// ✅ POST route exists
app.post('/api/upload', upload.single('file'), async (req, res) => {
    // File parsing logic
});
```

## 🧪 Step-by-Step Debugging

### Step 1: Verify Backend is Running
```bash
cd backend
node server-simple.js
```

**Expected Output:**
```
Server started on http://localhost:3000
🚀 Data Visualization API Server is running on port 3000
📊 Health check: http://localhost:3000/health
📁 Upload endpoint: http://localhost:3000/api/upload
```

### Step 2: Test Backend Routes
Open in browser:

1. **Default Route:** http://localhost:3000/
   - Should show: "Backend server running on port 3000"

2. **Health Check:** http://localhost:3000/health
   - Should show JSON status

3. **Upload GET:** http://localhost:3000/api/upload
   - Should show: `{"success": true, "message": "Upload endpoint is working. Use POST to upload a file."}`

### Step 3: Test Frontend File Selection
1. Open: http://127.0.0.1:5500/index.html
2. Click "Browse Files" button
3. Select a CSV file (like sample-data.csv)
4. Check browser console for errors

### Step 4: Monitor Network Requests
1. Open browser DevTools (F12)
2. Go to Network tab
3. Upload a file
4. Look for POST request to `http://localhost:3000/api/upload`
5. Check:
   - Request is being sent
   - Request headers
   - Request body (should show FormData)
   - Response status
   - Response body

## 🔧 Common Issues & Solutions

### Issue 1: Backend Not Running
**Symptoms:** Network error, connection refused
**Solution:** Start backend server first

### Issue 2: CORS Error
**Symptoms:** "Access-Control-Allow-Origin" error in console
**Solution:** Backend already has `app.use(cors())`

### Issue 3: File Not Selected
**Symptoms:** Nothing happens when clicking upload
**Solution:** Check file input event listeners

### Issue 4: Backend Route Not Found
**Symptoms:** 404 error when uploading
**Solution:** Verify POST route exists

### Issue 5: File Size/Type Error
**Symptoms:** Upload fails with validation error
**Solution:** Check file size and format

## 🧪 Testing Code

### Add Debug Logging to Frontend
Add this to script.js uploadFile function:

```javascript
async function uploadFile(file) {
    console.log('Starting file upload...');
    console.log('File:', file.name, file.size, file.type);
    
    if (!validateFile(file)) {
        console.log('File validation failed');
        return;
    }
    
    showLoading();
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('FormData created, sending request...');
    
    try {
        const response = await fetch("http://localhost:3000/api/upload", {
            method: "POST",
            body: formData
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success) {
            console.log('Upload successful!');
            // ... rest of success logic
        } else {
            console.log('Upload failed:', result.message);
        }
    } catch (error) {
        console.error('Upload error:', error);
    } finally {
        hideLoading();
        fileInput.value = '';
    }
}
```

### Add Debug Logging to Backend
Add this to server-simple.js upload route:

```javascript
app.post('/api/upload', upload.single('file'), async (req, res) => {
    console.log('Upload request received');
    console.log('File info:', req.file);
    console.log('Request body:', req.body);
    
    try {
        if (!req.file) {
            console.log('No file in request');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        console.log('Processing file:', req.file.originalname);
        // ... rest of processing logic
        
    } catch (error) {
        console.error('Upload error:', error);
        // ... error handling
    }
});
```

## 🎯 Quick Test

### 1. Test with Sample Data
```bash
# Use the provided sample-data.csv
# It should work perfectly
```

### 2. Check Browser Console
```javascript
// Look for these messages:
// "Starting file upload..."
// "File: sample-data.csv 2574 text/csv"
// "FormData created, sending request..."
// "Response status: 200"
// "Response data: {success: true, ...}"
```

### 3. Verify Chart Generation
```javascript
// After successful upload, check:
// - Data summary appears
// - Column selectors populated
// - Charts render
// - Table shows data
```

## 📋 Final Checklist

- [ ] Backend server running on port 3000
- [ ] Frontend loads at http://127.0.0.1:5500/index.html
- [ ] File selection triggers uploadFile function
- [ ] FormData created correctly
- [ ] POST request sent to http://localhost:3000/api/upload
- [ ] Backend receives file successfully
- [ ] Response contains parsed data
- [ ] Charts render with uploaded data
- [ ] No console errors

## 🚀 If Still Not Working

### Try This Minimal Test:
```javascript
// Add to browser console on frontend page
fetch('http://localhost:3000/health')
  .then(response => response.json())
  .then(data => console.log('Health check:', data))
  .catch(error => console.error('Health check error:', error));
```

This will confirm basic frontend-backend connectivity.

**The file upload logic is already correctly implemented in your script.js!** 
The issue is likely one of the common problems listed above.
