import React, { useState, useEffect, useContext } from 'react'
import { Container, Row, Col, Button, ListGroup, ListGroupItem } from 'reactstrap'
import './Styles.css'
import iconServings from './icons/icons8-restaurant-24.png'
import iconDelete from './icons/icons8-trash-can-24.png'
import { UserContext } from './UserContext'

const axios = require('axios')

export function List (props) {
  const [list, setList] = useState(null)
  const [selectedRecipe, setSelectedRecipe] = useState('')
  const [deletedList, setDeletedList] = useState(false)
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
        getList(idToken, list._id)
      })
  }

  const deleteItem = (itemId) => {
    axios.delete('http://localhost:3050/api/v1/lists/' + list._id + '/items/' + itemId)
      .then(() => { // TODO: deal with error
        getList(idToken, list._id)
      })
  }

  const deleteList = () => {
    return axios.delete('http://localhost:3050/api/v1/lists/' + list._id)
      .then(() => {
        setDeletedList(true)
      })
  }

  if (!list) {
    // TODO: loading message?
    return null
  }

  let itemsList
  if (list.items && list.items.length > 0) {
    itemsList = list.items.map((item, index) => {
      return <li key={item._id} className='listItem'><span className={selectedRecipe === item.recipeId ? 'recipeSelected' : ''}>{item.displayQuantity} {item.unit} {item.name}</span><Button className='deleteListItem' aria-label='delete item' onClick={() => deleteItem(item._id)}>x</Button></li>
    })
  }

  let recipesList
  if (list.recipes && list.recipes.recipesData) {
    recipesList = list.recipes.recipesData.map((recipe, index) => {
      const recipeLink = '/recipes/' + recipe._id
      return (
        <ListGroupItem key={recipe._id}>
          <div className='listRecipeContainer' onMouseEnter={() => setSelectedRecipe(recipe._id)} onMouseLeave={() => setSelectedRecipe()}>
            <a href={recipeLink}>
              <img src={recipe.image} className='listRecipeImage' alt={recipe.title} />
            </a>
            <div className='listRecipeInfo'>
              <a href={recipeLink} className='listRecipeTitle'>
                <span>{recipe.title}</span>
              </a>
              {recipe.servings ? <span><img src={iconServings} alt='servings' />{recipe.servings}</span> : null}
            </div>
          </div>
          <Button className='deleteListItem' aria-label='delete recipe' onClick={() => deleteRecipeFromList(recipe)}>x</Button>
        </ListGroupItem>
      )
    })
  }

  return (
    <Container fluid>
      <Row>
        <Col sm='9' md={{ size: 6, offset: 2 }}>
          <div className='listContainer'>
            <h4>{list.title}
              <span className='actionsMenu'>
                <input type='image' src={iconDelete} alt='delete list' className='action' onClick={deleteList} />
              </span>
            </h4>
            {deletedList ? <i>List deleted</i> : null}
            <ul className='listItems'>
              {itemsList}
            </ul>
          </div>
        </Col>
        <Col sm='3' md={{ size: 4 }}>
          {recipesList && recipesList.length > 0
            ? (
              <div className='position-fixed listContainerRecipes'>
                <strong>Recipes:</strong>
                <ListGroup className='listRecipe'>
                  {recipesList}
                </ListGroup>
              </div>
            )
            : null}
        </Col>
      </Row>
    </Container>
  )
}
