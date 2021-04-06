import React, { useState, useEffect, useContext } from 'react'
import { Button, Input, InputGroup, InputGroupAddon, InputGroupText, Alert } from 'reactstrap'
import { Link } from 'react-router-dom'
import './Styles.css'
import { UserContext } from './UserContext'
import { api } from './services/api'

export function AddRecipeToListForm ({ recipeId, recipeServings }) {
  const [lists, setLists] = useState([])
  const [selectedList, setSelectedList] = useState('')
  const [listServings, setListServings] = useState(recipeServings)
  const [newListName, setNewListName] = useState('')
  const [newListId, setNewListId] = useState()
  const [addedToListAlertVisible, setAddedToListAlertVisible] = useState(false)

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

  const handleAddToList = (event) => {
    event.preventDefault()
    addedToListAlertOnDismiss()

    const listObject = {
      recipeId,
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

  let listOptions = []
  listOptions = lists.map((list) => {
    return <option key={list.id} value={list.id}>{list.title}</option>
  })

  const newListInput = (
    <Input type='text' name='listName' id='listNameText' value={newListName} onChange={(event) => setNewListName(event.target.value)} placeholder='New list name' invalid={!newListName} />
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

  const submitDisabled = (selectedList === 'newlist' && !newListName) || (recipeServings && !listServings)
  return (
    <>
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
        {recipeServings
          ? listServingsInput
          : null}
        <InputGroupAddon addonType='append'><Button type='submit' id='addRecipeToListButton' aria-label='add recipe to list' onClick={handleAddToList} disabled={submitDisabled}>Add</Button></InputGroupAddon>
      </InputGroup>
      {addedToListAlert}
    </>
  )
}
