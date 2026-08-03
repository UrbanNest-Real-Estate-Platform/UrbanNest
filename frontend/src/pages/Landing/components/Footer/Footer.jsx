import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-top">

        <div className="footer-brand">

          <h2>
            Urban<span>Nest</span>
          </h2>

          <p>
            India's complete real estate platform connecting buyers,
            sellers, tenants and builders.
          </p>

        </div>

        <div className="footer-links">

          <div>

            <h3>Company</h3>

            <a href="/">About</a>
            <a href="/">Features</a>
            <a href="/">Testimonials</a>
            <a href="/">Contact</a>

          </div>

          <div>

            <h3>Support</h3>

            <a href="/">Help Center</a>
            <a href="/">Privacy Policy</a>
            <a href="/">Terms & Conditions</a>

          </div>

        </div>

      </div>

      <hr />

      <div className="footer-bottom">

        <p>
          © 2026 UrbanNest. All rights reserved.
        </p>

      </div>

    </footer>
  );
}

export default Footer;