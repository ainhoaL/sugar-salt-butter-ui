import React from 'react'
import { Router } from 'react-router-dom'
import { RecipeCard } from './RecipeCard'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn(), createHref: jest.fn() }

describe('RecipeCard component', () => {
  it('displays recipe data and links to recipe page', () => {
    const recipeData = { _id: 'recipeId', image: 'https://picsum.photos/id/237/536/354', title: 'recipe name' }
    render(<Router history={historyMock}><RecipeCard data={recipeData} /></Router>)

    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://picsum.photos/id/237/536/354')
    expect(screen.getByText('recipe name')).toBeInTheDocument()

    userEvent.click(screen.getByRole('img'))
    expect(historyMock.push).toHaveBeenCalledTimes(1)
    expect(historyMock.push).toHaveBeenCalledWith('recipes/recipeId')
  })

  it('displays placeholder image if image fails to load', async () => {
    const recipeData = { _id: 'recipeId', image: 'fakeimage', title: 'recipe name' }
    render(<Router history={historyMock}><RecipeCard data={recipeData} /></Router>)

    fireEvent.error(screen.getByRole('img')) // Image cannot be fetched

    expect(screen.getByRole('img')).toHaveAttribute('src', 'icons8-tableware-100.png')
    expect(screen.getByText('recipe name')).toBeInTheDocument()
  })

  it('displays placeholder image if recipe has no image', () => {
    const recipeData = { _id: 'recipeId', image: '', title: 'recipe name' }
    render(<Router history={historyMock}><RecipeCard data={recipeData} /></Router>)

    expect(screen.getByRole('img')).toHaveAttribute('src', 'icons8-tableware-100.png')
    expect(screen.getByText('recipe name')).toBeInTheDocument()
  })
})
