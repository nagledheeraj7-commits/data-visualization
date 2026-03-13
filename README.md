# Sales Analytics Dashboard

A professional, modern data visualization dashboard built with Docker, Node.js, Express, and Vanilla JavaScript that provides comprehensive sales analytics with interactive charts and real-time data updates.

## 🚀 Features

### Dashboard Components
- **KPI Cards**: Display key metrics including Total Sales, Total Revenue, Total Orders, and Best Selling Product
- **Interactive Charts**: 
  - Bar Chart for Sales by Category
  - Line Chart for Monthly Revenue Trends
  - Pie Chart for Product Distribution
  - Doughnut Chart for Regional Sales
- **Dynamic Data Table**: Sortable, searchable, and paginated table with all sales data
- **Advanced Filters**: Filter by category, region, and date range
- **Data Upload**: Upload CSV files to dynamically update all dashboard components
- **Export Functionality**: Export filtered data to CSV format

### Technical Features
- **Responsive Design**: Optimized for desktop and tablet devices
- **Real-time Updates**: All components update automatically when data changes
- **Modern UI**: Clean, professional interface with smooth animations and transitions
- **Docker Support**: Full containerized setup with Docker Compose
- **SQLite Database**: Lightweight database with Prisma ORM
- **API Integration**: RESTful API with proper error handling

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **Vanilla JavaScript** - No framework dependencies
- **Chart.js** - Interactive charts
- **PapaParse** - CSV parsing

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Prisma** - Database ORM
- **SQLite** - Database
- **Multer** - File upload handling

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git installed

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Data-visualization
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Health Check: http://localhost:3001/api/health

### Manual Setup (Alternative)

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📊 Usage

### Uploading Data
1. Navigate to the dashboard
2. Click "Upload Data" in the sidebar
3. Select a CSV file with sales data
4. Watch the dashboard update automatically

### CSV Format
```csv
Order ID,Product,Category,Region,Sales,Revenue,Date
TEST001,Laptop Pro,Electronics,North America,50,50000,2024-03-13
TEST002,Office Chair,Furniture,Europe,25,5000,2024-03-13
```

### API Endpoints
- `GET /api/health` - Health check
- `GET /api/sales` - Get all sales data
- `POST /api/sales/import` - Upload CSV file

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and update:

```env
NODE_ENV=development
DATABASE_URL=file:/app/prisma/dev.db
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Docker Configuration
The `docker-compose.yml` includes:
- Backend service with SQLite database
- Frontend service with hot reload
- Proper networking between services
- Volume mounts for database persistence

## 📁 Project Structure

```
Data-visualization/
├── docker-compose.yml          # Docker orchestration
├── backend/
│   ├── Dockerfile              # Backend container
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── dev.db            # SQLite database
│   ├── src/
│   │   ├── controllers/       # API controllers
│   │   ├── services/         # Business logic
│   │   └── routes/           # API routes
│   └── package.json
├── frontend/
│   ├── Dockerfile            # Frontend container
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js       # API client
│   │   └── script.js        # Main application
│   ├── index.html           # Main HTML file
│   └── style.css            # Styles
└── README.md
```

## 🐳 Docker Commands

### Development
```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Run production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using ports
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   
   # Kill processes
   taskkill /f /im node.exe
   ```

2. **Container Conflicts**
   ```bash
   # Clean up containers
   docker-compose down --volumes --remove-orphans
   docker system prune -f
   ```

3. **Database Issues**
   ```bash
   # Reset database
   docker exec sales_analytics_backend npx prisma db push --force-reset
   ```

### Health Checks
```bash
# Check backend health
curl http://localhost:3001/api/health

# Check frontend
curl http://localhost:3000

# Check container status
docker-compose ps
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Next Steps

- [ ] Add user authentication
- [ ] Implement real-time WebSocket updates
- [ ] Add more chart types
- [ ] Implement data export to Excel
- [ ] Add unit tests
- [ ] Deploy to production

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation
- **RESTful API** - Express.js backend with proper HTTP methods
- **Error Handling** - Centralized error management and logging
- **Security** - Helmet, CORS, rate limiting, and input sanitization
- **Testing Ready** - Jest configuration with coverage reporting
- **Production Ready** - Environment-based configuration and optimization
>>>>>>> cf4fb937df8fe216392710122ac0d62bbcb1cbc6

## 📁 Project Structure

```
<<<<<<< HEAD
Data-visualization/
├── index.html          # Main dashboard HTML file
├── style.css           # Complete styling with modern design
├── script.js           # All JavaScript functionality
├── data.json           # Sample sales data (30 records)
├── sample-data.csv     # Sample data in CSV format
└── README.md           # Project documentation
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and modern structure
- **CSS3**: Flexbox, Grid, animations, and responsive design
- **Vanilla JavaScript**: ES6+ features, async/await, modern DOM manipulation
- **Chart.js**: Interactive and responsive charts
- **PapaParse**: CSV parsing for file uploads

## 🎯 How to Run the Project

1. **Download or clone** all files to a local directory
2. **Open `index.html`** in any modern web browser (Chrome, Firefox, Safari, Edge)
3. **No server required** - The dashboard runs entirely in the browser
4. **No installation** needed - All dependencies are loaded from CDN

## 📊 Data Format

The dashboard expects data in the following format:

### JSON Format (data.json)
```json
{
    "order_id": "ORD001",
    "product": "Laptop Pro 15",
    "category": "Electronics",
    "region": "North America",
    "sales": 45,
    "revenue": 67500,
    "date": "2024-01-15"
}
```

### CSV Format (sample-data.csv)
```csv
order_id,product,category,region,sales,revenue,date
ORD001,Laptop Pro 15,Electronics,North America,45,67500,2024-01-15
```

## 🔧 Dashboard Features in Detail

### KPI Cards
- **Total Sales**: Sum of all sales units
- **Total Revenue**: Sum of all revenue values
- **Total Orders**: Count of all orders
- **Best Selling Product**: Product with highest sales volume

### Charts
1. **Sales by Category** (Bar Chart): Shows total sales per product category
2. **Monthly Revenue Trend** (Line Chart): Displays revenue over time
3. **Product Distribution** (Pie Chart): Top 5 products by sales volume
4. **Regional Sales** (Doughnut Chart): Sales distribution by region

### Data Table Features
- **Search**: Real-time search across all fields
- **Sort**: Sort by date, sales, revenue, or product
- **Pagination**: 10 records per page with navigation controls
- **Responsive**: Horizontal scroll on mobile devices

### Filters
- **Category Filter**: Filter by product category
- **Region Filter**: Filter by geographical region
- **Date Range**: Filter by start and end dates
- **Apply/Clear**: Easy filter management

### File Upload
- **Drag & Drop**: Intuitive file upload interface
- **Browse Files**: Traditional file selection
- **CSV Support**: Automatic CSV parsing and validation
- **Real-time Updates**: Dashboard updates immediately after upload

### Export Features
- **CSV Export**: Download filtered data as CSV file
- **Complete Data**: Includes all visible data with current filters applied

## 🎨 Design Highlights

- **Modern Color Scheme**: Professional gradient backgrounds and consistent color palette
- **Card-based Layout**: Clean separation of components
- **Smooth Animations**: Hover effects and transitions for better UX
- **Responsive Grid**: Adapts to different screen sizes
- **Typography**: Clear hierarchy and readable fonts
- **Icons**: Visual indicators for better navigation

## 📱 Responsive Design

The dashboard is fully responsive and works seamlessly on:
- **Desktop** (1200px+): Full layout with all features
- **Tablet** (768px-1199px): Adjusted layout with reorganized components
- **Mobile** (<768px): Stacked layout with collapsible sidebar

## 🔌 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 🚀 Getting Started Guide

1. **Open the Dashboard**: Double-click `index.html` to launch
2. **Explore Features**: Navigate through different sections using the sidebar
3. **Try Filters**: Apply different filters to see real-time updates
4. **Upload Data**: Use the Upload Data page to import your own CSV files
5. **Export Results**: Use the Export button to download filtered data

## 📈 Sample Data

The project includes 30 sample records across:
- **Categories**: Electronics, Furniture, Appliances
- **Regions**: North America, Europe, Asia
- **Date Range**: January - March 2024
- **Products**: Various consumer electronics and home goods

## 🔄 Data Flow

1. **Initial Load**: Data loaded from `data.json`
2. **Filter Application**: Data filtered based on user selections
3. **Chart Updates**: All charts updated with filtered data
4. **Table Refresh**: Table repopulated with paginated results
5. **KPI Recalculation**: Metrics recalculated and displayed

## 🎯 Use Cases

- **Sales Team Performance Tracking**
- **Regional Sales Analysis**
- **Product Performance Monitoring**
- **Revenue Trend Analysis**
- **Business Intelligence Reporting**
- **Data-driven Decision Making**

## 📝 Notes

- The dashboard uses Chart.js from CDN for charting functionality
- PapaParse is used for CSV file parsing
- All data processing happens client-side (no server required)
- The application is fully functional without any backend setup
- Sample data can be easily replaced with your own datasets

## 🤝 Contributing

Feel free to customize and extend the dashboard:
- Add new chart types
- Implement additional filters
- Add more KPI metrics
- Enhance the export functionality
- Add data persistence features

## 📞 Support

If you encounter any issues or have questions:
1. Check browser console for error messages
2. Ensure all files are in the same directory
3. Verify CSV format matches the expected structure
4. Test with different browsers if needed

---

**Built with ❤️ using HTML, CSS, and Vanilla JavaScript**
=======
data-visualization-dashboard/
├── src/
│   ├── frontend/                 # Frontend application
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Header.js
│   │   │   ├── Navigation.js
│   │   │   ├── StatsCards.js
│   │   │   ├── DataTable.js
│   │   │   ├── Charts.js
│   │   │   └── RealTimeStatus.js
│   │   ├── styles/             # CSS stylesheets
│   │   │   └── main.css
│   │   ├── scripts/            # Application scripts
│   │   │   └── app.js
│   │   ├── utils/              # Utility functions
│   │   │   ├── dataService.js
│   │   │   ├── export.js
│   │   │   └── notificationService.js
│   │   └── assets/             # Static assets
│   ├── backend/                  # Backend API server
│   │   ├── config/            # Configuration files
│   │   │   ├── database.js
│   │   │   └── server.js
│   │   ├── controllers/       # Route controllers
│   │   │   └── salesController.js
│   │   ├── models/           # Data models
│   │   │   └── Sales.js
│   │   ├── routes/           # API routes
│   │   │   └── salesRoutes.js
│   │   ├── middleware/       # Express middleware
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   ├── services/         # Business logic
│   │   ├── utils/           # Backend utilities
│   │   ├── data/            # Data files
│   │   │   └── sales.json
│   │   └── server.js        # Server entry point
│   └── api/                     # API documentation and utilities
│       ├── routes/
│       ├── controllers/
│       ├── models/
│       ├── middleware/
│       └── utils/
├── public/                     # Static assets and build output
├── docs/                       # Documentation
├── tests/                      # Test files
├── package.json               # Project dependencies and scripts
├── README.md                 # This file
├── .gitignore               # Git ignore rules
├── .eslintrc.json          # ESLint configuration
├── .prettierrc             # Prettier configuration
└── webpack.config.js         # Webpack configuration
```

## 🛠️ Installation

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/data-visualization-dashboard.git
   cd data-visualization-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3001
   - API: http://localhost:3001/api
   - Health Check: http://localhost:3001/api/health

## 📊 Usage

### Frontend Features

#### Dashboard Overview
- **Summary Cards**: Display total records, sales, average sales, and quantity
- **Animated Statistics**: Smooth number animations on data updates
- **Responsive Grid**: Adapts to different screen sizes

#### Data Visualization
- **Bar Chart**: Sales by category with interactive tooltips
- **Line Chart**: Sales trend over time with smooth curves
- **Pie Chart**: Category distribution with percentages
- **Drill-down**: Click chart segments to filter data

#### Data Table
- **Advanced Filtering**: Search, category, date range, and price filters
- **Sortable Columns**: Click headers to sort ascending/descending
- **Pagination**: Handle large datasets efficiently
- **Export**: Download filtered data as CSV

#### Real-time Updates
- **Live Data**: Automatic updates every 5 seconds
- **Status Indicator**: Visual feedback for connection status
- **Pause/Resume**: User control over real-time features

### API Endpoints

#### Sales Data
```http
GET    /api/sales              # Get all sales records
GET    /api/sales/statistics   # Get sales statistics
GET    /api/sales/export       # Export data as CSV
GET    /api/sales/:id          # Get specific sales record
POST   /api/sales              # Create new sales record
PUT    /api/sales/:id          # Update sales record
DELETE /api/sales/:id          # Delete sales record
```

#### Query Parameters
- `category`: Filter by category (Electronics, Furniture, Stationery)
- `region`: Filter by region (North, South, East, West)
- `dateFrom`: Filter by start date (YYYY-MM-DD)
- `dateTo`: Filter by end date (YYYY-MM-DD)
- `minSales`: Filter by minimum sales amount
- `maxSales`: Filter by maximum sales amount
- `page`: Pagination page number (default: 1)
- `limit`: Results per page (default: 50, max: 100)

#### Response Format
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure
```
tests/
├── unit/                   # Unit tests
│   ├── components/
│   ├── utils/
│   └── controllers/
├── integration/            # Integration tests
│   ├── api/
│   └── database/
└── e2e/                  # End-to-end tests
    └── dashboard.spec.js
```

## 🚀 Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=sales_dashboard
ALLOWED_ORIGINS=https://yourdomain.com
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t data-visualization-dashboard .

# Run container
docker run -p 3001:3001 data-visualization-dashboard
```

## 📈 Performance

### Optimization Features
- **Code Splitting**: Lazy load components and routes
- **Tree Shaking**: Remove unused code in production
- **Compression**: Gzip compression for all responses
- **Caching**: Browser and server-side caching strategies
- **Bundle Analysis**: Webpack bundle analyzer integration

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: < 500KB (gzipped)

## 🔒 Security

### Security Features
- **Helmet.js**: Security headers and CSP
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: DDoS protection
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization and CSP

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Quality
- **ESLint**: JavaScript linting with Airbnb config
- **Prettier**: Code formatting with consistent style
- **Husky**: Pre-commit hooks for quality control
- **Conventional Commits**: Standardized commit messages

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Chart.js**: For powerful data visualization
- **Express.js**: For robust backend framework
- **MDN Web Docs**: For excellent documentation
- **CSS Tricks**: For responsive design insights

## 📞 Support

- **Documentation**: [Project Wiki](https://github.com/your-org/data-visualization-dashboard/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-org/data-visualization-dashboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/data-visualization-dashboard/discussions)

## 🗺 Roadmap

### Version 1.1.0 (Planned)
- [ ] User authentication and authorization
- [ ] Data import from CSV/Excel files
- [ ] Advanced chart types (heatmap, scatter plot)
- [ ] Custom dashboard builder
- [ ] Email notifications and reports

### Version 1.2.0 (Planned)
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics and insights
- [ ] API rate limiting per user
- [ ] Data backup and restore
- [ ] Mobile app companion

---

**Built with ❤️ by the Data Visualization Team**
>>>>>>> cf4fb937df8fe216392710122ac0d62bbcb1cbc6
