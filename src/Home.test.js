import React from 'react'
import { mount } from 'enzyme'
import axios from 'axios'
import { Home } from './Home'
// import debounce from 'lodash/debounce'

// Tell jest to mock this import
// jest.mock('lodash/debounce')
jest.mock('axios')
jest.useFakeTimers()

const recipeResults = { data: {
  recipes: [{
    _id: 'recipe1',
    title: 'test recipe 1',
    image: 'fakeRecipe1Image.png'
  }, {
    _id: 'recipe2',
    title: 'test recipe 2',
    image: 'fakeRecipe2Image.png'
  }],
  count: 10
} }

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

      expect(wrapper.state().isLoading).toEqual(false)
      const form = wrapper.find('form')
      const searchText = wrapper.find('#searchText').at(0)
      searchText.simulate('change', { target: { value: 'sugar flour', name: 'search' } })
      expect(wrapper.state().search).toEqual('sugar flour')
      form.simulate('submit')
      expect(wrapper.state().isLoading).toEqual(true)
      await axios
      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.defaults.headers.common['Authorization']).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/search?searchString=sugar flour&skip=0')

      wrapper.update() // Re-render component
      expect(wrapper.find('RecipeCard').length).toEqual(2)
      expect(wrapper.state().isLoading).toEqual(false)
    })

    it('and displays no results when there are none', async () => {
      axios.get.mockResolvedValue({ data: [] })
      const wrapper = mount(<Home idToken='testUser' />)
      wrapper.update() // Re-render component

      expect(wrapper.state().isLoading).toEqual(false)
      const form = wrapper.find('form')
      const searchText = wrapper.find('#searchText').at(0)
      searchText.simulate('change', { target: { value: 'sugar flour', name: 'search' } })
      expect(wrapper.state().search).toEqual('sugar flour')
      form.simulate('submit')
      expect(wrapper.state().isLoading).toEqual(true)
      await axios
      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.defaults.headers.common['Authorization']).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/search?searchString=sugar flour&skip=0')

      wrapper.update() // Re-render component
      expect(wrapper.find('RecipeCard').length).toEqual(0)
      expect(wrapper.state().isLoading).toEqual(false)
    })

    describe('scrolling', () => {
      const secondRecipeResults = { data: {
        recipes: [{
          _id: 'recipe3',
          title: 'test recipe 3',
          image: 'fakeRecipe3Image.png'
        }, {
          _id: 'recipe4',
          title: 'test recipe 4',
          image: 'fakeRecipe4Image.png'
        }],
        count: 10
      } }
      it.only('handles a scroll', async () => {
        // debounce.mockImplementation(fn => fn)
        axios.get.mockResolvedValue(recipeResults)
        const wrapper = mount(<Home idToken='testUser' />)
        wrapper.update() // Re-render component

        expect(wrapper.state().isLoading).toEqual(false)
        const form = wrapper.find('form')
        const searchText = wrapper.find('#searchText').at(0)
        searchText.simulate('change', { target: { value: 'sugar flour', name: 'search' } })
        expect(wrapper.state().search).toEqual('sugar flour')
        form.simulate('submit')
        expect(wrapper.state().isLoading).toEqual(true)
        expect(wrapper.state().skip).toEqual(0)
        await axios
        expect(axios.get).toHaveBeenCalledTimes(1)
        expect(axios.defaults.headers.common['Authorization']).toEqual('Bearer testUser')
        expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/search?searchString=sugar flour&skip=0')

        wrapper.update() // Re-render component
        expect(wrapper.find('RecipeCard').length).toEqual(2)
        expect(wrapper.state().isLoading).toEqual(false)

        axios.get.mockResolvedValue(secondRecipeResults)
        // const instance = wrapper.instance()
        // instance.handleScroll({ target: { offsetHeight: 10, scrollTop: 5, scrollHeight: 15 } })
        window.dispatchEvent(new Event('scroll'))
        jest.runAllTimers()
        // expect(wrapper.state().isLoading).toEqual(true)
        expect(wrapper.state().skip).toEqual(2)
        expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/search?searchString=sugar flour&skip=2')
      })
    })
  })
})
