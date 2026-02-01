import { useState, useEffect } from "react";
import "./Header.css";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  return (
    <header className={`header ${isScrolled ? "header--scrolled" : ""}`}>
      <div className="header__container">
        <div className="header__logo" onClick={() => scrollToSection("home")}>
          <img src="/assets/IndicationLOGO.png" alt="" />
        </div>
        <nav className="header__nav">
          <button
            className={`header__nav-link ${
              activeSection === "home" ? "header__nav-link--active" : ""
            }`}
            onClick={() => scrollToSection("home")}
          >
            Home
          </button>
          <button
            className={`header__nav-link ${
              activeSection === "agents" ? "header__nav-link--active" : ""
            }`}
            onClick={() => scrollToSection("agents")}
          >
            Agents
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
