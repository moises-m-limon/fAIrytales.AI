"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "../../styles/flipbook.module.css";

interface FlipbookProps {
  isVisible: boolean;
  prompt: string;
}

const Flipbook: React.FC<FlipbookProps> = ({ isVisible, prompt }) => {
  const [pages, setPages] = useState<string[]>([]);
  const [texts, setTexts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isVisible && prompt) {
      generateContent();
    }
  }, [isVisible, prompt]);

  const generateContent = async () => {
    setIsLoading(true);
    setError("");
    try {
      console.log("Generating content for prompt:", prompt);

      // Start image and text generation in parallel
      const [imageResponse, textResponse] = await Promise.all([
        fetch("http://127.0.0.1:5000/generate-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }),
        fetch("http://127.0.0.1:5000/generate-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }),
      ]);

      // Check for response errors
      if (!imageResponse.ok) {
        throw new Error(`Image generation error: ${imageResponse.statusText}`);
      }
      if (!textResponse.ok) {
        throw new Error(`Text generation error: ${textResponse.statusText}`);
      }

      // Process responses
      const imageData = await imageResponse.json();
      const textData = await textResponse.json();

      // Map PART 1 and PART 2 to pages and texts
      setPages([
        `data:image/jpeg;base64,${imageData.images[0]}`, // Image for PART 1
        `data:image/jpeg;base64,${imageData.images[1]}`, // Image for PART 2
      ]);
      setTexts([textData["PART 1"], textData["PART 2"]]);
    } catch (err) {
      console.error(err);
      setError("Failed to generate content. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.container}>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {pages.length > 0 && texts.length > 0 && (
        <div>
          <motion.div
            key={currentPage}
            initial={{ rotateY: -180 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 180 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={pages[currentPage]}
              alt={`Page ${currentPage + 1}`}
              className={styles.image}
            />
            <p className={styles.text}>{texts[currentPage]}</p>
          </motion.div>
          <div className={styles.navigation}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1))
              }
              disabled={currentPage === pages.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flipbook;
