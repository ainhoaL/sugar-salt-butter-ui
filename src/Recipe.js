import React, { useState, useEffect, useContext } from 'react'
import { Container, Row, Col, Alert } from 'reactstrap'
import qs from 'qs'
import './Styles.css'
import { ReadonlyRecipe } from './ReadonlyRecipe'
import { EditableRecipe } from './EditableRecipe'
import { UserContext } from './UserContext'
import { api } from './services/api'

export function Recipe (props) {
  const [edit, setEdit] = useState(false)
  const [recipe, setRecipe] = useState({})
  const [updatedRecipe, setUpdatedRecipe] = useState(false)

  const updatedRecipeAlertOnDismiss = () => setUpdatedRecipe(false)
  const idToken = useContext(UserContext)

  useEffect(() => {
    if (!idToken) return

    const { params } = props.match

    const { search } = props.location
    if (search) {
      const queryObj = qs.parse(search.substring(1, search.length))
      setEdit(queryObj.edit === 'true')
    }

    getRecipe(idToken, params.id)
  }, [props, idToken])

  useEffect(() => {
    if (!recipe) return
    if (updatedRecipe) {
      getRecipe(idToken, recipe._id)
    }
  }, [updatedRecipe, idToken, recipe])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    if (edit) {
      updatedRecipeAlertOnDismiss()
    }
  }, [edit])

  const getRecipe = (idToken, recipeId) => {
    return api.getRecipe(idToken, recipeId)
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

  const recipeUpdatedAlert = (
    <Alert color='info' isOpen={updatedRecipe} toggle={updatedRecipeAlertOnDismiss}>
      Recipe updated
    </Alert>
  )

  if (!recipe || !recipe.title) {
    // TODO: loading message?
    return null
  }
  return (
    <Container>
      <Row>
        <Col sm='12' md={{ size: 10, offset: 1 }} className='recipePage'>
          {recipeUpdatedAlert}
          {edit
            ? <EditableRecipe initialRecipe={recipe} editRecipe={setEdit} updatedRecipe={setUpdatedRecipe} />
            : <ReadonlyRecipe recipe={recipe} editRecipe={setEdit} />}
        </Col>
      </Row>
    </Container>
  )
}
