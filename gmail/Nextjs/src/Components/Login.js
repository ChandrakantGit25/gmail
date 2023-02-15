import React from "react";
import { NavLink } from "react-router-dom";
const Login = () => {
  function signIn() {
    let oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    let form = document.createElement("form");
    form.setAttribute("method", "GET");
    form.setAttribute("action", oauth2Endpoint);
    let params = {
      client_id:
        "902498055947-r2umj7hqtr8vbcahmloi6qffok3l7htv.apps.googleusercontent.com",
      redirect_uri: "http://localhost:3000/profile",
      response_type: "token",
      scope: "https://mail.google.com",
      include_granted_scopes: "true",
      state: "pass-through-value",
    };
    for (var p in params) {
      let input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", p);
      input.setAttribute("value", params[p]);
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  }
  return (
    <div id="signInButton">
      <h1>Google Sign-In</h1>
      <button onClick={signIn}>Sign in with Gmail Account</button>
    </div>
  );
};

export default Login;
