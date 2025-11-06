import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={styles.nav}>
      <h3 style={styles.title}>TeamVault</h3>
      <div>
        <Link to="/" style={styles.link}>Dashboard</Link>
        <Link to="/login" style={styles.link}>Login</Link>
        <Link to="/register" style={styles.link}>Register</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 40px",
    background: "#4a8df7",
    color: "#fff",
  },
  title: {
    margin: 0,
  },
  link: {
    color: "#fff",
    marginLeft: "20px",
    textDecoration: "none",
    fontWeight: "bold",
  }
};

export default Navbar;
