const config = {
  title: "Sanket Kokate | Full-Stack Developer",
  description: {
    long: "Explore the portfolio of Sanket Kokate, a full-stack developer specializing in interactive web experiences, modern 3D UI, and innovative applications. Discover my work and interactive projects!",
    short:
      "Discover the portfolio of Sanket Kokate, a full-stack developer creating interactive 3D web experiences.",
  },
  keywords: [
    "Sanket Kokate",
    "portfolio",
    "full-stack developer",
    "software engineer",
    "web development",
    "3D web developer",
    "interactive websites",
    "Rubik's Cube",
    "React",
    "Next.js",
    "Node.js",
  ],
  author: "Sanket Kokate",
  email: "sanketkokate712@gmail.com",
  site: "https://sanketkokate.dev",

  // for github stars button
  githubUsername: "sanketkokate712",
  githubRepo: "Sanket-portfolio",

  get ogImg() {
    return this.site + "/assets/seo/og-image.png";
  },
  social: {
    twitter: "https://x.com/Sanketkok712",
    linkedin: "https://www.linkedin.com/in/sanket-kokate-150b20282/",
    instagram: "https://www.instagram.com/sanketkokate",
    facebook: "https://www.facebook.com/sanketkokate",
    github: "https://github.com/sanketkokate712",
  },
};
export { config };
