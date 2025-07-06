import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
  LineElement,
  PointElement,
  BarElement,
  Filler
} from 'chart.js';

import { ThemeContext } from './ThemeContext';
import './Dashboard.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
  LineElement,
  PointElement,
  BarElement,
  Filler
);

const Dashboard = ({ transactions }) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const { theme } = useContext(ThemeContext);

  const [incomes, setIncomes] = useState([]);
  const [selectedView, setSelectedView] = useState('withinYear');
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [chartType, setChartType] = useState('line'); // line, bar
  const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year
  const [showComparison, setShowComparison] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  // Year comparison states
  const [startYear, setStartYear] = useState((currentYear - 1).toString());
  const [endYear, setEndYear] = useState(currentYear.toString());

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Fetch income from backend with date conversion to Date object
  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/income');
        const incomeData = res.data.map(income => ({
          ...income,
          date: new Date(income.date),  // Convert string date to Date object
        }));
        setIncomes(incomeData);
      } catch (error) {
        console.error('Error fetching income:', error);
      }
    };

    fetchIncome();
  }, []);

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setSelectedMonth('');
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleStartYearChange = (e) => {
    setStartYear(e.target.value);
  };

  const handleEndYearChange = (e) => {
    setEndYear(e.target.value);
  };

  const yearlyTotals = transactions.reduce((acc, transaction) => {
    const year = new Date(transaction.date).getFullYear();
    acc[year] = (acc[year] || 0) + transaction.amount;
    return acc;
  }, {});

  // Get available years from transactions
  const getAvailableYears = () => {
    const years = new Set();
    transactions.forEach(transaction => {
      const year = new Date(transaction.date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  };

  const availableYears = getAvailableYears();

  const monthlyTotalsForYear = (year) => {
    const monthly = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === parseInt(year)) {
        const month = date.getMonth();
        monthly[month] = (monthly[month] || 0) + transaction.amount;
      }
    });
    return monthly;
  };

  const categoryTotalsForMonth = (year, month) => {
    const categoryTotals = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === parseInt(year) && date.getMonth() === parseInt(month)) {
        const category = transaction.category?.toLowerCase(); // normalize
        if (category) {
          categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
        }
      }
    });
    return categoryTotals;
  };

  

  const selectedMonthExpense = (selectedYear && selectedMonth !== '')
    ? transactions.filter(transaction => {
        const date = new Date(transaction.date);
        return date.getFullYear() === parseInt(selectedYear) && date.getMonth() === parseInt(selectedMonth);
      }).reduce((acc, transaction) => acc + transaction.amount, 0)
    : 0;

  const selectedMonthIncome = (selectedYear && selectedMonth !== '')
    ? incomes.filter(income => {
        const date = income.date;
        return date.getFullYear() === parseInt(selectedYear) && date.getMonth() === parseInt(selectedMonth);
      }).reduce((acc, income) => acc + income.amount, 0)
    : 0;  // Chart options based on theme
  const getChartOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          ticks: {
            color: theme === 'dark' ? '#e6e6e6' : '#333',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          ticks: {
            color: theme === 'dark' ? '#e6e6e6' : '#333',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: theme === 'dark' ? '#e6e6e6' : '#333',
            font: {
              size: 14,
              weight: 'bold'
            },
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          position: 'nearest',
          backgroundColor: theme === 'dark' ? 'rgba(42, 42, 66, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: theme === 'dark' ? '#e6a070' : '#7f4c47',
          bodyColor: theme === 'dark' ? '#e6e6e6' : '#333',
          borderColor: theme === 'dark' ? '#444460' : '#ddd',
          borderWidth: 1,
          padding: 12,
          titleFont: {
            size: 16,
            weight: 'bold'
          },
          bodyFont: {
            size: 14
          },
          displayColors: true,
          boxPadding: 5,
          cornerRadius: 8,
          caretSize: 8,
          caretPadding: 10,
          animation: {
            duration: 200
          },
          external: function(context) {
            // Custom tooltip positioning if needed
            const tooltipEl = context.tooltip;
            if (tooltipEl.opacity === 0) {
              return;
            }
            // Ensure tooltip is visible
            if (tooltipEl.dataPoints && tooltipEl.dataPoints.length > 0) {
              tooltipEl.displayColors = true;
            }
          },
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return label + ': ₹' + (typeof value === 'number' ? value.toLocaleString() : value);
            }
          }
        }
      }
    };
  };

  // Pie chart options
  const getPieOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'point',
        intersect: true,
      },
      hover: {
        mode: 'point',
        intersect: true,
      },
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: theme === 'dark' ? '#e6e6e6' : '#333',
            font: {
              size: 14,
              weight: 'bold'
            },
            padding: 15
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: theme === 'dark' ? 'rgba(42, 42, 66, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: theme === 'dark' ? '#e6a070' : '#7f4c47',
          bodyColor: theme === 'dark' ? '#e6e6e6' : '#333',
          borderColor: theme === 'dark' ? '#444460' : '#ddd',
          borderWidth: 1,
          padding: 12,
          titleFont: {
            size: 16,
            weight: 'bold'
          },
          bodyFont: {
            size: 14
          },
          cornerRadius: 8,
          caretSize: 8,
          caretPadding: 10,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return label + ': ₹' + value.toLocaleString() + ' (' + percentage + '%)';
            }
          }
        }
      }
    };
  };

  const yearChartData = {
    labels: Object.keys(yearlyTotals),
    datasets: [{
      label: 'Spending by Year',
      data: Object.values(yearlyTotals),
      fill: false,
      borderColor: '#FF9F40',
      tension: 0.2,
      pointBackgroundColor: theme === 'dark' ? '#2a2a42' : '#fff',
      pointBorderColor: '#FF9F40',
      borderWidth: 2,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: theme === 'dark' ? '#e6a070' : '#fff',
      pointHoverBorderColor: '#FF9F40',
      pointHoverBorderWidth: 3,
      pointRadius: 5,
    }],
  };  const monthChartData = selectedYear ? {
    labels: months,
    datasets: [{
      label: `Spending in ${selectedYear}`,
      data: months.map((_, index) => monthlyTotalsForYear(selectedYear)[index] || 0),
      fill: false,
      borderColor: '#4CAF50',
      tension: 0.2,
      pointBackgroundColor: theme === 'dark' ? '#2a2a42' : '#fff',
      pointBorderColor: '#4CAF50',
      borderWidth: 2,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: theme === 'dark' ? '#e6a070' : '#fff',
      pointHoverBorderColor: '#4CAF50',
      pointHoverBorderWidth: 3,
      pointRadius: 5,
    }],
  } : null;
  const categoryChartData = (selectedYear && selectedMonth !== '') ? (() => {
    const categoryTotals = categoryTotalsForMonth(selectedYear, selectedMonth);
    return {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40', '#FF6F61'],
        borderColor: theme === 'dark' ? '#2a2a42' : '#fff',
        borderWidth: 2,
        hoverBorderColor: theme === 'dark' ? '#e6e6e6' : '#333',
        hoverBorderWidth: 3,
        hoverOffset: 10,
      }]
    };
  })() : null;

  // Get unique categories
  const getUniqueCategories = () => {
    const categories = [...new Set(transactions.map(t => t.category).filter(Boolean))];
    return categories.sort();
  };

  // Get spending by payment method
  const getPaymentMethodTotals = () => {
    const paymentTotals = {};
    transactions.forEach(transaction => {
      const method = transaction.paymentMethod || 'Unknown';
      paymentTotals[method] = (paymentTotals[method] || 0) + transaction.amount;
    });
    return paymentTotals;
  };

  // Get weekly spending for the selected month
  const getWeeklySpending = (year, month) => {
    const weeks = [0, 0, 0, 0, 0]; // Up to 5 weeks
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === parseInt(year) && date.getMonth() === parseInt(month)) {
        const weekOfMonth = Math.ceil(date.getDate() / 7) - 1;
        if (weekOfMonth >= 0 && weekOfMonth < 5) {
          weeks[weekOfMonth] += transaction.amount;
        }
      }
    });
    return weeks;
  };

  // Get daily spending for the selected month
  const getDailySpending = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daily = new Array(daysInMonth).fill(0);
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === parseInt(year) && date.getMonth() === parseInt(month)) {
        const dayOfMonth = date.getDate() - 1;
        daily[dayOfMonth] += transaction.amount;
      }
    });
    return daily;
  };

  // Get top spending categories
  const getTopCategories = (limit = 5) => {
    const categoryTotals = {};
    transactions.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
    });
    
    return Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
  };

  // Advanced Financial Metrics
  const getFinancialMetrics = () => {
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    // Calculate expense velocity (average spending per day)
    const daysSinceFirstTransaction = transactions.length > 0 
      ? Math.ceil((new Date() - new Date(Math.min(...transactions.map(t => new Date(t.date))))) / (1000 * 60 * 60 * 24))
      : 1;
    const expenseVelocity = totalExpenses / daysSinceFirstTransaction;
    
    // Calculate category percentages
    const categoryTotals = {};
    transactions.forEach(t => {
      const category = t.category || 'Uncategorized';
      categoryTotals[category] = (categoryTotals[category] || 0) + t.amount;
    });
    
    const categoryPercentages = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100
      }))
      .sort((a, b) => b.amount - a.amount);
    
    return {
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      savingsRate,
      expenseVelocity,
      categoryPercentages,
      averageTransactionAmount: totalExpenses / transactions.length || 0
    };
  };

  // Seasonal spending analysis
  const getSeasonalSpending = () => {
    const seasons = {
      Winter: { months: [11, 0, 1], total: 0, count: 0 }, // Dec, Jan, Feb
      Spring: { months: [2, 3, 4], total: 0, count: 0 },   // Mar, Apr, May
      Summer: { months: [5, 6, 7], total: 0, count: 0 },   // Jun, Jul, Aug
      Fall: { months: [8, 9, 10], total: 0, count: 0 }     // Sep, Oct, Nov
    };
    
    transactions.forEach(transaction => {
      const month = new Date(transaction.date).getMonth();
      Object.entries(seasons).forEach(([season, data]) => {
        if (data.months.includes(month)) {
          seasons[season].total += transaction.amount;
          seasons[season].count += 1;
        }
      });
    });
    
    return seasons;
  };

  // Get budget recommendations
  const getBudgetRecommendations = () => {
    const metrics = getFinancialMetrics();
    const recommendations = [];
    
    // High spending categories
    const highSpendingCategories = metrics.categoryPercentages.filter(c => c.percentage > 20);
    if (highSpendingCategories.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'High Spending Categories',
        message: `${highSpendingCategories.map(c => c.category).join(', ')} account for ${highSpendingCategories.reduce((sum, c) => sum + c.percentage, 0).toFixed(1)}% of your expenses`
      });
    }
    
    // Low savings rate
    if (metrics.savingsRate < 20) {
      recommendations.push({
        type: 'info',
        title: 'Savings Rate',
        message: `Your savings rate is ${metrics.savingsRate.toFixed(1)}%. Consider aiming for 20% or higher.`
      });
    }
    
    // High expense velocity
    const averageDailySpending = metrics.expenseVelocity;
    if (averageDailySpending > 500) {
      recommendations.push({
        type: 'warning',
        title: 'Daily Spending',
        message: `Your average daily spending is ₹${averageDailySpending.toFixed(0)}. Consider setting daily spending limits.`
      });
    }
    
    return recommendations;
  };

  // Get expense forecast
  const getExpenseForecast = () => {
    const last3Months = transactions.filter(t => {
      const date = new Date(t.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return date >= threeMonthsAgo;
    });
    
    const monthlyAverage = last3Months.reduce((sum, t) => sum + t.amount, 0) / 3;
    const nextMonthForecast = monthlyAverage;
    const next3MonthsForecast = monthlyAverage * 3;
    
    return {
      nextMonth: nextMonthForecast,
      next3Months: next3MonthsForecast,
      basedOnLast3Months: monthlyAverage
    };
  };

  // Enhanced chart colors
  const chartColors = {
    primary: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40', '#FF6F61', '#9966FF', '#FF6699'],
    gradient: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'],
    pastel: ['#FFB6C1', '#87CEEB', '#DDA0DD', '#98FB98', '#F0E68C', '#FFA07A', '#20B2AA', '#87CEFA']
  };

  // Get chart color scheme based on theme
  const getChartColors = (count) => {
    const colors = theme === 'dark' ? chartColors.gradient : chartColors.primary;
    return colors.slice(0, count);
  };

  // Enhanced chart data generators
  const getEnhancedCategoryChart = () => {
    const categoryTotals = selectedYear && selectedMonth !== '' 
      ? categoryTotalsForMonth(selectedYear, selectedMonth)
      : getTopCategories();
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = getChartColors(labels.length);

    const baseData = {
      labels,
      datasets: [{
        label: 'Amount Spent',
        data,
        backgroundColor: colors.map(color => color + '80'),
        borderColor: colors[0],
        borderWidth: 2,
        fill: chartType === 'line' ? false : true,
      }]
    };

    if (chartType === 'bar') {
      return {
        ...baseData,
        datasets: [{
          ...baseData.datasets[0],
          backgroundColor: colors.map(color => color + '80'),
          borderColor: colors,
        }]
      };
    }

    // Default to line chart
    return {
      ...baseData,
      datasets: [{
        ...baseData.datasets[0],
        backgroundColor: colors[0] + '20',
        borderColor: colors[0],
        fill: true,
        tension: 0.3,
      }]
    };
  };

  const getPaymentMethodChart = () => {
    const paymentTotals = getPaymentMethodTotals();
    const labels = Object.keys(paymentTotals);
    const data = Object.values(paymentTotals);
    const colors = getChartColors(labels.length);

    const baseData = {
      labels,
      datasets: [{
        label: 'Amount Spent',
        data,
        backgroundColor: colors.map(color => color + '80'),
        borderColor: colors[0],
        borderWidth: 2,
        fill: chartType === 'line' ? true : false,
      }]
    };

    if (chartType === 'bar') {
      return {
        ...baseData,
        datasets: [{
          ...baseData.datasets[0],
          backgroundColor: colors.map(color => color + '80'),
          borderColor: colors,
        }]
      };
    }

    // Default to line chart
    return {
      ...baseData,
      datasets: [{
        ...baseData.datasets[0],
        backgroundColor: colors[0] + '20',
        borderColor: colors[0],
        fill: true,
        tension: 0.3,
      }]
    };
  };

  const getWeeklyChart = () => {
    if (!selectedYear || selectedMonth === '') return null;
    
    const weeklyData = getWeeklySpending(selectedYear, selectedMonth);
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
    const colors = getChartColors(1);

    return {
      labels,
      datasets: [{
        label: 'Weekly Spending',
        data: weeklyData,
        backgroundColor: colors[0] + '40',
        borderColor: colors[0],
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }]
    };
  };

  const getDailyChart = () => {
    if (!selectedYear || selectedMonth === '') return null;
    
    const dailyData = getDailySpending(selectedYear, selectedMonth);
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const labels = Array.from({length: daysInMonth}, (_, i) => (i + 1).toString());
    const colors = getChartColors(1);

    return {
      labels,
      datasets: [{
        label: 'Daily Spending',
        data: dailyData,
        backgroundColor: colors[0] + '20',
        borderColor: colors[0],
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 1,
        pointHoverRadius: 5,
      }]
    };
  };

  const getComparisonChart = () => {
    const startYearInt = parseInt(startYear);
    const endYearInt = parseInt(endYear);
    
    if (!startYear || !endYear || startYearInt >= endYearInt) {
      return {
        labels: months,
        datasets: []
      };
    }
    
    const startYearData = months.map((_, index) => {
      const monthData = monthlyTotalsForYear(startYear)[index] || 0;
      return monthData;
    });
    
    const endYearData = months.map((_, index) => {
      const monthData = monthlyTotalsForYear(endYear)[index] || 0;
      return monthData;
    });

    const colors = getChartColors(2);

    return {
      labels: months,
      datasets: [
        {
          label: startYear,
          data: startYearData,
          backgroundColor: colors[0] + '40',
          borderColor: colors[0],
          borderWidth: 2,
          fill: false,
          tension: 0.3,
        },
        {
          label: endYear,
          data: endYearData,
          backgroundColor: colors[1] + '40',
          borderColor: colors[1],
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          borderDash: [5, 5],
        }
      ]
    };
  };

  // New advanced chart for seasonal spending
  const getSeasonalChart = () => {
    const seasonalData = getSeasonalSpending();
    const labels = Object.keys(seasonalData);
    const data = Object.values(seasonalData).map(season => season.total);
    const colors = getChartColors(4);

    return {
      labels,
      datasets: [{
        label: 'Seasonal Spending',
        data,
        backgroundColor: colors.map(color => color + '40'),
        borderColor: colors[0],
        borderWidth: 2,
        fill: chartType === 'line' ? true : false,
        tension: chartType === 'line' ? 0.3 : 0,
      }]
    };
  };

  // New chart for financial health metrics
  const getFinancialHealthChart = () => {
    const metrics = getFinancialMetrics();
    const labels = ['Income', 'Expenses', 'Net Savings'];
    const data = [metrics.totalIncome, metrics.totalExpenses, Math.max(0, metrics.netSavings)];
    const colors = ['#4CAF50', '#FF6384', '#36A2EB'];

    return {
      labels,
      datasets: [{
        label: 'Financial Overview',
        data,
        backgroundColor: colors.map(color => color + '40'),
        borderColor: colors,
        borderWidth: 2,
      }]
    };
  };

  return (
    <div className="dashboard-container">
      {/* Enhanced Dashboard Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Financial Dashboard</h1>
        <div className="dashboard-controls">
          <div className="control-group">
            <label>View:</label>
            <select value={selectedView} onChange={(e) => setSelectedView(e.target.value)}>
              <option value="overview">Overview</option>
              <option value="yearly">Yearly Progress</option>
              <option value="withinYear">Within Year</option>
              <option value="comparison">Year Comparison</option>
              <option value="advanced">Advanced Analytics</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Chart Type:</label>
            <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Financial Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Expenses</h3>
            <p>₹{transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</p>
            <small>₹{getFinancialMetrics().expenseVelocity.toFixed(0)}/day average</small>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Savings Rate</h3>
            <p>{getFinancialMetrics().savingsRate.toFixed(1)}%</p>
            <small className={getFinancialMetrics().savingsRate >= 20 ? 'positive' : 'negative'}>
              {getFinancialMetrics().savingsRate >= 20 ? 'Excellent' : 'Needs Improvement'}
            </small>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <h3>Top Category</h3>
            <p>{Object.keys(getTopCategories(1))[0] || 'None'}</p>
            <small>{getFinancialMetrics().categoryPercentages[0]?.percentage.toFixed(1)}% of spending</small>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Monthly Forecast</h3>
            <p>₹{getExpenseForecast().nextMonth.toLocaleString()}</p>
            <small>Based on historical data</small>
          </div>
        </div>
      </div>

      {/* Budget Recommendations */}
      <div className="recommendations-section">
        <h3>💡 Smart Recommendations</h3>
        <div className="recommendations-grid">
          {getBudgetRecommendations().map((rec, index) => (
            <div key={index} className={`recommendation-card ${rec.type}`}>
              <h4>{rec.title}</h4>
              <p>{rec.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Analytics View */}
      {selectedView === 'advanced' && (
        <div className="advanced-analytics">
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Financial Health Overview</h3>
              <div className="chart-wrapper">
                <Bar data={getFinancialHealthChart()} options={getChartOptions()} />
              </div>
            </div>
            
            <div className="chart-card">
              <h3>Seasonal Spending Patterns</h3>
              <div className="chart-wrapper">
                {chartType === 'bar' ? (
                  <Bar data={getSeasonalChart()} options={getChartOptions()} />
                ) : (
                  <Line data={getSeasonalChart()} options={getChartOptions()} />
                )}
              </div>
            </div>
            
            <div className="chart-card full-width">
              <h3>Category Spending Analysis</h3>
              <div className="category-analysis">
                {getFinancialMetrics().categoryPercentages.slice(0, 5).map((cat, index) => (
                  <div key={index} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{cat.category}</span>
                      <span className="category-amount">₹{cat.amount.toLocaleString()}</span>
                    </div>
                    <div className="category-bar">
                      <div 
                        className="category-progress" 
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                    <span className="category-percentage">{cat.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview Dashboard */}
      {selectedView === 'overview' && (
        <div className="overview-dashboard">
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Expenses by Category</h3>
              <div className="chart-wrapper">
                {chartType === 'bar' ? (
                  <Bar data={getEnhancedCategoryChart()} options={getChartOptions()} />
                ) : (
                  <Line data={getEnhancedCategoryChart()} options={getChartOptions()} />
                )}
              </div>
            </div>
            
            <div className="chart-card">
              <h3>Payment Methods</h3>
              <div className="chart-wrapper">
                {chartType === 'bar' ? (
                  <Bar data={getPaymentMethodChart()} options={getChartOptions()} />
                ) : (
                  <Line data={getPaymentMethodChart()} options={getChartOptions()} />
                )}
              </div>
            </div>
            
            <div className="chart-card full-width">
              <h3>Monthly Spending Trend</h3>
              <div className="chart-wrapper">
                <Line data={monthChartData} options={getChartOptions()} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yearly Progress */}
      {selectedView === 'yearly' && (
        <div className="yearly-view">
          <div className="chart-card">
            <h3>Yearly Spending Overview</h3>
            <div className="chart-wrapper">
              {chartType === 'bar' ? (
                <Bar data={yearChartData} options={getChartOptions()} />
              ) : (
                <Line data={yearChartData} options={getChartOptions()} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Year Comparison */}
      {selectedView === 'comparison' && (
        <div className="comparison-view">
          {/* Year Selection for Comparison */}
          <div className="comparison-header">
            <h3>Year-over-Year Comparison</h3>
            <p>Select two years to compare your spending patterns and track financial progress.</p>
          </div>
          
          {availableYears.length === 0 ? (
            <div className="no-data-message">
              <span className="info-icon">📊</span>
              <span>No transaction data available for comparison. Start adding transactions to see year-over-year analysis.</span>
            </div>
          ) : availableYears.length === 1 ? (
            <div className="no-data-message">
              <span className="info-icon">📈</span>
              <span>You have transactions for {availableYears[0]} only. Add transactions for another year to enable comparison.</span>
            </div>
          ) : (
            <>
              <div className="comparison-selectors">
            <div className="selector-group">
              <label>Start Year:</label>
              <select
                className="year-input"
                value={startYear}
                onChange={handleStartYearChange}
              >
                <option value="">Select Start Year</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="selector-group">
              <label>End Year:</label>
              <select
                className="year-input"
                value={endYear}
                onChange={handleEndYearChange}
              >
                <option value="">Select End Year</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Validation Message */}
          {startYear && endYear && parseInt(startYear) >= parseInt(endYear) && (
            <div className="validation-message">
              <span className="error-icon">⚠️</span>
              <span>Start year must be less than end year for comparison.</span>
            </div>
          )}
          
          {/* Comparison Summary */}
          {startYear && endYear && parseInt(startYear) < parseInt(endYear) && (
            <div className="comparison-summary">
              <div className="summary-item">
                <span className="label">{startYear} Total:</span>
                <span className="value">₹{Object.values(monthlyTotalsForYear(startYear)).reduce((sum, val) => sum + val, 0).toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="label">{endYear} Total:</span>
                <span className="value">₹{Object.values(monthlyTotalsForYear(endYear)).reduce((sum, val) => sum + val, 0).toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="label">Difference:</span>
                <span className={`value ${Object.values(monthlyTotalsForYear(endYear)).reduce((sum, val) => sum + val, 0) - Object.values(monthlyTotalsForYear(startYear)).reduce((sum, val) => sum + val, 0) >= 0 ? 'negative' : 'positive'}`}>
                  {Object.values(monthlyTotalsForYear(endYear)).reduce((sum, val) => sum + val, 0) - Object.values(monthlyTotalsForYear(startYear)).reduce((sum, val) => sum + val, 0) >= 0 ? '+' : ''}₹{Math.abs(Object.values(monthlyTotalsForYear(endYear)).reduce((sum, val) => sum + val, 0) - Object.values(monthlyTotalsForYear(startYear)).reduce((sum, val) => sum + val, 0)).toLocaleString()}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Change:</span>
                <span className={`value ${(() => {
                  const startTotal = Object.values(monthlyTotalsForYear(startYear)).reduce((sum, val) => sum + val, 0);
                  const endTotal = Object.values(monthlyTotalsForYear(endYear)).reduce((sum, val) => sum + val, 0);
                  const change = startTotal > 0 ? ((endTotal - startTotal) / startTotal) * 100 : 0;
                  return change >= 0 ? 'negative' : 'positive';
                })()}`}>
                  {(() => {
                    const startTotal = Object.values(monthlyTotalsForYear(startYear)).reduce((sum, val) => sum + val, 0);
                    const endTotal = Object.values(monthlyTotalsForYear(endYear)).reduce((sum, val) => sum + val, 0);
                    const change = startTotal > 0 ? ((endTotal - startTotal) / startTotal) * 100 : 0;
                    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
                  })()}
                </span>
              </div>
            </div>
          )}
          
          <div className="chart-card">
            <h3>Year-over-Year Comparison: {startYear} vs {endYear}</h3>
            <div className="chart-wrapper">
              {chartType === 'bar' ? (
                <Bar data={getComparisonChart()} options={getChartOptions()} />
              ) : (
                <Line data={getComparisonChart()} options={getChartOptions()} />
              )}
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {/* Within Year Progress */}
      {selectedView === 'withinYear' && (
        <>
          {/* Year and Month Selection */}
          <div className="date-selectors">
            <div className="selector-group">
              <label>Year:</label>
              <input
                type="number"
                placeholder="Enter Year (e.g. 2024)"
                className="year-input"
                value={selectedYear}
                onChange={handleYearChange}
              />
            </div>

            {selectedYear && (
              <div className="selector-group">
                <label>Month:</label>
                <select value={selectedMonth} onChange={handleMonthChange} className="month-select">
                  <option value="">Select Month</option>
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Month Summary */}
          {selectedMonth !== '' && (
            <div className="month-summary">
              <div className="summary-item">
                <span className="label">Income:</span>
                <span className="value income">₹{selectedMonthIncome.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="label">Expenses:</span>
                <span className="value expense">₹{selectedMonthExpense.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="label">Net Savings:</span>
                <span className={`value ${selectedMonthIncome - selectedMonthExpense >= 0 ? 'positive' : 'negative'}`}>
                  ₹{(selectedMonthIncome - selectedMonthExpense).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Charts */}
          {selectedYear && (
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Monthly Overview</h3>
                <div className="chart-wrapper">
                  {chartType === 'bar' ? (
                    <Bar data={monthChartData} options={getChartOptions()} />
                  ) : (
                    <Line data={monthChartData} options={getChartOptions()} />
                  )}
                </div>
              </div>

              {selectedMonth !== '' && (
                <>
                  <div className="chart-card">
                    <h3>Category Breakdown</h3>
                    <div className="chart-wrapper">
                      {chartType === 'bar' ? (
                        <Bar data={getEnhancedCategoryChart()} options={getChartOptions()} />
                      ) : (
                        <Line data={getEnhancedCategoryChart()} options={getChartOptions()} />
                      )}
                    </div>
                  </div>
                  
                  <div className="chart-card">
                    <h3>Weekly Spending</h3>
                    <div className="chart-wrapper">
                      <Line data={getWeeklyChart()} options={getChartOptions()} />
                    </div>
                  </div>
                  
                  <div className="chart-card">
                    <h3>Daily Spending</h3>
                    <div className="chart-wrapper">
                      <Line data={getDailyChart()} options={getChartOptions()} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;