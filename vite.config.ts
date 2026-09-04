import { defineConfig } from "vite";

const forGitHubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.GITHUB_REPO_NAME || "wack-the-man";
const base = forGitHubPages ? `/${repoName}/` : "/";

export default defineConfig({
  base,
  server: {
    host: "0.0.0.0",
    port: 43210,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 43210,
    allowedHosts: true,
  },
});
