import React from 'react'
import { mount } from 'enzyme'
import axios from 'axios'
import { Recipe } from './Recipe'

jest.mock('axios')

let recipeData
let basicRecipeData

describe('Recipe component', () => {
  beforeEach(() => {
    recipeData = {
      data: {
        _id: '1234',
        userId: 'testUser',
        title: 'testRecipe',
        url: '',
        author: 'test author',
        image: '',
        source: 'test source',
        ingredients: [{ quantity: 1, unit: 'g', name: 'test ingredient' }, { name: 'test ingredient without quantity or unit' }],
        tags: ['test', 'new'],
        instructions: '',
        servings: 4,
        prepTime: '20m',
        cookingTime: '30m',
        macros: { carbs: 90, protein: 68, fat: 24, calories: 700 },
        rating: '',
        freezes: false,
        wantToTry: false,
        storage: 'fridge',
        notes: 'new recipe',
        done: false,
        equipment: 'pan'
      }
    }

    basicRecipeData = {
      data: {
        _id: '123456',
        userId: 'testUser',
        title: 'testRecipe',
        ingredients: [{ quantity: 1, unit: 'g', name: 'test ingredient' }, { name: 'test ingredient without quantity or unit' }],
        instructions: ''
      }
    }

    axios.get.mockResolvedValue(recipeData)
  })

  it('does not get recipe if there is no idToken', () => {
    const match = { params: { id: 'testId' } }
    const location = { search: '' }
    mount(<Recipe location={location} match={match} />)

    expect(axios.get).toHaveBeenCalledTimes(0)
  })

  it('gets recipe by Id on render', () => {
    const match = { params: { id: 'testId' } }
    const location = { search: '' }
    mount(<Recipe location={location} match={match} idToken='testUser' />)

    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/testId')
  })

  describe('when recipe is readonly', () => {
    it('renders readonly recipe when edit is not set', async () => {
      const match = { params: { id: '1234' } }
      const wrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)

      await axios
      wrapper.update() // Re-render component
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(1)
      expect(wrapper.find('EditableRecipe').length).toEqual(0)
    })

    it('renders readonly recipe when edit is set to false', async () => {
      const match = { params: { id: '1234' } }
      const location = { search: '?edit=false' }
      const wrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)

      await axios
      wrapper.update() // Re-render component
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(1)
      expect(wrapper.find('EditableRecipe').length).toEqual(0)
    })

    it('renders readonly recipe with basic data', async () => {
      axios.get.mockResolvedValue(basicRecipeData)
      const match = { params: { id: '123456' } }
      const location = { search: '?edit=false' }
      const wrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)

      await axios
      wrapper.update() // Re-render component
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(1)
      expect(wrapper.find('EditableRecipe').length).toEqual(0)
    })
  })

  describe('when recipe is editable', () => {
    it('renders form when server returns a recipe', async () => {
      const match = { params: { id: '1234' } }
      const location = { search: '?edit=true' }
      const wrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)

      await axios
      wrapper.update() // Re-render component
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(0)
      expect(wrapper.find('EditableRecipe').length).toEqual(1)
    })

    it('does not render form when server does not return a recipe', async () => {
      axios.get.mockResolvedValue({})

      const match = { params: { id: '1234' } }
      const location = { search: '?edit=true' }
      const wrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)

      await axios
      wrapper.update() // Re-render component
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(0)
      expect(wrapper.find('EditableRecipe').length).toEqual(0) // No form
    })

    it('renders editable recipe with basic data', async () => {
      axios.get.mockResolvedValue(basicRecipeData)
      const match = { params: { id: '123456' } }
      const location = { search: '?edit=true' }
      const wrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)

      await axios
      wrapper.update() // Re-render component
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(0)
      expect(wrapper.find('EditableRecipe').length).toEqual(1)
    })

    it('handles changes in the form for every field', async () => {
      const match = { params: { id: '1234' } }
      const location = { search: '?edit=true' }
      const parentWrapper = mount(<Recipe location={location} match={match} idToken='testUser' />)
      await axios
      parentWrapper.update() // Re-render component

      const wrapper = parentWrapper.find('EditableRecipe').at(0) // get EditableRecipe component

      const titleText = wrapper.find('#titleText').at(0)
      titleText.simulate('change', { target: { value: 'new title', name: 'title' } })
      expect(wrapper.state().recipe.title).toEqual('new title')
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
      const ingredientsText = wrapper.find('#ingredientsText').at(0)
      ingredientsText.simulate('change', { target: { value: 'new ingredients', name: 'ingredients' } })
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
      const freezesCheck = wrapper.find('#freezesCheck').at(0)
      freezesCheck.simulate('change', { target: { checked: true, name: 'freezes', type: 'checkbox' } })
      const tryCheck = wrapper.find('#tryCheck').at(0)
      tryCheck.simulate('change', { target: { checked: true, name: 'wantToTry', type: 'checkbox' } })
      const doneCheck = wrapper.find('#doneCheck').at(0)
      doneCheck.simulate('change', { target: { checked: true, name: 'done', type: 'checkbox' } })
      expect(wrapper.state().recipe).toEqual({
        _id: '1234',
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
        calories: 'new cals',
        protein: 'new protein',
        carbs: 'new carbs',
        fat: 'new fats',
        rating: 'new rating',
        freezes: true,
        wantToTry: true,
        done: true
      })
    })
  })
})
