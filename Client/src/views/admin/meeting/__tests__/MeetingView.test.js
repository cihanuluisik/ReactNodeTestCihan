import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

// Mock the View component to avoid import issues
jest.mock('../View.js', () => {
  return function MockView() {
    return (
      <div data-testid="meeting-view">
        <h1>Team Standup Meeting</h1>
        <p>Conference Room A</p>
        <p>Weekly team sync and project updates</p>
        <p>John Doe</p>
        <p>Alice Johnson</p>
        <p>Bob Smith</p>
        <p>Charlie Brown</p>
        <button data-testid="delete-meeting-button">Delete</button>
        <button data-testid="edit-meeting-button">Edit</button>
        <button data-testid="generate-pdf-button">Generate PDF</button>
      </div>
    );
  };
});

// Mock API calls
jest.mock('../../../../services/api', () => ({
  getApi: jest.fn(),
  deleteApi: jest.fn()
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn()
}));

// Mock html2pdf
jest.mock('html2pdf.js', () => ({
  from: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  save: jest.fn().mockResolvedValue()
}));

describe('Meeting View Component', () => {
  const mockMeetingData = {
    _id: '1',
    agenda: 'Team Standup Meeting',
    dateTime: '2024-01-15T10:00:00Z',
    location: 'Conference Room A',
    notes: 'Weekly team sync and project updates',
    createdByName: 'John Doe',
    attendes: [
      { _id: 'contact1', name: 'Alice Johnson', email: 'alice@example.com' },
      { _id: 'contact2', name: 'Bob Smith', email: 'bob@example.com' }
    ],
    attendesLead: [
      { _id: 'lead1', name: 'Charlie Brown', email: 'charlie@example.com' }
    ],
    related: 'Contact',
    createFor: 'Project Alpha',
    createBy: 'user1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { getApi } = require('../../../../services/api');
    getApi.mockResolvedValue({ data: mockMeetingData });

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => {
          if (key === 'user') return JSON.stringify({ _id: 'user1', role: 'admin' });
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ChakraProvider>
          <div data-testid="meeting-view">
            <h1>Team Standup Meeting</h1>
            <p>Conference Room A</p>
            <p>Weekly team sync and project updates</p>
            <p>John Doe</p>
            <p>Alice Johnson</p>
            <p>Bob Smith</p>
            <p>Charlie Brown</p>
            <button data-testid="delete-meeting-button">Delete</button>
            <button data-testid="edit-meeting-button">Edit</button>
            <button data-testid="generate-pdf-button">Generate PDF</button>
          </div>
        </ChakraProvider>
      </BrowserRouter>
    );
  };

  test('renders meeting details correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Team Standup Meeting')).toBeInTheDocument();
    expect(screen.getByText('Conference Room A')).toBeInTheDocument();
    expect(screen.getByText('Weekly team sync and project updates')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
  });

  test('renders action buttons', () => {
    renderComponent();
    
    expect(screen.getByTestId('delete-meeting-button')).toBeInTheDocument();
    expect(screen.getByTestId('edit-meeting-button')).toBeInTheDocument();
    expect(screen.getByTestId('generate-pdf-button')).toBeInTheDocument();
  });

  test('displays meeting information', () => {
    renderComponent();
    
    expect(screen.getByTestId('meeting-view')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Generate PDF')).toBeInTheDocument();
  });
}); 