import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import axios from 'axios';
import { Recipe } from './Recipe';

jest.mock('axios');

const recipeData = {
  data: {
    _id: '1234',
    title: 'testRecipe',
    ingredients: [],
    tags: [],
    instructions: ''
  }
};

describe('Recipe', () => {

  beforeEach(() => {
    axios.get.mockResolvedValue(recipeData);
  });

  it('gets recipe by Id on render', () => {
    const match = { params: { id: 'testId' }};
    const div = document.createElement('div');
    const wrapper = mount(<Recipe location={location} match={match} />);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3050/api/v1/recipes/testId');
  });

  it('renders form when edit is set to true', async () => {
    const match = { params: { id: '1234' }};
    const location = { search: '?edit=true' };
    const wrapper = mount(<Recipe location={location} match={match} />);

    await axios;
    wrapper.update(); // Re-render component
    expect(wrapper.find('ReadonlyRecipe').length).toEqual(0);
    expect(wrapper.find('EditableRecipe').length).toEqual(1);
  });

  it('renders readonly recipe when edit is not set', async () => {
    const match = { params: { id: '1234' }};
    const location = { search: '?edit=false' };
    const wrapper = mount(<Recipe location={location} match={match} />);

    await axios;
    wrapper.update(); // Re-render component
    expect(wrapper.find('ReadonlyRecipe').length).toEqual(1);
    expect(wrapper.find('EditableRecipe').length).toEqual(0);
  });

  it('renders readonly recipe when edit is not set', async () => {
    const match = { params: { id: '1234' }};
    const wrapper = mount(<Recipe location={location} match={match} />);

    await axios;
    wrapper.update(); // Re-render component
    expect(wrapper.find('ReadonlyRecipe').length).toEqual(1);
    expect(wrapper.find('EditableRecipe').length).toEqual(0);
  });
});
