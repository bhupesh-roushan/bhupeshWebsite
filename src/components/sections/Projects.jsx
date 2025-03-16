import { RevealOnScroll } from "../RevealOnScroll";
import cubekit from "./../../assets/cubekit.png";
import buildingBlocks from "./../../assets/buildingBlocks.png";
import hourglass from "./../../assets/hourglass.png";
import frequencii from "./../../assets/frequencii.png";
import pictelAi from "./../../assets/pictelAi.png";
export const Projects = () => {
  return (
    <section
      id="projects"
      className="min-h-screen flex items-center justify-center py-20"
    >

        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent text-center">
            {" "}
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition">
              <h3 className="text-xl font-bold mb-2 text-orange-500">
                Building Blocks - LMS Software{" "}
              </h3>

              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "Node.js",
                  "Express.js",
                  "MongoDB",
                  "React.js",
                  "PayPal",
                  "Cloudinary",
                  "Shadcn",
                  "Tailwind CSS",
                  "Vercel",
                  "Hostinger",
                ].map((tech, key) => (
                  <span
                    key={key}
                    className="bg-blue-500/10 py-1 px-4  mx-2 rounded-full text-sm hover:bg-blue-500/20 hover:shadow-[0_2px_8px_rgba(59,130,246,0.1)] transition-all bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text  sm:text-md font-bold shadow-sm shadow-blue-600/40"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <ul className="text-white my-4 flex gap-2 flex-col w-full">
                <li>
                  • Developed an LMS with role-based dashboards for instructors
                  and students, improving course management efficiency by 40%.
                </li>
                <li>
                  • Implemented course creation and management with bulk video
                  uploads, real-time tracking, and interactive controls,
                  reducing upload time by 60% and boosting engagement.
                </li>
                <li>
                  • Integrated PayPal payment gateway for secure transactions,
                  increasing payment success rate by 25%, and hosted the
                  platform on a custom domain for better accessibility.
                </li>
                <li>
      
                  <span className="bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text">
                    • Demo Credentials :
                  </span>{" "}
                  Student:student@gmail.com/student, Instructor:
                  instructor@gmail.com/instructor, Payment:
                  buildingblocks@business.com/buildingblocks
                </li>
              </ul>
              <div className="flex justify-center items-center border-2 rounded-lg border-blue-600/40 my-4">
                <img src={buildingBlocks} alt="" className="rounded-lg p-2" />
              </div>

              <div className="flex justify-between items-center">
                <a
                  href="#"
                  className="text-blue-400 hover:text-blue-300 transition-colors my-4"
                >
                  View Project →
                </a>
              </div>
            </div>
            <div
              className="
              glass p-6 rounded-xl border border-white/10 
              hover:-translate-y-1 hover:border-blue-500/30
              hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]
              transition-all
            "
            >
              <h3 className="text-xl font-bold mb-2 text-orange-500">
                Hourglass - Social Media
              </h3>

              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "React.js",
                  "Node.js",
                  "Express.js",
                  "MongoDB",
                  "Redux",
                  "Socket.io",
                  "Cloudinary",
                  "Tailwind CSS",
                  "Shadcn",
                  "Render",
                ].map((tech, key) => (
                  <span
                    key={key}
                    className="
                      bg-blue-500/10 py-1 px-4  mx-2
                      rounded-full text-sm transition hover:bg-blue-500/20 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text text-md font-bold shadow-sm shadow-blue-600/40"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <ul className="text-white my-4 flex gap-2 flex-col w-full">
                <li>
                  • Developed Hourglass, a social media app with real-time
                  messaging, post creation, likes, comments, and bookmarks using
                  React.js, Node.js, Express.js, and MongoDB.
                </li>
                <li>
                  • Integrated Cloudinary for image uploads, Redux Toolkit for
                  state management, and Socket.io for real-time messaging and
                  notifications, enhancing user engagement.
                </li>
                <li>
                  • Styled with Tailwind CSS and Shadcn, deployed on Render for
                  seamless scalability and reliable hosting.
                </li>
                <li>
                  {" "}
                  <span className="bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text">
                    • Demo Credentials :
                  </span>{" "}
                  hourglass@user.com
                </li>
              </ul>
              <div className="flex justify-center items-center border-2 rounded-lg border-blue-600/40 my-4">
                <img src={hourglass} alt="" className="rounded-lg p-2" />
              </div>
              <div className="flex justify-between items-center">
                <a
                  href="#"
                  className="text-blue-400 hover:text-blue-300 transition-colors my-4"
                >
                  View Project →
                </a>
              </div>
            </div>

            <div
              className="
              glass p-6 rounded-xl border border-white/10 
              hover:-translate-y-1 hover:border-blue-500/30
              hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]
              transition-all
            "
            >
              <h3 className="text-xl font-bold mb-2 text-orange-500">
                Cubekit - Hiring Platform
              </h3>

              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "React.js",
                  "Tailwind CSS",
                  "Shadcn UI",
                  "Supabase",
                  "Clerk",
                  "React Hook Form",
                  "Zod",
                  "Email JS",
                  "Vercel",
                ].map((tech) => (
                  <span
                    key={tech}
                    className="
                      bg-blue-500/10 py-1 px-4  mx-2 rounded-full text-sm transition hover:bg-blue-500/20 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text text-md font-bold shadow-sm shadow-blue-600/40"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <ul className="text-white my-4 flex gap-2 flex-col w-full">
                <li>
                  • Developed Cubekit, a hiring platform using React.js,
                  Supabase, and Clerk for secure authentication and role-based
                  dashboards.
                </li>
                <li>
                  • Implemented an advanced job posting system with React Hook
                  Form, Zod, and location-based filtering, reducing job posting
                  time by 40%.
                </li>
                <li>
                  • Streamlined job applications with resume uploads, status
                  tracking, and a responsive UI using Tailwind CSS, Shadcn, and
                  EmailJS for automated newsletters.
                </li>
                <li>
                  {" "}
                  <span className="bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text">
                    • Demo Credentials :
                  </span>{" "}
                  Recruiter:recruiter@gmail.com/12345678, Candidate:
                  candidate@gmail.com/12345678
                </li>
              </ul>
              <div className="flex justify-center items-center border-2 rounded-lg border-blue-600/40 my-4">
                <img src={cubekit} alt="" className="rounded-lg p-2" />
              </div>
              <div className="flex justify-between items-center">
                <a
                  href="https://cubekit.vercel.app/"
                  target="_blank"
                  className="text-blue-400 hover:text-blue-300 transition-colors my-4"
                >
                  View Project →
                </a>
              </div>
            </div>

            <div
              className="
              glass p-6 rounded-xl border border-white/10 
              hover:-translate-y-1 hover:border-blue-500/30
              hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]
              transition-all
            "
            >
              <h3 className="text-xl font-bold mb-2 text-orange-500">
                Frequencii - E Commerce
              </h3>

              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "ReactJs",
                  "Redux",
                  "Redux Toolkit",
                  "EmailJs",
                  "ShadCn",
                  "Tailwind CSS",
                  "Vercel",
                ].map((tech, key) => (
                  <span
                    key={key}
                    className="
                      bg-blue-500/10 py-1 px-4  mx-2
                      rounded-full text-sm transition hover:bg-blue-500/20 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text text-md font-bold shadow-sm shadow-blue-600/40"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <ul className="text-white my-4 flex gap-2 flex-col w-full">
                <li>
                  • Developed an e-commerce prototype using React.js and Redux
                  Toolkit for dynamic state management and an interactive user
                  experience.
                </li>
                <li>
                  • Styled with Tailwind CSS and ShadCn, ensuring a fully
                  responsive and visually appealing interface.
                </li>
                <li>
                  • Integrated EmailJS for automated customer communication,
                  enhancing user engagement.
                </li>
              </ul>
              <div className="flex justify-center items-center border-2 rounded-lg border-blue-600/40 my-4">
                <img src={frequencii} alt="" className="rounded-lg p-2" />
              </div>
              <div className="flex justify-between items-center ">
                <a
                  href="#"
                  className="text-blue-400 hover:text-blue-300 transition-colors my-4"
                >
                  View Project →
                </a>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition">
              <h3 className="text-xl font-bold mb-2 text-orange-500">
                PictelAI - Powered by Gemini
              </h3>

              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "ReactJs",
                  "Context API",
                  "Tailwind CSS",
                  "Google Gemini API",
                  "Vercel",
                ].map((tech, key) => (
                  <span
                    key={key}
                    className="bg-blue-500/10  py-1 px-4  mx-2  rounded-full text-sm hover:bg-blue-500/20 hover:shadow-[0_2px_8px_rgba(59,130,246,0.1)] transition-all bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text text-md font-bold p-3 border-blue-500/50 border-2 shadow-sm shadow-blue-600/40"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <ul className="text-white my-4 flex gap-2 flex-col w-full">
                <li>
                  • Developed an AI-powered web app using React.js and
                  integrated the Google Gemini API for interactive content
                  generation.
                </li>
                <li>
                  • Utilized Context API for efficient and scalable state
                  management.
                </li>
                <li>
                  • Designed a responsive UI with Tailwind CSS, ensuring a seamless experience across all devices.
                </li>
               
              </ul>
              <div className="flex justify-center items-center border-2 rounded-lg border-blue-600/40 my-4">
                <img src={pictelAi} alt="" className="rounded-lg p-2" />
              </div>

              <div className="flex justify-between items-center">
                <a
                  href="#"
                  className="text-blue-400 hover:text-blue-300 transition-colors my-4"
                >
                  View Project →
                </a>
              </div>
            </div>
          </div>
        </div>
    </section>
  );
};
