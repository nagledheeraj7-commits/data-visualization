# Sales Analytics Dashboard

A professional, modern data visualization dashboard built with HTML, CSS, and Vanilla JavaScript that provides comprehensive sales analytics with interactive charts and real-time data updates.

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
- **No Dependencies**: Uses only Chart.js and PapaParse for charting and CSV parsing
- **Local Storage Ready**: Can be easily extended to save user preferences

## 📁 Project Structure

```
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
