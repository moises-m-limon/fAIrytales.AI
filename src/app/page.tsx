"use client";

import React, { useState } from "react";
import Form from "../components/Form";
import Flipbook from "../components/Flipbook";

const Home: React.FC = () => {
  const [isFlipbookVisible, setIsFlipbookVisible] = useState(false);
  const [prompt, setPrompt] = useState<string>(""); // Hold the generated prompt

  // Function to show the Flipbook and set the prompt
  const handleGenerate = (newPrompt: string) => {
    setPrompt(newPrompt);
    setIsFlipbookVisible(true); // Make the Flipbook visible
  };

  return (
    <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mt-10 mx-auto">
      {/* Pass the handleGenerate function to Form */}
      <Form onGenerate={handleGenerate} />
      {/* Pass the isVisible and prompt props to Flipbook */}
      <Flipbook isVisible={isFlipbookVisible} prompt={prompt} />
    </div>
  );
};

export default Home;
