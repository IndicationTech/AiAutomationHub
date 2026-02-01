import { useState, useEffect, useRef } from "react";
import { FaArrowDown, FaRegCopy, FaRedo } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { BsFolderSymlinkFill } from "react-icons/bs";
import "./BlogAgent.css";

const BlogAgent = () => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const [imageUrl, setImageUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [preview, setPreview] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [error, setError] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);

  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const webhookUrl =
    // "http://localhost:5678/webhook/0b665646-7d8c-4c17-b118-10a13f700dd4";
    // "http://localhost:5678/webhook-test/0b665646-7d8c-4c17-b118-10a13f700dd4";
    "https://brockgaming.app.n8n.cloud/webhook-test/0b665646-7d8c-4c17-b118-10a13f700dd4";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // const fetchFromWebhook = async (type: "content" | "image") => {
  //   const response = await fetch(webhookUrl, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ topic, type }),
  //   });

  //   if (!response.ok) throw new Error("Failed to connect to webhook");

  //   let text = await response.text();
  //   let data;

  //   try {
  //     // Try parsing JSON if valid
  //     data = JSON.parse(text);
  //   } catch {
  //     // If it's not JSON, treat as plain text response
  //     console.warn("⚠️ Response not valid JSON:", text);
  //     return { text, image: "" };
  //   }

  //   // Handle both array & object shapes
  //   const first = Array.isArray(data) ? data[0] : data;

  //   const blogText =
  //     first?.text ||
  //     first?.json?.text ||
  //     first?.data?.text ||
  //     first?.output ||
  //     "";

  //   const imageBase64 =
  //     first?.image ||
  //     first?.json?.image ||
  //     first?.data?.image ||
  //     first?.image_url ||
  //     first?.json?.image_url ||
  //     "";

  //   return {
  //     text: blogText,
  //     image: imageBase64?.replace(/^data:image\/png;base64,/, "").trim(),
  //   };
  // };

  const fetchFromWebhook = async (type: "content" | "image") => {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        type,
        referenceImage: uploadedImages[0] || null, // 👈 optional
      }),
    });

    if (!response.ok) throw new Error("Failed to connect");

    const data = await response.json();
    const first = Array.isArray(data) ? data[0] : data;

    return {
      text: first?.text || "",
      image: (first?.image || "").replace(/^data:image\/png;base64,/, ""),
    };
  };

  // 📝 Generate Blog (both text + image)
  const handleCreateBlog = async () => {
    if (!topic.trim()) {
      alert("Please enter a blog topic first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setPreview("");
    setImageUrl("");

    try {
      const result = await fetchFromWebhook("content");
      const formattedBlog = result.text
        ? result.text
            .replace(/\n\s*\n/g, "</p><p>")
            .replace(/\n/g, "<br/>")
            .replace(/^(.+)$/gm, "<p>$1</p>")
        : "No content returned.";

      setPreview(formattedBlog);
      setImageUrl(result.image || "");
    } catch (err: any) {
      console.error("Error generating blog:", err);
      setError(err.message || "Failed to generate blog post.");
    } finally {
      setIsLoading(false);
    }
  };

  // ♻️ Regenerate only content
  const handleRegenerateContent = async () => {
    if (!topic.trim()) return alert("Enter a topic first.");
    setIsLoading(true);
    try {
      const result = await fetchFromWebhook("content");
      const formattedBlog = result.text
        ? result.text
            .replace(/\n\s*\n/g, "</p><p>")
            .replace(/\n/g, "<br/>")
            .replace(/^(.+)$/gm, "<p>$1</p>")
        : "No content returned.";
      setPreview(formattedBlog);
    } catch (err: any) {
      setError(err.message || "Failed to regenerate content.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🖼️ Regenerate only image
  // const handleRegenerateImage = async () => {
  //   if (!topic.trim()) return alert("Enter a topic first.");
  //   setIsImageLoading(true);
  //   try {
  //     const result = await fetchFromWebhook("image");
  //     setImageUrl(result.image || "");
  //   } catch (err: any) {
  //     setError(err.message || "Failed to regenerate image.");
  //   } finally {
  //     setIsImageLoading(false);
  //   }
  // };

  const handleRegenerateImage = async () => {
    if (!topic.trim()) return alert("Enter a topic first.");
    setIsImageLoading(true);
    try {
      const result = await fetchFromWebhook("image");
      setImageUrl(result.image);
    } finally {
      setIsImageLoading(false);
    }
  };

  // 🧩 Copy blog text
  const handleCopy = () => {
    const plainText = preview.replace(/<[^>]+>/g, "");
    navigator.clipboard
      .writeText(plainText)
      .then(() => alert("✅ Blog content copied!"))
      .catch(() => alert("❌ Failed to copy."));
  };

  //  Add handlers for file & image upload

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImages((prev) => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  return (
    <section
      ref={sectionRef}
      className={`blog-agent ${isVisible ? "blog-agent--visible" : ""}`}
    >
      <div className="blog-agent__container">
        <div className="blog-agent__content">
          {/* Left Image */}
          <div className="blog-agent__image">
            <img src="/assets/AiBlogImage.png" alt="AI Blog Illustration" />
          </div>

          {/* Right Side Content */}
          <div className="blog-agent__text">
            <h2 className="blog-agent__title">AI Blog Writer</h2>
            <p className="blog-agent__description">
              Generate long-form, SEO-optimized blog content effortlessly. Enter
              a topic and let the AI craft it for you.
            </p>

            {/* Hidden file inputs */}
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />

            {/* Uploaded previews */}
            {uploadedImages.length > 0 && (
              <div className="upload-preview">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="image-chip">
                    <img src={img} alt="uploaded" />

                    {/* ❌ Remove button */}
                    <button
                      className="remove-image"
                      onClick={() =>
                        setUploadedImages((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="chatgpt-input-wrapper">
              {/* ➕ Button */}
              <div className="chatgpt-plus">
                <button
                  className="plus-btn"
                  onClick={() => setShowAttachMenu((prev) => !prev)}
                  type="button"
                >
                  <FaPlus size={16} />
                </button>

                {showAttachMenu && (
                  <div className="plus-menu">
                    <button
                      onClick={() => {
                        imageInputRef.current?.click();
                        setShowAttachMenu(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <BsFolderSymlinkFill size={20} color="#6f0d3a" />
                      <span>Upload Image</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Text input */}
              <input
                type="text"
                className="chatgpt-input"
                placeholder="Enter a blog topic..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />

              {/* Send */}
              <button
                className="chatgpt-send"
                onClick={handleCreateBlog}
                disabled={isLoading}
              >
                {isLoading ? "..." : " ➤"}
              </button>
            </div>

            {isLoading && (
              <div className="blog-agent__progress">
                <p>🪄 Generating blog content... please wait.</p>
                <div className="blog-agent__progress-bar">
                  <div
                    className="blog-agent__progress-fill"
                    style={{ width: "70%" }}
                  ></div>
                </div>
              </div>
            )}

            {error && <p className="blog-agent__error">❌ {error}</p>}

            {preview && !isLoading && (
              <div className="blog-agent__preview">
                <h3 className="blog-agent__preview-title">
                  Generated Blog Post:
                </h3>

                {/* 📝 Blog Content */}
                <div className="blog-agent__preview-content-wrapper">
                  <button
                    className="copy-button"
                    onClick={handleCopy}
                    title="Copy blog content"
                  >
                    <FaRegCopy />
                  </button>
                  <button
                    className="regen-button"
                    onClick={handleRegenerateContent}
                    title="Regenerate content"
                  >
                    <FaRedo />
                  </button>

                  <div
                    className="blog-agent__preview-content"
                    dangerouslySetInnerHTML={{ __html: preview }}
                  ></div>
                </div>

                {/* 🖼️ Blog Image */}
                {imageUrl && (
                  <div className="blog-agent__image-preview">
                    <div className="image-container">
                      <img
                        src={
                          imageUrl.startsWith("data:image")
                            ? imageUrl
                            : `data:image/png;base64,${imageUrl}`
                        }
                        alt="Generated Blog Cover"
                        className="generated-image"
                      />

                      {/* ⬇️ Download overlay */}
                      <button
                        className="download-overlay"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = imageUrl.startsWith("data:image")
                            ? imageUrl
                            : `data:image/png;base64,${imageUrl}`;
                          link.download = "generated-blog-image.png";
                          link.click();
                        }}
                        title="Download image"
                      >
                        <FaArrowDown />
                      </button>

                      {/* ♻️ Regenerate Image */}
                      <button
                        className="regen-image"
                        onClick={handleRegenerateImage}
                        title="Regenerate image"
                        disabled={isImageLoading}
                      >
                        {isImageLoading ? "..." : <FaRedo />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="blog-agent__note">
              Note: AI may take a few seconds to generate detailed content.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogAgent;
