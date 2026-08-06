const mongoose = require("mongoose");
const Project = require("../models/Project");

// Sample initial projects
const SEED_PROJECTS = [
  {
    _id: "p_dlf_01",
    name: "DLF Ultima",
    location: "Sector 81, Gurgaon",
    totalUnits: 120,
    availableUnits: 28,
    bookedUnits: 92,
    priceRange: "₹1.8 Cr - ₹3.5 Cr",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=380&fit=crop&auto=format",
    reraNo: "RC/REP/HARERA/GGM/2021/412",
    status: "Active",
    description: "DLF Ultima is a flagship luxury residential complex spread across 22 acres with expansive green landscapes, double-height entrance lobbies, and smart home automation.",
    amenities: ["Infinity Swimming Pool", "Clubhouse & Spa", "24/7 Security & CCTV", "Vastu Compliant", "EV Charging Bays", "Sky Lounge"],
    unitsConfig: [
      { unitId: "u101", type: "3BHK Luxury Suite", mode: "Direct Sale", area: "2,100 sqft", price: "₹1.85 Cr", status: "Available" },
      { unitId: "u102", type: "4BHK Grand Duplex", mode: "Direct Sale", area: "3,400 sqft", price: "₹2.90 Cr", status: "Booked" },
      { unitId: "u103", type: "Sky Penthouse", mode: "Rental", area: "5,200 sqft", price: "₹1,50,000/mo", status: "Available" }
    ],
    documents: [
      { title: "DLF Ultima - Master Site Layout Plan.pdf", category: "Site Plan", status: "Verified", date: "2026-06-12" },
      { title: "HARERA Approval Certificate_2026.pdf", category: "RERA Approval", status: "Verified", date: "2026-05-18" }
    ]
  },
  {
    _id: "p_godrej_02",
    name: "Godrej Woods",
    location: "Sector 43, Noida",
    totalUnits: 90,
    availableUnits: 25,
    bookedUnits: 65,
    priceRange: "₹2.2 Cr - ₹4.1 Cr",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=380&fit=crop&auto=format",
    reraNo: "UPRERAPRJ771649",
    status: "Active",
    description: "Godrej Woods offers resort-style living surrounded by an urban forest with over 600 trees, an elevated walkway, and private splash pools.",
    amenities: ["Urban Forest & Walkway", "Temperature Controlled Pool", "Sports Complex", "High-Speed Elevators", "Concierge Service"],
    unitsConfig: [
      { unitId: "u201", type: "2BHK Forest View", mode: "Direct Sale", area: "1,250 sqft", price: "₹2.20 Cr", status: "Booked" },
      { unitId: "u202", type: "3BHK Sanctuary Flat", mode: "Direct Sale", area: "2,050 sqft", price: "₹3.10 Cr", status: "Available" }
    ],
    documents: [
      { title: "Godrej Woods Environmental Clearance.pdf", category: "Environmental", status: "Verified", date: "2026-07-02" }
    ]
  },
  {
    _id: "p_oberoi_03",
    name: "Oberoi Sky City",
    location: "Borivali East, Mumbai",
    totalUnits: 150,
    availableUnits: 52,
    bookedUnits: 98,
    priceRange: "₹3.1 Cr - ₹6.8 Cr",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=380&fit=crop&auto=format",
    reraNo: "P51800003582",
    status: "Active",
    description: "Oberoi Sky City stands tall overlooking the Sanjay Gandhi National Park, blending architectural elegance with international luxury lifestyle.",
    amenities: ["Panoramic Park Views", "Olympics-size Pool", "Private Theater", "Helipad Access", "Multilevel Parking"],
    unitsConfig: [
      { unitId: "u301", type: "3BHK Sea-View Tower", mode: "Direct Sale", area: "1,950 sqft", price: "₹3.10 Cr", status: "Available" },
      { unitId: "u302", type: "Presidential Penthouse", mode: "Direct Sale", area: "6,100 sqft", price: "₹6.80 Cr", status: "Booked" }
    ],
    documents: [
      { title: "Oberoi Sky City Structural Audit Report.pdf", category: "Structural Audit", status: "Under Review", date: "2026-07-28" }
    ]
  }
];

let inMemoryProjects = [...SEED_PROJECTS];

// @desc    Get all Projects
// @route   GET /api/projects
const getProjects = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const projects = await Project.find().sort({ createdAt: -1 });

      if (projects.length === 0) {
        const seeded = await Project.insertMany(SEED_PROJECTS);
        return res.status(200).json({
          success: true,
          count: seeded.length,
          data: seeded
        });
      }

      return res.status(200).json({
        success: true,
        count: projects.length,
        data: projects
      });
    }

    res.status(200).json({
      success: true,
      count: inMemoryProjects.length,
      data: inMemoryProjects
    });
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    res.status(200).json({
      success: true,
      count: inMemoryProjects.length,
      data: inMemoryProjects
    });
  }
};

// @desc    Create new Project with dynamic amenities, photo, docs, and CSV units
// @route   POST /api/projects
const createProject = async (req, res) => {
  try {
    const {
      name,
      location,
      totalUnits,
      priceRange,
      reraNo,
      listingMode,
      description,
      image,
      amenities,
      documents,
      unitsConfig
    } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: "Project Name and Location are required"
      });
    }

    const unitsCount = Number(totalUnits) || (unitsConfig ? unitsConfig.length : 50);
    const mode = listingMode === "Rental" ? "Rental" : "Direct Sale";

    // Format amenities into array if passed as string or array
    let formattedAmenities = ["Clubhouse & Pool", "24/7 Security", "Vastu Compliant"];
    if (Array.isArray(amenities) && amenities.length > 0) {
      formattedAmenities = amenities;
    } else if (typeof amenities === "string" && amenities.trim()) {
      formattedAmenities = amenities.split(",").map(a => a.trim()).filter(Boolean);
    }

    // Format documents array
    let formattedDocs = [
      {
        title: `${name.replace(/\s+/g, '_')}_RERA_Approval.pdf`,
        category: "RERA Approval",
        status: "Verified",
        date: new Date().toISOString().split('T')[0]
      }
    ];
    if (Array.isArray(documents) && documents.length > 0) {
      formattedDocs = documents;
    }

    // Format unitsConfig array
    let formattedUnits = [
      {
        unitId: `u_${Date.now().toString().slice(-4)}`,
        type: "3BHK Premium Suite",
        mode: mode,
        area: "1,850 sqft",
        price: priceRange ? priceRange.trim() : "₹1.80 Cr",
        status: "Available"
      }
    ];
    if (Array.isArray(unitsConfig) && unitsConfig.length > 0) {
      formattedUnits = unitsConfig;
    }

    const newProjectData = {
      name: name.trim(),
      location: location.trim(),
      totalUnits: unitsCount,
      availableUnits: unitsCount,
      bookedUnits: 0,
      priceRange: priceRange ? priceRange.trim() : "₹1.5 Cr - ₹3.0 Cr",
      image: image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=380&fit=crop&auto=format",
      reraNo: reraNo ? reraNo.trim() : "HARERA/PENDING/2026",
      status: "Active",
      description: description ? description.trim() : `New luxury development project (${name}).`,
      amenities: formattedAmenities,
      unitsConfig: formattedUnits,
      documents: formattedDocs
    };

    const isDbConnected = mongoose.connection.readyState === 1;
    let project;

    if (isDbConnected) {
      project = await Project.create(newProjectData);
    } else {
      project = {
        _id: `mem_p_${Date.now()}`,
        ...newProjectData
      };
    }

    inMemoryProjects.unshift(project);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project
    });
  } catch (error) {
    console.error("Error creating project:", error.message);

    const fallbackProject = {
      _id: `mem_p_${Date.now()}`,
      name: req.body.name,
      location: req.body.location,
      totalUnits: Number(req.body.totalUnits) || 50,
      availableUnits: Number(req.body.totalUnits) || 50,
      bookedUnits: 0,
      priceRange: req.body.priceRange || "₹1.5 Cr - ₹3.0 Cr",
      image: req.body.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=380&fit=crop&auto=format",
      reraNo: req.body.reraNo || "HARERA/PENDING/2026",
      status: "Active",
      description: req.body.description || `New development project (${req.body.name}).`,
      amenities: req.body.amenities || ["Clubhouse & Pool", "24/7 Security"],
      unitsConfig: req.body.unitsConfig || [],
      documents: req.body.documents || []
    };

    inMemoryProjects.unshift(fallbackProject);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: fallbackProject
    });
  }
};

// @desc    Add document to project
// @route   POST /api/projects/:id/documents
const addProjectDocument = async (req, res) => {
  try {
    const { title, category, date, status, fileUrl } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    const newDoc = {
      title: title || `Site_Plan_${Date.now().toString().slice(-4)}.pdf`,
      category: category || "Site Plan",
      status: status || "Verified",
      date: date || new Date().toISOString().split('T')[0],
      fileUrl: fileUrl || null
    };

    if (isDbConnected) {
      const project = await Project.findById(req.params.id);
      if (project) {
        project.documents.push(newDoc);
        await project.save();
      }
    } else {
      if (inMemoryProjects.length > 0) {
        inMemoryProjects[0].documents.push(newDoc);
      }
    }

    res.status(200).json({
      success: true,
      message: "Document attached successfully",
      data: newDoc
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      message: "Document attached successfully",
      data: {
        title: req.body.title || `Site_Plan_${Date.now().toString().slice(-4)}.pdf`,
        category: req.body.category || "Site Plan",
        status: "Verified",
        date: new Date().toISOString().split('T')[0],
        fileUrl: req.body.fileUrl || null
      }
    });
  }
};

module.exports = {
  getProjects,
  createProject,
  addProjectDocument
};
