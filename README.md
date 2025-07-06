# Personal Finance Management App

A comprehensive personal finance management application built with React and Node.js, featuring advanced analytics, OCR-powered receipt scanning, and AI-driven insights.

## 🚀 Features

### 📊 Dashboard & Analytics
- **Interactive Charts**: Line and bar charts with Chart.js integration
- **Year-over-Year Comparison**: Compare expenses across multiple years
- **Monthly Expense Tracking**: Detailed monthly breakdown
- **Category Analysis**: Pie charts for expense categorization
- **Real-time Data**: Live updates with responsive design

### 💳 Transaction Management
- **Manual Entry**: Add transactions with detailed information
- **OCR Receipt Scanning**: Upload receipts (images/PDFs) for automatic data extraction
- **Payment Method Tracking**: Cash, Online Payment categorization
- **Drag & Drop Upload**: Intuitive file upload interface

### 🤖 AI-Powered Insights
- **Expense Optimization**: Smart recommendations based on spending patterns
- **Financial Metrics**: Automated calculation of key financial indicators
- **Seasonal Analysis**: Quarterly spending pattern recognition (Q1-Q4)
- **Spending Alerts**: Intelligent notifications for unusual spending

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between themes for better user experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Professional UI**: Modern, clean interface with smooth animations
- **Accessibility**: WCAG compliant design with proper focus management

## 🛠️ Technology Stack

### Frontend
- **React** 18.x - Modern UI library
- **Chart.js** - Interactive data visualization
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with themes
- **React Router** - Client-side routing

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Database for transactions and user data
- **Multer** - File upload handling
- **Tesseract.js** - OCR for receipt scanning
- **JWT** - Authentication

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

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
JWT_SECRET=your-jwt-secret-key
```

### 4. Start the application

#### Backend Server
```bash
cd backend
npm start
```

#### Frontend Development Server
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## 📂 Project Structure

```
financeapp/
├── backend/                    # Node.js backend
│   ├── models/                # Database models
│   │   ├── User.js           # User model
│   │   ├── Transaction.js    # Transaction model
│   │   └── Income.js         # Income model
│   ├── routes/               # API routes
│   │   ├── auth.js          # Authentication routes
│   │   ├── transactions.js  # Transaction CRUD
│   │   └── income.js        # Income management
│   ├── middleware/          # Custom middleware
│   │   └── authMiddleware.js # JWT authentication
│   ├── uploads/             # File upload directory
│   └── server.js            # Main server file
├── frontend/                 # React frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.js       # Main dashboard
│   │   │   ├── TransactionForm.js # Transaction form
│   │   │   ├── TransactionList.js # Transaction list
│   │   │   ├── Login.js           # Authentication
│   │   │   └── ...                # Other components
│   │   ├── context/         # React context
│   │   │   ├── AuthContext.js     # Authentication context
│   │   │   └── ThemeContext.js    # Theme management
│   │   └── App.js          # Main app component
└── README.md               # This file
```

## 🎯 Usage

### Adding Transactions
1. Navigate to the "Add Transaction" form
2. Fill in transaction details manually, or
3. Upload a receipt image/PDF for automatic extraction
4. Review and submit the transaction

### Viewing Analytics
1. Access the dashboard for overview charts
2. Use year/month filters for specific periods
3. Switch between chart types (line/bar)
4. View AI-powered insights and recommendations

### Managing Data
- **Year-over-Year**: Select start and end years for comparison
- **Monthly View**: Choose specific months for detailed analysis
- **Category Breakdown**: View spending by category with pie charts

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/upload` - Upload receipt for OCR

### Income
- `GET /api/income` - Get all income records
- `POST /api/income` - Create new income record

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

## 📱 Mobile Responsiveness

The app is fully responsive and works on:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- File upload restrictions

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy the build folder
```

### Backend (Heroku/Railway)
```bash
# Set environment variables
# Deploy backend to your preferred platform
```

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

- [ ] Budget planning and alerts
- [ ] Expense category suggestions
- [ ] Export to CSV/PDF
- [ ] Multi-currency support
- [ ] Bank account integration
- [ ] Savings goal tracking
- [ ] Advanced AI insights
- [ ] Mobile app development

---

Made with ❤️ by [Your Name]
