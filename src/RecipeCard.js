import React from 'react'
import { Link } from 'react-router-dom'
import './Styles.css'
import noImageIcon from './icons/icons8-tableware-100.png'

export function RecipeCard (props) {
  const linkToRecipe = 'recipes/' + props.data._id
  const imageSrc = props.data.image || noImageIcon

  const handleImageError = (event) => {
    event.target.src = noImageIcon
  }

  return (
    <li className='recipeBox'>
      <Link to={linkToRecipe} className='recipeCard'>
        <img src={imageSrc} className='recipeCardImage' alt={props.data.title} onError={handleImageError} /><br />
        <p className='recipeCardTitle'>{props.data.title}</p>
      </Link>
    </li>
  )
}
