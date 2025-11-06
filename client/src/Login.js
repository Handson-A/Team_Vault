import React, { useState } from "react";
import "./App.css";
import bgImage from "./assets/bg.jpg";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div
      className="login-bg"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="container login-box">
        <h2>Login</h2>

        <form className="form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
