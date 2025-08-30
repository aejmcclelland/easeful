# 📸 Task Image Gallery Feature

This document describes the design and implementation plan for adding **multi-image support** to tasks in Taskman.  
Users can upload, view, and manage up to **6 images per task**, with thumbnails shown in task cards and a gallery view on the task detail page.

---

## 🎯 Goals
- Allow up to **6 images** per task.
- Enforce **file type, size, and count validation**.
- Store images in **Cloudinary** with metadata (`public_id`, `url`, `width`, `height`, `bytes`).
- Show **small thumbnails** in task list cards.
- Provide a **responsive gallery + lightbox** on task detail pages.
- Enable **delete & replace** functionality for owners/admins.
- Optimize performance with **Cloudinary transformations**.

---

## 🛠️ Server (Express + Multer + Cloudinary)

### Data Shape
```json
"images": [
  {
    "public_id": "taskman/tasks/xyz123",
    "url": "https://res.cloudinary.com/.../taskman/tasks/xyz123.jpg",
    "width": 1280,
    "height": 853,
    "bytes": 142300
  }
]

```
## Validation Rules
	•	Max per task: 6 images
	•	Max per request: 6 - currentCount
	•	Allowed types: JPEG, PNG, WebP, AVIF, GIF
	•	Max size: From .env (FILE_UPLOAD_LIMIT)

## Endpoints
	•	Upload/append images
PUT /api/taskman/:id/photo
	•	Multipart, upload.array('images')
	•	Owner/admin only
	•	Delete an image
DELETE /api/taskman/:id/photo/:public_id
	•	Remove from DB and Cloudinary

Failure Handling
	•	Rollback: If any upload fails, clean up already-uploaded files.

---

## 🖼️ Client (Next.js + DaisyUI)

### TaskCard (list view)
	•	Show up to 3 small thumbnails (w_160,h_120,c_fill,q_auto,f_auto).
	•	If more than 3, show a +N overlay on last thumb.
---
## Task Detail (/tasks/[id])
	•	Responsive grid (grid-cols-2 md:grid-cols-3).
	•	Lightbox modal:
	•	Click thumbnail → open modal
	•	Arrow keys + Esc support
	•	Larger transform: w_1400,c_fit,q_auto,f_auto
---
## Upload UI
	•	Upload button (only for owner/admin).
	•	Accept multiple files, preview before upload.
	•	Show progress & errors.
	•	Block upload when 6 images already present.
---
## Delete UI
	•	Small ❌ icon on each tile.
	•	Confirm before deletion.

⸻

### 🔒 Security
	•	Only owner/admin can upload/delete.
	•	Public/shared tasks → anyone can view but not edit.
	•	Never trust client public_id → use Cloudinary’s response.

⸻

### 📊 Observability
	•	Log uploads/deletions with userId, taskId, count, and size.
	•	Consider per-task storage quota (e.g., 25MB total).

⸻

### ✅ “Done” Checklist
	•	Upload up to 6 images (validated both ends)
	•	Thumbnails in TaskCard
	•	Gallery grid + accessible lightbox in detail page
	•	Delete individual images
	•	Errors + progress indicators
	•	Ownership/auth enforced
