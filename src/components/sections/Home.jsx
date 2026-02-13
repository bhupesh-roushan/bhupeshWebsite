import { RevealOnScroll } from "../RevealOnScroll";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import video from "../../assets/video.mp4";
import bhupesh from "../../assets/bhupesh.png";
export const Home = () => {
  const headingText = "Hi, I'm Bhupesh Roushan";
  const paragraphText =
    "Passionate developer with expertise in building scalable web applications and creating innovative solutions.";
  const [headingDisplayText, setHeadingDisplayText] = useState("");
  const [paragraphDisplayText, setParagraphDisplayText] = useState("");
  const [headingIndex, setHeadingIndex] = useState(0);
  const [paragraphIndex, setParagraphIndex] = useState(0);

  useEffect(() => {
    if (headingIndex < headingText.length) {
      const headingTimeout = setTimeout(() => {
        setHeadingDisplayText(headingText.slice(0, headingIndex + 1));
        setHeadingIndex(headingIndex + 1);
      }, 230);
      return () => clearTimeout(headingTimeout);
    }
  }, [headingIndex]);

  useEffect(() => {
    if (paragraphIndex < paragraphText.length) {
      const paragraphTimeout = setTimeout(() => {
        setParagraphDisplayText(paragraphText.slice(0, paragraphIndex + 1));
        setParagraphIndex(paragraphIndex + 1);
      }, 5);
      return () => clearTimeout(paragraphTimeout);
    }
  }, [paragraphIndex]);

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover z-0 "
      >
        <source src={video} type="video/mp4" />
      </video>

      {/* Content */}
      <RevealOnScroll>
        <div className="text-center z-10 px-4 bg-transparent  p-10 rounded-lg mt-20">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-white bg-clip-text text-transparent leading-tight tracking-wide">
            {headingDisplayText}
            <span className="animate-pulse">
              {headingIndex < headingText.length ? "|" : ""}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 5 }}
            className="text-white text-md mb-8 max-w-4xl mx-auto text-center font-bold tracking-widest"
          >
            {paragraphDisplayText}
            <span className="animate-pulse">
              {paragraphIndex < paragraphText.length ? "|" : ""}
            </span>
          </motion.p>

          <div className="rounded-full overflow-hidden max-w-50 max-h-50 mx-auto bg-transparent shadow-sm backdrop-blur-3xl shadow-blue-500 hover:shadow-blue-500 hover:shadow-md transition-all hover:scale-105">
            <img src={bhupesh} alt="" className="rounded-full h-50 w-50 object-cover" />
          </div>

          <div className="flex justify-center space-x-4 my-5">
            <a
              href="#projects"
              className="rounded-md bg-white/10 font-medium text-white bg-clip-text border-1 border-orange-500/60 p-3 hover:scale-105 transition-all hover:shadow-sm shadow-orange-500 sm:hidden flex"
            >
              View Projects
            </a>

            <a
              href="#contact"
              className="rounded-md bg-white/10 font-medium text-white bg-clip-text border-1 border-orange-500/60 p-3 hover:scale-105 transition-all hover:shadow-sm shadow-orange-500 sm:hidden flex"
            >
              Contact Me
            </a>
            <a
              href="https://drive.google.com/file/d/1GKE5rVGd8st09lnHEX6zztguKoJBaOfw/view?usp=sharing"
              target="_blank"
              className="hover:scale-105 rounded-full shadow-md shadow-indigo-500"
            >
              <button className="rounded-full bg-transparent font-medium border-white border-1 sm:border-blue-500/60 p-3 hover:scale-105 transition-all text-white bg-clip-text hover:shadow-sm shadow-blue-500 sm:bg-gradient-to-r from-blue-600 to-white sm:bg-clip-text sm:text-transparent ">
                Download Resume
              </button>
            </a>
          </div>
          <div className="my-10 flex justify-center">
            
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
};
