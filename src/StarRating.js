import React from 'react'
import './Styles.css'
import iconStar from './icons/icons8-star-16.png'
import iconFilledStar from './icons/icons8-star-filled-16.png'

export function StarRating ({ changeRating, currentRating }) {
  const stars = []
  const clickStar = (e) => {
    e.preventDefault()
    changeRating(parseInt(e.target.value))
  }

  for (var index = 1; index <= 5; index++) {
    let altText = `${index} star`
    let icon = iconStar
    if (index <= currentRating) {
      altText += ' set'
      icon = iconFilledStar
    }
    if (!changeRating) {
      stars.push(<img src={icon} key={index} alt={altText} />)
    } else {
      stars.push(<input type='image' src={icon} key={index} value={index} alt={altText} className='starButton' onClick={(e) => clickStar(e)} />)
    }
  }

  return (
    <>
      {stars}
    </>
  )
}
