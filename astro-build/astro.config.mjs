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
  site: "https://blog.ninochavez.co",
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
            onVisitLine(node) {
              if (node.children.length === 0) {
                node.children = [{ type: "text", value: " " }];
              }
            },
            onVisitHighlightedLine(node) {
              node.properties.className = node.properties.className || [];
              node.properties.className.push("highlighted");
            },
            onVisitHighlightedWord(node) {
              node.properties.className = ["word"];
            },
          },
        ],
      ],
    }),
    react(),
    sitemap({
      filter: (page) => !page.includes("/draft/") && !page.includes("/private/"),
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
        { find: "react-dom/server", replacement: "react-dom/server.edge" },
      ],
    },
  },
});
