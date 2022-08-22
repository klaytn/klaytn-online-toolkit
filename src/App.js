import React, {useState}from "react";
import '../assets/css/black-dashboard-react.css';
// reactstrap components
import { Card, CardBody } from "reactstrap";
import Navigator from "./components/navbar";
import routes from "./routes"
import { Switch, Route, BrowserRouter } from "react-router-dom";
import web3modalExample from "./web3modal/web3modal";

const getRoutes = (routes) =>{
  let buffer= []
  routes.map((prop) => {
    prop.items.map((item) => {
      if(item.component == null)
      {
        buffer.push(
          <Route 
          key={item.name} 
          exact 
          path={prop.path + item.path}
          component={mainPage}
          />
        )
      }
      else{
        buffer.push(
          <Route 
            key={item.name}
            exact 
            path={prop.path + item.path}
            component={item.component}
          />
        )
      }
  })})
  return buffer
}

const mainPage = () => {
  return (
    <div>
      <Card>
        <CardBody>
          <h3> Klaytn Online Toolkit </h3>
          <p>
            <a href="https://github.com/klaytn/klaytn-online-toolkit">Klaytn-online-toolkit</a> provides code samples and github-page to
             help you utilize the Klaytn SDK(caver-js).
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
      <Navigator routes={routes}/>
        <Switch>
          {getRoutes(routes)}
          <Route exact path="/" component = {mainPage} />
          <Route exact path="/web3modal" component = {web3modalExample} />
          </Switch>
    </div>
    </BrowserRouter>

  );
}

export default App;