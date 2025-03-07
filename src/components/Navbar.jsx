import { useEffect } from "react";
import icon from "../assets/icon.svg";

import { FaGithub, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

export const Navbar = ({ menuOpen, setMenuOpen }) => {
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);
  return (
    <nav className="fixed top-0 w-full z-40 bg-[rgba(10, 10, 10, 0.8)] backdrop-blur-lg border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between  items-center h-16">
          <div className="flex flex-row items-center justify-center gap-3">
            <img src={icon} alt="logo" className="w-10 h-10 " />
            <a href="#home" className="font-mono text-xl font-bold text-white">
              Bhupesh<span className="text-orange-500">.website</span>{" "}
            </a>
          </div>

          <div
            className="w-7 h-5 relative cursor-pointer z-40 md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            &#9776;
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#home"
              className="text-gray-300 hove:text-white transition-colors"
            >
              {" "}
              Home
            </a>
            <a
              href="#about"
              className="text-gray-300 hove:text-white transition-colors"
            >
              {" "}
              About{" "}
            </a>
            <a
              href="#projects"
              className="text-gray-300 hove:text-white transition-colors"
            >
              {" "}
              Projects{" "}
            </a>
            <a
              href="#contact"
              className="text-gray-300 hove:text-white transition-colors"
            >
              {" "}
              Contact{" "}
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            
            <a
              href="https://www.linkedin.com/in/roushanb"
              target="_blank"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FaLinkedin className="h-6 w-6"/>
            </a>
            <a
              href="https://github.com/bhupesh-roushan"
              target="_blank"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FaGithub className="h-6 w-6"/>
            </a>
            <a
              href="https://www.instagram.com/roushanwa"
              target="_blank"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FaInstagram className="h-6 w-6"/>
            </a>
            <a
              href="https://x.com/roushanwa"
              target="_blank"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FaTwitter className="h-6 w-6"/>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};
