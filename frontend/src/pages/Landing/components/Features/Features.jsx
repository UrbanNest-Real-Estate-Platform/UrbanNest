import "./Features.css";

const features = [
  {
    icon: "🔍",
    title: "Map-Based Discovery",
    description:
      "Find properties within 5km of any location with real-time geospatial filtering and street-level insights.",
  },
  {
    icon: "⚡",
    title: "Live Auctions",
    description:
      "Bid in real-time with WebSocket-powered updates, anti-sniping logic and instant winner notifications.",
  },
  {
    icon: "🏢",
    title: "Builder Projects",
    description:
      "Browse RERA-verified builder portfolios and pre-launch projects with unit-level availability tracking.",
  },
  {
    icon: "🔑",
    title: "Rental Management",
    description:
      "End-to-end tenancy lifecycle including rent reminders and lease tracking.",
  },
  {
    icon: "📈",
    title: "Market Analytics",
    description:
      "Price trends, property history and engagement insights for smarter decisions.",
  },
  {
    icon: "🛡️",
    title: "Verified Listings",
    description:
      "Every listing is reviewed before going live to ensure authenticity and trust.",
  },
];

function Features() {
  return (
    <section className="features-section" id="features">
      <span className="features-tag">EVERYTHING YOU NEED</span>

      <h2>
        A platform built for <span>real estate</span>
      </h2>

      <p className="features-subtitle">
        From discovery to deed — every step of the property journey in one
        seamless experience.
      </p>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-icon">{feature.icon}</div>

            <h3>{feature.title}</h3>

            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;