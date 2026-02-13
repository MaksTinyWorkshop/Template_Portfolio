#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = {
    url: "http://localhost:3000",
    preset: "both",
    routes: ["/", "/admin"],
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === "--url") {
      args.url = argv[++i] ?? args.url;
      continue;
    }
    if (token === "--preset") {
      args.preset = argv[++i] ?? args.preset;
      continue;
    }
    if (token === "--routes") {
      const raw = argv[++i];
      if (raw)
        args.routes = raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      continue;
    }
    if (token === "--help" || token === "-h") {
      args.help = true;
      continue;
    }
  }

  return args;
}

function toPresetList(preset) {
  if (preset === "both") return ["desktop", "mobile"];
  if (preset === "desktop" || preset === "mobile") return [preset];
  throw new Error(`Invalid --preset "${preset}". Use "desktop", "mobile", or "both".`);
}

function routeToName(route) {
  if (route === "/" || route === "") return "home";
  const cleaned = route
    .replace(/^\//, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "")
    .replace(/[^a-zA-Z0-9-_./]/g, "-")
    .replace(/[/.]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "route";
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function listFlatFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isFile()).map((e) => e.name);
}

async function moveCurrentReportsToPrevious({ targetDir, previousDir }) {
  await ensureDir(targetDir);
  await ensureDir(previousDir);

  const currentFiles = await listFlatFiles(targetDir);
  const reportFiles = currentFiles.filter(
    (name) => name.endsWith(".json") || name.endsWith(".html"),
  );
  if (reportFiles.length === 0) {
    return;
  }

  const previousFiles = await listFlatFiles(previousDir);
  await Promise.all(
    previousFiles
      .filter((name) => name.endsWith(".json") || name.endsWith(".html"))
      .map((name) => fs.rm(path.join(previousDir, name), { force: true })),
  );

  for (const name of reportFiles) {
    await fs.rename(path.join(targetDir, name), path.join(previousDir, name));
  }
}

function runLighthouse({ url, outputPath, outputType, preset }) {
  const lhArgs = [];
  if (preset === "desktop") {
    lhArgs.push("--preset", "desktop");
  } else if (preset === "mobile") {
    lhArgs.push("--preset", "perf", "--form-factor", "mobile");
  } else {
    throw new Error(`Invalid internal preset "${preset}"`);
  }

  const args = [url, "--quiet", ...lhArgs, "--output", outputType, "--output-path", outputPath];

  return new Promise((resolve, reject) => {
    const child = spawn("lighthouse", args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`lighthouse exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(
      [
        "Usage:",
        "  node scripts/run-lighthouse.mjs [--url http://localhost:3000] [--preset desktop|mobile|both] [--routes /,/admin]",
        "",
        "Outputs:",
        "  Desktop: test-results/lighthouse/lighthouse-<route>.json",
        "  Desktop: test-results/lighthouse/lighthouse-<route>.html",
        "  Mobile:  test-results/lighthouse/lighthouse-<route>.mobile.json",
        "  Mobile:  test-results/lighthouse/lighthouse-<route>.mobile.html",
        "  Aliases: test-results/lighthouse/lighthouse-report.html (desktop home)",
        "  Aliases: test-results/lighthouse/lighthouse-report.mobile.html (mobile home)",
        "",
      ].join("\n"),
    );
    return;
  }

  const projectRoot = process.cwd();
  const targetDir = path.join(projectRoot, "test-results", "lighthouse");
  const previousDir = path.join(targetDir, "previous");

  await moveCurrentReportsToPrevious({ targetDir, previousDir });

  const presets = toPresetList(args.preset);
  for (const route of args.routes) {
    const name = routeToName(route);
    const fullUrl = new URL(route, args.url).toString();

    for (const preset of presets) {
      const isDesktop = preset === "desktop";
      const fileBase = isDesktop ? `lighthouse-${name}` : `lighthouse-${name}.${preset}`;
      const jsonPath = path.join(targetDir, `${fileBase}.json`);
      const htmlPath = path.join(targetDir, `${fileBase}.html`);

      await runLighthouse({
        url: fullUrl,
        outputType: "json",
        outputPath: jsonPath,
        preset,
      });

      await runLighthouse({
        url: fullUrl,
        outputType: "html",
        outputPath: htmlPath,
        preset,
      });

      if (name === "home") {
        const alias = isDesktop ? "lighthouse-report.html" : "lighthouse-report.mobile.html";
        await fs.copyFile(htmlPath, path.join(targetDir, alias));
      }
    }
  }
}

await main();
