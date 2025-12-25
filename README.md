# Video Upload & Streaming Platform

A full-stack application for uploading, processing, and streaming videos with real-time progress updates. Includes multi-tenant support and role-based access control.

---

## Features

* JWT authentication
* Video-only uploads
* Real-time processing progress (Socket.io)
* Video processing with FFmpeg
* Secure streaming (HTTP range requests)
* RBAC:

  * Admin: upload, assign, delete
  * Viewer: view assigned videos

---

## Tech Stack

* Backend: Node.js, Express, MongoDB, Socket.io, FFmpeg
* Frontend: React (Vite), Axios, Socket.io Client

---

## Setup

### Backend

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/videoapp
JWT_SECRET=supersecretkey
```

Run:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## User Setup

Admin:

```bash
curl -X POST http://localhost:5001/api/auth/register \
-H "Content-Type: application/json" \
-d '{"email":"admin@test.com","password":"admin123","role":"admin","tenantId":"org1"}'
```

Viewer:

```bash
curl -X POST http://localhost:5001/api/auth/register \
-H "Content-Type: application/json" \
-d '{"email":"viewer@test.com","password":"viewer123","role":"viewer","tenantId":"org1"}'
```

---

## Workflow

1. Login as Admin
2. Upload a video
3. Track processing progress
4. Assign video to Viewer
5. Viewer streams assigned video


