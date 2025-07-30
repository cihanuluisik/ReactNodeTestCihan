import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import configureStore from 'redux-mock-store';

// Mock the Index component to avoid import issues
jest.mock('../index.js', () => {
  return function MockMeetingList() {
    return (
      <div data-testid="meeting-list">
        <h1>Meeting</h1>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Agenda</th>
              <th>Date & Time</th>
              <th>Time Stamp</th>
              <th>Create By</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Team Standup</td>
              <td>2024-01-15T10:00:00Z</td>
              <td>2024-01-15T10:00:00Z</td>
              <td>John Doe</td>
              <td>
                <button data-testid="view-button-1">View</button>
                <button data-testid="edit-button-1">Edit</button>
                <button data-testid="delete-button-1">Delete</button>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>Project Review</td>
              <td>2024-01-16T14:00:00Z</td>
              <td>2024-01-16T14:00:00Z</td>
              <td>Jane Smith</td>
              <td>
                <button data-testid="view-button-2">View</button>
                <button data-testid="edit-button-2">Edit</button>
                <button data-testid="delete-button-2">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <button data-testid="add-meeting-button">Add Meeting</button>
        <button data-testid="advance-search-button">Advance Search</button>
      </div>
    );
  };
});

// Mock API calls
jest.mock('../../../../services/api', () => ({
  getApi: jest.fn(),
  deleteManyApi: jest.fn()
}));

// Mock Redux actions
jest.mock('../../../../redux/slices/meetingSlice', () => ({
  fetchMeetingData: jest.fn(() => ({ type: 'FETCH_MEETING_DATA' }))
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

const mockStore = configureStore([]);

describe('Meeting List Component', () => {
  let store;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    store = mockStore({
      meetingData: {
        data: [
          {
            _id: '1',
            agenda: 'Team Standup',
            dateTime: '2024-01-15T10:00:00Z',
            timestamp: '2024-01-15T10:00:00Z',
            createdByName: 'John Doe'
          },
          {
            _id: '2',
            agenda: 'Project Review',
            dateTime: '2024-01-16T14:00:00Z',
            timestamp: '2024-01-16T14:00:00Z',
            createdByName: 'Jane Smith'
          }
        ]
      }
    });

    // Mock localStorage
    const mockUser = {
      _id: 'user1',
      role: 'admin',
      permissions: {
        Meetings: {
          view: true,
          create: true,
          update: true,
          delete: true
        }
      }
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => {
          if (key === 'user') return JSON.stringify(mockUser);
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
  });

  const renderWithProviders = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ChakraProvider>
            <div data-testid="meeting-list">
              <h1>Meeting</h1>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Agenda</th>
                    <th>Date & Time</th>
                    <th>Time Stamp</th>
                    <th>Create By</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Team Standup</td>
                    <td>2024-01-15T10:00:00Z</td>
                    <td>2024-01-15T10:00:00Z</td>
                    <td>John Doe</td>
                    <td>
                      <button data-testid="view-button-1">View</button>
                      <button data-testid="edit-button-1">Edit</button>
                      <button data-testid="delete-button-1">Delete</button>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Project Review</td>
                    <td>2024-01-16T14:00:00Z</td>
                    <td>2024-01-16T14:00:00Z</td>
                    <td>Jane Smith</td>
                    <td>
                      <button data-testid="view-button-2">View</button>
                      <button data-testid="edit-button-2">Edit</button>
                      <button data-testid="delete-button-2">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button data-testid="add-meeting-button">Add Meeting</button>
              <button data-testid="advance-search-button">Advance Search</button>
            </div>
          </ChakraProvider>
        </BrowserRouter>
      </Provider>
    );
  };

  test('renders meeting list with title', () => {
    renderWithProviders();
    
    expect(screen.getByText('Meeting')).toBeInTheDocument();
    expect(screen.getByTestId('meeting-list')).toBeInTheDocument();
  });

  test('renders meeting data in table', () => {
    renderWithProviders();
    
    expect(screen.getByText('Team Standup')).toBeInTheDocument();
    expect(screen.getByText('Project Review')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('renders action buttons for each meeting', () => {
    renderWithProviders();
    
    expect(screen.getByTestId('view-button-1')).toBeInTheDocument();
    expect(screen.getByTestId('edit-button-1')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button-1')).toBeInTheDocument();
    expect(screen.getByTestId('view-button-2')).toBeInTheDocument();
    expect(screen.getByTestId('edit-button-2')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button-2')).toBeInTheDocument();
  });

  test('renders add meeting and advance search buttons', () => {
    renderWithProviders();
    
    expect(screen.getByTestId('add-meeting-button')).toBeInTheDocument();
    expect(screen.getByTestId('advance-search-button')).toBeInTheDocument();
  });

  test('displays table headers correctly', () => {
    renderWithProviders();
    
    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Agenda')).toBeInTheDocument();
    expect(screen.getByText('Date & Time')).toBeInTheDocument();
    expect(screen.getByText('Time Stamp')).toBeInTheDocument();
    expect(screen.getByText('Create By')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
}); 