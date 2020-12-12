import React, { useState, useEffect, useContext } from 'react'
import qs from 'qs'
import { Container, Row, Col, Spinner } from 'reactstrap'
import { RecipeCard } from './RecipeCard'
import { Search } from './Search'
import { TagsMenu } from './TagsMenu'
import './Styles.css'
import { UserContext } from './UserContext'

const axios = require('axios')

export function Dashboard ({ location }) {
  const [recentlyAdded, setRecentlyAdded] = useState([])
  const [recentlyAddedLoading, setRecentlyAddedLoading] = useState(true)
  const [wantToTry, setWantToTry] = useState([])
  const [wantToTryLoading, setWantToTryLoading] = useState(true)
  const [searchParams, setSearchParams] = useState({})

  const idToken = useContext(UserContext)

  useEffect(() => {
    if (!idToken) return
    axios.defaults.headers.common.Authorization = 'Bearer ' + idToken
    setRecentlyAddedLoading(true)
    setWantToTryLoading(true)

    axios.get('http://localhost:3050/api/v1/recipes?limit=7')
      .then((response) => { // TODO: deal with error
        setRecentlyAdded(prevState => ([...prevState, ...response.data.recipes]))
        setRecentlyAddedLoading(false)
      })
    axios.get('http://localhost:3050/api/v1/recipes?wantToTry=true&limit=7')
      .then((response) => { // TODO: deal with error
        setWantToTry(prevState => ([...prevState, ...response.data.recipes]))
        setWantToTryLoading(false)
      })
  }, [idToken])

  useEffect(() => {
    const queryObj = qs.parse(location.search.substring(1, location.search.length))
    setSearchParams(queryObj)
  }, [location.search])

  const dashboard = (
    <Container fluid='xl' className='resultsContainer'>
      <span>Recently added:</span>
      {recentlyAddedLoading
        ? <Spinner size="sm" color="secondary" />
        : null}
      <ul className='results'>
        {recentlyAdded.map((recipe) => <RecipeCard key={recipe._id} data={recipe} />)}
      </ul>
      <span>Want to try:</span>
      {wantToTryLoading
        ? <Spinner size="sm" color="secondary" />
        : null}
      <ul className='results'>
        {wantToTry.map((recipe) => <RecipeCard key={recipe._id} data={recipe} />)}
      </ul>
    </Container>
  )

  const searchComponent = <Search searchParams={searchParams} />

  return (
    <Container fluid>
      <Row>
        <Col sm='1' md={{ size: 1 }} className='tagsMenu'>
          <TagsMenu />
        </Col>
        <Col sm='11' md={{ size: 11 }}>
          {Object.keys(searchParams).length > 0 ? searchComponent : dashboard}
        </Col>
      </Row>
    </Container>
  )
}
