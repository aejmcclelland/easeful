# Easeful – Task Management Application  
**Live App:** https://easeful.amcclelland.net  
**API:** https://api.easeful.amcclelland.net  

Easeful is a clean, modern, cloud-deployed task management application built with **React**, **Express**, and **MongoDB Atlas**, featuring secure user authentication, dynamic task controls, and a polished UI.  
The app is deployed across **AWS CloudFront**, **AWS S3**, and **Render**, following a production-grade architecture.

---

## Features

### Secure Authentication
- Email/password login  
- HttpOnly, Secure session cookies  
- Safari-compatible using first-party subdomains  
- Persistent sessions and auto-refresh  

### Task Management
- Create, edit, delete tasks  
- Status workflow: *Pending → In Progress → Completed*  
- Priority levels: *Low, Medium, High*  
- Reusable **PillDropdown** components  
- Instant UI updates  

### Modern UI/UX
- TailwindCSS + DaisyUI  
- Fully responsive layout  
- Navbar with dynamic Login/Register behaviour  
- Polished pill-style selectors for task metadata  

### Cloud Deployment
- Frontend hosted on **AWS S3**  
- Served globally through **AWS CloudFront**  
- Backend API deployed on **Render**    
- Proper CORS + cookie handling across domains  

---

## Tech Stack

### Frontend
- React 18 + Vite  
- TypeScript  
- TailwindCSS 4 + DaisyUI  
- React Router  
- Toast notifications  

### Backend
- Node.js + Express  
- MongoDB Atlas  
- Mongoose  
- HttpOnly cookie-based sessions  
- Helmet, CORS, security middleware  

---

## Architecture

- easeful.amcclelland.net  → AWS CloudFront → S3 (static React frontend)
- api.easeful.amcclelland.net → Render → Express API → MongoDB Atlas
- Shared domain (`*.amcclelland.net`) enables first-party cookies  
- SPA routing handled via CloudFront error responses  
- Globally distributed static assets via CDN  

---

## Local Development

```bash
pnpm install
pnpm run dev
```
## Set your local API URL:
````bash
VITE_API_URL=http://localhost:10000
````

## Backend
````bash
cd easeful-server
pnpm start
````

## Roadmap

	•	Task grouping and filters
	•	Kanban board view
	•	User profile settings
	•	Task search
	•	Notifications and reminders

## Author

Andrew McClelland
Portfolio: https://amcclelland.net
GitHub: https://github.com/andrewmcclelland
