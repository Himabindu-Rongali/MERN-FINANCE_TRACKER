import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const handleGetStarted = () => {
    if (isAuthenticated()) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <div>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            background: #f1f5f9;
            color: #1e293b;
            scroll-behavior: smooth;
          }

          .header {
            width: 100%;
            background: linear-gradient(90deg, #1e3a8a, #3b82f6);
            color: #fff;
            padding: 70px 20px 50px 20px;
            text-align: center;
          }

          .header img {
            width: 90px;
            margin-bottom: 20px;
          }

          .header h1 {
            font-size: 2.8rem;
            margin-bottom: 10px;
          }

          .header p {
            font-size: 1.2rem;
            margin-bottom: 25px;
            max-width: 900px;
            margin-left: auto;
            margin-right: auto;
          }

          .cta-btn {
            background: #ffffff;
            color: #1e3a8a;
            border: none;
            padding: 16px 36px;
            font-size: 1.1rem;
            border-radius: 30px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
          }

          .cta-btn:hover {
            background: #e0f2fe;
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
          }

          .features {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            background: #f8fafc;
            padding: 60px 20px;
            gap: 40px;
            width: 100%;
          }

          .feature {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
            padding: 40px 28px;
            max-width: 340px;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 2px solid transparent;
          }

          .feature:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
          }

          .feature img {
            width: 72px;
            margin-bottom: 20px;
            transition: transform 0.3s ease;
          }

          .feature:hover img {
            transform: rotate(5deg) scale(1.1);
          }

          .feature h3 {
            font-size: 1.3rem;
            margin: 16px 0 10px 0;
            color: #1e3a8a;
          }

          .feature p {
            font-size: 1rem;
            color: #475569;
            line-height: 1.6;
          }

          .why-section {
            width: 100%;
            background: linear-gradient(120deg, #e0f2fe 60%, #dbeafe 100%);
            padding: 80px 20px;
            text-align: center;
          }

          .why-section h2 {
            font-size: 2.5rem;
            color: #1e3a8a;
            margin-bottom: 24px;
            font-weight: 800;
            letter-spacing: -1px;
          }

          .why-section p {
            font-size: 1.15rem;
            color: #334155;
            max-width: 900px;
            margin: 0 auto 24px auto;
            line-height: 1.7;
          }

          .why-section em {
            display: block;
            margin-top: 32px;
            color: #64748b;
            font-size: 1rem;
          }

          .footer {
            background: #0f172a;
            color: #fff;
            padding: 50px 20px 30px 20px;
            font-size: 0.95rem;
            width: 100%;
          }

          .footer-content {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            max-width: 1100px;
            margin: 0 auto 30px auto;
            gap: 30px;
          }

          .footer-content div {
            flex: 1;
            min-width: 220px;
            background: none; 
            border: none; 
          }

          .footer-content h5 {
            margin-bottom: 12px;
            font-size: 1.1rem;
            color: #93c5fd;
          }

          .footer-content p {
            margin: 6px 0;
            color: #e2e8f0;
          }

          .footer-content a {
            color: #e0e7ff;
            text-decoration: none;
            transition: color 0.3s ease, text-decoration 0.3s ease;
          }

          .footer-content a:hover {
            color: #60a5fa;
            text-decoration: underline;
          }

          /* Remove boxes around footer links */
          .footer-content ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .footer-content ul li {
            margin: 6px 0;
            border: none;
            background: none;
          }

          .footer-bottom {
            text-align: center;
            font-size: 0.9rem;
            color: #94a3b8;
          }

          @media (max-width: 800px) {
            .features { flex-direction: column; align-items: center; }
            .footer-content { flex-direction: column; }
            .why-section h2 { font-size: 2rem; }
            .why-section p { font-size: 1rem; }
          }
        `}
      </style>
      <div className="header">
        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="SmartFinance Logo" />
        <h1>SmartFinance</h1>
        <p>
          The Personal Finance Assistant that helps you track, manage, and understand your financial activities.<br />
          Log income and expenses, upload receipts, visualize your spending, and more.
        </p>
        <button className="cta-btn" onClick={handleGetStarted}>Get Started Free</button>
      </div>

      <div className="features">
        <div className="feature">
          <img src="https://cdn-icons-png.flaticon.com/512/2920/2920064.png" alt="Expense Tracking" />
          <h3>Effortless Entry</h3>
          <p>Create income and expense entries in seconds. Categorize transactions for clear and organized records.</p>
        </div>
        <div className="feature">
          <img src="https://cdn-icons-png.flaticon.com/512/3523/3523887.png" alt="Budget Planning" />
          <h3>Custom Time Ranges</h3>
          <p>List and analyze your transactions over any time period—daily, weekly, monthly, or custom ranges.</p>
        </div>
        <div className="feature">
          <img src="https://cdn-icons-png.flaticon.com/512/2910/2910791.png" alt="Insights" />
          <h3>Visual Reports</h3>
          <p>Get insightful graphs: expenses by category, by date, and more. Instantly understand your spending habits.</p>
        </div>
        <div className="feature">
          <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" alt="Receipt Extraction" />
          <h3>Receipt Extraction</h3>
          <p>Upload POS receipts (images or PDFs) and let SmartFinance extract transaction details automatically.</p>
        </div>
      </div>

      <section className="why-section">
        <h2>Why Choose SmartFinance?</h2>
        <p>
          <strong>SmartFinance</strong> is more than a tracker—it's your personal finance assistant, engineered for accuracy, insight, and ease of use.
        </p>
        <p>
          Enjoy secure data storage, automated receipt extraction, insightful analytics, and seamless support for multiple users—all through a reliable and intuitive platform.
        </p>
        <em>Designed with precision. Focused on simplicity. Built for trust.</em>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div>
            <h5>SmartFinance</h5>
            <p>Revolutionizing how you manage, track, and understand your finances.</p>
          </div>
          <div>
            <h5>Quick Links</h5>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Support</a></li>
            </ul>
          </div>
          <div>
            <h5>Contact Us</h5>
            <p>Email: support@smartfinance.app</p>
            <p>Phone: +91 98765 43210</p>
          </div>
        </div>
        <p className="footer-bottom">&copy; 2025 SmartFinance. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
