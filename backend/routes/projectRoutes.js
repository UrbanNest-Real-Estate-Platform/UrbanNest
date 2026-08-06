const express = require("express");
const router = express.Router();
const {
  getProjects,
  createProject,
  addProjectDocument
} = require("../controllers/projectController");

router.get("/", getProjects);
router.post("/", createProject);
router.post("/:id/documents", addProjectDocument);

module.exports = router;
