import React from 'react'
import { Search } from './Search'
import { act } from 'react-dom/test-utils'
import { render, screen, waitFor } from '@testing-library/react'
import { UserContext } from './UserContext'
import { api } from './services/api'

jest.mock('./services/api')
jest.useFakeTimers('modern')

const testUserId = 'testUser'
const searchParams = { searchString: 'sugar flour' }
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
      api.searchRecipes.mockResolvedValue(recipeResults)
      render(<UserContext.Provider value={testUserId}><Search searchParams={searchParams} /></UserContext.Provider>)

      expect(api.searchRecipes).toHaveBeenCalledTimes(1)
      expect(api.searchRecipes).toHaveBeenCalledWith(testUserId, 'skip=0&limit=70&searchString=sugar flour')

      await waitFor(() => expect(screen.getByText('test recipe 1')).toBeInTheDocument())
      expect(screen.getByText('test recipe 2')).toBeInTheDocument()
    })

    it('and displays no results when there are none', async () => {
      api.searchRecipes.mockResolvedValue({ data: { count: 0, recipes: [] } })
      render(<UserContext.Provider value={testUserId}><Search searchParams={searchParams} /></UserContext.Provider>)

      expect(api.searchRecipes).toHaveBeenCalledTimes(1)
      expect(api.searchRecipes).toHaveBeenCalledWith(testUserId, 'skip=0&limit=70&searchString=sugar flour')

      await waitFor(() => expect(screen.queryByText('test recipe 1')).not.toBeInTheDocument())
    })

    it('does not make a request to the server if there is no idToken', async () => {
      render(<UserContext.Provider value=''><Search searchParams={searchParams} /></UserContext.Provider>)

      expect(api.searchRecipes).toHaveBeenCalledTimes(0)

      await waitFor(() => expect(screen.queryByText('test recipe 1')).not.toBeInTheDocument())
    })

    it('does not make a request to the server if there is no searchString', async () => {
      render(<UserContext.Provider value={testUserId}><Search /></UserContext.Provider>)

      expect(api.searchRecipes).toHaveBeenCalledTimes(0)

      await waitFor(() => expect(screen.queryByText('test recipe 1')).not.toBeInTheDocument())
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

      const smallRecipeResults = {
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
          count: 2
        }
      }

      it('handles a scroll', async () => {
        api.searchRecipes.mockResolvedValue(recipeResults)
        render(<UserContext.Provider value={testUserId}><Search searchParams={searchParams} /></UserContext.Provider>)

        expect(api.searchRecipes).toHaveBeenCalledTimes(1)
        expect(api.searchRecipes).toHaveBeenCalledWith(testUserId, 'skip=0&limit=70&searchString=sugar flour')

        await waitFor(() => expect(screen.getByText('test recipe 1')).toBeInTheDocument())
        expect(screen.getByText('test recipe 2')).toBeInTheDocument()

        api.searchRecipes.mockResolvedValue(secondRecipeResults)

        // scroll does not get to the bottom of the page and does not send a request
        window.innerHeight = 100
        await act(async () => {
          window.dispatchEvent(new Event('scroll'))
          jest.runAllTimers()
        })

        expect(api.searchRecipes).not.toHaveBeenCalledWith(testUserId, 'skip=2&limit=70&searchString=sugar flour')

        // scroll gets to bottom of the page and sends a request for more items
        window.innerHeight = 0
        await act(async () => {
          window.dispatchEvent(new Event('scroll'))
          jest.runAllTimers()
        })

        expect(api.searchRecipes).toHaveBeenCalledWith(testUserId, 'skip=2&limit=70&searchString=sugar flour')

        await waitFor(() => expect(screen.getByText('test recipe 3')).toBeInTheDocument())
        expect(screen.getByText('test recipe 1')).toBeInTheDocument()
        expect(screen.getByText('test recipe 2')).toBeInTheDocument()
        expect(screen.getByText('test recipe 4')).toBeInTheDocument()
      })

      it('when scrolling it does not request more recipes if there are no more', async () => {
        api.searchRecipes.mockResolvedValue(smallRecipeResults)
        render(<UserContext.Provider value={testUserId}><Search searchParams={searchParams} /></UserContext.Provider>)

        expect(api.searchRecipes).toHaveBeenCalledTimes(1)
        expect(api.searchRecipes).toHaveBeenCalledWith(testUserId, 'skip=0&limit=70&searchString=sugar flour')

        await waitFor(() => expect(screen.getByText('test recipe 1')).toBeInTheDocument())
        expect(screen.getByText('test recipe 2')).toBeInTheDocument()

        // scroll gets to bottom of the page does not send a request for more items
        window.innerHeight = 0
        await act(async () => {
          window.dispatchEvent(new Event('scroll'))
          jest.runAllTimers()
        })

        expect(api.searchRecipes).not.toHaveBeenCalledWith(testUserId, 'skip=2&limit=70&searchString=sugar flour')
      })
    })
  })
})
