import React from 'react'
import { mount } from 'enzyme'
import axios from 'axios'
import { Recipe } from './Recipe'
import { act } from 'react-dom/test-utils'
import { Router } from 'react-router-dom'

jest.mock('axios')
const historyMock = { push: jest.fn(), location: {}, listen: jest.fn(), createHref: jest.fn() }

let recipeData
let basicRecipeData
let listsData

const expectedProcessedRecipeData = {
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

const expectedProcessedBasicRecipeData = {
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

describe('Recipe component', () => {
  beforeEach(() => {
    recipeData = {
      data: {
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

    axios.get.mockImplementation((url) => {
      if (url.indexOf('/lists') > -1) {
        return Promise.resolve(listsData)
      } else {
        return Promise.resolve(recipeData)
      }
    })
    axios.put.mockResolvedValue()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does not get recipe if there is no idToken', () => {
    const match = { params: { id: 'testId' } }
    const location = { search: '' }
    act(() => {
      mount(<Router history={historyMock}><Recipe location={location} match={match} /></Router>)
    })

    expect(axios.get).toHaveBeenCalledTimes(0)
  })

  it('gets recipe by Id when receiving an idToken', async () => {
    const match = { params: { id: 'testId' } }
    const location = { search: '' }
    await act(async () => {
      mount(<Router history={historyMock}><Recipe location={location} match={match} idToken='testUser' /></Router>)
    })
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/testId')
  })

  describe('when recipe is readonly', () => {
    it('renders readonly recipe when edit is not set', async () => {
      const match = { params: { id: 'testId' } }
      let wrapper
      await act(async () => {
        wrapper = mount(<Router history={historyMock}><Recipe location={location} match={match} idToken='testUser' /></Router>)
      })

      await axios
      await act(async () => {
        wrapper.update() // Re-render component
      })
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(1)
      expect(wrapper.find('EditableRecipe').length).toEqual(0)
    })

    it('renders readonly recipe when edit is set to false', async () => {
      const match = { params: { id: 'testId' } }
      const location = { search: '?edit=false' }
      let wrapper
      await act(async () => {
        wrapper = mount(<Router history={historyMock}><Recipe location={location} match={match} idToken='testUser' /></Router>)
      })

      await axios
      await act(async () => {
        wrapper.update() // Re-render component
      })
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(1)
      expect(wrapper.find('EditableRecipe').length).toEqual(0)

      const readonlyrecipeWrapper = wrapper.find('ReadonlyRecipe').at(0)
      expect(readonlyrecipeWrapper.props().recipe).toEqual(expectedProcessedRecipeData)
    })

    it('renders readonly recipe with basic data', async () => {
      axios.get.mockImplementation((url) => {
        if (url.indexOf('/lists') > -1) {
          return Promise.resolve(listsData)
        } else {
          return Promise.resolve(basicRecipeData)
        }
      })
      const match = { params: { id: '1234' } }
      const location = { search: '?edit=false' }
      let wrapper
      await act(async () => {
        wrapper = mount(<Router history={historyMock}><Recipe location={location} match={match} idToken='testUser' /></Router>)
      })

      await axios
      await act(async () => {
        wrapper.update() // Re-render component
      })
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(1)
      expect(wrapper.find('EditableRecipe').length).toEqual(0)

      const readonlyrecipeWrapper = wrapper.find('ReadonlyRecipe').at(0)
      expect(readonlyrecipeWrapper.props().recipe).toEqual(expectedProcessedBasicRecipeData)
    })
  })

  describe('when recipe is editable', () => {
    it('renders form when server returns a recipe', async () => {
      const match = { params: { id: 'testId' } }
      const location = { search: '?edit=true' }
      let wrapper
      await act(async () => {
        wrapper = mount(<Router history={historyMock}><Recipe location={location} match={match} idToken='testUser' /></Router>)
      })

      await axios
      await act(async () => {
        wrapper.update() // Re-render component
      })
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(0)
      expect(wrapper.find('EditableRecipe').length).toEqual(1)

      const editablerecipeWrapper = wrapper.find('EditableRecipe').at(0)
      expect(editablerecipeWrapper.props().initialRecipe).toEqual(expectedProcessedRecipeData)
    })

    it('does not render form when server does not return a recipe', async () => {
      axios.get.mockResolvedValue({})

      const match = { params: { id: '1234' } }
      const location = { search: '?edit=true' }
      let wrapper
      await act(async () => {
        wrapper = mount(<Router history={historyMock}><Recipe location={location} match={match} idToken='testUser' /></Router>)
      })

      await axios
      await act(async () => {
        wrapper.update() // Re-render component
      })
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(0)
      expect(wrapper.find('EditableRecipe').length).toEqual(0) // No form
    })

    it('renders editable recipe with basic data', async () => {
      axios.get.mockResolvedValue(basicRecipeData)
      const match = { params: { id: '1234' } }
      const location = { search: '?edit=true' }
      let wrapper
      await act(async () => {
        wrapper = mount(<Router history={historyMock}><Recipe location={location} match={match} idToken='testUser' /></Router>)
      })

      await axios
      await act(async () => {
        wrapper.update() // Re-render component
      })
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(0)
      expect(wrapper.find('EditableRecipe').length).toEqual(1)

      const editablerecipeWrapper = wrapper.find('EditableRecipe').at(0)
      expect(editablerecipeWrapper.props().initialRecipe).toEqual(expectedProcessedBasicRecipeData)
    })
  })
})
