import React from "react"
import axios from "axios"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"

export default () => {
  const [videos,setVideos]=useState([])
  const token=localStorage.getItem("token")
  const socket=io("http://localhost:5000")

  useEffect(()=>{
    axios.get("http://localhost:5000/api/videos",{headers:{Authorization:`Bearer ${token}`}})
      .then(r=>setVideos(r.data))
  },[])

  const upload=e=>{
    const form=new FormData()
    form.append("video",e.target.files[0])
    axios.post("http://localhost:5000/api/videos",form,{
      headers:{Authorization:`Bearer ${token}`}
    })
  }

  return (
    <div>
      <input type="file" onChange={upload} />
      {videos.map(v=>(
        <div key={v._id}>
          {v.status} {v.sensitivity}
          <video width="300" controls src={`http://localhost:5000/api/videos/stream/${v._id}`} />
        </div>
      ))}
    </div>
  )
}
