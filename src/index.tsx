import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";

ReactDOM.render(
  <Auth0Provider
    domain="dev-3ju6frw8.us.auth0.com"
    clientId="6FzJEwMThzt9g8c3wPm32OaniTrR1xpc"
    redirectUri={window.location.origin}
    audience="https://dev-3ju6frw8.us.auth0.com/api/v2/"
    scope="read:current_user update:current_user_metadata"
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Auth0Provider>,
  document.getElementById("root")
);
