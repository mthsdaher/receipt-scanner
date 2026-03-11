import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

const renderApp = (initialEntries = ['/']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

beforeEach(() => {
  localStorage.clear();
});

test('renders application shell', () => {
  renderApp(['/']);

  expect(screen.getByText(/scan and organize your receipts easily and securely/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /log in to start scanning/i })).toBeInTheDocument();
});

test('redirects unauthenticated users from private routes to sign in', () => {
  renderApp(['/dashboard']);

  expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
});

test('shows only public navigation before login', () => {
  renderApp(['/']);

  expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  expect(screen.queryByText('History')).not.toBeInTheDocument();
  expect(screen.queryByText('Insert')).not.toBeInTheDocument();
  expect(screen.getByText('Sign In')).toBeInTheDocument();
  expect(screen.getByText('Sign Up')).toBeInTheDocument();
});

test('shows private navigation after login', () => {
  localStorage.setItem('token', 'fake-token-for-ui-state');
  renderApp(['/']);

  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByText('History')).toBeInTheDocument();
  expect(screen.getByText('Insert')).toBeInTheDocument();
});
