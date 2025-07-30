import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ChakraProvider } from '@chakra-ui/react';
import configureStore from 'redux-mock-store';
import MeetingAdvanceSearch from '../MeetingAdvanceSearch';

// Mock Redux actions
jest.mock('../../../../../redux/slices/advanceSearchSlice', () => ({
  getSearchData: jest.fn(),
  setGetTagValues: jest.fn(),
  setSearchValue: jest.fn()
}));

const mockStore = configureStore([]);

describe('Meeting Advanced Search Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      advanceSearch: {
        searchValue: {},
        tagValues: []
      }
    });
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  const mockProps = {
    allData: [
      {
        _id: '1',
        agenda: 'Team Meeting',
        createBy: 'john@example.com',
        dateTime: '2024-01-15T10:00:00Z',
        timestamp: '2024-01-15T10:00:00Z'
      },
      {
        _id: '2',
        agenda: 'Project Review',
        createBy: 'jane@example.com',
        dateTime: '2024-01-16T14:00:00Z',
        timestamp: '2024-01-16T14:00:00Z'
      }
    ],
    advanceSearch: true,
    setAdvanceSearch: jest.fn(),
    isLoding: false,
    setSearchedData: jest.fn(),
    setDisplaySearchData: jest.fn(),
    setSearchbox: jest.fn()
  };

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <ChakraProvider>
          <MeetingAdvanceSearch {...mockProps} />
        </ChakraProvider>
      </Provider>
    );
  };

  test('renders advanced search modal when advanceSearch is true', () => {
    renderComponent();
    
    expect(screen.getByText('Advance Search')).toBeInTheDocument();
  });

  test('does not render modal when advanceSearch is false', () => {
    const closedProps = { ...mockProps, advanceSearch: false };
    
    render(
      <Provider store={store}>
        <ChakraProvider>
          <MeetingAdvanceSearch {...closedProps} />
        </ChakraProvider>
      </Provider>
    );
    
    expect(screen.queryByText('Advance Search')).not.toBeInTheDocument();
  });

  test('renders agenda field', () => {
    renderComponent();
    
    expect(screen.getByLabelText('Agenda')).toBeInTheDocument();
  });

  test('renders create by field', () => {
    renderComponent();
    
    expect(screen.getByLabelText('Create By')).toBeInTheDocument();
  });

  test('renders date range fields', () => {
    renderComponent();
    
    // Use getAllByLabelText to get all "From" and "To" labels
    const fromLabels = screen.getAllByLabelText('From');
    const toLabels = screen.getAllByLabelText('To');
    
    expect(fromLabels.length).toBeGreaterThan(0);
    expect(toLabels.length).toBeGreaterThan(0);
  });

  test('renders time range fields', () => {
    renderComponent();
    
    // Look for time range fields by their labels
    const timeLabels = screen.getAllByText(/From|To/);
    expect(timeLabels.length).toBeGreaterThan(0);
  });

  test('handles agenda input changes', () => {
    renderComponent();
    
    const agendaInput = screen.getByLabelText('Agenda');
    fireEvent.change(agendaInput, { target: { value: 'Team Meeting' } });
    
    expect(agendaInput.value).toBe('Team Meeting');
  });

  test('handles create by input changes', () => {
    renderComponent();
    
    const createByInput = screen.getByLabelText('Create By');
    fireEvent.change(createByInput, { target: { value: 'john@example.com' } });
    
    expect(createByInput.value).toBe('john@example.com');
  });

  test('closes modal when close button is clicked', () => {
    renderComponent();
    
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    expect(mockProps.setAdvanceSearch).toHaveBeenCalledWith(false);
  });

  test('clears form when clear button is clicked', () => {
    renderComponent();
    
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    // Check if form fields are cleared
    const agendaInput = screen.getByLabelText('Agenda');
    expect(agendaInput.value).toBe('');
  });

  test('displays loading state when search is in progress', () => {
    const loadingProps = { ...mockProps, isLoding: true };
    
    render(
      <Provider store={store}>
        <ChakraProvider>
          <MeetingAdvanceSearch {...loadingProps} />
        </ChakraProvider>
      </Provider>
    );
    
    // Check if search button shows loading state (should be disabled)
    const searchButton = screen.getByRole('button', { name: '' });
    expect(searchButton).toBeDisabled();
  });

  test('search button is disabled when form is not dirty', () => {
    renderComponent();
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeDisabled();
  });

  test('search button is enabled when form is dirty', () => {
    renderComponent();
    
    // Fill in a field to make form dirty
    const agendaInput = screen.getByLabelText('Agenda');
    fireEvent.change(agendaInput, { target: { value: 'Test' } });
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).not.toBeDisabled();
  });

  test('renders search and clear buttons', () => {
    renderComponent();
    
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  test('renders form with proper structure', () => {
    renderComponent();
    
    // Check that the form exists
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    
    // Check that all required fields are present
    expect(screen.getByLabelText('Agenda')).toBeInTheDocument();
    expect(screen.getByLabelText('Create By')).toBeInTheDocument();
    
    // Check that date fields exist (using getAllByLabelText to handle multiple)
    const fromLabels = screen.getAllByLabelText('From');
    const toLabels = screen.getAllByLabelText('To');
    expect(fromLabels.length).toBeGreaterThan(0);
    expect(toLabels.length).toBeGreaterThan(0);
  });
}); 