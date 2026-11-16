import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const chromePath = process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const baseUrl = process.env.MOBILE_QA_URL ?? "http://127.0.0.1:3000";
const outputDir = path.resolve("tests/screenshots/mobile");
const authMode = process.argv.includes("--member") ? "member" : process.argv.includes("--author") ? "author" : process.argv.includes("--onboarding") ? "onboarding" : null;
const selectedRoute = process.argv.find((arg) => arg.startsWith("--route="))?.slice(8);
const routes = selectedRoute ? [selectedRoute] : authMode === "member"
  ? ["/today", "/course", "/journal", "/journal/new", "/progress", "/threads", "/resources", "/payments", "/settings"]
  : authMode === "author" ? ["/author", "/author/articles/new"] : authMode === "onboarding" ? ["/onboarding"] : process.argv.includes("--all")
  ? ["/about", "/login", "/register", "/authors-login", "/authors-register", "/today", "/course", "/journal", "/progress", "/resources", "/payments", "/settings", "/author", "/author/articles/new"]
  : ["/about", "/login", "/register", "/authors-login", "/authors-register"];
const selectedWidth = process.argv.find((arg) => arg.startsWith("--width="))?.slice(8);
const widths = selectedWidth ? [Number(selectedWidth)] : process.argv.includes("--all-widths") || process.argv.includes("--all") ? [320, 360, 375, 390, 430, 768, 1024] : [320, 390, 430, 768];
const phase = process.argv.includes("--before") ? "before" : "after";
const auditOnly = process.argv.includes("--audit-only");
const failures = [];
const profileDir = await mkdtemp(path.join(os.tmpdir(), "mymentor-mobile-qa-"));
await mkdir(outputDir, { recursive: true });
const browser = spawn(chromePath, ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-extensions", "--no-first-run", "--remote-debugging-port=0", `--user-data-dir=${profileDir}`, "about:blank"], { stdio: "ignore" });

async function waitForPort() {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const [port, token] = (await readFile(path.join(profileDir, "DevToolsActivePort"), "utf8")).trim().split("\n");
      return `ws://127.0.0.1:${port}${token}`;
    } catch { await new Promise((resolve) => setTimeout(resolve, 100)); }
  }
  throw new Error("Chrome DevTools port unavailable");
}

class CDP {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data);
      const waiter = this.pending.get(message.id);
      if (!waiter) return;
      this.pending.delete(message.id);
      if (message.error) waiter.reject(new Error(message.error.message));
      else waiter.resolve(message.result);
    });
  }
  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
}

function slug(route) { return route === "/" ? "home" : route.slice(1).replaceAll("/", "-"); }

try {
  const socket = new WebSocket(await waitForPort());
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  const cdp = new CDP(socket);
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  if (authMode) {
    const fixture = JSON.parse(await readFile(path.resolve("tests/.mobile-qa-credentials.json"), "utf8"));
    const credentials = fixture[authMode];
    if (!credentials?.email || !credentials?.password) throw new Error(`Missing ${authMode} QA credentials`);
    const loginPath = authMode === "author" ? "/authors-login" : "/login";
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: widths[0], height: 844, deviceScaleFactor: 1, mobile: true }, sessionId);
    await cdp.send("Page.navigate", { url: new URL(loginPath, baseUrl).href }, sessionId);
    let loginReady = false;
    for (let attempt = 0; attempt < 150; attempt++) {
      const ready = await cdp.send("Runtime.evaluate", { expression: "(() => { const form = document.querySelector('input[type=email]')?.closest('form'); return Boolean(form && document.querySelector('input[type=password]') && Object.keys(form).some((key) => key.startsWith('__reactProps$') && typeof form[key]?.onSubmit === 'function')); })()", returnByValue: true }, sessionId);
      if (ready.result.value) { loginReady = true; break; }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    if (!loginReady) throw new Error(`${authMode} login did not hydrate`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await cdp.send("Runtime.evaluate", { expression: "document.querySelector('input[type=email]').focus()" }, sessionId);
    await cdp.send("Input.insertText", { text: credentials.email }, sessionId);
    await cdp.send("Runtime.evaluate", { expression: "document.querySelector('input[type=password]').focus()" }, sessionId);
    await cdp.send("Input.insertText", { text: credentials.password }, sessionId);
    const entered = await cdp.send("Runtime.evaluate", { expression: "Boolean(document.querySelector('input[type=email]')?.value && document.querySelector('input[type=password]')?.value)", returnByValue: true }, sessionId);
    if (!entered.result.value) throw new Error(`${authMode} QA credentials could not be entered`);
    await new Promise((resolve) => setTimeout(resolve, 200));
    await cdp.send("Runtime.evaluate", { expression: "document.querySelector('button[type=submit]').click()" }, sessionId);
    let signedIn = false;
    for (let attempt = 0; attempt < 150; attempt++) {
      const state = await cdp.send("Runtime.evaluate", { expression: "location.pathname", returnByValue: true }, sessionId);
      if (state.result.value !== loginPath && state.result.value !== "/") { signedIn = true; break; }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    if (!signedIn) {
      const diagnostic = await cdp.send("Runtime.evaluate", { expression: "({ path: location.pathname, feedback: document.querySelector('[role=alert]')?.textContent ?? document.querySelector('.login-error')?.textContent ?? '', emailEntered: Boolean(document.querySelector('input[type=email]')?.value), passwordEntered: Boolean(document.querySelector('input[type=password]')?.value) })", returnByValue: true }, sessionId);
      const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, sessionId);
      await writeFile(path.join(outputDir, `${authMode}-login-diagnostic.png`), Buffer.from(shot.data, "base64"));
      throw new Error(`${authMode} QA sign in failed: ${JSON.stringify(diagnostic.result.value)}`);
    }
    console.log(`${authMode} QA sign in succeeded`);
    if (authMode === "member" && !selectedRoute && fixture.routes) {
      const { course, chapter, lesson, journal } = fixture.routes;
      for (const route of [course, chapter, lesson, journal]) if (route && !routes.includes(route)) routes.push(route);
      for (const route of ["/journey", course?.replace("/course", "/journey"), chapter?.replace("/course", "/journey"), lesson?.replace("/course", "/journey")]) {
        if (route && !routes.includes(route)) routes.push(route);
      }
    }
    if (authMode === "author" && !selectedRoute) {
      const articles = await cdp.send("Runtime.evaluate", { expression: `(async () => {
        const response = await fetch('/api/author/articles');
        if (!response.ok) return { error: 'Article list unavailable' };
        const current = await response.json();
        if (current.articles?.length) return { id: current.articles[0].id };
        const created = await fetch('/api/author/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Mobile QA draft', slug: 'mobile-qa-draft', excerpt: 'A safe test article for responsive review.', contentMarkdown: '# Mobile QA draft\\n\\nResponsive review content.' }) });
        const result = await created.json();
        return { id: result.article?.id, error: result.error };
      })()`, awaitPromise: true, returnByValue: true }, sessionId);
      if (articles.result.value?.id) routes.push(`/author/articles/${articles.result.value.id}`);
      else console.error(`Author article fixture unavailable: ${articles.result.value?.error ?? "unknown error"}`);
    }
    const resumeRoute = process.argv.find((arg) => arg.startsWith("--resume-from="))?.slice(14);
    if (resumeRoute) {
      const start = routes.findIndex((route) => route === resumeRoute);
      if (start < 0) throw new Error(`Unknown resume route: ${resumeRoute}`);
      routes.splice(0, start);
    }
  }
  for (const route of routes) {
    for (const width of widths) {
      await cdp.send("Emulation.setDeviceMetricsOverride", { width, height: 844, deviceScaleFactor: 1, mobile: true }, sessionId);
      await cdp.send("Page.navigate", { url: new URL(route, baseUrl).href }, sessionId);
      for (let attempt = 0; attempt < 80; attempt++) {
        const result = await cdp.send("Runtime.evaluate", { expression: "document.readyState === 'complete' && document.body?.innerText.length > 20", returnByValue: true }, sessionId);
        if (result.result.value) break;
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      await new Promise((resolve) => setTimeout(resolve, 900));
      if (!auditOnly) {
        const { result: pageHeight } = await cdp.send("Runtime.evaluate", { expression: "document.documentElement.scrollHeight", returnByValue: true }, sessionId);
        for (let y = 0; y < pageHeight.value; y += 700) {
          await cdp.send("Runtime.evaluate", { expression: `window.scrollTo({ top: ${y}, behavior: 'instant' })` }, sessionId);
          await new Promise((resolve) => setTimeout(resolve, 60));
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await cdp.send("Runtime.evaluate", { expression: "window.scrollTo({ top: 0, behavior: 'instant' })" }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      const { result } = await cdp.send("Runtime.evaluate", { expression: `(() => {
        const vw = document.documentElement.clientWidth;
        const offenders = [...document.querySelectorAll('body *')].filter((element) => {
          const style = getComputedStyle(element);
          if (style.position === 'fixed' || style.visibility === 'hidden' || style.display === 'none') return false;
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && (rect.right > vw + 2 || rect.left < -2) && style.overflowX !== 'hidden' && style.overflowX !== 'clip';
        }).slice(0, 12).map((element) => ({ tag: element.tagName, className: String(element.className).slice(0, 100), text: element.textContent?.trim().slice(0, 60), right: Math.round(element.getBoundingClientRect().right) }));
        const interactiveOffenders = [...document.querySelectorAll('a[href],button,input,select,textarea,[role="button"],[role="tab"]')]
          .filter((element) => {
            const style = getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden' || element.closest('[aria-hidden="true"]')) return false;
            const rect = element.getBoundingClientRect();
            if (!rect.width || !rect.height || (rect.left >= -2 && rect.right <= vw + 2)) return false;
            let parent = element.parentElement;
            while (parent) {
              const overflow = getComputedStyle(parent).overflowX;
              if ((overflow === 'auto' || overflow === 'scroll') && parent.scrollWidth > parent.clientWidth) return false;
              parent = parent.parentElement;
            }
            return true;
          }).slice(0, 8).map((element) => ({ tag: element.tagName, text: element.textContent?.trim().slice(0, 50) }));
        const devIssue = [...document.querySelectorAll('nextjs-portal')]
          .map((portal) => (portal.shadowRoot?.textContent ?? '').match(/\d+ Issues?\s*$/)?.[0] ?? '')
          .find(Boolean) ?? '';
        return { path: location.pathname, title: document.title, viewport: vw, scrollWidth: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, offenders, interactiveOffenders, ...(devIssue ? { devIssue } : {}) };
      })()`, returnByValue: true }, sessionId);
      const state = result.value;
      if (state.height > 844) {
        const reach = await cdp.send("Runtime.evaluate", { expression: "(() => { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); return window.scrollY; })()", returnByValue: true }, sessionId);
        if (reach.result.value < state.height - 846) failures.push(`${route} ${width}px cannot reach page bottom`);
        await cdp.send("Runtime.evaluate", { expression: "window.scrollTo({ top: 0, behavior: 'instant' })" }, sessionId);
      }
      const filename = `${slug(route)}-${width}-${phase}.png`;
      if (!auditOnly) {
        const { data } = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, fromSurface: true }, sessionId);
        await writeFile(path.join(outputDir, filename), Buffer.from(data, "base64"));
        for (const [stateName, top] of [["top", 0], ["middle", Math.max(0, Math.floor((state.height - 844) / 2))], ["bottom", Math.max(0, state.height - 844)]]) {
          await cdp.send("Runtime.evaluate", { expression: `window.scrollTo({ top: ${top}, behavior: 'instant' })` }, sessionId);
          await new Promise((resolve) => setTimeout(resolve, 250));
          const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, fromSurface: true }, sessionId);
          await writeFile(path.join(outputDir, `${slug(route)}-${width}-${stateName}-${phase}.png`), Buffer.from(shot.data, "base64"));
        }
      }
      if (width <= 430 && route === "/about") {
        await cdp.send("Runtime.evaluate", { expression: "window.scrollTo({ top: 0, behavior: 'instant' })" }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 450));
        await cdp.send("Runtime.evaluate", { expression: "document.querySelector('button[aria-label=\"Open navigation\"]')?.click()" }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 350));
        const menu = await cdp.send("Runtime.evaluate", { expression: "Boolean(document.querySelector('#mobile-navigation')?.getBoundingClientRect().height)", returnByValue: true }, sessionId);
        if (!menu.result.value) failures.push(`/about ${width}px navigation did not open`);
        if (!auditOnly) {
          const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, sessionId);
          await writeFile(path.join(outputDir, `${slug(route)}-${width}-navigation-${phase}.png`), Buffer.from(shot.data, "base64"));
        }
      }
      if (width <= 430 && route === "/login") {
        await cdp.send("Runtime.evaluate", { expression: "window.scrollTo({ top: 0, behavior: 'instant' }); document.querySelector('.login-forgot')?.click()" }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const modal = await cdp.send("Runtime.evaluate", { expression: "(() => { const node = document.querySelector('[role=dialog]'); if (!node) return false; const box = node.getBoundingClientRect(); return box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight; })()", returnByValue: true }, sessionId);
        if (!modal.result.value) failures.push(`/login ${width}px reset dialog inaccessible`);
        if (!auditOnly) {
          const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, sessionId);
          await writeFile(path.join(outputDir, `${slug(route)}-${width}-reset-dialog-${phase}.png`), Buffer.from(shot.data, "base64"));
        }
      }
      if (!auditOnly && [320, 390, 430].includes(width) && route === "/register") {
        await cdp.send("Runtime.evaluate", { expression: "document.querySelector('.signup-primary[type=submit]')?.click()" }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 250));
        const validation = await cdp.send("Runtime.evaluate", { expression: "Boolean(document.querySelector('#register-email-error') && document.querySelector('#register-password-error'))", returnByValue: true }, sessionId);
        if (!validation.result.value) failures.push(`/register ${width}px validation inaccessible`);
        let shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, sessionId);
        await writeFile(path.join(outputDir, `register-${width}-validation-${phase}.png`), Buffer.from(shot.data, "base64"));
        for (const [selector, value] of [["#register-email", `mobile-qa-step-${width}@example.com`], ["#register-password", "TestPassword123!"], ["#register-confirmPassword", "TestPassword123!"]]) {
          await cdp.send("Runtime.evaluate", { expression: `document.querySelector(${JSON.stringify(selector)})?.focus()` }, sessionId);
          await cdp.send("Input.insertText", { text: value }, sessionId);
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
        await cdp.send("Runtime.evaluate", { expression: "document.querySelector('.signup-primary[type=submit]')?.click()" }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 350));
        const stepTwo = await cdp.send("Runtime.evaluate", { expression: "Boolean(document.querySelector('input[name=journey]'))", returnByValue: true }, sessionId);
        if (!stepTwo.result.value) failures.push(`/register ${width}px journey step inaccessible`);
        const stepTwoHeading = await cdp.send("Runtime.evaluate", { expression: "document.querySelector('.signup-step-heading h2')?.getBoundingClientRect().top", returnByValue: true }, sessionId);
        if (stepTwoHeading.result.value < 64) failures.push(`/register ${width}px journey heading under navigation`);
        shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, sessionId);
        await writeFile(path.join(outputDir, `register-${width}-step-2-${phase}.png`), Buffer.from(shot.data, "base64"));
        shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, sessionId);
        await writeFile(path.join(outputDir, `register-${width}-step-2-viewport-${phase}.png`), Buffer.from(shot.data, "base64"));
        await cdp.send("Runtime.evaluate", { expression: "document.querySelector('.signup-primary[type=submit]')?.click()" }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 350));
        const stepThree = await cdp.send("Runtime.evaluate", { expression: "Boolean(document.querySelector('.signup-consent'))", returnByValue: true }, sessionId);
        if (!stepThree.result.value) failures.push(`/register ${width}px consent step inaccessible`);
        const stepThreeHeading = await cdp.send("Runtime.evaluate", { expression: "document.querySelector('.signup-step-heading h2')?.getBoundingClientRect().top", returnByValue: true }, sessionId);
        if (stepThreeHeading.result.value < 64) failures.push(`/register ${width}px consent heading under navigation`);
        shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, sessionId);
        await writeFile(path.join(outputDir, `register-${width}-step-3-${phase}.png`), Buffer.from(shot.data, "base64"));
        shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, sessionId);
        await writeFile(path.join(outputDir, `register-${width}-step-3-viewport-${phase}.png`), Buffer.from(shot.data, "base64"));
      }
      if (!auditOnly && width === 390 && route === "/authors-register") {
        const formButtons = "[...document.querySelectorAll('form button')].find((button) => button.textContent.includes('Continue'))";
        await cdp.send("Runtime.evaluate", { expression: `${formButtons}?.click()` }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 250));
        const validation = await cdp.send("Runtime.evaluate", { expression: "Boolean(document.body.innerText.includes('Complete this step'))", returnByValue: true }, sessionId);
        if (!validation.result.value) failures.push("/authors-register 390px missing required-field feedback");
        const validationShot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, sessionId);
        await writeFile(path.join(outputDir, "authors-register-390-validation-after.png"), Buffer.from(validationShot.data, "base64"));
        await cdp.send("Runtime.evaluate", { expression: "document.querySelector('button[aria-label=\"Close notification\"]')?.click()" }, sessionId);
        for (const [index, value] of ["Mobile QA", "Mobile QA Writer", "mobile-qa-form@example.com", "TestPassword123!", "TestPassword123!"].entries()) {
          await cdp.send("Runtime.evaluate", { expression: `document.querySelectorAll('form input')[${index}]?.focus()` }, sessionId);
          await cdp.send("Input.insertText", { text: value }, sessionId);
        }
        await cdp.send("Runtime.evaluate", { expression: `${formButtons}?.click()` }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const stepTwo = await cdp.send("Runtime.evaluate", { expression: "document.querySelector('form')?.querySelectorAll('textarea').length === 2", returnByValue: true }, sessionId);
        if (!stepTwo.result.value) failures.push("/authors-register 390px step two inaccessible");
        const stepTwoShot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, sessionId);
        await writeFile(path.join(outputDir, "authors-register-390-step-2-after.png"), Buffer.from(stepTwoShot.data, "base64"));
        for (const [index, value] of ["Short QA biography", "Relevant QA experience"].entries()) {
          await cdp.send("Runtime.evaluate", { expression: `document.querySelectorAll('form textarea')[${index}]?.focus()` }, sessionId);
          await cdp.send("Input.insertText", { text: value }, sessionId);
        }
        await cdp.send("Runtime.evaluate", { expression: `${formButtons}?.click()` }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const stepThree = await cdp.send("Runtime.evaluate", { expression: "Boolean([...document.querySelectorAll('form button')].find((button) => button.textContent.includes('Submit application')))", returnByValue: true }, sessionId);
        if (!stepThree.result.value) failures.push("/authors-register 390px step three inaccessible");
        const stepThreeShot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, sessionId);
        await writeFile(path.join(outputDir, "authors-register-390-step-3-after.png"), Buffer.from(stepThreeShot.data, "base64"));
      }
      if (!auditOnly && width === 390 && route === "/onboarding") {
        for (const [stepNumber, heading] of [[2, "What should we call you?"], [3, "What brings you here?"], [4, "How are you feeling?"]]) {
          await cdp.send("Runtime.evaluate", { expression: "[...document.querySelectorAll('button')].find((button) => /Let.s begin|Continue/.test(button.textContent))?.click()" }, sessionId);
          await new Promise((resolve) => setTimeout(resolve, 450));
          const reached = await cdp.send("Runtime.evaluate", { expression: `Boolean([...document.querySelectorAll('h2')].find((node) => node.textContent.trim() === ${JSON.stringify(heading)}))`, returnByValue: true }, sessionId);
          if (!reached.result.value) failures.push(`/onboarding 390px step ${stepNumber} inaccessible`);
          await cdp.send("Runtime.evaluate", { expression: "window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })" }, sessionId);
          await new Promise((resolve) => setTimeout(resolve, 450));
          if (stepNumber === 4) {
            for (let attempt = 0; attempt < 30; attempt++) {
              const imagesReady = await cdp.send("Runtime.evaluate", { expression: "[...document.querySelectorAll('button img')].every((img) => img.complete && img.naturalWidth > 0)", returnByValue: true }, sessionId);
              if (imagesReady.result.value) break;
              await new Promise((resolve) => setTimeout(resolve, 200));
            }
          }
          const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, sessionId);
          await writeFile(path.join(outputDir, `onboarding-390-step-${stepNumber}-${phase}.png`), Buffer.from(shot.data, "base64"));
          if (stepNumber === 4) {
            const bottomShot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, sessionId);
            await writeFile(path.join(outputDir, `onboarding-390-step-4-bottom-${phase}.png`), Buffer.from(bottomShot.data, "base64"));
          }
        }
      }
      if (width <= 430 && route === "/today" && authMode === "member") {
        await cdp.send("Runtime.evaluate", { expression: "window.scrollTo({ top: 0, behavior: 'instant' })" }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 400));
        await cdp.send("Runtime.evaluate", { expression: "document.querySelector('button[aria-label=\"Open navigation\"]')?.click()" }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const drawer = await cdp.send("Runtime.evaluate", { expression: "(() => { const node = document.querySelector('#member-navigation'); return Boolean(node?.getAttribute('role') === 'dialog' && node.getBoundingClientRect().right > 0 && node.querySelector('a[href=\"/settings\"]')); })()", returnByValue: true }, sessionId);
        if (!drawer.result.value) failures.push(`/today ${width}px member navigation did not open`);
        if (!auditOnly) {
          const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, sessionId);
          await writeFile(path.join(outputDir, `today-${width}-navigation-${phase}.png`), Buffer.from(shot.data, "base64"));
        }
      }
      if (width <= 430 && route === "/course" && authMode === "member") {
        await cdp.send("Runtime.evaluate", { expression: "(() => { const tab = [...document.querySelectorAll('[role=tab]')].find((node) => node.textContent.trim() === 'Achievements'); tab?.scrollIntoView({ block: 'nearest', inline: 'end' }); tab?.click(); })()" }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 250));
        const active = await cdp.send("Runtime.evaluate", { expression: "Boolean([...document.querySelectorAll('[role=tab]')].find((node) => node.textContent.trim() === 'Achievements')?.getAttribute('aria-selected') === 'true')", returnByValue: true }, sessionId);
        if (!active.result.value) failures.push(`/course ${width}px Achievements tab inaccessible`);
        if (!auditOnly) {
          const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, sessionId);
          await writeFile(path.join(outputDir, `course-${width}-achievements-tab-${phase}.png`), Buffer.from(shot.data, "base64"));
        }
      }
      if (width <= 430 && route === "/author" && authMode === "author") {
        await cdp.send("Runtime.evaluate", { expression: "window.scrollTo({ top: 0, behavior: 'instant' }); document.querySelector('button[aria-label=\"Author account\"]')?.click()" }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const menu = await cdp.send("Runtime.evaluate", { expression: "(() => { const node = document.querySelector('[role=menu]'); if (!node) return false; const rect = node.getBoundingClientRect(); return rect.left >= 0 && rect.right <= innerWidth && node.querySelectorAll('[role=menuitem]').length >= 3; })()", returnByValue: true }, sessionId);
        if (!menu.result.value) failures.push(`/author ${width}px account menu inaccessible`);
        if (!auditOnly) {
          const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, sessionId);
          await writeFile(path.join(outputDir, `author-${width}-account-menu-${phase}.png`), Buffer.from(shot.data, "base64"));
        }
        await cdp.send("Runtime.evaluate", { expression: "document.querySelector('button[aria-label=\"Author account\"]')?.click(); [...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Preview')?.click()" }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const preview = await cdp.send("Runtime.evaluate", { expression: "(() => { const node = document.querySelector('[role=dialog]'); if (!node) return false; const rect = node.getBoundingClientRect(); return rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight; })()", returnByValue: true }, sessionId);
        if (!preview.result.value) failures.push(`/author ${width}px article preview inaccessible`);
        if (!auditOnly) {
          const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, sessionId);
          await writeFile(path.join(outputDir, `author-${width}-preview-${phase}.png`), Buffer.from(shot.data, "base64"));
        }
        await cdp.send("Runtime.evaluate", { expression: "document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))" }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 100));
        const closed = await cdp.send("Runtime.evaluate", { expression: "!document.querySelector('[role=dialog]')", returnByValue: true }, sessionId);
        if (!closed.result.value) failures.push(`/author ${width}px article preview did not close with Escape`);
      }
      if (process.argv.includes("--editor-smoke") && route === "/author/articles/new" && authMode === "author" && width === 390) {
        const articleTitle = `Mobile QA UI draft ${Date.now()}`;
        for (const [expression, value] of [["document.querySelectorAll('input:not([type=file])')[0]", articleTitle], ["document.querySelectorAll('input:not([type=file])')[1]", `mobile-qa-ui-draft-${Date.now()}`], ["document.querySelectorAll('textarea')[0]", "A mobile editor smoke test."], ["document.querySelectorAll('textarea')[1]", "# Mobile editor smoke test"]]) {
          await cdp.send("Runtime.evaluate", { expression: `${expression}?.focus()` }, sessionId);
          await cdp.send("Input.insertText", { text: value }, sessionId);
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
        await new Promise((resolve) => setTimeout(resolve, 350));
        await cdp.send("Runtime.evaluate", { expression: "[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Create draft')?.click()" }, sessionId);
        let created = false;
        for (let attempt = 0; attempt < 200; attempt++) {
          const path = await cdp.send("Runtime.evaluate", { expression: "location.pathname", returnByValue: true }, sessionId);
          if (/^\/author\/articles\/[0-9a-f-]{36}$/.test(path.result.value)) { created = true; break; }
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        if (!created) {
          const diagnostic = await cdp.send("Runtime.evaluate", { expression: "({ path: location.pathname, inputs: [...document.querySelectorAll('input:not([type=file]), textarea')].map((node) => ({ tag: node.tagName, valueLength: node.value.length })), feedback: [...document.querySelectorAll('[role=alert], [role=status]')].map((node) => node.textContent.trim()).filter(Boolean).slice(0, 5) })", returnByValue: true }, sessionId);
          failures.push(`/author/articles/new UI draft creation failed: ${JSON.stringify(diagnostic.result.value)}`);
        }
        else {
          const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, sessionId);
          await writeFile(path.join(outputDir, "author-article-created-390-after.png"), Buffer.from(shot.data, "base64"));
        }
      }
      if (process.argv.includes("--journal-smoke") && route === "/journal/new" && authMode === "member" && width === 390) {
        await cdp.send("Runtime.evaluate", { expression: "document.querySelector('textarea')?.focus()" }, sessionId);
        await cdp.send("Input.insertText", { text: `Mobile QA form test ${Date.now()}` }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 350));
        await cdp.send("Runtime.evaluate", { expression: "[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Save Entry')?.click()" }, sessionId);
        let saved = false;
        for (let attempt = 0; attempt < 200; attempt++) {
          const path = await cdp.send("Runtime.evaluate", { expression: "location.pathname", returnByValue: true }, sessionId);
          if (/^\/journal\/[0-9a-f-]{36}$/.test(path.result.value)) { saved = true; break; }
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        if (!saved) {
          const diagnostic = await cdp.send("Runtime.evaluate", { expression: "(() => { const button = [...document.querySelectorAll('button')].find((node) => /Save Entry|Loading/.test(node.textContent)); return { path: location.pathname, bodyLength: document.querySelector('textarea')?.value.length, button: button?.textContent.trim(), saveDisabled: button?.disabled, reactClick: Boolean(button && Object.keys(button).some((key) => key.startsWith('__reactProps$') && typeof button[key]?.onClick === 'function')), feedback: [...document.querySelectorAll('[role=alert], .text-danger')].map((node) => node.textContent.trim()).filter(Boolean).slice(0, 5), requests: performance.getEntriesByType('resource').filter((entry) => /journal_entries/.test(entry.name)).map((entry) => ({ duration: Math.round(entry.duration), status: entry.responseStatus })).slice(-5) }; })()", returnByValue: true }, sessionId);
          failures.push(`/journal/new UI save failed: ${JSON.stringify(diagnostic.result.value)}`);
        }
        else {
          await cdp.send("Emulation.setDeviceMetricsOverride", { width, height: 844, deviceScaleFactor: 1, mobile: true }, sessionId);
          await new Promise((resolve) => setTimeout(resolve, 500));
          const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, sessionId);
          await writeFile(path.join(outputDir, "journal-entry-created-390-after.png"), Buffer.from(shot.data, "base64"));
        }
      }
      console.log(JSON.stringify({ route, width, screenshot: auditOnly ? null : filename, ...state }));
      const expectedPath = route.startsWith("/journey") ? route.replace("/journey", "/course") : route;
      if (state.path !== route && state.path !== expectedPath) failures.push(`${route} redirected to ${state.path}`);
      if (state.scrollWidth > width + 2) failures.push(`${route} ${width}px overflows by ${state.scrollWidth - width}px`);
      if (state.interactiveOffenders.length) failures.push(`${route} ${width}px inaccessible interactive elements: ${JSON.stringify(state.interactiveOffenders)}`);
      if (Number.parseInt(state.devIssue ?? "0", 10) > 0) failures.push(`${route} ${width}px has ${state.devIssue} in Next development overlay`);
    }
  }
  socket.close();
} finally {
  browser.kill();
  await rm(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}
if (failures.length) { console.error(failures.join("\n")); process.exitCode = 1; }
