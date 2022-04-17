import React from "react";
import { Button } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";

function AuthButton() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();
  return !isAuthenticated ? (
    <Button variant="contained" onClick={() => loginWithRedirect()}>
      Login
    </Button>
  ) : (
    <Button
      variant="contained"
      onClick={() => logout({ returnTo: window.location.origin })}
    >
      Logout
    </Button>
  );
}

export default AuthButton;
