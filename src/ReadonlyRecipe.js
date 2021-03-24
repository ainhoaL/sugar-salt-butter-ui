import React, { useState, useEffect, useContext } from 'react'
import { Button, Input, Badge, InputGroup, InputGroupAddon, InputGroupText, Alert } from 'reactstrap'
import './Styles.css'
import iconServings from './icons/icons8-restaurant-24.png'
import iconEdit from './icons/icons8-edit-24.png'
import iconDelete from './icons/icons8-trash-can-24.png'
import { StarRating } from './StarRating'
import { Link } from 'react-router-dom'
import { UserContext } from './UserContext'
import { api } from './services/api'

export function ReadonlyRecipe (props) {
  const [lists, setLists] = useState([])
  const [selectedList, setSelectedList] = useState('')
  const [listServings, setListServings] = useState(props.recipe.servings)
  const [newListName, setNewListName] = useState('')
  const [newListId, setNewListId] = useState()
  const [addedToListAlertVisible, setAddedToListAlertVisible] = useState(false)
  const [deletedRecipe, setDeletedRecipe] = useState(false)

  const addedToListAlertOnDismiss = () => setAddedToListAlertVisible(false)

  const idToken = useContext(UserContext)

  useEffect(() => {
    api.getLists(idToken)
      .then((response) => {
        const dbLists = response.data
        let listNames = []
        listNames = dbLists.map((list) => {
          return { id: list._id, title: list.title, recipesUrl: list.recipes.href }
        })
        listNames.push({ id: 'newlist', title: 'New list' })
        setLists(listNames)
        setSelectedList(listNames[0].id)
      })
  }, [idToken])

  const recipe = props.recipe
  let listTags
  if (recipe && recipe.tags) {
    listTags = recipe.tags.map((tag) => {
      const tagHref = '/?tags=' + tag
      return <Link to={tagHref} key={tag}><Badge color='secondary' pill>{tag}</Badge></Link>
    })
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

  const handleAddToList = (event) => {
    event.preventDefault()
    addedToListAlertOnDismiss()

    const listObject = {
      recipeId: recipe._id,
      recipeServings: listServings
    }

    if (selectedList !== 'newlist') {
      return api.addRecipeToList(idToken, selectedList, listObject)
        .then(() => {
          setAddedToListAlertVisible(true)
        })
    } else {
      const newList = { title: newListName }
      return api.createList(idToken, newList)
        .then((response) => {
          const dbList = response.data
          setNewListId(dbList._id)
          return api.addRecipeToList(idToken, dbList._id, listObject)
            .then(() => {
              setAddedToListAlertVisible(true)
            })
        })
    }
  }

  const handleDeleteRecipe = () => {
    return api.deleteRecipe(idToken, recipe._id)
      .then(() => {
        setDeletedRecipe(true)
      })
  }

  let listOptions = []
  listOptions = lists.map((list) => {
    return <option key={list.id} value={list.id}>{list.title}</option>
  })

  const newListInput = (
    <Input type='text' name='listName' id='listNameText' value={newListName} onChange={(event) => setNewListName(event.target.value)} placeholder='New list name' />
  )

  const listServingsInput = (
    <>
      <InputGroupAddon addonType='prepend'>
        <InputGroupText>Servings:</InputGroupText>
      </InputGroupAddon>
      <Input type='text' name='listServings' id='servingsText' value={listServings} onChange={(event) => setListServings(event.target.value)} placeholder='Servings to add to list' />
    </>
  )

  const listUrl = selectedList !== 'newlist' ? `/lists/${selectedList}` : `/lists/${newListId}`
  let selectedListName
  lists.forEach((list) => {
    if (list.id === selectedList) {
      selectedListName = list.title
    }
  })
  const listName = selectedList !== 'newlist' ? selectedListName : newListName
  const addedToListAlert = (
    <Alert color='info' isOpen={addedToListAlertVisible} toggle={addedToListAlertOnDismiss}>
      Recipe added to list <Link to={listUrl}>{listName}</Link>
    </Alert>
  )

  return (
    <div>
      <div className='recipeHeaderContainer'>
        <div className='recipeHeaderImage'>
          <img src={recipe.image} alt={recipe.title} />
        </div>
        <div className='recipeHeaderText'>
          <h2>{recipe.title}
            <span className='actionsMenu'>
              <input type='image' src={iconEdit} alt='edit recipe' className='action' onClick={() => props.editRecipe(true)} />
              <input type='image' src={iconDelete} alt='delete recipe' className='action' onClick={handleDeleteRecipe} />
            </span>
          </h2>
          {deletedRecipe ? <i>Recipe deleted</i> : null}
          <h6><a href={recipe.url} target='blank'>{recipeSource}</a></h6>
          {recipe.rating
            ? <p><StarRating currentRating={recipe.rating} /></p>
            : null}
          {recipe.servings
            ? <p><img src={iconServings} alt='servings' />{recipe.servings}</p>
            : null}
          {recipe.prepTime
            ? <p>Prep time: {recipe.prepTime}</p>
            : null}
          {recipe.cookingTime
            ? <p>Cooking time: {recipe.cookingTime}</p>
            : null}
          {listTags}
          <hr />
          <h6>Add to shopping list</h6>
          <InputGroup>
            <InputGroupAddon addonType='prepend'>
              <InputGroupText>List:</InputGroupText>
            </InputGroupAddon>
            <Input type='select' name='listsSelect' id='listsSelect' value={selectedList} onChange={(event) => setSelectedList(event.target.value)}>
              {listOptions}
            </Input>
            {selectedList === 'newlist'
              ? newListInput
              : null}
            {recipe.servings
              ? listServingsInput
              : null}
            <InputGroupAddon addonType='append'><Button type='submit' id='addRecipeToListButton' aria-label='add recipe to list' onClick={handleAddToList}>Add</Button></InputGroupAddon>
          </InputGroup>
          {addedToListAlert}
        </div>
      </div>
      <br />
      <p data-testid='ingredientsContainer'><strong>Ingredients: </strong><br />
        {ingredientList}
      </p>s
      <p className='recipeParagraph' data-testid='instructionsContainer'><strong>Instructions: </strong><br />
        {recipe.instructions}
      </p>
      {recipe.storage
        ? <p data-testid='storageContainer'><strong>Storage: </strong><br />{recipe.storage}</p>
        : null}
      {recipe.notes
        ? <p className='recipeParagraph' data-testid='notesContainer'><strong>Notes: </strong><br />{recipe.notes}</p>
        : null}
      {recipe.equipment
        ? <p data-testid='equipmentContainer'><strong>Equipment: </strong><br />{recipe.equipment}</p>
        : null}
      {recipe.calories
        ? <p data-testid='nutritionContainer'><strong>Nutritional information: </strong><br />Calories: {recipe.calories} Protein: {recipe.protein} Carbs: {recipe.carbs} Fat: {recipe.fat}</p>
        : null}
    </div>
  )
}
