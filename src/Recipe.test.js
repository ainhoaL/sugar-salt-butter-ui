import React from 'react'
import { Recipe } from './Recipe'
import { render, screen, waitFor } from '@testing-library/react'
import { UserContext } from './UserContext'
import { Router } from 'react-router-dom'
import { api } from './services/api'

jest.mock('./services/api')
const historyMock = { push: jest.fn(), location: {}, listen: jest.fn(), createHref: jest.fn() }

let recipeData
let basicRecipeData
let listsData
const testUserId = 'testUser'

describe('Recipe component', () => {
  beforeEach(() => {
    recipeData = {
      data: {
        _id: 'testId',
        userId: testUserId,
        title: 'testRecipe',
        url: 'http://fake',
        author: 'test author',
        image: '',
        source: 'test source',
        ingredients: [
          { quantity: 1, unit: 'g', name: 'test ingredient', displayQuantity: '1' },
          { name: 'test ingredient without quantity or unit' },
          { quantity: 1, unit: 'cup', name: 'test ingredient2', group: 'test group', displayQuantity: '1' },
          { quantity: 1, unit: 'g', name: 'test ingredient3', group: 'test group', displayQuantity: '1' },
          { quantity: 1, name: 'test ingredient without unit', group: 'new group', displayQuantity: '1' }
        ],
        tags: ['test', 'new'],
        instructions: '',
        servings: 4,
        prepTime: '20m',
        cookingTime: '30m',
        nutrition: { carbs: 90, protein: 68, fat: 24, calories: 700 },
        rating: 3,
        freezable: false,
        wantToTry: false,
        storage: 'fridge',
        notes: 'new recipe',
        done: false,
        equipment: 'pan'
      }
    }

    basicRecipeData = {
      data: {
        _id: '1234',
        userId: 'testUser',
        title: 'testRecipe',
        ingredients: [{ quantity: 1, unit: 'g', name: 'test ingredient', displayQuantity: '1' }, { name: 'test ingredient without quantity or unit' }],
        instructions: ''
      }
    }

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
    api.getRecipe.mockResolvedValue(recipeData)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does not get recipe if there is no idToken', () => {
    const match = { params: { id: 'testId' } }
    const location = { search: '' }
    render(<Router history={historyMock}><UserContext.Provider value=''><Recipe location={location} match={match} /></UserContext.Provider></Router>)

    expect(api.getRecipe).toHaveBeenCalledTimes(0)
  })

  it('gets recipe by Id when receiving an idToken', async () => {
    const match = { params: { id: 'testId' } }
    const location = { search: '' }
    render(<Router history={historyMock}><UserContext.Provider value={testUserId}><Recipe location={location} match={match} /></UserContext.Provider></Router>)

    expect(api.getRecipe).toHaveBeenCalledWith(testUserId, 'testId')
    await waitFor(() => expect(screen.getByText('Add to shopping list'))) // Read only recipe
  })

  describe('when recipe is readonly', () => {
    it('renders readonly recipe when edit is not set', async () => {
      const match = { params: { id: 'testId' } }
      render(<Router history={historyMock}><UserContext.Provider value={testUserId}><Recipe location={location} match={match} /></UserContext.Provider></Router>)

      await waitFor(() => expect(screen.getByText('Add to shopping list'))) // Read only recipe
      expect(screen.queryByLabelText('Title')).not.toBeInTheDocument() // Editable recipe not visible
    })

    it('renders readonly recipe when edit is set to false', async () => {
      const match = { params: { id: 'testId' } }
      const location = { search: '?edit=false' }
      render(<Router history={historyMock}><UserContext.Provider value={testUserId}><Recipe location={location} match={match} /></UserContext.Provider></Router>)

      await waitFor(() => expect(screen.getByText('Add to shopping list'))) // Read only recipe
      expect(screen.queryByLabelText('Title')).not.toBeInTheDocument() // Editable recipe not visible

      // TODO: check child component got right options
    })

    it('renders readonly recipe with basic data', async () => {
      api.getRecipe.mockResolvedValue(basicRecipeData)

      const match = { params: { id: '1234' } }
      const location = { search: '?edit=false' }
      render(<Router history={historyMock}><UserContext.Provider value={testUserId}><Recipe location={location} match={match} /></UserContext.Provider></Router>)

      await waitFor(() => expect(screen.getByText('Add to shopping list'))) // Read only recipe
      expect(screen.queryByLabelText('Title')).not.toBeInTheDocument() // Editable recipe not visible

      // TODO: check child component got right options
    })
  })

  describe('when recipe is editable', () => {
    it('renders form when server returns a recipe', async () => {
      const match = { params: { id: 'testId' } }
      const location = { search: '?edit=true' }
      render(<Router history={historyMock}><UserContext.Provider value={testUserId}><Recipe location={location} match={match} /></UserContext.Provider></Router>)

      await waitFor(() => expect(screen.queryByRole('heading')).not.toBeInTheDocument()) // Read only recipe not visible
      expect(screen.getByLabelText('Title')).toBeInTheDocument() // Editable recipe visible

      // TODO: check child component got right options
    })

    it('does not render form when server does not return a recipe', async () => {
      api.getRecipe.mockResolvedValue({})

      const match = { params: { id: '1234' } }
      const location = { search: '?edit=true' }
      render(<Router history={historyMock}><UserContext.Provider value={testUserId}><Recipe location={location} match={match} /></UserContext.Provider></Router>)

      await waitFor(() => expect(screen.queryByRole('heading')).not.toBeInTheDocument()) // Read only recipe not visible
      expect(screen.queryByLabelText('Title')).not.toBeInTheDocument() // Editable recipe not visible
    })

    it('renders editable recipe with basic data', async () => {
      api.getRecipe.mockResolvedValue(basicRecipeData)
      const match = { params: { id: '1234' } }
      const location = { search: '?edit=true' }
      render(<Router history={historyMock}><UserContext.Provider value={testUserId}><Recipe location={location} match={match} /></UserContext.Provider></Router>)

      await waitFor(() => expect(screen.queryByRole('heading')).not.toBeInTheDocument()) // Read only recipe not visible
      expect(screen.queryByLabelText('Title')).toBeInTheDocument() // Editable recipe not visible

      // TODO: check child component got right options
    })
  })
})
