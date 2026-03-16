# Data Visualization Dashboard

A full-stack web application for uploading and visualizing CSV/Excel data with interactive charts.

## 🚀 Features

### Frontend
- Modern, responsive dashboard UI
- Multiple chart types (Bar, Line, Pie charts)
- File upload for CSV/Excel files
- Dynamic chart rendering
- Professional layout with Chart.js

### Backend
- Node.js with Express.js
- File upload API endpoint
- CSV/Excel parsing
- CORS enabled
- Temporary file storage

## 📁 Project Structure

```
data-visualization/
├── frontend/
│   ├── index.html      # Main dashboard HTML
│   ├── style.css       # Dashboard styling
│   └── script.js      # Frontend JavaScript
├── backend/
│   ├── server.js       # Express server
│   ├── routes/
│   │   └── upload.js  # Upload route handler
│   ├── uploads/        # Temporary file storage
│   └── package.json   # Backend dependencies
└── sample-data.csv    # Sample CSV file
```

## 🛠️ Installation & Setup

### Backend Setup
```bash
cd backend
npm install
node server.js
```

The backend will run on `http://localhost:3000`

### Frontend Setup
Simply open `frontend/index.html` in your web browser.

## 📊 Usage

1. Start the backend server
2. Open `frontend/index.html` in browser
3. Click "Upload File" button
4. Select CSV or Excel file
5. View automatically generated charts

## 🚀 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect repository to Vercel
3. Deploy `frontend` folder

### Backend (Render)
1. Push to GitHub
2. Connect repository to Render
3. Deploy `backend` folder with Node.js environment

## 📋 API Endpoints

- `POST /api/upload` - Upload and parse CSV/Excel files
- Returns structured JSON data for visualization

## 🎯 Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript, Chart.js
- **Backend**: Node.js, Express.js, Multer, csv-parser, xlsx
- **File Processing**: CSV/Excel parsing
- **Deployment**: Vercel (Frontend), Render (Backend)
