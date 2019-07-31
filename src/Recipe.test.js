import React from 'react'
import { mount } from 'enzyme'
import axios from 'axios'
import { Recipe } from './Recipe'

jest.mock('axios')

let recipeData
let basicRecipeData

describe('Recipe', () => {
  beforeEach(() => {
    recipeData = {
      data: {
        _id: '1234',
        title: 'testRecipe',
        ingredients: [{ quantity: 1, unit: 'g', name: 'test ingredient' }, { name: 'test ingredient without quantity or unit' }],
        tags: ['test', 'new'],
        instructions: '',
        servings: 4,
        prepTime: '20m',
        cookingTime: '30m',
        macros: { carbs: 90, protein: 68, fat: 24, calories: 700 },
        storage: 'fridge',
        notes: 'new recipe',
        equipment: 'pan'
      }
    }

    basicRecipeData = {
      data: {
        _id: '123456',
        title: 'testRecipe',
        ingredients: [{ quantity: 1, unit: 'g', name: 'test ingredient' }, { name: 'test ingredient without quantity or unit' }],
        instructions: '',
        tags: ['test', 'new']
      }
    }

    axios.get.mockResolvedValue(recipeData)
  })

  it('gets recipe by Id on render', () => {
    const match = { params: { id: 'testId' } }
    const location = { search: '' }
    mount(<Recipe location={location} match={match} />)

    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/testId')
  })

  describe('when recipe is readonly', () => {
    it('renders readonly recipe when edit is not set', async () => {
      const match = { params: { id: '1234' } }
      const wrapper = mount(<Recipe location={location} match={match} />)

      await axios
      wrapper.update() // Re-render component
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(1)
      expect(wrapper.find('EditableRecipe').length).toEqual(0)
    })

    it('renders readonly recipe when edit is set to false', async () => {
      const match = { params: { id: '1234' } }
      const location = { search: '?edit=false' }
      const wrapper = mount(<Recipe location={location} match={match} />)

      await axios
      wrapper.update() // Re-render component
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(1)
      expect(wrapper.find('EditableRecipe').length).toEqual(0)
    })

    it('renders readonly recipe with basic data', async () => {
      axios.get.mockResolvedValue(basicRecipeData)
      const match = { params: { id: '123456' } }
      const location = { search: '?edit=false' }
      const wrapper = mount(<Recipe location={location} match={match} />)

      await axios
      wrapper.update() // Re-render component
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(1)
      expect(wrapper.find('EditableRecipe').length).toEqual(0)
    })
  })

  describe('when edit is set to true', () => {
    it('renders form when server returns a recipe', async () => {
      const match = { params: { id: '1234' } }
      const location = { search: '?edit=true' }
      const wrapper = mount(<Recipe location={location} match={match} />)

      await axios
      wrapper.update() // Re-render component
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(0)
      expect(wrapper.find('EditableRecipe').length).toEqual(1)
    })

    it('does not render form when server does not return a recipe', async () => {
      axios.get.mockResolvedValue({})

      const match = { params: { id: '1234' } }
      const location = { search: '?edit=true' }
      const wrapper = mount(<Recipe location={location} match={match} />)

      await axios
      wrapper.update() // Re-render component
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(0)
      expect(wrapper.find('EditableRecipe').length).toEqual(0) // No form
    })

    it('renders editable recipe with basic data', async () => {
      axios.get.mockResolvedValue(basicRecipeData)
      const match = { params: { id: '123456' } }
      const location = { search: '?edit=true' }
      const wrapper = mount(<Recipe location={location} match={match} />)

      await axios
      wrapper.update() // Re-render component
      expect(wrapper.find('ReadonlyRecipe').length).toEqual(0)
      expect(wrapper.find('EditableRecipe').length).toEqual(1)
    })
  })
})
