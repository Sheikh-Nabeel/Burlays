import { useState, useEffect, useRef } from "react";
import SplashScreen from "./SplashScreen";
import Header from "./Header";
import HeroCarousel from "./HeroCarousel";
import CategoriesGrid from "./CategoriesGrid";
import StoreLocator from "./StoreLocator";
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
    <div className="bg-black min-h-screen">
      <Header
        scrollToSection={scrollToSection}
        homeRef={homeRef}
        menuRef={menuRef}
        contactRef={contactRef}
      />

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

        {/* <section>
          <SignatureOfferings />
        </section> */}

        <section ref={contactRef}>
          <StoreLocator />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
