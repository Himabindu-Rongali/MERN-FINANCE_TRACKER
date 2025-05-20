import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Personal Finance Manager heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Personal Finance Manager/i);
  expect(headingElement).toBeInTheDocument();
});
