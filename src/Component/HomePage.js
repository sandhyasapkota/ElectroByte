import React, { useState, useRef } from "react";
import "./HomePage.css";
import { pageData } from "./data.js"; // Import the data

// --- Reusable Components ---
const ProductCard = ({ image, name, price, oldPrice, rating, reviews }) => (
  <div className="product-card">
    <img src={image} alt={name} className="product-image" />
    <div className="product-rating">
      <span className="stars">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
      <span className="review-count">Reviews ({reviews})</span>
    </div>
    <h3 className="product-name">{name}</h3>
    {oldPrice && <p className="product-old-price">{oldPrice}</p>}
    <p className="product-price">{price}</p>
  </div>
);

const ProductCarousel = ({ products }) => {
  const scrollRef = useRef(null);
  const scroll = (direction) => {
    const { current } = scrollRef;
    if (direction === 'left') current.scrollLeft -= 300;
    else current.scrollLeft += 300;
  };
  return (
    <div className="product-scroll-container">
      <div className="scroll-arrow left" onClick={() => scroll('left')}>‹</div>
      <div className="products-grid" ref={scrollRef}>
        {products.map((product) => <ProductCard key={product.id} {...product} />)}
      </div>
      <div className="scroll-arrow right" onClick={() => scroll('right')}>›</div>
    </div>
  );
};

// --- Main HomePage Component ---
const HomePage = () => {
  const { mainBanner, sections, brands, instagram, testimonials, features } = pageData;
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  return (
    <div className="homepage-container">
      {/* --- Main Banner --- */}
      <div className="hero-banner">
        <img src={mainBanner} alt="Main Banner" className="banner-img" />
      </div>

      {/* --- Dynamic Product Sections --- */}
      {sections.map((section, index) => {
        switch (section.type) {
          case 'simple':
            return (
              <div key={index} className="simple-product-section">
                <div className="section-header">
                  <h2 className="section-title">{section.title}</h2>
                  <a href={section.seeAllLink} className="seeall">{section.seeAllText}</a>
                </div>
                <ProductCarousel products={section.products} />
              </div>
            );
          case 'withBanner':
            return (
              <div key={index} className="product-section-with-banner">
                <div className="side-banner"><img src={section.bannerImg} alt={`${section.title} banner`} /></div>
                <div className="product-content">
                  <div className="section-header">
                    <div className="section-header-left">
                      <h2 className="section-title">{section.title}</h2>
                      {section.subNav && (<div className="sub-nav">{section.subNav.map(item => <a href="#" key={item}>{item}</a>)}</div>)}
                    </div>
                    <a href={section.seeAllLink} className="seeall">See All</a>
                  </div>
                  <ProductCarousel products={section.products} />
                </div>
              </div>
            );
          default: return null;
        }
      })}

      {/* --- Brands Section --- */}
      <div className="brands-section">
        {brands.map((brand, index) => <img key={index} src={brand} alt={`brand-${index}`} className="brand-logo" />)}
      </div>

      {/* --- Instagram Section --- */}
      <div className="instagram-section">
        <h2 className="section-title">{instagram.title}</h2>
        <div className="instagram-grid">
          {instagram.posts.map((post) => (
            <div key={post.id} className="instagram-post">
              <img src={post.img} alt={`instagram-${post.id}`} />
              <p className="instagram-caption">{post.caption}</p>
              <span className="instagram-date">{post.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- Testimonial Section --- */}
      <div className="testimonial-section">
        <blockquote>"{testimonials[currentTestimonial].quote}"</blockquote>
        <cite>{testimonials[currentTestimonial].author}</cite>
        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <span key={index} className={`dot ${currentTestimonial === index ? 'active' : ''}`} onClick={() => setCurrentTestimonial(index)}></span>
          ))}
        </div>
      </div>

      {/* --- Features Section --- */}
      <div className="features-section">
        {features.map((feature, index) => (
          <div key={index} className="feature-item">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
