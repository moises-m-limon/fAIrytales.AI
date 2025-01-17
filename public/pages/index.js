import { useState } from "react";
import { motion } from "framer-motion";
import styles from "../styles/flipbook.module.css";

const Flipbook = () => {
  const pages = [
    "/pages/page1.jpg",
    "/pages/page2.jpg",
    "/pages/page3.jpg",
    "/pages/page4.jpg",
  ];

  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.navButton}
        onClick={prevPage}
        disabled={currentPage === 0}
      >
        Previous
      </button>

      <motion.div
        className={styles.page}
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
      </motion.div>

      <button
        className={styles.navButton}
        onClick={nextPage}
        disabled={currentPage === pages.length - 1}
      >
        Next
      </button>
    </div>
  );
};

export default Flipbook;
