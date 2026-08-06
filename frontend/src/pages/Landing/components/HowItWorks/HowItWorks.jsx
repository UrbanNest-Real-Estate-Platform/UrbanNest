import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    title: "Create Account",
    description:
      "Sign up as a buyer, seller, tenant, landlord or builder in just a few clicks."
  },
  {
    number: "02",
    title: "Explore Properties",
    description:
      "Search verified listings and builder projects using smart filters."
  },
  {
    number: "03",
    title: "Connect Securely",
    description:
      "Chat with owners, builders and agents while keeping your information protected."
  },
  {
    number: "04",
    title: "Close the Deal",
    description:
      "Buy, sell or rent confidently with complete transparency."
  }
];

function HowItWorks() {
  return (
    <section className="works-section" id="works">

      <span className="works-tag">
        SIMPLE PROCESS
      </span>

      <h2>
        How <span>UrbanNest</span> Works
      </h2>

      <p className="works-subtitle">
        Four simple steps to make your real estate journey smooth and hassle-free.
      </p>

      <div className="works-container">

        {steps.map((step, index) => (
          <div className="work-card" key={index}>

            <div className="step-number">
              {step.number}
            </div>

            <h3>{step.title}</h3>

            <p>{step.description}</p>

          </div>
        ))}

      </div>

    </section>
  );
}

export default HowItWorks;