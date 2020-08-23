import React from 'react'
import ReactDOM from 'react-dom'
import { mount } from 'enzyme'
import { MemoryRouter } from 'react-router'
import { Recipe } from './Recipe'
import { Search } from './Search'
import { List } from './List'
import App from './App'

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

  const setState = jest.fn()
  const useStateSpy = jest.spyOn(React, 'useState')
  useStateSpy.mockImplementation((init) => [init, setState])

  it('renders without crashing when user is not signed in to google', () => {
    const div = document.createElement('div')
    ReactDOM.render(<App />, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  it('renders without crashing when user signs in using google and sets state to correct idToken', async () => {
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
    await mount(<App />) // Wait so we get onSignInFn assigned after mount completes
    onSignInFn(googleUser) // Simulate logging in
    expect(setState).toHaveBeenCalledWith('testIdToken') // state has been set to correct idToken
  })

  it.skip('renders Recipe component on /recipes/:id paths', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/recipes/1234']}>
        <App />
      </MemoryRouter>
    )
    expect(wrapper.find(Recipe)).toHaveLength(1)
    expect(wrapper.find(List)).toHaveLength(0)
  })

  it.skip('renders List component on /lists/:id paths', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/lists/1234']}>
        <App />
      </MemoryRouter>
    )
    expect(wrapper.find(List)).toHaveLength(1)
    expect(wrapper.find(Recipe)).toHaveLength(0)
  })

  it('renders Search component on / path', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(wrapper.find(Search)).toHaveLength(1)
    expect(wrapper.find(List)).toHaveLength(0)
    expect(wrapper.find(Recipe)).toHaveLength(0)
  })
})
