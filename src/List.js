import React, { useState, useEffect, useContext } from 'react'
import { Container, Row, Col, Button } from 'reactstrap'
import './Styles.css'
import iconServings from './icons/icons8-restaurant-24.png'
import { UserContext } from './UserContext'

const axios = require('axios')

export function List (props) {
  const [list, setList] = useState({})
  const [selectedRecipe, setSelectedRecipe] = useState('')
  const idToken = useContext(UserContext)

  useEffect(() => {
    if (!idToken) return
    const { params } = props.match
    getList(idToken, params.id)
  }, [idToken, props.match])

  const getList = (idToken, listId) => {
    axios.defaults.headers.common.Authorization = 'Bearer ' + idToken
    axios.get('http://localhost:3050/api/v1/lists/' + listId)
      .then((response) => { // TODO: deal with error
        const list = response.data
        setList(list)
      })
  }

  const deleteRecipeFromList = (recipe) => {
    axios.delete('http://localhost:3050' + recipe.href)
      .then(() => { // TODO: deal with error
        getList(props.idToken, list._id)
      })
  }

  if (!list) {
    // TODO: loading message?
    return null
  }

  let itemsList
  if (list.items) {
    itemsList = list.items.map((item, index) => {
      return <li key={item._id}><span className={selectedRecipe === item.recipeId ? 'recipeSelected' : ''}>{item.displayQuantity} {item.unit} {item.name}</span></li>
    })
  }

  let recipesList
  if (list.recipes && list.recipes.recipesData) {
    recipesList = list.recipes.recipesData.map((recipe, index) => {
      return (
        <li key={recipe._id}>
          <div className='listRecipeContainer' onMouseEnter={() => setSelectedRecipe(recipe._id)} onMouseLeave={() => setSelectedRecipe()}>
            <a href={recipe.href}>
              <img src={recipe.image} className='listRecipeImage' alt={recipe.title} />
            </a>
            <div className='listRecipeInfo'>
              <a href={recipe.href} className='listRecipeTitle'>
                <span>{recipe.title}</span>
              </a>
              { recipe.servings ? <span><img src={iconServings} alt='servings' />{recipe.servings}</span> : null }
            </div>
          </div>
          <Button className='delete' onClick={() => deleteRecipeFromList(recipe)}>x</Button>
        </li>
      )
    })
  }

  return (
    <Container fluid>
      <Row>
        <Col sm='9' md={{ size: 6, offset: 2 }}>
          <div className='listContainer'>
            <h4>{list.title}</h4>
            <ul className='listItems'>
              {itemsList}
            </ul>
          </div>
        </Col>
        <Col sm='3' md={{ size: 4 }}>
          { recipesList && recipesList.length > 0
            ? (
              <div className='position-fixed listContainerRecipes'>
                <strong>Recipes:</strong>
                <ul className='listRecipe'>
                  {recipesList}
                </ul>
              </div>
            )
            : null }
        </Col>
      </Row>
    </Container>
  )
}
