import "./Testimonials.css";

const reviews = [
  {
    name: "Priya Sharma",
    city: "Ahmedabad",
    image: "https://i.pravatar.cc/150?img=32",
    review:
      "UrbanNest made buying our first apartment incredibly simple. The verified listings gave us complete confidence.",
    rating: 5,
  },
  {
    name: "Rahul Mehta",
    city: "Mumbai",
    image: "https://i.pravatar.cc/150?img=15",
    review:
      "The property matching feature is fantastic. Everything was transparent and I found a great investment property.",
    rating: 5,
  },
  {
    name: "Sneha Patel",
    city: "Surat",
    image: "https://i.pravatar.cc/150?img=48",
    review:
      "I rented my flat within a week. The platform is clean, modern and very easy to use.",
    rating: 5,
  },
];

function Testimonials() {
  return (
    <section className="testimonials" id="reviews">

      <span className="testimonial-tag">
        TESTIMONIALS
      </span>

      <h2>
        What Our <span>Users Say</span>
      </h2>

      <p className="testimonial-subtitle">
        Thousands of buyers, sellers and builders trust UrbanNest every day.
      </p>

      <div className="testimonial-grid">

        {reviews.map((item, index) => (

          <div className="testimonial-card" key={index}>

            <div className="stars">
              ⭐⭐⭐⭐⭐
            </div>

            <p className="review">
              "{item.review}"
            </p>

            <div className="user">

              <img src={item.image} alt={item.name} />

              <div>

                <h4>{item.name}</h4>

                <span>{item.city}</span>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Testimonials;