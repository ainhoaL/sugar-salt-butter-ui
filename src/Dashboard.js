import React, { useState, useEffect, useContext } from 'react'
import qs from 'qs'
import { Container, Row, Col } from 'reactstrap'
import { RecipeCard } from './RecipeCard'
import { Search } from './Search'
import { TagsMenu } from './TagsMenu'
import './Styles.css'
import { UserContext } from './UserContext'
import { api } from './services/api'

export function Dashboard ({ location }) {
  const [recentlyAdded, setRecentlyAdded] = useState([])
  const [wantToTry, setWantToTry] = useState([])
  const [seasonal, setSeasonal] = useState([])
  const [searchParams, setSearchParams] = useState({})

  const idToken = useContext(UserContext)

  useEffect(() => {
    if (!idToken) return
    const queryObj = qs.parse(location.search.substring(1, location.search.length))
    setSearchParams(queryObj)
    if (Object.keys(queryObj).length > 0) return // Do not trigger dashboard calls if we are showing the search component

    api.searchRecipes(idToken, 'limit=7')
      .then((response) => { // TODO: deal with error
        setRecentlyAdded(prevState => ([...prevState, ...response.data.recipes]))
      })
    api.searchRecipes(idToken, 'wantToTry=true&limit=7')
      .then((response) => { // TODO: deal with error
        setWantToTry(prevState => ([...prevState, ...response.data.recipes]))
      })
    const nowDate = new Date()
    const seasonMonth = nowDate.getMonth() + 1
    api.searchRecipes(idToken, 'season=' + seasonMonth + '&limit=7')
      .then((response) => { // TODO: deal with error
        setSeasonal(prevState => ([...prevState, ...response.data.recipes]))
      })
  }, [idToken, location.search])

  const dashboard = (
    <Container fluid='xl' className='resultsContainer'>
      <span>Recently added:</span>
      <ul className='results'>
        {recentlyAdded.map((recipe) => <RecipeCard key={recipe._id} data={recipe} />)}
      </ul>
      <span>In season:</span>
      <ul className='results'>
        {seasonal.map((recipe) => <RecipeCard key={recipe._id} data={recipe} />)}
      </ul>
      <span>Want to try:</span>
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
