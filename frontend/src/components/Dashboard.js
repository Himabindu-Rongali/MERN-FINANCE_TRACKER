import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
  LineElement,
  PointElement
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
  PointElement
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

  const yearlyTotals = transactions.reduce((acc, transaction) => {
    const year = new Date(transaction.date).getFullYear();
    acc[year] = (acc[year] || 0) + transaction.amount;
    return acc;
  }, {});

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
      maintainAspectRatio: false,
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
          backgroundColor: theme === 'dark' ? 'rgba(42, 42, 66, 0.9)' : 'rgba(255, 255, 255, 0.9)',
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
          boxPadding: 5
        }
      }
    };
  };

  // Pie chart options
  const getPieOptions = () => {
    return {
      maintainAspectRatio: false,
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
          backgroundColor: theme === 'dark' ? 'rgba(42, 42, 66, 0.9)' : 'rgba(255, 255, 255, 0.9)',
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

  return (
    <div className="dashboard-container">
      {/* Dashboard Buttons */}
      <div className="dashboard-buttons">
        <button className="dashboard-button" onClick={() => { setSelectedView('yearly'); setSelectedYear(''); setSelectedMonth(''); }}>
          Yearly Progress
        </button>
        <button className="dashboard-button" onClick={() => { setSelectedView('withinYear'); setSelectedYear(currentYear.toString()); setSelectedMonth(currentMonth.toString()); }}>
          Within a Year Progress
        </button>
      </div>      {/* Yearly Progress */}
      {selectedView === 'yearly' && (
        <div className="chart-container">
          <Line data={yearChartData} options={getChartOptions()} />
        </div>
      )}

      {/* Within Year Progress */}
      {selectedView === 'withinYear' && (
        <>
          {/* Enter year */}
          <div className="year-input-container">
            <input
              type="number"
              placeholder="Enter Year (e.g. 2024)"
              className="year-input"
              value={selectedYear}
              onChange={handleYearChange}
            />
          </div>

          {/* Month Selection */}
          {selectedYear && (
            <div className="year-input-container">
              <select value={selectedMonth} onChange={handleMonthChange} className="year-input">
                <option value="">Select Month</option>
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
          )}

          {/* Month Totals */}
          {selectedMonth !== '' && (
            <div className="selected-month-total">
              <h3>Income in {months[selectedMonth]} {selectedYear}: ₹{selectedMonthIncome}</h3>
              <h3>Expense in {months[selectedMonth]} {selectedYear}: ₹{selectedMonthExpense}</h3>
              <h3>Net Savings: ₹{selectedMonthIncome - selectedMonthExpense}</h3>
            </div>
          )}

          {/* Charts */}
          {selectedYear && (
            <div className="charts-row">              <div className="chart-wrapper">
                <Line data={monthChartData} options={getChartOptions()} />
              </div>

              {selectedMonth !== '' && categoryChartData && (
                <div className="chart-wrapper">
                  <Pie data={categoryChartData} options={getPieOptions()} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;