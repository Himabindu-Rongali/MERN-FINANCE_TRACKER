import React, { useState, useEffect, useContext } from 'react';
import { Line, Bar, Pie, Doughnut, Radar, Scatter } from 'react-chartjs-2';
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
import './AdvancedAnalytics.css';

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

const AdvancedAnalytics = ({ transactions, incomes }) => {
  const { theme } = useContext(ThemeContext);
  const [analyticsView, setAnalyticsView] = useState('patterns');
  const [timeframe, setTimeframe] = useState('6months');

  // Advanced Analytics Functions
  const getSpendingPatterns = () => {
    const patterns = {
      weekdays: new Array(7).fill(0),
      hours: new Array(24).fill(0),
      categories: {},
      paymentMethods: {}
    };

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      patterns.weekdays[date.getDay()] += transaction.amount;
      patterns.hours[date.getHours()] += transaction.amount;
      
      const category = transaction.category || 'Uncategorized';
      patterns.categories[category] = (patterns.categories[category] || 0) + transaction.amount;
      
      const method = transaction.paymentMethod || 'Unknown';
      patterns.paymentMethods[method] = (patterns.paymentMethods[method] || 0) + transaction.amount;
    });

    return patterns;
  };

  const getBudgetAnalysis = () => {
    const monthlyAverage = transactions.reduce((sum, t) => sum + t.amount, 0) / 12;
    const categories = getSpendingPatterns().categories;
    
    // Suggested budgets based on spending patterns
    const suggestedBudgets = Object.entries(categories).map(([category, amount]) => ({
      category,
      currentSpending: amount,
      suggestedBudget: Math.ceil(amount * 1.1), // 10% buffer
      variance: amount - (amount * 0.9) // Assuming 90% of current as target
    }));

    return {
      monthlyAverage,
      totalSpending: transactions.reduce((sum, t) => sum + t.amount, 0),
      suggestedBudgets
    };
  };

  const getSpendingTrends = () => {
    const trends = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!trends[monthKey]) {
        trends[monthKey] = { label: monthLabel, amount: 0, count: 0 };
      }
      trends[monthKey].amount += transaction.amount;
      trends[monthKey].count += 1;
    });

    return Object.values(trends).sort((a, b) => a.label.localeCompare(b.label));
  };

  const getAnomalyDetection = () => {
    const categoryAverages = {};
    const categoryTransactions = {};

    transactions.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      if (!categoryAverages[category]) {
        categoryAverages[category] = [];
        categoryTransactions[category] = [];
      }
      categoryAverages[category].push(transaction.amount);
      categoryTransactions[category].push(transaction);
    });

    const anomalies = [];
    Object.entries(categoryAverages).forEach(([category, amounts]) => {
      const avg = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      const stdDev = Math.sqrt(amounts.reduce((sum, amt) => sum + Math.pow(amt - avg, 2), 0) / amounts.length);
      
      categoryTransactions[category].forEach(transaction => {
        if (Math.abs(transaction.amount - avg) > 2 * stdDev) {
          anomalies.push({
            ...transaction,
            category,
            deviation: Math.abs(transaction.amount - avg) / stdDev
          });
        }
      });
    });

    return anomalies.sort((a, b) => b.deviation - a.deviation).slice(0, 5);
  };

  const getPredictiveAnalysis = () => {
    const trends = getSpendingTrends();
    if (trends.length < 3) return null;

    const recentTrends = trends.slice(-6); // Last 6 months
    const avgGrowthRate = recentTrends.reduce((sum, trend, index) => {
      if (index === 0) return 0;
      const growth = (trend.amount - recentTrends[index - 1].amount) / recentTrends[index - 1].amount;
      return sum + growth;
    }, 0) / (recentTrends.length - 1);

    const lastAmount = recentTrends[recentTrends.length - 1].amount;
    const predictions = [];
    
    for (let i = 1; i <= 3; i++) {
      predictions.push({
        month: `Next ${i} month${i > 1 ? 's' : ''}`,
        predicted: lastAmount * Math.pow(1 + avgGrowthRate, i)
      });
    }

    return { growthRate: avgGrowthRate, predictions };
  };

  // Chart Data Generators
  const getWeekdayChart = () => {
    const patterns = getSpendingPatterns();
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      labels: weekdays,
      datasets: [{
        label: 'Spending by Day of Week',
        data: patterns.weekdays,
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    };
  };

  const getHourlyChart = () => {
    const patterns = getSpendingPatterns();
    const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
    
    return {
      labels: hours,
      datasets: [{
        label: 'Spending by Hour',
        data: patterns.hours,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3
      }]
    };
  };

  const getTrendChart = () => {
    const trends = getSpendingTrends();
    
    return {
      labels: trends.map(t => t.label),
      datasets: [{
        label: 'Monthly Spending Trend',
        data: trends.map(t => t.amount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    };
  };

  const getBudgetChart = () => {
    const analysis = getBudgetAnalysis();
    const top5 = analysis.suggestedBudgets.slice(0, 5);
    
    return {
      labels: top5.map(b => b.category),
      datasets: [
        {
          label: 'Current Spending',
          data: top5.map(b => b.currentSpending),
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 2
        },
        {
          label: 'Suggested Budget',
          data: top5.map(b => b.suggestedBudget),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme === 'dark' ? '#e6e6e6' : '#333'
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(42, 42, 66, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: theme === 'dark' ? '#e6a070' : '#333',
        bodyColor: theme === 'dark' ? '#e6e6e6' : '#333'
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

  return (
    <div className={`advanced-analytics ${theme}`}>
      <div className="analytics-header">
        <h1>📊 Advanced Analytics</h1>
        <div className="analytics-controls">
          <select value={analyticsView} onChange={(e) => setAnalyticsView(e.target.value)}>
            <option value="patterns">Spending Patterns</option>
            <option value="trends">Trend Analysis</option>
            <option value="budget">Budget Analysis</option>
            <option value="anomalies">Anomaly Detection</option>
            <option value="predictions">Predictive Analysis</option>
          </select>
        </div>
      </div>

      {analyticsView === 'patterns' && (
        <div className="patterns-view">
          <div className="analytics-grid">
            <div className="chart-card">
              <h3>🗓️ Spending by Day of Week</h3>
              <div className="chart-container">
                <Line data={getWeekdayChart()} options={chartOptions} />
              </div>
            </div>
            
            <div className="chart-card">
              <h3>🕒 Spending by Hour</h3>
              <div className="chart-container">
                <Bar data={getHourlyChart()} options={chartOptions} />
              </div>
            </div>
            
            <div className="chart-card">
              <h3>💳 Payment Method Distribution</h3>
              <div className="chart-container">
                <Doughnut 
                  data={{
                    labels: Object.keys(getSpendingPatterns().paymentMethods),
                    datasets: [{
                      data: Object.values(getSpendingPatterns().paymentMethods),
                      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                      borderWidth: 2
                    }]
                  }} 
                  options={chartOptions} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {analyticsView === 'trends' && (
        <div className="trends-view">
          <div className="chart-card full-width">
            <h3>📈 Monthly Spending Trends</h3>
            <div className="chart-container">
              <Line data={getTrendChart()} options={chartOptions} />
            </div>
          </div>
          
          <div className="insights-grid">
            <div className="insight-card">
              <h4>📊 Trend Insights</h4>
              <ul>
                <li>Average monthly spending: ₹{(getBudgetAnalysis().monthlyAverage).toLocaleString()}</li>
                <li>Total transactions: {transactions.length}</li>
                <li>Most active month: {getSpendingTrends().reduce((max, curr) => curr.amount > max.amount ? curr : max, {amount: 0}).label}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {analyticsView === 'budget' && (
        <div className="budget-view">
          <div className="chart-card">
            <h3>💰 Budget vs Actual Spending</h3>
            <div className="chart-container">
              <Bar data={getBudgetChart()} options={chartOptions} />
            </div>
          </div>
          
          <div className="budget-recommendations">
            <h3>💡 Budget Recommendations</h3>
            <div className="recommendations-grid">
              {getBudgetAnalysis().suggestedBudgets.slice(0, 3).map((budget, index) => (
                <div key={index} className="recommendation-card">
                  <h4>{budget.category}</h4>
                  <p>Current: ₹{budget.currentSpending.toLocaleString()}</p>
                  <p>Suggested: ₹{budget.suggestedBudget.toLocaleString()}</p>
                  <div className={`variance ${budget.variance > 0 ? 'over' : 'under'}`}>
                    {budget.variance > 0 ? '⬆️' : '⬇️'} ₹{Math.abs(budget.variance).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {analyticsView === 'anomalies' && (
        <div className="anomalies-view">
          <h3>🚨 Unusual Spending Detected</h3>
          <div className="anomalies-list">
            {getAnomalyDetection().map((anomaly, index) => (
              <div key={index} className="anomaly-card">
                <div className="anomaly-header">
                  <span className="anomaly-category">{anomaly.category}</span>
                  <span className="anomaly-amount">₹{anomaly.amount}</span>
                </div>
                <div className="anomaly-details">
                  <span className="anomaly-date">{new Date(anomaly.date).toLocaleDateString()}</span>
                  <span className="anomaly-severity">
                    {anomaly.deviation > 3 ? '🔴 High' : anomaly.deviation > 2 ? '🟡 Medium' : '🟢 Low'}
                  </span>
                </div>
                <div className="anomaly-description">
                  {anomaly.description || 'Unusual spending amount for this category'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analyticsView === 'predictions' && (
        <div className="predictions-view">
          <h3>🔮 Spending Predictions</h3>
          {(() => {
            const prediction = getPredictiveAnalysis();
            if (!prediction) return <p>Not enough data for predictions</p>;
            
            return (
              <div className="predictions-content">
                <div className="prediction-summary">
                  <h4>Growth Rate: {(prediction.growthRate * 100).toFixed(1)}% per month</h4>
                </div>
                <div className="predictions-list">
                  {prediction.predictions.map((pred, index) => (
                    <div key={index} className="prediction-card">
                      <h5>{pred.month}</h5>
                      <p>₹{pred.predicted.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalytics;
