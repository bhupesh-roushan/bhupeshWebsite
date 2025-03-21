import { useState } from "react";
import { RevealOnScroll } from "../RevealOnScroll";
import emailjs from "emailjs-com";
import { toast } from "react-toastify";
import { FaGithub, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        import.meta.env.VITE_SERVICE_ID,
        import.meta.env.VITE_TEMPLATE_ID,
        e.target,
        import.meta.env.VITE_PUBLIC_KEY
      )
      .then((result) => {
        toast("Message Sent!");
        setFormData({ name: "", email: "", message: "" });
      })
      .catch(() => toast("Oops! Something went wrong. Please try again."));
  };

  return (
    <section
      id="contact"
      className="min-h-screen flex flex-col items-center justify-center py-20"
    >
      <RevealOnScroll>
        <div className="px-4 w-full min-w-[300px] md:w-[500px] sm:w-2/3 p-6">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent text-center">
            {" "}
            Get In Touch
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                className="w-full bg-white/10 border border-white/10 rounded px-4 py-3 text-white transition focus:outline-none focus:border-blue-500 focus:bg-blue-500/5"
                placeholder="Full Name"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white transition focus:outline-none focus:border-blue-500 focus:bg-blue-500/5"
                placeholder="Your Email"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="relative">
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white transition focus:outline-none focus:border-blue-500 focus:bg-blue-500/5"
                placeholder="Your Message..."
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white  py-3 px-6 rounded font-medium transition relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
            >
              Send Message
            </button>
          </form>
        </div>
      </RevealOnScroll>
      <footer className="relative gap-5 flex-col mt-20 bottom-0 w-full flex justify-center items-center p-4 bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
        <div className="flex md:hidden items-center space-x-8">
          <a
            href="https://www.linkedin.com/in/roushanb"
            target="_blank"
            className="text-gray-300 hover:text-white transition-colors"
          >
            <FaLinkedin className="h-6 w-6" />
          </a>
          <a
            href="https://github.com/bhupesh-roushan"
            target="_blank"
            className="text-gray-300 hover:text-white transition-colors"
          >
            <FaGithub className="h-6 w-6" />
          </a>
          <a
            href="https://www.instagram.com/roushanwa"
            target="_blank"
            className="text-gray-300 hover:text-white transition-colors"
          >
            <FaInstagram className="h-6 w-6" />
          </a>
          <a
            href="https://x.com/roushanwa"
            target="_blank"
            className="text-gray-300 hover:text-white transition-colors"
          >
            <FaTwitter className="h-6 w-6" />
          </a>
        </div>

        <p className="text-xs sm:text-md ">
          All rights reserved @ Bhupesh Roushan © 2025
        </p>
      </footer>
    </section>
  );
};
