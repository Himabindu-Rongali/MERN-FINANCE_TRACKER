/**
 * TransactionForm Component - Add and manage financial transactions
 * 
 * Features:
 * - Manual transaction entry with validation
 * - OCR-powered receipt scanning (images and PDFs)
 * - Drag & drop file upload
 * - Real-time form validation
 * - Responsive design with theme support
 * 
 * @param {Object} props - Component props
 * @param {Function} props.refreshTransactions - Callback to refresh transaction list
 * @param {Function} props.handleAddTransaction - Callback for successful transaction addition
 * @returns {JSX.Element} TransactionForm component
 */
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from './ThemeContext';
import './TransactionForm.css';

const TransactionForm = ({ refreshTransactions, handleAddTransaction }) => {
  // Form state management
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  // File upload state
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [extractionSuccess, setExtractionSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Form validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  /**
   * Navigate back to dashboard
   */
  const handleBack = () => {
    navigate('/');
  };

  /**
   * Validate form fields before submission
   * @returns {boolean} True if form is valid
   */
  const validateForm = () => {
    const errors = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    
    if (!category.trim()) {
      errors.category = 'Category is required';
    }
    
    if (!date) {
      errors.date = 'Date is required';
    }
    
    if (!paymentMethod) {
      errors.paymentMethod = 'Payment method is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission with validation and error handling
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const newTransaction = { 
      amount: parseFloat(amount), 
      category: category.trim(), 
      date, 
      description: description.trim(), 
      paymentMethod 
    };

    try {
      await axios.post('http://localhost:5000/transactions', newTransaction);
      
      // Success - reset form and notify parent
      setAmount('');
      setCategory('');
      setDate('');
      setDescription('');
      setPaymentMethod('');
      setValidationErrors({});
      
      if (handleAddTransaction) {
        handleAddTransaction();
      }
      
      if (refreshTransactions) {
        refreshTransactions();
      }
      
    } catch (error) {
      console.error('Error adding transaction:', error);
      setValidationErrors({
        submit: error.response?.data?.message || 'Failed to add transaction. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle file upload and OCR processing
   * Supports images and PDFs with automatic data extraction
   */
  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    // File validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    
    if (uploadedFile.size > maxSize) {
      setUploadError('File size must be less than 10MB');
      setTimeout(() => setUploadError(''), 5000);
      return;
    }
    
    if (!allowedTypes.includes(uploadedFile.type)) {
      setUploadError('Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed');
      setTimeout(() => setUploadError(''), 5000);
      return;
    }
    
    setFile(uploadedFile);
    setUploading(true);
    setUploadError('');
    setExtractionSuccess(false);
    
    const formData = new FormData();
    formData.append('file', uploadedFile);
    
    try {
      const res = await axios.post('http://localhost:5000/transactions/upload/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30 second timeout
      });
      
      // Process extracted data
      const extractedData = res.data;
      
      // Populate form fields with extracted data
      if (extractedData.amount && !isNaN(parseFloat(extractedData.amount))) {
        setAmount(extractedData.amount.toString());
      }
      
      if (extractedData.category) {
        setCategory(extractedData.category.trim());
      }
      
      // Handle date parsing with better error handling
      if (extractedData.date) {
        const parsedDate = parseExtractedDate(extractedData.date);
        if (parsedDate) {
          setDate(parsedDate);
        }
      }
      
      if (extractedData.description) {
        setDescription(extractedData.description.trim());
      }
      
      if (extractedData.paymentMethod) {
        setPaymentMethod(extractedData.paymentMethod);
      }
      
      setExtractionSuccess(true);
      setTimeout(() => setExtractionSuccess(false), 5000);

    } catch (err) {
      console.error('OCR extraction error:', err);
      setUploadError(
        err.response?.data?.message || 
        err.code === 'ECONNABORTED' ? 'Upload timeout - please try again' :
        'Failed to extract transaction data from document. Please try again.'
      );
      setTimeout(() => setUploadError(''), 5000);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Parse extracted date string to YYYY-MM-DD format
   * @param {string} dateString - Date string from OCR
   * @returns {string|null} Formatted date or null if invalid
   */
  const parseExtractedDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      // Try direct parsing first
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
      }
      
      // Try parsing common formats
      const formats = [
        /(\d{4})[-/](\d{2})[-/](\d{2})/,  // YYYY-MM-DD or YYYY/MM/DD
        /(\d{2})[-/](\d{2})[-/](\d{4})/,  // MM-DD-YYYY or MM/DD/YYYY
        /(\d{2})[-/](\d{2})[-/](\d{2})/   // MM-DD-YY or MM/DD/YY
      ];
      
      for (const format of formats) {
        const match = dateString.match(format);
        if (match) {
          let [, part1, part2, part3] = match;
          
          // Handle different date formats
          if (part3.length === 4) {
            // Format: MM-DD-YYYY
            const testDate = new Date(part3, part1 - 1, part2);
            if (!isNaN(testDate.getTime())) {
              return testDate.toISOString().slice(0, 10);
            }
          } else if (part1.length === 4) {
            // Format: YYYY-MM-DD
            const testDate = new Date(part1, part2 - 1, part3);
            if (!isNaN(testDate.getTime())) {
              return testDate.toISOString().slice(0, 10);
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Date parsing error:', error);
      return null;
    }
  };

  /**
   * Handle drag and drop file upload
   * Provides visual feedback and file validation
   */
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
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      
      if (allowedTypes.includes(file.type)) {
        // Create synthetic event for existing upload handler
        const syntheticEvent = {
          target: {
            files: [file]
          }
        };
        handleFileUpload(syntheticEvent);
      } else {
        setUploadError('Please upload only images (JPEG, PNG, GIF, WebP) or PDF files.');
        setTimeout(() => setUploadError(''), 5000);
      }
    }
  };

  /**
   * Remove uploaded file and reset related state
   */
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

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`transaction-form-container ${theme}`}>
      {/* Back navigation */}
      <span 
        onClick={handleBack} 
        style={{ 
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontSize: '24px',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        title="Back to Dashboard"
      >
        &#x2190; {/* Left arrow character */}
      </span>
      
      <h2 className="form-section-title">Add New Transaction</h2>
      
      {/* Global form error */}
      {validationErrors.submit && (
        <div className="form-error">
          <div>❌</div>
          <div>{validationErrors.submit}</div>
        </div>
      )}
      
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

        {/* Amount Field */}
        <label>
          Amount: *
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="Enter amount"
            min="0"
            step="0.01"
            className={validationErrors.amount ? 'error' : ''}
          />
          {validationErrors.amount && (
            <span className="field-error">{validationErrors.amount}</span>
          )}
        </label>

        {/* Category Field */}
        <label>
          Category: *
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            placeholder="e.g., Groceries, Utilities, Entertainment"
            className={validationErrors.category ? 'error' : ''}
          />
          {validationErrors.category && (
            <span className="field-error">{validationErrors.category}</span>
          )}
        </label>

        {/* Date Field */}
        <label>
          Date: *
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={validationErrors.date ? 'error' : ''}
          />
          {validationErrors.date && (
            <span className="field-error">{validationErrors.date}</span>
          )}
        </label>

        {/* Description Field */}
        <label>
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description (optional)"
            maxLength="200"
          />
        </label>

        {/* Payment Method Dropdown */}
        <label>
          Payment Method: *
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
            className={validationErrors.paymentMethod ? 'error' : ''}
          >
            <option value="">Select Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="Online Payment">Online Payment</option>
          </select>
          {validationErrors.paymentMethod && (
            <span className="field-error">{validationErrors.paymentMethod}</span>
          )}
        </label>
        
        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="add-transaction-btn"
            disabled={isSubmitting || uploading}
          >
            <span className="btn-icon">💳</span>
            {isSubmitting ? 'Adding Transaction...' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;