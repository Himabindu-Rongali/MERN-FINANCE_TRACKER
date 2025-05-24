const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Import auth middleware

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// POST /transactions/upload-image: Upload image and auto-add transaction
router.post('/upload-image', authMiddleware, upload.single('image'), async (req, res) => { // Protect with authMiddleware
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  try {
    // Revert to Tesseract.js OCR
    const { data: { text: ocrText } } = await Tesseract.recognize(
      req.file.path,
      'eng',
      // { logger: m => console.log(m) } // Optional: remove or keep logger
    );
    const text = ocrText; // Assign to text variable
    console.log('OCR result:', text);

    // Flexible parsing logic
    let amountMatch = text.match(/Amount\D{0,3}(\d+[\d.,]*)/i);
    if (!amountMatch) amountMatch = text.match(/(\d+[\d.,]*)/); // fallback

    let dateMatch = text.match(/Date\D{0,3}:?\s*([\d\/-]{6,}|[A-Za-z]{3,9} \d{1,2},? \d{4})/i);
    if (!dateMatch) dateMatch = text.match(/(\d{4}[-/]\d{2}[-/]\d{2})/);
    if (!dateMatch) dateMatch = text.match(/(\d{2}[-/]\d{2}[-/]\d{4})/);
    if (!dateMatch) dateMatch = text.match(/([A-Za-z]{3,9} \d{1,2},? \d{4})/);

    // Try to extract description with more flexible keywords - VALUE IN GROUP 1
    let descriptionMatch = text.match(/(?:Description|Desc|Item|Details)\s*[:\-]?\s*([^\n]+)/i);
    if (!descriptionMatch) {
      const lines = text.split('\n').map(l => l.trim());
      const probableDescriptionLine = lines.find(
        l => l && !l.match(/Amount|Date|Cash|Card|Online|Category|Payment|Type|Total|Qty|Price|Gst|Tax|Invoice|Bill/i)
      );
      if (probableDescriptionLine) {
        descriptionMatch = [null, probableDescriptionLine]; // Simulate a match structure
      }
    }

    // Try to extract payment method with more flexible keywords - VALUE IN GROUP 1
    let paymentMethodMatch = text.match(/(?:Payment\s*(?:Type|Method)?|Paid\s*By|Mode)\s*[:\-]?\s*(Cash|Card|Online|UPI|Credit|Debit|Netbanking|Wallet)/i);
    if (!paymentMethodMatch) {
        // Fallback: ensure value is in group 1
        paymentMethodMatch = text.match(/\b(Cash|Card|Online|UPI|Credit|Debit|Netbanking|Wallet)\b/i);
    }

    // Category regex - VALUE IN GROUP 1
    let categoryMatch = text.match(/Category\s*[:\-]?\s*([^\n]+)/i);
    if (!categoryMatch) {
        categoryMatch = text.match(/cat\w*\s*[:\-]?\s*([^\n]+)/i);
    }
    if (!categoryMatch) { // Default if category is not found
        categoryMatch = [null, 'Other']; 
    }

    // If nothing significant found (adjusting this condition slightly)
    if (!amountMatch && !dateMatch && (!descriptionMatch || !descriptionMatch[1]) && (!paymentMethodMatch || !paymentMethodMatch[1]) && (!categoryMatch || categoryMatch[1] === 'Other')) {
      fs.unlinkSync(req.file.path);
      return res.status(422).json({
        message: 'Could not extract transaction fields from image.',
        ocrText: text
      });
    }

    // Improved cleaning function: only trim whitespace
    const cleanField = (str) => str ? str.trim() : '';

    // Debug logs
    console.log('Extracted Fields:', {
      amount: amountMatch ? amountMatch[1] : 'N/A',
      date: dateMatch ? dateMatch[1] : 'N/A',
      paymentMethod: paymentMethodMatch ? paymentMethodMatch[1] : 'N/A', 
      category: categoryMatch ? categoryMatch[1] : 'N/A',            
      description: descriptionMatch ? descriptionMatch[1] : 'N/A'      
    });

    // Prepare the extracted data to be sent to the client
    // DO NOT save the transaction here. Only send back the extracted fields.
    const extractedData = {
      amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : '',
      category: categoryMatch ? cleanField(categoryMatch[1]) : 'Other',
      description: descriptionMatch ? cleanField(descriptionMatch[1]) : '',
      date: dateMatch ? dateMatch[1] : '', // Send as string, frontend will parse
      paymentMethod: paymentMethodMatch ? cleanField(paymentMethodMatch[1]) : ''
    };

    fs.unlinkSync(req.file.path); // Clean up the uploaded file
    res.status(200).json(extractedData); // Send only extracted data, not a saved transaction

  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Failed to process image', error: err.message });
  }
});

module.exports = router;
