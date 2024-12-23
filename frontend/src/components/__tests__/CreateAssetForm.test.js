import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import CreateAssetForm from '../CreateAssetForm';

// Mock axios
jest.mock('axios');

describe('CreateAssetForm', () => {
  beforeEach(() => {
    // Clear mock before each test
    jest.clearAllMocks();
  });

  test('renders form elements correctly', () => {
    render(<CreateAssetForm />);
    
    // Check if all form elements are present
    expect(screen.getByPlaceholderText('Asset Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Category')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Rarity')).toBeInTheDocument();
    expect(screen.getByText('Create Asset')).toBeInTheDocument();
  });

  test('submits form data correctly', async () => {
    // Mock successful API call
    axios.post.mockResolvedValueOnce({});
    
    render(<CreateAssetForm />);
    
    // Fill in form fields
    fireEvent.change(screen.getByPlaceholderText('Asset Name'), {
      target: { value: 'Test Asset' },
    });
    fireEvent.change(screen.getByPlaceholderText('Category'), {
      target: { value: 'Weapon' },
    });
    fireEvent.change(screen.getByPlaceholderText('Rarity'), {
      target: { value: '5' },
    });

    // Submit form
    fireEvent.click(screen.getByText('Create Asset'));

    // Verify API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/create-asset', {
        name: 'Test Asset',
        category: 'Weapon',
        rarity: 5,
      });
    });
  });

  test('handles API error correctly', async () => {
    // Mock failed API call
    const errorMessage = 'Error creating asset';
    axios.post.mockRejectedValueOnce(new Error(errorMessage));
    
    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error');
    
    render(<CreateAssetForm />);
    
    // Fill and submit form
    fireEvent.change(screen.getByPlaceholderText('Asset Name'), {
      target: { value: 'Test Asset' },
    });
    fireEvent.click(screen.getByText('Create Asset'));

    // Verify error handling
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
}); 