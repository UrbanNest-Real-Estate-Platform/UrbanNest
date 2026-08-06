import api from "./axios";

// Fetch all builder projects from MongoDB
export const fetchProjectsFromDB = () => {
  return api.get("/projects");
};

// Create a new project in MongoDB
export const createProjectInDB = (projectData) => {
  return api.post("/projects", projectData);
};

// Upload document to project in MongoDB
export const addProjectDocumentInDB = (projectId, docData) => {
  return api.post(`/projects/${projectId}/documents`, docData);
};
