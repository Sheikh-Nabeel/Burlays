import { useState, useEffect, useRef } from "react";
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

  const homeRef = useRef(null);
  const menuRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

        <section>
          <BlogSection />
        </section>
 
      </main>

      <Footer />
    </div>
  );
}

export default Home;
