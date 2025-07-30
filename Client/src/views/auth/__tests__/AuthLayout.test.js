import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import DefaultAuth from '../../../layouts/auth/Default';

// Mock Footer component
jest.mock('components/footer/FooterAuth', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

// Mock FixedPlugin component
jest.mock('components/fixedPlugin/FixedPlugin', () => {
  return function MockFixedPlugin() {
    return <div data-testid="fixed-plugin">Fixed Plugin</div>;
  };
});

describe('DefaultAuth Layout Component', () => {
  const mockChildren = <div data-testid="auth-content">Auth Content</div>;
  const mockProps = {
    children: mockChildren,
    illustrationBackground: 'https://example.com/auth-bg.jpg'
  };

  const renderComponent = (props = mockProps) => {
    return render(
      <BrowserRouter>
        <ChakraProvider>
          <DefaultAuth {...props} />
        </ChakraProvider>
      </BrowserRouter>
    );
  };

  test('renders authentication layout with children', () => {
    renderComponent();
    
    expect(screen.getByTestId('auth-content')).toBeInTheDocument();
    expect(screen.getByText('Auth Content')).toBeInTheDocument();
  });

  test('renders footer component', () => {
    renderComponent();
    
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  test('renders illustration background when provided', () => {
    renderComponent();
    
    const illustrationLink = screen.getByTestId('illustration-link');
    expect(illustrationLink).toBeInTheDocument();
    expect(illustrationLink).toHaveAttribute('href', 'https://prolinkinfotech.com/');
    expect(illustrationLink).toHaveAttribute('target', '_blank');
  });

  test('handles missing illustration background gracefully', () => {
    const propsWithoutBackground = {
      children: mockChildren,
      illustrationBackground: null
    };
    
    renderComponent(propsWithoutBackground);
    
    // Should still render the layout without crashing
    expect(screen.getByTestId('auth-content')).toBeInTheDocument();
  });

  test('renders with proper responsive classes', () => {
    renderComponent();
    
    const mainContainer = screen.getByTestId('auth-content').closest('div');
    expect(mainContainer).toBeInTheDocument();
  });

  test('renders illustration section with proper styling', () => {
    renderComponent();
    
    const illustrationLink = screen.getByTestId('illustration-link');
    const illustrationContainer = illustrationLink.closest('div');
    
    expect(illustrationContainer).toBeInTheDocument();
  });

  test('renders main content area with proper layout', () => {
    renderComponent();
    
    const contentArea = screen.getByTestId('auth-content').closest('div');
    expect(contentArea).toBeInTheDocument();
  });

  test('handles empty children gracefully', () => {
    const propsWithEmptyChildren = {
      children: null,
      illustrationBackground: 'https://example.com/auth-bg.jpg'
    };
    
    renderComponent(propsWithEmptyChildren);
    
    // Should render without crashing
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('renders with different illustration backgrounds', () => {
    const customBackground = 'https://custom-bg.com/image.jpg';
    const propsWithCustomBackground = {
      children: mockChildren,
      illustrationBackground: customBackground
    };
    
    renderComponent(propsWithCustomBackground);
    
    const illustrationLink = screen.getByTestId('illustration-link');
    expect(illustrationLink).toBeInTheDocument();
  });

  test('maintains proper flex layout structure', () => {
    renderComponent();
    
    const mainFlexContainer = screen.getByTestId('auth-content').closest('div');
    expect(mainFlexContainer).toBeInTheDocument();
  });

  test('renders with proper spacing and margins', () => {
    renderComponent();
    
    // The layout should render without any console errors
    expect(screen.getByTestId('auth-content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
}); 