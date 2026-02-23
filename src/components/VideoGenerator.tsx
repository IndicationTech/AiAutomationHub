import { useEffect, useRef, useState } from "react";
import "./MediaGenerator.css";

const VideoGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [videoSrc, setVideoSrc] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Fade-in animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Generate video from n8n binary webhook
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("❌ Please describe the video you want to preview.");
      setShowPreview(false);
      return;
    }

    setError("");
    setShowPreview(false);
    setLoading(true);
    setVideoSrc("");

    try {
      const response = await fetch(
        // "http://localhost:5678/webhook/video-generate",
        "http://localhost:5678/webhook-test/video-generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatInput: prompt }),
        },
      );

      // ⛔ Instead of JSON → n8n sends a binary file, so use blob()
      const blob = await response.blob();

      // Create a temporary video URL
      const videoUrl = URL.createObjectURL(blob);

      setVideoSrc(videoUrl);
      setPosterUrl("");
      setShowPreview(true);
    } catch (err) {
      console.error(err);
      setError("🚨 Failed to generate video. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`media-generator media-generator--video ${
        isVisible ? "media-generator--visible" : ""
      }`}
    >
      <div className="media-generator__container">
        <span className="media-generator__eyebrow">Video Motion Lab</span>
        <h2 className="media-generator__title">Video Generator</h2>
        <p className="media-generator__description">
          Draft a prompt, click generate, and preview your AI-generated video.
        </p>

        {/* Input Form */}
        <div className="media-generator__form">
          <input
            className="media-generator__input"
            type="text"
            placeholder="e.g., Slow pan over neon-lit streets in the rain"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={loading}
          />
          <button
            className="media-generator__button"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "⏳ Generating..." : "Generate Video"}
          </button>
        </div>

        {/* Error */}
        {error && <p className="media-generator__error">{error}</p>}

        {/* Video Preview */}
        {showPreview && videoSrc && (
          <div className="media-generator__preview">
            <video
              controls
              autoPlay
              loop
              poster={posterUrl || undefined}
              className="media-generator__video"
            >
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <button
              className="media-generator__button secondary"
              onClick={() => {
                const link = document.createElement("a");
                link.href = videoSrc;
                link.download = "generated-video.mp4";
                link.click();
              }}
            >
              ⬇️ Download Video
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoGenerator;
