import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/axios';
import { toast } from 'react-toastify';
import { Pencil, Trash2 } from 'lucide-react';
import { IconPin, IconBell, IconGavel, IconHeart, IconBed, IconBath, IconSquare } from '../Icons/Icons';

/* ─── FORMATTER ─── */
const formatPrice = (price) => {
  if (typeof price === 'string') return price;
  if (!price) return '₹0';
  if (price >= 10000000) {
    return '₹' + (price / 10000000).toFixed(2) + ' Cr';
  } else if (price >= 100000) {
    return '₹' + (price / 100000).toFixed(2) + ' L';
  }
  return '₹' + price.toString();
}

const getImage = (images) => {
  if (images && images.length > 0) return images[0];
  return 'https://images.unsplash.com/photo-1628012209120-d9db7abf7eab?w=560&h=380&fit=crop&auto=format';
}

const formatSqft = (sqft) => {
  if (!sqft) return '0';
  return Math.round(Number(sqft));
}


/* ─── SALE CARD ─── */
export function SaleCard({ p, isInitiallySaved, onUnsave, isOwner, onEdit, onDelete, onViewOffers }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loved, setLoved] = useState(isInitiallySaved || false)

  const handleToggle = async (e) => {
    e.stopPropagation();
    const propId = p._id || p.id;
    try {
      if (!loved) {
        await api.put(`/users/save-property/${propId}`);
        setLoved(true);
        toast.success("Saved to wishlist");
      } else {
        await api.put(`/users/unsave-property/${propId}`);
        setLoved(false);
        toast.info("Removed from wishlist");
        if (onUnsave) onUnsave(propId);
      }
    } catch (err) {
      toast.error("Please login to save properties.");
    }
  };

  const isActive = p.status === 'Available' || p.status === 'Under Offer';
  const inactiveClass = !isActive ? ' un-card-inactive' : '';

  return (
    <div className={`un-card-sale${inactiveClass}`} onClick={() => navigate('/property/' + (p._id || p.id), { state: { from: location.pathname + location.search } })} style={{ cursor: 'pointer' }}>
      <div className="un-card-img-wrap">
        <img className="un-card-img" src={getImage(p.images || [p.image])} alt={p.title} loading="lazy" />

        {p.status === 'Sold' || p.status === 'Purchased' ? (
          <div className="un-status-badge slate">{p.status}</div>
        ) : p.status === 'Rented' ? (
          <div className="un-status-badge teal">Rented</div>
        ) : p.status === 'Under Offer' ? (
          <div className="un-status-badge amber">Under Offer</div>
        ) : null}
        {isOwner ? (
          <div className="un-owner-actions" style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 10 }}>
            {p.listingType === 'sell' && p.isNegotiable && onViewOffers && (
              <button onClick={(e) => { e.stopPropagation(); onViewOffers(p._id || p.id); }} style={{ background: 'white', border: 'none', padding: '4px 8px', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#4f46e5' }}>
                Offers
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(p._id || p.id); }} style={{ background: 'white', border: 'none', padding: 6, borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pencil size={18} color="#4b5563" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(p._id || p.id); }} style={{ background: 'white', border: 'none', padding: 6, borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={18} color="#ef4444" />
            </button>
          </div>
        ) : (
          <button
            className={`un-wishlist-btn${loved ? ' loved' : ''}`}
            onClick={handleToggle}
            aria-label={loved ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <IconHeart filled={loved} />
          </button>
        )}
        <div className="un-img-dots">
          {[0, 1, 2].map(i => <span key={i} className={`un-img-dot${i === 0 ? ' active' : ''}`} />)}
        </div>
      </div>
      <div className="un-card-body">
        <div className="un-card-price">{formatPrice(p.totalPrice || p.price)} <span className="un-card-price-sub">onwards</span></div>
        <div className="un-card-title" style={{ marginTop: 4 }}>{p.title}</div>
        <div className="un-card-loc"><IconPin />{p.address?.locality || p.location}</div>
        <div className="un-card-specs">
          <span className="un-spec"><IconBed />{p.specs?.bedrooms || p.bhk} BHK</span>
          <span className="un-spec"><IconBath />{p.specs?.bathrooms || p.bath} Bath</span>
          <span className="un-spec"><IconSquare />{formatSqft(p.specs?.areaSqft || p.sqft)} sqft</span>
        </div>
        <div className="un-tags-row">
          {(p.tags || ['Ready to Move']).map(t => <span key={t} className="un-tag un-tag-indigo">{t}</span>)}
        </div>
      </div>
    </div>
  )
}

/* ─── RENTAL CARD ─── */
export function RentalCard({ r, isInitiallySaved, onUnsave, isOwner, onEdit, onDelete }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loved, setLoved] = useState(isInitiallySaved || false)

  const handleToggle = async (e) => {
    e.stopPropagation();
    const propId = r._id || r.id;
    try {
      if (!loved) {
        await api.put(`/users/save-property/${propId}`);
        setLoved(true);
        toast.success("Saved to wishlist");
      } else {
        await api.put(`/users/unsave-property/${propId}`);
        setLoved(false);
        toast.info("Removed from wishlist");
        if (onUnsave) onUnsave(propId);
      }
    } catch (err) {
      toast.error("Please login to save properties.");
    }
  };

  const furnishClass = r.specs?.furnishingStatus === 'Furnished' ? 'un-tag-green' : r.specs?.furnishingStatus === 'Semi-Furnished' ? 'un-tag-amber' : 'un-tag-gray'
  const furnishType = r.specs?.furnishingStatus || r.furnish || 'Semi-Furnished';
  const isActive = r.status === 'Available' || r.status === 'Under Offer';
  const inactiveClass = !isActive ? ' un-card-inactive' : '';

  return (
    <div className={`un-card-rental${inactiveClass}`} onClick={() => navigate('/property/' + (r._id || r.id), { state: { from: location.pathname + location.search } })} style={{ cursor: 'pointer' }}>
      <div className="un-card-img-wrap">
        <img className="un-card-img" src={getImage(r.images || [r.image])} alt={r.title} loading="lazy" />

        {r.status === 'Sold' || r.status === 'Purchased' ? (
          <div className="un-status-badge slate">{r.status}</div>
        ) : r.status === 'Rented' ? (
          <div className="un-status-badge teal">Rented</div>
        ) : r.status === 'Under Offer' ? (
          <div className="un-status-badge amber">Under Offer</div>
        ) : null}
        {isOwner ? (
          <div className="un-owner-actions" style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 10 }}>
            <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(r._id || r.id); }} style={{ background: 'white', border: 'none', padding: 6, borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pencil size={18} color="#4b5563" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(r._id || r.id); }} style={{ background: 'white', border: 'none', padding: 6, borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={18} color="#ef4444" />
            </button>
          </div>
        ) : (
          <button
            className={`un-wishlist-btn${loved ? ' loved' : ''}`}
            onClick={handleToggle}
            aria-label="Wishlist"
          >
            <IconHeart filled={loved} />
          </button>
        )}
        <div className="un-img-dots">
          {[0, 1, 2].map(i => <span key={i} className={`un-img-dot${i === 0 ? ' active' : ''}`} />)}
        </div>
      </div>
      <div className="un-card-body">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span className="un-rent-price">{formatPrice(r.totalPrice || r.rent)}</span>
          <span className="un-rent-price-mo">/ month</span>
        </div>
        <div className="un-card-title" style={{ marginTop: 4 }}>{r.title}</div>
        <div className="un-card-loc"><IconPin />{r.address?.locality || r.location}</div>
        <div className="un-card-specs">
          <span className="un-spec"><IconBed />{r.specs?.bedrooms || r.bhk} BHK</span>
          <span className="un-spec"><IconBath />{r.specs?.bathrooms || r.bath} Bath</span>
          <span className="un-spec"><IconSquare />{formatSqft(r.specs?.areaSqft || r.sqft)} sqft</span>
        </div>
        <div className="un-tags-row">
          <span className={`un-tag ${furnishClass}`}>{furnishType}</span>
          <span className="un-tag un-tag-teal">Verified</span>
        </div>
      </div>
    </div>
  )
}

/* ─── COMPACT CARD ─── */
export function CompactCard({ p }) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="un-card-compact" onClick={() => navigate('/property/' + (p._id || p.id), { state: { from: location.pathname + location.search } })} style={{ cursor: 'pointer' }}>
      <img className="un-compact-img" src={p.image} alt={p.title} loading="lazy" />
      <div className="un-compact-info">
        <div className="un-compact-name">{p.title}</div>
        <div className="un-compact-loc"><IconPin style={{ display: 'inline', width: 10, height: 10 }} /> {p.loc}</div>
        <div className="un-compact-price">{p.price}</div>
      </div>
    </div>
  )
}
