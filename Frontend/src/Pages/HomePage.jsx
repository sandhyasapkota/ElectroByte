import React, { useState, useRef } from 'react';
import { pageData } from './data.jsx';
import Navbar from '../Component/Navbar.jsx';
import Footer from '../Component/Footer.jsx';

// --- Reusable Components ---
const ProductCard = ({ image, name, price, oldPrice, rating, reviews }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 flex-shrink-0 w-60">
    <img src={image} alt={name} className="w-full h-45 object-contain mb-4" />
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
      <span className="text-yellow-400">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
      <span>Reviews ({reviews})</span>
    </div>
    <h3 className="text-sm font-medium h-10 overflow-hidden mb-2">{name}</h3>
    {oldPrice && <p className="text-sm text-gray-500 line-through">{oldPrice}</p>}
    <p className="text-base font-semibold text-gray-800">{price}</p>
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
   
    
    <div className="relative">
      <div 
        className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white/90 border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer z-10 shadow-md text-2xl text-gray-800 hover:bg-white hover:border-gray-400 select-none"
        onClick={() => scroll('left')}
      >
        ‹
      </div>
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-5 pb-5 scroll-smooth scrollbar-hide"
      >
        {products.map((product) => <ProductCard key={product.id} {...product} />)}
      </div>
      <div 
        className="absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white/90 border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer z-10 shadow-md text-2xl text-gray-800 hover:bg-white hover:border-gray-400 select-none"
        onClick={() => scroll('right')}
      >
        ›
      </div>
    </div>
  );
};

// --- Main HomePage Component ---
const HomePage = () => {
  const { mainBanner, sections, brands, instagram, testimonials, features } = pageData;
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  return (
    <div>
      {/* --- Navbar --- */}
      <Navbar />

      {/* --- Main Content --- */}
      <div className="px-12 py-5 font-['Poppins']">
        {/* --- Main Banner --- */}
        <div className="w-full mb-10">
          <img src={mainBanner} alt="Main Banner" className="w-full h-auto rounded-lg" />
        </div>

        {/* --- Dynamic Product Sections --- */}
        {sections.map((section, index) => {
          switch (section.type) {
            case 'simple':
              return (
                <div key={index} className="mb-10 pb-10 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl text-gray-800 whitespace-nowrap">{section.title}</h2>
                    <a href={section.seeAllLink} className="text-blue-600 underline text-sm font-medium">{section.seeAllText}</a>
                  </div>
                  <ProductCarousel products={section.products} />
                </div>
              );
            case 'withBanner':
              return (
                <div key={index} className="flex gap-7 mb-10">
                  <div className="flex-shrink-0 w-64">
                    <img src={section.bannerImg} alt={`${section.title} banner`} className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-5">
                        <h2 className="text-2xl text-gray-800 whitespace-nowrap">{section.title}</h2>
                        {section.subNav && (
                          <div className="flex gap-4">
                            {section.subNav.map(item => (
                              <a href="#" key={item} className="no-underline text-gray-600 text-sm hover:text-blue-600">{item}</a>
                            ))}
                          </div>
                        )}
                      </div>
                      <a href={section.seeAllLink} className="text-blue-600 underline text-sm font-medium">See All</a>
                    </div>
                    <ProductCarousel products={section.products} />
                  </div>
                </div>
              );
            default: return null;
          }
        })}

        {/* --- Brands Section --- */}
        <div className="flex justify-around items-center py-5 my-10 border-t border-b border-gray-200 gap-5 flex-wrap">
          {brands.map((brand, index) => (
            <img 
              key={index} 
              src={brand} 
              alt={`brand-${index}`} 
              className="h-9 opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300" 
            />
          ))}
        </div>

        {/* --- Instagram Section --- */}
        <div className="text-center mb-10">
          <h2 className="text-2xl text-gray-800 mb-5">{instagram.title}</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mt-5">
            {instagram.posts.map((post) => (
              <div key={post.id} className="text-left">
                <img src={post.img} alt={`instagram-${post.id}`} className="w-4/5 h-4/5 object-cover rounded-lg mb-2" />
                <p className="text-sm leading-relaxed m-0 mb-1">{post.caption}</p>
                <span className="text-xs text-gray-500">{post.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- Testimonial Section --- */}
        <div className="bg-gray-50 rounded-lg p-10 text-center max-w-3xl mx-auto my-10">
          <blockquote className="text-lg italic leading-relaxed border-0 m-0 mb-5 min-h-[120px]">
            "{testimonials[currentTestimonial].quote}"
          </blockquote>
          <cite className="font-semibold block mb-5">{testimonials[currentTestimonial].author}</cite>
          <div className="flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <span 
                key={index} 
                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors duration-300 ${currentTestimonial === index ? 'bg-blue-600' : 'bg-gray-300'}`}
                onClick={() => setCurrentTestimonial(index)}
              ></span>
            ))}
          </div>
        </div>

        {/* --- Features Section --- */}
        <div className="flex justify-around text-center py-10 gap-7">
          {features.map((feature, index) => (
            <div key={index} className="max-w-[250px]">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white inline-flex items-center justify-center text-2xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- Footer --- */}
      <Footer />
    </div>
  );
};

export default HomePage;
