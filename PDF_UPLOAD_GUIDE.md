# PDF Transaction History Upload Guide

## Overview
The finance app now supports bulk upload of transaction history from PDF files. This feature allows users to import multiple transactions at once from their bank statements or financial documents.

## Features
- **PDF Upload**: Upload transaction history from PDF files
- **Intelligent Extraction**: AI-powered extraction of tabular transaction data
- **Data Validation**: Automatic validation of extracted transaction data
- **Preview & Select**: Review extracted transactions before importing
- **Bulk Save**: Save multiple transactions to the database at once
- **Error Handling**: Comprehensive error handling for invalid data

## How to Use

### Step 1: Access Bulk Upload
1. Navigate to the Dashboard
2. Click the "📄 Bulk Upload" button in the header
3. Or go directly to `/bulk-upload` route

### Step 2: Upload PDF
1. Drag and drop your PDF file into the upload area
2. Or click to browse and select your PDF file
3. Supported formats: PDF files only
4. Maximum file size: 10MB
5. Wait for the AI to extract transaction data

### Step 3: Review Transactions
1. Review the extracted transactions in the preview table
2. Check the summary information (total amount, date range, categories)
3. Select/deselect transactions you want to import
4. Use "Select All" to toggle all transactions
5. Invalid transactions will be shown separately with error details

### Step 4: Save Transactions
1. Click "Save X Transactions" to import selected transactions
2. Transactions will be saved to your account
3. You'll be redirected to the dashboard to view imported data

## PDF Format Requirements

### Supported PDF Formats
- Bank statements with transaction tables
- Financial reports with transaction data
- Expense reports with itemized transactions
- Any PDF containing tabular transaction data

### Required Transaction Fields
The AI will attempt to extract the following fields from your PDF:
- **Date**: Transaction date (various formats supported)
- **Amount**: Transaction amount (positive values)
- **Description**: Transaction description or merchant name
- **Category**: Transaction category (auto-categorized)
- **Payment Type**: Payment method (Cash, Credit Card, etc.)

### Sample PDF Structure
Your PDF should contain data in a tabular format like:
```
Date        Amount    Description           Category    Payment Type
2024-01-15  $25.50   Coffee Shop          Food        Credit Card
2024-01-16  $120.00  Grocery Store        Groceries   Debit Card
2024-01-17  $45.00   Gas Station          Transport   Cash
```

## Technical Details

### Backend Processing
- PDF parsing using `pdf-parse` library
- Text extraction and normalization
- AI-powered data extraction using Google Gemini API
- Data validation and error handling
- Bulk database operations

### Frontend Features
- Drag & drop file upload
- Real-time upload progress
- Interactive transaction preview
- Bulk selection controls
- Responsive design with theme support

## Error Handling

### Common Issues
1. **Invalid PDF Format**: Ensure your file is a valid PDF
2. **No Transaction Data**: PDF must contain readable transaction information
3. **File Too Large**: Maximum 10MB file size
4. **Invalid Data**: Some transactions may have missing or invalid fields

### Troubleshooting
- Ensure PDF contains clear, readable text (not scanned images)
- Check that transaction data is in a tabular format
- Verify date formats are recognizable
- Ensure amounts are clearly specified

## API Endpoints

### Upload PDF and Extract Data
```
POST /transactions/upload/upload-pdf-table
Content-Type: multipart/form-data
Body: PDF file
```

### Save Bulk Transactions
```
POST /transactions/upload/save-bulk-transactions
Content-Type: application/json
Body: {
  "transactions": [array of transaction objects],
  "userId": "user-id"
}
```

## Security Considerations
- PDF files are processed in memory and not stored permanently
- AI processing is done through secure API calls
- Transaction data is validated before database insertion
- User authentication required for all upload operations

## Future Enhancements
- Support for multiple file formats (CSV, Excel)
- Enhanced AI categorization
- Duplicate transaction detection
- Transaction matching with existing data
- Custom field mapping
- Batch processing for large files

## Support
If you encounter issues with PDF upload:
1. Check that your PDF contains readable text
2. Ensure transaction data is in a clear tabular format
3. Verify file size is under 10MB
4. Contact support if problems persist

---
*Last updated: January 2025*
