import axios from "axios"
import { useState } from "react"

export default () => {
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const login=async()=>{
    const res=await axios.post("http://localhost:5000/api/auth/login",{email,password})
    localStorage.setItem("token",res.data.token)
    location.href="/dashboard"
  }
  return (
    <div>
      <input onChange={e=>setEmail(e.target.value)} />
      <input type="password" onChange={e=>setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
    </div>
  )
}
