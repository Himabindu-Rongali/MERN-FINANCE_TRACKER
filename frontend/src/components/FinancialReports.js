import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { ThemeContext } from './ThemeContext';
import './FinancialReports.css';

const FinancialReports = () => {
  const [transactions, setTransactions] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateRange, setDateRange] = useState('all'); // all, today, week, month, year, custom
  const [dataType, setDataType] = useState('all'); // all, income, expenses
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { theme } = useContext(ThemeContext);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsRes, incomesRes] = await Promise.all([
          axios.get('http://localhost:5000/transactions'),
          axios.get('http://localhost:5000/api/income')
        ]);
        
        setTransactions(transactionsRes.data);
        setIncomes(incomesRes.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load financial data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combine and process data
  useEffect(() => {
    const processedTransactions = transactions.map(transaction => ({
      ...transaction,
      type: 'expense',
      title: transaction.category || 'Expense',
      amount: parseFloat(transaction.amount),
      date: new Date(transaction.date),
      description: transaction.description || `${transaction.category} expense`,
      paymentMethod: transaction.paymentMethod || 'N/A'
    }));

    const processedIncomes = incomes.map(income => ({
      ...income,
      type: 'income',
      title: income.source || 'Income',
      amount: parseFloat(income.amount),
      date: new Date(income.date),
      description: `Income from ${income.source}`,
      paymentMethod: 'N/A'
    }));

    const combined = [...processedTransactions, ...processedIncomes];
    setCombinedData(combined);
  }, [transactions, incomes]);

  // Apply filters
  useEffect(() => {
    let dateFiltered = [...combinedData];

    // First apply date filtering to get all data for the period (for summary stats)
    if (dateRange !== 'all') {
      const now = new Date();
      let filterStartDate, filterEndDate;

      switch (dateRange) {
        case 'today':
          filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          filterEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          filterStartDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
          filterEndDate = new Date(filterStartDate);
          filterEndDate.setDate(filterStartDate.getDate() + 7);
          break;
        case 'month':
          filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
          filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case 'year':
          filterStartDate = new Date(now.getFullYear(), 0, 1);
          filterEndDate = new Date(now.getFullYear() + 1, 0, 1);
          break;
        case 'custom':
          if (startDate && endDate) {
            filterStartDate = new Date(startDate);
            filterEndDate = new Date(endDate);
            filterEndDate.setDate(filterEndDate.getDate() + 1); // Include end date
          }
          break;
      }

      if (filterStartDate && filterEndDate) {
        dateFiltered = dateFiltered.filter(item => 
          item.date >= filterStartDate && item.date < filterEndDate
        );
      }
    }

    // Now apply data type filter for display
    let displayFiltered = [...dateFiltered];
    if (dataType !== 'all') {
      displayFiltered = displayFiltered.filter(item => item.type === dataType);
    }

    // Sort data
    displayFiltered.sort((a, b) => {
      let compareA, compareB;
      
      switch (sortBy) {
        case 'amount':
          compareA = a.amount;
          compareB = b.amount;
          break;
        case 'type':
          compareA = a.type;
          compareB = b.type;
          break;
        case 'title':
          compareA = a.title.toLowerCase();
          compareB = b.title.toLowerCase();
          break;
        default:
          compareA = a.date;
          compareB = b.date;
      }

      if (sortOrder === 'asc') {
        return compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
      } else {
        return compareA > compareB ? -1 : compareA < compareB ? 1 : 0;
      }
    });

    // Store both date-filtered (for stats) and display-filtered data
    setFilteredData(displayFiltered);
    // Store the date-filtered data separately for summary calculations
    window.dateFilteredData = dateFiltered;
    setCurrentPage(1);
  }, [combinedData, dataType, dateRange, startDate, endDate, sortBy, sortOrder]);

  // Calculate summary statistics based on date-filtered data (not display-filtered)
  const getSummaryStats = () => {
    const dataForStats = window.dateFilteredData || filteredData;
    
    const totalIncome = dataForStats
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const totalExpenses = dataForStats
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const netSavings = totalIncome - totalExpenses;
    
    return {
      totalIncome,
      totalExpenses,
      netSavings,
      totalTransactions: dataForStats.length
    };
  };

  // Export report
  const exportReport = () => {
    const stats = getSummaryStats();
    const dataForExport = window.dateFilteredData || filteredData;
    
    const reportData = [
      'Financial Report',
      '================',
      `Generated on: ${new Date().toLocaleString()}`,
      `Period: ${dateRange === 'custom' ? `${startDate} to ${endDate}` : dateRange}`,
      `Data Type Displayed: ${dataType}`,
      '',
      'SUMMARY (All transactions in selected period)',
      '-------',
      `Total Income: ₹${stats.totalIncome.toFixed(2)}`,
      `Total Expenses: ₹${stats.totalExpenses.toFixed(2)}`,
      `Net Savings: ₹${stats.netSavings.toFixed(2)}`,
      `Total Transactions in Period: ${stats.totalTransactions}`,
      `Displayed Transactions: ${filteredData.length}`,
      '',
      'DETAILED TRANSACTIONS',
      '--------------------',
      ...filteredData.map(item => 
        `${item.date.toLocaleDateString()} | ${item.type.toUpperCase()} | ₹${item.amount.toFixed(2)} | ${item.title} | ${item.description}`
      )
    ].join('\n');

    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' });
    const filename = `financial_report_${dataType}_${dateRange}_${new Date().toISOString().split('T')[0]}.txt`;
    saveAs(blob, filename);
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle date range change
  const handleDateRangeChange = (value) => {
    setDateRange(value);
    if (value !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  if (loading) {
    return (
      <div className={`financial-reports-container ${theme}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`financial-reports-container ${theme}`}>
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  const stats = getSummaryStats();

  return (
    <div className={`financial-reports-container ${theme}`}>
      <div className="reports-header">
        <h1>Financial Reports</h1>
        <p>Comprehensive view of your income and expenses</p>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-row">
          <div className="filter-group">
            <label>Data Type:</label>
            <select value={dataType} onChange={(e) => setDataType(e.target.value)}>
              <option value="all">All Transactions</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Time Period:</label>
            <select value={dateRange} onChange={(e) => handleDateRangeChange(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="type">Type</option>
              <option value="title">Title</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order:</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {dateRange === 'custom' && (
          <div className="filter-row custom-date-row">
            <div className="filter-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="summary-stats">
        <div className="summary-header">
          <h3>Summary for Selected Period</h3>
          <p className="summary-note">
            {dataType === 'all' 
              ? 'Showing all transactions and complete summary' 
              : `Showing only ${dataType} transactions, but summary includes all transactions for this period`
            }
          </p>
        </div>
        <div className="stats-grid">
          <div className="stat-card income">
            <h3>Total Income</h3>
            <p className="amount">₹{stats.totalIncome.toFixed(2)}</p>
          </div>
          <div className="stat-card expense">
            <h3>Total Expenses</h3>
            <p className="amount">₹{stats.totalExpenses.toFixed(2)}</p>
          </div>
          <div className={`stat-card ${stats.netSavings >= 0 ? 'positive' : 'negative'}`}>
            <h3>Net Savings</h3>
            <p className="amount">₹{stats.netSavings.toFixed(2)}</p>
          </div>
          <div className="stat-card total">
            <h3>Displayed Items</h3>
            <p className="amount">{filteredData.length}</p>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="export-controls">
        <button onClick={exportReport} className="export-button">
          Export Report
        </button>
      </div>

      {/* Data Table */}
      <div className="data-table-container">
        <div className="table-header">
          <h3>
            {dataType === 'all' ? 'All Transactions' : 
             dataType === 'income' ? 'Income Transactions' : 'Expense Transactions'}
            {paginatedData.length > 0 && ` (${filteredData.length} items)`}
          </h3>
        </div>
        {paginatedData.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Title</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={`${item.type}-${item._id}-${index}`} className={item.type}>
                  <td>{item.date.toLocaleDateString()}</td>
                  <td className={`type-badge ${item.type}`}>
                    {item.type === 'income' ? 'Income' : 'Expense'}
                  </td>
                  <td>{item.title}</td>
                  <td className="amount">₹{item.amount.toFixed(2)}</td>
                  <td>{item.description}</td>
                  <td>{item.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>No {dataType === 'all' ? 'transactions' : dataType === 'income' ? 'income records' : 'expense records'} found for the selected criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FinancialReports;
