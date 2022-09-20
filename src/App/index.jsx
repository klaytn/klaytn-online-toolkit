import './black-dashboard-react.css'
// reactstrap components
import routes from '../routes'
import { Switch, Route, BrowserRouter } from 'react-router-dom'
import web3modalExample from 'web3modal/web3modal'

import Navigator from './Navbar'

import MainPage from 'pages/Home'

const getRoutes = (routes) => {
  let buffer = []
  routes.map((prop) => {
    prop.items.map((item) => {
      if (item.component === null) {
        buffer.push(
          <Route
            key={item.name}
            exact
            path={prop.path + item.path}
            component={MainPage}
          />
        )
      } else {
        buffer.push(
          <Route
            key={item.name}
            exact
            path={prop.path + item.path}
            component={item.component}
          />
        )
      }
    })
  })
  return buffer
}

function App() {
  return (
    <BrowserRouter basename="/klaytn-online-toolkit">
      <div className="content">
        <Navigator routes={routes} />
        <Switch>
          {getRoutes(routes)}
          <Route exact path="/" component={MainPage} />
          <Route exact path="/web3modal" component={web3modalExample} />
        </Switch>
      </div>
    </BrowserRouter>
  )
}

export default App
