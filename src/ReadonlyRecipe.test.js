import React from 'react'
import { ReadonlyRecipe } from './ReadonlyRecipe'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserContext } from './UserContext'
import { Router } from 'react-router-dom'
import { api } from './services/api'

jest.mock('./services/api')

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn(), createHref: jest.fn() }

let recipeData
let basicRecipeData
let listsData
const testUserId = 'testUser'

describe('ReadonlyRecipe component', () => {
  beforeEach(() => {
    recipeData = {
      _id: 'testId',
      userId: testUserId,
      title: 'testRecipe',
      url: 'http://fake',
      author: 'test author',
      image: 'test image',
      source: 'test source',
      ingredients: [
        { quantity: 1, unit: 'g', name: 'test ingredient', displayQuantity: '1' },
        { name: 'test ingredient without quantity or unit' },
        { quantity: 1, unit: 'cup', name: 'test ingredient2', group: 'test group', displayQuantity: '1' },
        { quantity: 1, unit: 'g', name: 'test ingredient3', group: 'test group', displayQuantity: '1' },
        { quantity: 1, name: 'test ingredient without unit', group: 'new group', displayQuantity: '1' }
      ],
      ingredientList: [
        { ingredient: '1 g test ingredient' },
        { ingredient: 'test ingredient without quantity or unit' },
        { groupHeader: 'test group' },
        { ingredient: '1 cup test ingredient2' },
        { ingredient: '1 g test ingredient3' },
        { groupHeader: 'new group' },
        { ingredient: '1 test ingredient without unit' }
      ],
      tags: ['testtag', 'newtag'],
      instructions: 'cook everything together',
      servings: 4,
      prepTime: '20m',
      cookingTime: '30m',
      carbs: 90,
      protein: 68,
      fat: 24,
      calories: 700,
      rating: 3,
      freezable: false,
      wantToTry: false,
      storage: 'fridge',
      notes: 'new recipe',
      done: false,
      equipment: 'pan'
    }

    basicRecipeData = {
      _id: '1234',
      userId: testUserId,
      title: 'testRecipe',
      ingredients: [{ quantity: 1, unit: 'g', name: 'test ingredient', displayQuantity: '1' }, { name: 'test ingredient without quantity or unit' }],
      ingredientList: [
        { ingredient: '1 g test ingredient' },
        { ingredient: 'test ingredient without quantity or unit' }
      ],
      instructions: 'basic instructions'
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
    api.addRecipeToList.mockResolvedValue()
    api.createList.mockResolvedValue()
    api.deleteRecipe.mockResolvedValue()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders readonly recipe with basic data', async () => {
    render(<Router history={historyMock}><UserContext.Provider value={testUserId}><ReadonlyRecipe recipe={basicRecipeData} /></UserContext.Provider></Router>)

    expect(api.getLists).toHaveBeenCalledWith(testUserId)

    await waitFor(() => screen.getByText('test shopping list')) // wait until dropdown is populated

    expect(screen.getByText('testRecipe')).toBeInTheDocument()
    expect(screen.getByTestId('ingredientsContainer')).toHaveTextContent('Ingredients: 1 g test ingredienttest ingredient without quantity or unit')
    expect(screen.getByTestId('instructionsContainer')).toHaveTextContent('Instructions: basic instructions')
    expect(screen.queryByRole('img')).not.toBeInTheDocument() // There is no recipe image because the data does not have an image
  })

  it('renders readonly recipe with a broken image', async () => {
    const dataWithBrokenImg = {
      _id: '1234',
      userId: testUserId,
      title: 'testRecipe',
      ingredients: [{ quantity: 1, unit: 'g', name: 'test ingredient', displayQuantity: '1' }, { name: 'test ingredient without quantity or unit' }],
      ingredientList: [
        { ingredient: '1 g test ingredient' },
        { ingredient: 'test ingredient without quantity or unit' }
      ],
      instructions: 'basic instructions',
      image: 'fakeImage'
    }

    render(<Router history={historyMock}><UserContext.Provider value={testUserId}><ReadonlyRecipe recipe={dataWithBrokenImg} /></UserContext.Provider></Router>)

    expect(api.getLists).toHaveBeenCalledWith(testUserId)

    await waitFor(() => screen.getByText('test shopping list')) // wait until dropdown is populated

    expect(screen.getByText('testRecipe')).toBeInTheDocument()
    fireEvent.error(screen.getByRole('img')) // Image cannot be fetched
    expect(screen.queryByRole('img')).not.toBeInTheDocument() // There is no recipe image because the data does not have an image
  })

  it('renders readonly recipe with all data', async () => {
    render(<Router history={historyMock}><UserContext.Provider value={testUserId}><ReadonlyRecipe recipe={recipeData} /></UserContext.Provider></Router>)

    expect(api.getLists).toHaveBeenCalledWith(testUserId)

    await waitFor(() => screen.getByText('test shopping list')) // wait until dropdown is populated

    expect(screen.getByText('testRecipe')).toBeInTheDocument()
    expect(screen.getByText('test source by test author')).toBeInTheDocument()
    expect(screen.getByText('test source by test author')).toHaveAttribute('href', 'http://fake')
    expect(screen.getAllByRole('img')[0]).toHaveAttribute('src', 'test image')

    expect(screen.getByAltText('3 star set')).toBeInTheDocument() // Rating stars stop at 3
    expect(screen.queryByAltText('4 star set')).not.toBeInTheDocument()

    // tags
    expect(screen.getByText('testtag'))
    userEvent.click(screen.getByText('testtag'))
    expect(historyMock.push).toHaveBeenCalledWith('/?tags=testtag')
    expect(screen.getByText('newtag'))
    userEvent.click(screen.getByText('newtag'))
    expect(historyMock.push).toHaveBeenCalledWith('/?tags=newtag')

    const ingredientsList = 'Ingredients: 1 g test ingredienttest ingredient without quantity or unittest group: 1 cup test ingredient21 g test ingredient3new group: 1 test ingredient without unit'
    expect(screen.getByTestId('ingredientsContainer')).toHaveTextContent(ingredientsList)

    expect(screen.getByTestId('instructionsContainer')).toHaveTextContent('Instructions: cook everything together')
    expect(screen.getByTestId('storageContainer')).toHaveTextContent('Storage: fridge')
    expect(screen.getByTestId('notesContainer')).toHaveTextContent('Notes: new recipe')
    expect(screen.getByTestId('equipmentContainer')).toHaveTextContent('Equipment: pan')
    expect(screen.getByTestId('nutritionContainer')).toHaveTextContent('Nutritional information: Calories: 700 Protein: 68 Carbs: 90 Fat: 24')
  })

  it('sets recipe to edit when clicking edit button', async () => {
    const editRecipeMock = jest.fn()
    render(<Router history={historyMock}><UserContext.Provider value={testUserId}><ReadonlyRecipe recipe={basicRecipeData} editRecipe={editRecipeMock} /></UserContext.Provider></Router>)

    await waitFor(() => userEvent.click(screen.getByAltText('edit recipe'))) // edit recipe

    expect(editRecipeMock).toHaveBeenCalledTimes(1)
    expect(editRecipeMock).toHaveBeenCalledWith(true)
  })

  it('tries to delete recipe when clicking delete button', async () => {
    render(<Router history={historyMock}><UserContext.Provider value={testUserId}><ReadonlyRecipe recipe={basicRecipeData} /></UserContext.Provider></Router>)

    await waitFor(() => userEvent.click(screen.getByAltText('delete recipe'))) // delete recipe

    expect(api.deleteRecipe).toHaveBeenCalledWith(testUserId, basicRecipeData._id)

    await waitFor(() => expect(screen.getByText('Recipe deleted')).toBeInTheDocument())
  })
})
