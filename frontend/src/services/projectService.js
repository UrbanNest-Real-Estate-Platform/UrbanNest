import api from "./axios";

// Fetch all projects (public listing)
export const fetchProjectsFromDB = () => {
  return api.get("/projects");
};

// Fetch only the logged-in builder's projects
export const fetchMyProjectsFromDB = () => {
  return api.get("/projects/mine");
};

// Create a new project in MongoDB
export const createProjectInDB = (projectData) => {
  return api.post("/projects", projectData);
};

// Upload document to project in MongoDB
export const addProjectDocumentInDB = (projectId, docData) => {
  return api.post(`/projects/${projectId}/documents`, docData);
};
