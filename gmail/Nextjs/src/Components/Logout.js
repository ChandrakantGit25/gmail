import React from 'react'
import {GoogleLogout} from 'react-google-login'
const clientId="279600343944-1j384le19un2lgm7414tvst006b8pn34.apps.googleusercontent.com";
const Logout = () => {
    const onSuccess=()=>{
        console.log("Log Out Successfull!!")
    }
  return (
    <div id="signOutButton">
        <GoogleLogout
        clientId={clientId}
        buttonText={"Logout"}
        onLogoutSuccess={onSuccess}
        />
      
    </div>
  )
}

export default Logout
