import { useState, useEffect, useRef } from "react";
import {
  FaRegCopy,
  FaDownload,
  FaRedoAlt,
  FaCheckCircle,
} from "react-icons/fa";
import "./FacebookAgent.css";

const FacebookAgent = () => {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("casual and engaging");
  const [maxLength, setMaxLength] = useState(250);

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
    if (!topic.trim()) {
      setMessage({ type: "error", text: "Topic is required." });
      return;
    }

    setIsLoading(true);
    setMessage({
      type: "success",
      text: "Your post is being generated! Please wait...",
    });

    try {
      const response = await fetch(
        "http://localhost:5678/webhook/post-to-facebook",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic,
            post_style: style,
            max_length: maxLength,
          }),
        },
      );

      const data = await response.json();

      setPreview({
        text: data.text,
        image: data.image,
        raw: data,
      });

      setMessage({
        type: "success",
        text: "Preview generated successfully.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Failed to generate preview.",
      });
    }

    setIsLoading(false);
  };

  /* Regenerate Text */
  //   const handleRegenerateText = async () => {
  //     setIsLoading(true);

  //     const res = await fetch(
  //       "http://localhost:5678/webhook-test/regenerate-facebook-text",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ topic, post_style: style }),
  //       },
  //     );

  //     const data = await res.json();

  //     setPreview((prev) => ({ ...prev, text: data.text }));
  //     setIsLoading(false);
  //   };

  const handleRegenerateText = async () => {
    setIsLoading(true);

    const res = await fetch(
      "http://localhost:5678/webhook/regenerate-facebook-text",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, post_style: style }),
      },
    );

    const data = await res.json();
    console.log("regen response:", data);

    const payload = Array.isArray(data) ? data[0] : data;

    setPreview((prev) => ({
      ...prev,
      text: payload.text || payload.output || "",
      raw: {
        ...prev.raw,
        text: payload.text || payload.output || "",
      },
    }));

    setIsLoading(false);
  };

  /* Regenerate Image */
  const handleRegenerateImage = async () => {
    setIsLoading(true);

    const res = await fetch(
      "http://localhost:5678/webhook/regenerate-facebook-image",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      },
    );

    const data = await res.json();

    setPreview((prev) => ({
      ...prev,
      image: data.image,
      raw: {
        ...prev.raw,
        image: data.image,
      },
    }));
  };

  /* Approve & Post */
  const handleApprove = async () => {
    setIsLoading(true);

    await fetch("http://localhost:5678/webhook/approve-to-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preview.raw),
    });

    setMessage({
      type: "success",
      text: "Posted to Facebook successfully!",
    });

    setPreview(null);
    setTopic("");
    setIsLoading(false);
  };

  /* Copy caption */
  const handleCopy = () => {
    navigator.clipboard.writeText(preview.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Download image */
  const handleDownload = async () => {
    const response = await fetch(preview.image);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "facebook_post.jpg";
    link.click();
  };

  return (
    <section
      ref={sectionRef}
      className={`facebook-agent ${isVisible ? "facebook-agent--visible" : ""}`}
    >
      <div className="facebook-agent__container">
        <h2 className="facebook-agent__title">Create Facebook Post Agent</h2>

        <p className="facebook-agent__description">
          Enter your topic and preferences to generate an engaging Facebook post
          with an image.
        </p>

        {!preview && (
          <div className="facebook-agent__form">
            <input
              className="facebook-agent__input"
              placeholder="e.g., AI automation tips..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />

            <select
              className="facebook-agent__input"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <option>casual and engaging</option>
              <option>professional and informative</option>
              <option>fun and playful</option>
              <option>inspirational and motivating</option>
            </select>

            <input
              type="number"
              className="facebook-agent__input"
              placeholder="250"
              value={maxLength}
              onChange={(e) => setMaxLength(e.target.value)}
            />

            <button
              className="facebook-agent__button"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              Submit
            </button>
          </div>
        )}

        {preview && (
          <div className="facebook-agent__preview">
            <h3>Facebook Preview</h3>

            <button className="icon-btn" onClick={handleCopy}>
              {copied ? <FaCheckCircle /> : <FaRegCopy />}
            </button>

            <button onClick={handleRegenerateText}>
              <FaRedoAlt /> Regenerate Text
            </button>

            <p className="facebook-agent__preview-text">{preview.text}</p>

            <div className="facebook-agent__image-wrapper">
              <img
                src={`data:image/png;base64,${preview.image}`}
                alt="Preview"
                className="facebook-agent__preview-image"
              />

              <div className="facebook-agent__image-actions">
                <button onClick={handleDownload}>
                  <FaDownload />
                </button>

                <button onClick={handleRegenerateImage}>
                  <FaRedoAlt />
                </button>
              </div>
            </div>

            <button className="facebook-agent__button" onClick={handleApprove}>
              Approve & Post
            </button>
          </div>
        )}

        {message && (
          <p
            className={`facebook-agent__message facebook-agent__message--${message.type}`}
          >
            {message.text}
          </p>
        )}
      </div>
    </section>
  );
};

export default FacebookAgent;
