import { useState, useEffect, useRef } from "react";
import {
  FaRegCopy,
  FaDownload,
  FaRedoAlt,
  FaCheckCircle,
} from "react-icons/fa";
import "./LinkedInAgent.css";

const LinkedInAgent = () => {
  const [input, setInput] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const sectionRef = useRef(null);

  // 👀 Reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // ✅ Generate Preview (Text + Image)
  const handleGenerate = async () => {
    if (!input.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a topic or idea first.",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setPreview(null);

    try {
      const response = await fetch(
        "http://localhost:5678/webhook/generate-preview",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: input }),
        },
      );

      if (!response.ok) throw new Error("Failed to generate preview");

      const data = await response.json();
      setPreview(data);
      setMessage({
        type: "success",
        text: "✅ Preview generated! Review before posting.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "❌ Something went wrong while generating preview.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Regenerate only TEXT
  const handleRegenerateText = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5678/webhook/regenerate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: input }),
      });
      const data = await res.json();
      setPreview((prev) => ({ ...prev, text: data.text }));
    } catch (err) {
      setMessage({ type: "error", text: "❌ Failed to regenerate text." });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Regenerate only IMAGE
  const handleRegenerateImage = async () => {
    if (!preview?.text) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5678/webhook/regenerate-image",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: preview.text }),
        },
      );
      const data = await res.json();
      setPreview((prev) => ({ ...prev, image: data.image }));
    } catch (err) {
      setMessage({ type: "error", text: "❌ Failed to regenerate image." });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Approve & Post
  const handleApprove = async () => {
    if (!preview) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5678/webhook/post-to-linkedin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preview),
        },
      );

      if (!response.ok) throw new Error("Failed to post on LinkedIn");

      setMessage({
        type: "success",
        text: "✅ Successfully posted to LinkedIn!",
      });
      setPreview(null);
      setInput("");
    } catch (error) {
      setMessage({ type: "error", text: "❌ Failed to post on LinkedIn." });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Copy Text
  const handleCopy = () => {
    if (preview?.text) {
      navigator.clipboard.writeText(preview.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ✅ Download Image
  const handleDownload = () => {
    if (!preview?.image) return;
    const link = document.createElement("a");
    link.href = preview.image.startsWith("data:image")
      ? preview.image
      : `data:image/png;base64,${preview.image}`;
    link.download = "linkedin_post_image.png";
    link.click();
  };

  return (
    <section
      ref={sectionRef}
      className={`linkedin-agent ${isVisible ? "linkedin-agent--visible" : ""}`}
    >
      <div className="linkedin-agent__container">
        <h2 className="linkedin-agent__title">LinkedIn Content Agent</h2>
        <p className="linkedin-agent__description">
          Generate engaging LinkedIn post ideas, preview them, and post directly
          after approval.
        </p>

        {!preview && (
          <div className="linkedin-agent__form">
            <input
              type="text"
              className="linkedin-agent__input"
              placeholder="Enter your topic or idea..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              className="linkedin-agent__button"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate Content"}
            </button>
          </div>
        )}

        {preview && (
          <div className="linkedin-agent__preview">
            <h3>📝 Post Preview</h3>

            <div className="linkedin-agent__preview-header">
              <button
                className="icon-btn"
                onClick={handleCopy}
                title="Copy Text"
              >
                {copied ? <FaCheckCircle color="#22c55e" /> : <FaRegCopy />}
              </button>
              <button
                className="icon-btn"
                onClick={handleRegenerateText}
                title="Regenerate Text"
              >
                <FaRedoAlt />
              </button>
            </div>

            <p className="linkedin-agent__preview-text">{preview.text}</p>

            {preview.image && (
              <div className="linkedin-agent__image-wrapper">
                <img
                  src={
                    preview.image.startsWith("data:image")
                      ? preview.image
                      : `data:image/png;base64,${preview.image}`
                  }
                  alt="Generated preview"
                  className="linkedin-agent__preview-image"
                />
                <div className="linkedin-agent__image-actions">
                  <button
                    className="icon-btn"
                    onClick={handleDownload}
                    title="Download Image"
                  >
                    <FaDownload />
                  </button>
                  <button
                    className="icon-btn"
                    onClick={handleRegenerateImage}
                    title="Regenerate Image"
                  >
                    <FaRedoAlt />
                  </button>
                </div>
              </div>
            )}

            <div className="linkedin-agent__preview-actions">
              <button
                className="linkedin-agent__button"
                onClick={handleApprove}
                disabled={isLoading}
              >
                ✅ Approve & Post
              </button>
            </div>
          </div>
        )}

        {message && (
          <p
            className={`linkedin-agent__message ${
              message.type === "success"
                ? "linkedin-agent__message--success"
                : "linkedin-agent__message--error"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </section>
  );
};

export default LinkedInAgent;
