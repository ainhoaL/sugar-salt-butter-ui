import React from 'react'
import { mount } from 'enzyme'
import axios from 'axios'
import { List } from './List'
import { act } from 'react-dom/test-utils'
import { UserContext } from './UserContext'

jest.mock('axios')

let listData

describe('List component', () => {
  beforeEach(() => {
    listData = {
      data: {
        _id: 'testId',
        userId: 'testUser',
        title: 'test shopping list',
        items: [
          { _id: 'item1', quantity: 1, unit: 'g', name: 'test ingredient', displayQuantity: '1', recipeId: 'recipe1', servings: 1 },
          { _id: 'item2', name: 'test ingredient without quantity or unit', recipeId: 'recipe1', servings: 1 },
          { _id: 'item3', quantity: 1, unit: 'cup', name: 'test ingredient2', group: 'test group', displayQuantity: '1', recipeId: 'recipe1', servings: 1 },
          { _id: 'item4', quantity: 1, unit: 'g', name: 'test ingredient3', group: 'test group', displayQuantity: '1', recipeId: 'recipe2' },
          { _id: 'item5', quantity: 1, name: 'test ingredient without unit', group: 'new group', displayQuantity: '1', recipeId: 'recipe2' }
        ],
        recipes: {
          href: '/api/v1/lists/testId/recipes',
          recipesData: [
            {
              _id: 'recipe1',
              title: 'first recipe',
              image: '/img.png',
              servings: 1,
              href: '/api/v1/lists/testId/recipes/recipe1'
            },
            {
              _id: 'recipe2',
              title: 'second recipe',
              image: '/recipe.jpeg',
              href: '/api/v1/lists/testId/recipes/recipe2'
            }
          ]
        }
      }
    }

    axios.get.mockResolvedValue(listData)
    axios.delete.mockResolvedValue()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does not get list if there is no idToken', () => {
    const match = { params: { id: 'testId' } }
    act(() => {
      mount(<UserContext.Provider value=''><List match={match} /></UserContext.Provider>)
    })

    expect(axios.get).toHaveBeenCalledTimes(0)
  })

  it('gets list by Id when receiving an idToken and displays list', async () => {
    const match = { params: { id: 'testId' } }
    let wrapper
    await act(async () => {
      wrapper = mount(<UserContext.Provider value='testUser'><List match={match} /></UserContext.Provider>)
    })

    await axios
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists/testId')

    await act(async () => {
      wrapper.update() // Re-render component
    })

    expect(wrapper.find('.listContainer').length).toEqual(1)
    const titleHeader = wrapper.find('.listContainer h4').at(0)
    expect(titleHeader.text()).toEqual('test shopping list') // list title
    expect(wrapper.find('.listItems li').length).toEqual(5) // 5 items
    expect(wrapper.find('.listRecipe li').length).toEqual(2) // 2 recipes
  })

  it('renders nothing if list does not exist', async () => {
    axios.get.mockResolvedValue({ data: null })
    const match = { params: { id: 'testId' } }
    let wrapper
    await act(async () => {
      wrapper = mount(<UserContext.Provider value='testUser'><List match={match} /></UserContext.Provider>)
    })
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists/testId')

    await axios
    await act(async () => {
      wrapper.update() // Re-render component
    })

    expect(wrapper.find('.listContainer').length).toEqual(0) // No list to display
  })

  it('renders nothing if list has no items', async () => {
    axios.get.mockResolvedValue({ data: {
        _id: 'testId',
        userId: 'testUser',
        title: 'test shopping list',
        items: [],
        recipes: {
          href: '/api/v1/lists/testId/recipes'
        }
      } })
    const match = { params: { id: 'testId' } }
    let wrapper
    await act(async () => {
      wrapper = mount(<UserContext.Provider value='testUser'><List match={match} /></UserContext.Provider>)
    })
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists/testId')

    await axios
    await act(async () => {
      wrapper.update() // Re-render component
    })

    expect(wrapper.find('.listContainer').length).toEqual(1)
    const titleHeader = wrapper.find('.listContainer h4').at(0)
    expect(titleHeader.text()).toEqual('test shopping list') // list title
    expect(wrapper.find('.listItems li').length).toEqual(0) // 5 items
    expect(wrapper.find('.listRecipe li').length).toEqual(0) // 2 recipes
  })

  it('can delete recipe from list', async () => {
    const match = { params: { id: 'testId' } }
    let wrapper
    await act(async () => {
      wrapper = mount(<UserContext.Provider value='testUser'><List match={match} /></UserContext.Provider>)
    })

    await axios
    await act(async () => {
      wrapper.update() // Re-render component
      const deleteButton = wrapper.find({ 'aria-label': 'delete recipe' }).at(0)
      deleteButton.simulate('click') // Delete first recipe
    })

    await axios
    expect(axios.delete).toHaveBeenCalledTimes(1)
    expect(axios.delete).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists/testId/recipes/recipe1')
  })

  it('hovering over recipe highlights list items', async () => {
    const match = { params: { id: 'testId' } }
    let wrapper
    await act(async () => {
      wrapper = mount(<UserContext.Provider value='testUser'><List match={match} /></UserContext.Provider>)
    })

    await axios
    await act(async () => {
      wrapper.update() // Re-render component
      const listRecipeInfo = wrapper.find('.listRecipeContainer').at(0)
      listRecipeInfo.simulate('mouseenter') // Hover over first recipe
    })

    await act(async () => {
      wrapper.update() // Re-render component
    })
    expect(wrapper.find('.recipeSelected').length).toEqual(3) // 3 selected items

    await act(async () => {
      const listRecipeInfo = wrapper.find('.listRecipeContainer').at(0)
      listRecipeInfo.simulate('mouseleave') // Leave first recipe
    })

    await act(async () => {
      wrapper.update() // Re-render component
    })
    expect(wrapper.find('.recipeSelected').length).toEqual(0) // 0 selected items
  })

  it('can delete item from list', async () => {
    const match = { params: { id: 'testId' } }
    let wrapper
    await act(async () => {
      wrapper = mount(<UserContext.Provider value='testUser'><List match={match} /></UserContext.Provider>)
    })

    await axios
    await act(async () => {
      wrapper.update() // Re-render component
      const deleteButton = wrapper.find({ 'aria-label': 'delete item' }).at(0)
      deleteButton.simulate('click') // Delete first recipe
    })

    await axios
    expect(axios.delete).toHaveBeenCalledTimes(1)
    expect(axios.delete).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists/testId/items/item1')
  })

  it('tries to delete list when clicking delete button', async () => {
    const match = { params: { id: 'testId' } }
    let wrapper
    await act(async () => {
      wrapper = mount(<UserContext.Provider value='testUser'><List match={match} /></UserContext.Provider>)
    })

    await axios
    await act(async () => {
      wrapper.update() // Re-render component
    })
    const deleteButton = wrapper.find('.action').at(0)
    await act(async () => {
      deleteButton.simulate('click') // delete recipe
    })
    await axios
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.delete).toHaveBeenCalledWith('http://localhost:3050/api/v1/lists/testId')
  })
})
