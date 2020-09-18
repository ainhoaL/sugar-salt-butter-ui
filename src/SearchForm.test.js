import React from 'react'
import { mount } from 'enzyme'
import { Router } from 'react-router-dom'
import { SearchForm } from './SearchForm'

const historyMock = { push: jest.fn(), location: {}, listen: jest.fn() }

describe('SearchForm component', () => {
  it('submitting form calls search function', () => {
    const wrapper = mount(
      <Router history={historyMock}>
        <SearchForm />
      </Router>
    )

    const form = wrapper.find('Form').at(0)
    const searchText = wrapper.find('#searchText').at(0)
    searchText.simulate('change', { target: { value: 'sugar flour', name: 'search' } })
    form.simulate('submit')

    expect(historyMock.push).toHaveBeenCalledTimes(1)
    expect(historyMock.push).toHaveBeenCalledWith('?searchString=sugar flour')
  })
})
