import { useEffect, useRef, useState } from "react";
import { LuDownload } from "react-icons/lu";
import "./MediaGenerator.css";

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);

  // Fade-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Generate Image
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("❌ Please enter a valid prompt.");
      return;
    }

    setLoading(true);
    setError("");
    setImageUrl("");

    try {
      const response = await fetch(
        "http://localhost:5678/webhook/image-generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        },
      );

      const data = await response.json();
      if (!data.image) throw new Error("No image received");

      const finalImage = `data:image/png;base64,${data.image}`;
      setImageUrl(finalImage);
    } catch (err) {
      setError("🚨 Failed to generate image. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`media-generator media-generator--image ${
        isVisible ? "media-generator--visible" : ""
      }`}
    >
      <div className="media-generator__container">
        <span className="media-generator__eyebrow">Image SANDBOX</span>
        <h2 className="media-generator__title">Image Generator</h2>

        {/* Input + Button Inline */}
        {!imageUrl && (
          <div className="media-generator__form">
            <input
              className="media-generator__input"
              placeholder="Describe your image..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
            <button
              className="media-generator__button"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "⏳ Generating..." : "Generate"}
            </button>
          </div>
        )}

        {/* Error */}
        {error && <p className="media-generator__error">{error}</p>}

        {/* Image Preview with Overlay Download */}
        {imageUrl && (
          <div
            className="media-generator__preview"
            style={{ position: "relative" }}
          >
            <img src={imageUrl} alt="AI Result" loading="lazy" />

            <button
              className="media-generator__button download-button"
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                padding: "8px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => {
                const link = document.createElement("a");
                link.href = imageUrl;
                link.download = "generated-image.png";
                link.click();
              }}
            >
              <LuDownload size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ImageGenerator;
