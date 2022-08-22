import React, {useState}from "react";
import '../assets/css/black-dashboard-react.css';
// reactstrap components
import { Card, CardBody } from "reactstrap";
import Navigator from "./components/navbar";
import routes from "./routes"
import { Switch, Routes, Route, BrowserRouter, HashRouter } from "react-router-dom";
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
          path={ prop.path + item.path}
          component={mainPage}
          />
        )
      }
      else{
        buffer.push(
          <Route 
            key={item.name}
            exact 
            path={ prop.path + item.path}
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
          <h3> Klaytn Online Tools </h3>
          <p>
            These are simple examples using caver-js SDK. 
          </p>  
        </CardBody>
      </Card>
    </div>
  )
}

function App() {
  console.log("klaytnnn")
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