import {
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaReact,
  FaNodeJs,
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
  SiTypescript,
  SiDocker,
  SiBlackmagicdesign,
  SiLinux,
  SiThealgorithms,
  SiLangchain,
} from "react-icons/si";
import { GrMysql } from "react-icons/gr";
import { DiVisualstudio } from "react-icons/di";
import { TbApi, TbDatabaseSearch, TbDatabase, TbRobot } from "react-icons/tb";
import { FaJava } from "react-icons/fa6";
import { LiaLaptopCodeSolid } from "react-icons/lia";
import { PiSpinner, PiMagicWandFill } from "react-icons/pi";
import { MdDataObject, MdOutlineSecurity } from "react-icons/md";
import { LuComputer, LuChartNetwork } from "react-icons/lu";
import { CgWebsite } from "react-icons/cg";

// Component references plus a hex colour, rather than ready-made JSX, so each
// consumer can size and style them: the skills grid renders small inline chips,
// the hero backdrop renders large scattered glyphs from this same list.
export const skillGroups = [
  {
    title: "Frontend",
    span: "lg:col-span-3",
    accent: "56,189,248",
    items: [
      { name: "HTML", Icon: FaHtml5, color: "#E34F26" },
      { name: "CSS", Icon: FaCss3Alt, color: "#1572B6" },
      { name: "React.js", Icon: FaReact, color: "#61DAFB" },
      { name: "Context API", Icon: TbApi, color: "#38BDF8" },
      { name: "Redux", Icon: SiRedux, color: "#764ABC" },
      { name: "Tailwind CSS", Icon: SiTailwindcss, color: "#38BDF8" },
      { name: "Bootstrap", Icon: SiBootstrap, color: "#7952B3" },
      { name: "Next.js", Icon: SiNextdotjs, color: "#FFFFFF" },
      { name: "Framer Motion", Icon: SiFramer, color: "#EC4899" },
    ],
  },
  {
    title: "Backend",
    span: "lg:col-span-3",
    accent: "34,197,94",
    items: [
      { name: "Node.js", Icon: FaNodeJs, color: "#83CD29" },
      { name: "Express.js", Icon: SiExpress, color: "#CBD5E1" },
      { name: "REST APIs", Icon: TbApi, color: "#38BDF8" },
      { name: "Supabase (BaaS)", Icon: SiSupabase, color: "#3ECF8E" },
      { name: "JWT Auth", Icon: PiSpinner, color: "#EC4899" },
    ],
  },
  {
    title: "GenAI",
    span: "lg:col-span-4",
    accent: "168,85,247",
    items: [
      { name: "LangChain", Icon: SiLangchain, color: "#22C55E" },
      { name: "RAG", Icon: TbDatabaseSearch, color: "#22D3EE" },
      { name: "ChromaDB", Icon: TbDatabase, color: "#F97316" },
      { name: "Embeddings", Icon: LuChartNetwork, color: "#A855F7" },
      { name: "LLM APIs", Icon: TbApi, color: "#38BDF8" },
      { name: "Prompt Engineering", Icon: PiMagicWandFill, color: "#EC4899" },
      { name: "AI Agents", Icon: TbRobot, color: "#EAB308" },
    ],
  },
  {
    title: "Languages",
    span: "lg:col-span-2",
    accent: "249,115,22",
    items: [
      { name: "Java", Icon: FaJava, color: "#E76F00" },
      { name: "JavaScript", Icon: FaJs, color: "#F7DF1E" },
      { name: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
      { name: "Python", Icon: SiPython, color: "#3776AB" },
      { name: "C", Icon: LiaLaptopCodeSolid, color: "#22C55E" },
    ],
  },
  {
    title: "Concepts",
    span: "lg:col-span-4",
    accent: "99,102,241",
    items: [
      { name: "OOPs", Icon: MdDataObject, color: "#22C55E" },
      { name: "System Design", Icon: SiBlackmagicdesign, color: "#EF4444" },
      { name: "Computer Networks", Icon: LuComputer, color: "#E2E8F0" },
      { name: "Network Security", Icon: MdOutlineSecurity, color: "#F97316" },
      { name: "Operating Systems", Icon: SiLinux, color: "#38BDF8" },
      { name: "Software Engineering", Icon: CgWebsite, color: "#EAB308" },
      { name: "DSA", Icon: SiThealgorithms, color: "#22D3EE" },
    ],
  },
  {
    title: "Databases",
    span: "lg:col-span-2",
    accent: "16,185,129",
    items: [
      { name: "MongoDB", Icon: SiMongodb, color: "#47A248" },
      { name: "Mongoose", Icon: SiMongoose, color: "#E2E8F0" },
      { name: "MySQL", Icon: GrMysql, color: "#4479A1" },
    ],
  },
  {
    title: "Tools & Others",
    span: "lg:col-span-6",
    accent: "236,72,153",
    items: [
      { name: "Git", Icon: FaGitAlt, color: "#F05032" },
      { name: "GitHub", Icon: FaGithub, color: "#E2E8F0" },
      { name: "Docker", Icon: SiDocker, color: "#2496ED" },
      { name: "VS Code", Icon: DiVisualstudio, color: "#007ACC" },
      { name: "Figma", Icon: FaFigma, color: "#F24E1E" },
      { name: "Postman", Icon: SiPostman, color: "#FF6C37" },
      { name: "MySQL Workbench", Icon: SiMysql, color: "#4479A1" },
      { name: "IntelliJ IDEA", Icon: SiIntellijidea, color: "#EC4899" },
      { name: "Vercel", Icon: SiVercel, color: "#E2E8F0" },
      { name: "Render", Icon: SiRender, color: "#E2E8F0" },
      { name: "Netlify", Icon: SiNetlify, color: "#00C7B7" },
    ],
  },
];

/** Every skill, flattened — used to populate the hero backdrop. */
export const allSkills = skillGroups.flatMap((group) => group.items);
