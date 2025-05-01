/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import HomePage from '../app/driver/home/page'
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
    'custom:role': 'Driver',
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
    mockFetchUserAttributes.mockResolvedValue({ 'custom:role': 'Driver', 'email': 'test@example.com' })

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { sponsorCompanyName: 'MockSponsor', points: 2500 },
        ]),
      })
    ) as jest.Mock;
  })

  it('renders welcome header and content', async () => {
    act(() => {
      render(<HomePage />)
    });

    await waitFor(() => {
      expect(screen.getByText((content) =>
        content.includes("You are logged in as a driver, a true Mother Trucker!"))).toBeInTheDocument();
    })
  })

  it('displays sponsor company in table', async () => {

    act(() => {
      render(<HomePage />)
    });

    await waitFor(() => {
      expect(screen.getByText(/MockSponsor/i)).toBeInTheDocument()
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