import React, { useState, useEffect } from 'react'

const HeroCarousel = ({ scrollToSection, homeRef, menuRef, contactRef }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200",
      title: "Artisan Bakery",
      subtitle: "Fresh baked goods daily",
      description:
        "Experience the finest baked goods made with traditional recipes and premium ingredients.",
    },
    {
      image:
        "https://www.sweeco.lv/files/1338282/catitems/4compl-49af6e8b717ea744d11b5f37d5a9b799.jpg",
      title: "Gourmet Delights",
      subtitle: "Crafted with passion",
      description:
        "From classic breads to innovative pastries, taste the difference quality makes.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200",
      title: "Family Tradition",
      subtitle: "Since generations",
      description:
        "Bringing you authentic flavors passed down through generations of master bakers.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative h-[40vh] md:h-[60vh]">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-4">
                {slide.title}
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl mb-6 text-primary">
                {slide.subtitle}
              </p>
              <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto">
                {slide.description}
              </p>
              <button
                onClick={() => scrollToSection(menuRef)}
                className="bg-primary bg-red-600 hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-semibold transition-colors"
              >
                Explore Menu
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-primary" : "bg-white bg-opacity-50"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel
