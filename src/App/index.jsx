import _ from 'lodash'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { ToastContainer, Slide } from 'react-toastify'
import { QueryClient, QueryClientProvider } from 'react-query'
import 'react-toastify/dist/ReactToastify.css'

import './black-dashboard-react.css'
import routes from '../routes'

import MainPage from '../views/Home'

import Navigator from './Navbar'

const queryClient = new QueryClient()

const getRoutes = (routes) =>
  _.map(routes, (prop) =>
    _.map(prop.items, (item) => (
      <Route
        key={item.name}
        exact
        path={prop.path + item.path}
        element={<item.component />}
      />
    ))
  )

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/klaytn-online-toolkit">
        <div className="content">
          <Navigator />
          <Routes>
            <Route exact path="/" component={MainPage} />
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
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
