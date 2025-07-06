import React, { useState, useEffect, useContext } from 'react';
import { Line, Bar, Pie, Doughnut, Radar, Scatter, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { ThemeContext } from './ThemeContext';
import './PredictiveAnalytics.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Filler
);

const PredictiveAnalytics = ({ transactions, incomes }) => {
  const { theme } = useContext(ThemeContext);
  const [selectedAnalysis, setSelectedAnalysis] = useState('spending-prediction');
  const [timeHorizon, setTimeHorizon] = useState('3months');

  // Advanced predictive analytics functions
  const getSpendingPrediction = (months = 3) => {
    if (transactions.length < 3) return null;

    // Simple linear regression for spending prediction
    const monthlyData = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const key = `${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}`;
      monthlyData[key] = (monthlyData[key] || 0) + transaction.amount;
    });

    const sortedData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Last 6 months

    if (sortedData.length < 3) return null;

    // Calculate trend
    const amounts = sortedData.map(([, amount]) => amount);
    const n = amounts.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = amounts.reduce((sum, amount) => sum + amount, 0);
    const sumXY = amounts.reduce((sum, amount, index) => sum + amount * (index + 1), 0);
    const sumXX = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict future months
    const predictions = [];
    for (let i = 1; i <= months; i++) {
      const predictedAmount = slope * (n + i) + intercept;
      predictions.push(Math.max(0, predictedAmount));
    }

    return {
      historicalData: sortedData,
      predictions,
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      confidence: Math.min(95, Math.max(60, 100 - (Math.abs(slope) * 10)))
    };
  };

  const getSpendingAnomalies = () => {
    const dailySpending = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      dailySpending[date] = (dailySpending[date] || 0) + transaction.amount;
    });

    const amounts = Object.values(dailySpending);
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    const anomalies = [];
    Object.entries(dailySpending).forEach(([date, amount]) => {
      const zScore = Math.abs((amount - mean) / stdDev);
      if (zScore > 2) { // More than 2 standard deviations
        anomalies.push({
          date,
          amount,
          zScore,
          type: amount > mean ? 'high' : 'low'
        });
      }
    });

    return anomalies.sort((a, b) => b.zScore - a.zScore).slice(0, 10);
  };

  const getExpenseOptimization = () => {
    const categoryTotals = {};
    const categoryFrequency = {};

    transactions.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
      categoryFrequency[category] = (categoryFrequency[category] || 0) + 1;
    });

    const optimizationSuggestions = Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category,
        currentSpending: total,
        frequency: categoryFrequency[category],
        averagePerTransaction: total / categoryFrequency[category],
        optimizationPotential: total * 0.15, // Assume 15% optimization potential
        priority: total > 10000 ? 'high' : total > 5000 ? 'medium' : 'low'
      }))
      .sort((a, b) => b.currentSpending - a.currentSpending);

    return optimizationSuggestions;
  };

  const getCashFlowForecast = () => {
    const monthlyIncome = {};
    const monthlyExpenses = {};

    incomes.forEach(income => {
      const date = new Date(income.date);
      const key = `${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}`;
      monthlyIncome[key] = (monthlyIncome[key] || 0) + income.amount;
    });

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const key = `${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}`;
      monthlyExpenses[key] = (monthlyExpenses[key] || 0) + transaction.amount;
    });

    const forecast = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 6; i++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const key = `${forecastDate.getFullYear()}-${forecastDate.getMonth().toString().padStart(2, '0')}`;
      
      // Simple average-based forecast
      const avgIncome = Object.values(monthlyIncome).reduce((sum, val) => sum + val, 0) / Object.keys(monthlyIncome).length || 0;
      const avgExpenses = Object.values(monthlyExpenses).reduce((sum, val) => sum + val, 0) / Object.keys(monthlyExpenses).length || 0;
      
      forecast.push({
        month: forecastDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: avgIncome,
        expenses: avgExpenses,
        netCashFlow: avgIncome - avgExpenses
      });
    }

    return forecast;
  };

  const getSeasonalPatterns = () => {
    const seasonalData = {
      'Q1': { months: [0, 1, 2], spending: 0, transactions: 0 },
      'Q2': { months: [3, 4, 5], spending: 0, transactions: 0 },
      'Q3': { months: [6, 7, 8], spending: 0, transactions: 0 },
      'Q4': { months: [9, 10, 11], spending: 0, transactions: 0 }
    };

    transactions.forEach(transaction => {
      const month = new Date(transaction.date).getMonth();
      Object.entries(seasonalData).forEach(([quarter, data]) => {
        if (data.months.includes(month)) {
          seasonalData[quarter].spending += transaction.amount;
          seasonalData[quarter].transactions += 1;
        }
      });
    });

    return seasonalData;
  };

  const getSpendingHeatmap = () => {
    const heatmapData = {};
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Initialize heatmap data
    weekdays.forEach(day => {
      heatmapData[day] = {};
      hours.forEach(hour => {
        heatmapData[day][hour] = 0;
      });
    });

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const day = weekdays[date.getDay()];
      const hour = date.getHours();
      heatmapData[day][hour] += transaction.amount;
    });

    return heatmapData;
  };

  const getRiskAssessment = () => {
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Calculate expense volatility
    const monthlyExpenses = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyExpenses[key] = (monthlyExpenses[key] || 0) + transaction.amount;
    });

    const expenseAmounts = Object.values(monthlyExpenses);
    const avgExpense = expenseAmounts.reduce((sum, amount) => sum + amount, 0) / expenseAmounts.length;
    const variance = expenseAmounts.reduce((sum, amount) => sum + Math.pow(amount - avgExpense, 2), 0) / expenseAmounts.length;
    const volatility = Math.sqrt(variance) / avgExpense * 100;

    return {
      savingsRate,
      volatility,
      riskLevel: savingsRate < 10 ? 'High' : savingsRate < 20 ? 'Medium' : 'Low',
      recommendations: [
        savingsRate < 10 && 'Increase savings rate to at least 10%',
        volatility > 30 && 'High spending volatility detected - consider budgeting',
        totalExpenses > totalIncome && 'Expenses exceed income - review spending habits'
      ].filter(Boolean)
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme === 'dark' ? '#e6e6e6' : '#333',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(42, 42, 66, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: theme === 'dark' ? '#e6a070' : '#7f4c47',
        bodyColor: theme === 'dark' ? '#e6e6e6' : '#333',
        borderColor: theme === 'dark' ? '#444460' : '#ddd',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: theme === 'dark' ? '#e6e6e6' : '#333' },
        grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
      },
      y: {
        ticks: { color: theme === 'dark' ? '#e6e6e6' : '#333' },
        grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
      }
    }
  };

  const predictionData = getSpendingPrediction(timeHorizon === '3months' ? 3 : timeHorizon === '6months' ? 6 : 12);
  const anomalies = getSpendingAnomalies();
  const optimizationData = getExpenseOptimization();
  const cashFlowData = getCashFlowForecast();
  const seasonalData = getSeasonalPatterns();
  const riskData = getRiskAssessment();

  return (
    <div className="predictive-analytics">
      <div className="analytics-header">
        <h1>🔮 Predictive Analytics & AI Insights</h1>
        <div className="controls">
          <select 
            value={selectedAnalysis} 
            onChange={(e) => setSelectedAnalysis(e.target.value)}
            className="analysis-select"
          >
            <option value="spending-prediction">Spending Prediction</option>
            <option value="anomaly-detection">Anomaly Detection</option>
            <option value="expense-optimization">Expense Optimization</option>
            <option value="cash-flow-forecast">Cash Flow Forecast</option>
            <option value="seasonal-patterns">Seasonal Patterns</option>
            <option value="risk-assessment">Risk Assessment</option>
          </select>
          
          <select 
            value={timeHorizon} 
            onChange={(e) => setTimeHorizon(e.target.value)}
            className="time-select"
          >
            <option value="3months">3 Months</option>
            <option value="6months">6 Months</option>
            <option value="12months">12 Months</option>
          </select>
        </div>
      </div>

      {selectedAnalysis === 'spending-prediction' && predictionData && (
        <div className="analysis-section">
          <div className="section-header">
            <h2>📈 Spending Prediction</h2>
            <div className="confidence-badge">
              Confidence: {predictionData.confidence.toFixed(0)}%
            </div>
          </div>
          
          <div className="prediction-grid">
            <div className="chart-container">
              <h3>Predicted Spending Trend</h3>
              <div className="chart-wrapper">
                <Line 
                  data={{
                    labels: [
                      ...predictionData.historicalData.map(([key]) => key),
                      ...Array.from({ length: predictionData.predictions.length }, (_, i) => `Future ${i + 1}`)
                    ],
                    datasets: [
                      {
                        label: 'Historical Spending',
                        data: [
                          ...predictionData.historicalData.map(([, amount]) => amount),
                          ...new Array(predictionData.predictions.length).fill(null)
                        ],
                        borderColor: '#4CAF50',
                        backgroundColor: '#4CAF50',
                        fill: false
                      },
                      {
                        label: 'Predicted Spending',
                        data: [
                          ...new Array(predictionData.historicalData.length).fill(null),
                          ...predictionData.predictions
                        ],
                        borderColor: '#FF9800',
                        backgroundColor: '#FF9800',
                        borderDash: [5, 5],
                        fill: false
                      }
                    ]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
            
            <div className="prediction-insights">
              <h3>Key Insights</h3>
              <div className="insight-cards">
                <div className="insight-card">
                  <div className="insight-icon">📊</div>
                  <div className="insight-content">
                    <h4>Trend</h4>
                    <p className={`trend-${predictionData.trend}`}>
                      {predictionData.trend.charAt(0).toUpperCase() + predictionData.trend.slice(1)}
                    </p>
                  </div>
                </div>
                
                <div className="insight-card">
                  <div className="insight-icon">💰</div>
                  <div className="insight-content">
                    <h4>Next Month</h4>
                    <p>₹{predictionData.predictions[0]?.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="insight-card">
                  <div className="insight-icon">📅</div>
                  <div className="insight-content">
                    <h4>Total Forecast</h4>
                    <p>₹{predictionData.predictions.reduce((sum, pred) => sum + pred, 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedAnalysis === 'anomaly-detection' && (
        <div className="analysis-section">
          <div className="section-header">
            <h2>🔍 Anomaly Detection</h2>
            <span className="anomaly-count">{anomalies.length} anomalies found</span>
          </div>
          
          <div className="anomalies-grid">
            {anomalies.map((anomaly, index) => (
              <div key={index} className={`anomaly-card ${anomaly.type}`}>
                <div className="anomaly-date">{new Date(anomaly.date).toLocaleDateString()}</div>
                <div className="anomaly-amount">₹{anomaly.amount.toLocaleString()}</div>
                <div className="anomaly-score">
                  Score: {anomaly.zScore.toFixed(2)}σ
                </div>
                <div className="anomaly-type">
                  {anomaly.type === 'high' ? '📈 High Spending' : '📉 Low Spending'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedAnalysis === 'expense-optimization' && (
        <div className="analysis-section">
          <div className="section-header">
            <h2>⚡ Expense Optimization</h2>
            <span className="potential-savings">
              Potential savings: ₹{optimizationData.reduce((sum, cat) => sum + cat.optimizationPotential, 0).toLocaleString()}
            </span>
          </div>
          
          <div className="optimization-grid">
            {optimizationData.slice(0, 6).map((category, index) => (
              <div key={index} className={`optimization-card priority-${category.priority}`}>
                <div className="category-header">
                  <h3>{category.category}</h3>
                  <span className={`priority-badge ${category.priority}`}>
                    {category.priority.toUpperCase()}
                  </span>
                </div>
                
                <div className="optimization-metrics">
                  <div className="metric">
                    <label>Current Spending</label>
                    <value>₹{category.currentSpending.toLocaleString()}</value>
                  </div>
                  
                  <div className="metric">
                    <label>Avg per Transaction</label>
                    <value>₹{category.averagePerTransaction.toLocaleString()}</value>
                  </div>
                  
                  <div className="metric">
                    <label>Optimization Potential</label>
                    <value className="potential">₹{category.optimizationPotential.toLocaleString()}</value>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedAnalysis === 'cash-flow-forecast' && (
        <div className="analysis-section">
          <div className="section-header">
            <h2>💸 Cash Flow Forecast</h2>
          </div>
          
          <div className="cash-flow-chart">
            <Bar
              data={{
                labels: cashFlowData.map(item => item.month),
                datasets: [
                  {
                    label: 'Income',
                    data: cashFlowData.map(item => item.income),
                    backgroundColor: '#4CAF50',
                    borderColor: '#4CAF50',
                    borderWidth: 1
                  },
                  {
                    label: 'Expenses',
                    data: cashFlowData.map(item => item.expenses),
                    backgroundColor: '#FF6384',
                    borderColor: '#FF6384',
                    borderWidth: 1
                  },
                  {
                    label: 'Net Cash Flow',
                    data: cashFlowData.map(item => item.netCashFlow),
                    backgroundColor: '#36A2EB',
                    borderColor: '#36A2EB',
                    borderWidth: 1
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>
      )}

      {selectedAnalysis === 'seasonal-patterns' && (
        <div className="analysis-section">
          <div className="section-header">
            <h2>🌍 Seasonal Spending Patterns</h2>
          </div>
          
          <div className="seasonal-analysis">
            <div className="chart-container">
              <PolarArea
                data={{
                  labels: Object.keys(seasonalData),
                  datasets: [{
                    data: Object.values(seasonalData).map(quarter => quarter.spending),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                    borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                    borderWidth: 2
                  }]
                }}
                options={chartOptions}
              />
            </div>
            
            <div className="seasonal-insights">
              {Object.entries(seasonalData).map(([quarter, data]) => (
                <div key={quarter} className="seasonal-card">
                  <h3>{quarter}</h3>
                  <div className="seasonal-metrics">
                    <div className="metric">
                      <label>Total Spending</label>
                      <value>₹{data.spending.toLocaleString()}</value>
                    </div>
                    <div className="metric">
                      <label>Transactions</label>
                      <value>{data.transactions}</value>
                    </div>
                    <div className="metric">
                      <label>Avg per Transaction</label>
                      <value>₹{(data.spending / data.transactions || 0).toLocaleString()}</value>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedAnalysis === 'risk-assessment' && (
        <div className="analysis-section">
          <div className="section-header">
            <h2>⚠️ Financial Risk Assessment</h2>
            <span className={`risk-level ${riskData.riskLevel.toLowerCase()}`}>
              Risk Level: {riskData.riskLevel}
            </span>
          </div>
          
          <div className="risk-dashboard">
            <div className="risk-metrics">
              <div className="risk-metric">
                <div className="metric-icon">💰</div>
                <div className="metric-details">
                  <h3>Savings Rate</h3>
                  <div className="metric-value">{riskData.savingsRate.toFixed(1)}%</div>
                  <div className="metric-status">
                    {riskData.savingsRate >= 20 ? 'Excellent' : 
                     riskData.savingsRate >= 10 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>
              </div>
              
              <div className="risk-metric">
                <div className="metric-icon">📊</div>
                <div className="metric-details">
                  <h3>Spending Volatility</h3>
                  <div className="metric-value">{riskData.volatility.toFixed(1)}%</div>
                  <div className="metric-status">
                    {riskData.volatility <= 15 ? 'Low' : 
                     riskData.volatility <= 30 ? 'Medium' : 'High'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="risk-recommendations">
              <h3>Recommendations</h3>
              <ul>
                {riskData.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalytics;
