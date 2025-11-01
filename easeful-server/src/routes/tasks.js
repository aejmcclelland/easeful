const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  taskPhotoUpload,
  deleteTaskImage,
} = require('../controllers/tasks');

const multer = require('multer');
const { storage } = require('../cloudinary');

// Limit each file to 1MB; accept up to 5 images per request where applicable
const upload = multer({ storage, limits: { fileSize: 1_048_576 } });

// All task routes are protected
router.use(protect());

// List & create tasks (optionally allow images on create via "images" field)
router
  .route('/')
  .get(getTasks)
  .post(upload.array('images', 5), createTask);

// Single task read/update/delete
router
  .route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

// Add images to a task (field name: "images", max 5 total per task enforced in controller)
router
  .route('/:id/photo')
  .put(upload.array('images', 5), taskPhotoUpload);

// Delete a specific image from a task by its public_id
router
  .route('/:id/photo/:public_id')
  .delete(deleteTaskImage);

module.exports = router;
