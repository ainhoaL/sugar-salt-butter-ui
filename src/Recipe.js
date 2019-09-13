import React, { Component } from 'react'
import { Button, Form, FormGroup, Label, Input, Container, Row, Col, Badge } from 'reactstrap'
import qs from 'qs'

const axios = require('axios')

export class Recipe extends Component {
  constructor (props) {
    super(props)
    this.state = { edit: false, recipe: {} }
  }

  componentDidMount () {
    const { params } = this.props.match
    const { search } = this.props.location
    if (search) {
      let queryObj = qs.parse(search.substring(1, search.length))
      this.setState({
        edit: queryObj.edit
      })
    }

    axios.get('http://localhost:3050/api/v1/recipes/' + params.id)
      .then((response) => { // TODO: deal with error
        let recipe = response.data
        if (recipe && recipe.ingredients) {
          let ingredients = []
          let currentGroup
          recipe.ingredients.forEach((ingredient) => {
            let ingredientString = ''
            let ingredientGroup = ingredient.group
            if (ingredientGroup !== currentGroup) {
              ingredients.push({ groupHeader: ingredientGroup })
              currentGroup = ingredientGroup
            }

            if (ingredient.quantity) {
              ingredientString += ingredient.quantity + ' '
            }
            if (ingredient.unit) {
              ingredientString += ingredient.unit + ' '
            }
            ingredientString += ingredient.name
            ingredients.push({ ingredient: ingredientString })
          })

          recipe.ingredientList = ingredients

          if (recipe.macros) { // Flatten recipe object
            recipe.calories = recipe.macros.calories
            recipe.carbs = recipe.macros.carbs
            recipe.protein = recipe.macros.protein
            recipe.fat = recipe.macros.fat
            delete recipe.macros
          }
        }
        this.setState({
          recipe: recipe
        })
      })
  }

  render () {
    if (!this.state.recipe || !this.state.recipe.title) {
      // TODO: loading message?
      return null
    }
    return (
      <Container>
        <Row>
          <Col sm='12' md={{ size: 8, offset: 2 }}>
            <img src={this.state.recipe.image} alt={this.state.recipe.title} style={{ 'maxWidth': '100%', 'maxHeight': 400 }} />
            { this.state.edit === 'true'
              ? <EditableRecipe initialRecipe={this.state.recipe} />
              : <ReadonlyRecipe recipe={this.state.recipe} />
            }
          </Col>
        </Row>
      </Container>
    )
  }
}

export class EditableRecipe extends Component {
  constructor (props) {
    super(props)
    let recipe = { ...props.initialRecipe } // Copy to not alter main recipe object
    if (recipe.tags) {
      recipe.tags = recipe.tags.join(', ')
    }

    let ingredientList = recipe.ingredientList.map((item, index) => {
      if (item.groupHeader) {
        return '# ' + item.groupHeader
      } else {
        return item.ingredient
      }
    }).join('\n')

    recipe.ingredientList = ingredientList

    this.state = { recipe: recipe }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    let newRecipe = { ...this.state.recipe }
    newRecipe[name] = value

    this.setState({
      recipe: newRecipe
    })
  }

  render () {
    return (
      <Form>
        <FormGroup>
          <Label for='titleText'>Title</Label>
          <Input type='text' name='title' id='titleText' value={this.state.recipe.title} onChange={this.handleChange} />
        </FormGroup>
        <FormGroup>
          <Label for='urlText'>Link</Label>
          <Input type='text' name='url' id='urlText' value={this.state.recipe.url} onChange={this.handleChange} />
        </FormGroup>
        <FormGroup>
          <Label for='sourceText'>Source</Label>
          <Input type='text' name='url' id='sourceText' value={this.state.recipe.source} onChange={this.handleChange} />
        </FormGroup>
        <FormGroup>
          <Label for='authorText'>Author</Label>
          <Input type='text' name='author' id='authorText' value={this.state.recipe.author} onChange={this.handleChange} />
        </FormGroup>
        <FormGroup>
          <Label for='imageText'>Image Url</Label>
          <Input type='text' name='image' id='imageText' value={this.state.recipe.image} onChange={this.handleChange} />
        </FormGroup>
        <FormGroup>
          <Label for='tagsText'>Tags</Label>
          <Input type='text' name='tags' id='tagsText' value={this.state.recipe.tags} onChange={this.handleChange} />
        </FormGroup>
        <Row form>
          <Col md={4}>
            <FormGroup>
              <Label for='servingsText'>Servings</Label>
              <Input type='text' name='servings' id='servingsText' value={this.state.recipe.servings} onChange={this.handleChange} />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label for='prepTimeText'>Prep Time</Label>
              <Input type='text' name='prepTime' id='prepTimeText' value={this.state.recipe.prepTime} onChange={this.handleChange} />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label for='cookingTimeText'>Cooking Time</Label>
              <Input type='text' name='cookingTime' id='cookingTimeText' value={this.state.recipe.cookingTime} onChange={this.handleChange} />
            </FormGroup>
          </Col>
        </Row>
        <FormGroup>
          <Label for='ingredientsText'>Ingredients</Label>
          <Input type='textarea' name='ingredientList' id='ingredientListText' value={this.state.recipe.ingredientList} onChange={this.handleChange} />
        </FormGroup>
        <FormGroup>
          <Label for='instructionsText'>Instructions</Label>
          <Input type='textarea' name='instructions' id='instructionsText' value={this.state.recipe.instructions} onChange={this.handleChange} />
        </FormGroup>
        <FormGroup>
          <Label for='storageText'>Storage</Label>
          <Input type='text' name='storage' id='storageText' value={this.state.recipe.storage} onChange={this.handleChange} />
        </FormGroup>
        <FormGroup check>
          <Label check>
            <Input type='checkbox' name='freezes' id='freezesCheck' checked={this.state.recipe.freezes} onChange={this.handleChange} />{' '}
            Freezes
          </Label>
        </FormGroup>
        <FormGroup>
          <Label for='notesText'>Notes</Label>
          <Input type='textarea' name='notes' id='notesText' value={this.state.recipe.notes} onChange={this.handleChange} />
        </FormGroup>
        <FormGroup>
          <Label for='equipmentText'>Equipment</Label>
          <Input type='text' name='equipment' id='equipmentText' value={this.state.recipe.equipment} onChange={this.handleChange} />
        </FormGroup>
        <div>
          <Row form>
            <Col md={3}>
              <FormGroup>
                <Label for='caloriesText'>Calories</Label>
                <Input type='text' name='calories' id='caloriesText' value={this.state.recipe.calories} onChange={this.handleChange} />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for='proteinText'>Protein</Label>
                <Input type='text' name='protein' id='proteinText' value={this.state.recipe.protein} onChange={this.handleChange} />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for='carbsText'>Carbs</Label>
                <Input type='text' name='carbs' id='carbsText' value={this.state.recipe.carbs} onChange={this.handleChange} />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for='fatText'>Fat</Label>
                <Input type='text' name='fat' id='fatText' value={this.state.recipe.fat} onChange={this.handleChange} />
              </FormGroup>
            </Col>
          </Row>
        </div>
        <FormGroup>
          <Label for='ratingText'>Rating</Label>
          <Input type='text' name='rating' id='ratingText' value={this.state.recipe.rating} onChange={this.handleChange} />
        </FormGroup>
        <FormGroup check inline>
          <Label check>
            <Input type='checkbox' id='tryCheck' name='wantToTry' checked={this.state.recipe.wantToTry} onChange={this.handleChange} />{' '}
            Want to try
          </Label>
        </FormGroup>
        <FormGroup check inline>
          <Label check>
            <Input type='checkbox' id='doneCheck' name='done' checked={this.state.recipe.done} onChange={this.handleChange} />{' '}
            Tried
          </Label>
        </FormGroup>
        <br />
        <Button>Update</Button>
      </Form>
    )
  }
}

export class ReadonlyRecipe extends Component {
  render () {
    const recipe = this.props.recipe
    let listTags
    if (recipe.tags) {
      listTags = recipe.tags.map((tag) =>
        <Badge color='secondary' key={tag} pill>{tag}</Badge>
      )
    }

    let ingredientList = recipe.ingredientList.map((item, index) => {
      if (item.groupHeader) {
        return <React.Fragment key={index}><strong>{item.groupHeader}: </strong><br /></React.Fragment>
      } else {
        return <React.Fragment key={index}>{item.ingredient}<br /></React.Fragment>
      }
    })

    return (
      <div>
        <h2>{recipe.title}</h2>
        <a href={recipe.url} target='blank'><h4>{recipe.source} by {recipe.author}</h4></a>
        <p>
          { recipe.servings
            ? <span>Servings: {recipe.servings}</span>
            : null }
          { recipe.prepTime
            ? <span>Prep time: {recipe.prepTime}</span>
            : null }
          { recipe.cookingTime
            ? <span>Cooking time: {recipe.cookingTime}</span>
            : null }
        </p>
        <div style={{ 'whiteSpace': 'pre-line' }}><strong>Ingredients: </strong><br />
          {ingredientList}
        </div>
        <div style={{ 'whiteSpace': 'pre-line' }}><strong>Instructions: </strong><br />
          {recipe.instructions}
        </div>
        { recipe.storage
          ? <p><strong>Storage: </strong><br />
            {recipe.storage}
          </p>
          : null }
        { recipe.notes
          ? <p><strong>Notes: </strong><br />
            {recipe.notes}
          </p>
          : null
        }
        { recipe.equipment
          ? <p><strong>Equipment: </strong><br />
            {recipe.equipment}
          </p>
          : null
        }
        { recipe.calories
          ? <p>Calories: {recipe.calories}
            Protein: {recipe.protein}
            Carbs: {recipe.carbs}
            Fat: {recipe.carbs}
          </p>
          : null
        }
        {listTags}
      </div>
    )
  }
}
