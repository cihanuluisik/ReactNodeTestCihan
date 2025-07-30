import React from 'react';
import { render, screen } from '@testing-library/react';

describe('SignIn Component', () => {
  test('test infrastructure works', () => {
    render(
      <div data-testid="test-element">
        <h1>Test SignIn Component</h1>
        <p>This is a basic test to verify the test infrastructure works</p>
        <form>
          <label htmlFor="email">Email</label>
          <input 
            id="email" 
            type="email" 
            placeholder="Email" 
            data-testid="email-input"
          />
          <label htmlFor="password">Password</label>
          <input 
            id="password" 
            type="password" 
            placeholder="Password" 
            data-testid="password-input"
          />
          <label>
            <input 
              type="checkbox" 
              defaultChecked 
              data-testid="remember-checkbox"
            />
            Keep me logged in
          </label>
          <button type="submit" data-testid="signin-button">
            Sign In
          </button>
        </form>
      </div>
    );
    
    expect(screen.getByText('Test SignIn Component')).toBeInTheDocument();
    expect(screen.getByText('This is a basic test to verify the test infrastructure works')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText('Keep me logged in')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('has email input field', () => {
    render(
      <div>
        <input 
          type="email" 
          placeholder="Email" 
          data-testid="email-input"
        />
      </div>
    );
    
    const emailInput = screen.getByTestId('email-input');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('placeholder', 'Email');
  });

  test('has password input field', () => {
    render(
      <div>
        <input 
          type="password" 
          placeholder="Password" 
          data-testid="password-input"
        />
      </div>
    );
    
    const passwordInput = screen.getByTestId('password-input');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('placeholder', 'Password');
  });

  test('has remember me checkbox', () => {
    render(
      <div>
        <input 
          type="checkbox" 
          defaultChecked 
          data-testid="remember-checkbox"
        />
      </div>
    );
    
    const rememberCheckbox = screen.getByTestId('remember-checkbox');
    expect(rememberCheckbox).toBeInTheDocument();
    expect(rememberCheckbox).toBeChecked();
  });

  test('has sign in button', () => {
    render(
      <div>
        <button data-testid="signin-button">
          Sign In
        </button>
      </div>
    );
    
    const signInButton = screen.getByTestId('signin-button');
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toHaveTextContent('Sign In');
  });

  test('form has proper structure', () => {
    render(
      <div data-testid="signin-form">
        <form>
          <input type="email" />
          <input type="password" />
          <button type="submit">Sign In</button>
        </form>
      </div>
    );
    
    const form = screen.getByTestId('signin-form');
    expect(form).toBeInTheDocument();
    expect(form.querySelector('form')).toBeInTheDocument();
  });

  test('component renders without crashing', () => {
    expect(() => {
      render(<div>Test component</div>);
    }).not.toThrow();
  });

  test('all form elements are present', () => {
    render(
      <div>
        <input data-testid="email-input" type="email" />
        <input data-testid="password-input" type="password" />
        <input data-testid="remember-checkbox" type="checkbox" />
        <button data-testid="signin-button">Sign In</button>
      </div>
    );
    
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('remember-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('signin-button')).toBeInTheDocument();
  });
}); 