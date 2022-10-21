import _ from 'lodash'
import { Switch, Route, BrowserRouter } from 'react-router-dom'
import { Card, CardBody } from 'reactstrap'
import { ToastContainer, Slide } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import './black-dashboard-react.css'
// reactstrap components
import routes from '../routes'
import web3modalExample from '../web3modal/web3modal'

import Navigator from './Navbar'

const getRoutes = (routes) => {
  let buffer = []
  _.map(routes, (prop) => {
    _.map(prop.items, (item) => {
      if (item.component === null) {
        buffer.push(
          <Route
            key={item.name}
            exact
            path={prop.path + item.path}
            component={mainPage}
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

const mainPage = () => {
  return (
    <div>
      <Card>
        <CardBody>
          <h3 style={{ fontWeight: '600' }}> Klaytn Online Toolkit </h3>
          <p>
            <a href="https://github.com/klaytn/klaytn-online-toolkit">
              Klaytn-online-toolkit
            </a>{' '}
            provides code samples and github-page to help you utilize the Klaytn
            SDK(caver-js).
          </p>
        </CardBody>
      </Card>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter basename="/klaytn-online-toolkit">
      <div className="content">
        <Navigator routes={routes} />
        <Switch>
          {getRoutes(routes)}
          <Route exact path="/" component={mainPage} />
          <Route exact path="/web3modal" component={web3modalExample} />
        </Switch>
      </div>
      <ToastContainer
        position="top-right"
        hideProgressBar
        autoClose={1000}
        transition={Slide}
        limit={3}
      />
    </BrowserRouter>
  )
}

export default App
