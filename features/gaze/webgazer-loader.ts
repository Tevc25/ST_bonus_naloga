const WEBGAZER_SOURCES = [
  "/vendor/webgazer.js",
  "https://cdn.jsdelivr.net/npm/webgazer@2.0.1/dist/webgazer.min.js",
  "https://unpkg.com/webgazer@2.0.1/dist/webgazer.min.js"
] as const;

const WEBGAZER_GLOBAL_WAIT_TIMEOUT_MS = 2500;

let loadPromise: Promise<void> | null = null;

export async function loadWebGazerScript(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (window.webgazer) {
    return;
  }

  if (!loadPromise) {
    loadPromise = loadFromSources().finally(() => {
      if (!window.webgazer) {
        loadPromise = null;
      }
    });
  }

  await loadPromise;
}

async function loadFromSources() {
  const errorMessages: string[] = [];

  for (const source of WEBGAZER_SOURCES) {
    try {
      await injectScript(source);
      await waitForWebGazerGlobal(WEBGAZER_GLOBAL_WAIT_TIMEOUT_MS);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errorMessages.push(`${source}: ${message}`);
    }
  }

  throw new Error(
    `Failed to load WebGazer from all sources. ${errorMessages.join(" | ")}`
  );
}

async function injectScript(source: string): Promise<void> {
  const script = document.createElement("script");
  script.src = source;
  script.async = true;
  script.dataset.webgazerSource = source;
  script.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Script failed to load.")),
      {
        once: true
      }
    );

    document.body.appendChild(script);
  });
}

async function waitForWebGazerGlobal(timeoutMs: number): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (window.webgazer) {
      return;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }

  throw new Error("Script loaded but window.webgazer is unavailable.");
}
