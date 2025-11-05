import React from "react";
import "./App.css";
import bgImage from "./assets/bg2.jpg";  

function Dashboard() {
  return (
    <div
      className="dashboard-bg"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
          <button className="add-btn">+ Add Message</button>
        </div>

        <div className="message-list">
          <p className="empty">No messages yet...</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
