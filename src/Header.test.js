import React from 'react'
import { mount } from 'enzyme'
import { Router } from 'react-router-dom'
import { Header } from './Header'

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn() }

describe('Header component', () => {
  it('submitting search form changes router history', () => {
    const setSearchStringMock = jest.fn()

    const wrapper = mount(
      <Router history={historyMock}>
        <Header setSearchString={setSearchStringMock} />
      </Router>
    )

    const headerWrapper = wrapper.find('Header').at(0)
    const searchForm = headerWrapper.find('SearchForm').at(0)
    searchForm.props().search('cake') // call search function

    expect(setSearchStringMock).toHaveBeenCalledTimes(1)
    expect(setSearchStringMock).toHaveBeenCalledWith('cake')
    expect(historyMock.push).toHaveBeenCalledTimes(1)
    expect(historyMock.push).toHaveBeenCalledWith('/')
  })
})
