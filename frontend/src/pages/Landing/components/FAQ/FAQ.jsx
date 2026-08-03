import { useState } from "react";
import "./FAQ.css";

const faqData = [
  {
    question: "Is UrbanNest free to use?",
    answer:
      "Yes. Buyers, tenants, sellers and landlords can create an account and explore properties for free.",
  },
  {
    question: "How do property auctions work?",
    answer:
      "Builders and sellers can list auction properties. Buyers place bids in real time and the highest valid bid wins.",
  },
  {
    question: "Are all properties verified?",
    answer:
      "Every property goes through an admin verification process before becoming visible on the platform.",
  },
  {
    question: "Can builders manage multiple projects?",
    answer:
      "Yes. Builder accounts can manage multiple projects, listings, bookings and customer inquiries.",
  },
  {
    question: "Can I rent as well as buy properties?",
    answer:
      "Absolutely. UrbanNest supports buying, selling, renting and leasing from one unified platform.",
  },
];

function FAQ() {
  const [active, setActive] = useState(null);

  const toggleFAQ = (index) => {
    setActive(active === index ? null : index);
  };

  return (
    <section className="faq" id="faq">

      <span className="faq-tag">
        FREQUENTLY ASKED QUESTIONS
      </span>

      <h2>
        Got Questions?
        <span> We've Got Answers</span>
      </h2>

      <p>
        Everything you need to know before getting started with UrbanNest.
      </p>

      <div className="faq-container">

        {faqData.map((item, index) => (

          <div
            className={`faq-item ${active === index ? "active" : ""}`}
            key={index}
          >

            <div
              className="faq-question"
              onClick={() => toggleFAQ(index)}
            >
              <h3>{item.question}</h3>

              <span>{active === index ? "−" : "+"}</span>
            </div>

            {active === index && (
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            )}

          </div>

        ))}

      </div>

    </section>
  );
}

export default FAQ;