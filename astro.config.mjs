// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

/**
 * The Launchpad CLI and SDK guide.
 *
 * Built to a folder of HTML and committed as `dist/`, because that folder *is*
 * the deliverable: Launchpad never runs `npm install` or `astro build` for an
 * app, and `launchpad.toml`'s `[static] root = "dist"` is what tells the
 * detector to serve this repo rather than refuse it for having a package.json.
 *
 * `base` is not optional. A static app is served under `/apps/{slug}/`, and a
 * root-absolute URL without that prefix asks the *platform* for the file and
 * gets a 404. The slug is reserved (`_` belongs to apps Launchpad installs
 * itself), so it cannot be taken by an ordinary app and this value cannot go
 * stale behind a rename.
 */
export default defineConfig({
  base: "/apps/_cli-guide",
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "Launchpad",
      logo: { src: "./src/assets/logo.svg", alt: "Launchpad" },
      tagline: "CLI and SDK",
      description:
        "The lp command-line client, and the app SDK your code calls back with.",
      components: {
        ThemeSelect: "./src/components/empty.astro",
        SocialIcons: "./src/components/empty.astro",
      },
      customCss: [
        "@fontsource-variable/geist",
        "@fontsource-variable/geist-mono",
        "./src/styles/launchpad.css",
      ],
      pagination: true,
      lastUpdated: false,
      pagefind: true,
      sidebar: [
        {
          label: "The CLI",
          items: [
            { label: "Installing lp", slug: "cli/installing" },
            { label: "Signing in", slug: "cli/signing-in" },
            { label: "Deploying", slug: "cli/deploying" },
            { label: "The sixteen commands", slug: "cli/commands" },
            { label: "Exit codes", slug: "cli/exit-codes" },
            { label: "CI and automation", slug: "cli/ci" },
          ],
        },
        {
          label: "The SDK",
          items: [
            { label: "What the SDK is", slug: "sdk/what-it-is" },
            { label: "Vendoring it", slug: "sdk/vendoring" },
            { label: "The app itself", slug: "sdk/app" },
            { label: "App data", slug: "sdk/data" },
            { label: "Files and scratch space", slug: "sdk/files" },
            { label: "Notifications", slug: "sdk/notify" },
            { label: "Jobs", slug: "sdk/jobs" },
            { label: "Who is asking", slug: "sdk/viewer" },
            { label: "Scheduled tasks", slug: "sdk/tasks" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "Environment variables", slug: "reference/environment" },
            { label: "The six roles", slug: "reference/roles" },
            { label: "Language notes", slug: "reference/languages" },
          ],
        },
      ],
    }),
  ],
});
