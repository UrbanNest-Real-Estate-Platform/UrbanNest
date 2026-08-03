import "./CTA.css";
import { Link } from "react-router-dom";

function CTA() {
  return (
    <section className="cta">

      <div className="cta-container">

        <span className="cta-tag">
          READY TO GET STARTED?
        </span>

        <h2>
          Find Your Dream Property
          <br />
          with UrbanNest Today
        </h2>

        <p>
          Join thousands of buyers, sellers, tenants and builders who trust
          UrbanNest for a smarter real estate experience.
        </p>

        <div className="cta-buttons">

          <Link to="/register" className="primary-btn">
            Create Free Account
          </Link>

          <Link to="/login" className="secondary-btn">
            Sign In
          </Link>

        </div>

      </div>

    </section>
  );
}

export default CTA;