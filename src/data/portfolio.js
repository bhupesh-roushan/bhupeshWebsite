import adda from "../assets/adda.png";
import masai from "../assets/masai.png";
import hudl from "../assets/hudl.png";
import bms from "../assets/bms.png";
import varcons from "../assets/varcons.png";

import cloudwatch from "../assets/cloudwatch.webp";
import buildingBlocks from "../assets/buildingBlocks.webp";
import hourglass from "../assets/hourglass.webp";
import cubekit from "../assets/cubekit.webp";
import frequencii from "../assets/frequencii.webp";
import pictelAi from "../assets/pictelAi.webp";

/**
 * Experience, education and internship, newest first.
 * `span` drives the bento footprint on the 6-column desktop grid.
 */
export const journey = [
  {
    id: "masai",
    start: "2026-05",
    end: null,
    kind: "Work",
    company: "Masai",
    location: "Bangalore",
    role: "Curriculum Engineer",
    period: "May 2026 - Present",
    current: true,
    logo: masai,
    logoClass: "h-8 w-auto object-contain",
    accent: "99,102,241",
    span: "lg:col-span-3",
    stack: [
      "MERN Stack",
      "JavaScript",
      "Python",
      "Excel",
      "Claude",
      "Codex",
      "AI Agents",
      "Prompt Engineering",
      "Data Pipelines",
    ],
    bullets: [
      "Managed AI-enabled curriculum and assessment workflows across technical and non-technical programs, covering rubric-based evaluations, question validation, learner submission review, grading prompt refinement, evaluation quality checks, and learner support.",
      "Built MERN-based evaluation automation workflows and data pipelines using Claude, Codex, Gemini, and AI agents, collaborating with product, engineering, academic, and operations teams to track submissions, analyze grading issues, improve assessment delivery, maintain validation reports, prompt versions, and issue trackers, and ensure consistent AI-assisted evaluation outcomes.",
    ],
  },
  {
    id: "adda247",
    start: "2025-04",
    end: "2026-05",
    kind: "Work",
    company: "Adda247",
    location: "Bangalore",
    role: "Executive - Audit & Assessment",
    period: "April 2025 - May 2026",
    logo: adda,
    // Box matches the artwork's 1.5 aspect, so object-cover fills it without
    // cropping the wordmark and the rounded corners clip the red plate itself.
    logoClass: "h-11 w-[66px] object-cover rounded-md",
    // Adda247's brand red, not pink. The logo's exact (227,17,31) only reaches
    // 4.1:1 against the dark card — under the 4.5 minimum for text this size —
    // so this is the same hue lifted to 5.1:1.
    accent: "239,68,68",
    span: "lg:col-span-3",
    stack: [
      "React.js",
      "Node.js",
      "Express",
      "MongoDB",
      "JavaScript",
      "Java",
      "Computer Networks",
      "Operating Systems",
    ],
    bullets: [
      "Built and optimized an AI-powered rubric-based automated assessment evaluation system using MERN and Gemini 2.5 Flash Pro, along with the end-to-end assessment platform Optimus, improving evaluation accuracy by 80%, reducing manual effort by 70%, and enhancing learner insights by 30%.",
      "Designed, audited, and implemented end-to-end MERN-focused technical assessments while resolving learner doubts, increasing question relevance and improving overall learning outcomes by 20%.",
    ],
    link: {
      href: "https://drive.google.com/file/d/1tfM6P9unFsKHm5smAgXCUmQnXmYVjol6/view?usp=drive_link",
      label: "Experience Letter",
    },
  },
  {
    id: "hudl",
    start: "2023-06",
    end: "2023-11",
    kind: "Work",
    company: "Hudl",
    location: "Bangalore",
    role: "Sports Analyst",
    period: "June 2023 - November 2023",
    logo: hudl,
    logoClass: "h-8 w-auto object-contain rounded-md",
    accent: "249,115,22",
    span: "lg:col-span-2",
    stack: [
      "SQL",
      "Excel",
      "Google Sheets",
      "Hudl Platform",
      "Data Cleaning",
      "Data Validation",
      "Data QA",
      "Sports Analytics",
    ],
    bullets: [
      "Processed and analyzed high-volume sports video datasets using Hudl tools, converting match events, player actions, tactical sequences, and performance indicators into structured analytical data for reporting and performance insights.",
      "Cleaned, transformed, and validated match-event datasets using SQL, Excel, and Google Sheets, performing data quality checks to identify tagging inconsistencies, correct classification errors, and maintain reliable datasets for downstream sports analytics.",
    ],
    link: {
      href: "https://drive.google.com/file/d/1Q9yzYNUIN8Sh88XMT0CRPf7-3Kt0b-jT/view?usp=sharing",
      label: "Experience Letter",
    },
  },
  {
    id: "varcons",
    start: "2023-02",
    end: "2023-03",
    kind: "Internship",
    company: "Varcons Technologies",
    location: "Bangalore",
    role: "Full Stack Developer Intern",
    period: "Feb 2023 - March 2023",
    logo: varcons,
    logoClass: "h-8 w-auto object-contain rounded-md bg-white/90 p-1",
    accent: "56,189,248",
    span: "lg:col-span-2",
    stack: ["React.js", "Node.js", "Express", "MongoDB", "JWT", "REST API"],
    bullets: [
      "Developed “Coursezz”, an online course-selling platform, implementing JWT-based authentication and Role-Based Access Control (RBAC) to support secure multi-user access, reducing unauthorized access incidents.",
      "Optimized API performance by 40% through efficient Express middleware, caching strategies, and robust request validation, significantly enhancing system scalability and throughput.",
    ],
    link: {
      href: "https://drive.google.com/file/d/1oFndqcViPQE_p8io7HW_wDGryYzqk7cE/view?usp=drive_link",
      label: "Internship Certificate",
    },
  },
  {
    id: "bms",
    start: "2018-10",
    end: "2023-05",
    kind: "Education",
    company: "BMS Institute of Technology and Management",
    location: "Bangalore",
    role: "B.E. in Electronics and Communication Engineering",
    period: "October 2018 - May 2023",
    logo: bms,
    logoClass: "h-14 w-auto object-contain rounded-md",
    accent: "34,197,94",
    span: "lg:col-span-2",
    stack: [
      "Data Structures & Algorithms",
      "DBMS",
      "Operating Systems",
      "Computer Networks",
    ],
    bullets: [
      "Relevant coursework: Data Structures and Algorithms, Database Management System, Operating System, and Computer Networks.",
      "Secured Runner-up position for the project “Reconfiguration of Micro-strip Patch Antenna” in the department-level Project-Based Learning competition during the 6th semester.",
    ],
  },
];

/**
 * Featured projects, newest first.
 * `featured` tiles get the large treatment in the bento grid.
 */
export const projects = [
  {
    id: "cloudwatch",
    repo: "https://github.com/bhupesh-roushan/cloudwatch-digital",
    // PLACEHOLDER — correct this. Reviewers read impact numbers very
    // differently depending on whether you owned all of it or part of it.
    role: "Solo build — design, frontend, backend and deployment",
    title: "CloudWatch",
    tagline: "AI-Powered Digital Marketplace",
    period: "February 2026",
    image: cloudwatch,
    href: "https://www.cloudwatch.in/",
    accent: "99,102,241",
    featured: true,
    span: "lg:col-span-4",
    stack: [
      "Next.js 16",
      "TypeScript",
      "Node.js",
      "Express",
      "MongoDB",
      "Razorpay",
      "Gemini API",
      "Cloudinary",
      "StackBlitz",
      "Aceternity UI",
    ],
    bullets: [
      "Built an AI-powered digital marketplace enabling creators to sell products using Next.js 16, TypeScript, Tailwind CSS, and Aceternity UI on the frontend and Express.js, MongoDB, and Mongoose on the backend with role-based authentication.",
      "Integrated Gemini 2.0 Flash AI, Firecrawl, and SerpAPI to automate product listing generation, competitor analysis, pricing insights, and SEO optimization, reducing manual listing effort by 60% and improving SEO efficiency by 40%.",
      "Implemented Razorpay checkout, StackBlitz live previews, and Cloudinary media management with search filters, a digital purchase library, analytics dashboard, bulk imports, admin moderation, and real-time sales tracking, reducing product upload time by 45% and improving workflow efficiency by 30%.",
    ],
    credentials: [
      { label: "Login", value: "user@gmail.com / user1" },
      { label: "Payment", value: "Use card with sixteen 0's" },
    ],
  },
  {
    id: "buildingblocks",
    repo: "https://github.com/bhupesh-roushan/BuildingBlocks",
    // PLACEHOLDER — correct this. Reviewers read impact numbers very
    // differently depending on whether you owned all of it or part of it.
    role: "Solo build — design, frontend, backend and deployment",
    title: "BuildingBlocks",
    tagline: "Learning Management System",
    period: "January 2025",
    image: buildingBlocks,
    href: "https://buildingblocks.cloud",
    accent: "56,189,248",
    span: "lg:col-span-2",
    stack: [
      "Node.js",
      "Express.js",
      "MongoDB",
      "React.js",
      "PayPal",
      "Cloudinary",
      "Shadcn UI",
      "Tailwind CSS",
      "Vercel",
      "Hostinger",
    ],
    bullets: [
      "Developed an LMS with role-based dashboards for instructors and students, improving course management efficiency by 40%.",
      "Implemented course creation and management with bulk video uploads, real-time tracking, and interactive controls, reducing upload time by 60% and boosting engagement.",
      "Integrated the PayPal payment gateway for secure transactions, increasing payment success rate by 25%, and hosted the platform on a custom domain for better accessibility.",
    ],
    credentials: [
      { label: "Student", value: "student@gmail.com / student" },
      { label: "Instructor", value: "instructor@gmail.com / instructor" },
      { label: "Payment", value: "buildingblocks@business.com / buildingblocks" },
    ],
  },
  {
    id: "hourglass",
    repo: "https://github.com/bhupesh-roushan/hourglass",
    // PLACEHOLDER — correct this. Reviewers read impact numbers very
    // differently depending on whether you owned all of it or part of it.
    role: "Solo build — design, frontend, backend and deployment",
    title: "Hourglass",
    tagline: "Real-Time Social Media",
    image: hourglass,
    href: "https://hourglass-0e3w.onrender.com/",
    accent: "236,72,153",
    span: "lg:col-span-3",
    stack: [
      "React.js",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Redux",
      "Socket.io",
      "Cloudinary",
      "Shadcn UI",
      "Tailwind CSS",
      "Render",
    ],
    bullets: [
      "Developed Hourglass, a social media app with real-time messaging, post creation, likes, comments, and bookmarks using React.js, Node.js, Express.js, and MongoDB.",
      "Integrated Cloudinary for image uploads, Redux Toolkit for state management, and Socket.io for real-time messaging and notifications, enhancing user engagement.",
      "Styled with Tailwind CSS and Shadcn, deployed on Render for seamless scalability and reliable hosting.",
    ],
    credentials: [
      { label: "Username", value: "hourglass@user.com" },
      { label: "Password", value: "admin@user.com" },
    ],
  },
  {
    id: "cubekit",
    repo: "https://github.com/bhupesh-roushan/cubekit-hiring",
    // PLACEHOLDER — correct this. Reviewers read impact numbers very
    // differently depending on whether you owned all of it or part of it.
    role: "Solo build — design, frontend, backend and deployment",
    title: "Cubekit",
    tagline: "Hiring Platform",
    period: "August 2024",
    image: cubekit,
    href: "https://cubekit.vercel.app/",
    accent: "34,197,94",
    span: "lg:col-span-3",
    stack: [
      "React.js",
      "Tailwind CSS",
      "Shadcn UI",
      "Supabase",
      "Clerk",
      "React Hook Form",
      "Zod",
      "EmailJS",
      "Vercel",
    ],
    bullets: [
      "Developed Cubekit, a hiring platform using React.js, Supabase, and Clerk for secure authentication and role-based dashboards.",
      "Implemented an advanced job posting system with React Hook Form, Zod, and location-based filtering, reducing job posting time by 40%.",
      "Streamlined job applications with resume uploads, status tracking, and a responsive UI using Tailwind CSS, Shadcn, and EmailJS for automated newsletters.",
    ],
    credentials: [
      { label: "Recruiter", value: "recruiter@gmail.com / 12345678" },
      { label: "Candidate", value: "candidate@gmail.com / 12345678" },
    ],
  },
  {
    id: "frequencii",
    repo: "https://github.com/bhupesh-roushan/frequencii",
    // PLACEHOLDER — correct this. Reviewers read impact numbers very
    // differently depending on whether you owned all of it or part of it.
    role: "Solo build — design, frontend, backend and deployment",
    title: "Frequencii",
    tagline: "E-Commerce Prototype",
    image: frequencii,
    href: "https://frequencii.vercel.app",
    accent: "249,115,22",
    span: "lg:col-span-3",
    stack: [
      "React.js",
      "Redux",
      "Redux Toolkit",
      "EmailJS",
      "Shadcn UI",
      "Tailwind CSS",
      "Vercel",
    ],
    bullets: [
      "Developed an e-commerce prototype using React.js and Redux Toolkit for dynamic state management and an interactive user experience.",
      "Styled with Tailwind CSS and Shadcn, ensuring a fully responsive and visually appealing interface.",
      "Integrated EmailJS for automated customer communication, enhancing user engagement.",
    ],
  },
  {
    id: "pictelai",
    repo: "https://github.com/bhupesh-roushan/PictelAI-Powered-by-Gemini",
    // PLACEHOLDER — correct this. Reviewers read impact numbers very
    // differently depending on whether you owned all of it or part of it.
    role: "Solo build — design, frontend, backend and deployment",
    title: "PictelAI",
    tagline: "Powered by Gemini",
    image: pictelAi,
    href: "https://pictelai.vercel.app/",
    accent: "168,85,247",
    span: "lg:col-span-3",
    stack: [
      "React.js",
      "Context API",
      "Tailwind CSS",
      "Google Gemini API",
      "Vercel",
    ],
    bullets: [
      "Developed an AI-powered web app using React.js and integrated the Google Gemini API for interactive content generation.",
      "Utilized Context API for efficient and scalable state management.",
      "Designed a responsive UI with Tailwind CSS, ensuring a seamless experience across all devices.",
    ],
  },
];
