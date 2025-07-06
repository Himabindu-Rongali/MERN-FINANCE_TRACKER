/**
 * Dashboard Utilities - Helper functions for financial calculations and data processing
 * 
 * This module provides utility functions for:
 * - Date manipulation and validation
 * - Financial calculations
 * - Data transformation
 * - Chart data generation
 * - AI insights generation
 */

/**
 * Validates and parses a date string
 * @param {string} dateString - Date string to validate
 * @returns {Date|null} Valid Date object or null if invalid
 */
export const validateDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date : null;
  } catch (error) {
    console.warn('Invalid date:', dateString);
    return null;
  }
};

/**
 * Safely converts a value to a number
 * @param {any} value - Value to convert
 * @returns {number} Converted number or 0 if invalid
 */
export const safeNumber = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

/**
 * Formats a number as currency with Indian Rupee symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '₹0';
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

/**
 * Calculates financial metrics for a given period
 * @param {Array} transactions - Array of transaction objects
 * @param {Array} incomes - Array of income objects
 * @param {number} year - Year to calculate for
 * @param {number} month - Month to calculate for (optional)
 * @returns {Object} Financial metrics object
 */
export const calculateFinancialMetrics = (transactions = [], incomes = [], year, month = null) => {
  const filteredTransactions = transactions.filter(t => {
    const date = validateDate(t.date);
    if (!date) return false;
    
    if (month !== null) {
      return date.getFullYear() === year && date.getMonth() === month;
    }
    return date.getFullYear() === year;
  });

  const filteredIncomes = incomes.filter(i => {
    const date = validateDate(i.date);
    if (!date) return false;
    
    if (month !== null) {
      return date.getFullYear() === year && date.getMonth() === month;
    }
    return date.getFullYear() === year;
  });

  const totalExpenses = filteredTransactions.reduce((sum, t) => sum + safeNumber(t.amount), 0);
  const totalIncome = filteredIncomes.reduce((sum, i) => sum + safeNumber(i.amount), 0);
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return {
    totalExpenses,
    totalIncome,
    netBalance,
    savingsRate,
    transactionCount: filteredTransactions.length,
    incomeCount: filteredIncomes.length
  };
};

/**
 * Groups transactions by category
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Object with category as key and total amount as value
 */
export const groupTransactionsByCategory = (transactions = []) => {
  return transactions.reduce((acc, transaction) => {
    const category = (transaction.category || 'Unknown').toLowerCase().trim();
    const amount = safeNumber(transaction.amount);
    
    if (category) {
      acc[category] = (acc[category] || 0) + amount;
    }
    
    return acc;
  }, {});
};

/**
 * Generates monthly expense data for a given year
 * @param {Array} transactions - Array of transaction objects
 * @param {number} year - Year to generate data for
 * @returns {Array} Array of monthly totals (12 elements)
 */
export const generateMonthlyData = (transactions = [], year) => {
  const monthlyData = new Array(12).fill(0);
  
  transactions.forEach(transaction => {
    const date = validateDate(transaction.date);
    if (date && date.getFullYear() === year) {
      const month = date.getMonth();
      monthlyData[month] += safeNumber(transaction.amount);
    }
  });
  
  return monthlyData;
};

/**
 * Generates AI-powered financial insights
 * @param {Object} financialMetrics - Financial metrics object
 * @param {Object} categoryData - Category breakdown data
 * @returns {Array} Array of insight objects
 */
export const generateAIInsights = (financialMetrics, categoryData) => {
  const insights = [];
  const { totalExpenses, totalIncome, savingsRate, netBalance } = financialMetrics;

  // Savings rate analysis
  if (savingsRate > 20) {
    insights.push({
      type: 'success',
      title: 'Excellent Savings Rate',
      description: `Your savings rate of ${savingsRate.toFixed(1)}% is excellent! You're building a strong financial foundation.`,
      priority: 'high'
    });
  } else if (savingsRate > 10) {
    insights.push({
      type: 'info',
      title: 'Good Savings Progress',
      description: `Your savings rate of ${savingsRate.toFixed(1)}% is good. Consider increasing it to 20% for better financial security.`,
      priority: 'medium'
    });
  } else if (savingsRate > 0) {
    insights.push({
      type: 'warning',
      title: 'Low Savings Rate',
      description: `Your savings rate of ${savingsRate.toFixed(1)}% is below recommended levels. Try to reduce expenses or increase income.`,
      priority: 'high'
    });
  } else {
    insights.push({
      type: 'danger',
      title: 'Negative Savings',
      description: 'You\'re spending more than you earn. Consider reviewing your expenses and creating a budget.',
      priority: 'critical'
    });
  }

  // Category analysis
  const categories = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);
  if (categories.length > 0) {
    const topCategory = categories[0];
    const topCategoryPercentage = (topCategory[1] / totalExpenses) * 100;
    
    if (topCategoryPercentage > 40) {
      insights.push({
        type: 'warning',
        title: 'High Category Concentration',
        description: `${topCategory[0]} accounts for ${topCategoryPercentage.toFixed(1)}% of your expenses. Consider diversifying your spending.`,
        priority: 'medium'
      });
    }
  }

  // Monthly spending pattern
  if (totalExpenses > 0) {
    const avgDailyExpense = totalExpenses / 30;
    insights.push({
      type: 'info',
      title: 'Daily Spending Average',
      description: `Your average daily spending is ${formatCurrency(avgDailyExpense)}. Monitor this to stay within budget.`,
      priority: 'low'
    });
  }

  return insights.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

/**
 * Generates chart colors based on theme
 * @param {string} theme - Current theme ('light' or 'dark')
 * @param {number} count - Number of colors needed
 * @returns {Array} Array of color strings
 */
export const generateChartColors = (theme, count) => {
  const lightColors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
  ];
  
  const darkColors = [
    '#43e97b', '#38f9d7', '#667eea', '#764ba2',
    '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
    '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
  ];
  
  const colors = theme === 'dark' ? darkColors : lightColors;
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

/**
 * Validates year range for comparison
 * @param {string} startYear - Start year string
 * @param {string} endYear - End year string
 * @returns {Object} Validation result with isValid and message
 */
export const validateYearRange = (startYear, endYear) => {
  const start = parseInt(startYear);
  const end = parseInt(endYear);
  const currentYear = new Date().getFullYear();
  
  if (isNaN(start) || isNaN(end)) {
    return {
      isValid: false,
      message: 'Please enter valid years'
    };
  }
  
  if (start > end) {
    return {
      isValid: false,
      message: 'Start year cannot be greater than end year'
    };
  }
  
  if (end > currentYear) {
    return {
      isValid: false,
      message: 'End year cannot be in the future'
    };
  }
  
  if (end - start > 10) {
    return {
      isValid: false,
      message: 'Year range cannot exceed 10 years'
    };
  }
  
  return {
    isValid: true,
    message: 'Valid year range'
  };
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
};

export default {
  validateDate,
  safeNumber,
  formatCurrency,
  calculateFinancialMetrics,
  groupTransactionsByCategory,
  generateMonthlyData,
  generateAIInsights,
  generateChartColors,
  validateYearRange,
  debounce,
  deepClone
};
