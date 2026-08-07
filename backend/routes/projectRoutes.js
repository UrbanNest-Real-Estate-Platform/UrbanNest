const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getProjects,
  getMyProjects,
  createProject,
  addProjectDocument
} = require("../controllers/projectController");

router.get("/mine", protect, getMyProjects);
router.get("/", getProjects);
router.post("/", protect, createProject);
router.post("/:id/documents", protect, addProjectDocument);

module.exports = router;
