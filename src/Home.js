import React, { Component } from 'react'
import { Button, Form, Input, Card, CardImg, CardBody, CardTitle, CardDeck } from 'reactstrap'

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
        {this.state.searchResults ?
          <div><span>{this.state.searchResults.length} results</span>
            <ul style={{width:"100%", display:"block"}}>
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
  render() {
    const linkToRecipe = 'recipes/' + this.props.data._id
    return (
      // <Card style={{width:"25%"}}>
      //   <CardImg top width="100%" src={this.props.data.image} />
      //   <CardBody>
      //     <CardTitle>{this.props.data.title}</CardTitle>
      //   </CardBody>
      // </Card>
      <li style={{width:"202px", height: "250px", display:"inline-block", "vertical-align":"top", margin:"6px"}}>
        <a href={linkToRecipe} style={{border:"1px solid #E1E3DF", display:"block", height:"100%", "text-decoration":"none"}}>
          <img src={this.props.data.image} style={{width:"200px", height:"200px", "object-fit":"cover"}} /><br />
          <span style={{color:"#222"}}>{this.props.data.title}</span>
        </a>
      </li>
    )
  }
}
