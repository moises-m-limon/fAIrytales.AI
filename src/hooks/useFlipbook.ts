"use client"; // Add this directive to indicate this is a client component
import { useState } from "react";

export const useFlipbook = () => {
  const [isFlipbookVisible, setFlipbookVisible] = useState(false);

  const showFlipbook = () => {
    setFlipbookVisible(true);
  };

  const resetFlipbook = () => {
    setFlipbookVisible(false);
  };

  return { isFlipbookVisible, showFlipbook, resetFlipbook };
};
