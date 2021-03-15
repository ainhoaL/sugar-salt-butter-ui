import React from 'react'
import { TagsMenu } from './TagsMenu'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserContext } from './UserContext'
import { Router } from 'react-router-dom'
import { api } from './services/api'

jest.mock('./services/api')

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn(), createHref: jest.fn() }
const testUserId = 'testUser'

describe('TagsMenu component', () => {
  const tags = {
    data: [
      { _id: 'meat', count: 20 },
      { _id: 'vegetarian', count: 1 }
    ]
  }

  beforeEach(() => {
    api.getTags.mockResolvedValue(tags)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does not get tags if there is no idToken', () => {
    render(<UserContext.Provider value=''><TagsMenu /></UserContext.Provider>)

    expect(api.getTags).toHaveBeenCalledTimes(0)
  })

  it('gets tags and displays them if there is idToken', async () => {
    render(
      <Router history={historyMock}>
        <UserContext.Provider value={testUserId}><TagsMenu /></UserContext.Provider>
      </Router>
    )

    expect(api.getTags).toHaveBeenCalledWith(testUserId)

    await waitFor(() => expect(screen.getByText('meat')).toBeInTheDocument())
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('vegetarian')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()

    userEvent.click(screen.getByText('meat'))
    expect(historyMock.push).toHaveBeenCalledWith('/?tags=meat')
    userEvent.click(screen.getByText('vegetarian'))
    expect(historyMock.push).toHaveBeenCalledWith('/?tags=vegetarian')
  })

  it('displays no tags if none are returned', async () => {
    api.getTags.mockResolvedValue({ data: [] })
    render(
      <Router history={historyMock}>
        <UserContext.Provider value='testUser'><TagsMenu /></UserContext.Provider>
      </Router>
    )
    expect(api.getTags).toHaveBeenCalledWith(testUserId)

    await waitFor(() => expect(screen.queryByRole('link')).not.toBeInTheDocument()) // 0 links
  })
})
