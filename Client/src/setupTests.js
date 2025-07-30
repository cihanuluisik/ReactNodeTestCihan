import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});
global.localStorage = localStorageMock;

// Mock toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock moment.js
jest.mock('moment', () => {
  const moment = jest.requireActual('moment');
  return moment;
});

// Mock html2pdf
jest.mock('html2pdf.js', () => ({
  from: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  save: jest.fn().mockResolvedValue(),
})); 