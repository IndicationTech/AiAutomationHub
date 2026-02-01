import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LinkedInAgent from "@/components/LinkedInAgent";
import ResearchAgent from "@/components/ResearchAgent";
import BlogAgent from "@/components/BlogAgent";
import EmailAgent from "@/components/EmailAgent";
import ImageGenerator from "@/components/ImageGenerator";
import VideoGenerator from "@/components/VideoGenerator";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <div id="agents">
          <ImageGenerator />
          <VideoGenerator />
          <LinkedInAgent />
          <ResearchAgent />
          <BlogAgent />
          <EmailAgent />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
