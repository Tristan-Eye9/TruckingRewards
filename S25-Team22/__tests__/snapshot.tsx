/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react";
import Page from "../app/page";
import React from 'react'

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

it("renders initial page unchanged", () => {
  const { container } = render(<Page />);
  expect(container).toMatchSnapshot();
});