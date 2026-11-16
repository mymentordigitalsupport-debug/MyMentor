import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve("artifacts/email-previews");
const profile = await mkdtemp(path.join(root, "chrome-cdp-"));
const chrome = spawn(process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-software-rasterizer", "--no-first-run", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
let socket;
let nextId = 0;
const pending = new Map();

async function command(method, params = {}, sessionId) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

try {
  let endpoint;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const [port, token] = (await readFile(path.join(profile, "DevToolsActivePort"), "utf8")).trim().split("\n");
      endpoint = `ws://127.0.0.1:${port}${token}`;
      break;
    } catch { await new Promise((resolve) => setTimeout(resolve, 100)); }
  }
  if (!endpoint) throw new Error("Chrome did not start");
  socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
  });
  const { targetId } = await command("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await command("Target.attachToTarget", { targetId, flatten: true });
  await command("Page.enable", {}, sessionId);
  await command("Runtime.enable", {}, sessionId);
  await mkdir(root, { recursive: true });
  for (const [file, width] of [
    ["mymentor-payment-request-created.html", 390],
    ["mymentor-payment-needs-resubmission.html", 320],
    ["mymentor-payment-rejected.html", 320],
    ["mymentor-article-declined.html", 320],
    ["mymentor-author-application-declined.html", 320],
    ["mymentor-member-registration-welcome.html", 390],
    ["mymentor-admin-notification.html", 600],
  ]) {
    await command("Emulation.setDeviceMetricsOverride", { width, height: 820, deviceScaleFactor: 1, mobile: width < 600 }, sessionId);
    await command("Page.navigate", { url: pathToFileURL(path.join(root, file)).href }, sessionId);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const { result } = await command("Runtime.evaluate", { expression: "({viewport:innerWidth,scroll:document.documentElement.scrollWidth})", returnByValue: true }, sessionId);
    const screenshot = await command("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, sessionId);
    const output = path.join(root, `${path.basename(file, ".html")}-${width}.png`);
    await writeFile(output, Buffer.from(screenshot.data, "base64"));
    console.log(`${file}: ${result.value.viewport}px viewport, ${result.value.scroll}px content`);
    if (result.value.scroll > result.value.viewport + 1) throw new Error(`${file} overflows at ${width}px`);
  }
} finally {
  socket?.close();
  chrome.kill();
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
