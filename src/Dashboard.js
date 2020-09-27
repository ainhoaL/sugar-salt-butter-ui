import React, { useState, useEffect } from 'react'
import qs from 'qs'
import { Container, Row, Col } from 'reactstrap'
import { RecipeCard } from './RecipeCard'
import { Search } from './Search'
import { TagsMenu } from './TagsMenu'
import './Styles.css'

const axios = require('axios')

export function Dashboard ({ idToken, location }) {
  const [recentlyAdded, setRecentlyAdded] = useState([])
  const [wantToTry, setWantToTry] = useState([])
  const [searchParams, setSearchParams] = useState({})

  useEffect(() => {
    if (!idToken) return
    axios.defaults.headers.common.Authorization = 'Bearer ' + idToken

    axios.get('http://localhost:3050/api/v1/recipes?limit=7')
      .then((response) => { // TODO: deal with error
        setRecentlyAdded(prevState => ([...prevState, ...response.data.recipes]))
      })
    axios.get('http://localhost:3050/api/v1/recipes?wantToTry=true&limit=7')
      .then((response) => { // TODO: deal with error
        setWantToTry(prevState => ([...prevState, ...response.data.recipes]))
      })
  }, [idToken])

  useEffect(() => {
    const queryObj = qs.parse(location.search.substring(1, location.search.length))
    setSearchParams(queryObj)
  }, [location.search])

  const dashboard = (
    <Container fluid='xl' className='resultsContainer'>
      <span>Recently added:</span>
      <ul className='results'>
        {recentlyAdded.map((recipe) => <RecipeCard key={recipe._id} data={recipe} />)}
      </ul>
      <span>Want to try:</span>
      <ul className='results'>
        {wantToTry.map((recipe) => <RecipeCard key={recipe._id} data={recipe} />)}
      </ul>
    </Container>
  )

  const searchComponent = <Search searchParams={searchParams} idToken={idToken} />

  return (
    <Container fluid>
      <Row>
        <Col sm='1' md={{ size: 1 }} className='tagsMenu'>
          <TagsMenu idToken={idToken} />
        </Col>
        <Col sm='11' md={{ size: 11 }}>
          {Object.keys(searchParams).length > 0 ? searchComponent : dashboard}
        </Col>
      </Row>
    </Container>
  )
}
