import React from 'react'
import { mount, shallow } from 'enzyme'
import axios from 'axios'
import { Dashboard } from './Dashboard'
import { act } from 'react-dom/test-utils'

jest.mock('axios')

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
      mount(<Dashboard />)
    })

    expect(axios.get).toHaveBeenCalledTimes(0)
  })

  it('gets all recipes by userId when receiving an idToken', async () => {
    let wrapper
    await act(async () => {
      wrapper = mount(<Dashboard idToken='testUser' />)
    })
    expect(axios.get).toHaveBeenCalledTimes(2)
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes?limit=8')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes?wantToTry=true&limit=8')

    wrapper.update() // Re-render component
    expect(wrapper.find('RecipeCard').length).toEqual(3)
    expect(wrapper.find('Search').length).toEqual(0)
  })

  it('gets all recipes by userId when props updated with idToken', async () => {
    let wrapper
    await act(async () => {
      wrapper = mount(<Dashboard />)
    })

    expect(axios.get).toHaveBeenCalledTimes(0)

    await act(async () => {
      wrapper.setProps({ idToken: 'testUser' })
    })
    expect(axios.get).toHaveBeenCalledTimes(2)
    expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes?limit=8')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes?wantToTry=true&limit=8')
  })

  it('displays search component if searchString is set', async () => {
    let wrapper
    await act(async () => {
      wrapper = shallow(<Dashboard idToken='testUser' searchString='cake' />)
    })
    expect(axios.get).toHaveBeenCalledTimes(0)

    wrapper.update() // Re-render component
    expect(wrapper.find('Search').length).toEqual(1)
    expect(wrapper.find('RecipeCard').length).toEqual(0)
  })
})
