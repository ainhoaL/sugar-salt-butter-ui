import React from 'react'
import { Lists } from './Lists'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserContext } from './UserContext'
import { Router } from 'react-router-dom'
import { api } from './services/api'

jest.mock('./services/api')

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn(), createHref: jest.fn() }

let listsData
const testUserId = 'testUser'

describe('Lists component', () => {
  beforeEach(() => {
    listsData = {
      data: [{
        _id: 'testId',
        userId: testUserId,
        title: 'test shopping list',
        items: [
          { _id: 'item1', quantity: 1, unit: 'g', name: 'test ingredient', displayQuantity: '1', recipeId: 'recipe1', servings: 1 },
          { _id: 'item2', name: 'test ingredient without quantity or unit', recipeId: 'recipe1', servings: 1 }
        ]
      }, {
        _id: 'testId2',
        userId: testUserId,
        title: 'test shopping list 2',
        items: [
          { _id: 'item2', name: 'test ingredient without quantity or unit', recipeId: 'recipe1', servings: 1 }
        ]
      }]
    }

    api.getLists.mockResolvedValue(listsData)
    api.deleteList.mockResolvedValue()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does not get lists if there is no idToken', () => {
    render(<Router history={historyMock}><UserContext.Provider value=''><Lists /></UserContext.Provider></Router>)

    expect(api.getLists).toHaveBeenCalledTimes(0)
  })

  it('gets list when receiving an idToken and displays lists', async () => {
    render(<Router history={historyMock}><UserContext.Provider value='testUser'><Lists /></UserContext.Provider></Router>)

    expect(api.getLists).toHaveBeenCalledTimes(1)
    expect(api.getLists).toHaveBeenCalledWith(testUserId)

    await waitFor(() => screen.getByText('test shopping list')) // list title
    expect(screen.getByText('test shopping list 2')).toBeInTheDocument()
  })

  it('renders no items if there are no lists', async () => {
    api.getLists.mockResolvedValue({ data: [] })
    render(<Router history={historyMock}><UserContext.Provider value='testUser'><Lists /></UserContext.Provider></Router>)

    expect(api.getLists).toHaveBeenCalledTimes(1)
    expect(api.getLists).toHaveBeenCalledWith(testUserId)

    await waitFor(() => expect(screen.queryByText('test shopping list')).not.toBeInTheDocument()) // no lists to display
  })

  it('redirects to list page if there is only one list', async () => {
    api.getLists.mockResolvedValue({
      data: [{
        _id: 'testId',
        userId: testUserId,
        title: 'test shopping list',
        items: [
          { _id: 'item1', quantity: 1, unit: 'g', name: 'test ingredient', displayQuantity: '1', recipeId: 'recipe1', servings: 1 },
          { _id: 'item2', name: 'test ingredient without quantity or unit', recipeId: 'recipe1', servings: 1 }
        ]
      }]
    })
    render(<Router history={historyMock}><UserContext.Provider value='testUser'><Lists /></UserContext.Provider></Router>)

    await waitFor(() => expect(historyMock.push).toHaveBeenCalledTimes(1))
    expect(historyMock.push).toHaveBeenCalledWith('/lists/testId')
  })

  it('can delete list', async () => {
    render(<Router history={historyMock}><UserContext.Provider value='testUser'><Lists /></UserContext.Provider></Router>)

    await waitFor(() => userEvent.click(screen.getAllByLabelText('delete list')[0])) // click delete button

    expect(api.deleteList).toHaveBeenCalledTimes(1)
    expect(api.deleteList).toHaveBeenCalledWith(testUserId, 'testId')

    expect(api.getLists).toHaveBeenCalledTimes(2)
    expect(api.getLists).toHaveBeenCalledWith(testUserId)
  })
})
