import React, { useState, useEffect, useContext } from 'react'
import { Container, Row, Col } from 'reactstrap'
import qs from 'qs'
import './Styles.css'
import { ReadonlyRecipe } from './ReadonlyRecipe'
import { EditableRecipe } from './EditableRecipe'
import { UserContext } from './UserContext'

const axios = require('axios')

export function Recipe (props) {
  const [edit, setEdit] = useState(false)
  const [recipe, setRecipe] = useState({})

  const idToken = useContext(UserContext)

  useEffect(() => {
    if (!idToken) return

    const { params } = props.match

    const { search } = props.location
    if (search) {
      const queryObj = qs.parse(search.substring(1, search.length))
      setEdit(queryObj.edit)
    }

    getRecipe(idToken, params.id)
  }, [props, idToken])

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
