import { useEffect, useState } from "react";
import icon from "../assets/icon.svg";
import { LuLinkedin } from "react-icons/lu";
import { FaGithub, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export const Navbar = ({ menuOpen, setMenuOpen }) => {
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);
const [indiaTime, setIndiaTime] = useState("");

  useEffect(() => {
  const updateTime = () => {
    const time = new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    setIndiaTime(time);
  };

  updateTime(); // run immediately
  const interval = setInterval(updateTime, 1000);

  return () => clearInterval(interval); // cleanup
}, []);
  return (
    <nav className="fixed top-0 w-full z-40 bg-[rgba(10, 10, 10, 0.8)] backdrop-blur-xs border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between  items-center h-16">
          <div className="flex flex-row items-center justify-center gap-3">
            <img src={icon} alt="logo" className="w-10 h-10 " />
            <a href="#home" className="font-mono text-xl font-bold text-white">
              Bhupesh<span className="text-indigo-500">.website</span>{" "}
            </a>
          </div>

          <div
            className="w-7 h-5 relative cursor-pointer z-40 md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#home"
              className="text-white  hover:scale-110  transition-all"
            >
              {" "}
              Home
            </a>
            <a
              href="#about"
              className="text-white  hover:scale-110  transition-all"
            >
              {" "}
              About{" "}
            </a>
            <a
              href="#projects"
              className="text-white  hover:scale-110  transition-all"
            >
              {" "}
              Projects{" "}
            </a>
            <a
              href="#contact"
              className="text-white  hover:scale-110  transition-all"
            >
              {" "}
              Contact{" "}
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            
            <a
              href="https://www.linkedin.com/in/roushanb"
              target="_blank"
              className="text-blue-500  hover:scale-110  transition-all"
            >
              <LuLinkedin className="h-6 w-6"/>
            </a>
            <a
              href="https://github.com/bhupesh-roushan"
              target="_blank"
              className="text-white  hover:scale-110  transition-all"
            >
              <FaGithub className="h-6 w-6"/>
            </a>
            <a
              href="https://www.instagram.com/roushanwa"
              target="_blank"
              className="text-white  hover:scale-110  transition-all "
            >
              <FaInstagram className="h-6 w-6"/>
            </a>
            <a
              href="https://x.com/roushanwa"
              target="_blank"
              className="text-white  hover:scale-110  transition-all"
            >
              <FaXTwitter className="h-6 w-6"/>
            </a>
            <p>{indiaTime}</p>

          </div>
        </div>
      </div>
    </nav>
  );
};
