import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from './ThemeContext';
import './TransactionForm.css';

const TransactionForm = ({ refreshTransactions, handleAddTransaction }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');  // State for payment method
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [extractionSuccess, setExtractionSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

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

  // Handle file upload and auto-fill fields
  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    setUploading(true);
    setUploadError('');
    setExtractionSuccess(false);
    
    const formData = new FormData();
    formData.append('file', uploadedFile);
    
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
      
      setExtractionSuccess(true);
      setTimeout(() => setExtractionSuccess(false), 5000);

      // Do not call handleAddTransaction or refreshTransactions here
      // The user will review and click "Add Transaction" to save

    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to extract transaction from document.');
      setTimeout(() => setUploadError(''), 5000);
    }
    setUploading(false);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        // Create a synthetic event to reuse the existing upload logic
        const syntheticEvent = {
          target: {
            files: [file]
          }
        };
        handleFileUpload(syntheticEvent);
      } else {
        setUploadError('Please upload only images or PDF files.');
        setTimeout(() => setUploadError(''), 5000);
      }
    }
  };

  // Remove file
  const handleRemoveFile = () => {
    setFile(null);
    setExtractionSuccess(false);
    setUploadError('');
    // Clear the file input
    const fileInput = document.querySelector('.file-upload-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`transaction-form-container ${theme}`}>
      <span 
        onClick={handleBack} 
        style={{ 
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontSize: '24px',
          cursor: 'pointer' 
        }}
      >
        &#x2190; {/* Left arrow character */}
      </span>
      <h2 className="form-section-title">Add New Transaction</h2>
      <form onSubmit={handleSubmit} className="transaction-form">
        {/* Enhanced File upload for OCR */}
        <div 
          className={`file-upload-container ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="file-upload-icon">📄</div>
          <div className="file-upload-text">
            {file ? 'Change Document' : 'Upload Receipt or Document'}
          </div>
          <div className="file-upload-subtext">
            Drag & drop or click to browse • Images & PDFs • Max 10MB
          </div>
          <input 
            type="file" 
            accept="image/*,.pdf" 
            onChange={handleFileUpload} 
            disabled={uploading}
            className="file-upload-input"
          />
          {!file && (
            <div className="file-upload-button">
              Choose File
            </div>
          )}
        </div>

        {/* File Preview */}
        {file && !uploading && (
          <div className="file-preview">
            <div className="file-preview-icon">
              {file.type.startsWith('image/') ? '🖼️' : '📄'}
            </div>
            <div className="file-preview-info">
              <div className="file-preview-name">{file.name}</div>
              <div className="file-preview-size">{formatFileSize(file.size)}</div>
            </div>
            <button 
              type="button" 
              onClick={handleRemoveFile}
              className="file-preview-remove"
              title="Remove file"
            >
              ×
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="upload-progress">
            <div className="upload-spinner"></div>
            <div>Extracting transaction data from document...</div>
          </div>
        )}

        {/* Success Message */}
        {extractionSuccess && (
          <div className="extraction-success">
            <div>✅</div>
            <div>Transaction data extracted successfully! Please review and confirm the details below.</div>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="upload-error">
            <div>❌</div>
            <div>{uploadError}</div>
          </div>
        )}

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