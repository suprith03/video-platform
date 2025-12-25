import React from "react"
import axios from "axios"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"

export default function Dashboard() {
  const [videos, setVideos] = useState([])
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState({})

  const token = localStorage.getItem("token")
  const payload = JSON.parse(atob(token.split(".")[1]))
  const role = payload.role

  const socket = io("http://localhost:5001")

  useEffect(() => {
    fetchVideos()

    socket.on("processing-complete", () => {
      fetchVideos()
    })

    return () => socket.disconnect()
  }, [])

  const fetchVideos = async () => {
    const res = await axios.get("http://localhost:5001/api/videos", {
      headers: { Authorization: `Bearer ${token}` }
    })

    setVideos(res.data)

    res.data.forEach(v => {
      socket.on(`progress-${v._id}`, p => {
        setProgress(prev => ({ ...prev, [v._id]: p }))
      })
    })
  }

  const upload = async () => {
    if (!file) return

    const form = new FormData()
    form.append("video", file)

    await axios.post("http://localhost:5001/api/videos", form, {
      headers: { Authorization: `Bearer ${token}` }
    })

    setFile(null)
    fetchVideos()
  }

  const logout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h2>Video Platform Dashboard</h2>
        <button onClick={logout} style={styles.logout}>Logout</button>
      </header>

      {role !== "viewer" && (
        <section style={styles.section}>
          <h3>Upload Video</h3>
          <input
            type="file"
            accept="video/*"
            onChange={e => setFile(e.target.files[0])}
          />
          <button style={styles.uploadBtn} onClick={upload}>
            Upload
          </button>
        </section>
      )}

      <section style={styles.section}>
        <h3>Your Videos</h3>

        {videos.length === 0 && <p>No videos uploaded yet</p>}

        {videos.map(v => (
          <div key={v._id} style={styles.videoCard}>
            <div><strong>File:</strong> {v.filename}</div>

            <div style={styles.badges}>
              <span style={badgeStyle(v.status === "completed" ? "done" : "processing")}>
                {v.status.toUpperCase()}
              </span>

              {v.sensitivity && (
                <span style={badgeStyle(v.sensitivity)}>
                  {v.sensitivity.toUpperCase()}
                </span>
              )}
            </div>

            {progress[v._id] && v.status !== "completed" && (
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${progress[v._id]}%`
                  }}
                >
                  {progress[v._id]}%
                </div>
              </div>
            )}

            {v.status === "completed" && (
              <video
                width="360"
                controls
                src={`http://localhost:5001/api/videos/stream/${v._id}?token=${token}`}
              />
            )}
          </div>
        ))}
      </section>
    </div>
  )
}

const badgeStyle = type => {
  const map = {
    safe: { background: "#16a34a" },
    flagged: { background: "#dc2626" },
    processing: { background: "#2563eb" },
    done: { background: "#4b5563" }
  }

  return {
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    marginRight: "8px",
    ...map[type]
  }
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    padding: "20px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  logout: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer"
  },
  section: {
    background: "#fff",
    padding: "20px",
    borderRadius: "6px",
    marginBottom: "20px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
  },
  uploadBtn: {
    marginLeft: "10px",
    padding: "6px 12px",
    cursor: "pointer"
  },
  videoCard: {
    padding: "14px",
    borderRadius: "6px",
    background: "#f9fafb",
    marginBottom: "12px"
  },
  badges: {
    marginTop: "6px",
    marginBottom: "6px"
  },
  progressBar: {
    width: "100%",
    background: "#e5e7eb",
    borderRadius: "4px",
    marginTop: "8px"
  },
  progressFill: {
    height: "20px",
    background: "#2563eb",
    color: "#fff",
    textAlign: "center",
    borderRadius: "4px",
    fontSize: "12px"
  }
}
