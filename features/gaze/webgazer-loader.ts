const WEBGAZER_SCRIPT_ID = "webgazer-script";
const WEBGAZER_SCRIPT_SRC =
  "https://cdn.jsdelivr.net/npm/webgazer@2.0.1/dist/webgazer.min.js";

export async function loadWebGazerScript(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (window.webgazer) {
    return;
  }

  const existing = document.getElementById(
    WEBGAZER_SCRIPT_ID
  ) as HTMLScriptElement | null;
  if (existing) {
    await waitForScriptLoad(existing);
    return;
  }

  const script = document.createElement("script");
  script.id = WEBGAZER_SCRIPT_ID;
  script.src = WEBGAZER_SCRIPT_SRC;
  script.async = true;
  script.crossOrigin = "anonymous";

  const promise = waitForScriptLoad(script);
  document.body.appendChild(script);
  await promise;
}

function waitForScriptLoad(script: HTMLScriptElement) {
  return new Promise<void>((resolve, reject) => {
    if (window.webgazer) {
      resolve();
      return;
    }

    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Failed to load WebGazer.")),
      {
        once: true
      }
    );
  });
}
