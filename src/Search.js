import React, { useState, useEffect, useRef } from 'react'
import { Button, Form, Input } from 'reactstrap'
import debounce from 'lodash.debounce'
import './Styles.css'

const axios = require('axios')

export function Search ({ idToken }) {
  const refInput = useRef()
  const [searchString, setSearchString] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchCount, setSearchCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [skip, setSkip] = useState(0)

  useEffect(() => {
    if (!idToken) return
    axios.defaults.headers.common.Authorization = 'Bearer ' + idToken
  }, [idToken])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  })

  useEffect(() => {
    if (!searchString) return
    if (!idToken) return // Do not make a search if we do not have an idToken!

    setIsLoading(true)
    axios.get('http://localhost:3050/api/v1/recipes/search?searchString=' + searchString + '&skip=' + skip)
      .then((response) => { // TODO: deal with error
        setSearchResults(prevState => ([...prevState, ...response.data.recipes]))
        setSearchCount(response.data.count)
        setIsLoading(false)
      })
  }, [searchString, skip, idToken])

  const handleSubmit = (event) => {
    event.preventDefault()

    const searchText = refInput.current.value
    if (searchText !== searchString) {
      setSearchResults([])
      setSkip(0)
      setSearchString(searchText)
    }
  }

  const handleScroll = (event) => {
    debounce((event) => {
      const newSkip = searchResults.length
      if (isLoading || newSkip >= searchCount) return
      if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
        setSkip(newSkip)
      }
    }, 100)(event)
  }

  return (
    <div>
      <Form inline onSubmit={handleSubmit}>
        <Input type='text' innerRef={refInput} name='search' id='searchText' />
        <Button>Search</Button>
      </Form>
      {searchResults && searchCount
        ? <div><span>{searchCount} results</span>
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
