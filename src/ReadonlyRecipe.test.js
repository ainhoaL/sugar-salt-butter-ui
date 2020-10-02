import React from 'react'
import { mount } from 'enzyme'
import axios from 'axios'
import { ReadonlyRecipe } from './ReadonlyRecipe'
import { act } from 'react-dom/test-utils'
import { Router } from 'react-router-dom'

jest.mock('axios')
const historyMock = { push: jest.fn(), location: {}, listen: jest.fn(), createHref: jest.fn() }

let recipeData
let basicRecipeData
let listsData

describe('ReadonlyRecipe component', () => {
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

    axios.get.mockResolvedValue(listsData)
    axios.put.mockResolvedValue()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when recipe is readonly', () => {
    it('renders readonly recipe with basic data', async () => {
      axios.get.mockResolvedValue(listsData)
      let wrapper
      await act(async () => {
        wrapper = mount(<Router history={historyMock}><ReadonlyRecipe recipe={basicRecipeData} idToken='testUser' /></Router>)
      })

      await axios
      await act(async () => {
        wrapper.update() // Re-render component
      })

      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists')
      // TODO: check recipe & lists loaded correctly
    })

    it('renders readonly recipe with basic data and no shopping lists', async () => {
      axios.get.mockResolvedValue({ data: [] })
      let wrapper
      await act(async () => {
        wrapper = mount(<Router history={historyMock}><ReadonlyRecipe recipe={basicRecipeData} idToken='testUser' /></Router>)
      })

      await axios
      await act(async () => {
        wrapper.update() // Re-render component
      })
      // TODO: check recipe loaded correctly
      expect(wrapper.find('#listNameText').at(0).length).toEqual(1) // New list is the only option so the input for list name should be visible
      expect(wrapper.find('#servingsText').at(0).length).toEqual(0) // Recipe has no servings so there is no servings input
    })

    describe('when adding recipe to list', () => {
      it('can add recipe to existing list', async () => {
        axios.post.mockResolvedValue()

        let wrapper
        await act(async () => {
          wrapper = mount(<Router history={historyMock}><ReadonlyRecipe recipe={recipeData} idToken='testUser' /></Router>)
        })

        await axios
        await act(async () => {
          wrapper.update() // Re-render component
        })

        const listsSelect = wrapper.find('#listsSelect').at(0)
        listsSelect.simulate('change', { target: { value: 'list1' } })
        const servingsText = wrapper.find('#servingsText').at(0)
        expect(servingsText.props().value).toEqual(4) // Recipe has servings
        servingsText.simulate('change', { target: { value: '6' } })
        const addRecipeToListButton = wrapper.find('#addRecipeToListButton').at(0)
        await act(async () => {
          addRecipeToListButton.simulate('click') // add to shopping list
        })

        const expectedRecipeObject = {
          recipeId: 'testId',
          recipeServings: '6'
        }

        await axios
        expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
        expect(axios.post).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists/list1/recipes', expectedRecipeObject)
      })

      it('can add recipe to new list', async () => {
        axios.post.mockImplementation((url) => {
          if (url.indexOf('/recipes') > -1) {
            return Promise.resolve()
          } else {
            return Promise.resolve({ data: { _id: 'list3', title: 'what', recipes: { href: '/api/v1/lists/list3/recipes' } } })
          }
        })

        let wrapper
        await act(async () => {
          wrapper = mount(<Router history={historyMock}><ReadonlyRecipe recipe={recipeData} idToken='testUser' /></Router>)
        })

        await axios
        await act(async () => {
          wrapper.update() // Re-render component
        })

        const listsSelect = wrapper.find('#listsSelect').at(0)
        listsSelect.simulate('change', { target: { value: 'newlist' } })

        await act(async () => {
          wrapper.update() // Re-render component
        })

        const listNameText = wrapper.find('#listNameText').at(0)
        listNameText.simulate('change', { target: { value: 'what' } })
        const servingsText = wrapper.find('#servingsText').at(0)
        expect(servingsText.props().value).toEqual(4) // Recipe has servings
        servingsText.simulate('change', { target: { value: '2' } })
        const addRecipeToListButton = wrapper.find('#addRecipeToListButton').at(0)
        await act(async () => {
          addRecipeToListButton.simulate('click') // add to shopping list
        })

        const expectedRecipeObject = {
          recipeId: 'testId',
          recipeServings: '2'
        }

        await axios
        expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
        expect(axios.post).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists', { title: 'what' })
        expect(axios.post).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists/list3/recipes', expectedRecipeObject)
      })
    })
  })
})
