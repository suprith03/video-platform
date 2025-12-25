import React from "react"
import axios from "axios"
import { useState } from "react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5001/api/auth/login", {
        email,
        password
      })
      localStorage.setItem("token", res.data.token)
      window.location.href = "/dashboard"
    } catch {
      setError("Invalid credentials")
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Video Platform</h2>

        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <div style={styles.error}>{error}</div>}

        <button style={styles.button} onClick={login}>
          Login
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8"
  },
  card: {
    width: "320px",
    padding: "30px",
    borderRadius: "8px",
    background: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },
  title: {
    marginBottom: "20px",
    textAlign: "center"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "4px",
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  error: {
    color: "red",
    marginBottom: "10px",
    textAlign: "center"
  }
}
