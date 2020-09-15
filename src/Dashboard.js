import React, { useState, useEffect } from 'react'
import qs from 'qs'
import { Container } from 'reactstrap'
import { RecipeCard } from './RecipeCard'
import { Search } from './Search'
import './Styles.css'

const axios = require('axios')

export function Dashboard ({ idToken, location }) {
  const [recentlyAdded, setRecentlyAdded] = useState([])
  const [wantToTry, setWantToTry] = useState([])
  const [searchString, setSearchString] = useState('')

  useEffect(() => {
    if (!idToken) return
    axios.defaults.headers.common.Authorization = 'Bearer ' + idToken

    axios.get('http://localhost:3050/api/v1/recipes?limit=8')
      .then((response) => { // TODO: deal with error
        setRecentlyAdded(prevState => ([...prevState, ...response.data.recipes]))
      })
    axios.get('http://localhost:3050/api/v1/recipes?wantToTry=true&limit=8')
      .then((response) => { // TODO: deal with error
        setWantToTry(prevState => ([...prevState, ...response.data.recipes]))
      })
  }, [idToken])

  useEffect(() => {
    const queryObj = qs.parse(location.search.substring(1, location.search.length))
    setSearchString(queryObj.searchString)
  }, [location.search])

  const dashboard = (
    <Container fluid='xl'>
      <p>Recently added:</p>
      <ul className='results'>
        {recentlyAdded.map((recipe) => <RecipeCard key={recipe._id} data={recipe} />)}
      </ul>
      <hr />
      <p>Want to try:</p>
      <ul className='results'>
        {wantToTry.map((recipe) => <RecipeCard key={recipe._id} data={recipe} />)}
      </ul>
    </Container>
  )

  const searchComponent = <Search searchString={searchString} idToken={idToken} />

  return (
    <>
      {searchString ? searchComponent : dashboard}
    </>
  )
}
