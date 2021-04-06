import React, { useState, useContext } from 'react'
import { Badge } from 'reactstrap'
import './Styles.css'
import iconServings from './icons/icons8-restaurant-24.png'
import iconEdit from './icons/icons8-edit-24.png'
import iconDelete from './icons/icons8-trash-can-24.png'
import { AddRecipeToListForm } from './AddRecipeToListForm'
import { StarRating } from './StarRating'
import { Link } from 'react-router-dom'
import { UserContext } from './UserContext'
import { api } from './services/api'

export function ReadonlyRecipe (props) {
  const [deletedRecipe, setDeletedRecipe] = useState(false)
  const idToken = useContext(UserContext)

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

  const handleImageError = (event) => {
    event.target.style.display = 'none'
  }

  const handleDeleteRecipe = () => {
    return api.deleteRecipe(idToken, recipe._id)
      .then(() => {
        setDeletedRecipe(true)
      })
  }

  return (
    <div>
      <div className='recipeHeaderContainer'>
        {recipe.image
          ? <img src={recipe.image} alt={recipe.title} onError={handleImageError} className='recipeHeaderImage' />
          : null}
        <div>
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
          <AddRecipeToListForm recipeId={recipe._id} recipeServings={recipe.servings} />
        </div>
      </div>
      <br />
      <p data-testid='ingredientsContainer'><strong>Ingredients: </strong><br />
        {ingredientList}
      </p>
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
