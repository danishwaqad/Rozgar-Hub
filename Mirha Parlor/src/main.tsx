import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'

const services = [
  {
    name: 'Bridal & Party Makeup',
    detail: 'Flawless makeup finish with long-lasting event-ready glam.',
  },
  {
    name: 'Hair Styling & Haircuts',
    detail: 'Trendy cuts and smooth styling matched to your face shape.',
  },
  {
    name: 'Facials & Skin Care',
    detail: 'Deep cleansing and glow-focused facials for healthy skin.',
  },
  {
    name: 'Manicure & Pedicure',
    detail: 'Clean, relaxing nail care for a polished and fresh look.',
  },
  {
    name: 'Waxing & Threading',
    detail: 'Gentle hair removal with hygienic tools and expert precision.',
  },
  {
    name: 'Henna & Event Glam',
    detail: 'Elegant henna designs and complete event beauty preparation.',
  },
  {
    name: 'Keratin & Hair Treatment',
    detail: 'Frizz-control and repair treatment for smooth shiny hair.',
  },
  {
    name: 'Protein & Rebonding',
    detail: 'Advanced straightening and strengthening for manageable hair.',
  },
  {
    name: 'Hydra Facial',
    detail: 'Hydration-rich facial to refresh dull skin instantly.',
  },
  {
    name: 'Signature Blow Dry',
    detail: 'Volume and bounce styling for formal and casual occasions.',
  },
]

const packages = [
  {
    name: 'Bridal Signature',
    price: 'PKR 35,000+',
    details: 'HD bridal makeup, hairstyle, lashes, and dupatta setting.',
  },
  {
    name: 'Party Glam',
    price: 'PKR 8,000+',
    details: 'Event makeup with custom skin prep and long-lasting finish.',
  },
  {
    name: 'Self Care Deluxe',
    price: 'PKR 6,500+',
    details: 'Facial, manicure, pedicure, and relaxing salon experience.',
  },
]

const testimonials = [
  {
    name: 'Ayesha K.',
    feedback:
      'Very clean environment and excellent makeup quality. Highly recommended for events.',
  },
  {
    name: 'Hina R.',
    feedback:
      'Staff is very professional and friendly. My hair styling result was exactly what I wanted.',
  },
  {
    name: 'Sana M.',
    feedback:
      'Best salon experience in Khanewal for me. Great service and beautiful final look.',
  },
]

const galleryImages = [
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
]

const galleryFallback =
  'https://images.unsplash.com/photo-1523263685509-57c1d050d19b?auto=format&fit=crop&w=1200&q=80'

const weekHours = [
  { day: 'Monday', time: '10 AM - 10 PM' },
  { day: 'Tuesday', time: '10 AM - 10 PM' },
  { day: 'Wednesday', time: '10 AM - 10 PM' },
  { day: 'Thursday', time: '10 AM - 10 PM' },
  { day: 'Friday', time: '10 AM - 10 PM' },
  { day: 'Saturday', time: '10 AM - 10 PM' },
  { day: 'Sunday', time: '10 AM - 10 PM' },
]

function App() {
  return (
    <div className="page">
      <header className="hero">
        <div className="hero__overlay" />
        <div className="container">
          <nav className="topbar">
            <div className="brand-wrap">
              <img src="/mirha-logo.svg" alt="Mirha's Salon logo" className="brand-logo" />
              <span className="brand">MIRHA&apos;S SALON KHANEWAL</span>
            </div>
            <a className="topbar__cta" href="tel:+923261883327">
              Call Now
            </a>
          </nav>
          <div className="hero__content">
            <p className="eyebrow">Open Daily - 10 AM to 10 PM</p>
            <h1>Luxury Beauty Care in the Heart of Khanewal</h1>
            <p>
              Mirha&apos;s Salon delivers modern beauty services with expert care, premium
              products, and a welcoming atmosphere for every client.
            </p>
            <div className="hero__actions">
              <a className="btn btn--primary" href="tel:+923261883327">
                Call +92 326 1883327
              </a>
              <a className="btn btn--ghost" href="#services">
                Explore Services
              </a>
            </div>
            <div className="hero__badges">
              <span>Premium Products</span>
              <span>Experienced Artists</span>
              <span>Hygienic Environment</span>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="section section--stats">
          <div className="container">
            <div className="stats-grid">
              <article>
                <h3>500+</h3>
                <p>Happy Clients</p>
              </article>
              <article>
                <h3>6+</h3>
                <p>Beauty Categories</p>
              </article>
              <article>
                <h3>7 Days</h3>
                <p>Open Every Week</p>
              </article>
            </div>
          </div>
        </section>

        <section id="services" className="section section--light">
          <div className="container">
            <h2>Signature Services</h2>
            <div className="services-grid">
              {services.map((service) => (
                <article key={service.name} className="card card--service">
                  <h3>{service.name}</h3>
                  <p>{service.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--dark">
          <div className="container">
            <div className="about">
              <div>
                <h2>Why Clients Choose Mirha&apos;s</h2>
                <p>
                  Located at Gol Chowk, Gulberg, Mirha&apos;s Salon combines elegance and
                  hygiene with personalized beauty consultations.
                </p>
                <p>
                  Whether it&apos;s your everyday look or your biggest event, our team helps
                  you look confident and feel your best.
                </p>
              </div>
              <aside className="rating-box">
                <p className="rating-box__label">Google Presence</p>
                <p className="rating-box__status">Open now</p>
                <p className="rating-box__code">Mirha's Salon, Gol Chowk, Gulberg, Khanewal, Pakistan</p>
              </aside>
            </div>
          </div>
        </section>

        <section className="section section--light">
          <div className="container">
            <div className="section__heading">
              <h2>Popular Beauty Packages</h2>
              <p>Specially curated combinations for events and self-care days.</p>
            </div>
            <div className="package-wrap">
              <div className="package-grid">
                {packages.map((item) => (
                  <article key={item.name} className="package-card">
                    <p className="package-card__name">{item.name}</p>
                    <h3>{item.price}</h3>
                    <p>{item.details}</p>
                    <a href="tel:+923261883327">Book this package</a>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="hours" className="section section--light">
          <div className="container">
            <h2>Opening Hours</h2>
            <ul className="hours-list">
              {weekHours.map((entry) => (
                <li key={entry.day}>
                  <span className="hours-list__day">{entry.day}</span>
                  <span className="hours-list__time">{entry.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section--dark">
          <div className="container">
            <div className="section__heading">
              <h2>What Our Clients Say</h2>
              <p>Real feedback from valued clients who trust Mirha&apos;s Salon.</p>
            </div>
            <div className="testimonial-grid">
              {testimonials.map((item) => (
                <article key={item.name} className="testimonial-card">
                  <p>&quot;{item.feedback}&quot;</p>
                  <h3>{item.name}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--light">
          <div className="container">
            <div className="section__heading">
              <h2>Salon Gallery</h2>
              <p>Beautiful moments, elegant styling, and premium beauty results.</p>
            </div>
            <div className="gallery-grid">
              {galleryImages.map((img, index) => (
                <article key={img} className="gallery-card">
                  <img
                    src={img}
                    alt={`Mirha's Salon beauty work ${index + 1}`}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = galleryFallback
                    }}
                  />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section section--accent">
          <div className="container">
            <h2>Visit or Contact Us</h2>
            <p>Mirha&apos;s Salon, Gol Chowk, Gulberg, Khanewal, Pakistan</p>
            <p>
              Phone: <a href="tel:+923261883327">+92 326 1883327</a>
            </p>
            <a
              className="btn btn--primary"
              href="https://maps.google.com/?q=Mirha%27s+Salon+Gol+Chowk+Gulberg+Khanewal+Pakistan"
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
        </section>
      </main>

      <a
        className="floating-whatsapp"
        href="https://wa.me/923261883327?text=Assalamualaikum%20Mirha%27s%20Salon%2C%20I%20want%20to%20book%20an%20appointment."
        target="_blank"
        rel="noreferrer"
      >
        WhatsApp
      </a>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
