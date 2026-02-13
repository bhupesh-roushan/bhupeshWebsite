import { useState } from "react";
import { RevealOnScroll } from "../RevealOnScroll";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import { FaGithub, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    mobile: "",
    countryCode: "+91",
    isCustomCode: false,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    const templateParams = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
      mobile: `${formData.countryCode}${formData.mobile}`,
    };

    try {
      await emailjs.send(
        import.meta.env.VITE_SERVICE_ID,
        import.meta.env.VITE_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_PUBLIC_KEY
      );

      toast.success("Message Sent Successfully!");

      setFormData({
        name: "",
        email: "",
        message: "",
        mobile: "",
        countryCode: "+91",
        isCustomCode: false,
      });
    } catch (error) {
      toast.error("Oops! Something went wrong. Please try again.");
      console.error("EmailJS Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="min-h-screen flex flex-col items-center justify-center py-20"
    >
      <RevealOnScroll>
        <div className="px-4 w-full min-w-[300px] md:w-[500px] sm:w-2/3 p-6">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-white bg-clip-text text-transparent text-center">
            Get In Touch
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name */}
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Full Name"
              className="w-full bg-white/10 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:bg-blue-500/5"
            />

            {/* Email */}
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Your Email"
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:bg-blue-500/5"
            />

            {/* Phone Section */}
            <div className="flex">
              <select
                value={
                  formData.isCustomCode
                    ? "custom"
                    : formData.countryCode
                }
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setFormData({
                      ...formData,
                      countryCode: "+",
                      isCustomCode: true,
                    });
                  } else {
                    setFormData({
                      ...formData,
                      countryCode: e.target.value,
                      isCustomCode: false,
                    });
                  }
                }}
                className="bg-white/10 border border-white/10 border-r-0 rounded-l px-3 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="+91" className="text-black">+91 (IN)</option>
                <option value="+1" className="text-black">+1 (US)</option>
                <option value="+44" className="text-black">+44 (UK)</option>
                <option value="+61" className="text-black">+61 (AU)</option>
                <option value="+971" className="text-black">+971 (UAE)</option>
                <option value="custom" className="text-black">Other</option>
              </select>

              {formData.isCustomCode && (
                <input
                  type="text"
                  value={formData.countryCode}
                  onChange={(e) => {
                    let value = e.target.value;

                    if (!value.startsWith("+")) {
                      value = "+" + value.replace(/\+/g, "");
                    }

                    setFormData({
                      ...formData,
                      countryCode: value.replace(/[^\d+]/g, ""),
                    });
                  }}
                  placeholder="+Code"
                  className="w-24 bg-white/10 border border-white/10 border-r-0 px-3 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              )}

              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mobile: e.target.value.replace(/\D/g, ""),
                  })
                }
                placeholder="Your Mobile Number"
                className="w-full bg-white/10 border border-white/10 rounded-r px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:bg-blue-500/5"
              />
            </div>

            {/* Message */}
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Your Message..."
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:bg-blue-500/5"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded font-medium transition ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-white text-white hover:-translate-y-0.5 hover:shadow-md"
              }`}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </RevealOnScroll>

      {/* Footer */}
      <footer className="mt-20 w-full flex flex-col items-center gap-5 p-4 bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
        <div className="flex md:hidden items-center space-x-8">
          <a href="https://www.linkedin.com/in/roushanb" target="_blank">
            <FaLinkedin className="h-6 w-6 text-gray-300 hover:text-white" />
          </a>
          <a href="https://github.com/bhupesh-roushan" target="_blank">
            <FaGithub className="h-6 w-6 text-gray-300 hover:text-white" />
          </a>
          <a href="https://www.instagram.com/roushanwa" target="_blank">
            <FaInstagram className="h-6 w-6 text-gray-300 hover:text-white" />
          </a>
          <a href="https://x.com/roushanwa" target="_blank">
            <FaTwitter className="h-6 w-6 text-gray-300 hover:text-white" />
          </a>
        </div>

        <p className="text-xs sm:text-md md:text-lg bg-gradient-to-r from-white to-indigo-500 text-transparent bg-clip-text">
          All rights reserved @ Bhupesh Roushan © {new Date().getFullYear()}
        </p>
      </footer>
    </section>
  );
};
