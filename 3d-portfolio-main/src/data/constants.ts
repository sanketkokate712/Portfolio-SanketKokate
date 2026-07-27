// Sanket Kokate — Skills & Experience
export enum SkillNames {
  JS = "js",
  TS = "ts",
  HTML = "html",
  CSS = "css",
  REACT = "react",
  NEXTJS = "nextjs",
  TAILWIND = "tailwind",
  NODEJS = "nodejs",
  EXPRESS = "express",
  SUPABASE = "supabase",
  MONGODB = "mongodb",
  GIT = "git",
  GITHUB = "github",
  NPM = "npm",
  PYTHON = "python",
  CPP = "cpp",
  ROS2 = "ros2",
  OPENCV = "opencv",
  FIGMA = "figma",
  VSCODE = "vscode",
  VERCEL = "vercel",
  ZUSTAND = "zustand",
  ZOD = "zod",
  RECHARTS = "recharts",
}
export type Skill = {
  id: number;
  name: string;
  label: string;
  shortDescription: string;
  color: string;
  icon: string;
};
export const SKILLS: Record<SkillNames, Skill> = {
  [SkillNames.JS]: {
    id: 1,
    name: "js",
    label: "JavaScript",
    shortDescription: "Building interactive experiences since day one! 💯🚀",
    color: "#f0db4f",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  },
  [SkillNames.TS]: {
    id: 2,
    name: "ts",
    label: "TypeScript",
    shortDescription:
      "Type-safe code that scales with confidence 💯🔒",
    color: "#007acc",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  [SkillNames.HTML]: {
    id: 3,
    name: "html",
    label: "HTML",
    shortDescription: "The backbone of every web experience 🔥",
    color: "#e34c26",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  },
  [SkillNames.CSS]: {
    id: 4,
    name: "css",
    label: "CSS",
    shortDescription: "Making things look pixel-perfect 💁‍♂️✨",
    color: "#563d7c",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  },
  [SkillNames.REACT]: {
    id: 5,
    name: "react",
    label: "React",
    shortDescription: "Component-driven UIs that just work ⚛️",
    color: "#61dafb",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
  [SkillNames.NEXTJS]: {
    id: 7,
    name: "nextjs",
    label: "Next.js",
    shortDescription:
      "Full-stack React framework for production apps 👑",
    color: "#fff",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  },
  [SkillNames.TAILWIND]: {
    id: 8,
    name: "tailwind",
    label: "Tailwind CSS",
    shortDescription: "Utility-first CSS for rapid UI development 🌪️",
    color: "#38bdf8",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg",
  },
  [SkillNames.NODEJS]: {
    id: 9,
    name: "nodejs",
    label: "Node.js",
    shortDescription: "Server-side JavaScript powering scalable backends 🔙",
    color: "#6cc24a",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  },
  [SkillNames.EXPRESS]: {
    id: 10,
    name: "express",
    label: "Express.js",
    shortDescription: "Fast, unopinionated web framework for Node.js 🚂",
    color: "#fff",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
  },
  [SkillNames.SUPABASE]: {
    id: 11,
    name: "supabase",
    label: "Supabase",
    shortDescription: "Open-source Firebase alternative with Postgres 🔥",
    color: "#3ECF8E",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg",
  },
  [SkillNames.MONGODB]: {
    id: 12,
    name: "mongodb",
    label: "MongoDB",
    shortDescription: "NoSQL database for flexible data modeling 💪🍃",
    color: "#336791",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  },
  [SkillNames.GIT]: {
    id: 13,
    name: "git",
    label: "Git",
    shortDescription: "Version control that keeps code history safe 🕵️‍♂️",
    color: "#f1502f",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  },
  [SkillNames.GITHUB]: {
    id: 14,
    name: "github",
    label: "GitHub",
    shortDescription: "Where all the code lives and gets reviewed 🐙",
    color: "#000000",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  },
  [SkillNames.NPM]: {
    id: 16,
    name: "npm",
    label: "NPM",
    shortDescription: "Package manager that keeps dependencies in check 📦",
    color: "#fff",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg",
  },
  [SkillNames.PYTHON]: {
    id: 17,
    name: "python",
    label: "Python",
    shortDescription: "From robotics to AI — Python does it all 🐍",
    color: "#3776AB",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  [SkillNames.CPP]: {
    id: 18,
    name: "cpp",
    label: "C/C++",
    shortDescription: "High-performance systems programming & competitive coding ⚡",
    color: "#00599C",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  },
  [SkillNames.ROS2]: {
    id: 19,
    name: "ros2",
    label: "ROS 2",
    shortDescription: "Robot Operating System for autonomous navigation 🤖",
    color: "#22314E",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ros/ros-original.svg",
  },
  [SkillNames.OPENCV]: {
    id: 20,
    name: "opencv",
    label: "OpenCV",
    shortDescription: "Computer vision for real-time detection & SLAM 👁️",
    color: "#5C3EE8",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg",
  },
  [SkillNames.FIGMA]: {
    id: 21,
    name: "figma",
    label: "Figma",
    shortDescription: "Designing beautiful interfaces collaboratively 🎨",
    color: "#F24E1E",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
  },
  [SkillNames.VSCODE]: {
    id: 22,
    name: "vscode",
    label: "VS Code",
    shortDescription: "The code editor that does everything ⚙️",
    color: "#007ACC",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
  },
  [SkillNames.VERCEL]: {
    id: 24,
    name: "vercel",
    label: "Vercel",
    shortDescription:
      "Deploy and ship to production instantly 🚀",
    color: "#6cc24a",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg",
  },
  [SkillNames.ZUSTAND]: {
    id: 25,
    name: "zustand",
    label: "Zustand",
    shortDescription: "Lightweight state management for React 🐻",
    color: "#764ABC",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
  [SkillNames.ZOD]: {
    id: 26,
    name: "zod",
    label: "Zod",
    shortDescription: "TypeScript-first schema validation 🛡️",
    color: "#3068B7",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  [SkillNames.RECHARTS]: {
    id: 27,
    name: "recharts",
    label: "Recharts",
    shortDescription: "Beautiful charts for React applications 📊",
    color: "#FF6347",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
};

export type Experience = {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  company: string;
  description: string[];
  skills: SkillNames[];
};

export const EXPERIENCE: Experience[] = [
  {
    id: 1,
    startDate: "May 2026",
    endDate: "July 2026",
    title: "Web Development Intern",
    company: "Progentures Solutions",
    description: [
      "Designed and developed responsive frontend interfaces, prioritizing seamless user experience and strict accessibility standards across devices.",
      "Engineered a custom MongoDB data collection system to efficiently streamline, store, and manage robust educational question banks.",
    ],
    skills: [
      SkillNames.HTML,
      SkillNames.CSS,
      SkillNames.JS,
      SkillNames.REACT,
      SkillNames.MONGODB,
      SkillNames.NODEJS,
    ],
  },
];

export const themeDisclaimers = {
  light: [
    "Warning: Light mode emits a gazillion lumens of pure radiance!",
    "Caution: Light mode ahead! Please don't try this at home.",
    "Only trained professionals can handle this much brightness. Proceed with sunglasses!",
    "Brace yourself! Light mode is about to make everything shine brighter than your future.",
    "Flipping the switch to light mode... Are you sure your eyes are ready for this?",
  ],
  dark: [
    "Light mode? I thought you went insane... but welcome back to the dark side!",
    "Switching to dark mode... How was life on the bright side?",
    "Dark mode activated! Thanks from the bottom of my heart, and my eyes too.",
    "Welcome back to the shadows. How was life out there in the light?",
    "Dark mode on! Finally, someone who understands true sophistication.",
  ],
};
