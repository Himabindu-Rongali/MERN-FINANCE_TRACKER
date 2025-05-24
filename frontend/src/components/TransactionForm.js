import React, { useState, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from './ThemeContext';
import './TransactionForm.css';

const TransactionForm = ({ refreshTransactions, handleAddTransaction }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');  // State for payment method
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { theme } = useContext(ThemeContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTransaction = { amount, category, date, description, paymentMethod };

    try {
      await axios.post('http://localhost:5000/transactions', newTransaction);
      handleAddTransaction();  // Call the function to show success message
      setAmount('');
      setCategory('');
      setDate('');
      setDescription('');
      setPaymentMethod('');  // Reset payment method after submission
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  // Handle image upload and auto-fill fields
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post('http://localhost:5000/transactions/upload/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // The backend now returns only the extracted fields, not a saved transaction
      const extractedData = res.data;
      setAmount(extractedData.amount || '');
      setCategory(extractedData.category || '');
      
      let parsedDate = '';
      if (extractedData.date) {
        // The date from OCR might be in various formats, try parsing robustly
        // First, attempt to create a Date object directly
        const d = new Date(extractedData.date);
        if (!isNaN(d)) {
          parsedDate = d.toISOString().slice(0, 10);
        } else if (typeof extractedData.date === 'string') {
          // Fallback for common formats if direct parsing fails or if it's already YYYY-MM-DD
          const parts = extractedData.date.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
          if (parts) {
            parsedDate = `${parts[1]}-${parts[2]}-${parts[3]}`;
          } else {
            // Add more specific parsing for formats like 'Month DD, YYYY' if needed
            // For now, if it's not YYYY-MM-DD or easily parsable, it might remain empty or invalid
            // console.warn('Could not parse date:', extractedData.date);
          }
        }
      }
      setDate(parsedDate);
      setDescription(extractedData.description || '');
      setPaymentMethod(extractedData.paymentMethod || '');

      // Do not call handleAddTransaction or refreshTransactions here
      // The user will review and click "Add Transaction" to save

    } catch (err) {
      alert('Failed to extract transaction from image.');
    }
    setUploading(false);
  };

  return (
    <div className={`transaction-form-container ${theme}`}>
      <h2 className="form-section-title">Add New Transaction</h2>
      <form onSubmit={handleSubmit} className="transaction-form">
        {/* Image upload for OCR */}
        <label>
          Upload Transaction Image:
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        </label>
        {uploading && <div>Extracting data from image...</div>}

        <label>
          Amount:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="Enter amount"
          />
        </label>

        <label>
          Category:
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            placeholder="e.g., Groceries, Utilities, Entertainment"
          />
        </label>

        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <label>
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description (optional)"
          />
        </label>

        {/* Payment Method Dropdown */}
        <label>
          Payment Method:
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="">Select Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="Online Payment">Online Payment</option>
          </select>
        </label>
        
        <div>
          <button type="submit">Add Transaction</button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;