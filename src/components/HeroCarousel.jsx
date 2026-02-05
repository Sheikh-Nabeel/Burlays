import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

const HeroCarousel = ({ scrollToSection, homeRef, menuRef, contactRef }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [slides, setSlides] = useState(() => {
    const savedBranch = localStorage.getItem('selectedBranch');
    if (savedBranch) {
      try {
        const branch = JSON.parse(savedBranch);
        if (branch.banners && Array.isArray(branch.banners) && branch.banners.length > 0) {
          return branch.banners.map(url => ({
            image: url,
            title: "",
            subtitle: "",
            description: ""
          }));
        }
      } catch (e) {
        console.error("Error parsing selectedBranch", e);
      }
    }
    // Default slides
    return [
      {
        image: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200",
        title: "Artisan Bakery",
        subtitle: "Fresh baked goods daily",
        description: "Experience the finest baked goods made with traditional recipes and premium ingredients.",
      },
      {
        image: "https://www.sweeco.lv/files/1338282/catitems/4compl-49af6e8b717ea744d11b5f37d5a9b799.jpg",
        title: "Gourmet Delights",
        subtitle: "Crafted with passion",
        description: "From classic breads to innovative pastries, taste the difference quality makes.",
      },
      {
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200",
        title: "Family Tradition",
        subtitle: "Since generations",
        description: "Bringing you authentic flavors passed down through generations of master bakers.",
      },
    ];
  });

  // Effect to fetch fresh banners if they are missing but we have a branch ID
  useEffect(() => {
    const fetchBannersIfNeeded = async () => {
      const savedBranch = localStorage.getItem('selectedBranch');
      if (!savedBranch) return;

      let branch = null;
      try {
        branch = JSON.parse(savedBranch);
      } catch (e) {
        return;
      }

      // If we already have banners, no need to fetch
      if (branch.banners && Array.isArray(branch.banners) && branch.banners.length > 0) return;

      // If we have an ID, try to find the fresh document
      if (branch.id) {
        try {
          let branchDoc = null;

          // If we have cityId (from new logic), try that first
          if (branch.cityId) {
            const docRef = doc(db, 'cities', branch.cityId, 'branches', branch.id);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
              branchDoc = snap.data();
            }
          }

          // If not found yet (stale data or missing cityId), search all cities
          if (!branchDoc) {
            const citiesSnap = await getDocs(collection(db, 'cities'));
            for (const cityDoc of citiesSnap.docs) {
              const possibleRef = doc(db, 'cities', cityDoc.id, 'branches', branch.id);
              const snap = await getDoc(possibleRef);
              if (snap.exists()) {
                branchDoc = snap.data();
                // Found it! Update local branch object with cityId for future
                branch.cityId = cityDoc.id; 
                break;
              }
            }
          }

          if (branchDoc && branchDoc.banners && Array.isArray(branchDoc.banners) && branchDoc.banners.length > 0) {
            // Update slides state
            const bannerSlides = branchDoc.banners.map(url => ({
              image: url,
              title: "",
              subtitle: "",
              description: ""
            }));
            setSlides(bannerSlides);

            // Update localStorage so we don't fetch next time
            const updatedBranch = { ...branch, ...branchDoc };
            localStorage.setItem('selectedBranch', JSON.stringify(updatedBranch));
          }
        } catch (error) {
          console.error("Error fetching fresh branch banners:", error);
        }
      }
    };

    fetchBannersIfNeeded();
  }, []); // Run once on mount


  useEffect(() => {
    if (slides.length === 0) return;
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
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? "bg-[#FFC72C]" : "bg-white bg-opacity-50"}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel
