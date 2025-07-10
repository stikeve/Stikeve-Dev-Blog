# Stikeve Dev Blog

A full-stack blogging platform built with React, TypeScript, Vite (client), and Node.js, Express, MongoDB (server). Users can register, create, edit, and manage blog posts with support for Markdown, tags, privacy controls, and user profiles.

I am building this project to showcase my skills. I will be adding more integrations and updating this README as the project evolves.

---
## Whats New


---

## Features

- **User Authentication:** Register, login, JWT-based authentication.
- **User Profiles:** Update username, bio, and avatar.
- **Blog Posts:** Create, edit, delete, and view posts with Markdown support.
- **Tags & Privacy:** Tag posts as `technical` or `personal`, set posts as public or private.
- **Excerpt Generation:** Auto-generates excerpts if not provided.
- **Responsive UI:** Built with Tailwind CSS and React.

---

## Project Structure

```
client/   # React + TypeScript + Vite frontend
server/   # Node.js + Express + MongoDB backend
```

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB instance (local or cloud)

### 1. Clone the Repository

```sh
git clone https://github.com/yourusername/stikeve-dev-blog.git
cd stikeve-dev-blog
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env` in both `client/` and `server/` folders and fill in the required values.

### 3. Install Dependencies

```sh
cd client
npm install
cd ../server
npm install
```

### 4. Run the Development Servers

#### Start the backend (server):

```sh
cd server
npm start
```

#### Start the frontend (client):

```sh
cd client
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5000 (default)

---

## API Overview

- **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/profile`
- **Posts:** `/api/posts`, `/api/posts/:id`, `/api/posts/user/:userId`, `/api/posts/:slug`
- **Protected routes** require JWT in the `Authorization` header.

---

## Technologies Used

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Markdown
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT
- **Other:** ESLint, dotenv, bcryptjs

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## Contact

For questions or feedback, open an issue or contact [Ashutosh.Dev@ashutoshgautam.io](mailto:Ashutosh.Dev@ashutoshgautam.io)