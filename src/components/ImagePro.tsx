import { useState } from "react";
import "./ImagePro.css";

const ImagePro = () => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const callAgent = async (action: string) => {
    setLoading(true);

    try {
      let response;
      if (action === "generate") {
        response = await fetch(
          "http://localhost:5678/webhook-test/image-generate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, prompt }),
          },
        );
      } else {
        const form = new FormData();
        form.append("prompt", prompt);
        form.append("action", "edit");
        if (file) form.append("image", file);

        response = await fetch("http://localhost:5678/webhook/image-agent", {
          method: "POST",
          body: form,
        });
      }

      const data = await response.json();
      setImage(`data:image/png;base64,${data.image}`);
    } catch {
      alert("Failed");
    }

    setLoading(false);
  };

  return (
    <div className="image-agent">
      <div className="image-agent__container">
        <h2>Image Generator Agent</h2>

        <input
          className="image-agent__input"
          placeholder="Enter prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="image-agent__row">
          <button onClick={() => callAgent("generate")}>Generate</button>

          <button onClick={() => callAgent("generate")}>Regenerate</button>
        </div>

        <div className="image-agent__upload">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <div className="image-agent__row">
            <button onClick={() => callAgent("edit")}>Edit Image</button>
          </div>
        </div>

        {loading && <p className="image-agent__loading">Generating...</p>}

        {image && (
          <div className="image-agent__preview">
            <img src={image} alt="Result" />

            <a
              href={image}
              download="image.png"
              className="image-agent__download"
            >
              Download Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePro;
