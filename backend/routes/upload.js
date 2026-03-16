const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
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

// Upload and parse CSV/Excel file
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

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

// Get file statistics (optional endpoint)
router.get('/stats', (req, res) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
        return res.json({
            success: true,
            message: 'No uploads directory',
            stats: {
                totalFiles: 0,
                totalSize: 0
            }
        });
    }

    try {
        const files = fs.readdirSync(uploadsDir);
        let totalSize = 0;
        
        files.forEach(file => {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
        });

        res.json({
            success: true,
            message: 'Upload statistics',
            stats: {
                totalFiles: files.length,
                totalSize: totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting upload stats'
        });
    }
});

module.exports = router;
