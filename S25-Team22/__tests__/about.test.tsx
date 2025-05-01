/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import AboutPage from '../app/aboutpage/page'
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

describe('AboutPage', () => {
  const mockAboutData = [
    {
      section_name: 'our_mission',
      content: 'We aim to empower drivers.',
      last_updated: '2024-03-15T00:00:00.000Z',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchUserAttributes.mockResolvedValue({ 'custom:role': 'Admin' })

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockAboutData,
    })
  })


  it('renders welcome header and content', async () => {
    act(() => {
      render(<AboutPage />)
    });
    //expect(screen.getByText(/Loading.../i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Welcome to Our About Page/i)).toBeInTheDocument()
      expect(screen.getByText(/We aim to empower drivers/i)).toBeInTheDocument()
    })
  })

  it('displays edit button for Admins', async () => {
    act(() => {
      render(<AboutPage />)
    });

    await waitFor(() => {
      expect(screen.getByText(/Edit Page/i)).toBeInTheDocument()
    })
  })

  it('displays add users button for Admins', async () => {
    act(() => {
      render(<AboutPage />)
    });

    await waitFor(() => {
      expect(screen.getByText(/Add Users/i)).toBeInTheDocument()
    })
  })

  it('enters edit mode and shows Save button', async () => {
    act(() => {
      render(<AboutPage />)
    });

    await waitFor(() => {
      expect(screen.getByText(/Edit Page/i)).toBeInTheDocument()
    })

    act(() => {
      fireEvent.click(screen.getByText(/Edit Page/i))
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument()
    })
  })

  it('renders catalog and points buttons for Drivers', async () => {
    act(() => {
      mockFetchUserAttributes.mockResolvedValue({ 'custom:role': 'Driver' })
      render(<AboutPage />)
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Catalog/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Points/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Application/i })).toBeInTheDocument()
    })
  })

  it('displays error message if fetch fails', async () => {
    act(() => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
      render(<AboutPage />)
    });

    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument()
    })
  })
})