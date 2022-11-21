import { ReactElement } from 'react'
import _ from 'lodash'
import { Routes, Route, HashRouter } from 'react-router-dom'
import { ToastContainer, Slide } from 'react-toastify'
import { QueryClient, QueryClientProvider } from 'react-query'
import 'react-toastify/dist/ReactToastify.css'

import './black-dashboard-react.css'
import { RouteType } from 'types'
import routes from '../routes'

import MainPage from '../views/Home'

import Navigator from './Navbar'

const queryClient = new QueryClient()

const getRoutes = (routes: RouteType[]): ReactElement[][] =>
  _.map(routes, (prop) =>
    _.map(prop.items, (item) => (
      <Route
        key={item.name}
        path={prop.path + item.path}
        element={<item.component />}
      />
    ))
  )

function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <>
          <div className="content">
            <Navigator />
            <Routes>
              <Route path="/" element={<MainPage />} />
              {getRoutes(routes)}
            </Routes>
          </div>
          <ToastContainer
            position="top-right"
            hideProgressBar
            autoClose={1000}
            transition={Slide}
            limit={3}
          />
        </>
      </HashRouter>{' '}
    </QueryClientProvider>
  )
}

export default App
