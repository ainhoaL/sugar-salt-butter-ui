import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from 'reactstrap'
import './Styles.css'
import { UserContext } from './UserContext'
import { api } from './services/api'

export function TagsMenu (props) {
  const [tags, setTags] = useState([])
  const idToken = useContext(UserContext)

  useEffect(() => {
    if (!idToken) return
    api.getTags(idToken)
      .then((response) => { // TODO: deal with error
        setTags(response.data)
      })
  }, [idToken])

  const listTags = tags.map((tag) => {
    const tagHref = '/?tags=' + tag._id
    return <li key={tag._id}><Link to={tagHref}><strong>{tag._id}</strong> <Badge color='light'>{tag.count}</Badge></Link></li>
  })

  return (
    <ul className='tagsMenuList'>
      {listTags}
    </ul>
  )
}
