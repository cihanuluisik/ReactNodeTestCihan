import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureStore([]);

// Default store state for tests
const defaultStoreState = {
  meetingData: { data: [] },
  contactData: { data: [] },
  leadData: { data: [] },
  advanceSearch: {
    searchValue: {},
    tagValues: []
  }
};

// Default user data for tests
const defaultUserData = {
  _id: 'user1',
  role: 'admin',
  permissions: { 
    Meetings: { create: true, read: true, update: true, delete: true },
    Contacts: { read: true },
    Leads: { read: true }
  }
};

/**
 * Custom render function that includes all necessary providers
 * @param {React.Component} component - Component to render
 * @param {Object} options - Render options
 * @param {Object} options.storeState - Redux store state
 * @param {Object} options.userData - User data for localStorage
 * @param {Object} options.route - Route configuration
 * @returns {Object} Render result with utilities
 */
export function renderWithProviders(
  component,
  {
    storeState = defaultStoreState,
    userData = defaultUserData,
    route = '/',
    ...renderOptions
  } = {}
) {
  const store = mockStore(storeState);
  
  // Mock localStorage
  localStorage.getItem.mockReturnValue(JSON.stringify(userData));
  
  const Wrapper = ({ children }) => {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <ChakraProvider>
            {children}
          </ChakraProvider>
        </BrowserRouter>
      </Provider>
    );
  };
  
  return {
    store,
    ...render(component, { wrapper: Wrapper, ...renderOptions })
  };
}

/**
 * Mock API responses for common operations
 */
export const mockApiResponses = {
  // Meeting API mocks
  meeting: {
    create: { status: 201, data: { _id: '1', agenda: 'Test Meeting' } },
    get: { status: 200, data: { _id: '1', agenda: 'Test Meeting' } },
    update: { status: 200, data: { _id: '1', agenda: 'Updated Meeting' } },
    delete: { status: 200, data: { message: 'Meeting deleted successfully' } },
    list: { 
      status: 200, 
      data: [
        { _id: '1', agenda: 'Meeting 1', dateTime: '2024-01-15T10:00:00Z' },
        { _id: '2', agenda: 'Meeting 2', dateTime: '2024-01-16T10:00:00Z' }
      ] 
    }
  },
  
  // Contact API mocks
  contact: {
    list: { 
      status: 200, 
      data: [
        { _id: 'contact1', name: 'John Doe', email: 'john@example.com' },
        { _id: 'contact2', name: 'Jane Smith', email: 'jane@example.com' }
      ] 
    }
  },
  
  // Lead API mocks
  lead: {
    list: { 
      status: 200, 
      data: [
        { _id: 'lead1', name: 'Lead 1', email: 'lead1@example.com' },
        { _id: 'lead2', name: 'Lead 2', email: 'lead2@example.com' }
      ] 
    }
  }
};

/**
 * Create mock meeting data for tests
 */
export const createMockMeeting = (overrides = {}) => ({
  _id: '1',
  agenda: 'Test Meeting',
  dateTime: '2024-01-15T10:00:00Z',
  timestamp: '2024-01-15T10:00:00Z',
  location: 'Conference Room A',
  notes: 'Test meeting notes',
  createdByName: 'John Doe',
  attendes: [],
  attendesLead: [],
  related: 'None',
  createFor: '',
  createBy: 'user1',
  ...overrides
});

/**
 * Create mock user data for tests
 */
export const createMockUser = (overrides = {}) => ({
  _id: 'user1',
  role: 'admin',
  permissions: { 
    Meetings: { create: true, read: true, update: true, delete: true },
    Contacts: { read: true },
    Leads: { read: true }
  },
  ...overrides
});

/**
 * Wait for loading states to complete
 */
export const waitForLoadingToFinish = async () => {
  await new Promise(resolve => setTimeout(resolve, 0));
};

/**
 * Mock navigation functions
 */
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  replace: jest.fn()
};

/**
 * Setup common mocks for tests
 */
export const setupCommonMocks = () => {
  // Mock react-router-dom
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigation.navigate,
    useParams: () => ({ id: '1' }),
    useLocation: () => ({ pathname: '/meeting' })
  }));

  // Mock API calls
  jest.mock('services/api', () => ({
    getApi: jest.fn(),
    postApi: jest.fn(),
    putApi: jest.fn(),
    deleteApi: jest.fn(),
    deleteManyApi: jest.fn()
  }));

  // Mock Redux actions
  jest.mock('../../redux/slices/meetingSlice', () => ({
    fetchMeetingData: jest.fn(() => ({ type: 'FETCH_MEETING_DATA' }))
  }));

  // Mock toast notifications
  jest.mock('react-toastify', () => ({
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
  }));
};

/**
 * Clean up mocks after tests
 */
export const cleanupMocks = () => {
  jest.clearAllMocks();
  localStorage.getItem.mockClear();
  localStorage.setItem.mockClear();
  localStorage.removeItem.mockClear();
}; 