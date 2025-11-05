import React, { useState } from "react";
import "./App.css";
import bgImage from "./assets/bg.jpg";  

function Register() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div
      className="register-bg"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="container register-box">
        <h2>Register</h2>

        <form className="form">
          <input
            type="text"
            placeholder="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
          />

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

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
