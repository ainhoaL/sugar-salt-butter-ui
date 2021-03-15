import React from 'react'
import { Router } from 'react-router-dom'
import { SearchForm } from './SearchForm'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn() }

describe('SearchForm component', () => {
  it('submitting form calls search function', () => {
    render(
      <Router history={historyMock}>
        <SearchForm />
      </Router>
    )

    userEvent.type(screen.getByRole('textbox'), 'sugar flour')
    userEvent.click(screen.getByRole('button'))

    expect(historyMock.push).toHaveBeenCalledTimes(1)
    expect(historyMock.push).toHaveBeenCalledWith('/?searchString=sugar flour')
  })
})
