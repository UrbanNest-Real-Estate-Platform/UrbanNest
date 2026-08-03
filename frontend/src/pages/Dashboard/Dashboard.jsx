import { useState, useEffect, useRef } from 'react'
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
const IconPin = ({style}) => (
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

/* ─── DATA ─── */
const AUCTIONS = [
  {
    id: 1,
    title: 'Skyline Penthouse Suite',
    location: 'Bandra West, Mumbai',
    image: 'https://images.unsplash.com/photo-1757924461488-ef9ad0670978?w=600&h=380&fit=crop&auto=format',
    bid: '₹4,20,00,000',
    bids: 18,
    endsInMs: 2 * 3600000 + 14 * 60000 + 32000,
  },
  {
    id: 2,
    title: 'Grand Duplex Villa',
    location: 'Juhu, Mumbai',
    image: 'https://images.unsplash.com/photo-1653972233597-05822baa3c4e?w=600&h=380&fit=crop&auto=format',
    bid: '₹7,85,00,000',
    bids: 31,
    endsInMs: 5 * 3600000 + 48 * 60000 + 10000,
  },
  {
    id: 3,
    title: 'Heritage Loft Apartment',
    location: 'Lower Parel, Mumbai',
    image: 'https://images.unsplash.com/photo-1758448755778-90ebf4d0f1e7?w=600&h=380&fit=crop&auto=format',
    bid: '₹1,95,00,000',
    bids: 9,
    endsInMs: 47 * 60000 + 22000,
  },
  {
    id: 4,
    title: 'Marina Bay Residency',
    location: 'Worli Sea Face, Mumbai',
    image: 'https://images.unsplash.com/photo-1638454795595-0a0abf68614d?w=600&h=380&fit=crop&auto=format',
    bid: '₹6,30,00,000',
    bids: 24,
    endsInMs: 11 * 3600000 + 5 * 60000 + 55000,
  },
]

const SALE_PROPERTIES = [
  {
    id: 1,
    title: 'Aranya Hill House',
    location: 'Powai, Mumbai',
    price: '₹2,75,00,000',
    sqft: '2,100',
    bhk: '4',
    bath: '3',
    image: 'https://images.unsplash.com/photo-1721815693498-cc28507c0ba2?w=560&h=380&fit=crop&auto=format',
    tags: ['Ready to Move', 'Vastu'],
    loved: false,
  },
  {
    id: 2,
    title: 'Opaline Tower',
    location: 'Goregaon East, Mumbai',
    price: '₹1,18,00,000',
    sqft: '980',
    bhk: '2',
    bath: '2',
    image: 'https://images.unsplash.com/photo-1628012209120-d9db7abf7eab?w=560&h=380&fit=crop&auto=format',
    tags: ['New Launch', 'RERA'],
    loved: true,
  },
  {
    id: 3,
    title: 'Serene Palms Bungalow',
    location: 'Alibaug, Raigad',
    price: '₹5,60,00,000',
    sqft: '3,800',
    bhk: '5',
    bath: '5',
    image: 'https://images.unsplash.com/photo-1633354747567-e0682586f082?w=560&h=380&fit=crop&auto=format',
    tags: ['Premium', 'Pool'],
    loved: false,
  },
  {
    id: 4,
    title: 'Azure Bay Suites',
    location: 'Andheri West, Mumbai',
    price: '₹88,00,000',
    sqft: '750',
    bhk: '1',
    bath: '1',
    image: 'https://images.unsplash.com/photo-1719887805632-de5be825f72b?w=560&h=380&fit=crop&auto=format',
    tags: ['RERA', 'Furnished'],
    loved: false,
  },
  {
    id: 5,
    title: 'Riviera Heights',
    location: 'Thane West',
    price: '₹1,45,00,000',
    sqft: '1,250',
    bhk: '3',
    bath: '2',
    image: 'https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?w=560&h=380&fit=crop&auto=format',
    tags: ['Ready to Move'],
    loved: false,
  },
]

const RENTALS = [
  {
    id: 1,
    title: 'Sunlit Corner 3BHK',
    location: 'Bandra East, Mumbai',
    rent: '₹75,000',
    sqft: '1,450',
    bhk: '3',
    bath: '2',
    furnish: 'Fully Furnished',
    furnishType: 'green',
    image: 'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?w=560&h=380&fit=crop&auto=format',
  },
  {
    id: 2,
    title: 'Contemporary Studio',
    location: 'Andheri West, Mumbai',
    rent: '₹32,000',
    sqft: '480',
    bhk: '1',
    bath: '1',
    furnish: 'Semi-Furnished',
    furnishType: 'amber',
    image: 'https://images.unsplash.com/photo-1715985160053-d339e8b6eb94?w=560&h=380&fit=crop&auto=format',
  },
  {
    id: 3,
    title: 'Heritage Library Flat',
    location: 'Colaba, Mumbai',
    rent: '₹1,20,000',
    sqft: '2,200',
    bhk: '4',
    bath: '3',
    furnish: 'Fully Furnished',
    furnishType: 'green',
    image: 'https://images.unsplash.com/photo-1780257562925-d78de6cb6612?w=560&h=380&fit=crop&auto=format',
  },
  {
    id: 4,
    title: 'Minimal Loft Unit',
    location: 'Lower Parel, Mumbai',
    rent: '₹45,000',
    sqft: '620',
    bhk: '1',
    bath: '1',
    furnish: 'Unfurnished',
    furnishType: 'gray',
    image: 'https://images.unsplash.com/photo-1780257563050-0ee78acfeee8?w=560&h=380&fit=crop&auto=format',
  },
  {
    id: 5,
    title: 'Urban Nest 2BHK',
    location: 'Kurla West, Mumbai',
    rent: '₹28,500',
    sqft: '920',
    bhk: '2',
    bath: '2',
    furnish: 'Semi-Furnished',
    furnishType: 'amber',
    image: 'https://images.unsplash.com/photo-1638454795595-0a0abf68614d?w=560&h=380&fit=crop&auto=format',
  },
]

const RECENTLY_VIEWED = [
  { id: 1, title: 'Skyline Penthouse', loc: 'Bandra West', price: '₹4.2 Cr', image: 'https://images.unsplash.com/photo-1757924461488-ef9ad0670978?w=128&h=128&fit=crop&auto=format' },
  { id: 2, title: 'Aranya Hill House', loc: 'Powai', price: '₹2.75 Cr', image: 'https://images.unsplash.com/photo-1721815693498-cc28507c0ba2?w=128&h=128&fit=crop&auto=format' },
  { id: 3, title: 'Sunlit Corner 3BHK', loc: 'Bandra East', price: '₹75K/mo', image: 'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?w=128&h=128&fit=crop&auto=format' },
  { id: 4, title: 'Grand Duplex Villa', loc: 'Juhu', price: '₹7.85 Cr', image: 'https://images.unsplash.com/photo-1653972233597-05822baa3c4e?w=128&h=128&fit=crop&auto=format' },
  { id: 5, title: 'Opaline Tower', loc: 'Goregaon East', price: '₹1.18 Cr', image: 'https://images.unsplash.com/photo-1628012209120-d9db7abf7eab?w=128&h=128&fit=crop&auto=format' },
  { id: 6, title: 'Heritage Library Flat', loc: 'Colaba', price: '₹1.2L/mo', image: 'https://images.unsplash.com/photo-1780257562925-d78de6cb6612?w=128&h=128&fit=crop&auto=format' },
]

/* ─── COUNTDOWN ─── */
function useCountdown(initialMs) {
  const [ms, setMs] = useState(initialMs)
  useEffect(() => {
    const id = setInterval(() => setMs(prev => Math.max(0, prev - 1000)), 1000)
    return () => clearInterval(id)
  }, [])
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`
}

/* ─── AUCTION CARD ─── */
function AuctionCard({ a }) {
  const time = useCountdown(a.endsInMs)
  return (
    <div className="un-card-auction">
      <div className="un-card-img-wrap">
        <img className="un-card-img" src={a.image} alt={a.title} loading="lazy" />
        <div className="un-tag-live">
          <span className="un-live-dot" />
          LIVE
        </div>
        <div className="un-tag-bids">{a.bids} bids</div>
      </div>
      <div className="un-card-body">
        <div className="un-card-title">{a.title}</div>
        <div className="un-card-loc"><IconPin />{a.location}</div>
        <div className="un-countdown-row">
          <span className="un-countdown-label">⚡ Ends in</span>
          <span className="un-countdown-time">{time}</span>
        </div>
        <div className="un-bid-info">
          <div>
            <div className="un-bid-label">Current Highest Bid</div>
            <div className="un-bid-amount">{a.bid}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="un-bid-label">Total Bids</div>
            <div className="un-bid-amount">{a.bids}<span> bids</span></div>
          </div>
        </div>
        <button className="un-btn-bid"><IconGavel /> Place Bid</button>
      </div>
    </div>
  )
}

/* ─── SALE CARD ─── */
function SaleCard({ p }) {
  const [loved, setLoved] = useState(p.loved)
  return (
    <div className="un-card-sale">
      <div className="un-card-img-wrap">
        <img className="un-card-img" src={p.image} alt={p.title} loading="lazy" />
        <button
          className={`un-wishlist-btn${loved ? ' loved' : ''}`}
          onClick={e => { e.stopPropagation(); setLoved(v => !v) }}
          aria-label={loved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <IconHeart filled={loved} />
        </button>
        <div className="un-img-dots">
          {[0, 1, 2].map(i => <span key={i} className={`un-img-dot${i === 0 ? ' active' : ''}`} />)}
        </div>
      </div>
      <div className="un-card-body">
        <div className="un-card-price">{p.price} <span className="un-card-price-sub">onwards</span></div>
        <div className="un-card-title" style={{ marginTop: 4 }}>{p.title}</div>
        <div className="un-card-loc"><IconPin />{p.location}</div>
        <div className="un-card-specs">
          <span className="un-spec"><IconBed />{p.bhk} BHK</span>
          <span className="un-spec"><IconBath />{p.bath} Bath</span>
          <span className="un-spec"><IconSquare />{p.sqft} sqft</span>
        </div>
        <div className="un-tags-row">
          {p.tags.map(t => <span key={t} className="un-tag un-tag-indigo">{t}</span>)}
        </div>
      </div>
    </div>
  )
}

/* ─── RENTAL CARD ─── */
function RentalCard({ r }) {
  const [loved, setLoved] = useState(false)
  const furnishClass = r.furnishType === 'green' ? 'un-tag-green' : r.furnishType === 'amber' ? 'un-tag-amber' : 'un-tag-gray'
  return (
    <div className="un-card-rental">
      <div className="un-card-img-wrap">
        <img className="un-card-img" src={r.image} alt={r.title} loading="lazy" />
        <button
          className={`un-wishlist-btn${loved ? ' loved' : ''}`}
          onClick={e => { e.stopPropagation(); setLoved(v => !v) }}
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
          <span className="un-rent-price">{r.rent}</span>
          <span className="un-rent-price-mo">/ month</span>
        </div>
        <div className="un-card-title" style={{ marginTop: 4 }}>{r.title}</div>
        <div className="un-card-loc"><IconPin />{r.location}</div>
        <div className="un-card-specs">
          <span className="un-spec"><IconBed />{r.bhk} BHK</span>
          <span className="un-spec"><IconBath />{r.bath} Bath</span>
          <span className="un-spec"><IconSquare />{r.sqft} sqft</span>
        </div>
        <div className="un-tags-row">
          <span className={`un-tag ${furnishClass}`}>{r.furnish}</span>
          <span className="un-tag un-tag-teal">Verified</span>
        </div>
      </div>
    </div>
  )
}

/* ─── COMPACT CARD ─── */
function CompactCard({ p }) {
  return (
    <div className="un-card-compact">
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
  const heroRef = useRef(null)

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
            <input type="text" placeholder="Search city, locality…" aria-label="Search" />
            <button className="un-nav-search-btn" aria-label="Search">
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
                <input id="locality" type="text" placeholder="e.g. Bandra, Mumbai" />
              </div>
              <div className="un-search-field">
                <label htmlFor="bhk">BHK Type</label>
                <select id="bhk" aria-label="BHK type">
                  <option value="">Any BHK</option>
                  <option>1 BHK</option>
                  <option>2 BHK</option>
                  <option>3 BHK</option>
                  <option>4+ BHK</option>
                </select>
              </div>
              <div className="un-search-field">
                <label htmlFor="price">Price Range</label>
                <select id="price" aria-label="Price range">
                  <option value="">Any Price</option>
                  <option>Under ₹50L</option>
                  <option>₹50L – ₹1 Cr</option>
                  <option>₹1 Cr – ₹3 Cr</option>
                  <option>₹3 Cr – ₹5 Cr</option>
                  <option>₹5 Cr+</option>
                </select>
              </div>
              <div className="un-search-btn-wrap">
                <button className="un-hero-search-btn" aria-label="Search properties">
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
            <a className="un-section-link" href="#" aria-label="View all auctions">
              View all <IconArrow />
            </a>
          </div>
          <div className="un-carousel" role="list" aria-label="Live auction properties">
            {AUCTIONS.map(a => (
              <div key={a.id} role="listitem">
                <AuctionCard a={a} />
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Featured Sale */}
        <section className="un-section" aria-labelledby="sale-title">
          <div className="un-section-header">
            <div>
              <div className="un-section-label">Curated Picks</div>
              <h2 className="un-section-title" id="sale-title">🏡 Featured Properties for Sale</h2>
            </div>
            <a className="un-section-link" href="#" aria-label="View all sale listings">
              View all <IconArrow />
            </a>
          </div>
          <div className="un-carousel" role="list" aria-label="Properties for sale">
            {SALE_PROPERTIES.map(p => (
              <div key={p.id} role="listitem">
                <SaleCard p={p} />
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Rental */}
        <section className="un-section" aria-labelledby="rental-title">
          <div className="un-section-header">
            <div>
              <div className="un-section-label">Move-In Ready</div>
              <h2 className="un-section-title" id="rental-title">🔑 Rental Properties</h2>
            </div>
            <a className="un-section-link" href="#" aria-label="View all rental listings">
              View all <IconArrow />
            </a>
          </div>
          <div className="un-carousel" role="list" aria-label="Rental properties">
            {RENTALS.map(r => (
              <div key={r.id} role="listitem">
                <RentalCard r={r} />
              </div>
            ))}
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