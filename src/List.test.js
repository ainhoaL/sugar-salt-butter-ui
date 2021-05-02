import React from 'react'
import { List } from './List'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserContext } from './UserContext'
import { Router } from 'react-router-dom'
import { api } from './services/api'

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn(), createHref: jest.fn() }

jest.mock('./services/api')

let listData
const testUserId = 'testUser'

describe('List component', () => {
  beforeEach(() => {
    listData = {
      data: {
        _id: 'testId',
        userId: testUserId,
        title: 'test shopping list',
        items: [
          { _id: 'item1', quantity: 1, unit: 'g', name: 'test ingredient', displayQuantity: '1', recipeId: 'recipe1', servings: 1 },
          { _id: 'item2', name: 'test ingredient without quantity or unit', recipeId: 'recipe1', servings: 1 },
          { _id: 'item3', quantity: 1, unit: 'cup', name: 'test ingredient2', group: 'test group', displayQuantity: '1', recipeId: 'recipe1', servings: 1 },
          { _id: 'item4', quantity: 1, unit: 'g', name: 'test ingredient3', group: 'test group', displayQuantity: '1', recipeId: 'recipe2' },
          { _id: 'item5', quantity: 1, name: 'test ingredient without unit', group: 'new group', displayQuantity: '1', recipeId: 'recipe2' }
        ],
        recipes: {
          href: '/api/v1/lists/testId/recipes',
          recipesData: [
            {
              _id: 'recipe1',
              title: 'first recipe',
              image: '/img.png',
              servings: 1,
              href: '/api/v1/lists/testId/recipes/recipe1'
            },
            {
              _id: 'recipe2',
              title: 'second recipe',
              image: '/recipe.jpeg',
              href: '/api/v1/lists/testId/recipes/recipe2'
            }
          ]
        }
      }
    }

    api.getList.mockResolvedValue(listData)
    api.deleteRecipeFromList.mockResolvedValue()
    api.deleteItemFromList.mockResolvedValue()
    api.deleteList.mockResolvedValue()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does not get list if there is no idToken', () => {
    const match = { params: { id: 'testId' } }
    render(<Router history={historyMock}><UserContext.Provider value=''><List match={match} /></UserContext.Provider></Router>)

    expect(api.getList).toHaveBeenCalledTimes(0)
  })

  it('gets list by Id when receiving an idToken and displays list', async () => {
    const match = { params: { id: 'testId' } }
    render(<Router history={historyMock}><UserContext.Provider value='testUser'><List match={match} /></UserContext.Provider></Router>)

    expect(api.getList).toHaveBeenCalledTimes(1)
    expect(api.getList).toHaveBeenCalledWith(testUserId, 'testId')

    await waitFor(() => screen.getByText('test shopping list')) // list title
    expect(screen.getByText('1 g test ingredient')).toBeInTheDocument() // 5 list items
    expect(screen.getByText('test ingredient without quantity or unit')).toBeInTheDocument()
    expect(screen.getByText('1 cup test ingredient2')).toBeInTheDocument()
    expect(screen.getByText('1 g test ingredient3')).toBeInTheDocument()
    expect(screen.getByText('1 test ingredient without unit')).toBeInTheDocument()
    expect(screen.getByText('first recipe')).toBeInTheDocument() // 2 recipes
    expect(screen.getByText('second recipe')).toBeInTheDocument()
  })

  it('renders nothing if list does not exist', async () => {
    api.getList.mockResolvedValue({ data: null })
    const match = { params: { id: 'testId' } }
    render(<Router history={historyMock}><UserContext.Provider value='testUser'><List match={match} /></UserContext.Provider></Router>)

    expect(api.getList).toHaveBeenCalledTimes(1)
    expect(api.getList).toHaveBeenCalledWith(testUserId, 'testId')

    await waitFor(() => expect(screen.queryByText('test shopping list')).not.toBeInTheDocument()) // list title // No list to display
  })

  it('renders no items if list has no items', async () => {
    api.getList.mockResolvedValue({
      data: {
        _id: 'testId',
        userId: 'testUser',
        title: 'test shopping list',
        items: [],
        recipes: {
          href: '/api/v1/lists/testId/recipes'
        }
      }
    })
    const match = { params: { id: 'testId' } }
    render(<Router history={historyMock}><UserContext.Provider value='testUser'><List match={match} /></UserContext.Provider></Router>)

    expect(api.getList).toHaveBeenCalledTimes(1)
    expect(api.getList).toHaveBeenCalledWith(testUserId, 'testId')

    await waitFor(() => screen.getByText('test shopping list')) // list title
  })

  it('can delete recipe from list', async () => {
    const match = { params: { id: 'testId' } }
    render(<Router history={historyMock}><UserContext.Provider value='testUser'><List match={match} /></UserContext.Provider></Router>)

    await waitFor(() => userEvent.click(screen.getAllByLabelText('delete recipe')[0])) // click delete button

    expect(api.deleteRecipeFromList).toHaveBeenCalledTimes(1)
    expect(api.deleteRecipeFromList).toHaveBeenCalledWith(testUserId, 'testId', 'recipe1')

    expect(api.getList).toHaveBeenCalledTimes(2)
    expect(api.getList).toHaveBeenCalledWith(testUserId, 'testId')
  })

  it('hovering over recipe highlights list items', async () => {
    const match = { params: { id: 'testId' } }
    render(<Router history={historyMock}><UserContext.Provider value='testUser'><List match={match} /></UserContext.Provider></Router>)

    await waitFor(() => screen.getByText('test shopping list')) // list title

    fireEvent.mouseEnter(screen.getByText('first recipe'))

    expect(screen.getByText('1 g test ingredient')).toHaveClass('recipeSelected')
    expect(screen.getByText('test ingredient without quantity or unit')).toHaveClass('recipeSelected')
    expect(screen.getByText('1 cup test ingredient2')).toHaveClass('recipeSelected')
    expect(screen.getByText('1 g test ingredient3')).not.toHaveClass('recipeSelected')

    fireEvent.mouseLeave(screen.getByText('first recipe'))

    expect(screen.getByText('1 g test ingredient')).not.toHaveClass('recipeSelected')
    expect(screen.getByText('test ingredient without quantity or unit')).not.toHaveClass('recipeSelected')
    expect(screen.getByText('1 cup test ingredient2')).not.toHaveClass('recipeSelected')
    expect(screen.getByText('1 g test ingredient3')).not.toHaveClass('recipeSelected')
  })

  it('can delete item from list', async () => {
    const match = { params: { id: 'testId' } }
    render(<Router history={historyMock}><UserContext.Provider value='testUser'><List match={match} /></UserContext.Provider></Router>)

    await waitFor(() => userEvent.click(screen.getAllByLabelText('delete item')[0])) // click delete button

    expect(api.deleteItemFromList).toHaveBeenCalledTimes(1)
    expect(api.deleteItemFromList).toHaveBeenCalledWith(testUserId, 'testId', 'item1')

    expect(api.getList).toHaveBeenCalledTimes(2)
    expect(api.getList).toHaveBeenCalledWith(testUserId, 'testId')
  })

  it('tries to delete list when clicking delete button', async () => {
    const match = { params: { id: 'testId' } }
    render(<Router history={historyMock}><UserContext.Provider value='testUser'><List match={match} /></UserContext.Provider></Router>)

    await waitFor(() => userEvent.click(screen.getByAltText('delete list'))) // click delete button

    expect(api.deleteList).toHaveBeenCalledTimes(1)
    expect(api.deleteList).toHaveBeenCalledWith(testUserId, 'testId')

    await waitFor(() => expect(screen.getByText('List deleted')).toBeInTheDocument())
  })
})
