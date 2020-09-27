import React from 'react'
import { mount } from 'enzyme'
import axios from 'axios'
import { Dashboard } from './Dashboard'
import { act } from 'react-dom/test-utils'

jest.mock('axios')
const recipesUrl = 'http://localhost:3050/api/v1/recipes'
const location = { search: '' }

describe('Dashboard component', () => {
  let recipes = {
    data: {
      count: 2,
      recipes: [{
        _id: 'recipe1',
        title: 'first recipe',
        image: '/img.png',
        servings: 1,
        wantToTry: true
      },
      {
        _id: 'recipe2',
        title: 'second recipe',
        image: '/recipe.jpeg'
      }]
    }
  }

  let wantToTryRecipes = {
    data: {
      count: 1,
      recipes: [{
        _id: 'recipe1',
        title: 'first recipe',
        image: '/img.png',
        servings: 1,
        wantToTry: true
      }]
    }
  }

  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.indexOf('wantToTry') > -1) {
        return Promise.resolve(wantToTryRecipes)
      } else if (url.indexOf('tags') > -1) {
        return Promise.resolve({ data: [] })
      } else {
        return Promise.resolve(recipes)
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does not get recipes if there is no idToken', () => {
    act(() => {
      mount(<Dashboard location={location} />)
    })

    expect(axios.get).toHaveBeenCalledTimes(0)
  })

  it('gets all recipes by userId when receiving an idToken', async () => {
    let wrapper
    await act(async () => {
      wrapper = mount(<Dashboard idToken='testUser' location={location} />)
    })
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.get).toHaveBeenCalledWith(recipesUrl + '?limit=7')
    expect(axios.get).toHaveBeenCalledWith(recipesUrl + '?wantToTry=true&limit=7')

    wrapper.update() // Re-render component
    expect(wrapper.find('RecipeCard').length).toEqual(3)
    expect(wrapper.find('Search').length).toEqual(0)
  })

  it('gets all recipes by userId when props updated with idToken', async () => {
    let wrapper
    await act(async () => {
      wrapper = mount(<Dashboard location={location} />)
    })

    expect(axios.get).toHaveBeenCalledTimes(0)

    await act(async () => {
      wrapper.setProps({ idToken: 'testUser' })
    })
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.get).toHaveBeenCalledWith(recipesUrl + '?limit=7')
    expect(axios.get).toHaveBeenCalledWith(recipesUrl + '?wantToTry=true&limit=7')
  })

  it('displays search component if querystring has search values', async () => {
    let wrapper
    let location = { search: '?searchString=cake' }
    await act(async () => {
      wrapper = mount(<Dashboard idToken='testUser' location={location} />)
    })

    wrapper.update() // Re-render component
    expect(wrapper.find('Search').length).toEqual(1)
  })
})
