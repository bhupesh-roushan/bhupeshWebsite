import { useState } from "react";
import { RevealOnScroll } from "../RevealOnScroll";
import { HiringFacts } from "../HiringFacts";
import { JdMatcher } from "../JdMatcher";
import { MAIL_SUBJECT } from "../../data/hiring";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  LuMail,
  LuPhone,
  LuMapPin,
  LuSend,
  LuCopy,
  LuCheck,
} from "react-icons/lu";

const EMAIL = "roushan.bhupesh@gmail.com";
const PHONE = "+91 7992302851";

const SOCIALS = [
  { href: "https://www.linkedin.com/in/roushanb", Icon: FaLinkedin, label: "LinkedIn" },
  { href: "https://github.com/bhupesh-roushan", Icon: FaGithub, label: "GitHub" },
  { href: "https://www.instagram.com/roushanwa", Icon: FaInstagram, label: "Instagram" },
  { href: "https://x.com/roushanwa", Icon: FaXTwitter, label: "X" },
];

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white " +
  "placeholder:text-gray-500 transition-colors focus:border-indigo-500 focus:bg-indigo-500/5 focus:outline-none";

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
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — please copy it manually.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Honeypot: hidden from people, irresistible to naive bots. Anything that
    // fills it gets a success message and nothing gets sent, so the bot has no
    // signal that it was caught.
    if (e.target.company?.value) {
      toast.success("Message Sent Successfully!");
      return;
    }

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
    <section id="contact" className="py-20">
      <RevealOnScroll>
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-2 text-center text-3xl font-bold text-white">
            Get In Touch
          </h2>
          <p className="mb-10 text-center text-sm text-gray-400">
            Have a role, a project, or a question?
          </p>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* ── Reach me directly ─────────────────────────── */}
            {/* Pairs up between sm and lg so the cards don't stretch on tablets. */}
            {/* content-start stops the rows stretching to match the taller
                form column, which left the cards tall and half-empty. */}
            {/* One card, three rows. As separate cards each held a single line
                of text in its own bordered box, so most of the column was
                padding and repeated chrome. */}
            <div className="lg:col-span-2 lg:self-start">
              <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <a href={`mailto:${EMAIL}?subject=${encodeURIComponent(MAIL_SUBJECT)}`} className="group flex items-center gap-3.5 p-4 transition-colors hover:bg-white/[0.04]">
                  <span className="shrink-0 rounded-lg bg-indigo-500/10 p-2 text-indigo-300">
                    <LuMail className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Email
                    </p>
                    <p className="break-all text-sm text-white group-hover:text-indigo-300">
                      {EMAIL}
                    </p>
                  </div>
                </a>

                <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="group flex items-center gap-3.5 p-4 transition-colors hover:bg-white/[0.04]">
                  <span className="shrink-0 rounded-lg bg-indigo-500/10 p-2 text-indigo-300">
                    <LuPhone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Phone
                    </p>
                    <p className="text-sm text-white group-hover:text-indigo-300">{PHONE}</p>
                  </div>
                </a>

                <div className="flex items-center gap-3.5 p-4">
                  <span className="shrink-0 rounded-lg bg-indigo-500/10 p-2 text-indigo-300">
                    <LuMapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Location
                    </p>
                    <p className="text-sm text-white">Bangalore, India</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <HiringFacts />
              </div>

              <button
                type="button"
                onClick={copyEmail}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-gray-300 transition-colors hover:border-white/25 hover:text-white cursor-pointer"
              >
                {copied ? (
                  <>
                    <LuCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Copied to clipboard
                  </>
                ) : (
                  <>
                    <LuCopy className="h-3.5 w-3.5" />
                    Copy email address
                  </>
                )}
              </button>
            </div>

            {/* ── Form ──────────────────────────────────────── */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:col-span-3">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-gray-300">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@company.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="mobile" className="mb-1.5 block text-xs font-medium text-gray-300">
                    Mobile
                  </label>
                  <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                    <select
                      aria-label="Country code"
                      value={formData.isCustomCode ? "custom" : formData.countryCode}
                      onChange={(e) => {
                        if (e.target.value === "custom") {
                          setFormData({ ...formData, countryCode: "+", isCustomCode: true });
                        } else {
                          setFormData({
                            ...formData,
                            countryCode: e.target.value,
                            isCustomCode: false,
                          });
                        }
                      }}
                      className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
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
                        aria-label="Custom country code"
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
                        className="w-24 shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    )}

                    <input
                      id="mobile"
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "") })
                      }
                      placeholder="Your mobile number"
                      className={`${inputClass} min-w-0 flex-1`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="mb-1.5 block text-xs font-medium text-gray-300">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell me a bit about what you're working on..."
                    className={`${inputClass} resize-y`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                    loading
                      ? "cursor-not-allowed bg-white/10 text-gray-400"
                      : "cursor-pointer bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02]"
                  }`}
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      <LuSend className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6">
            <JdMatcher />
          </div>
        </div>
      </RevealOnScroll>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 pt-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between">
          <p className="text-center text-xs text-gray-400 sm:text-left sm:text-sm">
            © {new Date().getFullYear()} Bhupesh Roushan. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {SOCIALS.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-gray-400 transition-colors hover:text-white"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </section>
  );
};
