import "./App.css";
import Landing from "./pages/Landing";
// import react-router
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { TezosProvider } from "./providers/TezosProvider";

function App() {
  return (
    // seting up the router
    <Switch>
      <Route exact path="/" component={Landing} />
    </Switch>
  );
}

function RouteFulApp() {
  return (
    <BrowserRouter>
      <TezosProvider>
        <App />
      </TezosProvider>
    </BrowserRouter>
  );
}

export default RouteFulApp;
