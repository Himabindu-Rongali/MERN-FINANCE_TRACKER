import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import './TransactionList.css';

const TransactionList = ({ transactions, deleteTransaction }) => {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewedTransaction, setViewedTransaction] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to download transaction
  const downloadTransaction = (transaction) => {
    // Format the date in a readable format
    const formattedDate = new Date(transaction.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    // Create transaction data in a readable format
    const transactionData = `
Transaction Receipt
------------------
Amount: ₹${transaction.amount}
Category: ${transaction.category}
Date: ${formattedDate}
Description: ${transaction.description || 'N/A'}
Payment Method: ${transaction.paymentMethod || 'N/A'}
Transaction ID: ${transaction._id}
------------------
Personal Finance Manager
Receipt generated on ${new Date().toLocaleString('en-IN')}
    `.trim();
    
    // Create a Blob with the transaction data
    const blob = new Blob([transactionData], { type: 'text/plain;charset=utf-8' });
    
    // Generate a filename with the transaction category and date
    const filename = `transaction_${transaction.category.replace(/\s+/g, '_').toLowerCase()}_${formattedDate.replace(/\s+/g, '_')}.txt`;
    
    // Save the file
    saveAs(blob, filename);
  };

  // Simulate loading effect when filters change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedYear, selectedMonth, selectedCategory, selectedPaymentMethod, sortBy, sortOrder]);

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete._id);
      setTransactionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setTransactionToDelete(null);
  };

  const uniqueYears = Array.from(
    new Set(transactions.map((tx) => new Date(tx.date).getFullYear()))
  ).sort((a, b) => b - a);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // ✅ Normalize categories (trim + lowercase for deduplication)
  const categoryMap = new Map();
  transactions.forEach((tx) => {
    const original = tx.category?.trim();
    const normalized = original?.toLowerCase();
    if (original && !categoryMap.has(normalized)) {
      categoryMap.set(normalized, original);
    }
  });
  const uniqueCategories = Array.from(categoryMap.values()).sort((a, b) => a.localeCompare(b));

  // ✅ Normalize payment methods (trim + lowercase for deduplication)
  const paymentMethodMap = new Map();
  transactions.forEach((tx) => {
    const original = (tx.paymentMethod || 'N/A').trim();
    const normalized = original.toLowerCase();
    if (!paymentMethodMap.has(normalized)) {
      paymentMethodMap.set(normalized, original);
    }
  });
  const uniquePaymentMethods = Array.from(paymentMethodMap.values()).sort((a, b) => a.localeCompare(b));

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setSelectedMonth('');
  };

  const handleMonthChange = (e) => setSelectedMonth(e.target.value);
  const handleCategoryChange = (e) => setSelectedCategory(e.target.value);
  const handlePaymentMethodChange = (e) => setSelectedPaymentMethod(e.target.value);
  const handleSortByChange = (e) => setSortBy(e.target.value);
  const handleSortOrderChange = (e) => setSortOrder(e.target.value);

  const filteredTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    const txYear = txDate.getFullYear().toString();
    const txMonth = txDate.getMonth().toString();
    const txCategory = tx.category?.trim().toLowerCase();
    const txPaymentMethod = (tx.paymentMethod || 'N/A').trim().toLowerCase();

    return (
      (!selectedYear || txYear === selectedYear) &&
      (!selectedMonth || txMonth === selectedMonth) &&
      (!selectedCategory || txCategory === selectedCategory.trim().toLowerCase()) &&
      (!selectedPaymentMethod || txPaymentMethod === selectedPaymentMethod.trim().toLowerCase())
    );
  });

  const sortedTransactions = filteredTransactions.sort((a, b) => {
    let compareA, compareB;
    if (sortBy === 'amount') {
      compareA = a.amount;
      compareB = b.amount;
    } else if (sortBy === 'category') {
      compareA = a.category?.toLowerCase();
      compareB = b.category?.toLowerCase();
    } else if (sortBy === 'paymentMethod') {
      compareA = (a.paymentMethod || '').toLowerCase();
      compareB = (b.paymentMethod || '').toLowerCase();
    } else {
      compareA = new Date(a.date);
      compareB = new Date(b.date);
    }

    return sortOrder === 'asc'
      ? compareA < compareB ? -1 : compareA > compareB ? 1 : 0
      : compareA > compareB ? -1 : compareA < compareB ? 1 : 0;
  });

  return (
    <div className="transaction-list-container">
      <h2 className="transaction-header">Transaction History</h2>
      <div className="transaction-summary">
        <span>Total Transactions: <strong>{transactions.length}</strong></span>
        <span>Filtered Transactions: <strong>{sortedTransactions.length}</strong></span>
      </div>
      
      <div className="filter-container">
        <select value={selectedYear} onChange={handleYearChange} className="year-dropdown">
          <option value="">Select Year</option>
          {uniqueYears.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        {selectedYear && (
          <>
            <select value={selectedMonth} onChange={handleMonthChange} className="month-dropdown">
              <option value="">All Months</option>
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>

            <select value={selectedCategory} onChange={handleCategoryChange} className="category-dropdown">
              <option value="">Select Category</option>
              {uniqueCategories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>

            <select value={selectedPaymentMethod} onChange={handlePaymentMethodChange} className="payment-method-dropdown">
              <option value="">Select Payment Method</option>
              {uniquePaymentMethods.map((method, index) => (
                <option key={index} value={method}>{method}</option>
              ))}
            </select>
          </>
        )}

        <div className="sort-container">
          <select value={sortBy} onChange={handleSortByChange} className="sort-dropdown">
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>

          <select value={sortOrder} onChange={handleSortOrderChange} className="order-dropdown">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading transactions...</p>
        </div>
      ) : (
        <ul className="transaction-list">
          {sortedTransactions.length > 0 ? (
            sortedTransactions.map((transaction) => (
              <li key={transaction._id} className="transaction-item">
                <div className="transaction-details">
                  <span className="transaction-amount">₹{transaction.amount}</span>
                  <span className="transaction-category">{transaction.category}</span>
                  <span className="transaction-date">{new Date(transaction.date).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                </div>
                <div className="transaction-actions">
                  <button
                    onClick={() => setViewedTransaction(transaction)}
                    className="view-details-button"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDeleteClick(transaction)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                  
                </div>
              </li>
            ))
          ) : (
            <div className="no-transaction-message">
              <p>No transactions found for the selected filters.</p>
              {(selectedYear || selectedMonth || selectedCategory || selectedPaymentMethod) && (
                <button onClick={() => {
                  setSelectedYear('');
                  setSelectedMonth('');
                  setSelectedCategory('');
                  setSelectedPaymentMethod('');
                }} className="reset-filters-button">
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </ul>
      )}      {/* Details Modal/Section */}
      {viewedTransaction && (
        <div className="transaction-modal">
          <div className="modal-content">
            <h3>Transaction Details</h3>
            <p><strong>Amount:</strong> ₹{viewedTransaction.amount}</p>
            <p><strong>Category:</strong> {viewedTransaction.category}</p>
            <p><strong>Date:</strong> {new Date(viewedTransaction.date).toLocaleString()}</p>
            <p><strong>Description:</strong> {viewedTransaction.description || 'N/A'}</p>
            <p><strong>Payment Method:</strong> {viewedTransaction.paymentMethod || 'N/A'}</p>
            <div className="modal-buttons">
              <button 
                onClick={() => downloadTransaction(viewedTransaction)} 
                className="download-button"
              >
                Download Receipt
              </button>
              <button 
                onClick={() => setViewedTransaction(null)} 
                className="close-modal-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {transactionToDelete && (
        <div className="transaction-modal">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this transaction?</p>
            <p><strong>Amount:</strong> ₹{transactionToDelete.amount}</p>
            <p><strong>Category:</strong> {transactionToDelete.category}</p>
            <p><strong>Date:</strong> {new Date(transactionToDelete.date).toLocaleDateString()}</p>
            <div className="confirmation-buttons">
              <button onClick={confirmDelete} className="confirm-button">
                Yes, Delete
              </button>
              <button onClick={cancelDelete} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;