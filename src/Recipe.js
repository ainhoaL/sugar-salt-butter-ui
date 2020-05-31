import React, { useState, useEffect } from 'react'
import { Button, Form, FormGroup, Label, Input, Container, Row, Col, Badge } from 'reactstrap'
import qs from 'qs'
import './Styles.css'

const axios = require('axios')

const defaultEditableRecipe = {
  _id: '',
  userId: '',
  title: '',
  url: '',
  source: '',
  author: '',
  image: '',
  tags: '',
  servings: '',
  prepTime: '',
  cookingTime: '',
  ingredients: '',
  ingredientList: '',
  instructions: '',
  storage: '',
  notes: '',
  equipment: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  rating: '',
  freezable: false,
  wantToTry: false,
  done: false
}
export function Recipe (props) {
  const [edit, setEdit] = useState(false)
  const [recipe, setRecipe] = useState({})

  useEffect(() => {
    const { params } = props.match

    const { search } = props.location
    if (search) {
      const queryObj = qs.parse(search.substring(1, search.length))
      setEdit(queryObj.edit)
    }

    if (props.idToken) {
      getRecipe(props.idToken, params.id)
    }
  }, [props])

  const getRecipe = (idToken, recipeId) => {
    axios.defaults.headers.common.Authorization = 'Bearer ' + idToken
    axios.get('http://localhost:3050/api/v1/recipes/' + recipeId)
      .then((response) => { // TODO: deal with error
        const recipe = response.data
        if (recipe && recipe.ingredients) {
          const ingredients = []
          let currentGroup
          recipe.ingredients.forEach((ingredient) => {
            let ingredientString = ''
            const ingredientGroup = ingredient.group
            if (ingredientGroup !== currentGroup) {
              ingredients.push({ groupHeader: ingredientGroup })
              currentGroup = ingredientGroup
            }

            if (ingredient.displayQuantity) {
              ingredientString += ingredient.displayQuantity + ' '
            }
            if (ingredient.unit) {
              ingredientString += ingredient.unit + ' '
            }
            ingredientString += ingredient.name
            ingredients.push({ ingredient: ingredientString })
          })

          recipe.ingredientList = ingredients

          if (recipe.nutrition) { // Flatten recipe object
            recipe.calories = recipe.nutrition.calories
            recipe.carbs = recipe.nutrition.carbs
            recipe.protein = recipe.nutrition.protein
            recipe.fat = recipe.nutrition.fat
            delete recipe.nutrition
          }
        }
        setRecipe(recipe)
      })
  }

  if (!recipe || !recipe.title) {
    // TODO: loading message?
    return null
  }
  return (
    <Container>
      <Row>
        <Col sm='12' md={{ size: 10, offset: 1 }}>
          {edit === 'true'
            ? <EditableRecipe initialRecipe={recipe} />
            : <ReadonlyRecipe recipe={recipe} />}
        </Col>
      </Row>
    </Container>
  )
}

export function EditableRecipe (props) {
  const [recipe, setRecipe] = useState(defaultEditableRecipe)
  const [updatedRecipe, setUpdatedRecipe] = useState(false)

  useEffect(() => {
    const recipe = props.initialRecipe
    if (recipe.tags) {
      recipe.tags = recipe.tags.join(', ')
    }

    const ingredientList = recipe.ingredientList.map((item, index) => {
      if (item.groupHeader) {
        return '# ' + item.groupHeader
      } else {
        return item.ingredient
      }
    }).join('\n')

    recipe.ingredientList = ingredientList
    setRecipe({ ...defaultEditableRecipe, ...recipe })
  }, [props])

  const handleChange = (event) => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    const newRecipe = { ...recipe }
    newRecipe[name] = value

    setRecipe(newRecipe)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    // Recreate nutrition structure in recipe object
    const recipeObject = { ...recipe }
    recipeObject.nutrition = { calories: recipeObject.calories, protein: recipeObject.protein, carbs: recipeObject.carbs, fat: recipeObject.fat }
    delete recipeObject.calories
    delete recipeObject.protein
    delete recipeObject.carbs
    delete recipeObject.fat
    // Recreate ingredients structure in a way the server can understand. Ingredients needs to be a string (currently an array, ingredientList is the value we want)
    recipeObject.ingredients = recipeObject.ingredientList
    delete recipeObject.ingredientList

    axios.put('http://localhost:3050/api/v1/recipes/' + recipe._id, recipeObject)
      .then((response) => {
        setUpdatedRecipe(true)
      })
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label for='titleText'>Title</Label>
        <Input type='text' name='title' id='titleText' value={recipe.title} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label for='urlText'>Link</Label>
        <Input type='text' name='url' id='urlText' value={recipe.url} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label for='sourceText'>Source</Label>
        <Input type='text' name='url' id='sourceText' value={recipe.source} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label for='authorText'>Author</Label>
        <Input type='text' name='author' id='authorText' value={recipe.author} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label for='imageText'>Image Url</Label>
        <Input type='text' name='image' id='imageText' value={recipe.image} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label for='tagsText'>Tags</Label>
        <Input type='text' name='tags' id='tagsText' value={recipe.tags} onChange={handleChange} />
      </FormGroup>
      <Row form>
        <Col md={4}>
          <FormGroup>
            <Label for='servingsText'>Servings</Label>
            <Input type='text' name='servings' id='servingsText' value={recipe.servings} onChange={handleChange} />
          </FormGroup>
        </Col>
        <Col md={4}>
          <FormGroup>
            <Label for='prepTimeText'>Prep Time</Label>
            <Input type='text' name='prepTime' id='prepTimeText' value={recipe.prepTime} onChange={handleChange} />
          </FormGroup>
        </Col>
        <Col md={4}>
          <FormGroup>
            <Label for='cookingTimeText'>Cooking Time</Label>
            <Input type='text' name='cookingTime' id='cookingTimeText' value={recipe.cookingTime} onChange={handleChange} />
          </FormGroup>
        </Col>
      </Row>
      <FormGroup>
        <Label for='ingredientsText'>Ingredients</Label>
        <Input type='textarea' name='ingredientList' id='ingredientListText' value={recipe.ingredientList} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label for='instructionsText'>Instructions</Label>
        <Input type='textarea' name='instructions' id='instructionsText' value={recipe.instructions} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label for='storageText'>Storage</Label>
        <Input type='text' name='storage' id='storageText' value={recipe.storage} onChange={handleChange} />
      </FormGroup>
      <FormGroup check>
        <Label check>
          <Input type='checkbox' name='freezable' id='freezableCheck' checked={recipe.freezable} onChange={handleChange} />{' '}
          Freezable
        </Label>
      </FormGroup>
      <FormGroup>
        <Label for='notesText'>Notes</Label>
        <Input type='textarea' name='notes' id='notesText' value={recipe.notes} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label for='equipmentText'>Equipment</Label>
        <Input type='text' name='equipment' id='equipmentText' value={recipe.equipment} onChange={handleChange} />
      </FormGroup>
      <div>
        <Row form>
          <Col md={3}>
            <FormGroup>
              <Label for='caloriesText'>Calories</Label>
              <Input type='text' name='calories' id='caloriesText' value={recipe.calories} onChange={handleChange} />
            </FormGroup>
          </Col>
          <Col md={3}>
            <FormGroup>
              <Label for='proteinText'>Protein</Label>
              <Input type='text' name='protein' id='proteinText' value={recipe.protein} onChange={handleChange} />
            </FormGroup>
          </Col>
          <Col md={3}>
            <FormGroup>
              <Label for='carbsText'>Carbs</Label>
              <Input type='text' name='carbs' id='carbsText' value={recipe.carbs} onChange={handleChange} />
            </FormGroup>
          </Col>
          <Col md={3}>
            <FormGroup>
              <Label for='fatText'>Fat</Label>
              <Input type='text' name='fat' id='fatText' value={recipe.fat} onChange={handleChange} />
            </FormGroup>
          </Col>
        </Row>
      </div>
      <FormGroup>
        <Label for='ratingText'>Rating</Label>
        <Input type='text' name='rating' id='ratingText' value={recipe.rating} onChange={handleChange} />
      </FormGroup>
      <FormGroup check inline>
        <Label check>
          <Input type='checkbox' id='tryCheck' name='wantToTry' checked={recipe.wantToTry} onChange={handleChange} />{' '}
          Want to try
        </Label>
      </FormGroup>
      <FormGroup check inline>
        <Label check>
          <Input type='checkbox' id='doneCheck' name='done' checked={recipe.done} onChange={handleChange} />{' '}
          Tried
        </Label>
      </FormGroup>
      <br /><br />
      <Button type='submit'>Update</Button>
      {updatedRecipe
        ? <i> Recipe updated</i>
        : null}
      <br /><br />
    </Form>
  )
}

export function ReadonlyRecipe (props) {
  const recipe = props.recipe
  let listTags
  if (recipe && recipe.tags) {
    listTags = recipe.tags.map((tag) =>
      <Badge color='secondary' key={tag} pill>{tag}</Badge>
    )
  }

  const ingredientList = recipe.ingredientList.map((item, index) => {
    if (item.groupHeader) {
      return <React.Fragment key={index}><strong>{item.groupHeader}: </strong><br /></React.Fragment>
    } else {
      return <React.Fragment key={index}>{item.ingredient}<br /></React.Fragment>
    }
  })

  let recipeSource = recipe.source
  if (recipe.author) {
    recipeSource += ' by ' + recipe.author
  }

  return (
    <div>
      <div className='recipeHeaderContainer'>
        <div className='recipeHeaderImage'>
          <img src={recipe.image} alt={recipe.title} />
        </div>
        <div className='recipeHeaderText'>
          <h2>{recipe.title}</h2>
          <a href={recipe.url} target='blank'><h6>{recipeSource}</h6></a><br />
          {recipe.servings
            ? <p>Servings: {recipe.servings}</p>
            : null}
          {recipe.prepTime
            ? <p>Prep time: {recipe.prepTime}</p>
            : null}
          {recipe.cookingTime
            ? <p>Cooking time: {recipe.cookingTime}</p>
            : null}
          {listTags}
        </div>
      </div>
      <br />
      <p><strong>Ingredients: </strong><br />
        {ingredientList}
      </p>
      <p className='recipeParagraph'><strong>Instructions: </strong><br />
        {recipe.instructions}
      </p>
      { recipe.storage
        ? <p><strong>Storage: </strong><br />
          {recipe.storage}
        </p>
        : null }
      { recipe.notes
        ? <p className='recipeParagraph'><strong>Notes: </strong><br />
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
        ? <p>Nutritional information: <br />
            Calories: {recipe.calories} Protein: {recipe.protein} Carbs: {recipe.carbs} Fat: {recipe.carbs}
        </p>
        : null
      }
    </div>
  )
}
