import React, { useState } from "react";
import "./App.css";

function App() {
  const [scenes, setScenes] = useState([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [loadingSceneIndex, setLoadingSceneIndex] = useState(null);

  const processStory = () => {
    const story = document.getElementById("story").value;
    const splitScenes = story.split(".").map((scene) => scene.trim()).filter(Boolean);
    setScenes(
      splitScenes.map((scene) => ({ description: scene, image_url: "", style: "" }))
    );
    setCurrentSceneIndex(0);
  };

  const generateImageForScene = async (index) => {
    setLoadingSceneIndex(index);
    const scene = scenes[index];
    try {
      const response = await fetch("http://127.0.0.1:5000/generate_image", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene_description: scene.description,
          style: scene.style,
        }),
      });
      const data = await response.json();
      setScenes((prev) =>
        prev.map((s, i) => (i === index ? { ...s, image_url: data.image_url } : s))
      );
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoadingSceneIndex(null); // Clear loading state
    }
  };

  const updateSceneField = (field, value) => {
    setScenes((prev) =>
      prev.map((scene, i) =>
        i === currentSceneIndex ? { ...scene, [field]: value } : scene
      )
    );
  };

  const showNextScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    }
  };

  const showPreviousScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    }
  };

  return (
    <div className="App">
      <h1>Visual Storytelling Tool</h1>

      <textarea id="story" placeholder="Enter your story here..." />
      <button onClick={processStory}>Process Story</button>

      {scenes.length > 0 && (
        <div className="timeline-item">
          <textarea
            className="scene-editor"
            value={scenes[currentSceneIndex]?.description}
            onChange={(e) => updateSceneField("description", e.target.value)}
            placeholder="Edit the scene description"
          />
          <div>
            <label>Style: </label>
            <input
              type="text"
              value={scenes[currentSceneIndex]?.style}
              onChange={(e) => updateSceneField("style", e.target.value)}
              placeholder="Enter a style (e.g., cartoon, realistic)"
            />
          </div>
          {scenes[currentSceneIndex]?.image_url ? (
            <img
              src={scenes[currentSceneIndex]?.image_url}
              alt={`Scene ${currentSceneIndex}`}
              className="scene-image"
            />
          ) : loadingSceneIndex === currentSceneIndex ? (
            <div className="loading-spinner"></div>
          ) : (
            <p>No image generated yet.</p>
          )}
          <button
            onClick={() => generateImageForScene(currentSceneIndex)}
            disabled={loadingSceneIndex === currentSceneIndex}
          >
            {loadingSceneIndex === currentSceneIndex ? "Generating..." : "Generate Image"}
          </button>
        </div>
      )}

      <div>
        <button onClick={showPreviousScene} disabled={currentSceneIndex === 0}>
          Previous Scene
        </button>
        <button onClick={showNextScene} disabled={currentSceneIndex === scenes.length - 1}>
          Next Scene
        </button>
      </div>
    </div>
  );
}

export default App;
