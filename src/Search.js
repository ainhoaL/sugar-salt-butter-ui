import React, { useState, useEffect, useContext } from 'react'
import debounce from 'lodash.debounce'
import { RecipeCard } from './RecipeCard'
import './Styles.css'
import { UserContext } from './UserContext'

const axios = require('axios')

export function Search ({ searchParams }) {
  const [searchResults, setSearchResults] = useState([])
  const [searchCount, setSearchCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [skip, setSkip] = useState(0)
  const idToken = useContext(UserContext)

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
    if (!searchParams) return
    if (!idToken) return // Do not make a search if we do not have an idToken!
    let searchHref = 'skip=' + skip + '&limit=70'
    for (const param of Object.entries(searchParams)) {
      searchHref += '&' + param[0] + '=' + param[1]
    }
    setIsLoading(true)
    axios.get('http://localhost:3050/api/v1/recipes?' + searchHref)
      .then((response) => { // TODO: deal with error
        setSearchResults(prevState => ([...prevState, ...response.data.recipes]))
        setSearchCount(response.data.count)
        setIsLoading(false)
      })
  }, [searchParams, skip, idToken])

  useEffect(() => {
    setSearchResults([])
    setSkip(0)
  }, [searchParams])

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
      {searchResults && searchCount
        ? <div className='resultsContainer'><span>{searchCount} results</span>
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
