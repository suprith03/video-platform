import React from "react"
import axios from "axios"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const [videos, setVideos] = useState([])
  const [file, setFile] = useState(null)

  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    const res = await axios.get("http://localhost:5001/api/videos", {
      headers: { Authorization: `Bearer ${token}` }
    })
    setVideos(res.data)
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

      <section style={styles.section}>
        <h3>Your Videos</h3>

        {videos.length === 0 && <p>No videos uploaded yet</p>}

        {videos.map(v => (
          <div key={v._id} style={styles.videoCard}>
            <div><strong>File:</strong> {v.filename}</div>
            <div><strong>Status:</strong> {v.status}</div>
            <div><strong>Sensitivity:</strong> {v.sensitivity || "Pending"}</div>

            {v.status === "completed" && (
              <video
                width="320"
                controls
                src={`http://localhost:5001/api/videos/stream/${v._id}`}
              />
            )}
          </div>
        ))}
      </section>
    </div>
  )
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
    padding: "10px",
    borderBottom: "1px solid #e5e7eb"
  }
}
