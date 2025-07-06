/**
 * BulkUpload Component - Upload and process PDF transaction history
 * 
 * Features:
 * - PDF file upload with validation
 * - Tabular data extraction from PDFs
 * - Preview extracted transactions
 * - Bulk save to database
 * - Error handling and validation
 * - Progress tracking
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onTransactionsUploaded - Callback after successful upload
 * @returns {JSX.Element} BulkUpload component
 */
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from './ThemeContext';
import { AuthContext } from '../context/AuthContext';
import './BulkUpload.css';

const BulkUpload = ({ onTransactionsUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Upload, 2: Review, 3: Complete

  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleFileUpload = async (uploadedFile) => {
    if (!uploadedFile) return;

    // Validate file type
    if (uploadedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (uploadedFile.size > maxSize) {
      setError('File size must be less than 10MB.');
      return;
    }

    setFile(uploadedFile);
    setUploading(true);
    setError('');
    setExtractedData(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await axios.post(
        'http://localhost:5000/transactions/upload/upload-pdf-table',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000, // 60 second timeout for PDF processing
        }
      );

      if (response.data.success) {
        setExtractedData(response.data.data);
        setSelectedTransactions(response.data.data.validTransactions.map((_, index) => index));
        setCurrentStep(2);
        setSuccess(`Successfully extracted ${response.data.data.totalFound} transactions from PDF`);
      } else {
        setError('Failed to extract transactions from PDF');
      }
    } catch (err) {
      console.error('PDF upload error:', err);
      setError(
        err.response?.data?.message || 
        err.code === 'ECONNABORTED' ? 'Upload timeout - please try again with a smaller file' :
        'Failed to process PDF. Please ensure it contains readable transaction data.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      handleFileUpload(uploadedFile);
    }
  };

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
      handleFileUpload(files[0]);
    }
  };

  const handleTransactionToggle = (index) => {
    setSelectedTransactions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === extractedData.validTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(extractedData.validTransactions.map((_, index) => index));
    }
  };

  const handleSaveTransactions = async () => {
    if (selectedTransactions.length === 0) {
      setError('Please select at least one transaction to save.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const transactionsToSave = selectedTransactions.map(index => 
        extractedData.validTransactions[index]
      );

      const response = await axios.post(
        'http://localhost:5000/transactions/upload/save-bulk-transactions',
        {
          transactions: transactionsToSave,
          userId: user?._id || user?.id || null // Use authenticated user ID or null for default
        }
      );

      if (response.data.success) {
        setCurrentStep(3);
        setSuccess(`Successfully saved ${response.data.data.savedCount} transactions!`);
        
        // Call the callback to refresh transactions
        if (onTransactionsUploaded) {
          onTransactionsUploaded();
        }
      } else {
        setError('Failed to save transactions');
      }
    } catch (err) {
      console.error('Save transactions error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to save transactions. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStartOver = () => {
    setFile(null);
    setExtractedData(null);
    setSelectedTransactions([]);
    setCurrentStep(1);
    setError('');
    setSuccess('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`bulk-upload-container ${theme}`}>
      <span 
        onClick={handleBack} 
        className="back-button"
        title="Back to Dashboard"
      >
        ← Back
      </span>

      <div className="bulk-upload-header">
        <h2>Bulk Transaction Upload</h2>
        <p>Upload a PDF containing your transaction history to import multiple transactions at once</p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Upload PDF</div>
        </div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Review & Select</div>
        </div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Complete</div>
        </div>
      </div>

      {/* Step 1: Upload */}
      {currentStep === 1 && (
        <div className="upload-section">
          <div 
            className={`upload-dropzone ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-icon">📄</div>
            <div className="upload-text">
              {uploading ? 'Processing PDF...' : 'Upload Transaction History PDF'}
            </div>
            <div className="upload-subtext">
              {uploading ? 'Extracting transaction data from your PDF...' : 'Drag & drop or click to browse • PDF files only • Max 10MB'}
            </div>
            
            {!uploading && (
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="file-input"
              />
            )}
            
            {uploading && (
              <div className="upload-spinner">
                <div className="spinner"></div>
              </div>
            )}
          </div>

          {file && !uploading && (
            <div className="file-info">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Review */}
      {currentStep === 2 && extractedData && (
        <div className="review-section">
          <div className="review-header">
            <h3>Review Extracted Transactions</h3>
            <div className="review-stats">
              <div className="stat">
                <span className="stat-label">Total Found:</span>
                <span className="stat-value">{extractedData.totalFound}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Valid:</span>
                <span className="stat-value">{extractedData.validTransactions.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Invalid:</span>
                <span className="stat-value">{extractedData.invalidTransactions.length}</span>
              </div>
            </div>
          </div>

          {extractedData.summary && (
            <div className="summary-panel">
              <h4>Summary</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Total Amount:</span>
                  <span className="value">{formatCurrency(extractedData.summary.totalAmount)}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Date Range:</span>
                  <span className="value">
                    {extractedData.summary.dateRange.earliest} to {extractedData.summary.dateRange.latest}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Categories:</span>
                  <span className="value">{extractedData.summary.categories.join(', ')}</span>
                </div>
              </div>
            </div>
          )}

          <div className="transactions-list">
            <div className="list-header">
              <div className="select-all">
                <input
                  type="checkbox"
                  checked={selectedTransactions.length === extractedData.validTransactions.length}
                  onChange={handleSelectAll}
                />
                <label>Select All ({selectedTransactions.length} selected)</label>
              </div>
            </div>

            {extractedData.validTransactions.map((transaction, index) => (
              <div 
                key={index} 
                className={`transaction-row ${selectedTransactions.includes(index) ? 'selected' : ''}`}
              >
                <div className="transaction-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.includes(index)}
                    onChange={() => handleTransactionToggle(index)}
                  />
                </div>
                <div className="transaction-details">
                  <div className="transaction-main">
                    <div className="transaction-date">{formatDate(transaction.date)}</div>
                    <div className="transaction-amount">{formatCurrency(transaction.amount)}</div>
                  </div>
                  <div className="transaction-meta">
                    <div className="transaction-category">{transaction.category}</div>
                    <div className="transaction-payment">{transaction.paymentType}</div>
                  </div>
                  {transaction.description && (
                    <div className="transaction-description">{transaction.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {extractedData.invalidTransactions.length > 0 && (
            <div className="invalid-transactions">
              <h4>Invalid Transactions ({extractedData.invalidTransactions.length})</h4>
              <p>These transactions had errors and won't be imported:</p>
              {extractedData.invalidTransactions.map((item, index) => (
                <div key={index} className="invalid-transaction">
                  <div className="invalid-index">Row {item.index}</div>
                  <div className="invalid-errors">{item.errors.join(', ')}</div>
                </div>
              ))}
            </div>
          )}

          <div className="review-actions">
            <button onClick={handleStartOver} className="btn-secondary">
              Start Over
            </button>
            <button 
              onClick={handleSaveTransactions} 
              disabled={saving || selectedTransactions.length === 0}
              className="btn-primary"
            >
              {saving ? 'Saving...' : `Save ${selectedTransactions.length} Transactions`}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {currentStep === 3 && (
        <div className="complete-section">
          <div className="success-icon">✅</div>
          <h3>Upload Complete!</h3>
          <p>Your transactions have been successfully imported.</p>
          <div className="complete-actions">
            <button onClick={handleBack} className="btn-primary">
              View Dashboard
            </button>
            <button onClick={handleStartOver} className="btn-secondary">
              Upload Another PDF
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <div className="error-icon">❌</div>
          <div className="error-text">{error}</div>
        </div>
      )}

      {/* Success Message */}
      {success && currentStep !== 3 && (
        <div className="success-message">
          <div className="success-icon">✅</div>
          <div className="success-text">{success}</div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
