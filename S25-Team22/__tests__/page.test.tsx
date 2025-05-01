/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Page from '../app/page'
 
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

describe('Page', () => {

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the truck image', () => {
    render(<Page />)
    const image = screen.getByRole('img', { name: 'Trucks' })
    expect(image).toBeInTheDocument()
  })

  it('renders the welcome heading', () => {
    render(<Page />)
    expect(
      screen.getByRole('heading', { name: 'Welcome Mother Trucker!' })
    ).toBeInTheDocument()
  })

  it('renders the subheading text', () => {
    render(<Page />)
    expect(
      screen.getByText('Please sign in or sign up to continue.')
    ).toBeInTheDocument()
  })

  it('renders the Sign In and Sign Up buttons', () => {
    render(<Page />)
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
  })

})