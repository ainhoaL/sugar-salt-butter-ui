import React, { useState, useEffect } from 'react'
import { Button, Form, Input } from 'reactstrap'
import { useHistory } from 'react-router-dom'
import qs from 'qs'
import './Styles.css'

export function SearchForm () {
  const [searchString, setSearchString] = useState()

  const history = useHistory()

  const handleSubmit = (event) => {
    event.preventDefault()
    history.push('/?searchString=' + searchString)
  }

  useEffect(() => {
    const queryObj = qs.parse(window.location.search.substring(1, window.location.search.length))
    setSearchString(queryObj.searchString || '')
  }, [])

  return (
    <Form inline onSubmit={handleSubmit}>
      <Input type='text' value={searchString} onChange={(event) => setSearchString(event.target.value)} name='search' id='searchText' />
      <Button>Search</Button>
    </Form>
  )
}
