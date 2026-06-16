const { rmSync } = require("fs");
const { spawn } = require("child_process");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const nextDirectory = path.join(projectRoot, ".next");
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const hostname = "127.0.0.1";
const port = "3000";

try {
  rmSync(nextDirectory, { recursive: true, force: true });
} catch (error) {
  console.error("Failed to clean .next before starting dev server:", error);
}

const child = spawn(process.execPath, [nextBin, "dev", "--hostname", hostname, "--port", port], {
  cwd: projectRoot,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
