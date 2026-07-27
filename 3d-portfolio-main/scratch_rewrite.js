const fs = require('fs');

const path = 'c:\\Users\\sanke\\Downloads\\3d-portfolio-main\\3d-portfolio-main\\src\\data\\projects.tsx';
let content = fs.readFileSync(path, 'utf8');

// The original file has "const projects: Project[] = [" around line 200.
const splitIndex = content.indexOf('const projects: Project[] = [');
if (splitIndex === -1) {
    console.error("Could not find projects array declaration");
    process.exit(1);
}

const header = content.slice(0, splitIndex);

const newProjects = `const projects: Project[] = [
  {
    id: "rmageddon",
    category: "Event Website",
    title: "Rmageddon 2k26",
    src: "/assets/projects-screenshots/logo-dark.webp",
    screenshots: ["/assets/projects-screenshots/logo-dark.webp"],
    skills: {
      frontend: [
        PROJECT_SKILLS.html,
        PROJECT_SKILLS.css,
        PROJECT_SKILLS.js,
        PROJECT_SKILLS.react,
        PROJECT_SKILLS.next,
      ],
      backend: [PROJECT_SKILLS.node],
    },
    live: "https://rmageddon2026.tech",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            A fully responsive event website driving digital engagement and registrations.
          </TypographyP>
          <TypographyP className="font-mono">
            Built from the ground up for Rmageddon 2k26, this website features an immersive dark theme, responsive layouts across all devices, and seamless user registration flows.
          </TypographyP>
          <ProjectsLinks live={this.live} />
        </div>
      );
    },
  },
  {
    id: "lunabot",
    category: "Robotics / Hardware",
    title: "LunaBot",
    src: "/assets/projects-screenshots/logo-dark.webp",
    screenshots: ["/assets/projects-screenshots/logo-dark.webp"],
    skills: {
      frontend: [PROJECT_SKILLS.ros2, PROJECT_SKILLS.opencv],
      backend: [PROJECT_SKILLS.cpp, PROJECT_SKILLS.python],
    },
    live: "#",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            Semi-autonomous modular robotic system for SIH 2024.
          </TypographyP>
          <TypographyP className="font-mono">
            Developed a robotics platform integrating ROS 2 with custom C++ & Python logic. Used OpenCV for computer vision tasks and implemented SLAM for autonomous navigation. Reached the finals of the Smart India Hackathon.
          </TypographyP>
        </div>
      );
    },
  },
  {
    id: "coldstorage",
    category: "IoT / Automation",
    title: "Automated Cold Storage",
    src: "/assets/projects-screenshots/logo-dark.webp",
    screenshots: ["/assets/projects-screenshots/logo-dark.webp"],
    skills: {
      frontend: [PROJECT_SKILLS.ros2],
      backend: [PROJECT_SKILLS.python],
    },
    live: "#",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            Intelligent inventory tracking and storage system (e-Yantra AIR 3).
          </TypographyP>
          <TypographyP className="font-mono">
            Leveraged ROS and Raspberry Pi to build an automated cold storage unit. Handled complex sensor integrations, real-time data monitoring, and mechanical actuations to ensure optimal storage conditions. Secured All India Rank 3.
          </TypographyP>
        </div>
      );
    },
  },
  {
    id: "quadcopter",
    category: "Aerospace / Hardware",
    title: "Autonomous Quadcopter",
    src: "/assets/projects-screenshots/logo-dark.webp",
    screenshots: ["/assets/projects-screenshots/logo-dark.webp"],
    skills: {
      frontend: [PROJECT_SKILLS.ros2],
      backend: [PROJECT_SKILLS.python],
    },
    live: "#",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            Drone navigation and stabilization system.
          </TypographyP>
          <TypographyP className="font-mono">
            Designed an autonomous quadcopter relying on Python and ROS for stable flight mechanics and path planning. Engineered custom PID controllers and telemetry streams to orchestrate aerial movements safely.
          </TypographyP>
        </div>
      );
    },
  },
];
export default projects;
`;

fs.writeFileSync(path, header + newProjects);
console.log("Successfully updated projects.tsx");
