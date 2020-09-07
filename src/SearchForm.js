import React, { useRef } from 'react'
import { Button, Form, Input } from 'reactstrap'
import './Styles.css'

export function SearchForm ({ search }) {
  const refInput = useRef()

  const handleSubmit = (event) => {
    event.preventDefault()

    const searchText = refInput.current.value
    search(searchText)
  }

  return (
    <Form inline onSubmit={handleSubmit}>
      <Input type='text' innerRef={refInput} name='search' id='searchText' />
      <Button>Search</Button>
    </Form>
  )
}
