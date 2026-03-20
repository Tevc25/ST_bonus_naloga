import { expect, test } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Learn deeper with real-time gaze-aware study guidance."
    })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start Demo Lesson" })
  ).toBeVisible();
});

test("calibration flow supports fallback mode", async ({ page }) => {
  await page.goto("/lesson/demo");

  await expect(page.getByTestId("calibration-flow")).toBeVisible();
  await page.getByTestId("continue-fallback-btn").click();

  await expect(page.getByTestId("lesson-reader")).toBeVisible();
});

test("session can progress to quiz and summary", async ({ page }) => {
  await page.goto("/lesson/demo");

  await page.getByTestId("continue-fallback-btn").click();
  await page.getByTestId("start-quiz-btn").click();

  await expect(page.getByTestId("personalized-quiz")).toBeVisible();

  const groups = page.locator('[role="radiogroup"]');
  const groupCount = await groups.count();

  for (let i = 0; i < groupCount; i += 1) {
    await groups.nth(i).locator('input[type="radio"]').first().check();
  }

  await page.getByTestId("submit-quiz-btn").click();
  await expect(page.getByTestId("quiz-result")).toBeVisible();

  await page.getByRole("button", { name: /Open session summary/i }).click();

  await expect(page).toHaveURL(/\/summary/);
  await expect(page.getByTestId("summary-dashboard")).toBeVisible();
});

test("fallback mode works when camera permission is denied", async ({
  page
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          throw new DOMException("Permission denied", "NotAllowedError");
        }
      }
    });
  });

  await page.goto("/lesson/demo");

  await page.getByTestId("enable-tracking-btn").click();
  await expect(
    page.getByText("Camera permission denied. Use fallback mode to continue.")
  ).toBeVisible();

  await page.getByTestId("continue-fallback-btn").click();
  await expect(page.getByTestId("lesson-reader")).toBeVisible();
});
