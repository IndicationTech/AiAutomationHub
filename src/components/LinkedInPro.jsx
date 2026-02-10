import { useState, useEffect, useRef } from "react";
import {
  FaRegCopy,
  FaDownload,
  FaRedoAlt,
  FaCheckCircle,
} from "react-icons/fa";
import "./LinkedInAgent.css"; // reuse same CSS or rename if needed

const LinkedInPro = () => {
  const [input, setInput] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const sectionRef = useRef(null);

  // Reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Generate preview
  const handleGenerate = async () => {
    if (!input.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a topic first.",
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

      if (!response.ok) throw new Error();

      const data = await response.json();
      setPreview(data);

      setMessage({
        type: "success",
        text: "Preview generated successfully.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Failed to generate preview.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate text
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
    } catch {
      setMessage({ type: "error", text: "Text regeneration failed." });
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate image
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
    } catch {
      setMessage({ type: "error", text: "Image regeneration failed." });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Open LinkedIn composer
  // const handleApprove = async () => {
  //   if (!preview?.text) return;

  //   try {
  //     await navigator.clipboard.writeText(preview.text);

  //     window.open(
  //       "https://www.linkedin.com/sharing/share-offsite/?url=${text}",
  //     );

  //     setMessage({
  //       type: "success",
  //       text: "Content copied! Paste it in LinkedIn post.",
  //     });
  //   } catch {
  //     setMessage({
  //       type: "error",
  //       text: "Copy failed. Please copy manually.",
  //     });
  //   }
  // };

  const handleApprove = async () => {
    if (!preview) return;

    try {
      // Copy caption text
      await navigator.clipboard.writeText(preview.text);

      // Download image automatically
      if (preview.image) {
        const imageSrc = preview.image.startsWith("data:image")
          ? preview.image
          : `data:image/png;base64,${preview.image}`;

        const response = await fetch(imageSrc);
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "linkedin_post.png";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      // Open LinkedIn feed
      window.open(
        "https://www.linkedin.com/sharing/share-offsite/?url=${text}",
      );

      setMessage({
        type: "success",
        text: "LinkedIn opened. Image downloaded & text copied. Paste caption and upload image to post.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Failed to prepare LinkedIn post.",
      });
    }
  };

  // const handleApprove = () => {
  //   const sharePage =
  //     "https://ramose-tayna-flowingly.ngrok-free.dev/post123.html";

  //   window.open(
  //     `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sharePage)}`,
  //     "_blank",
  //   );
  // };

  // Copy text
  const handleCopy = () => {
    if (!preview?.text) return;

    navigator.clipboard.writeText(preview.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download image
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
        <h2 className="linkedin-agent__title">LinkedIn Pro</h2>

        <p className="linkedin-agent__description">
          Generate LinkedIn posts, preview them, and continue to LinkedIn to
          publish.
        </p>

        {!preview && (
          <div className="linkedin-agent__form">
            <input
              type="text"
              className="linkedin-agent__input"
              placeholder="Enter topic or idea..."
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
            <h3>Post Preview</h3>

            <div className="linkedin-agent__preview-header">
              <button
                className="icon-btn"
                onClick={handleCopy}
                title="Copy Text"
              >
                {copied ? <FaCheckCircle /> : <FaRegCopy />}
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
              >
                🚀 Continue to LinkedIn
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

export default LinkedInPro;
