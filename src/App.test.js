import React from 'react'
import ReactDOM from 'react-dom'
import { mount } from 'enzyme'
import { MemoryRouter } from 'react-router'
import { Recipe } from './Recipe'
import { Home } from './Home'
import App from './App'

describe('App component', () => {
  window.gapi = {
    load: () => { }
  }
  it('renders without crashing when user is not signed in to google', () => {
    const div = document.createElement('div')
    ReactDOM.render(<App />, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  it('renders without crashing when user signs in using google', () => {
    let googleUser = {
      getBasicProfile: () => {
        return {
          getId: () => { return 'testUser' },
          getName: () => { return 'testName' },
          getEmail: () => { return 'testEmail' }
        }
      },
      getAuthResponse: () => { return { id_token: 'testIdToken' } }
    }
    const wrapper = mount(<App />)
    const instance = wrapper.instance()
    expect(wrapper.state('idToken')).toEqual(null)
    instance.onSignIn(googleUser)
    expect(wrapper.state('idToken')).toEqual('testIdToken')
    wrapper.update()
  })

  it.skip('renders Recipe component on /recipes/:id paths', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/recipes/1234']}>
        <App />
      </MemoryRouter>
    )
    expect(wrapper.find(Recipe)).toHaveLength(1)
  })

  it('renders Home component on / path', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={[ '/' ]}>
        <App />
      </MemoryRouter>
    )
    expect(wrapper.find(Home)).toHaveLength(1)
  })
})
