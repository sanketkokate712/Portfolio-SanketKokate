import AceTernityLogo from "@/components/logos/aceternity";
import SlideShow from "@/components/slide-show";
import { Button } from "@/components/ui/button";
import { TypographyH3, TypographyP } from "@/components/ui/typography";
import { ArrowUpRight, ExternalLink, Link2, MoveUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
// Spline has no thesvg entry — keep the Three.js mark as its stand-in.
import { SiThreedotjs } from "react-icons/si";
const BASE_PATH = "/assets/projects-screenshots";

// Renders a brand SVG from /public as a monochrome glyph that inherits the
// surrounding text color (the skill dock styles every icon via currentColor),
// so full-color marks like Mistral flatten to match the rest of the set.
const MaskIcon = ({ src, title }: { src: string; title?: string }) => (
  <span
    role="img"
    aria-label={title}
    className="block bg-current"
    style={{
      width: "1em",
      height: "1em",
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "contain",
      maskSize: "contain",
    }}
  />
);

const ProjectsLinks = ({ live, repo }: { live?: string; repo?: string }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-start gap-3 my-3 mb-8">
      {live && live !== "#" && (
        <Link
          className="font-mono underline flex gap-2"
          rel="noopener"
          target="_new"
          href={live}
        >
          <Button variant={"default"} size={"sm"}>
            Visit Website
            <ArrowUpRight className="ml-3 w-5 h-5" />
          </Button>
        </Link>
      )}
      {repo && repo !== "#" && (
        <Link
          className="font-mono underline flex gap-2"
          rel="noopener"
          target="_new"
          href={repo}
        >
          <Button variant={"default"} size={"sm"}>
            Github
            <ArrowUpRight className="ml-3 w-5 h-5" />
          </Button>
        </Link>
      )}
    </div>
  );
};

export type Skill = {
  title: string;
  bg: string;
  fg: string;
  icon: ReactNode;
};
// Brand chips sourced from thesvg CLI mono SVGs in /public/assets/logos,
// rendered via MaskIcon so each one inherits the dock's currentColor.
const brand = (title: string, file: string): Skill => ({
  title,
  bg: "black",
  fg: "white",
  icon: <MaskIcon src={`/assets/logos/${file}`} title={title} />,
});
const PROJECT_SKILLS = {
  next: brand("Next.js", "nextdotjs-mono.svg"),
  chakra: brand("Chakra UI", "chakra-ui-mono.svg"),
  node: brand("Node.js", "nodedotjs-mono.svg"),
  python: brand("Python", "python-mono.svg"),
  prisma: brand("Prisma", "prisma-mono.svg"),
  postgres: brand("PostgreSQL", "postgresql-mono.svg"),
  mongo: brand("MongoDB", "mongodb-mono.svg"),
  express: brand("Express", "express-mono.svg"),
  reactQuery: brand("React Query", "react-query-mono.svg"),
  shadcn: brand("shadcn/ui", "shadcn-ui-mono.svg"),
  // Not in the thesvg registry — keep the existing custom logo.
  aceternity: {
    title: "Aceternity",
    bg: "black",
    fg: "white",
    icon: <AceTernityLogo />,
  },
  tailwind: brand("Tailwind", "tailwind-css-mono.svg"),
  docker: brand("Docker", "docker-mono.svg"),
  // Not in the thesvg registry — keep the text mark.
  yjs: {
    title: "Y.js",
    bg: "black",
    fg: "white",
    icon: (
      <span>
        <strong>Y</strong>js
      </span>
    ),
  },
  firebase: brand("Firebase", "firebase-mono.svg"),
  sockerio: brand("Socket.io", "socketdotio-mono.svg"),
  js: brand("JavaScript", "javascript-mono.svg"),
  ts: brand("TypeScript", "typescript-mono.svg"),
  vue: brand("Vue.js", "vuedotjs-mono.svg"),
  react: brand("React.js", "react-mono.svg"),
  sanity: brand("Sanity", "sanity-mono.svg"),
  // Not in the thesvg registry — keep the Three.js stand-in.
  spline: {
    title: "Spline",
    bg: "black",
    fg: "white",
    icon: <SiThreedotjs />,
  },
  gsap: brand("GSAP", "gsap-mono.svg"),
  motion: brand("Motion", "motion.svg"),
  supabase: brand("Supabase", "supabase-mono.svg"),
  trpc: brand("tRPC", "trpc-mono.svg"),
  drizzle: brand("Drizzle ORM", "drizzle-mono.svg"),
  hono: brand("Hono", "hono-mono.svg"),
  redis: brand("Redis / BullMQ", "redis-mono.svg"),
  cloudflare: brand("Cloudflare", "cloudflare-mono.svg"),
  // React Native reuses the React mark.
  reactNative: brand("React Native", "react-mono.svg"),
  betterAuth: brand("Better Auth", "better-auth-mono.svg"),
  // Not in the thesvg registry — keep the text marks.
  zustand: {
    title: "Zustand",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">Zu</span>,
  },
  partykit: {
    title: "PartyKit",
    bg: "black",
    fg: "white",
    icon: <span className="text-base">🎈</span>,
  },
  hocuspocus: {
    title: "Hocuspocus",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">Hp</span>,
  },
  // React Flow ships under the xyflow brand.
  reactFlow: brand("React Flow", "xyflow-mono.svg"),
  codemirror: brand("CodeMirror", "codemirror-mono.svg"),
  // "Satori / sharp" — uses the sharp mark.
  satori: brand("Satori / sharp", "sharp-mono.svg"),
  turborepo: brand("Turborepo", "turborepo-mono.svg"),
  // Vercel AI SDK uses the Vercel mark.
  aiSDK: brand("Vercel AI SDK", "vercel-mono.svg"),
  anthropic: brand("Anthropic Claude", "anthropic-mono.svg"),
  mistral: brand("Mistral AI", "mistral-ai-mono.svg"),
  // Not in the thesvg registry — keep the text mark.
  nextIntl: {
    title: "next-intl",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">i18n</span>,
  },
  // Not in the thesvg registry — keep the text marks.
  expo: {
    title: "Expo",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">Expo</span>,
  },
  mcp: {
    title: "MCP",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">MCP</span>,
  },
  html: {
    title: "HTML",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">HTML</span>,
  },
  css: {
    title: "CSS",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">CSS</span>,
  },
  cpp: {
    title: "C/C++",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">C++</span>,
  },
  ros2: {
    title: "ROS 2",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">ROS2</span>,
  },
  opencv: {
    title: "OpenCV",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">CV</span>,
  },
};
export type Project = {
  id: string;
  category: string;
  title: string;
  src: string;
  screenshots: string[];
  skills: { frontend: Skill[]; backend: Skill[] };
  content: React.ReactNode | any;
  github?: string;
  live: string;
};
const projects: Project[] = [
  {
    id: "rmageddon",
    category: "Event Website",
    title: "Rmageddon 2k26",
    src: "/assets/seo/rmageddon%20project.png",
    screenshots: ["/assets/seo/rmageddon%20project.png"],
    skills: {
      frontend: [
        PROJECT_SKILLS.html,
        PROJECT_SKILLS.css,
        PROJECT_SKILLS.js,
        PROJECT_SKILLS.react,
        PROJECT_SKILLS.next,
        PROJECT_SKILLS.tailwind,
      ],
      backend: [PROJECT_SKILLS.node],
    },
    live: "https://rmageddon2026.tech",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            A fully responsive event website driving digital engagement and registrations for Rmageddon 2k26.
          </TypographyP>
          <TypographyP className="font-mono">
            Built and launched a fully responsive event website from scratch to drive digital engagement and registrations for Rmageddon 2k26 — the flagship tech fest. The site features an immersive dark theme, fluid responsive layouts across all devices, and seamless user registration flows.
          </TypographyP>
          <TypographyP className="font-mono">
            Engineered with React.js and Next.js on the frontend, styled with Tailwind CSS for rapid and pixel-perfect UI development. The backend is powered by Node.js, handling registration logic and data management efficiently.
          </TypographyP>
          <TypographyH3 className="mt-4">✨ Key Highlights</TypographyH3>
          <ul className="list-disc pl-6 font-mono space-y-1 mt-2">
            <li>Designed and developed a fully responsive event website end-to-end</li>
            <li>Implemented seamless user registration and event sign-up flows</li>
            <li>Immersive dark-themed UI with smooth animations and micro-interactions</li>
            <li>Optimized for performance and accessibility across all screen sizes</li>
            <li>Successfully handled live traffic during the event registration period</li>
          </ul>
          <ProjectsLinks live={this.live} />
        </div>
      );
    },
  },
  {
    id: "tsank",
    category: "E-Commerce",
    title: "TSank - T-Shirt Brand",
    src: "/assets/seo/tsannk.png",
    screenshots: ["/assets/seo/tsannk.png"],
    skills: {
      frontend: [
        PROJECT_SKILLS.html,
        PROJECT_SKILLS.css,
        PROJECT_SKILLS.js,
        PROJECT_SKILLS.react,
        PROJECT_SKILLS.next,
        PROJECT_SKILLS.tailwind,
      ],
      backend: [PROJECT_SKILLS.node],
    },
    live: "https://t-sank.vercel.app",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            An intuitive e-commerce interface for the TSank t-shirt brand.
          </TypographyP>
          <TypographyP className="font-mono">
            Crafted an intuitive e-commerce user interface for the TSank t-shirt brand, managing the entire process from initial design concepts to final deployment. The platform showcases a modern, clean aesthetic with smooth product browsing and a responsive shopping experience.
          </TypographyP>
          <TypographyH3 className="mt-4">✨ Key Highlights</TypographyH3>
          <ul className="list-disc pl-6 font-mono space-y-1 mt-2">
            <li>End-to-end design and development from concept to deployment</li>
            <li>Modern e-commerce UI with intuitive product browsing</li>
            <li>Fully responsive across mobile, tablet, and desktop</li>
            <li>Deployed and live on Vercel for instant global access</li>
          </ul>
          <ProjectsLinks live={this.live} />
        </div>
      );
    },
  },
  {
    id: "lunabot",
    category: "Robotics & AI",
    title: "Luna Bot - Smart India Hackathon @ISRO",
    src: "/assets/seo/SIHHH.jpg",
    screenshots: ["/assets/seo/SIHHH.jpg"],
    skills: {
      frontend: [PROJECT_SKILLS.ros2, PROJECT_SKILLS.opencv],
      backend: [PROJECT_SKILLS.cpp, PROJECT_SKILLS.python],
    },
    live: "#",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            Autonomous lunar rover for habitat navigation — SIH Finalist 🏆
          </TypographyP>
          <TypographyP className="font-mono">
            Collaborated with Team Vision Luna to engineer an autonomous rover designed specifically for complex lunar habitat navigation and structural maintenance. The rover was built to operate in simulated lunar terrain conditions.
          </TypographyP>
          <TypographyP className="font-mono">
            Spearheaded the implementation of RTAB-Map for Simultaneous Localization and Mapping (SLAM) and successfully managed real-time Digital Twin operations using MATLAB and Gazebo simulation environments.
          </TypographyP>
          <TypographyH3 className="mt-4">🏅 Achievements</TypographyH3>
          <ul className="list-disc pl-6 font-mono space-y-1 mt-2">
            <li><strong>SIH Grand Finalist</strong> — Reached the grand finale of Smart India Hackathon</li>
            <li>Interacted directly with <strong>ISRO scientists</strong> during the final presentation</li>
            <li>Implemented RTAB-Map SLAM for autonomous navigation</li>
            <li>Managed real-time Digital Twin operations using MATLAB</li>
            <li>Built with ROS 2, Python, MATLAB, and Gazebo</li>
          </ul>
        </div>
      );
    },
  },
  {
    id: "coldstorage",
    category: "Robotics & AI",
    title: "eYRC IITB — AIR 3 (Software Edition)",
    src: "/assets/seo/holo.jpg",
    screenshots: ["/assets/seo/holo.jpg"],
    skills: {
      frontend: [PROJECT_SKILLS.ros2, PROJECT_SKILLS.opencv],
      backend: [PROJECT_SKILLS.python],
    },
    live: "#",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            Multi-robot cold storage automation — All India Rank 3 🥉
          </TypographyP>
          <TypographyP className="font-mono">
            Programmed a collaborative multi-robot system in ROS 2 to autonomously navigate and optimize the sorting of perishable goods within a simulated cold storage facility as part of the e-Yantra Robotics Competition by IIT Bombay.
          </TypographyP>
          <TypographyP className="font-mono">
            Developed precise kinematics and custom motor control logic for holonomic robots, specifically adapting algorithms for unique left/right front wheel hardware configurations. Integrated Nav2 for path planning and OpenCV for computer vision tasks.
          </TypographyP>
          <TypographyH3 className="mt-4">🏅 Achievements</TypographyH3>
          <ul className="list-disc pl-6 font-mono space-y-1 mt-2">
            <li><strong>All India Rank 3</strong> out of nationwide participating teams</li>
            <li>e-Yantra Robotics Competition (Software Edition) by <strong>IIT Bombay</strong></li>
            <li>Built collaborative multi-robot autonomous navigation system</li>
            <li>Custom kinematics for holonomic robot configurations</li>
            <li>Tech stack: ROS 2 (Humble), Python, Gazebo, Nav2, OpenCV</li>
          </ul>
        </div>
      );
    },
  },
  {
    id: "quadcopter",
    category: "Robotics & AI",
    title: "Drone YOLO Model for Detection of Lane",
    src: "/assets/seo/robofest.jpg",
    screenshots: ["/assets/seo/robofest.jpg"],
    skills: {
      frontend: [PROJECT_SKILLS.ros2, PROJECT_SKILLS.opencv],
      backend: [PROJECT_SKILLS.python],
    },
    live: "#",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            Autonomous quadcopter with YOLOv8 real-time detection — Gujarat Robofest Finalist 🏆
          </TypographyP>
          <TypographyP className="font-mono">
            Assembled and programmed a custom quadcopter for autonomous flight, utilizing onboard edge computing via Raspberry Pi to process real-time environmental data for lane detection and navigation.
          </TypographyP>
          <TypographyP className="font-mono">
            Led the software engineering efforts by integrating YOLOv8 via OpenCV, achieving highly accurate and latency-free real-time object detection from aerial feeds. Used DroneKit for flight control and mission planning.
          </TypographyP>
          <TypographyH3 className="mt-4">🏅 Achievements</TypographyH3>
          <ul className="list-disc pl-6 font-mono space-y-1 mt-2">
            <li><strong>Gujarat Robofest 5.0 Finalist</strong> — Reached the finals of this national-level competition</li>
            <li>Integrated <strong>YOLOv8</strong> for real-time aerial object detection</li>
            <li>Edge computing on Raspberry Pi for onboard processing</li>
            <li>Built with DroneKit, OpenCV, Python, and custom flight controllers</li>
            <li>Achieved latency-free detection from live aerial video feeds</li>
          </ul>
        </div>
      );
    },
  },
];
export default projects;
