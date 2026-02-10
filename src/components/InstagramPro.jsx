import { useState, useEffect, useRef } from "react";
import {
  FaRegCopy,
  FaDownload,
  FaRedoAlt,
  FaCheckCircle,
} from "react-icons/fa";
import "./InstagramAgent.css";

const InstagramPro = () => {
  const [input, setInput] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const sectionRef = useRef(null);

  /* Reveal animation */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  /* Generate preview */
  const handleGenerate = async () => {
    if (!input.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a topic first.",
      });
      return;
    }

    setIsLoading(true);
    setPreview(null);

    try {
      const response = await fetch(
        "http://localhost:5678/webhook/instagram-post",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: input }),
        },
      );

      const data = await response.json();

      setPreview({
        text: data.captionText || data.caption || "",
        image: data.ImageUrl || data.image || "",
        raw: data,
      });

      setMessage({
        type: "success",
        text: "Preview generated!",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Failed to generate preview.",
      });
    }

    setIsLoading(false);
  };

  /* Regenerate caption */
  const handleRegenerateText = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5678/webhook/regenerate-instagram-caption",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: input }),
        },
      );

      const data = await res.json();
      const payload = Array.isArray(data) ? data[0] : data;

      setPreview((prev) => ({
        ...prev,
        text: payload.caption || payload.output || "",
      }));
    } catch {
      setMessage({
        type: "error",
        text: "Caption regeneration failed.",
      });
    }

    setIsLoading(false);
  };

  /* Regenerate image */
  const handleRegenerateImage = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5678/webhook/regenerate-instagram-image",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: input }),
        },
      );

      const data = await res.json();
      const payload = Array.isArray(data) ? data[0] : data;

      setPreview((prev) => ({
        ...prev,
        image: payload.image || payload.secure_url || payload.url,
      }));
    } catch {
      setMessage({
        type: "error",
        text: "Image regeneration failed.",
      });
    }

    setIsLoading(false);
  };

  /* Copy caption */
  const handleCopy = async () => {
    if (!preview?.text) return;

    await navigator.clipboard.writeText(preview.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Download image */
  const handleDownload = async () => {
    if (!preview?.image) return;

    try {
      const response = await fetch(preview.image);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "instagram_post.jpg";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  /* Continue to Instagram */
  const handleContinueInstagram = async () => {
    if (!preview) return;

    try {
      // Copy caption
      await navigator.clipboard.writeText(preview.text);

      // Download image
      const response = await fetch(preview.image);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "instagram_post.jpg";
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Open Instagram
      window.open("https://www.instagram.com/", "_blank");

      setMessage({
        type: "success",
        text: "Instagram opened. Caption copied & image downloaded. Upload image and paste caption to post.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Failed to prepare Instagram post.",
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`instagram-agent ${
        isVisible ? "instagram-agent--visible" : ""
      }`}
    >
      <div className="instagram-agent__container">
        <h2 className="instagram-agent__title">
          Instagram Content Generator Pro
        </h2>

        <p className="instagram-agent__description">
          Generate Instagram posts, preview them, and publish instantly.
        </p>

        {!preview && (
          <div className="instagram-agent__form">
            <input
              className="instagram-agent__input"
              placeholder="Enter topic..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />

            <button
              className="instagram-agent__button"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        )}

        {preview && (
          <div className="instagram-agent__preview">
            <h3>Instagram Preview</h3>

            <div className="instagram-agent__preview-header">
              <button className="icon-btn" onClick={handleCopy}>
                {copied ? <FaCheckCircle color="#22c55e" /> : <FaRegCopy />}
              </button>

              <button className="icon-btn" onClick={handleRegenerateText}>
                <FaRedoAlt />
              </button>
            </div>

            <p className="instagram-agent__preview-text">{preview.text}</p>

            <div className="instagram-agent__image-wrapper">
              <img
                src={preview.image}
                alt="Preview"
                className="instagram-agent__preview-image"
              />

              <div className="instagram-agent__image-actions">
                <button className="icon-btn" onClick={handleDownload}>
                  <FaDownload />
                </button>

                <button className="icon-btn" onClick={handleRegenerateImage}>
                  <FaRedoAlt />
                </button>
              </div>
            </div>

            <div className="instagram-agent__preview-actions">
              <button
                className="instagram-agent__button"
                onClick={handleContinueInstagram}
              >
                Continue to Instagram
              </button>
            </div>
          </div>
        )}

        {message && (
          <p
            className={`instagram-agent__message ${
              message.type === "success"
                ? "instagram-agent__message--success"
                : "instagram-agent__message--error"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </section>
  );
};

export default InstagramPro;
