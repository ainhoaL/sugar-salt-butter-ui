import React from 'react'
import { Navbar, NavItem, Nav, NavbarBrand } from 'reactstrap'
import { useHistory } from 'react-router-dom'
import { SearchForm } from './SearchForm'
import './Styles.css'

export function Header ({ setSearchString }) {
  const history = useHistory()

  const onSearch = (searchText) => {
    setSearchString(searchText)
    history.push('/')
  }

  return (
    <Navbar color='light' light expand='md'>
      <NavbarBrand href='/'>sugar-salt-butter</NavbarBrand>
      <SearchForm search={onSearch} />
      <Nav className='ml-auto' navbar>
        <NavItem>
          <div id='my-signIn' className='g-signin2' />
        </NavItem>
      </Nav>
    </Navbar>
  )
}
