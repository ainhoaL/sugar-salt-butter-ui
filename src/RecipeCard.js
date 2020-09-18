import React from 'react'
import './Styles.css'

export function RecipeCard (props) {
  const linkToRecipe = 'recipes/' + props.data._id
  return (
    <li className='recipeBox'>
      <a href={linkToRecipe} className='recipeCard'>
        <img src={props.data.image} className='recipeCardImage' alt={props.data.title} /><br />
        <p className='recipeCardTitle'>{props.data.title}</p>
      </a>
    </li>
  )
}
