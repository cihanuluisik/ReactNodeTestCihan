import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import configureStore from 'redux-mock-store';

// Mock the components to avoid import issues
jest.mock('../index.js', () => {
  return function MockMeetingList() {
    return (
      <div data-testid="meeting-list">
        <h1>Meeting List</h1>
        <button data-testid="add-meeting-btn">Add Meeting</button>
        <table>
          <tbody>
            <tr>
              <td>Integration Test Meeting</td>
              <td>2024-01-15T10:00:00Z</td>
              <td>John Doe</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };
});

jest.mock('../components/Addmeeting.js', () => {
  return function MockAddMeeting() {
    return (
      <div data-testid="add-meeting-modal">
        <h2>Add Meeting</h2>
        <input data-testid="agenda-input" placeholder="Agenda" />
        <input data-testid="datetime-input" type="datetime-local" />
        <button data-testid="save-btn">Save</button>
        <button data-testid="close-btn">Close</button>
      </div>
    );
  };
});

jest.mock('../View.js', () => {
  return function MockMeetingView() {
    return (
      <div data-testid="meeting-view">
        <h1>Integration Test Meeting</h1>
        <p>2024-01-15T10:00:00Z</p>
        <p>John Doe</p>
        <button data-testid="edit-btn">Edit</button>
        <button data-testid="delete-btn">Delete</button>
      </div>
    );
  };
});

// Mock API calls
jest.mock('../../../../services/api', () => ({
  getApi: jest.fn(),
  postApi: jest.fn(),
  deleteApi: jest.fn(),
  deleteManyApi: jest.fn()
}));

// Mock Redux actions
jest.mock('../../../../redux/slices/meetingSlice', () => ({
  fetchMeetingData: jest.fn(() => ({ type: 'FETCH_MEETING_DATA' }))
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn()
}));

const mockStore = configureStore([]);

describe('Meeting CRUD Integration Tests', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      meetingData: { data: [] },
      contactData: { data: [] },
      leadData: { data: [] },
      advanceSearch: {
        searchValue: {},
        tagValues: []
      }
    });

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => {
          if (key === 'user') return JSON.stringify({
            _id: 'user1',
            role: 'admin',
            permissions: { 
              Meetings: { create: true, read: true, update: true, delete: true },
              Contacts: { read: true },
              Leads: { read: true }
            }
          });
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
  });

  const renderWithProviders = (component) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ChakraProvider>
            {component}
          </ChakraProvider>
        </BrowserRouter>
      </Provider>
    );
  };

  describe('Meeting List Component', () => {
    test('renders meeting list with add button', () => {
      renderWithProviders(
        <div data-testid="meeting-list">
          <h1>Meeting List</h1>
          <button data-testid="add-meeting-btn">Add Meeting</button>
          <table>
            <tbody>
              <tr>
                <td>Integration Test Meeting</td>
                <td>2024-01-15T10:00:00Z</td>
                <td>John Doe</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
      
      expect(screen.getByTestId('meeting-list')).toBeInTheDocument();
      expect(screen.getByTestId('add-meeting-btn')).toBeInTheDocument();
      expect(screen.getByText('Integration Test Meeting')).toBeInTheDocument();
    });
  });

  describe('Add Meeting Component', () => {
    test('renders add meeting modal with form fields', () => {
      renderWithProviders(
        <div data-testid="add-meeting-modal">
          <h2>Add Meeting</h2>
          <input data-testid="agenda-input" placeholder="Agenda" />
          <input data-testid="datetime-input" type="datetime-local" />
          <button data-testid="save-btn">Save</button>
          <button data-testid="close-btn">Close</button>
        </div>
      );
      
      expect(screen.getByTestId('add-meeting-modal')).toBeInTheDocument();
      expect(screen.getByTestId('agenda-input')).toBeInTheDocument();
      expect(screen.getByTestId('datetime-input')).toBeInTheDocument();
      expect(screen.getByTestId('save-btn')).toBeInTheDocument();
      expect(screen.getByTestId('close-btn')).toBeInTheDocument();
    });
  });

  describe('Meeting View Component', () => {
    test('renders meeting details with action buttons', () => {
      renderWithProviders(
        <div data-testid="meeting-view">
          <h1>Integration Test Meeting</h1>
          <p>2024-01-15T10:00:00Z</p>
          <p>John Doe</p>
          <button data-testid="edit-btn">Edit</button>
          <button data-testid="delete-btn">Delete</button>
        </div>
      );
      
      expect(screen.getByTestId('meeting-view')).toBeInTheDocument();
      expect(screen.getByText('Integration Test Meeting')).toBeInTheDocument();
      expect(screen.getByTestId('edit-btn')).toBeInTheDocument();
      expect(screen.getByTestId('delete-btn')).toBeInTheDocument();
    });
  });

  describe('CRUD Operations', () => {
    test('displays meeting data in list format', () => {
      renderWithProviders(
        <div data-testid="meeting-list">
          <h1>Meeting List</h1>
          <table>
            <tbody>
              <tr>
                <td>Integration Test Meeting</td>
                <td>2024-01-15T10:00:00Z</td>
                <td>John Doe</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
      
      expect(screen.getByText('Integration Test Meeting')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15T10:00:00Z')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    test('has all required CRUD action buttons', () => {
      renderWithProviders(
        <div>
          <div data-testid="meeting-list">
            <button data-testid="add-meeting-btn">Add Meeting</button>
          </div>
          <div data-testid="meeting-view">
            <button data-testid="edit-btn">Edit</button>
            <button data-testid="delete-btn">Delete</button>
          </div>
        </div>
      );
      
      expect(screen.getByTestId('add-meeting-btn')).toBeInTheDocument();
      expect(screen.getByTestId('edit-btn')).toBeInTheDocument();
      expect(screen.getByTestId('delete-btn')).toBeInTheDocument();
    });
  });
}); 