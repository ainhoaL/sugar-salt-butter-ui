import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { act } from 'react-dom/test-utils'
import App from './App'

jest.mock('./Dashboard', () => {
  return {
    Dashboard: () => {
      return <div>DashboardComponentMock</div>
    }
  }
})

describe('App component', () => {
  let onSignInFn

  window.gapi = {
    load: (type, callback) => {
      callback()
    },
    auth2: {
      init: () => {
        return Promise.resolve()
      }
    },
    signin2: {
      render: (type, options) => {
        onSignInFn = options.onsuccess
      }
    }
  }

  it('renders without crashing when user is not signed in to google', () => {
    render(<App />)

    // TODO: check user is not signed in?
  })

  it('user can sign in using google', async () => {
    const googleUser = {
      getBasicProfile: () => {
        return {
          getId: () => { return 'testUser' },
          getName: () => { return 'testName' },
          getEmail: () => { return 'testEmail' }
        }
      },
      getAuthResponse: () => { return { id_token: 'testIdToken' } }
    }
    await render(<App />) // Wait so we get onSignInFn assigned after mount completes
    act(() => {
      onSignInFn(googleUser) // Simulate logging in
    })

    // TODO: check correct idToken has been passed to User context or check signed in from google
  })

  it.skip('renders Recipe component on /recipes/:id paths', () => {
    render(
      <MemoryRouter initialEntries={['/recipes/1234']}>
        <App />
      </MemoryRouter>
    )
  })

  it.skip('renders List component on /lists/:id paths', () => {
    render(
      <MemoryRouter initialEntries={['/lists/1234']}>
        <App />
      </MemoryRouter>
    )
  })

  it('renders Dashboard component on / path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('DashboardComponentMock')).toBeInTheDocument()
  })

  it.skip('renders Lists component on /lists path', () => {
    render(
      <MemoryRouter initialEntries={['/lists']}>
        <App />
      </MemoryRouter>
    )
  })
})
