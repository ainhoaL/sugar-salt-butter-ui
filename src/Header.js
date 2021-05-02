import React from 'react'
import { Navbar, NavItem, Nav, NavbarBrand } from 'reactstrap'
import { SearchForm } from './SearchForm'
import iconLists from './icons/icons8-list-view-32.png'
import './Styles.css'

export function Header () {
  return (
    <Navbar color='light' light expand='md'>
      <NavbarBrand href='/'>sugar-salt-butter</NavbarBrand>
      <SearchForm />
      <Nav className='ml-auto' navbar>
        <NavItem><a href='/lists' className='headerLink'><img src={iconLists} alt='shopping lists' /> <span>Shopping Lists</span></a></NavItem>
        <NavItem>
          <div id='my-signIn' className='g-signin2' />
        </NavItem>
      </Nav>
    </Navbar>
  )
}
