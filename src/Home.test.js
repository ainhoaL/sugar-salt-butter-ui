import React from 'react'
import { mount } from 'enzyme'
import axios from 'axios'
import { Home } from './Home'

jest.mock('axios')

const recipeResults = { data: [{
  _id: 'recipe1',
  title: 'test recipe 1',
  image: 'fakeRecipe1Image.png'
}, {
  _id: 'recipe2',
  title: 'test recipe 2',
  image: 'fakeRecipe2Image.png'
}] }

describe('Home component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('component loads', () => {
    mount(<Home />)

    expect(axios.get).toHaveBeenCalledTimes(0)
  })

  describe('handles a search and sends search to server', () => {
    it('and displays results when there are some', async () => {
      axios.get.mockResolvedValue(recipeResults)
      const wrapper = mount(<Home idToken='testUser' />)
      wrapper.update() // Re-render component

      const form = wrapper.find('form')
      const searchText = wrapper.find('#searchText').at(0)
      searchText.simulate('change', { target: { value: 'sugar flour', name: 'search' } })
      expect(wrapper.state().search).toEqual('sugar flour')
      form.simulate('submit')
      await axios
      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.defaults.headers.common['Authorization']).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/search?searchString=sugar flour')

      wrapper.update() // Re-render component
      expect(wrapper.find('RecipeCard').length).toEqual(2)
    })

    it('and displays no results when there are none', async () => {
      axios.get.mockResolvedValue({ data: [] })
      const wrapper = mount(<Home idToken='testUser' />)
      wrapper.update() // Re-render component

      const form = wrapper.find('form')
      const searchText = wrapper.find('#searchText').at(0)
      searchText.simulate('change', { target: { value: 'sugar flour', name: 'search' } })
      expect(wrapper.state().search).toEqual('sugar flour')
      form.simulate('submit')
      await axios
      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.defaults.headers.common['Authorization']).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/search?searchString=sugar flour')

      wrapper.update() // Re-render component
      expect(wrapper.find('RecipeCard').length).toEqual(0)
    })
  })
})
