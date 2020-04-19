import React, { useState, useEffect } from 'react'
import { Button, Form, Input } from 'reactstrap'
import debounce from 'lodash.debounce'
import './Styles.css'

const axios = require('axios')

export function Search (props) {
  const [searchString, setSearchString] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searchCount, setSearchCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [skip, setSkip] = useState(0)

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  })

  useEffect(() => {
    if (isLoading) {
      doSearch(skip)
    }
  }, [isLoading])

  const handleSearchChange = (event) => {
    const value = event.target.value

    setSearchString(value)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSkip(0)
    setIsLoading(true)
  }

  const doSearch = (newSkip) => {
    if (props.idToken && searchString) {
      axios.defaults.headers.common.Authorization = 'Bearer ' + props.idToken
      axios.get('http://localhost:3050/api/v1/recipes/search?searchString=' + searchString + '&skip=' + newSkip)
        .then((response) => { // TODO: deal with error
          const results = newSkip !== 0 ? searchResults.concat(response.data.recipes) : response.data.recipes
          setSearchResults(results)
          setSearchCount(response.data.count)
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }

  const handleScroll = (event) => {
    debounce((event) => {
      if (searchResults) {
        const newSkip = skip + searchResults.length
        if (isLoading || newSkip >= searchCount) return
        if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
          setSkip(newSkip)
          setIsLoading(true)
        }
      }
    // const { offsetHeight, scrollTop, scrollHeight } = event.target
    // if (offsetHeight + scrollTop === scrollHeight) {
    //   this.search(this.state.skip + this.state.searchResults.length)
    // }
    }, 100)(event)
  }

  return (
    <div onScroll={handleScroll}>
      <Form inline onSubmit={handleSubmit}>
        <Input type='text' name='search' id='searchText' onChange={handleSearchChange} value={searchString} />
        <Button>Search</Button>
      </Form>
      {searchResults
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
  // <Card style={{width:"25%"}}>
  //   <CardImg top width="100%" src={props.data.image} />
  //   <CardBody>
  //     <CardTitle>{props.data.title}</CardTitle>
  //   </CardBody>
  // </Card>
    <li className='recipeBox'>
      <a href={linkToRecipe} className='recipeCard'>
        <img src={props.data.image} className='recipeCardImage' alt={props.data.title} /><br />
        <p className='recipeCardTitle'>{props.data.title}</p>
      </a>
    </li>
  )
}
