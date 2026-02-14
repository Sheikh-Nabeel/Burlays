import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

const HeroCarousel = ({ scrollToSection, homeRef, menuRef, contactRef }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [slides, setSlides] = useState([]); // Start empty, will fill from effect

  useEffect(() => {
    const fetchBannersIfNeeded = async () => {
      // 1. Check if we have a selected branch
      const savedBranch = localStorage.getItem('selectedBranch');
      
      if (savedBranch) {
          try {
              const branch = JSON.parse(savedBranch);
              // If branch has banners, we are good (already set in initial state)
              if (branch.banners && Array.isArray(branch.banners) && branch.banners.length > 0) {
                  const bannerSlides = branch.banners.map(url => ({ image: url }));
                  setSlides(bannerSlides);
                  return;
              }
              
              // If branch has no banners, try to fetch fresh data for this branch
              if (branch.id && branch.cityId) {
                  const docRef = doc(db, 'cities', branch.cityId, 'branches', branch.id);
                  const snap = await getDoc(docRef);
                  if (snap.exists()) {
                      const data = snap.data();
                      if (data.banners && data.banners.length > 0) {
                          const bannerSlides = data.banners.map(url => ({ image: url }));
                          setSlides(bannerSlides);
                          // Update local storage
                          localStorage.setItem('selectedBranch', JSON.stringify({ ...branch, banners: data.banners }));
                          return;
                      }
                  }
              }
          } catch (e) {
              console.error("Error parsing saved branch", e);
          }
      }

      // 2. Fallback: If no branch selected OR selected branch has no banners
      // Fetch ANY branch that has banners to avoid showing static placeholder images
      try {
          // Get all cities
          const citiesSnap = await getDocs(collection(db, 'cities'));
          
          for (const cityDoc of citiesSnap.docs) {
              // Get branches for this city
              const branchesSnap = await getDocs(collection(db, `cities/${cityDoc.id}/branches`));
              
              // Find first branch with banners
              const branchWithBanners = branchesSnap.docs.find(doc => {
                  const data = doc.data();
                  return data.banners && Array.isArray(data.banners) && data.banners.length > 0;
              });

              if (branchWithBanners) {
                  const data = branchWithBanners.data();
                  const bannerSlides = data.banners.map(url => ({ image: url }));
                  setSlides(bannerSlides);
                  return; // Found one, exit
              }
          }
      } catch (error) {
          console.error("Error fetching fallback banners:", error);
      }
    };

    fetchBannersIfNeeded();
  }, []);


  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative aspect-[3/1] w-full bg-gray-100">
        {slides.length > 0 ? (
          slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title || "Banner"}
                className="w-full h-full object-cover"
              />
            </div>
          ))
        ) : (
          // Placeholder or Loading State
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
             <span className="text-gray-400">Loading Banners...</span>
          </div>
        )}

      {/* Slide Indicators - Only show if we have multiple slides */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? "bg-[#FFC72C]" : "bg-white bg-opacity-50"}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default HeroCarousel
