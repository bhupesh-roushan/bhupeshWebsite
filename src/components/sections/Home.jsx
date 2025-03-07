import { RevealOnScroll } from "../RevealOnScroll";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const Home = () => {
  const headingText = "Hi, I'm Bhupesh Roushan";
  const paragraphText =
    "I’m a full-stack developer who loves crafting clean, scalable web applications. My goal is to build solutions that offer both exceptional performance and a delightful user experience.I graduated from BMS Institute of Technology, Bangalore (2018–2023) with a degree in Electronics and Communication Engineering.";
  const [headingDisplayText, setHeadingDisplayText] = useState("");
  const [paragraphDisplayText, setParagraphDisplayText] = useState("");
  const [headingIndex, setHeadingIndex] = useState(0);
  const [paragraphIndex, setParagraphIndex] = useState(0);

  // Typing effect for heading
  useEffect(() => {
    if (headingIndex < headingText.length) {
      const headingTimeout = setTimeout(() => {
        setHeadingDisplayText(headingText.slice(0, headingIndex + 1));
        setHeadingIndex(headingIndex + 1);
      }, 100); // Adjust speed here

      return () => clearTimeout(headingTimeout);
    }
  }, [headingIndex]);

  // Typing effect for paragraph
  useEffect(() => {
    if (paragraphIndex < paragraphText.length) {
      const paragraphTimeout = setTimeout(() => {
        setParagraphDisplayText(paragraphText.slice(0, paragraphIndex + 1));
        setParagraphIndex(paragraphIndex + 1);
      }, 10); // Adjust speed here

      return () => clearTimeout(paragraphTimeout);
    }
  }, [paragraphIndex]);

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative"
    >
      <RevealOnScroll>
        <div className="text-center z-10 px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent leading-right tracking-wide">
            {headingDisplayText}
            <span className="animate-pulse">
              {headingIndex < headingText.length ? "|" : ""}
            </span>{" "}
            {/* Blinking cursor for heading */}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-white text-sm mb-8 max-w-3xl mx-auto text-justify font-bold tracking-widest"
          >
            {paragraphDisplayText}
            <span className="animate-pulse">
              {paragraphIndex < paragraphText.length ? "|" : ""}
            </span>{" "}
            {/* Blinking cursor for paragraph */}
          </motion.p>

          <div className="flex justify-center space-x-4 my-5">
            <a
              href="#projects"
              className="bg-orange-500 text-white py-3 px-6 rounded font-medium transition relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(59, 130, 246, 0.4)] shadow-md hover:shadow-orange-500/50"
            >
              View Projects
            </a>

            <a
              href="#contact"
              className="border border-orange-500/50 text-orange-600 py-3 px-6 rounded font-medium transition-all duration-200 
             hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(59, 130, 246, 0.2)] hover:bg-orange-500/10 hover:shadow-orange-500/50 shadow-md"
            >
              Contact Me
            </a>
          </div>
          <div className="my-10 flex justify-center">
            <a
              href="https://drive.google.com/file/d/1YDgn3ZE4bqJOK7A7GO5zOtsYTwjeOtgE/view?usp=sharing"
              target="_blank"
            >
              <button className="rounded-md bg-white/10 bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text border-1 border-blue-500/60 p-3 hover:scale-105 transition-all hover:shadow-sm shadow-orange-500">
                Download Resume
              </button>
            </a>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
};
