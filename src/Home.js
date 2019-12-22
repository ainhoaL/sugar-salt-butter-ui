import React, { Component } from 'react'
import { Button, Form, Input } from 'reactstrap'
import './Styles.css'

const axios = require('axios')

export class Home extends Component {
  constructor (props) {
    super(props)
    this.state = { search: '', searchResults: null }
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
    event.preventDefault()

    axios.defaults.headers.common['Authorization'] = 'Bearer ' + this.props.idToken
    axios.get('http://localhost:3050/api/v1/recipes/search?searchString=' + this.state.search)
      .then((response) => { // TODO: deal with error
        console.log(response.data)
        this.setState({ searchResults: response.data })
      })
  }

  render () {
    return (
      <div>
        <Form inline onSubmit={this.handleSubmit}>
          <Input type='text' name='search' id='searchText' onChange={this.handleSearchChange} value={this.state.search} />
          <Button>Search</Button>
        </Form>
        {this.state.searchResults
          ? <div><span>{this.state.searchResults.length} results</span>
            <ul className='results'>
              {this.state.searchResults.map((recipe) =>
                <RecipeCard key={recipe._id} data={recipe} />
              )}
            </ul>
          </div>
          : null}
      </div>
    )
  }
}

class RecipeCard extends Component {
  render () {
    const linkToRecipe = 'recipes/' + this.props.data._id
    return (
      // <Card style={{width:"25%"}}>
      //   <CardImg top width="100%" src={this.props.data.image} />
      //   <CardBody>
      //     <CardTitle>{this.props.data.title}</CardTitle>
      //   </CardBody>
      // </Card>
      <li className='recipeBox'>
        <a href={linkToRecipe} className='recipeCard'>
          <img src={this.props.data.image} className='recipeCardImage' alt={this.props.data.title} /><br />
          <p className='recipeCardTitle'>{this.props.data.title}</p>
        </a>
      </li>
    )
  }
}
