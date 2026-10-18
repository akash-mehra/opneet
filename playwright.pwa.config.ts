import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./pwa",
  timeout: 30_000,
  use: { baseURL: "http://127.0.0.1:4176/opneet/", headless: true },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4176 --strictPort --base /opneet/",
    url: "http://127.0.0.1:4176/opneet/",
    reuseExistingServer: false,
  },
  workers: 1,
  reporter: "list",
});
