import "./About.css";

function About() {
  return (
    <section className="about">
      <div className="about-container">

        <div className="about-left">

          <span className="about-tag">
            ABOUT URBANNEST
          </span>

          <h2>
            The complete ecosystem for
            <br />
            Indian real estate
          </h2>

          <p>
            UrbanNest was built to eliminate fragmentation in the Indian
            property market. One verified platform where buyers, sellers,
            tenants, landlords and builders operate under the same roof.
          </p>

          <div className="about-features">

            <div>
              ✔ Single Account Access
            </div>

            <div>
              ✔ RERA Verified Builders
            </div>

            <div>
              ✔ Transparent History
            </div>

            <div>
              ✔ Admin Moderation
            </div>

          </div>

        </div>

        <div className="about-right">

          <img
            className="main-img"
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa"
            alt=""
          />

          <div className="small-images">

            <img
              src="https://images.unsplash.com/photo-1570129477492-45c003edd2be"
              alt=""
            />

            <img
              src="https://images.unsplash.com/photo-1600585154526-990dced4db0d"
              alt=""
            />

          </div>

        </div>

      </div>
    </section>
  );
}

export default About;