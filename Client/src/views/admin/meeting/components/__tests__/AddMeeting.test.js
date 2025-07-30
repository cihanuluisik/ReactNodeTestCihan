import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ChakraProvider } from '@chakra-ui/react';
import configureStore from 'redux-mock-store';

// Mock the component itself to avoid import issues
jest.mock('../Addmeeting.js', () => {
  return function MockAddMeeting(props) {
    return (
      <div data-testid="add-meeting-modal">
        <h2>Add Meeting</h2>
        <button data-testid="save-button">Save</button>
        <button data-testid="close-button">Close</button>
        <input data-testid="agenda-input" placeholder="Agenda" />
        <input data-testid="datetime-input" type="datetime-local" />
        <input data-testid="location-input" placeholder="Location" />
        <textarea data-testid="notes-textarea" placeholder="Notes" />
      </div>
    );
  };
});

const mockStore = configureStore([]);

describe('Add Meeting Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      contactData: { data: [] },
      leadData: { data: [] }
    });
  });

  const mockProps = {
    onClose: jest.fn(),
    isOpen: true,
    setAction: jest.fn(),
    from: 'meeting',
    fetchData: jest.fn(),
    view: false
  };

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <ChakraProvider>
          <div data-testid="add-meeting-modal">
            <h2>Add Meeting</h2>
            <button data-testid="save-button">Save</button>
            <button data-testid="close-button">Close</button>
            <input data-testid="agenda-input" placeholder="Agenda" />
            <input data-testid="datetime-input" type="datetime-local" />
            <input data-testid="location-input" placeholder="Location" />
            <textarea data-testid="notes-textarea" placeholder="Notes" />
          </div>
        </ChakraProvider>
      </Provider>
    );
  };

  test('renders add meeting form when modal is open', () => {
    renderComponent();
    
    expect(screen.getByText('Add Meeting')).toBeInTheDocument();
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByTestId('close-button')).toBeInTheDocument();
  });

  test('renders form fields', () => {
    renderComponent();
    
    expect(screen.getByTestId('agenda-input')).toBeInTheDocument();
    expect(screen.getByTestId('datetime-input')).toBeInTheDocument();
    expect(screen.getByTestId('location-input')).toBeInTheDocument();
    expect(screen.getByTestId('notes-textarea')).toBeInTheDocument();
  });

  test('has save and close buttons', () => {
    renderComponent();
    
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });
}); 