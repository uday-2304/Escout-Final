import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaCloudUploadAlt } from "react-icons/fa";
import { useToast } from "../components/Toast/ToastContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const AddVideo = () => {
  const [title, setTitle] = useState("");
  const [game, setGame] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !game || !thumbnail || !videoFile) {
      showToast("All fields are required", { type: "error" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Session expired. Please login again.", { type: "error" });
      navigate("/login");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("game", game);
      formData.append("thumbnail", thumbnail);
      formData.append("video", videoFile);

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/videos/add-video`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData, // ❌ DO NOT set Content-Type
        }
      );

      const text = await res.text();
      console.log("RAW SERVER RESPONSE:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Backend response was not JSON. Raw response: ${text.substring(0, 200)}...`);
      }

      if (!res.ok) {
        throw new Error(data.message || `Upload failed with status ${res.status}`);
      }

      showToast("Video uploaded successfully!", { type: "success" });
      navigate("/dashboard");
    } catch (err) {
      console.error("UPLOAD ERROR:", err.message);
      showToast(err.message, { type: "error" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
        <FaArrowLeft /> Back
      </button>

      <h2 style={styles.heading}>Upload Gameplay Video</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />

        <select
          value={game}
          onChange={(e) => setGame(e.target.value)}
          style={styles.input}
        >
          <option value="">Select Game</option>
          <option>PUBG</option>
          <option>Free Fire</option>
          <option>Valorant</option>
          <option>COD</option>
          <option>Fortnite</option>
        </select>

        {/* Thumbnail */}
        <label style={styles.uploadBox}>
          {thumbnail ? (
            <img
              src={URL.createObjectURL(thumbnail)}
              alt="thumb"
              style={styles.preview}
            />
          ) : (
            <FaPlus size={40} />
          )}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setThumbnail(e.target.files[0])}
          />
        </label>

        {/* Video */}
        <label style={{ ...styles.uploadBox, height: 300 }}>
          {videoFile ? (
            <video
              controls
              src={URL.createObjectURL(videoFile)}
              style={styles.preview}
            />
          ) : (
            <FaPlus size={60} />
          )}
          <input
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => setVideoFile(e.target.files[0])}
          />
        </label>

        <button style={styles.uploadBtn} disabled={uploading}>
          <FaCloudUploadAlt />
          {uploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#000",
    color: "#fff",
    padding: "40px",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#f10000",
    cursor: "pointer",
    marginBottom: 20,
  },
  heading: {
    marginBottom: 20,
    textAlign: "center",
  },
  form: {
    maxWidth: 700,
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  input: {
    padding: 12,
    background: "#111",
    border: "1px solid #333",
    color: "#fff",
  },
  uploadBox: {
    border: "2px dashed #f10000",
    height: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  preview: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  uploadBtn: {
    padding: 14,
    background: "#f10000",
    border: "none",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
  },
};

export default AddVideo;