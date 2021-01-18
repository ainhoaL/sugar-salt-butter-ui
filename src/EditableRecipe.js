import React, { useState, useEffect, useContext } from 'react'
import { Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap'
import './Styles.css'
import { StarRating } from './StarRating'
import { UserContext } from './UserContext'

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

export function EditableRecipe (props) {
  const [recipe, setRecipe] = useState(defaultEditableRecipe)
  const [updatedRecipe, setUpdatedRecipe] = useState(false)

  const idToken = useContext(UserContext)

  useEffect(() => {
    const recipe = { ...props.initialRecipe }
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

    axios.defaults.headers.common.Authorization = 'Bearer ' + idToken
    axios.put('http://localhost:3050/api/v1/recipes/' + recipe._id, recipeObject)
      .then((response) => {
        setUpdatedRecipe(true)
      })
  }

  const changeRating = (ratingNumber) => {
    const newRecipe = { ...recipe }
    newRecipe.rating = ratingNumber

    setRecipe(newRecipe)
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
        <Label for='starRating'>Rating</Label><br />
        <StarRating id='starRating' currentRating={recipe.rating} changeRating={changeRating} />
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
      <Button type='submit'>Update</Button><Button onClick={() => props.editRecipe(false)}>Cancel</Button>
      <br />
      {updatedRecipe
        ? <i> Recipe updated</i>
        : null}
      <br /><br />
    </Form>
  )
}
