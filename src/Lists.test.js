import React from 'react'
import { mount } from 'enzyme'
import axios from 'axios'
import { Lists } from './Lists'
import { act } from 'react-dom/test-utils'
import { Router } from 'react-router-dom'
import { UserContext } from './UserContext'

jest.mock('axios')
const historyMock = { push: jest.fn(), location: {}, listen: jest.fn() }

let listsData

describe('Lists component', () => {
  beforeEach(() => {
    listsData = {
      data: [{
        _id: 'testId',
        userId: 'testUser',
        title: 'test shopping list',
        items: [
          { _id: 'item1', quantity: 1, unit: 'g', name: 'test ingredient', displayQuantity: '1', recipeId: 'recipe1', servings: 1 },
          { _id: 'item2', name: 'test ingredient without quantity or unit', recipeId: 'recipe1', servings: 1 }
        ]
      }, {
        _id: 'testId2',
        userId: 'testUser',
        title: 'test shopping list 2',
        items: [
          { _id: 'item2', name: 'test ingredient without quantity or unit', recipeId: 'recipe1', servings: 1 }
        ]
      }]
    }

    axios.get.mockResolvedValue(listsData)
    axios.delete.mockResolvedValue()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does not get lists if there is no idToken', () => {
    act(() => {
      mount(<UserContext.Provider value=''><Lists /></UserContext.Provider>)
    })

    expect(axios.get).toHaveBeenCalledTimes(0)
  })

  it('gets list when receiving an idToken and displays lists', async () => {
    let wrapper
    await act(async () => {
      wrapper = mount(<UserContext.Provider value='testUser'><Lists /></UserContext.Provider>)
    })

    await axios
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists')

    await act(async () => {
      wrapper.update() // Re-render component
    })

    expect(wrapper.find('ListGroupItem').length).toEqual(2) // 1 list
  })

  it('renders nothing if there are no lists', async () => {
    axios.get.mockResolvedValue({ data: [] })
    let wrapper
    await act(async () => {
      wrapper = mount(<UserContext.Provider value='testUser'><Lists /></UserContext.Provider>)
    })
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists')

    await axios
    await act(async () => {
      wrapper.update() // Re-render component
    })

    expect(wrapper.find('ListGroupItem').length).toEqual(0) // No lists to display
  })

  it('redirects to list page if there is only one list', async () => {
    axios.get.mockResolvedValue({
      data: [{
        _id: 'testId',
        userId: 'testUser',
        title: 'test shopping list',
        items: [
          { _id: 'item1', quantity: 1, unit: 'g', name: 'test ingredient', displayQuantity: '1', recipeId: 'recipe1', servings: 1 },
          { _id: 'item2', name: 'test ingredient without quantity or unit', recipeId: 'recipe1', servings: 1 }
        ]
      }]
    })
    await act(async () => {
      mount(<Router history={historyMock}><UserContext.Provider value='testUser'><Lists /></UserContext.Provider></Router>)
    })

    await axios
    expect(historyMock.push).toHaveBeenCalledTimes(1)
    expect(historyMock.push).toHaveBeenCalledWith('/lists/testId')
  })

  it('can delete list', async () => {
    let wrapper
    await act(async () => {
      wrapper = mount(<UserContext.Provider value='testUser'><Lists /></UserContext.Provider>)
    })

    await axios
    await act(async () => {
      wrapper.update() // Re-render component
      const deleteButton = wrapper.find('.deleteListItem').at(0)
      deleteButton.simulate('click') // Delete first list
    })

    await axios
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.delete).toHaveBeenCalledTimes(1)
    expect(axios.delete).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists/testId')
  })
})
