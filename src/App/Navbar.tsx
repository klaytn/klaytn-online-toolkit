import { ReactElement, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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

import { COLOR } from 'consts'

import githubIcon from 'images/GitHub-Mark-Light-64px.png'
import routes from '../routes'
import { RouteType } from 'types'

const RouteItem = ({ route }: { route: RouteType }): ReactElement => {
  const [isOpen, setIsOpen] = useState(false)
  const { pathname } = useLocation()
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const navigate = useNavigate()

  const SubItem = ({
    name,
    href,
    index,
  }: {
    name: string
    href: string
    index: number
  }): ReactElement => {
    useEffect(() => {
      if (pathname.includes(href)) {
        setSelectedIndex(index)
      }
    }, [])

    return (
      <DropdownItem
        style={{
          color: selectedIndex === index ? COLOR.primary : 'gray',
          fontWeight: selectedIndex === index ? 700 : 400,
        }}
        onClick={(): void => {
          navigate(href)
        }}
      >
        {name}
      </DropdownItem>
    )
  }

  useEffect(() => {
    if (false === pathname.includes(route.path)) {
      setSelectedIndex(-1)
    }
  }, [pathname])

  return (
    <Dropdown
      tag="nav"
      isOpen={isOpen}
      onMouseOver={(): void => setIsOpen(true)}
      onMouseLeave={(): void => setIsOpen(false)}
      toggle={(): void => setIsOpen(!isOpen)}
    >
      <DropdownToggle
        caret={false}
        nav
        style={{
          color: selectedIndex > -1 ? COLOR.primary : 'white',
        }}
        onClick={(): void => {
          navigate(`${route.path}${route.items[0].path}`)
        }}
      >
        {route.name}
      </DropdownToggle>
      <DropdownMenu>
        {route.items.map((item, j) => {
          const path = `${route.path}${item.path}`

          return (
            <SubItem
              key={`${item.name}-${j}`}
              index={j}
              name={item.name}
              href={path}
            />
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
