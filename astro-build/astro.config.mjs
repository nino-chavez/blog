// @ts-check
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypePrettyCode from "rehype-pretty-code";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://ninochavez.co",
  output: "server",
  adapter: cloudflare({
    routes: {
      extend: {
        // Excluded paths bypass the Pages Function and are served by the
        // static layer. /_redirects only fires for excluded paths, so
        // legacy RSS URLs must live here to redirect to /blog/*.
        exclude: [
          { pattern: "/blog/*" },
          { pattern: "/rss.xml" },
          { pattern: "/full-content-rss.xml" },
          { pattern: "/llms.txt" },
        ],
      },
    },
  }),
  integrations: [
    mdx({
      remarkPlugins: [remarkGfm, remarkEmoji],
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            theme: "github-dark-dimmed",
            keepBackground: false,
            /** @param {{ children: unknown[] }} node */
            onVisitLine(node) {
              if (node.children.length === 0) {
                node.children = [{ type: "text", value: " " }];
              }
            },
            /** @param {{ properties: { className?: string[] } }} node */
            onVisitHighlightedLine(node) {
              node.properties.className = node.properties.className || [];
              node.properties.className.push("highlighted");
            },
            /** @param {{ properties: { className?: string[] } }} node */
            onVisitHighlightedWord(node) {
              node.properties.className = ["word"];
            },
          },
        ],
      ],
    }),
    react(),
    sitemap({
      // Only the paths the router (apps/router) actually sends to this app. ninochavez.co is
      // three Pages projects behind one Worker, and `/about` belongs to the MAIN site — which
      // serves its own about page there. This sitemap listed https://ninochavez.co/about anyway,
      // claiming a URL this app never answers. `/blog` and `/research` are the prefixes the
      // router routes here; keep this list in step with BLOG_PREFIXES in apps/router.
      filter: (page) => {
        if (page.includes("/draft/") || page.includes("/private/")) return false;
        const path = new URL(page).pathname;
        return path.startsWith("/blog") || path.startsWith("/research");
      },
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],

  trailingSlash: "never",

  build: {
    format: "file",
  },

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["@astrojs/react"],
    },
    resolve: {
      alias: [
        { find: "@", replacement: "/src" },
        ...(process.env.NODE_ENV === "production"
          ? [{ find: "react-dom/server", replacement: "react-dom/server.edge" }]
          : []),
      ],
    },
  },
});
