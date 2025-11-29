import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const host = context.request.headers.get("host") || "";
  const url = new URL(context.request.url);

  // Redirect blog.ninochavez.co to ninochavez.co/blog
  if (host === "blog.ninochavez.co") {
    // If visiting root, redirect to main blog page
    if (url.pathname === "/" || url.pathname === "") {
      return context.redirect("https://ninochavez.co/blog", 301);
    }
    // Otherwise preserve the path (which should include /blog prefix due to base config)
    return context.redirect(`https://ninochavez.co${url.pathname}`, 301);
  }

  return next();
});
