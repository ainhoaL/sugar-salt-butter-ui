import React from 'react'
import { mount } from 'enzyme'
import { SearchForm } from './SearchForm'

describe('SearchForm component', () => {
  it('submitting form calls search function', () => {
    const setSearchStringMock = jest.fn()

    const wrapper = mount(<SearchForm search={setSearchStringMock} />)

    const form = wrapper.find('Form').at(0)
    const searchText = wrapper.find('#searchText').at(0)
    searchText.getDOMNode().value = 'sugar flour'
    form.simulate('submit')

    expect(setSearchStringMock).toHaveBeenCalledTimes(1)
    expect(setSearchStringMock).toHaveBeenCalledWith('sugar flour')
  })
})
