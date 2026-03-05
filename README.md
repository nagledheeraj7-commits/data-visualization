# Data Visualization Dashboard

A modern, production-ready data visualization dashboard built with vanilla JavaScript, Node.js, and Express. Features advanced analytics, real-time updates, and a responsive design following industry best practices.

## 🚀 Features

### Core Functionality
- **Interactive Data Visualization** - Bar charts, line charts, and pie charts using Chart.js
- **Responsive Data Table** - Sortable, filterable, and searchable data display
- **Real-time Updates** - Live data simulation with pause/resume controls
- **Advanced Filtering** - Date range, price range, category, and search filters
- **Data Export** - CSV export functionality with filtered data support
- **Dark Mode** - Toggle between light and dark themes with persistence

### Advanced Features
- **Drill-down Analytics** - Click on charts to filter data by category
- **Summary Statistics** - Animated cards showing key metrics
- **Data Validation** - Comprehensive input validation and error handling
- **Responsive Design** - Mobile-first approach with breakpoints
- **Accessibility** - WCAG compliant with semantic HTML
- **Performance Optimized** - Lazy loading, compression, and caching

### Technical Features
- **Modular Architecture** - Component-based frontend with ES6 modules
- **RESTful API** - Express.js backend with proper HTTP methods
- **Error Handling** - Centralized error management and logging
- **Security** - Helmet, CORS, rate limiting, and input sanitization
- **Testing Ready** - Jest configuration with coverage reporting
- **Production Ready** - Environment-based configuration and optimization

## 📁 Project Structure

```
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
