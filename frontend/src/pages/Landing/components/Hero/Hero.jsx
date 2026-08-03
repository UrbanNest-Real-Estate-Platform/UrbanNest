import "./Hero.css";
import { Link } from "react-router-dom";

function Hero() {

    return (

        <section className="hero">

            <div className="hero-left">
                <h1>

                    Find Your Next

                    <span> Perfect Property</span>

                </h1>

                <p>

                    Buy, sell, rent, or bid on verified properties across India.

                    One account, zero hassle with AI powered insights.

                </p>

                <div className="hero-buttons">

                    <Link to="/login" className="primary-btn">
                        Start Exploring →
                    </Link>
                    
                </div>

                <div className="stats">

                    <div>

                        <h2>48,200+</h2>

                        <p>Properties Listed</p>

                    </div>

                    <div>

                        <h2>12,800+</h2>

                        <p>Happy Clients</p>

                    </div>

                    <div>

                        <h2>120+</h2>

                        <p>Cities Covered</p>

                    </div>

                    <div>

                        <h2>21</h2>

                        <p>Avg Days to Sell</p>

                    </div>

                </div>

            </div>

            <div className="hero-right">

                <img

                    src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200"

                    alt="house"

                />

                <div className="floating one">

                    Ownership Transferred

                </div>

                <div className="floating two">

                    Live Auction

                    ₹2.4 Crore

                </div>

                <div className="floating three">

                    48 Properties Near You

                </div>

            </div>

        </section>

    )

}

export default Hero;