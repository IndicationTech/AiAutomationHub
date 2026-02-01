import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "./ResearchAgent.css";

const ResearchAgent = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // const handleResearch = async () => {
  //   if (!query.trim()) {
  //     alert("Please enter a research topic first.");
  //     return;
  //   }

  //   setIsLoading(true);
  //   setError("");
  //   setResponse("");

  //   const webhookUrl =
  //     // "http://localhost:5678/webhook/90b8fdd9-9025-41e7-b468-0a5b0f8c8f31";
  //     "http://localhost:5678/webhook-test/90b8fdd9-9025-41e7-b468-0a5b0f8c8f31";

  //   try {
  //     const res = await fetch(webhookUrl, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ text: query }),
  //     });

  //     if (!res.ok) {
  //       throw new Error("Failed to connect to webhook");
  //     }

  //     const aiResponse = await res.text();

  //     // ✅ Clean and normalize AI text
  //     const formatted = aiResponse.replace(/\\n/g, "\n").trim();

  //     setResponse(formatted || "No response received from AI.");
  //   } catch (err: any) {
  //     console.error("Error connecting to webhook:", err);
  //     setError(err.message || "Failed to fetch AI research result.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleResearch = async () => {
    if (!query.trim()) {
      alert("Please enter a research topic first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResponse("");

    const webhookUrl =
      "http://localhost:5678/webhook/90b8fdd9-9025-41e7-b468-0a5b0f8c8f31";

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: query }),
      });

      if (!res.ok) {
        throw new Error("Failed to connect to webhook");
      }

      const aiResponseText = await res.text();

      // ✅ Parse JSON and extract only the text
      let cleanText = "";
      try {
        const parsed = JSON.parse(aiResponseText);
        cleanText = parsed.text || "No response received from AI.";
      } catch (e) {
        // fallback if not JSON
        cleanText = aiResponseText || "No response received from AI.";
      }

      // ✅ Replace escaped newlines and trim
      const formatted = cleanText.replace(/\\n/g, "\n").trim();

      setResponse(formatted);
    } catch (err: any) {
      console.error("Error connecting to webhook:", err);
      setError(err.message || "Failed to fetch AI research result.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`research-agent ${isVisible ? "research-agent--visible" : ""}`}
    >
      <div className="research-agent__container">
        <h2 className="research-agent__title">Multi-Agent Research Analyst</h2>
        <p className="research-agent__description">
          Conduct deep, AI-powered research across multiple sources and get
          summarized insights instantly.
        </p>

        {/* Input Section */}
        <div className="research-agent__input-section">
          <input
            type="text"
            className="research-agent__input"
            placeholder="Enter a research topic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          <button
            className="research-agent__button"
            onClick={handleResearch}
            disabled={isLoading}
          >
            {isLoading ? "Researching..." : "Start Research"}
          </button>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="research-agent__progress">
            <p>🪄Gathering insights... please wait.</p>
            <div className="research-agent__progress-bar">
              <div
                className="research-agent__progress-fill"
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && <p className="research-agent__error">❌ {error}</p>}

        {/* ✅ AI Response with Markdown Rendering */}
        {response && !isLoading && (
          <div className="research-agent__response">
            <h3 className="research-agent__response-title">AI Findings:</h3>
            <div
              className="research-agent__response-text"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked(response) as string),
              }}
            ></div>
          </div>
        )}

        <p className="research-agent__note">
          Note: The AI will analyze and summarize your topic using multi-agent
          reasoning.
        </p>
      </div>
    </section>
  );
};

export default ResearchAgent;
