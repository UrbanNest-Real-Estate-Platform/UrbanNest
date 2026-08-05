import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './BuilderDashboard.css';

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
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
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

/* ─── MOCK DATA ─── */
const INITIAL_PROJECTS = [
  {
    id: 'proj_dlf_01',
    name: 'DLF Ultima',
    location: 'Sector 81, Gurgaon',
    totalUnits: 120,
    availableUnits: 28,
    bookedUnits: 72,
    auctionUnits: 20,
    priceRange: '₹1.8 Cr - ₹3.5 Cr',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=380&fit=crop&auto=format',
    reraNo: 'RC/REP/HARERA/GGM/2021/412',
    status: 'Active',
    description: 'DLF Ultima is a flagship luxury residential complex spread across 22 acres with expansive green landscapes, double-height entrance lobbies, and smart home automation.',
    amenities: ['Infinity Swimming Pool', 'Clubhouse & Spa', '24/7 Security & CCTV', 'Vastu Compliant', 'EV Charging Bays', 'Sky Lounge'],
    unitsConfig: [
      { unitId: 'u101', type: '3BHK Luxury Suite', mode: 'Direct Sale', area: '2,100 sqft', price: '₹1.85 Cr', reservePrice: '₹1.75 Cr', status: 'Available' },
      { unitId: 'u102', type: '4BHK Grand Duplex', mode: 'Live Auction', area: '3,400 sqft', price: '₹2.90 Cr', reservePrice: '₹2.70 Cr', status: 'Auctioning' },
      { unitId: 'u103', type: 'Sky Penthouse', mode: 'Rental', area: '5,200 sqft', price: '₹1,50,000/mo', reservePrice: 'N/A', status: 'Available' }
    ],
    documents: [
      { id: 'd1', title: 'DLF Ultima - Master Site Layout Plan.pdf', category: 'Site Plan', status: 'Verified', date: '2026-06-12' },
      { id: 'd2', title: 'HARERA Approval Certificate_2026.pdf', category: 'RERA Approval', status: 'Verified', date: '2026-05-18' }
    ]
  },
  {
    id: 'proj_godrej_02',
    name: 'Godrej Woods',
    location: 'Sector 43, Noida',
    totalUnits: 90,
    availableUnits: 15,
    bookedUnits: 65,
    auctionUnits: 10,
    priceRange: '₹2.2 Cr - ₹4.1 Cr',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=380&fit=crop&auto=format',
    reraNo: 'UPRERAPRJ771649',
    status: 'Active',
    description: 'Godrej Woods offers resort-style living surrounded by an urban forest with over 600 trees, an elevated walkway, and private splash pools.',
    amenities: ['Urban Forest & Walkway', 'Temperature Controlled Pool', 'Sports Complex', 'High-Speed Elevators', 'Concierge Service'],
    unitsConfig: [
      { unitId: 'u201', type: '2BHK Forest View', mode: 'Direct Sale', area: '1,250 sqft', price: '₹2.20 Cr', reservePrice: '₹2.10 Cr', status: 'Booked' },
      { unitId: 'u202', type: '3BHK Sanctuary Flat', mode: 'Live Auction', area: '2,050 sqft', price: '₹3.10 Cr', reservePrice: '₹2.95 Cr', status: 'Auctioning' }
    ],
    documents: [
      { id: 'd3', title: 'Godrej Woods Environmental Clearance.pdf', category: 'Environmental', status: 'Verified', date: '2026-07-02' }
    ]
  },
  {
    id: 'proj_oberoi_03',
    name: 'Oberoi Sky City',
    location: 'Borivali East, Mumbai',
    totalUnits: 150,
    availableUnits: 42,
    bookedUnits: 98,
    auctionUnits: 10,
    priceRange: '₹3.1 Cr - ₹6.8 Cr',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=380&fit=crop&auto=format',
    reraNo: 'P51800003582',
    status: 'Active',
    description: 'Oberoi Sky City stands tall overlooking the Sanjay Gandhi National Park, blending architectural elegance with international luxury lifestyle.',
    amenities: ['Panoramic Park Views', 'Olympics-size Pool', 'Private Theater', 'Helipad Access', 'Multilevel Parking'],
    unitsConfig: [
      { unitId: 'u301', type: '3BHK Sea-View Tower', mode: 'Direct Sale', area: '1,950 sqft', price: '₹3.10 Cr', reservePrice: '₹3.00 Cr', status: 'Available' },
      { unitId: 'u302', type: 'Presidential Penthouse', mode: 'Live Auction', area: '6,100 sqft', price: '₹6.80 Cr', reservePrice: '₹6.50 Cr', status: 'Auctioning' }
    ],
    documents: [
      { id: 'd4', title: 'Oberoi Sky City Structural Audit Report.pdf', category: 'Structural Audit', status: 'Under Review', date: '2026-07-28' }
    ]
  },
];

const INITIAL_DOCUMENTS = [
  { id: 'd1', title: 'DLF Ultima - Master Site Layout Plan.pdf', project: 'DLF Ultima', category: 'Site Plan', status: 'Verified', date: '2026-06-12' },
  { id: 'd2', title: 'HARERA Approval Certificate_2026.pdf', project: 'DLF Ultima', category: 'RERA Approval', status: 'Verified', date: '2026-05-18' },
  { id: 'd3', title: 'Godrej Woods Environmental Clearance.pdf', project: 'Godrej Woods', category: 'Environmental', status: 'Verified', date: '2026-07-02' },
  { id: 'd4', title: 'Oberoi Sky City Structural Audit Report.pdf', project: 'Oberoi Sky City', category: 'Structural Audit', status: 'Under Review', date: '2026-07-28' },
];

const INITIAL_BIDS = [
  { id: 'b1', unit: 'DLF Ultima - Unit 1402 (4BHK)', buyer: 'rajesh.kumar@gmail.com', amount: '₹2,95,00,000', reservePrice: '₹2,70,00,000', reserveMet: true, status: 'Active Bid', antiSnipingActive: true, time: '14 mins ago' },
  { id: 'b2', unit: 'Godrej Woods - Villa 08', buyer: 'priya.sharma@yahoo.com', amount: '₹3,80,00,000', reservePrice: '₹4,00,00,000', reserveMet: false, status: 'Active Bid', antiSnipingActive: false, time: '1 hour ago' },
  { id: 'b3', unit: 'Oberoi Sky City - Penthouse 3001', buyer: 'vikram.mehta@corp.com', amount: '₹6,65,00,000', reservePrice: '₹6,50,00,000', reserveMet: true, status: 'Pending Review', antiSnipingActive: true, time: '3 hours ago' },
];

const INITIAL_TRANSFERS = [
  { id: 't1', unit: 'DLF Ultima - Unit 904', buyerEmail: 'anand.verma@gmail.com', finalPrice: '₹2,10,00,000', date: '2026-08-02', status: 'Handshake Pending' },
  { id: 't2', unit: 'Godrej Woods - Unit 302', buyerEmail: 'sunita.rao@outlook.com', finalPrice: '₹2,45,00,000', date: '2026-07-25', status: 'Transfer Completed' },
];

function BuilderDashboard() {
  const navigate = useNavigate();

  // Load authenticated builder from localStorage safely
  const [builder, setBuilder] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Active View Tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'RERA Approval',
    project: ''
  });

  // Interactive Form State for New Project Listing
  const [newProject, setNewProject] = useState({
    name: '',
    location: '',
    totalUnits: '',
    priceRange: '',
    reraNo: '',
    listingMode: 'Direct Sale', // Direct Sale, Rental, Live Auction
    reservePrice: ''
  });

  // Ownership Transfer Form State
  const [transferForm, setTransferForm] = useState({
    unitName: '',
    buyerEmail: '',
    finalPrice: ''
  });

  // State Collections
  const [projectsList, setProjectsList] = useState(INITIAL_PROJECTS);
  const [docVault, setDocVault] = useState(INITIAL_DOCUMENTS);
  const [bidsQueue, setBidsQueue] = useState(INITIAL_BIDS);
  const [transferHistory, setTransferHistory] = useState(INITIAL_TRANSFERS);

  useEffect(() => {
    if (!builder) {
      setBuilder({
        companyName: "DLF Urban Developers",
        ownerName: "Rajiv Singh",
        email: "contact@dlfurban.com",
        registrationNumber: "HARERA/GGM/2026/9021",
      });
    }
  }, [builder]);

  // Handle Logout securely
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.info("Logged out successfully");
    navigate("/login/builder");
  };

  // Handle New Project Submission
  const handleCreateProject = (e) => {
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
      auctionUnits: newProject.listingMode === 'Live Auction' ? 10 : 0,
      priceRange: newProject.priceRange || '₹1.5 Cr - ₹3.0 Cr',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=380&fit=crop&auto=format',
      reraNo: newProject.reraNo || 'HARERA/PENDING/2026',
      status: 'Active',
      description: `New builder development under project hierarchy (${newProject.name}). Configured for ${newProject.listingMode}.`,
      amenities: ['Clubhouse & Pool', '24/7 Security & CCTV', 'Vastu Compliant', 'EV Charging'],
      unitsConfig: [
        {
          unitId: `u_${Date.now()}`,
          type: '3BHK Premium Suite',
          mode: newProject.listingMode,
          area: '1,850 sqft',
          price: newProject.priceRange || '₹1.80 Cr',
          reservePrice: newProject.reservePrice || '₹1.70 Cr',
          status: 'Available'
        }
      ],
      documents: []
    };

    setProjectsList([created, ...projectsList]);
    setNewProject({ name: '', location: '', totalUnits: '', priceRange: '', reraNo: '', listingMode: 'Direct Sale', reservePrice: '' });
    toast.success(`Project "${created.name}" created under Master Hierarchy!`);
    setActiveTab('projects');
  };

  // Handle Manual Ownership Transfer Request Trigger
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
    toast.success(`Ownership transfer handshake sent to ${newTransfer.buyerEmail}!`);
  };

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
              <span>Lead & Bid Queue</span>
              <span className="builder-nav-badge amber">{bidsQueue.length}</span>
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

        {/* Sidebar Footer with Logged In Builder Info */}
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
        {/* Top Header Navbar */}
        <header className="builder-top-header">
          <div className="builder-header-title">
            <h2>
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'projects' && 'My Developments & Inventory'}
              {activeTab === 'add-project' && 'Add New Project / Bulk Import'}
              {activeTab === 'document-vault' && 'RERA & Document Vault'}
              {activeTab === 'lead-queue' && 'Lead & Bid Queue'}
              {activeTab === 'transfer-workflow' && 'Ownership Transfer Workflow'}
              {activeTab === 'sales-analytics' && 'Sales Analytics & Demand'}
              {activeTab === 'profile' && 'Builder Profile & Verification'}
            </h2>
          </div>

          <div className="builder-header-actions">
            <div className="builder-header-search">
              <IconSearch />
              <input type="text" placeholder="Search projects, bids, docs..." />
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
              {/* Quick Summary Stat Cards */}
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
                    <span className="builder-stat-label">Active Auction Bids</span>
                    <div className="builder-stat-icon amber">🔨</div>
                  </div>
                  <div className="builder-stat-value">42 Bids</div>
                  <span className="builder-stat-trend up">↑ 8 closing today</span>
                </div>

                <div className="builder-stat-card">
                  <div className="builder-stat-top">
                    <span className="builder-stat-label">Revenue Pipeline</span>
                    <div className="builder-stat-icon green">💰</div>
                  </div>
                  <div className="builder-stat-value">₹124.5 Cr</div>
                  <span className="builder-stat-trend up">↑ Verified Pipeline</span>
                </div>
              </div>

              {/* Recent Active Projects Snapshot */}
              <div className="builder-section-card">
                <div className="builder-section-header">
                  <h3>Active Developments & Inventory Hierarchy</h3>
                  <button className="builder-btn-secondary" onClick={() => setActiveTab('projects')}>
                    View All Projects ({projectsList.length})
                  </button>
                </div>

                <div className="builder-table-wrapper">
                  <table className="builder-table">
                    <thead>
                      <tr>
                        <th>Master Project ID</th>
                        <th>Project Name</th>
                        <th>Location</th>
                        <th>Total Units</th>
                        <th>Available</th>
                        <th>Booked</th>
                        <th>In Auction</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectsList.map((p) => (
                        <tr key={p.id} className="builder-clickable-row" onClick={() => setSelectedProject(p)}>
                          <td><code style={{ fontSize: '11px', background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px' }}>{p.id}</code></td>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.location}</td>
                          <td>{p.totalUnits} Units</td>
                          <td><span style={{ color: 'var(--teal)', fontWeight: '600' }}>{p.availableUnits}</span></td>
                          <td>{p.bookedUnits}</td>
                          <td><span style={{ color: 'var(--amber)', fontWeight: '600' }}>{p.auctionUnits}</span></td>
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

              {/* Quick Actions & Recent Bids */}
              <div className="builder-grid-2">
                <div className="builder-section-card">
                  <div className="builder-section-header">
                    <h3>Live Auction Stream & Bids</h3>
                    <button className="builder-btn-secondary" onClick={() => setActiveTab('lead-queue')}>Queue</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {bidsQueue.map((b) => (
                      <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13.5px' }}>{b.unit}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Buyer: {b.buyer} • {b.time}</div>
                          {b.antiSnipingActive && (
                            <span className="builder-antisniping-badge">⏱️ Anti-Sniping Active (+2m)</span>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '14px' }}>{b.amount}</div>
                          <span className={`builder-reserve-indicator ${b.reserveMet ? 'met' : 'pending'}`}>
                            {b.reserveMet ? 'Reserve Met ✓' : 'Reserve Pending ⚠️'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="builder-section-card">
                  <div className="builder-section-header">
                    <h3>Ownership Handshake Transfers</h3>
                    <button className="builder-btn-secondary" onClick={() => setActiveTab('transfer-workflow')}>Initiate Transfer</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {transferHistory.map((t) => (
                      <div key={t.id} style={{ padding: '12px', background: '#eef2ff', borderRadius: '8px', border: '1px solid var(--primary-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '13.5px' }}>
                          <span>{t.unit}</span>
                          <span style={{ color: 'var(--primary)' }}>{t.finalPrice}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '4px' }}>
                          Buyer Email: <strong>{t.buyerEmail}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Date: {t.date}</span>
                          <span className="builder-status-badge review">{t.status}</span>
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
                <h3>My Listed Projects & Master Hierarchy ({projectsList.length})</h3>
                <button className="builder-btn-primary" onClick={() => setActiveTab('add-project')}>
                  <IconPlus /> Add Project
                </button>
              </div>

              <div className="builder-grid-2">
                {projectsList.map((p) => (
                  <div
                    className="builder-project-card"
                    key={p.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedProject(p)}
                  >
                    <img src={p.image} alt={p.name} className="builder-project-img" />
                    <div className="builder-project-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="builder-project-title">{p.name}</div>
                        <span className="builder-status-badge active">{p.status}</span>
                      </div>
                      <div className="builder-project-loc">📍 {p.location} • Master ID: <code>{p.id}</code></div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                        <span>Inventory Status</span>
                        <span><strong>{p.bookedUnits + p.auctionUnits}</strong> / {p.totalUnits} Allocated</span>
                      </div>

                      <div className="builder-progress-bar">
                        <div
                          className="builder-progress-fill"
                          style={{ width: `${Math.round(((p.bookedUnits + p.auctionUnits) / p.totalUnits) * 100)}%` }}
                        ></div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '16px', textAlign: 'center' }}>
                        <div style={{ background: 'var(--bg-subtle)', padding: '8px', borderRadius: '6px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Available</div>
                          <div style={{ fontWeight: '700', color: 'var(--teal)' }}>{p.availableUnits}</div>
                        </div>
                        <div style={{ background: 'var(--bg-subtle)', padding: '8px', borderRadius: '6px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Booked</div>
                          <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{p.bookedUnits}</div>
                        </div>
                        <div style={{ background: 'var(--bg-subtle)', padding: '8px', borderRadius: '6px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Auctions</div>
                          <div style={{ fontWeight: '700', color: 'var(--amber)' }}>{p.auctionUnits}</div>
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
            </div>
          )}

          {/* TAB 3A: ADD NEW PROJECT / BULK IMPORT */}
          {activeTab === 'add-project' && (
            <div>
              <div className="builder-grid-2">
                {/* Manual Project Form */}
                <div className="builder-section-card">
                  <div className="builder-section-header">
                    <h3>Add New Project Listing (Multi-Mode)</h3>
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

                    <div className="builder-form-group">
                      <label>Listing Mode</label>
                      <select
                        value={newProject.listingMode}
                        onChange={(e) => setNewProject({ ...newProject, listingMode: e.target.value })}
                      >
                        <option value="Direct Sale">🏷️ Direct Sale (Fixed Asking Price)</option>
                        <option value="Rental">🔑 Rental (Monthly Rent & Deposit)</option>
                        <option value="Live Auction">🔨 Live Auction (Bidding Stream)</option>
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
                      <label>Asking / Starting Price (₹)</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹1.8 Cr - ₹3.5 Cr"
                        value={newProject.priceRange}
                        onChange={(e) => setNewProject({ ...newProject, priceRange: e.target.value })}
                      />
                    </div>

                    {newProject.listingMode === 'Live Auction' && (
                      <div className="builder-form-group">
                        <label>Confidential Reserve Price (₹)</label>
                        <input
                          type="text"
                          placeholder="e.g. ₹1.70 Cr"
                          value={newProject.reservePrice}
                          onChange={(e) => setNewProject({ ...newProject, reservePrice: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="builder-form-group">
                      <label>RERA Registration Number</label>
                      <input
                        type="text"
                        placeholder="e.g. HARERA/GGM/2026/412"
                        value={newProject.reraNo}
                        onChange={(e) => setNewProject({ ...newProject, reraNo: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="builder-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Publish Project Under Master Hierarchy
                    </button>
                  </form>
                </div>

                {/* Bulk Listing Import Dropzone */}
                <div className="builder-section-card">
                  <div className="builder-section-header">
                    <h3>Bulk Unit Listing Import</h3>
                  </div>

                  <div className="builder-upload-zone" onClick={() => toast.info("Select CSV / Excel file to import listings")}>
                    <div style={{ color: 'var(--primary)', marginBottom: '10px' }}>
                      <IconUpload />
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>Upload Bulk Unit Matrix (CSV / XLSX)</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Drag and drop your property matrix spreadsheet or click to browse.
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    💡 <strong>Blueprint Specification:</strong> Auto-assigns individual unit documents under master <code>projectId</code> (e.g., <em>Apex Heights</em> $\rightarrow$ <em>Unit 402</em>).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3B: RERA & DOCUMENT VAULT */}
          {activeTab === 'document-vault' && (
            <div>
              <div className="builder-section-header">
                <h3>RERA & Legal Document Vault</h3>
                <button className="builder-btn-primary" onClick={() => setShowUploadModal(true)}>
                  <IconUpload /> Upload Document
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
                          onClick={() => setSelectedDoc(doc)}
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
                              onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }}
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

          {/* TAB 4: LEAD & BID QUEUE */}
          {activeTab === 'lead-queue' && (
            <div>
              <div className="builder-section-header">
                <h3>Live Auction Bids Stream & Anti-Sniping Monitor</h3>
              </div>

              <div className="builder-section-card">
                <div className="builder-table-wrapper">
                  <table className="builder-table">
                    <thead>
                      <tr>
                        <th>Property Unit</th>
                        <th>Buyer Email</th>
                        <th>Highest Bid</th>
                        <th>Reserve Status</th>
                        <th>Anti-Sniping Protection</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bidsQueue.map((bid) => (
                        <tr key={bid.id}>
                          <td><strong>{bid.unit}</strong></td>
                          <td>{bid.buyer}</td>
                          <td><strong style={{ color: 'var(--primary)' }}>{bid.amount}</strong></td>
                          <td>
                            <span className={`builder-reserve-indicator ${bid.reserveMet ? 'met' : 'pending'}`}>
                              {bid.reserveMet ? 'Reserve Met ✓' : 'Reserve Pending ⚠️'}
                            </span>
                          </td>
                          <td>
                            {bid.antiSnipingActive ? (
                              <span className="builder-antisniping-badge">⏱️ Active (+2m on late bids)</span>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Standard Timer</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="builder-btn-primary"
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                              onClick={() => toast.success(`Accepted bid for ${bid.unit}`)}
                            >
                              Accept Bid
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
                        <option value="">-- Choose Booked / Auctioned Unit --</option>
                        <option value="DLF Ultima - Unit 1402">DLF Ultima - Unit 1402 (4BHK Duplex)</option>
                        <option value="Godrej Woods - Villa 08">Godrej Woods - Villa 08</option>
                        <option value="Oberoi Sky City - Penthouse 3001">Oberoi Sky City - Penthouse 3001</option>
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

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: '600' }}>
                        <span>Penthouse Suites (Auctioning)</span>
                        <span>94% Bid Conversion</span>
                      </div>
                      <div className="builder-progress-bar">
                        <div className="builder-progress-fill" style={{ width: '94%' }}></div>
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

      {/* ─── 4. PDF PREVIEW MODAL ─── */}
      {selectedDoc && (
        <div className="builder-modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="builder-modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
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

            <div className="builder-modal-body" style={{ padding: '0' }}>
              <div className="builder-pdf-toolbar">
                <div>Page 1 of 4 • Zoom 100%</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="builder-btn-secondary"
                    style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '4px 10px', fontSize: '12px' }}
                    onClick={() => toast.success(`Downloading ${selectedDoc.title}`)}
                  >
                    ⬇ Download PDF
                  </button>
                  <button
                    className="builder-btn-secondary"
                    style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '4px 10px', fontSize: '12px' }}
                    onClick={() => window.print()}
                  >
                    🖨 Print
                  </button>
                </div>
              </div>

              <div className="builder-pdf-canvas">
                <div className="builder-pdf-page">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '20px', letterSpacing: '1px' }}>STATE RERA COMPLIANCE AUTHORITY</h2>
                      <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#475569' }}>Official Verification & Approval Document</div>
                    </div>
                    <div className="builder-pdf-seal">
                      OFFICIAL<br />VERIFIED<br />RERA 2026
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', lineHeight: '1.8', color: '#334155' }}>
                    <p><strong>DOCUMENT TITLE:</strong> {selectedDoc.title}</p>
                    <p><strong>ASSOCIATED DEVELOPMENT:</strong> {selectedDoc.project}</p>
                    <p><strong>REGISTRATION CATEGORY:</strong> {selectedDoc.category}</p>
                    <p><strong>VERIFICATION DATE:</strong> {selectedDoc.date}</p>
                    <p><strong>STATUS:</strong> <span style={{ color: 'var(--teal)', fontWeight: 'bold' }}>{selectedDoc.status} & COMPLIANT</span></p>

                    <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px dashed #cbd5e1' }} />

                    <h4 style={{ margin: '12px 0 6px', fontSize: '14px', textTransform: 'uppercase' }}>1. Site Plan & Architectural Overview</h4>
                    <p style={{ margin: 0 }}>
                      This document certifies that the architectural structural layout and site specifications submitted for <strong>{selectedDoc.project}</strong> comply fully with National Building Code safety standards, environmental guidelines, and zoning regulations.
                    </p>

                    <div style={{ height: '140px', background: '#e2e8f0', border: '1px dashed #94a3b8', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '20px 0', padding: '16px' }}>
                      <div style={{ width: '100%', textAlign: 'center', color: '#475569', fontSize: '12px' }}>
                        📐 [ARCHITECTURAL BLUEPRINT & CAD SITE SCHEMATIC RENDERED HERE]
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', paddingTop: '16px', borderTop: '1px solid #cbd5e1' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Authorized Signatory</div>
                        <div style={{ fontWeight: 'bold', fontFamily: 'sans-serif' }}>RERA Competent Authority</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Digital Signature Hash</div>
                        <code style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 4px' }}>SHA256:9f8e7d6c5b4a321</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. FULL PROJECT DETAIL MODAL ─── */}
      {selectedProject && (
        <div className="builder-modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="builder-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="builder-modal-header">
              <div>
                <h3>{selectedProject.name} — Full Project Specs & Master Hierarchy</h3>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>📍 {selectedProject.location} • Master ID: <code>{selectedProject.id}</code> • RERA: <code>{selectedProject.reraNo}</code></div>
              </div>
              <button className="builder-modal-close" onClick={() => setSelectedProject(null)}>✕</button>
            </div>

            <div className="builder-modal-body">
              {/* Project Hero Banner */}
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

              {/* Quick Metrics Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px', textAlign: 'center' }}>
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
                <div style={{ background: '#fffbeb', padding: '14px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '12px', color: 'var(--amber)' }}>In Auction</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--amber)' }}>{selectedProject.auctionUnits}</div>
                </div>
              </div>

              {/* Unit Configurations & Inventory Matrix */}
              {selectedProject.unitsConfig && selectedProject.unitsConfig.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>Inventory Unit Matrix (Master ID: <code>{selectedProject.id}</code>)</h4>
                  <div className="builder-table-wrapper">
                    <table className="builder-table">
                      <thead>
                        <tr>
                          <th>Unit ID</th>
                          <th>Unit Type</th>
                          <th>Listing Mode</th>
                          <th>Carpet Area</th>
                          <th>Asking / Start Price</th>
                          <th>Reserve Price</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProject.unitsConfig.map((u, idx) => (
                          <tr key={idx}>
                            <td><code>{u.unitId}</code></td>
                            <td><strong>{u.type}</strong></td>
                            <td>
                              <span className={`builder-listing-mode-tag ${u.mode === 'Direct Sale' ? 'sale' : u.mode === 'Rental' ? 'rental' : 'auction'}`}>
                                {u.mode}
                              </span>
                            </td>
                            <td>{u.area}</td>
                            <td><strong style={{ color: 'var(--primary)' }}>{u.price}</strong></td>
                            <td><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{u.reservePrice}</span></td>
                            <td>
                              <span className={`builder-status-badge ${u.status === 'Available' ? 'active' : u.status === 'Auctioning' ? 'pending' : 'sold'}`}>
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

              {/* Verified Amenities */}
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
              )}

              {/* Attached RERA Documents */}
              {selectedProject.documents && selectedProject.documents.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>Attached RERA & Site Documents</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedProject.documents.map((doc) => (
                      <div
                        key={doc.id}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)', cursor: 'pointer' }}
                        onClick={() => { setSelectedProject(null); setSelectedDoc(doc); }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontWeight: '600', fontSize: '13.5px' }}>
                          <IconFilePdf />
                          <span>{doc.title}</span>
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
        </div>
      )}
      {/* ─── 6. UPLOAD DOCUMENT MODAL ─── */}
      {showUploadModal && (
        <div className="builder-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="builder-modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="builder-modal-header">
              <h3>Upload Document to RERA Vault</h3>
              <button className="builder-modal-close" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>

            <form onSubmit={handleDocUpload} className="builder-modal-body">
              <div className="builder-form-group">
                <label>Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master_Site_Plan_Phase1.pdf"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="builder-form-group">
                <label>Document Category</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                >
                  <option value="RERA Approval">📜 RERA Approval Certificate</option>
                  <option value="Site Plan">📐 Site Plan & Master Layout</option>
                  <option value="Environmental">🌿 Environmental Clearance</option>
                  <option value="Structural Audit">🏗️ Structural Audit Report</option>
                  <option value="Other">📄 Other Compliance Doc</option>
                </select>
              </div>

              <div className="builder-form-group">
                <label>Associated Project (Optional)</label>
                <select
                  value={uploadForm.project}
                  onChange={(e) => setUploadForm({ ...uploadForm, project: e.target.value })}
                >
                  <option value="">-- Select Project --</option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="builder-upload-zone" style={{ margin: '16px 0 20px', padding: '20px' }}>
                <IconUpload />
                <div style={{ fontWeight: '600', fontSize: '13px', marginTop: '6px' }}>Select PDF File from Computer</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Supported formats: PDF, DOCX (Max 15MB)</div>
              </div>

              <button type="submit" className="builder-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Submit Document for RERA Verification
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuilderDashboard;