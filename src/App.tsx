import { useEffect } from "react";
import Hero from "./sections/Hero";
import Navbar from "./sections/Navbar";
import ServiceSummary from "./sections/ServiceSummary";
import Services from "./sections/Services";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import About from "./sections/About";
import Works from "./sections/Works";

gsap.registerPlugin(ScrollTrigger);

const App = () => {
  useEffect(() => {
    // Simple CSS smooth scrolling
    document.documentElement.style.scrollBehavior = "smooth";

    // Update ScrollTrigger on scroll
    const handleScroll = () => {
      ScrollTrigger.update();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <ServiceSummary />
      <Services />
      <About />
      <Works />
    </div>
  );
};

export default App;
