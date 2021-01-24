import React from 'react'
import { mount } from 'enzyme'
import axios from 'axios'
import { EditableRecipe } from './EditableRecipe'
import { act } from 'react-dom/test-utils'
import { UserContext } from './UserContext'

jest.mock('axios')

let recipeData
let basicRecipeData

describe('EditableRecipe component', () => {
  beforeEach(() => {
    recipeData = {
      _id: 'testId',
      userId: 'testUser',
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
      userId: 'testUser',
      title: 'testRecipe',
      ingredients: [{ quantity: 1, unit: 'g', name: 'test ingredient', displayQuantity: '1' }, { name: 'test ingredient without quantity or unit' }],
      ingredientList: [
        { ingredient: '1 g test ingredient' },
        { ingredient: 'test ingredient without quantity or unit' }
      ],
      instructions: ''
    }

    axios.put.mockResolvedValue()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders form when server returns a recipe', () => {
    const wrapper = mount(<UserContext.Provider value='testUser'><EditableRecipe initialRecipe={recipeData} /></UserContext.Provider>)

    const titleText = wrapper.find('#titleText').at(0)
    expect(titleText.props().value).toEqual(recipeData.title)
    const urlText = wrapper.find('#urlText').at(0)
    expect(urlText.props().value).toEqual(recipeData.url)
    const sourceText = wrapper.find('#sourceText').at(0)
    expect(sourceText.props().value).toEqual(recipeData.source)
    const authorText = wrapper.find('#authorText').at(0)
    expect(authorText.props().value).toEqual(recipeData.author)
    const imageText = wrapper.find('#imageText').at(0)
    expect(imageText.props().value).toEqual(recipeData.image)
    const tagsText = wrapper.find('#tagsText').at(0)
    expect(tagsText.props().value).toEqual('test, new')
    const servingsText = wrapper.find('#servingsText').at(0)
    expect(servingsText.props().value).toEqual(recipeData.servings)
    const prepTimeText = wrapper.find('#prepTimeText').at(0)
    expect(prepTimeText.props().value).toEqual(recipeData.prepTime)
    const cookingTimeText = wrapper.find('#cookingTimeText').at(0)
    expect(cookingTimeText.props().value).toEqual(recipeData.cookingTime)
    const ingredientListText = wrapper.find('#ingredientListText').at(0)
    expect(ingredientListText.props().value).toEqual('1 g test ingredient\ntest ingredient without quantity or unit\n# test group\n1 cup test ingredient2\n1 g test ingredient3\n# new group\n1 test ingredient without unit')
    const instructionsText = wrapper.find('#instructionsText').at(0)
    expect(instructionsText.props().value).toEqual(recipeData.instructions)
    const storageText = wrapper.find('#storageText').at(0)
    expect(storageText.props().value).toEqual(recipeData.storage)
    const notesText = wrapper.find('#notesText').at(0)
    expect(notesText.props().value).toEqual(recipeData.notes)
    const equipmentText = wrapper.find('#equipmentText').at(0)
    expect(equipmentText.props().value).toEqual(recipeData.equipment)
    const caloriesText = wrapper.find('#caloriesText').at(0)
    expect(caloriesText.props().value).toEqual(recipeData.calories)
    const proteinText = wrapper.find('#proteinText').at(0)
    expect(proteinText.props().value).toEqual(recipeData.protein)
    const carbsText = wrapper.find('#carbsText').at(0)
    expect(carbsText.props().value).toEqual(recipeData.carbs)
    const fatText = wrapper.find('#fatText').at(0)
    expect(fatText.props().value).toEqual(recipeData.fat)
    const ratingText = wrapper.find('#ratingText').at(0)
    expect(ratingText.props().value).toEqual(recipeData.rating)
    const freezableCheck = wrapper.find('#freezableCheck').at(0)
    expect(freezableCheck.props().checked).toEqual(recipeData.freezable)
    const tryCheck = wrapper.find('#tryCheck').at(0)
    expect(tryCheck.props().checked).toEqual(recipeData.wantToTry)
    const doneCheck = wrapper.find('#doneCheck').at(0)
    expect(doneCheck.props().checked).toEqual(recipeData.done)
  })

  it('renders editable recipe with basic data', () => {
    const wrapper = mount(<UserContext.Provider value='testUser'><EditableRecipe initialRecipe={basicRecipeData} /></UserContext.Provider>)
    const titleText = wrapper.find('#titleText').at(0)
    expect(titleText.props().value).toEqual(recipeData.title)
    const ingredientListText = wrapper.find('#ingredientListText').at(0)
    expect(ingredientListText.props().value).toEqual('1 g test ingredient\ntest ingredient without quantity or unit')
    const instructionsText = wrapper.find('#instructionsText').at(0)
    expect(instructionsText.props().value).toEqual(recipeData.instructions)
    const freezableCheck = wrapper.find('#freezableCheck').at(0)
    expect(freezableCheck.props().checked).toEqual(false)
    const tryCheck = wrapper.find('#tryCheck').at(0)
    expect(tryCheck.props().checked).toEqual(false)
    const doneCheck = wrapper.find('#doneCheck').at(0)
    expect(doneCheck.props().checked).toEqual(false)
  })

  it('handles a form submit and updates recipe in server', async () => {
    const wrapper = mount(<UserContext.Provider value='testUser'><EditableRecipe initialRecipe={recipeData} /></UserContext.Provider>)

    const titleText = wrapper.find('#titleText').at(0)
    titleText.simulate('change', { target: { value: 'new title', name: 'title' } })
    const urlText = wrapper.find('#urlText').at(0)
    urlText.simulate('change', { target: { value: 'new url', name: 'url' } })
    const sourceText = wrapper.find('#sourceText').at(0)
    sourceText.simulate('change', { target: { value: 'new source', name: 'source' } })
    const authorText = wrapper.find('#authorText').at(0)
    authorText.simulate('change', { target: { value: 'new author', name: 'author' } })
    const imageText = wrapper.find('#imageText').at(0)
    imageText.simulate('change', { target: { value: 'new image', name: 'image' } })
    const tagsText = wrapper.find('#tagsText').at(0)
    tagsText.simulate('change', { target: { value: 'new tags', name: 'tags' } })
    const servingsText = wrapper.find('#servingsText').at(0)
    servingsText.simulate('change', { target: { value: 'new servings', name: 'servings' } })
    const prepTimeText = wrapper.find('#prepTimeText').at(0)
    prepTimeText.simulate('change', { target: { value: 'new preptime', name: 'prepTime' } })
    const cookingTimeText = wrapper.find('#cookingTimeText').at(0)
    cookingTimeText.simulate('change', { target: { value: 'new cooking time', name: 'cookingTime' } })
    const ingredientListText = wrapper.find('#ingredientListText').at(0)
    ingredientListText.simulate('change', { target: { value: 'new ingredients', name: 'ingredientList' } })
    const instructionsText = wrapper.find('#instructionsText').at(0)
    instructionsText.simulate('change', { target: { value: 'new instructions', name: 'instructions' } })
    const storageText = wrapper.find('#storageText').at(0)
    storageText.simulate('change', { target: { value: 'new storage', name: 'storage' } })
    const notesText = wrapper.find('#notesText').at(0)
    notesText.simulate('change', { target: { value: 'new notes', name: 'notes' } })
    const equipmentText = wrapper.find('#equipmentText').at(0)
    equipmentText.simulate('change', { target: { value: 'new equipment', name: 'equipment' } })
    const caloriesText = wrapper.find('#caloriesText').at(0)
    caloriesText.simulate('change', { target: { value: 'new cals', name: 'calories' } })
    const proteinText = wrapper.find('#proteinText').at(0)
    proteinText.simulate('change', { target: { value: 'new protein', name: 'protein' } })
    const carbsText = wrapper.find('#carbsText').at(0)
    carbsText.simulate('change', { target: { value: 'new carbs', name: 'carbs' } })
    const fatText = wrapper.find('#fatText').at(0)
    fatText.simulate('change', { target: { value: 'new fats', name: 'fat' } })
    const ratingText = wrapper.find('#ratingText').at(0)
    ratingText.simulate('change', { target: { value: 'new rating', name: 'rating' } })
    const freezableCheck = wrapper.find('#freezableCheck').at(0)
    freezableCheck.simulate('change', { target: { checked: true, name: 'freezable', type: 'checkbox' } })
    const tryCheck = wrapper.find('#tryCheck').at(0)
    tryCheck.simulate('change', { target: { checked: true, name: 'wantToTry', type: 'checkbox' } })
    const doneCheck = wrapper.find('#doneCheck').at(0)
    doneCheck.simulate('change', { target: { checked: true, name: 'done', type: 'checkbox' } })

    const form = wrapper.find('form')
    await act(async () => {
      form.simulate('submit')
    })

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
      rating: 'new rating',
      freezable: true,
      wantToTry: true,
      done: true
    }

    expect(axios.put).toHaveBeenCalledTimes(1)
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.put).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/testId', expectedRecipeObject)
  })

  it('handles changing the rating', async () => {
    const wrapper = mount(<UserContext.Provider value='testUser'><EditableRecipe initialRecipe={recipeData} /></UserContext.Provider>)
    const starsWrapper = wrapper.find('StarRating').at(0)

    const starButton = starsWrapper.find('.starButton').at(0)
    starButton.simulate('click') // click on first star button

    const form = wrapper.find('form')
    await act(async () => {
      form.simulate('submit')
    })

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

    expect(axios.put).toHaveBeenCalledTimes(1)
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.put).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/testId', expectedRecipeObject)
  })

  it('cancels edit when clicking cancel button', async () => {
    const editRecipeMock = jest.fn()
    const wrapper = mount(<UserContext.Provider value='testUser'><EditableRecipe initialRecipe={recipeData} editRecipe={editRecipeMock} /></UserContext.Provider>)
    const cancelButton = wrapper.find('.cancelEdit').at(0)
    cancelButton.simulate('click') // cancel edit recipe
    expect(editRecipeMock).toHaveBeenCalledTimes(1)
    expect(editRecipeMock).toHaveBeenCalledWith(false)
  })
})
