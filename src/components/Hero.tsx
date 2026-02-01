import "./Hero.css";

const Hero = () => {
  const scrollToAgents = () => {
    const element = document.getElementById("agents");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="hero">
      <div className="hero__overlay"></div>
      <div className="hero__content">
        <h1 className="hero__title">Automate Smarter with AI-Powered Agents</h1>
        <p className="hero__subtitle">
          One platform. Four powerful tools for creators and professionals.
        </p>
        <button className="hero__cta" onClick={scrollToAgents}>
          Explore Agents
        </button>
      </div>
    </section>
  );
};

export default Hero;
