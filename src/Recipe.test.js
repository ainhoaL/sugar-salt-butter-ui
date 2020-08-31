import React from 'react'
import { mount } from 'enzyme'
import axios from 'axios'
import { Recipe } from './Recipe'
import { act } from 'react-dom/test-utils'

jest.mock('axios')

let recipeData
let basicRecipeData
let listsData

describe('Recipe component', () => {
  beforeEach(() => {
    recipeData = {
      data: {
        _id: 'testId',
        userId: 'testUser',
        title: 'testRecipe',
        url: '',
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
      mount(<Recipe location={location} match={match} />)
    })

    expect(axios.get).toHaveBeenCalledTimes(0)
  })

  it('gets recipe by Id when receiving an idToken', async () => {
    const match = { params: { id: 'testId' } }
    const location = { search: '' }
    await act(async () => {
      mount(<Recipe location={location} match={match} idToken='testUser' />)
    })
    expect(axios.get).toHaveBeenCalledTimes(2)
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/testId')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists')
  })

  it('gets recipe by Id on props updated with idToken', async () => {
    const match = { params: { id: 'testId' } }
    const location = { search: '' }
    let wrapper
    await act(async () => {
      wrapper = mount(<Recipe location={location} match={match} />)
    })

    expect(axios.get).toHaveBeenCalledTimes(0)

    await act(async () => {
      wrapper.setProps({ idToken: 'testUser' })
    })
    expect(axios.get).toHaveBeenCalledTimes(2)
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/testId')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists')
  })

  describe('when recipe is readonly', () => {
    it('renders readonly recipe when edit is not set', async () => {
      const match = { params: { id: 'testId' } }
      let wrapper
      await act(async () => {
        wrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)
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
        wrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)
      })

      await axios
      await act(async () => {
        wrapper.update() // Re-render component
      })
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(1)
      expect(wrapper.find('EditableRecipe').length).toEqual(0)
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
        wrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)
      })

      await axios
      await act(async () => {
        wrapper.update() // Re-render component
      })
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(1)
      expect(wrapper.find('EditableRecipe').length).toEqual(0)
    })

    it('renders readonly recipe with basic data and no shopping lists', async () => {
      axios.get.mockImplementation((url) => {
        if (url.indexOf('/lists') > -1) {
          return Promise.resolve({ data: [] })
        } else {
          return Promise.resolve(basicRecipeData)
        }
      })
      const match = { params: { id: '1234' } }
      const location = { search: '?edit=false' }
      let wrapper
      await act(async () => {
        wrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)
      })

      await axios
      await act(async () => {
        wrapper.update() // Re-render component
      })
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(1)
      expect(wrapper.find('EditableRecipe').length).toEqual(0)
      expect(wrapper.find('#listNameText').at(0).length).toEqual(1) // New list is the only option so the input for list name should be visible
      expect(wrapper.find('#servingsText').at(0).length).toEqual(0) // Recipe has no servings so there is no servings input
    })

    describe('when adding recipe to list', () => {
      it('can add recipe to existing list', async () => {
        axios.post.mockResolvedValue()

        const match = { params: { id: 'testId' } }
        let parentWrapper
        await act(async () => {
          parentWrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)
        })

        await axios
        let wrapper
        await act(async () => {
          parentWrapper.update() // Re-render component
          wrapper = parentWrapper.find('ReadonlyRecipe').at(0) // get ReadonlyRecipe component
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

        const match = { params: { id: 'testId' } }
        let parentWrapper
        await act(async () => {
          parentWrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)
        })

        await axios
        let wrapper
        await act(async () => {
          parentWrapper.update() // Re-render component
          wrapper = parentWrapper.find('ReadonlyRecipe').at(0) // get ReadonlyRecipe component
        })

        const listsSelect = wrapper.find('#listsSelect').at(0)
        listsSelect.simulate('change', { target: { value: 'newlist' } })

        await act(async () => {
          parentWrapper.update() // Re-render component
          wrapper = parentWrapper.find('ReadonlyRecipe').at(0) // get ReadonlyRecipe component
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

        expect(axios.post).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists', { title: 'what' })
        expect(axios.post).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists/list3/recipes', expectedRecipeObject)
      })
    })
  })

  describe('when recipe is editable', () => {
    it('renders form when server returns a recipe', async () => {
      const match = { params: { id: 'testId' } }
      const location = { search: '?edit=true' }
      let wrapper
      await act(async () => {
        wrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)
      })

      await axios
      await act(async () => {
        wrapper.update() // Re-render component
      })
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(0)
      expect(wrapper.find('EditableRecipe').length).toEqual(1)
    })

    it('does not render form when server does not return a recipe', async () => {
      axios.get.mockResolvedValue({})

      const match = { params: { id: '1234' } }
      const location = { search: '?edit=true' }
      let wrapper
      await act(async () => {
        wrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)
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
        wrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)
      })

      await axios
      await act(async () => {
        wrapper.update() // Re-render component
      })
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(0)
      expect(wrapper.find('EditableRecipe').length).toEqual(1)
    })

    it('handles a form submit and updates recipe in server', async () => {
      const match = { params: { id: 'testId' } }
      const location = { search: '?edit=true' }
      let parentWrapper

      await act(async () => {
        parentWrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)
      })

      await axios

      let wrapper
      await act(async () => {
        parentWrapper.update() // Re-render component
        wrapper = parentWrapper.find('EditableRecipe').at(0) // get EditableRecipe component
      })

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
      const match = { params: { id: 'testId' } }
      const location = { search: '?edit=true' }
      let parentWrapper

      await act(async () => {
        parentWrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)
      })

      await axios

      let wrapper
      let starsWrapper
      await act(async () => {
        parentWrapper.update() // Re-render component
        wrapper = parentWrapper.find('EditableRecipe').at(0) // get EditableRecipe component
        starsWrapper = wrapper.find('StarRating').at(0)
      })

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
        url: '',
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
  })
})
