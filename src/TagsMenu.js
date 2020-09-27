import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Styles.css'
const axios = require('axios')

export function TagsMenu ({ idToken }) {
  const [tags, setTags] = useState([])

  useEffect(() => {
    if (!idToken) return
    axios.defaults.headers.common.Authorization = 'Bearer ' + idToken

    axios.get('http://localhost:3050/api/v1/tags')
      .then((response) => { // TODO: deal with error
        setTags(response.data)
      })
  }, [idToken])

  const listTags = tags.map((tag) => {
    const tagHref = '/?tags=' + tag._id
    return <li key={tag._id}><Link to={tagHref}><strong>{tag._id}</strong> ({tag.count})</Link></li>
  })

  return (
    <ul className='tagsMenuList'>
      {listTags}
    </ul>
  )
}
