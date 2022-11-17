import { ReactElement, useState } from 'react'
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavLink,
  Form,
} from 'reactstrap'
import githubIcon from 'images/GitHub-Mark-Light-64px.png'
import routes from '../routes'
import { RouteType } from 'types'

const RouteItem = ({ route }: { route: RouteType }): ReactElement => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Dropdown
      tag="nav"
      isOpen={isOpen}
      onMouseOver={(): void => setIsOpen(true)}
      onMouseLeave={(): void => setIsOpen(false)}
      toggle={(): void => setIsOpen(!isOpen)}
    >
      <DropdownToggle caret={false} nav>
        {route.name}
      </DropdownToggle>
      <DropdownMenu>
        {route.items.map((item, j) => {
          return (
            <DropdownItem
              key={`${item.name}-${j}`}
              href={route.path + item.path}
            >
              {item.name}
            </DropdownItem>
          )
        })}
      </DropdownMenu>
    </Dropdown>
  )
}

const Navigator = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(false)
  const toggle = (): void => {
    setIsOpen(!isOpen)
  }

  return (
    <Navbar expand="lg" color="dark">
      <NavbarToggler onClick={toggle}>
        <span className="navbar-toggler-bar navbar-kebab"></span>
        <span className="navbar-toggler-bar navbar-kebab"></span>
        <span className="navbar-toggler-bar navbar-kebab"></span>
      </NavbarToggler>
      <Collapse isOpen={isOpen} navbar>
        <Nav navbar>
          <NavLink href="/"> Home </NavLink>
          {routes.map((route, key) => (
            <RouteItem key={key} route={route} />
          ))}
        </Nav>
        <Form className="ml-auto">
          <NavLink href="https://github.com/klaytn/klaytn-online-toolkit">
            <img
              src={githubIcon}
              style={{ height: '25px', width: '25px' }}
              alt=""
            />
          </NavLink>
        </Form>
      </Collapse>
    </Navbar>
  )
}

export default Navigator
