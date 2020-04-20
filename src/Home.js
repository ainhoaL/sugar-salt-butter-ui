import React, { useState } from 'react'
import { Button, Form, Input } from 'reactstrap'
import './Styles.css'

const axios = require('axios')

export function Home (props) {
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState(null)

  const handleSearchChange = (event) => {
    const value = event.target.value

    setSearch(value)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    axios.defaults.headers.common['Authorization'] = 'Bearer ' + props.idToken
    axios.get('http://localhost:3050/api/v1/recipes/search?searchString=' + search)
      .then((response) => { // TODO: deal with error
        setSearchResults(response.data)
      })
  }

  return (
    <div>
      <Form inline onSubmit={handleSubmit}>
        <Input type='text' name='search' id='searchText' onChange={handleSearchChange} value={search} />
        <Button>Search</Button>
      </Form>
      {searchResults
        ? <div><span>{searchResults.length} results</span>
          <ul className='results'>
            {searchResults.map((recipe) =>
              <RecipeCard key={recipe._id} data={recipe} />
            )}
          </ul>
        </div>
        : null}
    </div>
  )
}

function RecipeCard (props) {
  const linkToRecipe = 'recipes/' + props.data._id
  return (
    <li className='recipeBox'>
      <a href={linkToRecipe} className='recipeCard'>
        <img src={props.data.image} className='recipeCardImage' alt={props.data.title} /><br />
        <p className='recipeCardTitle'>{props.data.title}</p>
      </a>
    </li>
  )
}
