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
    if (!file || !file.type.startsWith("video/")) {
      alert("Only video files are allowed")
      return
    }

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
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>

      {role !== "viewer" && (
        <div style={{ marginBottom: 20 }}>
          <input
            type="file"
            accept="video/*"
            onChange={e => setFile(e.target.files[0])}
          />
          <button onClick={upload} style={{ marginLeft: 10 }}>
            Upload
          </button>
        </div>
      )}

      {videos.map(v => (
        <div
          key={v._id}
          style={{ padding: 12, border: "1px solid #ccc", marginBottom: 12 }}
        >
          <div><b>{v.filename}</b></div>

          {progress[v._id] !== undefined && (
            <div style={{ background: "#eee", marginTop: 6 }}>
              <div
                style={{
                  width: `${progress[v._id]}%`,
                  background: "#4ade80",
                  textAlign: "center"
                }}
              >
                {progress[v._id]}%
              </div>
            </div>
          )}

          {v.status === "completed" && (
            <video
              controls
              width="320"
              style={{ marginTop: 8 }}
              src={`http://localhost:5001/api/videos/stream/${v._id}?token=${token}`}
            />
          )}

          {role === "admin" && (
            <div style={{ marginTop: 8 }}>
              <div>
                Assigned:{" "}
                {v.assignedUsers?.length
                  ? v.assignedUsers.map(u => u.email).join(", ")
                  : "None"}
              </div>

              <select
                onChange={e => assign(v._id, e.target.value)}
                style={{ marginTop: 6 }}
              >
                <option value="">Assign viewer</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.email}
                  </option>
                ))}
              </select>

              <button
                onClick={() => remove(v._id)}
                style={{ marginLeft: 10 }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
