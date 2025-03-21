import { RevealOnScroll } from "../RevealOnScroll";
import {
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaReact,
  FaNodeJs,
  FaDatabase,
  FaGitAlt,
  FaGithub,
  FaFigma,
} from "react-icons/fa";
import {
  SiRedux,
  SiTailwindcss,
  SiBootstrap,
  SiNextdotjs,
  SiFramer,
  SiExpress,
  SiMongodb,
  SiPostman,
  SiVercel,
  SiRender,
  SiNetlify,
  SiSupabase,
  SiMongoose,
  SiPython,
} from "react-icons/si";
import { GrMysql } from "react-icons/gr";
import { DiVisualstudio } from "react-icons/di";
import { TbApi } from "react-icons/tb";
import { FaJava } from "react-icons/fa6";
import { LiaLaptopCodeSolid } from "react-icons/lia";
export const About = () => {
  const frontendSkills = [
    { name: "HTML", icon: <FaHtml5 className="text-orange-400 text-2xl" /> },
    { name: "CSS", icon: <FaCss3Alt className="text-blue-400 text-2xl" /> },
    { name: "React.js", icon: <FaReact className="text-blue-500 text-2xl" /> },
    { name: "Context API", icon: <TbApi className="text-amber-400 text-2xl" /> },
    { name: "Redux", icon: <SiRedux className="text-red-500 text-2xl" /> },
    { name: "Tailwind CSS", icon: <SiTailwindcss className="text-cyan-500 text-2xl" /> },
    { name: "Bootstrap", icon: <SiBootstrap className="text-purple-500 text-2xl" /> },
    { name: "Next.js", icon: <SiNextdotjs className="text-white text-2xl" /> },
    { name: "Framer Motion", icon: <SiFramer className="text-pink-500 text-2xl" /> },
  ];

  const backendSkills = [
    { name: "Node.js", icon: <FaNodeJs className="text-green-500 text-2xl" /> },
    { name: "Express.js", icon: <SiExpress className="text-yellow-400 text-2xl" /> },
    { name: "REST APIs", icon: <TbApi className="text-blue-500 text-2xl" /> },
    {
      name: "Supabase (BaaS)",
      icon: <SiSupabase className="text-green-500 text-2xl" />,
    },
  ];
  const ProgrammingSkills = [
    { name: "Java", icon: <FaJava className="text-red-500 text-2xl" /> },
    { name: "JavaScript", icon: <FaJs className="text-yellow-500 text-2xl" /> },
    { name: "Python", icon: <SiPython className="text-blue-400 text-2xl" /> },
    { name: "C Programming", icon: <LiaLaptopCodeSolid className="text-blue-500 text-2xl" /> },
  ];

  const DbSkills = [
    { name: "MongoDB", icon: <SiMongodb className="text-green-500 text-2xl" /> },
    { name: "Mongoose", icon: <SiMongoose className="text-white text-2xl" /> },
    { name: "MySQL", icon: <GrMysql  className="text-blue-500 text-2xl" /> },
  ];

  const toolsSkills = [
    { name: "Git", icon: <FaGitAlt className="text-red-500 text-2xl" /> },
    { name: "GitHub", icon: <FaGithub className="text-white text-2xl" /> },
    { name: "Vercel", icon: <SiVercel className="text-white text-2xl" /> },
    { name: "Render", icon: <SiRender className="text-white text-2xl" /> },
    { name: "Netlify", icon: <SiNetlify className="text-white text-2xl" /> },
    { name: "VS Code", icon: <DiVisualstudio className="text-blue-500 text-2xl" /> },
    { name: "Figma", icon: <FaFigma className="text-pink-500 text-2xl" /> },
    { name: "Postman", icon: <SiPostman className="text-orange-500 text-2xl" /> },
  ];

  return (
    <section
      id="about"
      className="min-h-screen flex items-center justify-center py-2 md:py-20"
    >
      <RevealOnScroll>
        <div className="max-w-5xl mx-auto px-4 ">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent text-center">
            {" "}
            About Me
          </h2>

          <div className="rounded-xl p-8 border-white/10 border hover:-translate-y-1 transition-all hover:shadow-sm hover:shadow-blue-500/40">
            <h1 className="text-center font-extrabold text-orange-500 text-2xl my-2">
              Technical Skills
            </h1>
            <p className="text-white text-center mb-6">
              Passionate developer with expertise in building scalable web
              applications and creating innovative solutions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl p-6 hover:-translate-y-1 transition-all">
                <h3 className="text-xl font-bold mb-4"> Frontend</h3>
                <div className="flex flex-wrap gap-2">
                  {frontendSkills.map((tech, key) => (
                    <span
                      key={key}
                      className="bg-orange-500/10 mx-1 my-1 py-2 px-3  rounded-full text-md font-bold hover:bg-orange-500 shadow-[0_2px_8px_rgba(59,130,246,0.4)] transition  bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text flex flex-row items-center justify-center gap-2"
                    >
                      {tech.icon}
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-6 hover:-translate-y-1 transition-all">
                <h3 className="text-xl font-bold mb-4"> Backend</h3>
                <div className="flex flex-wrap gap-2">
                  {backendSkills.map((tech, key) => (
                    <span
                      key={key}
                      className="bg-orange-500/10 mx-1 my-1 py-2 px-3  rounded-full text-md font-bold hover:bg-orange-500 shadow-[0_2px_8px_rgba(59,130,246,0.4)] transition  bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text flex flex-row items-center justify-center gap-2"
                    >
                      {tech.icon}
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-6 hover:-translate-y-1 transition-all">
                <h3 className="text-xl font-bold mb-4"> Programming Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {ProgrammingSkills.map((tech, key) => (
                    <span
                      key={key}
                      className="bg-orange-500/10 mx-1 my-1 py-2 px-3  rounded-full text-md font-bold hover:bg-orange-500 shadow-[0_2px_8px_rgba(59,130,246,0.4)] transition  bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text flex flex-row items-center justify-center gap-2"
                    >
                      {tech.icon}
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>
              {/* for the other skills section */}
              <div className="rounded-xl p-6 hover:-translate-y-1 transition-all">
                <h3 className="text-xl font-bold mb-4">Databases</h3>
                <div className="flex flex-wrap gap-2">
                  {DbSkills.map((tech, key) => (
                    <span
                      key={key}
                      className="bg-orange-500/10 mx-1 my-1 py-2 px-3  rounded-full text-md font-bold hover:bg-orange-500 shadow-[0_2px_8px_rgba(59,130,246,0.4)] transition  bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text flex flex-row items-center justify-center gap-2"
                    >
                      {tech.icon}
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-6 hover:-translate-y-1 transition-all">
                <h3 className="text-xl font-bold mb-4">Tools & Others</h3>
                <div className="flex flex-wrap gap-2">
                  {toolsSkills.map((tech, key) => (
                    <span
                      key={key}
                      className="bg-orange-500/10 mx-1 my-1 py-2 px-3  rounded-full text-md font-bold
                      hover:bg-orange-500 shadow-[0_2px_8px_rgba(59,130,246,0.4)] transition 
                      bg-gradient-to-r from-orange-600 to-blue-600 
                      text-transparent bg-clip-text flex flex-row items-center justify-center gap-2"
                    >
                      {tech.icon}
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/*  */}

          <div className="grid grid-cols-1  gap-6 mt-8">
            <div className="p-6 rounded-xl border-white/10 border hover:-translate-y-1 transition-all hover:shadow-sm hover:shadow-blue-500/40">
              <h3 className="text-2xl font-bold mb-4 text-orange-500 text-center">
                Education
              </h3>

              <h2 className="font-extrabold text-lg text-center">
                BMS Institute of Technology and Management, Bangalore
                (2018-2023)
              </h2>
              <p className="text-center font-semibold text-md my-2 bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text">
                B.E. in Electronics and Communication Engineering
              </p>
              <div className="my-5 ">
                <h3 className="text-center text-orange-500 text-md font-semibold mb-3 ">
                  * Achievements *
                </h3>

                <p className=" font-extralight text-md text-justify">
                  Secured Runner-up position for the project{" "}
                  <span
                    className="bg-gradient-to-r from-orange-600 to-blue-600 
                      text-transparent bg-clip-text"
                  >
                    ` Reconfiguration of Micro-strip Patch Antenna `{" "}
                  </span>{" "}
                  in the department-level ’Project-Based Learning’ competition
                  during the 6th semester.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl border-white/10 border hover:-translate-y-1 transition-all hover:shadow-sm hover:shadow-blue-500/40">
              <h3 className="text-2xl font-bold mb-4 text-orange-500 text-center">
                Internship{" "}
              </h3>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="font-extrabold text-center text-lg text-white my-4">
                    {" "}
                    Full Stack Developer Intern -{" "}
                    <span className="bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text">
                      Varcons Technologies
                    </span>
                  </h3>
                  <p className="my-2 text-center text-md font-bold bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text ">
                    Tech Stack - React.js, Node.js, Express, MongoDB
                  </p>
                  <p className="text-white text-md  text-justify">
                    Developed a ”Coursezz” template for online course selling,
                    featuring user authentication, course listing, and database
                    integration, using React.js, Node.js, Express, and MongoDB.
                  </p>
                  <a
                    href="https://drive.google.com/file/d/1oFndqcViPQE_p8io7HW_wDGryYzqk7cE/view?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <p className="text-md text-center text-blue-500 hover:text-blue-300 my-4">
                      View Certificate →
                    </p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
};