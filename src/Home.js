import React, { Component } from 'react'
import { Button, Form, Input } from 'reactstrap'
import debounce from 'lodash.debounce'
import './Styles.css'

const axios = require('axios')

export class Home extends Component {
  constructor (props) {
    super(props)
    this.state = { search: '', isLoading: false, skip: 0, searchResults: null, searchCount: 0 }
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.search = this.search.bind(this)
  }

  componentDidMount () {
    window.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleSearchChange (event) {
    const value = event.target.value

    this.setState({
      search: value
    })
  }

  handleSubmit (event) {
    event.preventDefault()
    this.setState({ searchResults: null }, () => {
      this.search(0)
    })
  }

  search (skip) {
    this.setState({ isLoading: true, skip: skip }, () => {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + this.props.idToken
      axios.get('http://localhost:3050/api/v1/recipes/search?searchString=' + this.state.search + '&skip=' + skip)
        .then((response) => { // TODO: deal with error
          console.log(response.data)
          let results = this.state.searchResults ? this.state.searchResults.concat(response.data.recipes) : response.data.recipes
          this.setState({ searchResults: results, searchCount: response.data.count, isLoading: false })
        })
    })
  }

  handleScroll (event) {
    console.log('scrolling event')
    debounce((event) => {
      console.log('handlescroll called')
      console.log(event)
      console.log('onscrollcalled -----')
      let newSkip = this.state.skip + this.state.searchResults.length
      if (this.state.isLoading || newSkip >= this.state.searchCount) return

      if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
        console.log('We are searching with scroll through window.onscroll')
        this.search(newSkip)
      }
    // const { offsetHeight, scrollTop, scrollHeight } = event.target
    // console.log('WE HAVE SCROLLED')
    // if (offsetHeight + scrollTop === scrollHeight) {
    //   console.log('searching with scroll with handleScroll')
    //   console.log(this.state.searchResults.length)
    //   this.search(this.state.skip + this.state.searchResults.length)
    // }
    }, 100)(event)
  }

  render () {
    return (
      <div onScroll={this.handleScroll}>
        <Form inline onSubmit={this.handleSubmit}>
          <Input type='text' name='search' id='searchText' onChange={this.handleSearchChange} value={this.state.search} />
          <Button>Search</Button>
        </Form>
        {this.state.searchResults
          ? <div><span>{this.state.searchCount} results</span>
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
