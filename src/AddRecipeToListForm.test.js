import React from 'react'
import { AddRecipeToListForm } from './AddRecipeToListForm'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserContext } from './UserContext'
import { Router } from 'react-router-dom'
import { api } from './services/api'

jest.mock('./services/api')

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn(), createHref: jest.fn() }

let listsData
const testUserId = 'testUser'
const recipeId = 'testRecipeId'

describe('AddRecipeToListForm component', () => {
  beforeEach(() => {
    listsData = {
      data: [{
        _id: 'list1',
        title: 'test shopping list',
        dateCreated: '12/04',
        dateLastEdited: '12/08',
        recipes: {
          href: '/api/v1/lists/list1/recipes'
        }
      }, {
        _id: 'list2',
        title: 'test list',
        dateCreated: '08/04',
        dateLastEdited: '01/08',
        recipes: {
          href: '/api/v1/lists/list2/recipes'
        }
      }]
    }

    api.getLists.mockResolvedValue(listsData)
    api.addRecipeToList.mockResolvedValue()
    api.createList.mockResolvedValue()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('recipe without servings and no shopping lists shows input to create new list but not for servings', async () => {
    api.getLists.mockResolvedValue({ data: [] })
    render(<Router history={historyMock}><UserContext.Provider value={testUserId}><AddRecipeToListForm recipeId={recipeId} /></UserContext.Provider></Router>)

    await waitFor(() => screen.getByText('New list')) // wait until dropdown is populated

    expect(screen.getByPlaceholderText('New list name')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Servings to add to list')).not.toBeInTheDocument()
  })

  describe('when adding recipe to list', () => {
    it('can add recipe to existing list', async () => {
      render(<Router history={historyMock}><UserContext.Provider value={testUserId}><AddRecipeToListForm recipeId={recipeId} recipeServings='4' /></UserContext.Provider></Router>)

      await waitFor(() => screen.getByText('test shopping list')) // wait until dropdown is populated
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'list1' } })

      const servingsText = screen.getByRole('textbox')
      expect(servingsText.value).toEqual('4') // Recipe has servings so it populates the servings input
      servingsText.setSelectionRange(0, servingsText.value.length)
      userEvent.type(servingsText, '6')
      await waitFor(() => userEvent.click(screen.getByLabelText('add recipe to list'))) // add to shopping list

      const expectedRecipeObject = {
        recipeId: 'testRecipeId',
        recipeServings: '6'
      }
      expect(api.addRecipeToList).toHaveBeenCalledWith(testUserId, 'list1', expectedRecipeObject)

      await waitFor(() => expect(screen.getByText('Recipe added to list')).toBeInTheDocument())
    })

    it('can add recipe to new list', async () => {
      api.createList.mockResolvedValue({ data: { _id: 'list3', title: 'what', recipes: { href: '/api/v1/lists/list3/recipes' } } })

      render(<Router history={historyMock}><UserContext.Provider value={testUserId}><AddRecipeToListForm recipeId={recipeId} recipeServings='4' /></UserContext.Provider></Router>)

      await waitFor(() => screen.getByText('test shopping list')) // wait until dropdown is populated
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'newlist' } })

      userEvent.type(screen.getAllByRole('textbox')[0], 'what')
      const servingsText = screen.getAllByRole('textbox')[1]
      expect(servingsText.value).toEqual('4') // Recipe has servings
      servingsText.setSelectionRange(0, servingsText.value.length)
      userEvent.type(servingsText, '2')

      await waitFor(() => userEvent.click(screen.getByLabelText('add recipe to list'))) // add to shopping list

      const expectedRecipeObject = {
        recipeId: 'testRecipeId',
        recipeServings: '2'
      }

      expect(api.createList).toHaveBeenCalledWith(testUserId, { title: 'what' })
      expect(api.addRecipeToList).toHaveBeenCalledWith(testUserId, 'list3', expectedRecipeObject)

      await waitFor(() => expect(screen.getByText('Recipe added to list')).toBeInTheDocument())
    })

    it('disables add button if new list name is not filled in', async () => {
      api.createList.mockResolvedValue({ data: { _id: 'list3', title: 'what', recipes: { href: '/api/v1/lists/list3/recipes' } } })

      render(<Router history={historyMock}><UserContext.Provider value={testUserId}><AddRecipeToListForm recipeId={recipeId} recipeServings='4' /></UserContext.Provider></Router>)

      await waitFor(() => screen.getByText('test shopping list')) // wait until dropdown is populated
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'newlist' } })

      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('disables add button if there is a servings field but it is not filled in', async () => {
      api.createList.mockResolvedValue({ data: { _id: 'list3', title: 'what', recipes: { href: '/api/v1/lists/list3/recipes' } } })

      render(<Router history={historyMock}><UserContext.Provider value={testUserId}><AddRecipeToListForm recipeId={recipeId} recipeServings='4' /></UserContext.Provider></Router>)

      await waitFor(() => screen.getByText('test shopping list')) // wait until dropdown is populated
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'list1' } })

      expect(screen.getByRole('button')).not.toBeDisabled()

      const servingsText = screen.getByRole('textbox')
      servingsText.setSelectionRange(0, servingsText.value.length)
      userEvent.clear(servingsText)

      expect(screen.getByRole('button')).toBeDisabled()
    })
  })
})
