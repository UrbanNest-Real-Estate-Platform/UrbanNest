import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import { createProperty, updateProperty, getPropertyById } from '../../services/propertyService';
import api from '../../services/axios';
import './PostProperty.css';

// Fix Leaflet's default icon issue
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Map Updater Component to center map when coordinates change
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export default function PostProperty() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  // Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [listingType, setListingType] = useState('sell');
  const [status, setStatus] = useState('Available');

  // Price Info
  const [totalPrice, setTotalPrice] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [maintenance, setMaintenance] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);



  // Specs
  const [areaSqft, setAreaSqft] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [furnishingStatus, setFurnishingStatus] = useState('Unfurnished');

  // Address
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');

  // Images
  const [images, setImages] = useState([]);

  // Location / Coordinates (Default to Mumbai)
  const [coordinates, setCoordinates] = useState({ lat: 19.0760, lng: 72.8777 });
  const markerRef = useRef(null);

  const userHasEditedAddress = useRef(false);

  // Auto-fetch coordinates using Nominatim API when locality/city changes
  useEffect(() => {
    // Only auto-fetch if we are in create mode, OR if the user has explicitly edited the address in edit mode
    if (isEditMode && !userHasEditedAddress.current) return;

    const delayDebounceFn = setTimeout(async () => {
      if (locality.trim().length > 3 || city.trim().length > 3) {
        try {
          const query = `${locality}, ${city}`;
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
          const data = await res.json();
          if (data && data.length > 0) {
            setCoordinates({
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon)
            });
          }
        } catch (error) {
          console.error("Geocoding failed", error);
        }
      }
    }, 1500); // 1.5s debounce to avoid spamming the API

    return () => clearTimeout(delayDebounceFn);
  }, [locality, city, isEditMode]);

  // Fetch existing property for edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProperty = async () => {
        try {
          const res = await getPropertyById(id);
          if (res.data && res.data.success) {
            const p = res.data.data;
            setTitle(p.title || '');
            setDescription(p.description || '');
            setPropertyType(p.propertyType || 'Apartment');
            setListingType(p.listingType || 'sell');
            setStatus(p.status || 'Available');
            setTotalPrice(p.totalPrice || '');
            setSecurityDeposit(p.securityDeposit || '');
            setMaintenance(p.maintenance || '');
            setIsNegotiable(p.isNegotiable || false);

            setAreaSqft(p.specs?.areaSqft || '');
            setBedrooms(p.specs?.bedrooms || '');
            setBathrooms(p.specs?.bathrooms || '');
            setFurnishingStatus(p.specs?.furnishingStatus || 'Unfurnished');
            
            setLocality(p.address?.locality || '');
            setCity(p.address?.city || '');
            setStateName(p.address?.state || '');
            
            if (p.location && p.location.coordinates) {
              setCoordinates({ lng: p.location.coordinates[0], lat: p.location.coordinates[1] });
            }
            
            if (p.images) {
              setImages(p.images);
            }
          }
        } catch (error) {
          toast.error("Failed to load property details");
          console.error(error);
        } finally {
          setFetching(false);
        }
      };
      fetchProperty();
    }
  }, [id, isEditMode]);


  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker != null) {
      const pos = marker.getLatLng();
      setCoordinates({ lat: pos.lat, lng: pos.lng });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error("Please upload valid image files.");
      return;
    }

    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      toast.info("Uploading images...");
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3120/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setImages(prev => [...prev, ...data.data]);
        toast.success("Images uploaded successfully!");
      } else {
        toast.error(data.message || "Upload failed on server");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload images");
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const propertyData = {
        title,
        description,
        propertyType,
        listingType,
        status,
        totalPrice: Number(totalPrice),
        securityDeposit: Number(securityDeposit) || 0,
        maintenance: Number(maintenance) || 0,
        isNegotiable,
        specs: {
          areaSqft: Number(areaSqft),
          bedrooms: Number(bedrooms) || undefined,
          bathrooms: Number(bathrooms) || undefined,
          furnishingStatus
        },
        address: {
          locality,
          city,
          state: stateName
        },
        location: {
          type: "Point",
          coordinates: [coordinates.lng, coordinates.lat] // GeoJSON is [longitude, latitude]
        },
        images,
      };



      let res;
      if (isEditMode) {
        res = await updateProperty(id, propertyData);
      } else {
        res = await createProperty(propertyData);
      }
      
      if (res.data.success) {
        toast.success(isEditMode ? "Property updated successfully!" : "Property listed successfully!");
        navigate("/my-properties?tab=listings");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || (isEditMode ? "Failed to update property" : "Failed to list property"));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="post-property-page" style={{ padding: '100px', textAlign: 'center' }}>Loading property details...</div>;
  }

  return (
    <div className="post-property-page">
      <DashboardNavbar scrolled={true} />

      <main className="post-property-container">
        <div className="pp-header">
          <h1>{isEditMode ? "Edit Your Property" : "List Your Property"}</h1>
          <p>{isEditMode ? "Update the details of your property listing below." : "Fill in the details below to publish your property for millions of buyers and renters."}</p>
        </div>

        <form className="pp-form" onSubmit={handleSubmit}>
          {/* Basic Details */}
          <div className="pp-section">
            <h2 className="pp-section-title">1. Basic Details</h2>
            <div className="pp-grid">
              <div className="pp-field full-width">
                <label>Listing Title *</label>
                <input required type="text" className="pp-input" placeholder="e.g. 3 BHK Sea-Facing Apartment" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="pp-field full-width">
                <label>Description *</label>
                <textarea required className="pp-textarea" placeholder="Describe the key features of the property..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="pp-field">
                <label>Property Type *</label>
                <select className="pp-select" value={propertyType} onChange={e => setPropertyType(e.target.value)}>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Plot">Plot</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              <div className="pp-field">
                <label>Listing Type *</label>
                <select className="pp-select" value={listingType} onChange={e => setListingType(e.target.value)}>
                  <option value="sell">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
              {isEditMode && (
                <div className="pp-field">
                  <label>Status *</label>
                  <select className="pp-select" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="Available">Available</option>
                    <option value="Under Offer">Under Offer</option>
                    <option value="Sold">Sold</option>
                    <option value="Rented">Rented</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Details */}
          <div className="pp-section">
            <h2 className="pp-section-title">2. Pricing</h2>
            <div className="pp-grid">
              <div className="pp-field">
                <label>{listingType === 'rent' ? 'Monthly Rent (₹) *' : 'Total Price (₹) *'}</label>
                <input required type="number" min="0" className="pp-input" placeholder="e.g. 15000000" value={totalPrice} onChange={e => setTotalPrice(e.target.value)} />
              </div>

              {listingType === 'rent' && (
                <div className="pp-field">
                  <label>Security Deposit (₹)</label>
                  <input type="number" min="0" className="pp-input" placeholder="e.g. 100000" value={securityDeposit} onChange={e => setSecurityDeposit(e.target.value)} />
                </div>
              )}

              <div className="pp-field">
                <label>Maintenance (₹ / month)</label>
                <input type="number" min="0" className="pp-input" placeholder="0" value={maintenance} onChange={e => setMaintenance(e.target.value)} />
              </div>

              {listingType === 'sell' && (
                <div className="pp-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px', marginTop: '30px' }}>
                  <input type="checkbox" id="nego" checked={isNegotiable} onChange={e => setIsNegotiable(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                  <label htmlFor="nego" style={{ cursor: 'pointer', marginBottom: 0 }}>Price is Negotiable</label>
                </div>
              )}


            </div>
          </div>

          {/* Specifications */}
          <div className="pp-section">
            <h2 className="pp-section-title">3. Specifications</h2>
            <div className="pp-grid">
              <div className="pp-field">
                <label>Area (Sq.ft) *</label>
                <input required type="number" min="1" className="pp-input" placeholder="e.g. 1200" value={areaSqft} onChange={e => setAreaSqft(e.target.value)} />
              </div>
              <div className="pp-field">
                <label>Furnishing Status</label>
                <select className="pp-select" value={furnishingStatus} onChange={e => setFurnishingStatus(e.target.value)}>
                  <option value="Unfurnished">Unfurnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Furnished">Furnished</option>
                </select>
              </div>
              {propertyType !== 'Plot' && (
                <>
                  <div className="pp-field">
                    <label>Bedrooms</label>
                    <input type="number" min="0" className="pp-input" placeholder="e.g. 3" value={bedrooms} onChange={e => setBedrooms(e.target.value)} />
                  </div>
                  <div className="pp-field">
                    <label>Bathrooms</label>
                    <input type="number" min="0" className="pp-input" placeholder="e.g. 2" value={bathrooms} onChange={e => setBathrooms(e.target.value)} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="pp-section">
            <h2 className="pp-section-title">4. Location & Map</h2>
            <div className="pp-grid">
              <div className="pp-field">
                <label>City *</label>
                <input required type="text" className="pp-input" placeholder="e.g. Mumbai" value={city} onChange={e => { setCity(e.target.value); userHasEditedAddress.current = true; }} />
              </div>
              <div className="pp-field">
                <label>Locality / Area *</label>
                <input required type="text" className="pp-input" placeholder="e.g. Bandra West" value={locality} onChange={e => { setLocality(e.target.value); userHasEditedAddress.current = true; }} />
              </div>
              <div className="pp-field">
                <label>State *</label>
                <input required type="text" className="pp-input" placeholder="e.g. Maharashtra" value={stateName} onChange={e => setStateName(e.target.value)} />
              </div>

              <div className="pp-field full-width">
                <label>Pin Exact Location (Drag the marker)</label>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Type your city/locality above to auto-center the map, then drag the pin precisely to your property.</p>
                <div className="pp-map-container">
                  <MapContainer center={[coordinates.lat, coordinates.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapUpdater center={[coordinates.lat, coordinates.lng]} />
                    <Marker
                      draggable={true}
                      eventHandlers={{ dragend: handleMarkerDragEnd }}
                      position={[coordinates.lat, coordinates.lng]}
                      ref={markerRef}
                    ></Marker>
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="pp-section">
            <h2 className="pp-section-title">5. Photos</h2>
            <div className="pp-field full-width">
              <label>Upload Images</label>
              
              <div 
                className="pp-drag-drop-zone"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <input 
                  id="file-upload" 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileSelect} 
                />
                <div className="pp-drag-drop-content">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p>Drag and drop images here, or <strong>browse files</strong></p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Supports JPG, PNG, WEBP</p>
                </div>
              </div>

              {images.length > 0 && (
                <div className="pp-image-preview-container">
                  {images.map((img, idx) => (
                    <div key={idx} className="pp-image-preview">
                      <img src={img} alt={`Preview ${idx + 1}`} />
                      <button type="button" className="pp-image-remove" onClick={(e) => { e.stopPropagation(); removeImage(idx); }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pp-footer">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="pp-submit-btn" disabled={loading}>
              {loading ? (isEditMode ? 'Updating...' : 'Publishing...') : (isEditMode ? 'Update Listing' : 'Publish Listing')}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
