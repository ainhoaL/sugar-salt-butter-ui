import React from 'react'
import { Navbar, NavItem, Nav, NavbarBrand } from 'reactstrap'
import { SearchForm } from './SearchForm'
import './Styles.css'

export function Header () {
  return (
    <Navbar color='light' light expand='md'>
      <NavbarBrand href='/'>sugar-salt-butter</NavbarBrand>
      <SearchForm />
      <Nav className='ml-auto' navbar>
        <NavItem>
          <div id='my-signIn' className='g-signin2' />
        </NavItem>
      </Nav>
    </Navbar>
  )
}
