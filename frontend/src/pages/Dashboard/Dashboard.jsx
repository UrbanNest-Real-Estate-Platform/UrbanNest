import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { getLiveAuctions, getFeaturedSaleProperties, getRentalProperties } from '../../services/propertyService';
import api from '../../services/axios';
import { toast } from 'react-toastify';
import './Dashboard.css';

/* ─── ICONS ─── */
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const IconPin = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)
const IconBed = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" />
  </svg>
)
const IconBath = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6L9 2" /><path d="M9 6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2" /><path d="M2 16a10 10 0 0 0 20 0v-4H2v4z" />
  </svg>
)
const IconSquare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
  </svg>
)
const IconHeart = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)
const IconGavel = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2.5l7 7-10 10-7-7z" /><path d="M2 22l5.5-5.5" />
  </svg>
)

const RECENTLY_VIEWED = [
  { id: 1, title: 'Skyline Penthouse', loc: 'Bandra West', price: '₹4.2 Cr', image: 'https://images.unsplash.com/photo-1757924461488-ef9ad0670978?w=128&h=128&fit=crop&auto=format' },
  { id: 2, title: 'Aranya Hill House', loc: 'Powai', price: '₹2.75 Cr', image: 'https://images.unsplash.com/photo-1721815693498-cc28507c0ba2?w=128&h=128&fit=crop&auto=format' },
  { id: 3, title: 'Sunlit Corner 3BHK', loc: 'Bandra East', price: '₹75K/mo', image: 'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?w=128&h=128&fit=crop&auto=format' },
  { id: 4, title: 'Grand Duplex Villa', loc: 'Juhu', price: '₹7.85 Cr', image: 'https://images.unsplash.com/photo-1653972233597-05822baa3c4e?w=128&h=128&fit=crop&auto=format' },
  { id: 5, title: 'Opaline Tower', loc: 'Goregaon East', price: '₹1.18 Cr', image: 'https://images.unsplash.com/photo-1628012209120-d9db7abf7eab?w=128&h=128&fit=crop&auto=format' },
  { id: 6, title: 'Heritage Library Flat', loc: 'Colaba', price: '₹1.2L/mo', image: 'https://images.unsplash.com/photo-1780257562925-d78de6cb6612?w=128&h=128&fit=crop&auto=format' },
]

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


/* ─── AUCTION CARD ─── */
export function AuctionCard({ a }) {
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());
  const [reminded, setReminded] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const startTime = a.auctionStartTime ? new Date(a.auctionStartTime).getTime() : 0;
  const endTime = a.auctionEndTime ? new Date(a.auctionEndTime).getTime() : 0;

  const isFuture = startTime > now;
  const isOngoing = startTime <= now && endTime > now;

  const formatCountdown = (targetMs) => {
    const diff = targetMs - now;
    if (diff <= 0) return '00h 00m 00s';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
  };

  const handleRemindMe = (e) => {
    e.stopPropagation();
    setReminded(true);
    toast.success("Reminder set!");
  };

  let timeDisplay, timeLabel;
  if (isFuture) {
    const diffHrs = (startTime - now) / 3600000;
    timeLabel = "⏳ Starts In";
    if (diffHrs <= 24) {
      timeDisplay = formatCountdown(startTime);
    } else {
      timeDisplay = new Date(startTime).toLocaleDateString() + ' ' + new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      timeLabel = "🗓️ Starts On";
    }
  } else if (isOngoing) {
    timeLabel = "⚡ Ends In";
    timeDisplay = formatCountdown(endTime);
  } else {
    timeLabel = "🛑 Status";
    timeDisplay = "Ended";
  }

  return (
    <div className="un-card-auction" onClick={() => navigate('/property/' + (a._id || a.id))} style={{ cursor: 'pointer' }}>
      <div className="un-card-img-wrap">
        <img className="un-card-img" src={getImage(a.images || [a.image])} alt={a.title} loading="lazy" />
        {isOngoing && (
          <div className="un-tag-live">
            <span className="un-live-dot" /> LIVE
          </div>
        )}
      </div>
      <div className="un-card-body">
        <div className="un-card-title">{a.title}</div>
        <div className="un-card-loc"><IconPin />{a.address?.locality || a.location}</div>
        <div className="un-countdown-row">
          <span className="un-countdown-label">{timeLabel}</span>
          <span className="un-countdown-time" style={{ fontSize: isFuture && (startTime - now) / 3600000 > 24 ? '0.85rem' : '1.1rem' }}>{timeDisplay}</span>
        </div>

        {isFuture ? (
          <button className="un-btn-bid" onClick={handleRemindMe} disabled={reminded} style={{ background: reminded ? '#f3f4f6' : '', color: reminded ? '#9ca3af' : '' }}>
            <IconBell /> {reminded ? 'Reminder Set' : 'Set Reminder'}
          </button>
        ) : isOngoing ? (
          <button className="un-btn-bid" onClick={(e) => { e.stopPropagation(); navigate(`/auction/${a._id || a.id}`) }}>
            <IconGavel /> Participate
          </button>
        ) : (
          <button className="un-btn-bid" disabled style={{ background: '#f3f4f6', color: '#9ca3af' }}>
            Auction Ended
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── SALE CARD ─── */
export function SaleCard({ p, isInitiallySaved }) {
  const navigate = useNavigate();
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
      }
    } catch (err) {
      toast.error("Please login to save properties.");
    }
  };

  return (
    <div className="un-card-sale" onClick={() => navigate('/property/' + (p._id || p.id))} style={{ cursor: 'pointer' }}>
      <div className="un-card-img-wrap">
        <img className="un-card-img" src={getImage(p.images || [p.image])} alt={p.title} loading="lazy" />
        <button
          className={`un-wishlist-btn${loved ? ' loved' : ''}`}
          onClick={handleToggle}
          aria-label={loved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <IconHeart filled={loved} />
        </button>
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
export function RentalCard({ r, isInitiallySaved }) {
  const navigate = useNavigate();
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
      }
    } catch (err) {
      toast.error("Please login to save properties.");
    }
  };

  const furnishClass = r.specs?.furnishingStatus === 'Furnished' ? 'un-tag-green' : r.specs?.furnishingStatus === 'Semi-Furnished' ? 'un-tag-amber' : 'un-tag-gray'
  const furnishType = r.specs?.furnishingStatus || r.furnish || 'Semi-Furnished';
  return (
    <div className="un-card-rental" onClick={() => navigate('/property/' + (r._id || r.id))} style={{ cursor: 'pointer' }}>
      <div className="un-card-img-wrap">
        <img className="un-card-img" src={getImage(r.images || [r.image])} alt={r.title} loading="lazy" />
        <button
          className={`un-wishlist-btn${loved ? ' loved' : ''}`}
          onClick={handleToggle}
          aria-label="Wishlist"
        >
          <IconHeart filled={loved} />
        </button>
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
  return (
    <div className="un-card-compact" onClick={() => navigate('/property/' + (p._id || p.id))} style={{ cursor: 'pointer' }}>
      <img className="un-compact-img" src={p.image} alt={p.title} loading="lazy" />
      <div className="un-compact-info">
        <div className="un-compact-name">{p.title}</div>
        <div className="un-compact-loc"><IconPin style={{ display: 'inline', width: 10, height: 10 }} /> {p.loc}</div>
        <div className="un-compact-price">{p.price}</div>
      </div>
    </div>
  )
}

/* ─── MAIN APP ─── */
export default function Dashboard() {
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState('Buy')
  const [navSearchQuery, setNavSearchQuery] = useState('')
  const [locality, setLocality] = useState('')
  const [bhk, setBhk] = useState('')
  const [price, setPrice] = useState('')

  const [auctions, setAuctions] = useState([])
  const [sales, setSales] = useState([])
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [savedPropertyIds, setSavedPropertyIds] = useState(new Set())

  const heroRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const auctionsRes = await getLiveAuctions().catch(() => ({ data: { data: [] } }));
        const salesRes = await getFeaturedSaleProperties().catch(() => ({ data: { data: [] } }));
        const rentalsRes = await getRentalProperties().catch(() => ({ data: { data: [] } }));
        const userRes = await api.get('/auth/me').catch(() => null);

        setAuctions(auctionsRes.data?.data || []);
        setSales(salesRes.data?.data || []);
        setRentals(rentalsRes.data?.data || []);

        if (userRes?.data?.success && userRes.data.user.savedPropertyIds) {
          setSavedPropertyIds(new Set(userRes.data.user.savedPropertyIds));
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    const listingType = activeTab === 'Buy' ? 'sell' : activeTab === 'Rent' ? 'rent' : 'auction';
    params.append('listing_type', listingType);
    if (locality) params.append('locality', locality);

    // Parse BHK
    if (bhk) {
      const bhkNum = parseInt(bhk);
      if (!isNaN(bhkNum)) {
        params.append('bhk', bhkNum);
      }
    }

    // Parse Price
    if (price) {
      if (price === 'Under ₹50L') params.append('price_range', '0-5000000');
      else if (price === '₹50L – ₹1 Cr') params.append('price_range', '5000000-10000000');
      else if (price === '₹1 Cr – ₹3 Cr') params.append('price_range', '10000000-30000000');
      else if (price === '₹3 Cr – ₹5 Cr') params.append('price_range', '30000000-50000000');
      else if (price === '₹5 Cr+') params.append('minPrice', '50000000');
    }

    navigate(`/search?${params.toString()}`);
  }

  const handleNavSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (navSearchQuery.trim()) {
        navigate(`/search?locality=${encodeURIComponent(navSearchQuery.trim())}`);
      }
    }
  }

  useEffect(() => {
    const onScroll = () => {
      const heroBottom = heroRef.current ? heroRef.current.getBoundingClientRect().bottom : 400
      setScrolled(heroBottom < 80)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div>
      {/* ── NAVBAR ── */}
      <nav className={`un-navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="un-navbar-left">
          <a className="un-logo" href="#" aria-label="UrbanNest home">
            <div className="un-logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
            <span className="un-logo-name">Urban<span>Nest</span></span>
          </a>
        </div>

        <div className="un-navbar-center">
          <div className={`un-nav-search${scrolled ? ' visible' : ''}`} role="search">
            <input
              type="text"
              placeholder="Search city, locality…"
              aria-label="Search"
              value={navSearchQuery}
              onChange={e => setNavSearchQuery(e.target.value)}
              onKeyDown={handleNavSearch}
            />
            <button className="un-nav-search-btn" aria-label="Search" onClick={handleNavSearch}>
              <IconSearch />
            </button>
          </div>
        </div>

        <div className="un-navbar-right">
          <button className="un-btn-list" aria-label="List a property">
            <IconPlus />
            <span>List Property</span>
          </button>
          <button className="un-icon-btn" aria-label="Notifications">
            <IconBell />
            <span className="un-notif-dot" aria-label="New notifications" />
          </button>
          <div className="un-avatar" role="img" aria-label="User profile: Jayesh Patel" title="Jayesh Patel">JP</div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="un-hero" ref={heroRef}>
        <div className="un-hero-bg" />
        <div className="un-hero-overlay" />
        <div className="un-hero-content">
          <div className="un-hero-tag">
            <span className="un-hero-tag-dot" />
            2,400+ Live Listings in Mumbai
          </div>
          <h1 className="un-hero-title">
            Find your next space<br />in <em>Mumbai</em>
          </h1>
          <p className="un-hero-sub">Buy, rent, or bid — all in one place. Updated in real time.</p>

          <div className="un-search-box">
            <div className="un-search-tabs" role="tablist">
              {['Buy', 'Rent', 'Auction'].map(tab => (
                <button
                  key={tab}
                  className={`un-search-tab${activeTab === tab ? ' active' : ''}`}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'Buy' ? '🏡 Buy' : tab === 'Rent' ? '🔑 Rent' : '⚡ Auction'}
                </button>
              ))}
            </div>
            <div className="un-search-fields">
              <div className="un-search-field">
                <label htmlFor="locality">Locality / City</label>
                <input id="locality" type="text" placeholder="e.g. Bandra, Mumbai" value={locality} onChange={e => setLocality(e.target.value)} />
              </div>
              <div className="un-search-field">
                <label htmlFor="bhk">BHK Type</label>
                <select id="bhk" aria-label="BHK type" value={bhk} onChange={e => setBhk(e.target.value)}>
                  <option value="">Any BHK</option>
                  <option>1 BHK</option>
                  <option>2 BHK</option>
                  <option>3 BHK</option>
                  <option>4+ BHK</option>
                </select>
              </div>
              <div className="un-search-field">
                <label htmlFor="price">Price Range</label>
                <select id="price" aria-label="Price range" value={price} onChange={e => setPrice(e.target.value)}>
                  <option value="">Any Price</option>
                  <option>Under ₹50L</option>
                  <option>₹50L – ₹1 Cr</option>
                  <option>₹1 Cr – ₹3 Cr</option>
                  <option>₹3 Cr – ₹5 Cr</option>
                  <option>₹5 Cr+</option>
                </select>
              </div>
              <div className="un-search-btn-wrap">
                <button className="un-hero-search-btn" aria-label="Search properties" onClick={handleSearch}>
                  <IconSearch /> Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="un-main">

        {/* Section 1: Live Auctions */}
        <section className="un-section" aria-labelledby="auctions-title">
          <div className="un-section-header">
            <div>
              <div className="un-section-label">Live Right Now</div>
              <h2 className="un-section-title" id="auctions-title">⚡ Live Auctions Ending Soon</h2>
            </div>
            <a className="un-section-link" href="#" aria-label="View all auctions" onClick={(e) => { e.preventDefault(); navigate('/search?listing_type=auction'); }}>
              View all <IconArrow />
            </a>
          </div>
          <div className="un-dashboard-grid" role="list" aria-label="Live auction properties">
            {loading ? <p style={{ padding: '20px' }}>Loading auctions...</p> : auctions.slice(0, 6).map(a => (
              <AuctionCard key={a._id || a.id} a={a} />
            ))}
            {!loading && auctions.length === 0 && <p style={{ padding: '20px' }}>No live auctions currently.</p>}
          </div>
        </section>

        {/* Section 2: Featured Sale */}
        <section className="un-section" aria-labelledby="sale-title">
          <div className="un-section-header">
            <div>
              <div className="un-section-label">Curated Picks</div>
              <h2 className="un-section-title" id="sale-title">🏡 Featured Properties for Sale</h2>
            </div>
            <a className="un-section-link" href="#" aria-label="View all sale listings" onClick={(e) => { e.preventDefault(); navigate('/search?listing_type=sell'); }}>
              View all <IconArrow />
            </a>
          </div>
          <div className="un-dashboard-grid" role="list" aria-label="Properties for sale">
            {loading ? <p style={{ padding: '20px' }}>Loading properties...</p> : sales.slice(0, 6).map(p => (
              <SaleCard key={p._id || p.id} p={p} isInitiallySaved={savedPropertyIds.has(p._id || p.id)} />
            ))}
            {!loading && sales.length === 0 && <p style={{ padding: '20px' }}>No sale properties currently.</p>}
          </div>
        </section>

        {/* Section 3: Rental */}
        <section className="un-section" aria-labelledby="rental-title">
          <div className="un-section-header">
            <div>
              <div className="un-section-label">Move-In Ready</div>
              <h2 className="un-section-title" id="rental-title">🔑 Rental Properties</h2>
            </div>
            <a className="un-section-link" href="#" aria-label="View all rental listings" onClick={(e) => { e.preventDefault(); navigate('/search?listing_type=rent'); }}>
              View all <IconArrow />
            </a>
          </div>
          <div className="un-dashboard-grid" role="list" aria-label="Rental properties">
            {loading ? <p style={{ padding: '20px' }}>Loading rentals...</p> : rentals.slice(0, 6).map(r => (
              <RentalCard key={r._id || r.id} r={r} isInitiallySaved={savedPropertyIds.has(r._id || r.id)} />
            ))}
            {!loading && rentals.length === 0 && <p style={{ padding: '20px' }}>No rental properties currently.</p>}
          </div>
        </section>

        {/* Section 4: Recently Viewed */}
        <section className="un-section" aria-labelledby="recent-title">
          <div className="un-section-header">
            <div>
              <div className="un-section-label">Pick Up Where You Left Off</div>
              <h2 className="un-section-title" id="recent-title">👁️ Recently Viewed</h2>
            </div>
            <a className="un-section-link" href="#" aria-label="View browsing history">
              See history <IconArrow />
            </a>
          </div>
          <div className="un-carousel" role="list" aria-label="Recently viewed properties">
            {RECENTLY_VIEWED.map(p => (
              <div key={p.id} role="listitem">
                <CompactCard p={p} />
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}