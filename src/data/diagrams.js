/**
 * Request-flow specs, one per project, taken from each repo's real layout —
 * the route folders, lib/helper wrappers, auth middleware and models that
 * actually exist in the source rather than an idealised sketch.
 *
 * Layer-based so the renderer stays generic: adding a project is a few lines
 * here, and every diagram lands on the same grid and spacing.
 */
export const DIAGRAMS = {
  cloudwatch: {
    layers: [
      [{ title: "Next.js 16 client", sub: "TypeScript · Tailwind", accent: true }],
      [{ title: "Express API", sub: "requireAuth · role-based access" }],
      [
        { title: "/ai", sub: "listing · SEO" },
        { title: "/checkout", sub: "orders" },
        { title: "/products", sub: "catalog · media" },
      ],
      [
        { title: "Gemini · Firecrawl", sub: "SerpAPI" },
        { title: "Razorpay", sub: "payments" },
        { title: "Cloudinary", sub: "media" },
      ],
    ],
    store: "MongoDB — users, products, orders",
  },

  buildingblocks: {
    layers: [
      [{ title: "React client", sub: "route-guard · role dashboards", accent: true }],
      [{ title: "Express API", sub: "auth-middleware" }],
      [
        { title: "/instructor", sub: "courses · media" },
        { title: "/student", sub: "courses · progress" },
        { title: "/order", sub: "checkout" },
      ],
      [
        { title: "Cloudinary", sub: "video upload" },
        { title: "PayPal", sub: "payments" },
      ],
    ],
    store: "MongoDB — users, courses, orders, progress",
  },

  hourglass: {
    layers: [
      [{ title: "React client", sub: "Redux Toolkit · RTM hooks", accent: true }],
      [{ title: "Express API + Socket.io", sub: "isAuthenticated · multer" }],
      [
        { title: "/user", sub: "profile · follow" },
        { title: "/post", sub: "feed · comments" },
        { title: "/message", sub: "realtime chat" },
      ],
      [{ title: "Cloudinary", sub: "images" }, { title: "Socket registry", sub: "online users" }],
    ],
    store: "MongoDB — users, posts, messages, conversations",
  },
};
