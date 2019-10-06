import React, { Component } from 'react'
import { Button, Form, Input } from 'reactstrap'

export class Home extends Component {
  constructor (props) {
    super(props)
    this.state = { search: '' }
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSearchChange (event) {
    const value = event.target.value

    this.setState({
      search: value
    })
  }

  handleSubmit (event) {
    alert('A name was submitted: ' + this.state.search)
    event.preventDefault()
  }

  render () {
    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Input type='text' name='search' id='searchText' onChange={this.handleSearchChange} value={this.state.search} />
          <Button>Search</Button>
        </Form>
      </div>
    )
  }
}
