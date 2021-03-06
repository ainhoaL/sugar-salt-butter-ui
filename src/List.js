import React, { useState, useEffect, useContext } from 'react'
import { Container, Row, Col, Button, ListGroup, ListGroupItem } from 'reactstrap'
import { Link } from 'react-router-dom'
import './Styles.css'
import iconServings from './icons/icons8-restaurant-24.png'
import iconDelete from './icons/icons8-trash-can-24.png'
import { UserContext } from './UserContext'
import { api } from './services/api'

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
    return api.getList(idToken, listId)
      .then((response) => { // TODO: deal with error
        const list = response.data
        setList(list)
      })
  }

  const deleteRecipeFromList = (recipeId) => {
    return api.deleteRecipeFromList(idToken, list._id, recipeId)
      .then(() => { // TODO: deal with error
        getList(idToken, list._id)
      })
  }

  const deleteItem = (itemId) => {
    return api.deleteItemFromList(idToken, list._id, itemId)
      .then(() => { // TODO: deal with error
        getList(idToken, list._id)
      })
  }

  const deleteList = () => {
    return api.deleteList(idToken, list._id)
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
            <Link to={recipeLink}>
              <img src={recipe.image} className='listRecipeImage' alt={recipe.title} />
            </Link>
            <div className='listRecipeInfo'>
              <Link to={recipeLink} className='listRecipeTitle'>
                <span>{recipe.title}</span>
              </Link>
              {recipe.servings ? <span><img src={iconServings} alt='servings' />{recipe.servings}</span> : null}
            </div>
          </div>
          <Button className='deleteListItem' aria-label='delete recipe' onClick={() => deleteRecipeFromList(recipe._id)}>x</Button>
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
