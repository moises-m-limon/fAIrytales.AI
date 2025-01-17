"use client";

import React, { useState } from "react";

interface FormProps {
  onGenerate: (prompt: string) => void; // Callback to send the prompt to the parent
}

const Form: React.FC<FormProps> = ({ onGenerate }) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      alert("Please enter a prompt."); // Basic validation
      return;
    }
    console.log(inputValue.trim());
    onGenerate(inputValue.trim()); // Pass the input value to the parent
    setInputValue(""); // Reset the input field
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-lg flex flex-col gap-4"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <input
          type="text"
          placeholder="Describe a story"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Generate Flipbook
        </button>
      </form>
    </div>
  );
};

export default Form;
