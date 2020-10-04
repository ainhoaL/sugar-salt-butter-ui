import React from 'react'
import { mount } from 'enzyme'
import { TagsMenu } from './TagsMenu'
import axios from 'axios'
import { act } from 'react-dom/test-utils'
import { Router } from 'react-router-dom'
import { UserContext } from './UserContext'

jest.mock('axios')
const historyMock = { push: jest.fn(), location: {}, listen: jest.fn(), createHref: jest.fn() }

describe('TagsMenu component', () => {
  const tags = {
    data: [
      { _id: 'meat', count: 20 },
      { _id: 'vegetarian', count: 1 }
    ]
  }

  beforeEach(() => {
    axios.get.mockResolvedValue(tags)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does not get tags if there is no idToken', () => {
    act(() => {
      mount(<UserContext.Provider value=''><TagsMenu /></UserContext.Provider>)
    })

    expect(axios.get).toHaveBeenCalledTimes(0)
  })

  it('gets tags and displays them if there is idToken', async () => {
    let wrapper
    await act(async () => {
      wrapper = mount(
        <Router history={historyMock}>
          <UserContext.Provider value='testUser'><TagsMenu /></UserContext.Provider>
        </Router>
      )
    })
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/tags')

    wrapper.update() // Re-render component
    expect(wrapper.find('li').length).toEqual(2) // 2 tags
    const firstLink = wrapper.find('Link').at(0)
    expect(firstLink.props().to).toEqual('/?tags=meat') // First tag Link directs to correct tag
    expect(firstLink.text()).toEqual('meat (20)')
    const secondLink = wrapper.find('Link').at(1)
    expect(secondLink.props().to).toEqual('/?tags=vegetarian')
    expect(secondLink.text()).toEqual('vegetarian (1)')
  })

  it('displays no tags if none are returned', async () => {
    axios.get.mockResolvedValue({ data: [] })
    let wrapper
    await act(async () => {
      wrapper = mount(
        <Router history={historyMock}>
          <UserContext.Provider value='testUser'><TagsMenu /></UserContext.Provider>
        </Router>
      )
    })
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/tags')

    wrapper.update() // Re-render component
    expect(wrapper.find('li').length).toEqual(0)
  })
})
