// @ts-check
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypePrettyCode from "rehype-pretty-code";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.ninochavez.co",
  output: "server",
  adapter: vercel(),

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
      filter: (page) => !page.includes("/draft/"),
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
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
});
