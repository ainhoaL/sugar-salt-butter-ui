import React from 'react'
import { Dashboard } from './Dashboard'
import { UserContext } from './UserContext'
import { render, screen, waitFor } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { api } from './services/api'

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn(), createHref: jest.fn() }

jest.mock('./services/api')

jest.mock('./TagsMenu', () => {
  return {
    TagsMenu: () => {
      return <div>TagsMenuComponentMock</div>
    }
  }
})

jest.mock('./Search', () => {
  return {
    Search: () => {
      return <div>SearchComponentMock</div>
    }
  }
})

const location = { search: '' }
const testUserId = 'testUser'

describe('Dashboard component', () => {
  const recipes = {
    data: {
      count: 2,
      recipes: [{
        _id: 'recipe1',
        title: 'first recipe',
        image: '/img.png',
        servings: 1
      },
      {
        _id: 'recipe2',
        title: 'second recipe',
        image: '/recipe.jpeg'
      }]
    }
  }

  const wantToTryRecipes = {
    data: {
      count: 1,
      recipes: [{
        _id: 'recipe3',
        title: 'third recipe',
        image: '/img3.png',
        servings: 2,
        wantToTry: true
      }]
    }
  }

  beforeEach(() => {
    api.searchRecipes.mockImplementation((userId, searchHref) => {
      if (searchHref.indexOf('wantToTry') > -1) {
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
    render(<Router history={historyMock}><UserContext.Provider value=''><Dashboard location={location} /></UserContext.Provider></Router>)
    expect(api.searchRecipes).toHaveBeenCalledTimes(0)
  })

  it('gets all recipes by userId when receiving an idToken', async () => {
    render(<Router history={historyMock}><UserContext.Provider value={testUserId}><Dashboard location={location} /></UserContext.Provider></Router>)

    await waitFor(() => screen.getByText('first recipe'))
    expect(screen.getByText('second recipe')).toBeInTheDocument()

    await waitFor(() => screen.getByText('third recipe'))
    expect(screen.getByText('Recently added:')).toBeInTheDocument()
    expect(screen.getByText('Want to try:')).toBeInTheDocument()

    expect(api.searchRecipes).toHaveBeenCalledTimes(2)
    expect(api.searchRecipes).toHaveBeenCalledWith(testUserId, 'limit=7')
    expect(api.searchRecipes).toHaveBeenCalledWith(testUserId, 'wantToTry=true&limit=7')
  })

  it('displays search component if querystring has search values', async () => {
    const location = { search: '?searchString=cake' }
    render(<Router history={historyMock}><UserContext.Provider value={testUserId}><Dashboard location={location} /></UserContext.Provider></Router>)

    expect(await screen.getByText('SearchComponentMock')).toBeInTheDocument() // Search component is displayed
  })
})
