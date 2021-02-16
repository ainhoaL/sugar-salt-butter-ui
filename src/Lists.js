import React, { useState, useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { Container, Row, Col, ListGroup, ListGroupItem, Badge, Button } from 'reactstrap'
import './Styles.css'
import { UserContext } from './UserContext'

const axios = require('axios')

export function Lists (props) {
  const [lists, setLists] = useState([])
  const idToken = useContext(UserContext)
  const history = useHistory()

  useEffect(() => {
    if (!idToken) return
    getLists(idToken)
  }, [idToken])

  const getLists = (idToken) => {
    axios.defaults.headers.common.Authorization = 'Bearer ' + idToken
    axios.get('http://localhost:3050/api/v1/lists')
      .then((response) => { // TODO: deal with error
        const lists = response.data
        if (lists.length === 1) {
          history.push('/lists/' + lists[0]._id)
        } else {
          setLists(lists)
        }
      })
  }

  const deleteList = (listId) => {
    axios.defaults.headers.common.Authorization = 'Bearer ' + idToken
    axios.delete('http://localhost:3050/api/v1/lists/' + listId)
      .then(() => getLists(idToken))
  }

  if (lists.length === 0) {
    return null
  }

  return (
    <Container>
      <Row>
        <Col sm='12' md={{ size: 10, offset: 1 }} className='listContainer'>
          <h4>Shopping lists</h4>
          <ListGroup>
            {lists.map((list) => {
              const listUrl = 'lists/' + list._id
              const dateCreated = new Date(list.dateCreated)
              return <ListGroupItem key={list._id}><a href={listUrl}><strong>{list.title}</strong></a> <em>({dateCreated.toLocaleDateString()})</em> <Badge pill>{list.items.length}</Badge> <Button className='deleteListItem' onClick={() => deleteList(list._id)}>x</Button></ListGroupItem>
            })}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  )
}
