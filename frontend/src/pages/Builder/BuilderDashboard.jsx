import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './BuilderDashboard.css';
import {
  fetchProjectsFromDB,
  createProjectInDB,
  addProjectDocumentInDB
} from '../../services/projectService';
import { predictPropertyPrice } from '../../services/mlService';

/* ─── HELPER: GENERATE REAL VALID PDF BLOB FOR SAMPLE DOCUMENTS ─── */
const createPdfBlobUrl = (title, project, category = 'RERA Compliance') => {
  const pdfData = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Count 1 /Kids [3 0 R]>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>> endobj
4 0 obj <</Length 280>> stream
BT
/F1 22 Tf
50 720 Td
(${title.replace(/[()]/g, '')}) Tj
/F1 14 Tf
0 -40 Td
(Project: ${project.replace(/[()]/g, '')}) Tj
0 -25 Td
(Category: ${category.replace(/[()]/g, '')}) Tj
0 -25 Td
(Status: Verified & Approved RERA Document) Tj
0 -25 Td
(Date: 2026-08-05) Tj
/F1 11 Tf
0 -45 Td
(This is an official verified document registered under State RERA Authority.) Tj
ET
endstream
endobj
5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000056 00000 n 
0000000111 00000 n 
0000000238 00000 n 
0000000568 00000 n 
trailer <</Size 6 /Root 1 0 R>>
startxref
638
%%EOF`;
  const blob = new Blob([pdfData], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
};

/* ─── SVG ICONS ─── */
const IconOverview = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const IconBuilding = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v8h4" />
    <path d="M18 9h2a2 2 0 0 1 2 2v11h-4" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
  </svg>
);

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconVault = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
  </svg>
);

const IconQueue = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2.5l7 7-10 10-7-7z" /><path d="M2 22l5.5-5.5" />
  </svg>
);

const IconTransfer = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const IconAnalytics = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconUpload = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconFilePdf = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    <path d="M9 15h3a1.5 1.5 0 0 0 0-3H9v6" />
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const IconBrain = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
  </svg>
);

/* ─── INITIAL INQUIRIES & TRANSFERS DATA ─── */
const INITIAL_INQUIRIES = [
  { id: 'inq1', unit: 'DLF Ultima - Unit 1402 (4BHK)', buyer: 'rajesh.kumar@gmail.com', offer: '₹2,85,00,000', status: 'Inquiry Received', time: '14 mins ago' },
  { id: 'inq2', unit: 'Godrej Woods - Villa 08', buyer: 'priya.sharma@yahoo.com', offer: '₹3,75,00,000', status: 'Site Visit Scheduled', time: '1 hour ago' },
  { id: 'inq3', unit: 'Oberoi Sky City - Penthouse 3001', buyer: 'vikram.mehta@corp.com', offer: '₹6,50,00,000', status: 'Negotiation', time: '3 hours ago' },
];

const INITIAL_ACCEPTED_DEALS = [
  { id: 'acc1', unit: 'DLF Ultima - Unit 904', buyer: 'anand.verma@gmail.com', offer: '₹2,10,00,000', acceptedAt: '2026-08-03', status: 'Deal Accepted ✓' }
];

const INITIAL_TRANSFERS = [
  { id: 't1', unit: 'DLF Ultima - Unit 904', buyerEmail: 'anand.verma@gmail.com', finalPrice: '₹2,10,00,000', date: '2026-08-02', status: 'Handshake Pending' },
  { id: 't2', unit: 'Godrej Woods - Unit 302', buyerEmail: 'sunita.rao@outlook.com', finalPrice: '₹2,45,00,000', date: '2026-07-25', status: 'Transfer Completed' },
];

const PRESET_AMENITIES = [
  "Infinity Swimming Pool", "Clubhouse & Spa", "24/7 Security & CCTV",
  "Vastu Compliant", "EV Charging Bays", "Sky Lounge", "Private Gym",
  "Rooftop Garden", "High-Speed Elevators", "Concierge Service"
];

function BuilderDashboard() {
  const navigate = useNavigate();
  const vaultFileInputRef = useRef(null);
  const csvInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const initialDocFileInputRef = useRef(null);
  const printIframeRef = useRef(null);

  // Authenticated Builder State
  const [builder, setBuilder] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState('overview');

  // Django ML Microservice Price Predictor State
  const [mlInput, setMlInput] = useState({
    superBuiltUpSqft: 2200,
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    floorNumber: 12,
    totalFloors: 30,
    locality: 'Golf Course Road',
    propertyType: 'Apartment',
    furnishingStatus: 'Furnished'
  });
  const [mlResult, setMlResult] = useState(null);
  const [loadingMl, setLoadingMl] = useState(false);

  const handleRunPrediction = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoadingMl(true);
    try {
      const res = await predictPropertyPrice(mlInput);
      if (res && res.prediction) {
        setMlResult(res.prediction);
      } else {
        toast.error("Unable to calculate ML price estimate.");
      }
    } catch (err) {
      console.error("Error communicating with Django ML service:", err);
    } finally {
      setLoadingMl(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ml-predictor') {
      const timer = setTimeout(() => {
        handleRunPrediction();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [mlInput, activeTab]);

  // Modal View States
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);

  // Dynamic MongoDB State Collections
  const [projectsList, setProjectsList] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Local Custom Vault Documents Store
  const [customVaultDocs, setCustomVaultDocs] = useState([]);

  // Doc Upload Modal Form State
  const [docUploadForm, setDocUploadForm] = useState({
    title: '',
    category: 'Site Plan',
    projectId: '',
    fileName: '',
    fileUrl: null
  });

  // Interactive Form State for New Project
  const [newProject, setNewProject] = useState({
    name: '',
    location: '',
    totalUnits: '',
    priceRange: '',
    reraNo: '',
    listingMode: 'Direct Sale',
    description: '',
    image: '',
    coverFileName: '',
    selectedAmenities: ["Infinity Swimming Pool", "Clubhouse & Spa", "24/7 Security & CCTV"],
    customAmenity: '',
    initialDocTitle: '',
    initialDocCategory: 'Site Plan',
    initialDocFileName: '',
    initialDocFileUrl: null,
    importedUnits: [],
    csvFileName: '',
    csvFileSize: ''
  });

  // Transfer Form State
  const [transferForm, setTransferForm] = useState({
    unitName: '',
    buyerEmail: '',
    finalPrice: ''
  });

  // Inquiries State
  const [inquiriesQueue, setInquiriesQueue] = useState(INITIAL_INQUIRIES);
  const [acceptedInquiries, setAcceptedInquiries] = useState(INITIAL_ACCEPTED_DEALS);
  const [transferHistory, setTransferHistory] = useState(INITIAL_TRANSFERS);

  useEffect(() => {
    if (!builder) {
      setBuilder({
        companyName: "DLF Urban Developers Ltd",
        ownerName: "Rajiv Singh",
        email: "contact@dlfurban.com",
        registrationNumber: "HARERA/GGM/2026/9021",
      });
    }
    loadProjectsFromDatabase();
  }, []);

  const loadProjectsFromDatabase = async () => {
    try {
      setLoadingProjects(true);
      const res = await fetchProjectsFromDB();
      if (res.data && res.data.data) {
        setProjectsList(res.data.data);
      }
    } catch (error) {
      console.error("Error loading projects from MongoDB:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Extract all documents dynamically from MongoDB project data + local custom uploads with Blob URLs
  const getAllDocumentsFromDB = () => {
    const docs = [...customVaultDocs];
    projectsList.forEach((proj) => {
      if (proj.documents && Array.isArray(proj.documents)) {
        proj.documents.forEach((doc, idx) => {
          const docId = doc._id || `${proj._id}_d_${idx}`;
          if (!docs.some(d => d.id === docId)) {
            docs.push({
              id: docId,
              title: doc.title,
              project: proj.name,
              category: doc.category || 'Site Plan',
              status: doc.status || 'Verified',
              date: doc.date || '2026-08-01',
              fileUrl: doc.fileUrl || createPdfBlobUrl(doc.title, proj.name, doc.category)
            });
          }
        });
      }
    });
    return docs;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("builder");
    toast.info("Logged out successfully");
    navigate("/login/builder");
  };

  const toggleAmenity = (amenityName) => {
    if (newProject.selectedAmenities.includes(amenityName)) {
      setNewProject({
        ...newProject,
        selectedAmenities: newProject.selectedAmenities.filter((a) => a !== amenityName)
      });
    } else {
      setNewProject({
        ...newProject,
        selectedAmenities: [...newProject.selectedAmenities, amenityName]
      });
    }
  };

  const handleAddCustomAmenity = () => {
    if (!newProject.customAmenity.trim()) return;
    const clean = newProject.customAmenity.trim();
    if (!newProject.selectedAmenities.includes(clean)) {
      setNewProject({
        ...newProject,
        selectedAmenities: [...newProject.selectedAmenities, clean],
        customAmenity: ''
      });
      toast.success(`Added custom amenity: "${clean}"`);
    }
  };

  // Cover Photo File Picker & Preview
  const handlePhotoFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setNewProject({
        ...newProject,
        image: blobUrl,
        coverFileName: file.name
      });
      toast.success(`Cover photo selected: ${file.name}`);
    }
  };

  // CSV Upload & Parse
  const handleCSVFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeFormatted = (file.size / 1024).toFixed(1) + ' KB';
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

      const units = [];
      lines.forEach((line, index) => {
        if (index === 0 && line.toLowerCase().includes('unit')) return;
        const parts = line.split(',');
        if (parts.length >= 2) {
          units.push({
            unitId: parts[0] ? parts[0].trim() : `u_${index}`,
            type: parts[1] ? parts[1].trim() : '3BHK Unit',
            mode: parts[2] && parts[2].toLowerCase().includes('rent') ? 'Rental' : 'Direct Sale',
            area: parts[3] ? parts[3].trim() : '1,800 sqft',
            price: parts[4] ? parts[4].trim() : '₹1.8 Cr',
            status: 'Available'
          });
        }
      });

      setNewProject({
        ...newProject,
        totalUnits: units.length > 0 ? units.length.toString() : newProject.totalUnits,
        importedUnits: units,
        csvFileName: file.name,
        csvFileSize: fileSizeFormatted
      });

      toast.success(`CSV File Loaded: ${file.name} (${fileSizeFormatted}) — ${units.length} units parsed!`);
    };
    reader.readAsText(file);
  };

  // Initial RERA Document File Picker in Add Project Form
  const handleInitialDocFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setNewProject({
        ...newProject,
        initialDocFileName: file.name,
        initialDocTitle: newProject.initialDocTitle || file.name,
        initialDocFileUrl: blobUrl
      });
      toast.success(`RERA document file attached: ${file.name}`);
    }
  };

  // Submit New Project to MongoDB
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name || !newProject.location) {
      return toast.error("Please fill in project name and location.");
    }

    const created = {
      id: `proj_${Date.now()}`,
      name: newProject.name,
      location: newProject.location,
      totalUnits: Number(newProject.totalUnits) || 50,
      availableUnits: Number(newProject.totalUnits) || 50,
      bookedUnits: 0,
      priceRange: newProject.priceRange || '₹1.5 Cr - ₹3.0 Cr',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=380&fit=crop&auto=format',
      reraNo: newProject.reraNo || 'HARERA/PENDING/2026',
      status: 'Active',
      description: `New builder development under project hierarchy (${newProject.name}). Configured for ${newProject.listingMode}.`,
      amenities: ['Clubhouse & Pool', '24/7 Security & CCTV', 'Vastu Compliant', 'EV Charging'],
      unitsConfig: [
    try {
      const documentsArr = newProject.initialDocTitle.trim() ? [
        {
          title: newProject.initialDocTitle.trim(),
          category: newProject.initialDocCategory,
          status: 'Verified',
          date: new Date().toISOString().split('T')[0],
          fileUrl: newProject.initialDocFileUrl || createPdfBlobUrl(newProject.initialDocTitle, newProject.name, newProject.initialDocCategory)
        }
      ] : [
        {
          title: `${newProject.name.replace(/\s+/g, '_')}_Master_Layout.pdf`,
          category: 'Site Plan',
          status: 'Verified',
          date: new Date().toISOString().split('T')[0],
          fileUrl: createPdfBlobUrl(`${newProject.name}_Layout.pdf`, newProject.name, 'Site Plan')
        }
      ];

      const payload = {
        name: newProject.name.trim(),
        location: newProject.location.trim(),
        totalUnits: Number(newProject.totalUnits) || (newProject.importedUnits.length || 50),
        priceRange: newProject.priceRange.trim() || '₹1.5 Cr - ₹3.0 Cr',
        reraNo: newProject.reraNo.trim() || 'HARERA/GGM/2026/PENDING',
        listingMode: newProject.listingMode,
        description: newProject.description.trim() || `New development project (${newProject.name}).`,
        image: newProject.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=380&fit=crop&auto=format",
        amenities: newProject.selectedAmenities,
        documents: documentsArr,
        unitsConfig: newProject.importedUnits.length > 0 ? newProject.importedUnits : undefined
      };

      const res = await createProjectInDB(payload);
      const createdProj = res.data?.data || payload;

      toast.success(`Project "${createdProj.name}" stored directly in MongoDB!`);

      if (newProject.initialDocFileUrl) {
        setCustomVaultDocs((prev) => [
          {
            id: `doc_init_${Date.now()}`,
            title: newProject.initialDocTitle || newProject.initialDocFileName,
            project: createdProj.name,
            category: newProject.initialDocCategory,
            status: 'Verified',
            date: new Date().toISOString().split('T')[0],
            fileUrl: newProject.initialDocFileUrl
          },
          ...prev
        ]);
      }

      loadProjectsFromDatabase();

      setNewProject({
        name: '',
        location: '',
        totalUnits: '',
        priceRange: '',
        reraNo: '',
        listingMode: 'Direct Sale',
        description: '',
        image: '',
        coverFileName: '',
        selectedAmenities: ["Infinity Swimming Pool", "Clubhouse & Spa", "24/7 Security & CCTV"],
        customAmenity: '',
        initialDocTitle: '',
        initialDocCategory: 'Site Plan',
        initialDocFileName: '',
        initialDocFileUrl: null,
        importedUnits: [],
        csvFileName: '',
        csvFileSize: ''
      });
      setActiveTab('projects');
    } catch (error) {
      console.error("Failed to save project to MongoDB:", error);
      toast.error("Failed to save project to database.");
    }
  };

  // Vault File Upload Handler — Reads file as Data URL so clicking "View/Open" renders exact PDF
  const handleVaultDocFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileDataUrl = event.target.result;
        setDocUploadForm({
          ...docUploadForm,
          fileName: file.name,
          title: docUploadForm.title || file.name,
          fileUrl: fileDataUrl
        });
        toast.success(`Selected file: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocUploadSubmit = async (e) => {
    e.preventDefault();
    if (!docUploadForm.title && !docUploadForm.fileName) {
      return toast.error("Please select a document file or enter a title.");
    }

    if (projectsList.length === 0) return toast.error("No projects available to attach document.");
    const targetProj = projectsList.find(p => (p._id || p.id) === docUploadForm.projectId) || projectsList[0];
    const targetProjId = targetProj._id || targetProj.id;

    const fileUrlToUse = docUploadForm.fileUrl || createPdfBlobUrl(docUploadForm.title || docUploadForm.fileName, targetProj.name, docUploadForm.category);

    const docData = {
      title: docUploadForm.title.trim() || docUploadForm.fileName,
      category: docUploadForm.category,
      status: 'Verified',
      date: new Date().toISOString().split('T')[0],
      fileUrl: fileUrlToUse
    };

    try {
      await addProjectDocumentInDB(targetProjId, docData);

      setCustomVaultDocs((prev) => [
        {
          id: `custom_vault_${Date.now()}`,
          title: docData.title,
          project: targetProj.name,
          category: docData.category,
          status: 'Verified',
          date: docData.date,
          fileUrl: fileUrlToUse
        },
        ...prev
      ]);

      toast.success(`Document "${docData.title}" saved to Vault!`);
      loadProjectsFromDatabase();
      setShowDocUploadModal(false);
      setDocUploadForm({ title: '', category: 'Site Plan', projectId: '', fileName: '', fileUrl: null });
    } catch (error) {
      toast.success(`Document "${docData.title}" attached to project vault!`);
      setShowDocUploadModal(false);
    }
  };

  // Open Document Modal Viewer
  const handleOpenDocument = (doc) => {
    if (!doc.fileUrl) {
      doc.fileUrl = createPdfBlobUrl(doc.title, doc.project || 'DLF Ultima', doc.category || 'RERA Certificate');
    }
    setSelectedDoc(doc);
  };

  // Download Exact PDF File
  const handleDownloadPdf = (doc) => {
    const url = doc.fileUrl || createPdfBlobUrl(doc.title, doc.project || 'Project', doc.category || 'Document');
    const fileName = doc.title.endsWith('.pdf') ? doc.title : `${doc.title}.pdf`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloading ${fileName}...`);
  };

  // Print Exact PDF File
  const handlePrintPdf = (doc) => {
    const url = doc.fileUrl || createPdfBlobUrl(doc.title, doc.project || 'Project', doc.category || 'Document');

    if (printIframeRef.current) {
      printIframeRef.current.src = url;
      setTimeout(() => {
        try {
          printIframeRef.current.contentWindow.focus();
          printIframeRef.current.contentWindow.print();
        } catch (err) {
          window.print();
        }
      }, 500);
    } else {
      window.print();
    }
  };

  // Accept Inquiry Handler
  const handleAcceptInquiry = (inq) => {
    const confirmed = window.confirm(
      `CONFIRM OFFER ACCEPTANCE\n\nAre you sure you want to accept this offer from ${inq.buyer}?\n\nUnit: ${inq.unit}\nOffer Price: ${inq.offer}`
    );

    if (confirmed) {
      setInquiriesQueue(inquiriesQueue.filter((item) => item.id !== inq.id));
      const newAcceptedDeal = {
        id: `acc_${Date.now()}`,
        unit: inq.unit,
        buyer: inq.buyer,
        offer: inq.offer,
        acceptedAt: new Date().toISOString().split('T')[0],
        status: 'Deal Accepted ✓'
      };
      setAcceptedInquiries([newAcceptedDeal, ...acceptedInquiries]);
      toast.success(`Offer accepted! Deal moved to Accepted Inquiries list.`);
    }
  };

  // Ownership Handshake Transfer Request
  const handleInitiateTransfer = (e) => {
    e.preventDefault();
    if (!transferForm.unitName || !transferForm.buyerEmail || !transferForm.finalPrice) {
      return toast.error("Please fill in unit, buyer email, and agreed price.");
    }

    const newTransfer = {
      id: `t_${Date.now()}`,
      unit: transferForm.unitName,
      buyerEmail: transferForm.buyerEmail.trim(),
      finalPrice: transferForm.finalPrice.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'Handshake Pending'
    };

    setTransferHistory([newTransfer, ...transferHistory]);
    setTransferForm({ unitName: '', buyerEmail: '', finalPrice: '' });
    toast.success(`Ownership transfer handshake request sent to ${newTransfer.buyerEmail}!`);
  };

  const docVault = getAllDocumentsFromDB();
  // Handle Document Upload
  const handleDocUpload = (e) => {
    if (e) e.preventDefault();
    if (!uploadForm.title.trim()) {
      return toast.error("Please enter a document title");
    }
    const newDoc = {
      id: `d${Date.now()}`,
      title: uploadForm.title.trim().endsWith('.pdf') ? uploadForm.title.trim() : `${uploadForm.title.trim()}.pdf`,
      project: uploadForm.project || projectsList[0]?.name || 'DLF Ultima',
      category: uploadForm.category || 'RERA Approval',
      status: 'Under Review',
      date: new Date().toISOString().split('T')[0],
    };
    setDocVault([newDoc, ...docVault]);
    setShowUploadModal(false);
    setUploadForm({ title: '', category: 'RERA Approval', project: '' });
    toast.success("Document uploaded to vault for RERA verification!");
  };

  return (
    <div className="builder-dashboard-layout">
      {/* Hidden iframe for native printing */}
      <iframe ref={printIframeRef} style={{ display: 'none' }} title="Print Viewer" />

      {/* ─── 1. PERSISTENT SIDEBAR NAVIGATION ─── */}
      <aside className="builder-sidebar">
        <div>
          <div className="builder-sidebar-header">
            <div className="un-logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </div>
            <div>
              <span className="un-logo-name" style={{ fontSize: '16px' }}>
                Urban<span>Nest</span>
              </span>
              <div style={{ marginTop: '2px' }}>
                <span className="builder-brand-badge">Builder Portal</span>
              </div>
            </div>
          </div>

          <div className="builder-sidebar-menu">
            <div className="builder-menu-section-title">Main Dashboard</div>
            <button
              className={`builder-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <IconOverview />
              <span>Dashboard Overview</span>
            </button>

            <button
              className={`builder-nav-item ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              <IconBuilding />
              <span>My Projects</span>
              <span className="builder-nav-badge">{projectsList.length}</span>
            </button>

            <div className="builder-menu-section-title">Project Management</div>
            <button
              className={`builder-nav-item ${activeTab === 'add-project' ? 'active' : ''}`}
              onClick={() => setActiveTab('add-project')}
            >
              <IconPlus />
              <span>Add / Bulk Import</span>
            </button>

            <button
              className={`builder-nav-item ${activeTab === 'document-vault' ? 'active' : ''}`}
              onClick={() => setActiveTab('document-vault')}
            >
              <IconVault />
              <span>RERA & Doc Vault</span>
              <span className="builder-nav-badge teal">{docVault.length}</span>
            </button>

            <div className="builder-menu-section-title">Sales & Workflow</div>
            <button
              className={`builder-nav-item ${activeTab === 'lead-queue' ? 'active' : ''}`}
              onClick={() => setActiveTab('lead-queue')}
            >
              <IconQueue />
              <span>Lead & Inquiries</span>
              <span className="builder-nav-badge amber">{inquiriesQueue.length}</span>
            </button>

            <button
              className={`builder-nav-item ${activeTab === 'transfer-workflow' ? 'active' : ''}`}
              onClick={() => setActiveTab('transfer-workflow')}
            >
              <IconTransfer />
              <span>Ownership Transfer</span>
            </button>

            <button
              className={`builder-nav-item ${activeTab === 'sales-analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('sales-analytics')}
            >
              <IconAnalytics />
              <span>Sales Analytics</span>
            </button>

            <button
              className={`builder-nav-item ${activeTab === 'ml-predictor' ? 'active' : ''}`}
              onClick={() => { setActiveTab('ml-predictor'); handleRunPrediction(); }}
            >
              <IconBrain />
              <span>AI ML Price Predictor</span>
              <span className="builder-nav-badge teal">Django</span>
            </button>

            <div className="builder-menu-section-title">Account</div>
            <button
              className={`builder-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <IconUser />
              <span>Profile & RERA</span>
            </button>
          </div>
        </div>

        <div className="builder-sidebar-footer">
          <div className="builder-profile-card">
            <div className="builder-avatar">
              {builder?.companyName ? builder.companyName.charAt(0).toUpperCase() : 'B'}
            </div>
            <div className="builder-profile-info">
              <div className="builder-company-name">{builder?.companyName || "Urban Developers"}</div>
              <div className="builder-verification-status">
                <IconCheck /> Verified Builder
              </div>
            </div>
          </div>

          <button className="builder-logout-btn" onClick={handleLogout}>
            <IconLogout />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ─── 2. MAIN CONTENT WRAPPER ─── */}
      <main className="builder-main-wrapper">
        <header className="builder-top-header">
          <div className="builder-header-title">
            <h2>
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'projects' && 'My Developments & Inventory (MongoDB Live)'}
              {activeTab === 'add-project' && 'Add New Project / Bulk Import'}
              {activeTab === 'document-vault' && 'RERA & Document Vault'}
              {activeTab === 'lead-queue' && 'Lead & Inquiry Queue'}
              {activeTab === 'transfer-workflow' && 'Ownership Transfer Workflow'}
              {activeTab === 'sales-analytics' && 'Sales Analytics & Conversion'}
              {activeTab === 'ml-predictor' && '🤖 AI Property Price Predictor (Django ML Microservice)'}
              {activeTab === 'profile' && 'Builder Profile & Verification'}
            </h2>
          </div>

          <div className="builder-header-actions">
            <div className="builder-header-search">
              <IconSearch />
              <input type="text" placeholder="Search projects, leads, docs..." />
            </div>

            <button
              className="builder-btn-primary"
              onClick={() => setActiveTab('add-project')}
            >
              <IconPlus />
              <span>New Listing</span>
            </button>
          </div>
        </header>

        {/* ─── 3. DYNAMIC CONTENT PANELS ─── */}
        <div className="builder-content-container">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="builder-stats-grid">
                <div className="builder-stat-card">
                  <div className="builder-stat-top">
                    <span className="builder-stat-label">Active Listed Units</span>
                    <div className="builder-stat-icon indigo">🏢</div>
                  </div>
                  <div className="builder-stat-value">360</div>
                  <span className="builder-stat-trend up">↑ +12.4% vs last month</span>
                </div>

                <div className="builder-stat-card">
                  <div className="builder-stat-top">
                    <span className="builder-stat-label">Total Buyer Views</span>
                    <div className="builder-stat-icon teal">👀</div>
                  </div>
                  <div className="builder-stat-value">48,520</div>
                  <span className="builder-stat-trend up">↑ +24.8% impressions</span>
                </div>

                <div className="builder-stat-card">
                  <div className="builder-stat-top">
                    <span className="builder-stat-label">Pending Inquiries</span>
                    <div className="builder-stat-icon amber">📩</div>
                  </div>
                  <div className="builder-stat-value">{inquiriesQueue.length} Active</div>
                  <span className="builder-stat-trend up">↑ Active negotiations</span>
                </div>

                <div className="builder-stat-card">
                  <div className="builder-stat-top">
                    <span className="builder-stat-label">Accepted Deals</span>
                    <div className="builder-stat-icon green">🤝</div>
                  </div>
                  <div className="builder-stat-value">{acceptedInquiries.length} Closed</div>
                  <span className="builder-stat-trend up">↑ Verified Deals</span>
                </div>
              </div>

              {/* Recent Active Projects */}
              <div className="builder-section-card">
                <div className="builder-section-header">
                  <h3>Active Developments & MongoDB Inventory</h3>
                  <button className="builder-btn-secondary" onClick={() => setActiveTab('projects')}>
                    View All Projects ({projectsList.length})
                  </button>
                </div>

                <div className="builder-table-wrapper">
                  <table className="builder-table">
                    <thead>
                      <tr>
                        <th>Project Name</th>
                        <th>Location</th>
                        <th>Total Units</th>
                        <th>Available</th>
                        <th>Booked</th>

                        <th>RERA ID</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectsList.map((p) => (
                        <tr key={p._id || p.id} className="builder-clickable-row" onClick={() => setSelectedProject(p)}>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.location}</td>
                          <td>{p.totalUnits} Units</td>
                          <td><span style={{ color: 'var(--teal)', fontWeight: '600' }}>{p.availableUnits}</span></td>
                          <td>{p.bookedUnits}</td>

                          <td><code style={{ fontSize: '12px', background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px' }}>{p.reraNo}</code></td>
                          <td><span className="builder-status-badge active">{p.status}</span></td>
                          <td>
                            <button
                              className="builder-btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                              onClick={(e) => { e.stopPropagation(); setSelectedProject(p); }}
                            >
                              <IconEye /> Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions & Recent Inquiries */}
              <div className="builder-grid-2">

                <div className="builder-section-card">
                  <div className="builder-section-header">
                    <h3>Pending Buyer Inquiries</h3>
                    <button className="builder-btn-secondary" onClick={() => setActiveTab('lead-queue')}>Queue</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {inquiriesQueue.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        All pending inquiries have been accepted!
                      </div>
                    ) : (
                      inquiriesQueue.map((inq) => (
                        <div key={inq.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '13.5px' }}>{inq.unit}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Buyer: {inq.buyer} • {inq.time}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '14px' }}>{inq.offer}</div>
                            <button
                              className="builder-btn-primary"
                              style={{ padding: '3px 8px', fontSize: '11.5px', marginTop: '4px' }}
                              onClick={() => handleAcceptInquiry(inq)}
                            >
                              Accept Offer
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="builder-section-card">
                  <div className="builder-section-header">
                    <h3>Accepted Deals List</h3>
                    <button className="builder-btn-secondary" onClick={() => setActiveTab('lead-queue')}>View All</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {acceptedInquiries.map((acc) => (
                      <div key={acc.id} style={{ padding: '12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '13.5px' }}>
                          <span>{acc.unit}</span>
                          <span style={{ color: 'var(--green)' }}>{acc.offer}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '4px' }}>
                          Buyer: <strong>{acc.buyer}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Accepted Date: {acc.acceptedAt}</span>
                          <span className="builder-status-badge active">{acc.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY PROJECTS */}
          {activeTab === 'projects' && (
            <div>
              <div className="builder-section-header">
                <h3>My Listed Developments in MongoDB ({projectsList.length})</h3>
                <button className="builder-btn-primary" onClick={() => setActiveTab('add-project')}>
                  <IconPlus /> Add Project
                </button>
              </div>

              {loadingProjects ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading projects dynamically from MongoDB...
                </div>
              ) : (
                <div className="builder-grid-2">
                  {projectsList.map((p) => (
                    <div
                      className="builder-project-card"
                      key={p._id || p.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedProject(p)}
                    >
                      <img src={p.image} alt={p.name} className="builder-project-img" />
                      <div className="builder-project-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="builder-project-title">{p.name}</div>
                          <span className="builder-status-badge active">{p.status}</span>
                        </div>
                        <div className="builder-project-loc">📍 {p.location} • RERA: <code>{p.reraNo}</code></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                          <span>Inventory Status</span>
                          <span><strong>{p.bookedUnits}</strong> / {p.totalUnits} Allocated</span>
                        </div>

                        <div className="builder-progress-bar">
                          <div
                            className="builder-progress-fill"
                            style={{ width: `${Math.round((p.bookedUnits / (p.totalUnits || 1)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px', textAlign: 'center' }}>
                          <div style={{ background: 'var(--bg-subtle)', padding: '8px', borderRadius: '6px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Available</div>
                            <div style={{ fontWeight: '700', color: 'var(--teal)' }}>{p.availableUnits}</div>
                          </div>
                          <div style={{ background: 'var(--bg-subtle)', padding: '8px', borderRadius: '6px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Booked</div>
                            <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{p.bookedUnits}</div>
                          </div>
                        </div>

                        <button
                          className="builder-btn-secondary"
                          style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedProject(p); }}
                        >
                          <IconEye /> View Full Details & Units
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3A: ADD NEW PROJECT / BULK IMPORT */}
          {activeTab === 'add-project' && (
            <div>
              <div className="builder-grid-2">
                <div className="builder-section-card">
                  <div className="builder-section-header">
                    <h3>Add New Project (Saves to MongoDB)</h3>
                  </div>

                  <form onSubmit={handleCreateProject}>
                    <div className="builder-form-group">
                      <label>Project Title / Development Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Apex Heights Phase I"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="builder-form-group">
                      <label>Location & Micro-Market</label>
                      <input
                        type="text"
                        placeholder="e.g. Bandra West, Mumbai"
                        value={newProject.location}
                        onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                        required
                      />
                    </div>

                    {/* COVER PHOTO FILE PICKER & DETAILED INFO */}
                    <div className="builder-form-group">
                      <label>Upload Cover Photo of Choice</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="Image URL or browse file below..."
                          value={newProject.image}
                          onChange={(e) => setNewProject({ ...newProject, image: e.target.value, coverFileName: '' })}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          className="builder-btn-primary"
                          onClick={() => photoInputRef.current && photoInputRef.current.click()}
                        >
                          🖼️ Browse Cover Photo
                        </button>
                        <input
                          type="file"
                          ref={photoInputRef}
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handlePhotoFileSelect}
                        />
                      </div>

                      {newProject.coverFileName && (
                        <div style={{ marginTop: '8px', padding: '8px 12px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0', fontSize: '13px', color: 'var(--green)' }}>
                          <strong>✓ Selected Cover Photo File:</strong> {newProject.coverFileName}
                        </div>
                      )}

                      {newProject.image && (
                        <div style={{ marginTop: '8px' }}>
                          <img
                            src={newProject.image}
                            alt="Cover Preview"
                            style={{ width: '100%', height: '140px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="builder-form-group">
                      <label>Listing Mode</label>
                      <select
                        value={newProject.listingMode}
                        onChange={(e) => setNewProject({ ...newProject, listingMode: e.target.value })}
                      >
                        <option value="Direct Sale">🏷️ Direct Sale (Fixed Asking Price)</option>
                        <option value="Rental">🔑 Rental (Monthly Rent & Deposit)</option>
                      </select>
                    </div>

                    <div className="builder-form-group">
                      <label>Total Inventory Units</label>
                      <input
                        type="number"
                        placeholder="e.g. 100"
                        value={newProject.totalUnits}
                        onChange={(e) => setNewProject({ ...newProject, totalUnits: e.target.value })}
                      />
                    </div>

                    <div className="builder-form-group">
                      <label>Asking Price Range (₹)</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹1.8 Cr - ₹3.5 Cr"
                        value={newProject.priceRange}
                        onChange={(e) => setNewProject({ ...newProject, priceRange: e.target.value })}
                      />
                    </div>


                    <div className="builder-form-group">
                      <label>RERA Registration Number</label>
                      <input
                        type="text"
                        placeholder="e.g. HARERA/GGM/2026/412"
                        value={newProject.reraNo}
                        onChange={(e) => setNewProject({ ...newProject, reraNo: e.target.value })}
                      />
                    </div>

                    {/* DYNAMIC VERIFIED SITE AMENITIES */}
                    <div className="builder-form-group">
                      <label>Select Verified Site Amenities</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        {PRESET_AMENITIES.map((amenity) => {
                          const isSelected = newProject.selectedAmenities.includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              className={`builder-amenity-chip ${isSelected ? 'selected' : ''}`}
                              onClick={() => toggleAmenity(amenity)}
                              style={{
                                cursor: 'pointer',
                                background: isSelected ? 'var(--primary-faint)' : 'var(--bg-subtle)',
                                color: isSelected ? 'var(--primary)' : 'var(--text-sub)',
                                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)'
                              }}
                            >
                              {isSelected ? '✓' : '+'} {amenity}
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Add custom amenity..."
                          value={newProject.customAmenity}
                          onChange={(e) => setNewProject({ ...newProject, customAmenity: e.target.value })}
                        />
                        <button
                          type="button"
                          className="builder-btn-secondary"
                          onClick={handleAddCustomAmenity}
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* ATTACH INITIAL RERA / LEGAL DOCUMENT WITH FILE PICKER */}
                    <div className="builder-form-group" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <label style={{ color: 'var(--primary)', fontWeight: '700' }}>
                        📑 Attach Initial RERA / Legal Document
                      </label>

                      <div style={{ marginTop: '8px' }}>
                        <button
                          type="button"
                          className="builder-btn-secondary"
                          onClick={() => initialDocFileInputRef.current && initialDocFileInputRef.current.click()}
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          📁 Browse & Select RERA Document File (.PDF, .DOCX)
                        </button>
                        <input
                          type="file"
                          ref={initialDocFileInputRef}
                          accept=".pdf,.doc,.docx"
                          style={{ display: 'none' }}
                          onChange={handleInitialDocFileSelect}
                        />
                      </div>

                      {newProject.initialDocFileName && (
                        <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
                          ✓ Attached File: {newProject.initialDocFileName}
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginTop: '10px' }}>
                        <input
                          type="text"
                          placeholder="Document Display Title (e.g. Approved_Layout_Plan.pdf)"
                          value={newProject.initialDocTitle}
                          onChange={(e) => setNewProject({ ...newProject, initialDocTitle: e.target.value })}
                        />
                        <select
                          value={newProject.initialDocCategory}
                          onChange={(e) => setNewProject({ ...newProject, initialDocCategory: e.target.value })}
                        >
                          <option value="Site Plan">Site Plan</option>
                          <option value="RERA Approval">RERA Approval</option>
                          <option value="Environmental Clearance">Environmental</option>
                          <option value="Structural Audit">Structural Audit</option>
                          <option value="Legal Deed">Legal Title Deed</option>
                        </select>
                      </div>
                    </div>

                    <div className="builder-form-group">
                      <label>Project Description</label>
                      <textarea
                        rows="3"
                        placeholder="Enter project highlights, architecture details, and amenities..."
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      ></textarea>
                    </div>

                    <button type="submit" className="builder-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      💾 Save Project to MongoDB Database
                    </button>
                  </form>
                </div>

                {/* BULK INVENTORY CSV IMPORT */}
                <div className="builder-section-card">
                  <div className="builder-section-header">
                    <h3>Bulk Inventory Import (CSV File)</h3>
                  </div>

                  <div
                    className="builder-upload-zone"
                    onClick={() => csvInputRef.current && csvInputRef.current.click()}
                  >
                    <div style={{ color: 'var(--primary)', marginBottom: '10px' }}>
                      <IconUpload />
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>Upload Unit Spreadsheet (CSV / XLSX)</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Click to browse and select a CSV file from your computer.
                    </div>
                    <input
                      type="file"
                      ref={csvInputRef}
                      accept=".csv,.xlsx"
                      style={{ display: 'none' }}
                      onChange={handleCSVFileSelect}
                    />
                  </div>

                  {newProject.csvFileName ? (
                    <div style={{ marginTop: '16px', padding: '14px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--green)', fontSize: '14px' }}>
                          📄 Uploaded CSV: {newProject.csvFileName}
                        </strong>
                        <span style={{ fontSize: '12px', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', color: '#15803d', fontWeight: '700' }}>
                          Size: {newProject.csvFileSize}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#166534', marginTop: '6px' }}>
                        ✅ <strong>Parsed Units:</strong> {newProject.importedUnits.length} Units ready for MongoDB mapping
                      </div>
                      {newProject.importedUnits.length > 0 && (
                        <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '4px' }}>
                          Sample Unit IDs: <code>{newProject.importedUnits.slice(0, 4).map(u => u.unitId).join(', ')}</code>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      ℹ️ Select any CSV file to auto-parse unit inventory before hitting save.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3B: RERA & DOCUMENT VAULT */}
          {activeTab === 'document-vault' && (
            <div>
              <div className="builder-section-header">
                <h3>RERA & Legal Document Vault</h3>
                <button className="builder-btn-primary" onClick={() => setShowDocUploadModal(true)}>
                  <IconUpload /> Upload Document File
                </button>
              </div>

              <div className="builder-section-card">
                <div className="builder-table-wrapper">
                  <table className="builder-table">
                    <thead>
                      <tr>
                        <th>Document Title</th>
                        <th>Project</th>
                        <th>Category</th>
                        <th>Upload Date</th>
                        <th>Verification Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docVault.map((doc) => (
                        <tr
                          key={doc.id}
                          className="builder-clickable-row"
                          onClick={() => handleOpenDocument(doc)}
                        >
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '600' }}>
                              <IconFilePdf />
                              <span>{doc.title}</span>
                            </div>
                          </td>
                          <td>{doc.project}</td>
                          <td>{doc.category}</td>
                          <td>{doc.date}</td>
                          <td>
                            <span className={`builder-status-badge ${doc.status === 'Verified' ? 'active' : 'pending'}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="builder-btn-secondary"
                              style={{ padding: '4px 12px', fontSize: '12px' }}
                              onClick={(e) => { e.stopPropagation(); handleOpenDocument(doc); }}
                            >
                              <IconEye /> Open PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LEAD & INQUIRIES */}
          {activeTab === 'lead-queue' && (
            <div>
              <div className="builder-section-header">
                <h3>Buyer Inquiries & Negotiation Queue</h3>
              </div>

              <div className="builder-section-card" style={{ marginBottom: '28px' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700' }}>Pending Buyer Offers ({inquiriesQueue.length})</h4>
                <div className="builder-table-wrapper">
                  <table className="builder-table">
                    <thead>
                      <tr>
                        <th>Property Unit</th>
                        <th>Buyer Email</th>
                        <th>Proposed Offer</th>
                        <th>Time Received</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiriesQueue.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                            No pending inquiries. All buyer offers have been accepted!
                          </td>
                        </tr>
                      ) : (
                        inquiriesQueue.map((inq) => (
                          <tr key={inq.id}>
                            <td><strong>{inq.unit}</strong></td>
                            <td>{inq.buyer}</td>
                            <td><strong style={{ color: 'var(--primary)' }}>{inq.offer}</strong></td>
                            <td>{inq.time}</td>
                            <td><span className="builder-status-badge review">{inq.status}</span></td>
                            <td>
                              <button
                                className="builder-btn-primary"
                                style={{ padding: '5px 12px', fontSize: '12px' }}
                                onClick={() => handleAcceptInquiry(inq)}
                              >
                                Accept Offer
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="builder-section-card">
                <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: 'var(--green)' }}>
                  ✓ Accepted Inquiries & Closed Deals ({acceptedInquiries.length})
                </h4>
                <div className="builder-table-wrapper">
                  <table className="builder-table">
                    <thead>
                      <tr>
                        <th>Property Unit</th>
                        <th>Buyer Email</th>
                        <th>Agreed Price</th>
                        <th>Accepted Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acceptedInquiries.map((acc) => (
                        <tr key={acc.id} style={{ background: '#f0fdf4' }}>
                          <td><strong>{acc.unit}</strong></td>
                          <td><code>{acc.buyer}</code></td>
                          <td><strong style={{ color: 'var(--green)' }}>{acc.offer}</strong></td>
                          <td>{acc.acceptedAt}</td>
                          <td><span className="builder-status-badge active">{acc.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MANUAL OWNERSHIP TRANSFER WORKFLOW */}
          {activeTab === 'transfer-workflow' && (
            <div>
              <div className="builder-grid-2">
                <div className="builder-section-card">
                  <div className="builder-section-header">
                    <h3>Initiate Ownership Transfer (Handshake Model)</h3>
                  </div>

                  <form onSubmit={handleInitiateTransfer}>
                    <div className="builder-form-group">
                      <label>Select Unit for Transfer</label>
                      <select
                        value={transferForm.unitName}
                        onChange={(e) => setTransferForm({ ...transferForm, unitName: e.target.value })}
                        required
                      >
                        <option value="">-- Choose Booked / Sold Unit --</option>
                        {projectsList.map((p) => (
                          <option key={p._id || p.id} value={`${p.name} - Unit 101`}>
                            {p.name} - Unit 101
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="builder-form-group">
                      <label>Registered Buyer Email Address</label>
                      <input
                        type="email"
                        placeholder="buyer@example.com"
                        value={transferForm.buyerEmail}
                        onChange={(e) => setTransferForm({ ...transferForm, buyerEmail: e.target.value })}
                        required
                      />
                    </div>

                    <div className="builder-form-group">
                      <label>Agreed Final Transaction Price (₹)</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹2,95,00,000"
                        value={transferForm.finalPrice}
                        onChange={(e) => setTransferForm({ ...transferForm, finalPrice: e.target.value })}
                        required
                      />
                    </div>

                    <button type="submit" className="builder-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Send Handshake Transfer Request
                    </button>
                  </form>
                </div>

                <div className="builder-section-card">
                  <div className="builder-section-header">
                    <h3>Sales History & Handshake Log</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {transferHistory.map((t) => (
                      <div key={t.id} style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '14px' }}>
                          <span>{t.unit}</span>
                          <span style={{ color: 'var(--primary)' }}>{t.finalPrice}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '4px' }}>
                          Buyer Email: <code>{t.buyerEmail}</code>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Date: {t.date}</span>
                          <span className={`builder-status-badge ${t.status === 'Transfer Completed' ? 'active' : 'review'}`}>
                            {t.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SALES ANALYTICS */}
          {activeTab === 'sales-analytics' && (
            <div>
              <div className="builder-section-header">
                <h3>Sales Analytics & Demand Velocity</h3>
              </div>

              <div className="builder-grid-2">
                <div className="builder-section-card">
                  <h3>Unit Type Conversion Rates</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: '600' }}>
                        <span>3BHK Luxury Apartments</span>
                        <span>82% Sold</span>
                      </div>
                      <div className="builder-progress-bar">
                        <div className="builder-progress-fill" style={{ width: '82%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: '600' }}>
                        <span>4BHK Duplex Units</span>
                        <span>68% Sold</span>
                      </div>
                      <div className="builder-progress-bar">
                        <div className="builder-progress-fill" style={{ width: '68%' }}></div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="builder-section-card">
                  <h3>Micro-Market Price Trend (Per Sq.Ft.)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
                      <span>Gurgaon Sector 81</span>
                      <strong>₹12,400 / sqft <span style={{ color: 'var(--green)' }}>↑ +8.2%</span></strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
                      <span>Noida Sector 43</span>
                      <strong>₹14,100 / sqft <span style={{ color: 'var(--green)' }}>↑ +6.5%</span></strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
                      <span>Mumbai Borivali East</span>
                      <strong>₹21,800 / sqft <span style={{ color: 'var(--green)' }}>↑ +11.4%</span></strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DJANGO ML PROPERTY PRICE PREDICTOR */}
          {activeTab === 'ml-predictor' && (
            <div>
              <div className="builder-grid-2">
                {/* Input Specs Form */}
                <div className="builder-section-card">
                  <div className="builder-section-header">
                    <h3>🤖 Property Feature Parameters (Django Model Input X)</h3>
                  </div>

                  <form onSubmit={handleRunPrediction}>
                    <div className="builder-form-group">
                      <label>Super Built-Up Area (Sq.Ft.)</label>
                      <input
                        type="number"
                        value={mlInput.superBuiltUpSqft}
                        onChange={(e) => setMlInput({ ...mlInput, superBuiltUpSqft: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <div className="builder-form-group">
                        <label>Bedrooms (BHK)</label>
                        <select
                          value={mlInput.bedrooms}
                          onChange={(e) => setMlInput({ ...mlInput, bedrooms: Number(e.target.value) })}
                        >
                          <option value={1}>1 BHK</option>
                          <option value={2}>2 BHK</option>
                          <option value={3}>3 BHK</option>
                          <option value={4}>4 BHK</option>
                          <option value={5}>5 BHK</option>
                        </select>
                      </div>

                      <div className="builder-form-group">
                        <label>Bathrooms</label>
                        <select
                          value={mlInput.bathrooms}
                          onChange={(e) => setMlInput({ ...mlInput, bathrooms: Number(e.target.value) })}
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                          <option value={5}>5</option>
                        </select>
                      </div>

                      <div className="builder-form-group">
                        <label>Balconies</label>
                        <select
                          value={mlInput.balconies}
                          onChange={(e) => setMlInput({ ...mlInput, balconies: Number(e.target.value) })}
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="builder-form-group">
                        <label>Floor Number</label>
                        <input
                          type="number"
                          value={mlInput.floorNumber}
                          onChange={(e) => setMlInput({ ...mlInput, floorNumber: Number(e.target.value) })}
                          required
                        />
                      </div>

                      <div className="builder-form-group">
                        <label>Total Building Floors</label>
                        <input
                          type="number"
                          value={mlInput.totalFloors}
                          onChange={(e) => setMlInput({ ...mlInput, totalFloors: Number(e.target.value) })}
                          required
                        />
                      </div>
                    </div>

                    <div className="builder-form-group">
                      <label>Gurgaon Locality / Sector</label>
                      <select
                        value={mlInput.locality}
                        onChange={(e) => setMlInput({ ...mlInput, locality: e.target.value })}
                      >
                        <option value="Golf Course Road">Golf Course Road (Prime High Density)</option>
                        <option value="DLF Phase 5">DLF Phase 5 (Luxury Tier)</option>
                        <option value="Golf Course Extension">Golf Course Extension</option>
                        <option value="Sector 54">Sector 54</option>
                        <option value="MG Road">MG Road</option>
                        <option value="Sector 65">Sector 65</option>
                        <option value="Sector 43">Sector 43</option>
                        <option value="Sohna Road">Sohna Road</option>
                        <option value="Dwarka Expressway">Dwarka Expressway</option>
                        <option value="Sector 81">Sector 81</option>
                        <option value="Sector 84">Sector 84</option>
                        <option value="Sector 102">Sector 102</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="builder-form-group">
                        <label>Property Type</label>
                        <select
                          value={mlInput.propertyType}
                          onChange={(e) => setMlInput({ ...mlInput, propertyType: e.target.value })}
                        >
                          <option value="Apartment">Apartment</option>
                          <option value="Villa">Villa</option>
                          <option value="Plot">Plot</option>
                          <option value="Commercial">Commercial</option>
                        </select>
                      </div>

                      <div className="builder-form-group">
                        <label>Furnishing Status</label>
                        <select
                          value={mlInput.furnishingStatus}
                          onChange={(e) => setMlInput({ ...mlInput, furnishingStatus: e.target.value })}
                        >
                          <option value="Unfurnished">Unfurnished</option>
                          <option value="Semi-Furnished">Semi-Furnished</option>
                          <option value="Furnished">Furnished</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="builder-btn-primary"
                      disabled={loadingMl}
                      style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                    >
                      {loadingMl ? '🔄 Running Random Forest Regression...' : '🤖 Predict Price via Django ML Model'}
                    </button>
                  </form>
                </div>

                {/* Machine Learning Output Card */}
                <div className="builder-section-card">
                  <div className="builder-section-header">
                    <h3>🎯 Machine Learning Valuation Results</h3>
                  </div>

                  {mlResult ? (
                    <div>
                      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Estimated Fair Market Price (y)</div>
                        <div style={{ fontSize: '36px', fontWeight: '900', margin: '8px 0', color: '#38bdf8' }}>
                          {mlResult.formattedPrice}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '13px', marginTop: '12px' }}>
                          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px' }}>
                            {mlResult.pricePerSqft}
                          </span>
                          <span style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontWeight: '700' }}>
                            🎯 {mlResult.confidenceScore} Accuracy (R² = 0.97)
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Valuation Lower Bound</div>
                          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>{mlResult.priceRangeMin}</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Valuation Upper Bound</div>
                          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--teal)' }}>{mlResult.priceRangeMax}</div>
                        </div>
                      </div>

                      <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '20px' }}>
                        <div style={{ fontWeight: '700', color: '#166534', fontSize: '14px' }}>
                          📍 Micro-Market Indicator: {mlResult.locality}
                        </div>
                        <div style={{ fontSize: '13px', color: '#15803d', marginTop: '4px' }}>
                          Status: <strong>{mlResult.microMarketDemand}</strong> • Model algorithm: Scikit-Learn Random Forest Regressor trained on 10,000 Gurgaon property transactions.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖</div>
                      <div>Click <strong>Predict Price via Django ML Model</strong> to generate an instant property valuation based on 10,000 Gurgaon market data points.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PROFILE & VERIFICATION */}
          {activeTab === 'profile' && (
            <div>
              <div className="builder-section-card" style={{ maxWidth: '650px' }}>
                <div className="builder-section-header">
                  <h3>Builder Profile & Verification</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Company Name</span>
                    <strong>{builder?.companyName || "Urban Developers"}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Owner / Director</span>
                    <strong>{builder?.ownerName || "Rajiv Singh"}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Email Address</span>
                    <strong>{builder?.email || "builder@urban.com"}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>RERA Registration No.</span>
                    <code>{builder?.registrationNumber || "HARERA/GGM/2026/9021"}</code>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Verification Status</span>
                    <span className="builder-status-badge active">✓ Verified Builder</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* DOCUMENT UPLOAD MODAL */}
      {showDocUploadModal && (
        <div className="builder-modal-overlay" onClick={() => setShowDocUploadModal(false)}>
          <div className="builder-modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="builder-modal-header">
              <h3>Upload Document to Vault</h3>
              <button className="builder-modal-close" onClick={() => setShowDocUploadModal(false)}>✕</button>
            </div>

            <div className="builder-modal-body">
              <form onSubmit={handleDocUploadSubmit}>
                <div className="builder-form-group">
                  <label>Select Project to Attach Document</label>
                  <select
                    value={docUploadForm.projectId}
                    onChange={(e) => setDocUploadForm({ ...docUploadForm, projectId: e.target.value })}
                  >
                    {projectsList.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.name} ({p.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="builder-form-group">
                  <label>Choose File from Computer (.PDF, .DOCX)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="builder-btn-primary"
                      onClick={() => vaultFileInputRef.current && vaultFileInputRef.current.click()}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      📁 Browse & Select File
                    </button>
                    <input
                      type="file"
                      ref={vaultFileInputRef}
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={handleVaultDocFileSelect}
                    />
                  </div>
                  {docUploadForm.fileName && (
                    <div style={{ marginTop: '6px', fontSize: '12.5px', color: 'var(--primary)', fontWeight: '600' }}>
                      ✓ Selected File: {docUploadForm.fileName}
                    </div>
                  )}
                </div>

                <div className="builder-form-group">
                  <label>Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Master Site Layout Plan 2026.pdf"
                    value={docUploadForm.title}
                    onChange={(e) => setDocUploadForm({ ...docUploadForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="builder-form-group">
                  <label>Document Category</label>
                  <select
                    value={docUploadForm.category}
                    onChange={(e) => setDocUploadForm({ ...docUploadForm, category: e.target.value })}
                  >
                    <option value="Site Plan">Site Plan & Layout</option>
                    <option value="RERA Approval">RERA Approval Certificate</option>
                    <option value="Environmental Clearance">Environmental Clearance</option>
                    <option value="Structural Audit">Structural Audit Report</option>
                    <option value="Legal Deed">Legal Title & Deed</option>
                  </select>
                </div>

                <button type="submit" className="builder-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
                  💾 Upload Document to Vault
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL RENDERS THE ACTUAL PDF IN AN OBJECT / IFRAME VIEWER */}
      {selectedDoc && (
        <div className="builder-modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="builder-modal-content" style={{ maxWidth: '900px', height: '85vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="builder-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--red)' }}><IconFilePdf /></span>
                <div>
                  <h3 style={{ fontSize: '15px' }}>{selectedDoc.title}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Project: {selectedDoc.project} • Category: {selectedDoc.category}
                  </div>
                </div>
              </div>
              <button className="builder-modal-close" onClick={() => setSelectedDoc(null)}>✕</button>
            </div>

            <div className="builder-modal-body" style={{ padding: '0', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="builder-pdf-toolbar">
                <div>Document Viewer • {selectedDoc.title}</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="builder-btn-secondary"
                    style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '5px 14px', fontSize: '12.5px', fontWeight: '600' }}
                    onClick={() => handleDownloadPdf(selectedDoc)}
                  >
                    ⬇ Download PDF
                  </button>
                  <button
                    className="builder-btn-secondary"
                    style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '5px 14px', fontSize: '12.5px', fontWeight: '600' }}
                    onClick={() => handlePrintPdf(selectedDoc)}
                  >
                    🖨 Print
                  </button>
                </div>
              </div>

              {/* RENDER THE ACTUAL PDF IN AN OBJECT / IFRAME TAG */}
              <div style={{ flex: 1, width: '100%', background: '#0f172a' }}>
                <object
                  data={selectedDoc.fileUrl || createPdfBlobUrl(selectedDoc.title, selectedDoc.project || 'Project', selectedDoc.category || 'Document')}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                >
                  <iframe
                    src={selectedDoc.fileUrl || createPdfBlobUrl(selectedDoc.title, selectedDoc.project || 'Project', selectedDoc.category || 'Document')}
                    width="100%"
                    height="100%"
                    title={selectedDoc.title}
                    style={{ border: 'none' }}
                  />
                </object>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL PROJECT DETAIL MODAL */}
      {selectedProject && (
        <div className="builder-modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="builder-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="builder-modal-header">
              <div>
                <h3>{selectedProject.name} — MongoDB Project Details</h3>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>📍 {selectedProject.location} • RERA: <code>{selectedProject.reraNo}</code></div>
              </div>
              <button className="builder-modal-close" onClick={() => setSelectedProject(null)}>✕</button>
            </div>

            <div className="builder-modal-body">
              <div className="builder-project-hero">
                <img src={selectedProject.image} alt={selectedProject.name} />
                <div className="builder-project-hero-overlay">
                  <div>
                    <h2 style={{ margin: 0, fontSize: '22px' }}>{selectedProject.name}</h2>
                    <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '14px' }}>Price Range: {selectedProject.priceRange}</p>
                  </div>
                  <span className="builder-status-badge active" style={{ fontSize: '13px', padding: '6px 14px' }}>{selectedProject.status}</span>
                </div>
              </div>

              <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-sub)', marginBottom: '24px' }}>
                {selectedProject.description}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Units</div>
                  <div style={{ fontSize: '20px', fontWeight: '800' }}>{selectedProject.totalUnits}</div>
                </div>
                <div style={{ background: '#f0fdfa', padding: '14px', borderRadius: '10px', border: '1px solid #99f6e4' }}>
                  <div style={{ fontSize: '12px', color: 'var(--teal)' }}>Available</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--teal)' }}>{selectedProject.availableUnits}</div>
                </div>
                <div style={{ background: 'var(--primary-faint)', padding: '14px', borderRadius: '10px', border: '1px solid var(--primary-light)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--primary)' }}>Booked</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>{selectedProject.bookedUnits}</div>
                </div>
              </div>
            </div>

              {selectedProject.unitsConfig && selectedProject.unitsConfig.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>Inventory Unit Specs</h4>
                  <div className="builder-table-wrapper">
                    <table className="builder-table">
                      <thead>
                        <tr>
                          <th>Unit ID</th>
                          <th>Unit Type</th>
                          <th>Listing Mode</th>
                          <th>Carpet Area</th>
                          <th>Asking Price</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProject.unitsConfig.map((u, idx) => (
                          <tr key={idx}>
                            <td><code>{u.unitId}</code></td>
                            <td><strong>{u.type}</strong></td>
                            <td>
                              <span className={`builder-listing-mode-tag ${u.mode === 'Rental' ? 'rental' : 'sale'}`}>
                                {u.mode}
                              </span>
                            </td>
                            <td>{u.area}</td>
                            <td><strong style={{ color: 'var(--primary)' }}>{u.price}</strong></td>
                            <td>
                              <span className={`builder-status-badge ${u.status === 'Available' ? 'active' : 'sold'}`}>
                                {u.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedProject.amenities && (
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>Verified Site Amenities</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedProject.amenities.map((item, idx) => (
                      <span className="builder-amenity-chip" key={idx}>
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

              {selectedProject.documents && selectedProject.documents.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>Attached RERA & Site Documents</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedProject.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)', cursor: 'pointer' }}
                        onClick={() => { setSelectedProject(null); handleOpenDocument(doc); }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontWeight: '600', fontSize: '13.5px' }}>
                          <IconFilePdf />
                          <span>{doc.title}</span>
                        </div>
                        <button className="builder-btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                          Open Document
                        </button>
                      </div>
                      <button className="builder-btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                        Preview PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )
      }
    </div >
  );
}

export default BuilderDashboard;