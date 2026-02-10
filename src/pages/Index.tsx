import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LinkedInAgent from "@/components/LinkedInAgent";
import ResearchAgent from "@/components/ResearchAgent";
import BlogAgent from "@/components/BlogAgent";
import EmailAgent from "@/components/EmailAgent";
import ImageGenerator from "@/components/ImageGenerator";
import VideoGenerator from "@/components/VideoGenerator";
import Chatbot from "@/components/chatbot";
import InstagramAgent from "@/components/InstagramAgent";
import FacebookAgent from "@/components/FacebookAgent";
import LinkedInPro from "@/components/LinkedInPro";
import InstagramPro from "@/components/InstagramPro";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <div id="agents">
          <Chatbot />
          <ImageGenerator />
          <VideoGenerator />
          <LinkedInAgent />
          <InstagramAgent />
          <FacebookAgent />
          <ResearchAgent />
          <BlogAgent />
          <EmailAgent />
          <LinkedInPro />
          <InstagramPro />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
