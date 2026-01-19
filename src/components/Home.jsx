import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import SplashScreen from "./SplashScreen";
import HeroCarousel from "./HeroCarousel";
import CategoriesGrid from "./CategoriesGrid";
import BrandHighlights from "./BrandHighlights";
import DownloadApp from "./DownloadApp";
import BlogSection from "./BlogSection";
import BranchesSection from "./BranchesSection";
import Footer from "./Footer";
import SignatureOfferings from "./SignatureOfferings";

function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const homeRef = useRef(null);
  const menuRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (location.hash === '#blogs-section') {
      const element = document.getElementById('blogs-section');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location, isLoading]);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div className="bg-white min-h-screen text-darkSecondary">
      <main>
        <section ref={homeRef}>
          <HeroCarousel
            scrollToSection={scrollToSection}
            homeRef={homeRef}
            menuRef={menuRef}
            contactRef={contactRef}
          />
        </section>

        <section ref={menuRef}>
          <CategoriesGrid />
        </section>

        <section>
          <BrandHighlights />
        </section>

        <section>
          <DownloadApp />
        </section>

        <section id="blogs-section">
          <BlogSection />
        </section>
 
      </main>

      <Footer />
    </div>
  );
}

export default Home;
