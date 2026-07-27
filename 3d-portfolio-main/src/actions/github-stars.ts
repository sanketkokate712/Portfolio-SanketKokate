import { config } from "@/data/config";

export async function getGithubStars(): Promise<number> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${config.githubUsername}/${config.githubRepo}`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data.stargazers_count === "number" ? data.stargazers_count : 0;
  } catch {
    return 0;
  }
}
