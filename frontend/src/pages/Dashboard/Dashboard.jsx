import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { getLiveAuctions, getFeaturedSaleProperties, getRentalProperties } from '../../services/propertyService';
import api from '../../services/axios';
import { toast } from 'react-toastify';
import './Dashboard.css';

import DashboardNavbar from "../../components/DashboardNavbar/DashboardNavbar";
import { AuctionCard, SaleCard, RentalCard, CompactCard } from "../../components/PropertyCards/PropertyCards";
import { IconArrow, IconSearch } from "../../components/Icons/Icons";

const RECENTLY_VIEWED = [
  { id: 1, title: "Skyline Penthouse", loc: "Bandra West", price: "₹4.2 Cr", image: "https://images.unsplash.com/photo-1757924461488-ef9ad0670978?w=128&h=128&fit=crop&auto=format" },
  { id: 2, title: "Aranya Hill House", loc: "Powai", price: "₹2.75 Cr", image: "https://images.unsplash.com/photo-1721815693498-cc28507c0ba2?w=128&h=128&fit=crop&auto=format" },
  { id: 3, title: "Sunlit Corner 3BHK", loc: "Bandra East", price: "₹75K/mo", image: "https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?w=128&h=128&fit=crop&auto=format" },
  { id: 4, title: "Grand Duplex Villa", loc: "Juhu", price: "₹7.85 Cr", image: "https://images.unsplash.com/photo-1653972233597-05822baa3c4e?w=128&h=128&fit=crop&auto=format" },
  { id: 5, title: "Opaline Tower", loc: "Goregaon East", price: "₹1.18 Cr", image: "https://images.unsplash.com/photo-1628012209120-d9db7abf7eab?w=128&h=128&fit=crop&auto=format" },
  { id: 6, title: "Heritage Library Flat", loc: "Colaba", price: "₹1.2L/mo", image: "https://images.unsplash.com/photo-1780257562925-d78de6cb6612?w=128&h=128&fit=crop&auto=format" },
];

/* ─── ICONS ─── */
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
      <DashboardNavbar scrolled={scrolled} />

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