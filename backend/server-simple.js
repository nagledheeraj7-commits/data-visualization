const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept only CSV and Excel files
        const allowedTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (allowedTypes.includes(file.mimetype) || 
            file.originalname.endsWith('.csv') || 
            file.originalname.endsWith('.xlsx') || 
            file.originalname.endsWith('.xls')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV and Excel files are allowed'), false);
        }
    }
});

// Helper route for testing
app.get('/', (req, res) => {
    res.send('Server running on port 3000');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Server running', 
        message: 'Data Visualization API is running',
        timestamp: new Date().toISOString()
    });
});

// GET route for upload endpoint testing
app.get('/api/upload', (req, res) => {
    res.json({
        success: true,
        message: 'Upload endpoint is working. Use POST to upload a file.'
    });
});

// POST route for file upload and parsing
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        console.log('Upload request received');
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        console.log('File uploaded:', req.file.originalname);
        
        const filePath = req.file.path;
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        let data = [];

        // Parse CSV file
        if (fileExtension === '.csv') {
            data = await parseCSV(filePath);
        } 
        // Parse Excel file
        else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
            data = await parseExcel(filePath);
        } else {
            // Clean up uploaded file
            fs.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                message: 'Unsupported file format'
            });
        }

        // Clean up uploaded file after parsing
        fs.unlinkSync(filePath);

        console.log('Data parsed successfully:', data.length, 'records');

        // Send response with parsed data
        res.json({
            success: true,
            message: 'File uploaded and parsed successfully',
            data: data,
            filename: req.file.originalname,
            rowCount: data.length,
            columns: data.length > 0 ? Object.keys(data[0]) : []
        });

    } catch (error) {
        console.error('Upload error:', error);
        
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Error processing file: ' + error.message
        });
    }
});

// Function to parse CSV file
function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                // Clean and validate data
                const cleanedData = {};
                for (const [key, value] of Object.entries(data)) {
                    cleanedData[key.trim()] = value ? value.trim() : '';
                }
                results.push(cleanedData);
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Function to parse Excel file
function parseExcel(filePath) {
    return new Promise((resolve, reject) => {
        try {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0]; // Use first sheet
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON
            const data = xlsx.utils.sheet_to_json(worksheet);
            
            // Clean and validate data
            const cleanedData = data.map(row => {
                const cleanedRow = {};
                for (const [key, value] of Object.entries(row)) {
                    cleanedRow[key.trim()] = value !== null && value !== undefined ? String(value).trim() : '';
                }
                return cleanedRow;
            });
            
            resolve(cleanedData);
        } catch (error) {
            reject(error);
        }
    });
}

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                success: false, 
                message: 'File size too large. Maximum size is 10MB.' 
            });
        }
    }
    
    if (error.message === 'Only CSV and Excel files are allowed') {
        return res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
    
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log('Server started on http://localhost:3000');
    console.log('🚀 Data Visualization API Server is running on port', PORT);
    console.log('📊 Health check: http://localhost:' + PORT + '/health');
    console.log('📁 Upload endpoint: http://localhost:' + PORT + '/api/upload');
});

module.exports = app;
