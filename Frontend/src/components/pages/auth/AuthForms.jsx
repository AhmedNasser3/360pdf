// src/components/pages/auth/AuthForms.jsx
import React, { useState } from "react";
import Register from "./Register";
import LoginForm from "./LoginForm";

const AuthForms = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {showLogin ? (
        <LoginForm switchToRegister={() => setShowLogin(false)} />
      ) : (
        <Register switchToLogin={() => setShowLogin(true)} />
      )}
    </>
  );
};

export default AuthForms;
