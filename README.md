# Personal Finance Management App

A comprehensive personal finance management application built with React and Node.js, featuring advanced analytics, PDF bulk upload with OCR, predictive insights, and professional UI design.

## 🚀 Features

### 📊 Dashboard & Analytics
- **Interactive Charts**: Line and bar charts with Chart.js integration
- **Year-over-Year Comparison**: Compare expenses across multiple years
- **Monthly Expense Tracking**: Detailed monthly breakdown with pagination
- **Category Analysis**: Pie charts for expense categorization
- **Real-time Data**: Live updates with responsive design
- **Advanced Filtering**: Filter by year, month, category, payment method, and amount range

### 💳 Transaction Management
- **Manual Entry**: Add transactions with detailed information
- **PDF Bulk Upload**: Extract transaction data from PDF files with OCR
- **Editable Review**: Review and edit extracted transactions before saving
- **Selective Saving**: Choose which transactions to save from bulk upload
- **Payment Method Tracking**: Cash, Online Payment, Credit Card categorization
- **Drag & Drop Upload**: Intuitive file upload interface

### 📄 PDF Processing Features
- **Table Extraction**: Automatically extract tabular data from PDFs
- **OCR Technology**: Uses Tesseract.js for accurate text recognition
- **Data Validation**: Validates extracted data before processing
- **Edit Before Save**: Modify extracted transactions before adding to database
- **Bulk Selection**: Select multiple transactions for batch operations

### 🤖 Predictive Analytics
- **Expense Forecasting**: AI-powered predictions based on historical data
- **Income Trend Analysis**: Analyze income patterns and projections
- **Budget Recommendations**: Smart suggestions for budget optimization
- **Seasonal Patterns**: Quarterly spending pattern recognition (Q1-Q4)
- **Financial Health Score**: Automated calculation of key financial indicators

### 🎨 User Experience
- **Professional UI**: Modern brown/orange theme with consistent styling
- **Dark/Light Theme**: Toggle between themes for better user experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Professional hover effects and transitions
- **Accessibility**: WCAG compliant design with proper focus management
- **Icon-free Design**: Clean, minimalist interface without cluttering icons

## 🛠️ Technology Stack

### Frontend
- **React** 18.x - Modern UI library with hooks
- **Chart.js** - Interactive data visualization
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with brown/orange theme
- **React Router** - Client-side routing
- **React Context** - State management for auth and theme

### Backend
- **Node.js** - Server runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database for transactions and user data
- **Mongoose** - MongoDB object modeling
- **Multer** - File upload handling
- **Tesseract.js** - OCR for PDF text extraction
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing

### Additional Libraries
- **pdf-parse** - PDF processing
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher) - Local installation or MongoDB Atlas
- **npm** or **yarn** package manager
- **Git** for version control

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/financeapp.git
cd financeapp
```

### 2. Install dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/financeapp
JWT_SECRET=your-super-secure-jwt-secret-key
NODE_ENV=development
```

For production with MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/financeapp
```

### 4. Start the application

#### Backend Server
```bash
cd backend
npm start
```
Backend will run on `http://localhost:5000`

#### Frontend Development Server
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

The application will automatically open in your browser at `http://localhost:3000`

## 📂 Project Structure

```
financeapp/
├── backend/                    # Node.js backend
│   ├── models/                # Database models
│   │   ├── User.js           # User model with authentication
│   │   ├── Transaction.js    # Transaction model
│   │   └── Income.js         # Income model
│   ├── routes/               # API routes
│   │   ├── auth.js          # Authentication routes
│   │   ├── transactions.js  # Transaction CRUD operations
│   │   ├── transactions-upload.js # PDF upload and processing
│   │   └── income.js        # Income management
│   ├── middleware/          # Custom middleware
│   │   └── authMiddleware.js # JWT authentication middleware
│   ├── uploads/             # File upload directory
│   ├── eng.traineddata      # Tesseract OCR language data
│   └── server.js            # Main server file
├── frontend/                 # React frontend
│   ├── public/              # Static assets
│   │   ├── index.html       # Main HTML file
│   │   ├── favicon.ico      # App icon
│   │   └── test-upload.html # PDF upload test page
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.js       # Main dashboard with charts
│   │   │   ├── TransactionForm.js # Transaction form with bulk upload
│   │   │   ├── TransactionList.js # Transaction list with filtering
│   │   │   ├── IncomeForm.js      # Income form
│   │   │   ├── IncomeList.js      # Income list
│   │   │   ├── AdvancedAnalytics.js # Predictive analytics
│   │   │   ├── FinancialReports.js  # Financial reports
│   │   │   ├── BulkUpload.js        # Bulk upload component
│   │   │   ├── Login.js             # Login component
│   │   │   ├── Register.js          # Registration component
│   │   │   ├── ForgotPassword.js    # Password reset
│   │   │   ├── ThemeToggle.js       # Theme switcher
│   │   │   └── ErrorBoundary.js     # Error handling
│   │   ├── context/         # React context
│   │   │   ├── AuthContext.js     # Authentication context
│   │   │   └── ThemeContext.js    # Theme management
│   │   ├── utils/           # Utility functions
│   │   │   └── dashboardUtils.js  # Dashboard helper functions
│   │   ├── App.js          # Main app component
│   │   └── index.js        # React entry point
├── uploads/                # Global upload directory
├── README.md               # This file
├── ENHANCED_DASHBOARD_GUIDE.md  # Dashboard features guide
├── PDF_UPLOAD_GUIDE.md     # PDF upload instructions
├── UPLOAD_FEATURE_GUIDE.md # Upload feature documentation
└── SAMPLE_TRANSACTIONS_FOR_PDF.md # Sample data for testing
```

## 🎯 Usage

### Adding Transactions
1. **Manual Entry**: Navigate to the "Add Transaction" form and fill in details
2. **PDF Bulk Upload**: 
   - Toggle to "Bulk Upload" mode in the transaction form
   - Upload a PDF file containing transaction data
   - Review and edit extracted transactions
   - Select which transactions to save
   - Click "Save Selected" to add them to your database

### PDF Upload Requirements
- **Supported Formats**: PDF files with tabular data
- **File Size**: Maximum 10MB per file
- **Data Format**: Tables with columns for date, description, amount, category
- **OCR Processing**: Automatic text extraction and data validation

### Viewing Analytics
1. **Dashboard**: Access overview charts and summaries
2. **Advanced Analytics**: View predictive insights and trends
3. **Financial Reports**: Generate detailed reports with charts
4. **Filtering**: Use year/month/category filters for specific analysis

### Managing Data
- **Transaction List**: View all transactions with advanced filtering
- **Income Tracking**: Manage income sources and monthly tracking
- **Category Management**: Organize transactions by custom categories
- **Pagination**: Navigate through large datasets efficiently

### Theme and Preferences
- **Theme Toggle**: Switch between light and dark modes
- **Responsive Design**: Access on any device (desktop, tablet, mobile)
- **Professional UI**: Clean brown/orange theme throughout the app
- **Monthly View**: Choose specific months for detailed analysis
- **Category Breakdown**: View spending by category with pie charts

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Transactions
- `GET /api/transactions` - Get all transactions with filtering
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update existing transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/upload-pdf-table` - Upload PDF for bulk extraction

### Income
- `GET /api/income` - Get all income records
- `POST /api/income` - Create new income record
- `PUT /api/income/:id` - Update income record
- `DELETE /api/income/:id` - Delete income record

### File Upload
- `POST /api/upload` - General file upload endpoint
- **Supported**: PDF files up to 10MB
- **Processing**: OCR text extraction and data validation

## 📱 Mobile Responsiveness

The app is fully responsive and optimized for:
- **Desktop**: 1200px+ (Full feature set)
- **Tablet**: 768px - 1199px (Adapted layout)
- **Mobile**: 320px - 767px (Mobile-first design)

### Mobile Features
- Touch-friendly interface
- Swipe gestures for navigation
- Compressed layouts for small screens
- Optimized PDF upload on mobile devices

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: File type and size restrictions
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Secure configuration management

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start backend in production mode
cd backend
npm run production
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/financeapp
JWT_SECRET=your-super-secure-production-jwt-secret
```

### Deployment Platforms
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Backend**: Heroku, Railway, DigitalOcean
- **Database**: MongoDB Atlas (recommended for production)

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
npm test
```

### Manual Testing
- Use `test-upload.html` for PDF upload testing
- Check responsive design on different screen sizes
- Verify theme switching functionality
- Test bulk upload with sample PDF files

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally
   - Check connection string in `.env`
   - Verify database credentials

2. **PDF Upload Not Working**
   - Check file size (max 10MB)
   - Ensure PDF contains tabular data
   - Verify OCR service is running

3. **Theme Not Switching**
   - Clear browser cache
   - Check localStorage for theme preference
   - Verify ThemeContext is properly wrapped

4. **Responsive Design Issues**
   - Check viewport meta tag
   - Verify CSS media queries
   - Test on different devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chart.js for excellent charting capabilities
- Tesseract.js for OCR functionality
- React community for comprehensive documentation
- MongoDB for flexible data storage

## 📧 Support

For support, email your-email@example.com or create an issue in the GitHub repository.

## 🔮 Future Enhancements

- [ ] **Advanced Budget Planning**: Set and track monthly/yearly budgets
- [ ] **Expense Category AI**: Automatic categorization using machine learning
- [ ] **Multi-format Export**: Export to CSV, Excel, and PDF formats
- [ ] **Multi-currency Support**: Handle multiple currencies with exchange rates
- [ ] **Bank Integration**: Connect with bank APIs for automatic transaction import
- [ ] **Savings Goals**: Set and track savings targets
- [ ] **Advanced AI Insights**: More sophisticated spending analysis
- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **Receipt Photo Upload**: Upload photo receipts for OCR processing
- [ ] **Subscription Tracking**: Track and manage recurring subscriptions
- [ ] **Investment Tracking**: Monitor investment portfolios
- [ ] **Tax Preparation**: Generate tax-ready reports

## 📊 Recent Updates

### Version 2.0 (Latest)
- ✅ **PDF Bulk Upload**: Complete PDF processing with OCR
- ✅ **Enhanced UI**: Professional brown/orange theme
- ✅ **Editable Review**: Edit extracted transactions before saving
- ✅ **Advanced Filtering**: Multi-parameter filtering system
- ✅ **Pagination**: Efficient handling of large datasets
- ✅ **Responsive Design**: Improved mobile experience

### Version 1.5
- ✅ **Predictive Analytics**: AI-powered expense forecasting
- ✅ **Financial Reports**: Comprehensive reporting system
- ✅ **Theme Support**: Light and dark theme options
- ✅ **Income Tracking**: Separate income management module

## 🎨 Design System

### Color Palette
- **Primary**: Brown (#7f4c47) / Orange (#a0624a)
- **Secondary**: Light Brown (#e6a070) / Dark Orange (#ff9776)
- **Accent**: Professional gradients and shadows
- **Background**: White (light) / Dark Blue (#2a2a42) (dark)

### Typography
- **Primary Font**: Roboto, Inter
- **Headings**: Bold, modern styling
- **Body**: Clean, readable text

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Gradient backgrounds, hover effects
- **Forms**: Clean inputs with validation
- **Navigation**: Intuitive menu structure

## 📞 Support & Contact

- **GitHub Issues**: Report bugs and feature requests
- **Email**: Create an issue for direct support
- **Documentation**: Check additional guide files in the repository
- **Community**: Join discussions in the repository

## 🏆 Credits & Acknowledgments

- **Chart.js**: Excellent charting library for data visualization
- **Tesseract.js**: Powerful OCR functionality for PDF processing
- **React Community**: Comprehensive documentation and support
- **MongoDB**: Flexible NoSQL database solution
- **Express.js**: Fast and minimalist web framework
- **Material Design**: Design principles and inspiration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ Liability and warranty not provided

---

**Happy Financial Management!** 💰📊

Made with ❤️ and lots of ☕ by the Finance App Team
