import React, { useState } from "react"
import axios from "axios"

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
    <>
      <style>{css}</style>
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-title">Video Platform</h1>
          <p className="login-subtitle">Secure video management</p>

          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && <div className="error">{error}</div>}

          <button className="primary-btn" onClick={login}>
            Login
          </button>
        </div>
      </div>
    </>
  )
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef2ff, #f8fafc);
}

.login-card {
  width: 380px;
  background: #ffffff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.12);
  animation: slideUp 0.6s ease;
}

.login-title {
  text-align: center;
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 6px;
}

.login-subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 30px;
}

.input {
  width: 100%;
  padding: 14px;
  margin-bottom: 16px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  transition: border 0.2s, box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
}

.primary-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(79,70,229,0.4);
}

.error {
  color: #dc2626;
  text-align: center;
  margin-bottom: 10px;
  font-size: 13px;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
`
