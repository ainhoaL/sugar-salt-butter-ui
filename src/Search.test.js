import React from 'react'
import { mount } from 'enzyme'
import axios from 'axios'
import { Search } from './Search'
// import debounce from 'lodash/debounce'
import { act } from 'react-dom/test-utils'

// Tell jest to mock this import
// jest.mock('lodash/debounce')
jest.mock('axios')
jest.useFakeTimers()

const recipeResults = {
  data: {
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
  }
}

describe('Search component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('handles a search and sends search to server', () => {
    it('and displays results when there are some', async () => {
      axios.get.mockResolvedValue(recipeResults)
      const wrapper = mount(<Search idToken='testUser' />)

      const form = wrapper.find('form')
      const searchText = wrapper.find('#searchText').at(0)
      searchText.getDOMNode().value = 'sugar flour'
      await act(async () => {
        form.simulate('submit')
      })
      await axios
      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/search?searchString=sugar flour&skip=0')

      wrapper.update() // Re-render component
      expect(wrapper.find('RecipeCard').length).toEqual(2)
    })

    it('and displays no results when there are none', async () => {
      axios.get.mockResolvedValue({ data: { count: 0, recipes: [] } })
      const wrapper = mount(<Search idToken='testUser' />)

      const form = wrapper.find('form')
      const searchText = wrapper.find('#searchText').at(0)
      searchText.getDOMNode().value = 'sugar flour'
      await act(async () => {
        form.simulate('submit')
      })
      await axios
      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/search?searchString=sugar flour&skip=0')

      wrapper.update() // Re-render component
      expect(wrapper.find('RecipeCard').length).toEqual(0)
    })

    it('does not make a request to the server if there is no idToken', async () => {
      const wrapper = mount(<Search />)

      const form = wrapper.find('form')
      const searchText = wrapper.find('#searchText').at(0)
      searchText.getDOMNode().value = 'test'
      await act(async () => {
        form.simulate('submit')
      })
      expect(axios.get).toHaveBeenCalledTimes(0)

      wrapper.update() // Re-render component
      expect(wrapper.find('RecipeCard').length).toEqual(0)
    })

    it('does not make a request to the server if there is no searchString', async () => {
      const wrapper = mount(<Search idToken='testUser' />)

      const form = wrapper.find('form')
      const searchText = wrapper.find('#searchText').at(0)
      searchText.getDOMNode().value = ''
      await act(async () => {
        form.simulate('submit')
      })
      expect(axios.get).toHaveBeenCalledTimes(0)

      wrapper.update() // Re-render component
      expect(wrapper.find('RecipeCard').length).toEqual(0)
    })

    it('makes a clean search after a search', async () => {
      axios.get.mockResolvedValue(recipeResults)
      const wrapper = mount(<Search idToken='testUser' />)

      const form = wrapper.find('form')
      const searchText = wrapper.find('#searchText').at(0)
      searchText.getDOMNode().value = 'sugar flour'
      await act(async () => {
        form.simulate('submit')
      })
      await axios
      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/search?searchString=sugar flour&skip=0')

      wrapper.update() // Re-render component
      expect(wrapper.find('RecipeCard').length).toEqual(2)

      // Do a new search
      axios.get.mockResolvedValue({
        data: {
          recipes: [{
            _id: 'recipe5',
            title: 'test recipe 5',
            image: 'fakeRecipe5Image.png'
          }],
          count: 1
        }
      })

      searchText.getDOMNode().value = 'butter'
      await act(async () => {
        form.simulate('submit')
      })

      await axios
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/search?searchString=butter&skip=0')

      wrapper.update() // Re-render component
      expect(wrapper.find('RecipeCard').length).toEqual(1)
    })

    describe('scrolling', () => {
      const secondRecipeResults = {
        data: {
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
        }
      }
      it('handles a scroll', async () => {
        axios.get.mockResolvedValue(recipeResults)
        const wrapper = mount(<Search idToken='testUser' />)

        const form = wrapper.find('form')
        const searchText = wrapper.find('#searchText').at(0)
        searchText.getDOMNode().value = 'sugar flour'
        await act(async () => {
          form.simulate('submit')
        })

        await axios
        expect(axios.get).toHaveBeenCalledTimes(1)
        expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
        expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/search?searchString=sugar flour&skip=0')

        wrapper.update() // Re-render component
        expect(wrapper.find('RecipeCard').length).toEqual(2)

        axios.get.mockResolvedValue(secondRecipeResults)

        // scroll does not get to the bottom of the page and does not send a request
        window.innerHeight = 100
        await act(async () => {
          window.dispatchEvent(new Event('scroll'))
          jest.runAllTimers()
        })

        // scroll gets to bottom of the page and sends a request for more items
        window.innerHeight = 0
        await act(async () => {
          window.dispatchEvent(new Event('scroll'))
          jest.runAllTimers()
        })
        await axios
        expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/search?searchString=sugar flour&skip=2')
        wrapper.update() // Re-render component
        expect(wrapper.find('RecipeCard').length).toEqual(4)
      })
    })
  })
})
