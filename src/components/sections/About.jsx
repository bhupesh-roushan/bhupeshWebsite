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
  SiMysql,
  SiIntellijidea,
} from "react-icons/si";
import { GrMysql } from "react-icons/gr";
import { DiVisualstudio } from "react-icons/di";
import { TbApi } from "react-icons/tb";
import { FaJava } from "react-icons/fa6";
import { LiaLaptopCodeSolid } from "react-icons/lia";
import { PiSpinner } from "react-icons/pi";
import { MdDataObject, MdOutlineSecurity } from "react-icons/md";
import { LuComputer } from "react-icons/lu";
import { CgWebsite } from "react-icons/cg";
import adda from "../../assets/adda.png";
import prep from "../../assets/prep.png";
export const About = () => {
  const frontendSkills = [
    { name: "HTML", icon: <FaHtml5 className="text-orange-500 text-2xl" /> },
    { name: "CSS", icon: <FaCss3Alt className="text-blue-400 text-2xl" /> },
    { name: "React.js", icon: <FaReact className="text-blue-500 text-2xl" /> },
    { name: "Context API", icon: <TbApi className="text-blue-500 text-2xl" /> },
    { name: "Redux", icon: <SiRedux className="text-red-500 text-2xl" /> },
    {
      name: "Tailwind CSS",
      icon: <SiTailwindcss className="text-cyan-500 text-2xl" />,
    },
    {
      name: "Bootstrap",
      icon: <SiBootstrap className="text-purple-500 text-2xl" />,
    },
    { name: "Next.js", icon: <SiNextdotjs className="text-white text-2xl" /> },
    {
      name: "Framer Motion",
      icon: <SiFramer className="text-pink-500 text-2xl" />,
    },
  ];

  const backendSkills = [
    { name: "Node.js", icon: <FaNodeJs className="text-green-500 text-2xl" /> },
    {
      name: "Express.js",
      icon: <SiExpress className="text-yellow-400 text-2xl" />,
    },
    { name: "REST APIs", icon: <TbApi className="text-blue-500 text-2xl" /> },
    {
      name: "Supabase (BaaS)",
      icon: <SiSupabase className="text-green-500 text-2xl" />,
    },
    {
      name: "JWT Authentication",
      icon: <PiSpinner className="text-pink-500 text-2xl" />,
    },
  ];
  const ProgrammingSkills = [
    { name: "Java", icon: <FaJava className="text-red-500 text-3xl" /> },
    { name: "JavaScript", icon: <FaJs className="text-yellow-500 text-2xl" /> },
    { name: "Python", icon: <SiPython className="text-blue-500 text-2xl" /> },
    {
      name: "C Programming",
      icon: <LiaLaptopCodeSolid className="text-green-500 text-2xl" />,
    },
  ];

  const Concepts = [
    {
      name: "OOPs",
      icon: <MdDataObject className="text-green-500 text-2xl" />,
    },
    {
      name: "Computer Networks",
      icon: <LuComputer className="text-white text-2xl" />,
    },
    {
      name: "Network Security",
      icon: <MdOutlineSecurity className="text-blue-500 text-2xl" />,
    },
    {
      name: "Software Engineering",
      icon: <CgWebsite className="text-yellow-500 text-2xl" />,
    },
  ];

  const DbSkills = [
    {
      name: "MongoDB",
      icon: <SiMongodb className="text-green-500 text-2xl" />,
    },
    { name: "Mongoose", icon: <SiMongoose className="text-white text-4xl" /> },
    { name: "MySQL", icon: <GrMysql className="text-blue-500 text-2xl" /> },
  ];

  const toolsSkills = [
    { name: "Git", icon: <FaGitAlt className="text-red-500 text-2xl" /> },
    { name: "GitHub", icon: <FaGithub className="text-white text-2xl" /> },
    { name: "Vercel", icon: <SiVercel className="text-white text-2xl" /> },
    { name: "Render", icon: <SiRender className="text-white text-2xl" /> },
    { name: "Netlify", icon: <SiNetlify className="text-white text-2xl" /> },
    {
      name: "VS Code",
      icon: <DiVisualstudio className="text-blue-500 text-2xl" />,
    },
    { name: "Figma", icon: <FaFigma className="text-pink-500 text-2xl" /> },
    {
      name: "Postman",
      icon: <SiPostman className="text-orange-500 text-2xl" />,
    },
    {
      name: "MySQL Workbench",
      icon: <SiMysql className="text-blue-500 text-4xl" />,
    },
    {
      name: "IntelliJ IDEA",
      icon: <SiIntellijidea className="text-pink-500 text-2xl" />,
    },
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
                <h3 className="text-xl font-bold mb-4">
                  {" "}
                  Programming Languages
                </h3>
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
                <h3 className="text-xl font-bold mb-4">Concepts</h3>
                <div className="flex flex-wrap gap-2">
                  {Concepts.map((tech, key) => (
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
            {/* experience */}
            <div className="p-6 rounded-xl border-white/10 border hover:-translate-y-1 transition-all hover:shadow-sm hover:shadow-blue-500/40">
              <h3 className="text-2xl font-bold mb-4 text-orange-500 text-center">
                Work Experience
              </h3>

              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={adda}
                    alt=""
                    className="items-center h-12 w-12  object-cover"
                  />
                </div>

                <h2 className="font-extrabold text-lg text-center">Adda247</h2>
                <h2 className="font-extrabold text-lg text-center">
                  Executive - Audit and Assessment
                </h2>
                <h2 className="font-extrabold text-lg text-center text-blue-500">
                    ( April 2025 - Present )
                  </h2>
              </div>
              <p className="text-center font-semibold text-md my-2 bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text"></p>
              <div className="my-5 ">
                <p className="my-2 text-center text-md font-bold bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text ">
                  Tech Stack : Web Development, Java, Aptitude, DSA, Computer
                  Networks, Operating Systems.
                </p>

                <p className=" font-extralight text-md text-justify">
                  1. Developed full-stack assessment platforms using
                  <span
                    className="bg-gradient-to-r from-orange-600 to-blue-600 
                      text-transparent bg-clip-text"
                  >
                    {" "}
                    React, Node.js, and MongoDB, creating dynamic UIs and
                    scalable backends; designed coding challenges and assessment
                    questions,
                  </span>{" "}
                  improving evaluation quality and diversity by 30%.
                </p>

                <p className="mt-5 font-extralight text-md text-justify">
                  2. Curated and evaluated student assessments
                  <span
                    className="bg-gradient-to-r from-orange-600 to-blue-600 
                      text-transparent bg-clip-text"
                  >
                    {" "}
                    focused on Operating Systems and Computer Networks,
                    enhancing question quality and accuracy,
                  </span>{" "}
                  resulting in a 10% improvement in real-world problem-solving
                  relevance.
                </p>
              </div>
            </div>
            <div className="p-6 rounded-xl border-white/10 border hover:-translate-y-1 transition-all hover:shadow-sm hover:shadow-blue-500/40">
              <h3 className="text-2xl font-bold mb-4 text-orange-500 text-center">
                Education
              </h3>

              <h2 className="font-extrabold text-lg text-center">
                BMS Institute of Technology and Management, Bangalore
                
              </h2>
              <h2 className="font-extrabold text-lg text-center text-blue-500">
                (2018 - 2023)
                
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
              <div className="space-y-2 text-gray-300">
                <div>
                  <h3 className="font-extrabold text-center text-lg text-white my-4">
                    {" "}
                    Full Stack Developer Intern -{" "}
                    <span className="bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text">
                      Varcons Technologies
                    </span>
                  </h3>
                  <h3 className="font-extrabold text-lg text-center text-blue-500">
                    ( Feb 2023 - March 2023 )
                  </h3>
                  <p className="my-2 text-center text-md font-bold bg-gradient-to-r from-orange-600 to-blue-600 text-transparent bg-clip-text ">
                    Tech Stack - React.js, Node.js, Express, MongoDB, JWT, REST
                    APIs.
                  </p>

                  <div className="my-5 ">
                    <p className=" font-extralight text-md text-justify">
                      1. Developed ”Coursezz”, an online course-selling
                      platform, implementing
                      <span
                        className="bg-gradient-to-r from-orange-600 to-blue-600 
                      text-transparent bg-clip-text"
                      >
                        {" "}
                        JWT-based authentication, role-based access control
                        (RBAC), and MongoDB Atlas
                      </span>{" "}
                      to support secure multi-user access, reducing unauthorized
                      access incidents.
                    </p>

                    <p className="mt-5 font-extralight text-md text-justify">
                      2. Optimized API performance, reducing response times by
                      40% through efficient
                      <span
                        className="bg-gradient-to-r from-orange-600 to-blue-600 
                      text-transparent bg-clip-text"
                      >
                        {" "}
                        Express middleware, caching strategies, and request
                        validation,
                      </span>{" "}
                      enhancing scalability and system throughput.
                    </p>
                  </div>
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
