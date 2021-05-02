import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useHistory, Link } from 'react-router-dom'
import { Container, Row, Col, ListGroup, ListGroupItem, Badge, Button } from 'reactstrap'
import './Styles.css'
import { UserContext } from './UserContext'
import { api } from './services/api'

export function Lists (props) {
  const [lists, setLists] = useState([])
  const idToken = useContext(UserContext)
  const history = useHistory()

  const getLists = useCallback((idToken) => {
    return api.getLists(idToken)
      .then((response) => { // TODO: deal with error
        const lists = response.data
        if (lists.length === 1) { // Redirect to list page if there is only one
          history.push('/lists/' + lists[0]._id)
        } else {
          setLists(lists)
        }
      })
  }, [history])

  useEffect(() => {
    if (!idToken) return
    getLists(idToken)
  }, [idToken, getLists])

  const deleteList = (listId) => {
    return api.deleteList(idToken, listId)
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
              return <ListGroupItem key={list._id}><Link to={listUrl}><strong>{list.title}</strong></Link> <em>({dateCreated.toLocaleDateString()})</em> <Badge pill>{list.items.length}</Badge> <Button className='deleteListItem' aria-label='delete list' onClick={() => deleteList(list._id)}>x</Button></ListGroupItem>
            })}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  )
}
