/**
 * ErrorBoundary Component - Catches JavaScript errors in component tree
 * 
 * This component provides graceful error handling for React components,
 * preventing the entire app from crashing when an error occurs.
 * 
 * Features:
 * - Catches and logs JavaScript errors
 * - Provides user-friendly error messages
 * - Retry functionality for recoverable errors
 * - Theme-aware styling
 */
import React, { Component } from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state to show error UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error details in state
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report error to logging service (if available)
    if (typeof window !== 'undefined' && window.reportError) {
      window.reportError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount } = this.state;
      const { fallback, showDetails = false } = this.props;
      
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, errorInfo, this.handleRetry);
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Something went wrong</h2>
            <p className="error-message">
              We're sorry, but something unexpected happened. Please try again.
            </p>
            
            {retryCount < 3 && (
              <button 
                className="error-retry-button" 
                onClick={this.handleRetry}
              >
                Try Again
              </button>
            )}
            
            {retryCount >= 3 && (
              <div className="error-help">
                <p>If the problem persists, please:</p>
                <ul>
                  <li>Refresh the page</li>
                  <li>Clear your browser cache</li>
                  <li>Contact support if the issue continues</li>
                </ul>
              </div>
            )}
            
            {showDetails && (
              <details className="error-details">
                <summary>Technical Details</summary>
                <div className="error-stack">
                  <h4>Error:</h4>
                  <pre>{error && error.toString()}</pre>
                  <h4>Stack Trace:</h4>
                  <pre>{errorInfo && errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
