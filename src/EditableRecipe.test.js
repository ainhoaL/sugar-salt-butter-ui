import React from 'react'
import { EditableRecipe } from './EditableRecipe'
import { UserContext } from './UserContext'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { api } from './services/api'

jest.mock('./services/api')

let recipeData
let basicRecipeData
const testUserId = 'testUser'

describe('EditableRecipe component', () => {
  beforeEach(() => {
    recipeData = {
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
      ingredientList: [
        { ingredient: '1 g test ingredient' },
        { ingredient: 'test ingredient without quantity or unit' },
        { groupHeader: 'test group' },
        { ingredient: '1 cup test ingredient2' },
        { ingredient: '1 g test ingredient3' },
        { groupHeader: 'new group' },
        { ingredient: '1 test ingredient without unit' }
      ],
      tags: ['test', 'new'],
      instructions: '',
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
      instructions: ''
    }

    api.updateRecipe.mockResolvedValue()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders form when server returns a recipe', () => {
    render(<UserContext.Provider value='testUser'><EditableRecipe initialRecipe={recipeData} /></UserContext.Provider>)

    expect(screen.getByLabelText('Title').value).toEqual(recipeData.title)
    expect(screen.getByLabelText('Link').value).toEqual(recipeData.url)
    expect(screen.getByLabelText('Source').value).toEqual(recipeData.source)
    expect(screen.getByLabelText('Author').value).toEqual(recipeData.author)
    expect(screen.getByLabelText('Image Url').value).toEqual(recipeData.image)
    expect(screen.getByLabelText('Tags').value).toEqual('test, new')
    expect(screen.getByLabelText('Servings').value).toEqual(recipeData.servings.toString())
    expect(screen.getByLabelText('Prep Time').value).toEqual(recipeData.prepTime)
    expect(screen.getByLabelText('Cooking Time').value).toEqual(recipeData.cookingTime)
    expect(screen.getByLabelText('Ingredients').value).toEqual('1 g test ingredient\ntest ingredient without quantity or unit\n# test group\n1 cup test ingredient2\n1 g test ingredient3\n# new group\n1 test ingredient without unit')
    expect(screen.getByLabelText('Instructions').value).toEqual(recipeData.instructions)
    expect(screen.getByLabelText('Storage').value).toEqual(recipeData.storage)
    expect(screen.getByLabelText('Notes').value).toEqual(recipeData.notes)
    expect(screen.getByLabelText('Equipment').value).toEqual(recipeData.equipment)
    expect(screen.getByLabelText('Calories').value).toEqual(recipeData.calories.toString())
    expect(screen.getByLabelText('Protein').value).toEqual(recipeData.protein.toString())
    expect(screen.getByLabelText('Carbs').value).toEqual(recipeData.carbs.toString())
    expect(screen.getByLabelText('Fat').value).toEqual(recipeData.fat.toString())
    expect(screen.getByLabelText('Want to try').checked).toEqual(recipeData.wantToTry)
    expect(screen.getByLabelText('Tried').checked).toEqual(recipeData.done)
    expect(screen.getByLabelText('Freezable').checked).toEqual(recipeData.freezable)
    expect(screen.getByAltText('3 star set')).toBeInTheDocument() // Rating stars stop at 3
    expect(screen.queryByAltText('4 star set')).not.toBeInTheDocument()
  })

  it('renders editable recipe with basic data', () => {
    render(<UserContext.Provider value='testUser'><EditableRecipe initialRecipe={basicRecipeData} /></UserContext.Provider>)

    expect(screen.getByLabelText('Title').value).toEqual(recipeData.title)
    expect(screen.getByLabelText('Ingredients').value).toEqual('1 g test ingredient\ntest ingredient without quantity or unit')
    expect(screen.getByLabelText('Instructions').value).toEqual(recipeData.instructions)
    expect(screen.getByLabelText('Want to try').checked).toEqual(false)
    expect(screen.getByLabelText('Tried').checked).toEqual(false)
    expect(screen.getByLabelText('Freezable').checked).toEqual(false)
  })

  it('handles a form submit and updates recipe in server', async () => {
    render(<UserContext.Provider value='testUser'><EditableRecipe initialRecipe={recipeData} /></UserContext.Provider>)

    const titleInput = screen.getByLabelText('Title')
    titleInput.setSelectionRange(0, titleInput.value.length)
    userEvent.type(titleInput, 'new title')
    const linkInput = screen.getByLabelText('Link')
    linkInput.setSelectionRange(0, linkInput.value.length)
    userEvent.type(linkInput, 'new url')
    const sourceInput = screen.getByLabelText('Source')
    sourceInput.setSelectionRange(0, sourceInput.value.length)
    userEvent.type(sourceInput, 'new source')
    const authorInput = screen.getByLabelText('Author')
    authorInput.setSelectionRange(0, authorInput.value.length)
    userEvent.type(authorInput, 'new author')
    const imgInput = screen.getByLabelText('Image Url')
    imgInput.setSelectionRange(0, imgInput.value.length)
    userEvent.type(imgInput, 'new image')
    const tagsInput = screen.getByLabelText('Tags')
    tagsInput.setSelectionRange(0, tagsInput.value.length)
    userEvent.type(tagsInput, 'new tags')
    const servingsInput = screen.getByLabelText('Servings')
    servingsInput.setSelectionRange(0, servingsInput.value.length)
    userEvent.type(servingsInput, 'new servings')
    const prepTimeInput = screen.getByLabelText('Prep Time')
    prepTimeInput.setSelectionRange(0, prepTimeInput.value.length)
    userEvent.type(prepTimeInput, 'new preptime')
    const cookTimeInput = screen.getByLabelText('Cooking Time')
    cookTimeInput.setSelectionRange(0, cookTimeInput.value.length)
    userEvent.type(cookTimeInput, 'new cooking time')
    const ingredientsInput = screen.getByLabelText('Ingredients')
    ingredientsInput.setSelectionRange(0, ingredientsInput.value.length)
    userEvent.type(ingredientsInput, 'new ingredients')
    const instructionsInput = screen.getByLabelText('Instructions')
    instructionsInput.setSelectionRange(0, instructionsInput.value.length)
    userEvent.type(instructionsInput, 'new instructions')
    const storageInput = screen.getByLabelText('Storage')
    storageInput.setSelectionRange(0, storageInput.value.length)
    userEvent.type(storageInput, 'new storage')
    const notesInput = screen.getByLabelText('Notes')
    notesInput.setSelectionRange(0, notesInput.value.length)
    userEvent.type(notesInput, 'new notes')
    const equipmentInput = screen.getByLabelText('Equipment')
    equipmentInput.setSelectionRange(0, equipmentInput.value.length)
    userEvent.type(equipmentInput, 'new equipment')
    const caloriesInput = screen.getByLabelText('Calories')
    caloriesInput.setSelectionRange(0, caloriesInput.value.length)
    userEvent.type(caloriesInput, 'new cals')
    const proteinInput = screen.getByLabelText('Protein')
    proteinInput.setSelectionRange(0, proteinInput.value.length)
    userEvent.type(proteinInput, 'new protein')
    const carbsInput = screen.getByLabelText('Carbs')
    carbsInput.setSelectionRange(0, carbsInput.value.length)
    userEvent.type(carbsInput, 'new carbs')
    const fatsInput = screen.getByLabelText('Fat')
    fatsInput.setSelectionRange(0, fatsInput.value.length)
    userEvent.type(fatsInput, 'new fats')
    userEvent.click(screen.getByLabelText('Want to try'))
    userEvent.click(screen.getByLabelText('Tried'))
    userEvent.click(screen.getByLabelText('Freezable'))

    userEvent.click(screen.getByText('Update'))

    const expectedRecipeObject =
    {
      _id: 'testId',
      userId: 'testUser',
      title: 'new title',
      url: 'new url',
      source: 'new source',
      author: 'new author',
      image: 'new image',
      tags: 'new tags',
      servings: 'new servings',
      prepTime: 'new preptime',
      cookingTime: 'new cooking time',
      ingredients: 'new ingredients',
      instructions: 'new instructions',
      storage: 'new storage',
      notes: 'new notes',
      equipment: 'new equipment',
      nutrition: {
        calories: 'new cals',
        protein: 'new protein',
        carbs: 'new carbs',
        fat: 'new fats'
      },
      rating: 3,
      freezable: true,
      wantToTry: true,
      done: true
    }

    expect(api.updateRecipe).toHaveBeenCalledTimes(1)
    expect(api.updateRecipe).toHaveBeenCalledWith(testUserId, 'testId', expectedRecipeObject)

    await waitFor(() => screen.getByText('Recipe updated'))
  })

  it('handles changing the rating', async () => {
    render(<UserContext.Provider value='testUser'><EditableRecipe initialRecipe={recipeData} /></UserContext.Provider>)

    userEvent.click(screen.getByAltText('1 star set')) // click on first star button

    userEvent.click(screen.getByText('Update'))

    const expectedRecipeObject = {
      _id: 'testId',
      userId: 'testUser',
      title: 'testRecipe',
      url: 'http://fake',
      author: 'test author',
      image: '',
      source: 'test source',
      ingredients: '1 g test ingredient\ntest ingredient without quantity or unit\n# test group\n1 cup test ingredient2\n1 g test ingredient3\n# new group\n1 test ingredient without unit',
      tags: 'test, new',
      instructions: '',
      servings: 4,
      prepTime: '20m',
      cookingTime: '30m',
      nutrition: { carbs: 90, protein: 68, fat: 24, calories: 700 },
      rating: 1,
      freezable: false,
      wantToTry: false,
      storage: 'fridge',
      notes: 'new recipe',
      done: false,
      equipment: 'pan'
    }

    expect(api.updateRecipe).toHaveBeenCalledTimes(1)
    expect(api.updateRecipe).toHaveBeenCalledWith(testUserId, 'testId', expectedRecipeObject)

    await waitFor(() => screen.getByText('Recipe updated'))
  })

  it('cancels edit when clicking cancel button', () => {
    const editRecipeMock = jest.fn()
    render(<UserContext.Provider value='testUser'><EditableRecipe initialRecipe={recipeData} editRecipe={editRecipeMock} /></UserContext.Provider>)

    userEvent.click(screen.getByText('Cancel')) // cancel edit recipe

    expect(editRecipeMock).toHaveBeenCalledTimes(1)
    expect(editRecipeMock).toHaveBeenCalledWith(false)
  })
})
