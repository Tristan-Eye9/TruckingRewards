/**
 * @jest-environment jsdom
 *

import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import HomePage from '../app/admin/home/page'
import { useRouter } from 'next/navigation'
import { fetchUserAttributes } from 'aws-amplify/auth'


jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    pathname: '/',
    query: {},
  })),
}));

jest.mock('aws-amplify/auth', () => ({
  fetchUserAttributes: jest.fn(() => Promise.resolve({
    'custom:role': 'Admin',
    'email': 'test@example.com'
  })),
  getCurrentUser: jest.fn(() => Promise.resolve({
    username: "test-user",
    attributes: {
      email: "test@example.com",
    },
  })),
}))

global.fetch = jest.fn()
const mockFetchUserAttributes = fetchUserAttributes as jest.Mock
const mockFetch = global.fetch as jest.Mock

describe('HomePage', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchUserAttributes.mockResolvedValue({ 'custom:role': 'Admin', "custom:sponsorCompany": "MockSponsor" })
  
      const mockDrivers = [
        { driverEmail: "driver1@example.com", sponsorCompanyID: "123" },
        { driverEmail: "driver2@example.com", sponsorCompanyID: "123" },
      ];
  
      const mockPointsData = {
        totalPoints: 4200,
      };

  
      global.fetch = jest.fn()
        // First fetch: drivers list
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDrivers,
        })
        // Second fetch: driver 1 points
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPointsData,
        })
        // Third fetch: driver 2 points
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPointsData,
        }) as jest.Mock;
  })

  it('renders welcome header and content', async () => {
    act(() => {
      render(<HomePage />)
    });

    await waitFor(() => {
      expect(screen.getByText((content) =>
        content.includes("You are logged in as a sponsor for"))).toBeInTheDocument();
    })
  })

  it('displays driver in table', async () => {

    act(() => {
      render(<HomePage />)
    });

    await waitFor(() => {
      expect(screen.getByText(/driver1@example.com/i)).toBeInTheDocument()
    })
  })


  it('renders catalog and points buttons', async () => {
    act(() => {
      render(<HomePage />)
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Catalog/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Points/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Application/i })).toBeInTheDocument()
    })
  })

  
})

*/