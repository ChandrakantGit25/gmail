import React from "react";
import Container from 'react-bootstrap/Container';
import Login from "./Components/Login";
import Profile from "./Components/Profile";
import GoogleSheet from "./Components/GoogleSheet";
import { BrowserRouter, Routes, Route } from "react-router-dom";
const App = () => {
  return (
    <Container>
    <div>
      <BrowserRouter>
        <Routes>
          
          <Route path="profile" element={<Profile />} />
          <Route path="/" element={<Login/>} />
          <Route path="/googlesheet" element={<GoogleSheet/>} />
          
        </Routes>
      </BrowserRouter>
    </div>
    </Container>
  );
};

export default App;
