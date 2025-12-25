import React, { useEffect, useRef, useState } from "react"
import axios from "axios"
import { io } from "socket.io-client"

export default function Dashboard() {
  const [videos, setVideos] = useState([])
  const [users, setUsers] = useState([])
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState({})

  const token = localStorage.getItem("token")
  const payload = JSON.parse(atob(token.split(".")[1]))
  const role = payload.role

  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io("http://localhost:5001")

    socketRef.current.on("processing-complete", id => {
      setProgress(p => {
        const copy = { ...p }
        delete copy[id]
        return copy
      })
      fetchVideos()
    })

    fetchVideos()
    if (role === "admin") fetchUsers()

    return () => socketRef.current.disconnect()
  }, [])

  const fetchVideos = async () => {
    const res = await axios.get("http://localhost:5001/api/videos", {
      headers: { Authorization: `Bearer ${token}` }
    })
    setVideos(res.data)
  }

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5001/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    })
    setUsers(res.data.filter(u => u.role === "viewer"))
  }

  const upload = async () => {
    if (!file || !file.type.startsWith("video/")) return
    const form = new FormData()
    form.append("video", file)

    const res = await axios.post(
      "http://localhost:5001/api/videos",
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    const v = res.data
    socketRef.current.on(`progress-${v._id}`, p => {
      setProgress(prev => ({ ...prev, [v._id]: p }))
    })

    setVideos(list => [v, ...list])
    setFile(null)
  }

  const assign = async (videoId, userId) => {
    if (!userId) return
    await axios.post(
      `http://localhost:5001/api/videos/${videoId}/assign`,
      { userId },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    fetchVideos()
  }

  const remove = async id => {
    await axios.delete(
      `http://localhost:5001/api/videos/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    fetchVideos()
  }

  const logout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  return (
    <>
      <style>{css}</style>
      <div className="page">
        <header className="header">
          <h1 className="heading">Dashboard</h1>
          <button className="logout" onClick={logout}>Logout</button>
        </header>

        {role !== "viewer" && (
          <div className="upload">
            <input type="file" accept="video/*" onChange={e => setFile(e.target.files[0])} />
            <button className="primary-btn" onClick={upload}>Upload</button>
          </div>
        )}

        {videos.map(v => (
          <div key={v._id} className="card">
            <div className="filename">{v.filename}</div>

            {progress[v._id] !== undefined && (
              <div className="progress">
                <div className="progress-fill" style={{ width: `${progress[v._id]}%` }}>
                  {progress[v._id]}%
                </div>
              </div>
            )}

            {v.status === "completed" && (
              <video
                controls
                width="360"
                src={`http://localhost:5001/api/videos/stream/${v._id}?token=${token}`}
              />
            )}

            {role === "admin" && (
              <div className="admin">
                <span>
                  Assigned: {v.assignedUsers?.length ? v.assignedUsers.map(u => u.email).join(", ") : "None"}
                </span>
                <select onChange={e => assign(v._id, e.target.value)}>
                  <option value="">Assign viewer</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.email}</option>)}
                </select>
                <button className="delete" onClick={() => remove(v._id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; font-family: 'Inter', sans-serif; }

.page {
  background: #f4f6fb;
  min-height: 100vh;
  padding: 32px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.heading {
  font-size: 34px;
  font-weight: 700;
}

.logout {
  background: linear-gradient(135deg,#ef4444,#dc2626);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.logout:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(220,38,38,0.4);
}

.upload {
  margin-bottom: 28px;
}

.card {
  background: #fff;
  padding: 20px;
  border-radius: 18px;
  margin-bottom: 20px;
  box-shadow: 0 16px 32px rgba(0,0,0,0.08);
  transition: transform 0.15s;
}

.card:hover {
  transform: translateY(-2px);
}

.filename {
  font-weight: 600;
  margin-bottom: 8px;
}

.progress {
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  background: linear-gradient(135deg,#22c55e,#16a34a);
  text-align: center;
  font-size: 13px;
}

.admin {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.delete {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.primary-btn {
  margin-left: 10px;
  padding: 8px 16px;
  background: linear-gradient(135deg,#6366f1,#4f46e5);
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
`
