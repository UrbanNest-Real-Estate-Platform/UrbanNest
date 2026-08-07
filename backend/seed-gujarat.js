/**
 * Gujarat / Ahmedabad seed script
 * Run once: node seed-gujarat.js   (or npm run seed:gujarat)
 *
 * Inserts sample Users, Builders, Projects, and Properties into MongoDB.
 * Default password for all accounts: 12345678
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Builder = require("./models/Builder");
const Project = require("./models/Project");
const Property = require("./models/Property");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/urbannest";
const DEFAULT_PASSWORD = "12345678";

// ─── Users ───────────────────────────────────────────────────────────────────

const USERS = [
  { name: "Rahul Mehta", email: "rahul.mehta@gmail.com", phoneNumber: "9876501001", cityOfResidence: "Ahmedabad" },
  { name: "Priya Shah", email: "priya.shah@gmail.com", phoneNumber: "9876501002", cityOfResidence: "Ahmedabad" },
  { name: "Karan Patel", email: "karan.patel@gmail.com", phoneNumber: "9876501003", cityOfResidence: "Gandhinagar" },
  { name: "Ananya Desai", email: "ananya.desai@gmail.com", phoneNumber: "9876501004", cityOfResidence: "Ahmedabad" },
  { name: "Vikram Solanki", email: "vikram.solanki@gmail.com", phoneNumber: "9876501005", cityOfResidence: "Surat" },
  { name: "Neha Joshi", email: "neha.joshi@gmail.com", phoneNumber: "9876501006", cityOfResidence: "Vadodara" },
  { name: "Amit Thakkar", email: "amit.thakkar@gmail.com", phoneNumber: "9876501007", cityOfResidence: "Ahmedabad" },
  { name: "Divya Modi", email: "divya.modi@gmail.com", phoneNumber: "9876501008", cityOfResidence: "Rajkot" },
];

// ─── Builders ────────────────────────────────────────────────────────────────

const BUILDERS = [
  {
    companyName: "Adani Realty",
    registrationNumber: "PR/GJ/AHMEDABAD/ADANI/2024/001",
    ownerName: "Rajesh Adani",
    contactPersonName: "Sanjay Verma",
    email: "projects@adanirealty.in",
    phoneNumber: "9825012001",
    websiteUrl: "https://www.adanirealty.com",
    officeAddress: "Adani House, Near Mithakhali Circle, Navrangpura, Ahmedabad - 380009",
    isVerified: true,
    documents: [
      { title: "Adani Realty RERA Certificate 2024.pdf", category: "RERA Approval", status: "Verified" },
      { title: "Shantigram Master Site Plan.pdf", category: "Site Plan", status: "Verified", project: "Adani Shantigram" },
    ],
  },
  {
    companyName: "Shivalik Group",
    registrationNumber: "PR/GJ/AHMEDABAD/SHIVALIK/2023/042",
    ownerName: "Harish Shah",
    contactPersonName: "Meera Patel",
    email: "info@shivalikgroup.com",
    phoneNumber: "9825012002",
    websiteUrl: "https://www.shivalikgroup.com",
    officeAddress: "Shivalik House, Ambawadi, Ahmedabad - 380015",
    isVerified: true,
    documents: [
      { title: "Shivalik Parkview RERA Approval.pdf", category: "RERA Approval", status: "Verified" },
    ],
  },
  {
    companyName: "Savvy Infrastructure",
    registrationNumber: "PR/GJ/AHMEDABAD/SAVVY/2022/118",
    ownerName: "Bhavesh Savani",
    contactPersonName: "Kunal Shah",
    email: "sales@savvyinfra.com",
    phoneNumber: "9825012003",
    websiteUrl: "https://www.savvyinfra.com",
    officeAddress: "Savvy Swaraj, SG Highway, Ahmedabad - 380054",
    isVerified: true,
    documents: [
      { title: "Swaraj Imperia Environmental Clearance.pdf", category: "Environmental", status: "Verified" },
    ],
  },
  {
    companyName: "Godrej Properties Ahmedabad",
    registrationNumber: "PR/GJ/AHMEDABAD/GODREJ/2025/007",
    ownerName: "Anil Godrej",
    contactPersonName: "Ritu Sharma",
    email: "ahmedabad@godrejproperties.com",
    phoneNumber: "9825012004",
    websiteUrl: "https://www.godrejproperties.com",
    officeAddress: "Godrej Garden City, Jagatpur, Ahmedabad - 382470",
    isVerified: true,
    documents: [
      { title: "Godrej Garden City RERA Certificate.pdf", category: "RERA Approval", status: "Verified" },
    ],
  },
];

// ─── Projects (Ahmedabad & Gujarat) ──────────────────────────────────────────

const PROJECTS = [
  {
    builderIndex: 0,
    name: "Adani Shantigram",
    location: "SG Highway, Near Vaishnodevi Circle, Ahmedabad",
    totalUnits: 2500,
    availableUnits: 420,
    bookedUnits: 2080,
    priceRange: "₹65 L - ₹2.8 Cr",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=380&fit=crop&auto=format",
    reraNo: "PR/GJ/AHMEDABAD/ADANI/2024/001",
    status: "Active",
    description: "India's largest integrated township spread across 600 acres with golf course, international school, and metro connectivity on SG Highway.",
    amenities: ["18-Hole Golf Course", "International School", "Metro Connectivity", "Clubhouse & Spa", "Cricket Academy", "Retail High Street"],
    unitsConfig: [
      { unitId: "AS-101", type: "2BHK Premium", mode: "Direct Sale", area: "1,050 sqft", price: "₹65 L", status: "Available" },
      { unitId: "AS-102", type: "3BHK Luxury", mode: "Direct Sale", area: "1,650 sqft", price: "₹1.10 Cr", status: "Available" },
      { unitId: "AS-103", type: "4BHK Penthouse", mode: "Direct Sale", area: "2,800 sqft", price: "₹2.80 Cr", status: "Booked" },
    ],
    documents: [
      { title: "Shantigram Master Layout Plan.pdf", category: "Site Plan", status: "Verified", date: "2024-03-15" },
      { title: "Gujarat RERA Registration Certificate.pdf", category: "RERA Approval", status: "Verified", date: "2024-01-10" },
    ],
  },
  {
    builderIndex: 1,
    name: "Shivalik Parkview",
    location: "Thaltej, Ahmedabad",
    totalUnits: 180,
    availableUnits: 35,
    bookedUnits: 145,
    priceRange: "₹85 L - ₹1.6 Cr",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=380&fit=crop&auto=format",
    reraNo: "PR/GJ/AHMEDABAD/SHIVALIK/2023/042",
    status: "Active",
    description: "Premium residential towers in Thaltej with panoramic city views, landscaped gardens, and proximity to corporate hubs.",
    amenities: ["Rooftop Infinity Pool", "Gym & Yoga Studio", "24/7 Security", "Power Backup", "Kids Play Area"],
    unitsConfig: [
      { unitId: "SP-201", type: "2BHK", mode: "Direct Sale", area: "1,100 sqft", price: "₹85 L", status: "Available" },
      { unitId: "SP-202", type: "3BHK", mode: "Direct Sale", area: "1,550 sqft", price: "₹1.25 Cr", status: "Available" },
      { unitId: "SP-203", type: "3BHK Corner", mode: "Rental", area: "1,600 sqft", price: "₹45,000/mo", status: "Rented" },
    ],
    documents: [
      { title: "Parkview Structural Audit Report.pdf", category: "Structural Audit", status: "Verified", date: "2025-06-01" },
    ],
  },
  {
    builderIndex: 2,
    name: "Savvy Swaraj Imperia",
    location: "South Bopal, Ahmedabad",
    totalUnits: 220,
    availableUnits: 58,
    bookedUnits: 162,
    priceRange: "₹55 L - ₹1.2 Cr",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=380&fit=crop&auto=format",
    reraNo: "PR/GJ/AHMEDABAD/SAVVY/2022/118",
    status: "Active",
    description: "Affordable luxury living in South Bopal with modern amenities and excellent connectivity to SG Highway and Bopal-Ghuma road.",
    amenities: ["Swimming Pool", "Multipurpose Hall", "Jogging Track", "Indoor Games", "Visitor Parking"],
    unitsConfig: [
      { unitId: "SSI-301", type: "2BHK", mode: "Direct Sale", area: "950 sqft", price: "₹55 L", status: "Available" },
      { unitId: "SSI-302", type: "3BHK", mode: "Direct Sale", area: "1,350 sqft", price: "₹90 L", status: "Available" },
    ],
    documents: [
      { title: "Swaraj Imperia RERA Certificate.pdf", category: "RERA Approval", status: "Verified", date: "2022-11-20" },
    ],
  },
  {
    builderIndex: 3,
    name: "Godrej Garden City",
    location: "Jagatpur, Ahmedabad",
    totalUnits: 800,
    availableUnits: 120,
    bookedUnits: 680,
    priceRange: "₹70 L - ₹2.2 Cr",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=380&fit=crop&auto=format",
    reraNo: "PR/GJ/AHMEDABAD/GODREJ/2025/007",
    status: "Active",
    description: "Godrej's flagship township on the banks of Sabarmati with green spaces, waterfront promenade, and world-class amenities.",
    amenities: ["Sabarmati Riverfront Access", "Organic Farming Zone", "Sports Academy", "Retail Boulevard", "Amphitheatre"],
    unitsConfig: [
      { unitId: "GGC-401", type: "2BHK Garden View", mode: "Direct Sale", area: "1,150 sqft", price: "₹70 L", status: "Available" },
      { unitId: "GGC-402", type: "3BHK River View", mode: "Direct Sale", area: "1,750 sqft", price: "₹1.45 Cr", status: "Available" },
      { unitId: "GGC-403", type: "4BHK Villa", mode: "Direct Sale", area: "3,200 sqft", price: "₹2.20 Cr", status: "Booked" },
    ],
    documents: [
      { title: "Garden City Environmental Clearance.pdf", category: "Environmental", status: "Verified", date: "2025-02-08" },
    ],
  },
  {
    builderIndex: 1,
    name: "Shivalik Edge",
    location: "Gota, Ahmedabad",
    totalUnits: 140,
    availableUnits: 42,
    bookedUnits: 98,
    priceRange: "₹48 L - ₹95 L",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=380&fit=crop&auto=format",
    reraNo: "PR/GJ/AHMEDABAD/SHIVALIK/2024/055",
    status: "Active",
    description: "Budget-friendly apartments in the fast-growing Gota area, ideal for young professionals and first-time buyers.",
    amenities: ["Community Hall", "Gymnasium", "CCTV Surveillance", "Rainwater Harvesting"],
    unitsConfig: [
      { unitId: "SE-501", type: "1BHK", mode: "Direct Sale", area: "650 sqft", price: "₹48 L", status: "Available" },
      { unitId: "SE-502", type: "2BHK", mode: "Direct Sale", area: "980 sqft", price: "₹72 L", status: "Available" },
    ],
    documents: [
      { title: "Shivalik Edge Site Plan.pdf", category: "Site Plan", status: "Verified", date: "2024-08-12" },
    ],
  },
  {
    builderIndex: 0,
    name: "Adani Westview",
    location: "Bodakdev, Ahmedabad",
    totalUnits: 95,
    availableUnits: 18,
    bookedUnits: 77,
    priceRange: "₹1.2 Cr - ₹2.5 Cr",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=380&fit=crop&auto=format",
    reraNo: "PR/GJ/AHMEDABAD/ADANI/2025/012",
    status: "Active",
    description: "Ultra-luxury high-rise in Bodakdev with smart home features, concierge service, and skyline views of Ahmedabad.",
    amenities: ["Smart Home Automation", "Concierge Desk", "Sky Lounge", "EV Charging", "Spa & Wellness Center"],
    unitsConfig: [
      { unitId: "AW-601", type: "3BHK Premium", mode: "Direct Sale", area: "1,900 sqft", price: "₹1.65 Cr", status: "Available" },
      { unitId: "AW-602", type: "4BHK Duplex", mode: "Direct Sale", area: "3,100 sqft", price: "₹2.50 Cr", status: "Booked" },
    ],
    documents: [
      { title: "Westview RERA Certificate.pdf", category: "RERA Approval", status: "Verified", date: "2025-04-22" },
    ],
  },
];

// ─── Properties (mostly Ahmedabad, some Gujarat cities) ────────────────────────

const PROPERTY_TEMPLATES = [
  // Ahmedabad - SG Highway & West
  { title: "Spacious 3BHK in Prahlad Nagar", locality: "Prahlad Nagar", city: "Ahmedabad", state: "Gujarat", zipCode: "380015", lat: 23.0118, lng: 72.5078, propertyType: "Apartment", listingType: "sell", totalPrice: 12500000, areaSqft: 1650, bedrooms: 3, bathrooms: 3, furnishingStatus: "Semi-Furnished", yearBuilt: 2019, projectIndex: null },
  { title: "2BHK Apartment near Vastrapur Lake", locality: "Vastrapur", city: "Ahmedabad", state: "Gujarat", zipCode: "380015", lat: 23.0395, lng: 72.5240, propertyType: "Apartment", listingType: "rent", totalPrice: 28000, areaSqft: 1100, bedrooms: 2, bathrooms: 2, furnishingStatus: "Furnished", yearBuilt: 2020, securityDeposit: 84000, maintenance: 3500, projectIndex: null },
  { title: "Luxury Villa in South Bopal", locality: "South Bopal", city: "Ahmedabad", state: "Gujarat", zipCode: "380058", lat: 23.0180, lng: 72.4680, propertyType: "Villa", listingType: "sell", totalPrice: 28500000, areaSqft: 3200, bedrooms: 4, bathrooms: 4, furnishingStatus: "Unfurnished", yearBuilt: 2022, isNegotiable: true, projectIndex: 2 },
  { title: "1BHK Starter Home in Gota", locality: "Gota", city: "Ahmedabad", state: "Gujarat", zipCode: "382481", lat: 23.0960, lng: 72.5380, propertyType: "Apartment", listingType: "sell", totalPrice: 4200000, areaSqft: 650, bedrooms: 1, bathrooms: 1, furnishingStatus: "Unfurnished", yearBuilt: 2023, projectIndex: 4 },
  { title: "Commercial Office Space in Navrangpura", locality: "Navrangpura", city: "Ahmedabad", state: "Gujarat", zipCode: "380009", lat: 23.0360, lng: 72.5610, propertyType: "Commercial", listingType: "rent", totalPrice: 85000, areaSqft: 1800, bedrooms: 0, bathrooms: 2, furnishingStatus: "Semi-Furnished", yearBuilt: 2018, securityDeposit: 255000, maintenance: 12000, projectIndex: null },
  { title: "4BHK Penthouse in Bodakdev", locality: "Bodakdev", city: "Ahmedabad", state: "Gujarat", zipCode: "380054", lat: 23.0430, lng: 72.5140, propertyType: "Apartment", listingType: "sell", totalPrice: 24500000, areaSqft: 2800, bedrooms: 4, bathrooms: 4, furnishingStatus: "Furnished", yearBuilt: 2021, projectIndex: 5 },
  { title: "Residential Plot in Shela", locality: "Shela", city: "Ahmedabad", state: "Gujarat", zipCode: "380058", lat: 23.0050, lng: 72.4450, propertyType: "Plot", listingType: "sell", totalPrice: 7500000, areaSqft: 2400, bedrooms: 0, bathrooms: 0, furnishingStatus: "Unfurnished", yearBuilt: null, isNegotiable: true, projectIndex: null },
  { title: "3BHK in Adani Shantigram Township", locality: "SG Highway", city: "Ahmedabad", state: "Gujarat", zipCode: "382421", lat: 23.0469, lng: 72.5089, propertyType: "Apartment", listingType: "sell", totalPrice: 11000000, areaSqft: 1650, bedrooms: 3, bathrooms: 3, furnishingStatus: "Semi-Furnished", yearBuilt: 2023, projectIndex: 0 },
  { title: "2BHK for Rent in Satellite", locality: "Satellite", city: "Ahmedabad", state: "Gujarat", zipCode: "380015", lat: 22.9980, lng: 72.5232, propertyType: "Apartment", listingType: "rent", totalPrice: 22000, areaSqft: 1050, bedrooms: 2, bathrooms: 2, furnishingStatus: "Semi-Furnished", yearBuilt: 2017, securityDeposit: 66000, maintenance: 2800, projectIndex: null },
  { title: "Duplex Apartment in Thaltej", locality: "Thaltej", city: "Ahmedabad", state: "Gujarat", zipCode: "380054", lat: 23.0530, lng: 72.5060, propertyType: "Apartment", listingType: "sell", totalPrice: 15800000, areaSqft: 1900, bedrooms: 3, bathrooms: 3, furnishingStatus: "Unfurnished", yearBuilt: 2020, projectIndex: 1 },
  { title: "Shop Space in Maninagar", locality: "Maninagar", city: "Ahmedabad", state: "Gujarat", zipCode: "380008", lat: 22.9980, lng: 72.6010, propertyType: "Commercial", listingType: "sell", totalPrice: 9500000, areaSqft: 450, bedrooms: 0, bathrooms: 1, furnishingStatus: "Unfurnished", yearBuilt: 2015, projectIndex: null },
  { title: "3BHK in Godrej Garden City", locality: "Jagatpur", city: "Ahmedabad", state: "Gujarat", zipCode: "382470", lat: 23.1120, lng: 72.5650, propertyType: "Apartment", listingType: "sell", totalPrice: 14500000, areaSqft: 1750, bedrooms: 3, bathrooms: 3, furnishingStatus: "Unfurnished", yearBuilt: 2024, projectIndex: 3 },
  { title: "Affordable 2BHK in Chandkheda", locality: "Chandkheda", city: "Ahmedabad", state: "Gujarat", zipCode: "382424", lat: 23.1120, lng: 72.6010, propertyType: "Apartment", listingType: "sell", totalPrice: 5800000, areaSqft: 980, bedrooms: 2, bathrooms: 2, furnishingStatus: "Unfurnished", yearBuilt: 2019, projectIndex: null },
  { title: "Studio Apartment in Bopal", locality: "Bopal", city: "Ahmedabad", state: "Gujarat", zipCode: "380058", lat: 23.0276, lng: 72.4647, propertyType: "Apartment", listingType: "rent", totalPrice: 15000, areaSqft: 550, bedrooms: 1, bathrooms: 1, furnishingStatus: "Furnished", yearBuilt: 2021, securityDeposit: 45000, maintenance: 1800, projectIndex: null },
  { title: "Premium Villa in Shantigram", locality: "SG Highway", city: "Ahmedabad", state: "Gujarat", zipCode: "382421", lat: 23.0500, lng: 72.5120, propertyType: "Villa", listingType: "sell", totalPrice: 35000000, areaSqft: 4200, bedrooms: 5, bathrooms: 5, furnishingStatus: "Semi-Furnished", yearBuilt: 2024, projectIndex: 0 },
  // Gandhinagar
  { title: "3BHK near Infocity Gandhinagar", locality: "Infocity", city: "Gandhinagar", state: "Gujarat", zipCode: "382009", lat: 23.1900, lng: 72.6360, propertyType: "Apartment", listingType: "sell", totalPrice: 7200000, areaSqft: 1400, bedrooms: 3, bathrooms: 2, furnishingStatus: "Unfurnished", yearBuilt: 2020, projectIndex: null },
  { title: "2BHK for Rent in Kudasan", locality: "Kudasan", city: "Gandhinagar", state: "Gujarat", zipCode: "382421", lat: 23.2050, lng: 72.6280, propertyType: "Apartment", listingType: "rent", totalPrice: 18000, areaSqft: 1000, bedrooms: 2, bathrooms: 2, furnishingStatus: "Semi-Furnished", yearBuilt: 2018, securityDeposit: 54000, maintenance: 2200, projectIndex: null },
  // Surat
  { title: "Luxury 3BHK in Vesu Surat", locality: "Vesu", city: "Surat", state: "Gujarat", zipCode: "395007", lat: 21.1410, lng: 72.7700, propertyType: "Apartment", listingType: "sell", totalPrice: 9800000, areaSqft: 1550, bedrooms: 3, bathrooms: 3, furnishingStatus: "Furnished", yearBuilt: 2022, projectIndex: null },
  { title: "Commercial Showroom in Ring Road", locality: "Ring Road", city: "Surat", state: "Gujarat", zipCode: "395002", lat: 21.1702, lng: 72.8311, propertyType: "Commercial", listingType: "rent", totalPrice: 65000, areaSqft: 1200, bedrooms: 0, bathrooms: 2, furnishingStatus: "Unfurnished", yearBuilt: 2016, securityDeposit: 195000, maintenance: 8000, projectIndex: null },
  // Vadodara
  { title: "2BHK in Alkapuri Vadodara", locality: "Alkapuri", city: "Vadodara", state: "Gujarat", zipCode: "390007", lat: 22.3072, lng: 73.1812, propertyType: "Apartment", listingType: "sell", totalPrice: 6500000, areaSqft: 1100, bedrooms: 2, bathrooms: 2, furnishingStatus: "Semi-Furnished", yearBuilt: 2017, projectIndex: null },
  { title: "Plot in Waghodia Road", locality: "Waghodia Road", city: "Vadodara", state: "Gujarat", zipCode: "390019", lat: 22.3200, lng: 73.2500, propertyType: "Plot", listingType: "sell", totalPrice: 3200000, areaSqft: 1800, bedrooms: 0, bathrooms: 0, furnishingStatus: "Unfurnished", yearBuilt: null, isNegotiable: true, projectIndex: null },
  // Rajkot
  { title: "3BHK in Kalawad Road Rajkot", locality: "Kalawad Road", city: "Rajkot", state: "Gujarat", zipCode: "360005", lat: 22.3039, lng: 70.8022, propertyType: "Apartment", listingType: "sell", totalPrice: 7800000, areaSqft: 1350, bedrooms: 3, bathrooms: 2, furnishingStatus: "Unfurnished", yearBuilt: 2021, projectIndex: null },
  // More Ahmedabad
  { title: "2BHK in Savvy Swaraj Imperia", locality: "South Bopal", city: "Ahmedabad", state: "Gujarat", zipCode: "380058", lat: 23.0200, lng: 72.4700, propertyType: "Apartment", listingType: "sell", totalPrice: 5500000, areaSqft: 950, bedrooms: 2, bathrooms: 2, furnishingStatus: "Unfurnished", yearBuilt: 2023, projectIndex: 2 },
  { title: "Furnished 3BHK in Shivalik Parkview", locality: "Thaltej", city: "Ahmedabad", state: "Gujarat", zipCode: "380054", lat: 23.0550, lng: 72.5080, propertyType: "Apartment", listingType: "rent", totalPrice: 45000, areaSqft: 1600, bedrooms: 3, bathrooms: 3, furnishingStatus: "Furnished", yearBuilt: 2022, securityDeposit: 135000, maintenance: 4500, projectIndex: 1 },
  { title: "Corner Plot in Nikol", locality: "Nikol", city: "Ahmedabad", state: "Gujarat", zipCode: "382350", lat: 23.0450, lng: 72.6650, propertyType: "Plot", listingType: "sell", totalPrice: 4500000, areaSqft: 1500, bedrooms: 0, bathrooms: 0, furnishingStatus: "Unfurnished", yearBuilt: null, projectIndex: null },
  { title: "4BHK Independent House in Naranpura", locality: "Naranpura", city: "Ahmedabad", state: "Gujarat", zipCode: "380013", lat: 23.0580, lng: 72.5480, propertyType: "Villa", listingType: "sell", totalPrice: 22000000, areaSqft: 2600, bedrooms: 4, bathrooms: 4, furnishingStatus: "Semi-Furnished", yearBuilt: 2018, isNegotiable: true, projectIndex: null },
  { title: "Office Space in C.G. Road", locality: "Navrangpura", city: "Ahmedabad", state: "Gujarat", zipCode: "380009", lat: 23.0340, lng: 72.5590, propertyType: "Commercial", listingType: "sell", totalPrice: 18500000, areaSqft: 2200, bedrooms: 0, bathrooms: 3, furnishingStatus: "Semi-Furnished", yearBuilt: 2014, projectIndex: null },
  { title: "1BHK in Shivalik Edge Gota", locality: "Gota", city: "Ahmedabad", state: "Gujarat", zipCode: "382481", lat: 23.0980, lng: 72.5400, propertyType: "Apartment", listingType: "sell", totalPrice: 4800000, areaSqft: 650, bedrooms: 1, bathrooms: 1, furnishingStatus: "Unfurnished", yearBuilt: 2024, projectIndex: 4 },
  { title: "Riverfront View 3BHK Jagatpur", locality: "Jagatpur", city: "Ahmedabad", state: "Gujarat", zipCode: "382470", lat: 23.1150, lng: 72.5680, propertyType: "Apartment", listingType: "rent", totalPrice: 38000, areaSqft: 1750, bedrooms: 3, bathrooms: 3, furnishingStatus: "Semi-Furnished", yearBuilt: 2024, securityDeposit: 114000, maintenance: 4000, projectIndex: 3 },
  { title: "Luxury 4BHK in Adani Westview", locality: "Bodakdev", city: "Ahmedabad", state: "Gujarat", zipCode: "380054", lat: 23.0440, lng: 72.5160, propertyType: "Apartment", listingType: "sell", totalPrice: 25000000, areaSqft: 3100, bedrooms: 4, bathrooms: 4, furnishingStatus: "Furnished", yearBuilt: 2025, projectIndex: 5 },
];

const PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&auto=format",
];

function buildPropertyDoc(template, ownerId, projectIds) {
  const descriptions = {
    Apartment: `Well-maintained ${template.bedrooms}BHK apartment in ${template.locality}, ${template.city}. Close to schools, hospitals, and shopping areas.`,
    Villa: `Spacious independent villa in ${template.locality}, ${template.city} with modern architecture and private garden.`,
    Plot: `Prime residential plot in ${template.locality}, ${template.city}. Clear title, ready for construction.`,
    Commercial: `Premium commercial space in ${template.locality}, ${template.city}. High footfall area with excellent connectivity.`,
  };

  return {
    ownerId,
    projectId: template.projectIndex !== null ? projectIds[template.projectIndex] : null,
    title: template.title,
    description: descriptions[template.propertyType],
    propertyType: template.propertyType,
    listingType: template.listingType,
    totalPrice: template.totalPrice,
    securityDeposit: template.securityDeposit || 0,
    maintenance: template.maintenance || 0,
    isNegotiable: template.isNegotiable || false,
    status: "Available",
    specs: {
      areaSqft: template.areaSqft,
      superBuiltUpSqft: Math.round(template.areaSqft * 1.15),
      bedrooms: template.bedrooms,
      bathrooms: template.bathrooms,
      furnishingStatus: template.furnishingStatus,
      ...(template.yearBuilt && { yearBuilt: template.yearBuilt }),
    },
    address: {
      street: `${Math.floor(Math.random() * 200) + 1}, ${template.locality} Main Road`,
      locality: template.locality,
      city: template.city,
      state: template.state,
      zipCode: template.zipCode,
    },
    location: {
      type: "Point",
      coordinates: [template.lng, template.lat],
    },
    images: [
      PROPERTY_IMAGES[Math.floor(Math.random() * PROPERTY_IMAGES.length)],
      PROPERTY_IMAGES[Math.floor(Math.random() * PROPERTY_IMAGES.length)],
    ],
  };
}

async function seed() {
  try {
    console.log(`Connecting to MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log("Connected.\n");

    console.log("Clearing existing Users, Builders, Projects, and Properties...");
    await Promise.all([
      User.deleteMany({}),
      Builder.deleteMany({}),
      Project.deleteMany({}),
      Property.deleteMany({}),
    ]);

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // 1. Users
    const users = await User.insertMany(
      USERS.map((u) => ({ ...u, password: hashedPassword }))
    );
    console.log(`✅ ${users.length} users created`);

    // 2. Builders
    const builderDocs = await Promise.all(
      BUILDERS.map(({ documents, ...builder }) => Builder.create({ ...builder, password: hashedPassword, projects: [] }))
    );
    console.log(`✅ ${builderDocs.length} builders created`);

    // 3. Projects
    const projectDocs = await Project.insertMany(
      PROJECTS.map(({ builderIndex, documents, ...project }) => ({
        ...project,
        builderId: builderDocs[builderIndex]._id,
      }))
    );
    console.log(`✅ ${projectDocs.length} projects created`);

    // 4. Link projects to builders
    for (let i = 0; i < PROJECTS.length; i++) {
      const builder = builderDocs[PROJECTS[i].builderIndex];
      builder.projects.push({
        projectId: projectDocs[i]._id,
        projectName: projectDocs[i].name,
        status: projectDocs[i].status,
        launchYear: 2022 + (i % 4),
      });
      await builder.save();
    }
    console.log("✅ Builder ↔ Project links updated");

    // 5. Properties (assign owners round-robin)
    const projectIds = projectDocs.map((p) => p._id);
    const properties = PROPERTY_TEMPLATES.map((template, index) =>
      buildPropertyDoc(template, users[index % users.length]._id, projectIds)
    );
    const insertedProperties = await Property.insertMany(properties);
    console.log(`✅ ${insertedProperties.length} properties created`);

    // Summary
    const ahmedabadCount = insertedProperties.filter((p) => p.address.city === "Ahmedabad").length;

    console.log("\n========================================");
    console.log("  GUJARAT SEED COMPLETE");
    console.log("========================================");
    console.log(`Users:      ${users.length}`);
    console.log(`Builders:   ${builderDocs.length}`);
    console.log(`Projects:   ${projectDocs.length}`);
    console.log(`Properties: ${insertedProperties.length} (${ahmedabadCount} in Ahmedabad)`);
    console.log("\nLogin credentials (all accounts):");
    console.log(`  Password: ${DEFAULT_PASSWORD}`);
    console.log("\nSample user emails:");
    users.slice(0, 3).forEach((u) => console.log(`  • ${u.email}`));
    console.log("\nSample builder emails:");
    builderDocs.slice(0, 3).forEach((b) => console.log(`  • ${b.email}`));
    console.log("========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
