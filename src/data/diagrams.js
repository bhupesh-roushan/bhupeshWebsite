/**
 * Request-flow specs, one per project, taken from each repo's real layout —
 * the route folders, lib/helper wrappers, auth middleware and models that
 * actually exist in the source rather than an idealised sketch.
 *
 * Layer-based so the renderer stays generic: adding a project is a few lines
 * here, and every diagram lands on the same grid and spacing.
 *
 * `store` is optional — three of these have no database at all, and drawing an
 * empty persistence band under them would be a lie about what they are.
 * `note` carries the thing boxes can't: what the arrows actually carry.
 */
export const DIAGRAMS = {
  atlas: {
    layers: [
      [{ title: "Next.js 15 dashboard", sub: "review queue · live progress", accent: true }],
      [{ title: "API routes", sub: "invite-only auth · audit log" }],
      [
        { title: "/evaluations", sub: "manifest · start · retry" },
        { title: "/review", sub: "approve · override" },
        { title: "/nodes", sub: "register · health · cost" },
      ],
      [{ title: "BullMQ on Redis", sub: "one queue per user · retries" }],
      [{ title: "Grading worker", sub: "standalone process · least in-flight" }],
      [
        { title: "Any model endpoint", sub: "vLLM · Ollama · OpenAI · Claude" },
        { title: "Google Sheets", sub: "ingest · score write-back" },
        { title: "GitHub repos", sub: "shallow clone · never executed" },
      ],
    ],
    store: "MongoDB — evaluations, jobs, results, prompts",
    note: "The API only enqueues; a separate worker process drains one user's queue, so a 900-row batch can't block a 10-row one. Each job picks the healthy endpoint with the fewest requests in flight, and a rented pod that dies mid-batch has its jobs requeued rather than failed.",
  },

  cloudwatch: {
    layers: [
      [{ title: "Next.js 16 client", sub: "TypeScript · Tailwind · Aceternity", accent: true }],
      [{ title: "Express API", sub: "requireAuth · role-based access", href: "https://github.com/bhupesh-roushan/cloudwatch-digital/blob/main/backend/src/middleware/requireAuth.ts" }],
      [
        { title: "/ai", sub: "listing · SEO" },
        { title: "/checkout", sub: "orders · library" },
        { title: "/products", sub: "catalog · media" },
      ],
      [
        { title: "Gemini 2.0 Flash", sub: "listing copy", href: "https://github.com/bhupesh-roushan/cloudwatch-digital/blob/main/backend/src/lib/ai-intelligence.ts" },
        { title: "Firecrawl · SerpAPI", sub: "competitors · pricing", href: "https://github.com/bhupesh-roushan/cloudwatch-digital/blob/main/backend/src/lib/firecrawl.ts" },
        { title: "Razorpay", sub: "checkout", href: "https://github.com/bhupesh-roushan/cloudwatch-digital/blob/main/backend/src/lib/razorpay.ts" },
        { title: "Cloudinary", sub: "media", href: "https://github.com/bhupesh-roushan/cloudwatch-digital/blob/main/backend/src/lib/cloudinary.ts" },
      ],
    ],
    store: "MongoDB — users, products, orders",
    note: "Generation, scraping and payments all live in backend/src/lib rather than the browser, so no model or gateway key reaches the client. requireAuth gates the mutating routes by role, and a seller's draft listing is written from a scraped competitor snapshot before a human edits it.",
  },

  buildingblocks: {
    layers: [
      [{ title: "React client", sub: "route-guard · role dashboards", accent: true, href: "https://github.com/bhupesh-roushan/BuildingBlocks/blob/main/client/src/components/route-guard/index.jsx" }],
      [{ title: "Express API", sub: "auth-middleware", href: "https://github.com/bhupesh-roushan/BuildingBlocks/blob/main/server/middleware/auth-middleware.js" }],
      [
        { title: "/instructor", sub: "courses · media" },
        { title: "/student", sub: "courses · progress", href: "https://github.com/bhupesh-roushan/BuildingBlocks/blob/main/server/controllers/student-controller/course-progress-controller.js" },
        { title: "/order", sub: "checkout" },
      ],
      [
        { title: "Cloudinary", sub: "video upload", href: "https://github.com/bhupesh-roushan/BuildingBlocks/blob/main/server/helpers/cloudinary.js" },
        { title: "PayPal", sub: "payments", href: "https://github.com/bhupesh-roushan/BuildingBlocks/blob/main/server/helpers/paypal.js" },
      ],
    ],
    store: "MongoDB — users, courses, orders, progress",
    note: "One route tree serves both roles: a route-guard component decides which dashboard renders, and auth-middleware re-checks that role on the server — so the client-side guard is convenience, not the control. Lecture progress is written per video, which is what makes a resumed course resume in the right place.",
  },

  hourglass: {
    layers: [
      [{ title: "React client", sub: "Redux Toolkit · RTK hooks", accent: true }],
      [{ title: "Express API + Socket.io", sub: "isAuthenticated · multer", href: "https://github.com/bhupesh-roushan/hourglass/blob/main/backend/index.js" }],
      [
        { title: "/user", sub: "profile · follow" },
        { title: "/post", sub: "feed · comments", href: "https://github.com/bhupesh-roushan/hourglass/blob/main/backend/controllers/post.controller.js" },
        { title: "/message", sub: "realtime chat", href: "https://github.com/bhupesh-roushan/hourglass/blob/main/backend/controllers/message.controller.js" },
      ],
      [
        { title: "Cloudinary", sub: "images" },
        { title: "Socket registry", sub: "online users", href: "https://github.com/bhupesh-roushan/hourglass/blob/main/backend/socket/socket.js" },
      ],
    ],
    store: "MongoDB — users, posts, messages, conversations",
    note: "A message takes two paths at once: the REST route persists it, the socket delivers it. The registry maps user id to socket id so a send can find the recipient's live connection, and when they're offline the stored conversation is the only path — which is why delivery can't depend on the socket alone.",
  },

  cubekit: {
    layers: [
      [{ title: "React SPA (Vite)", sub: "protected routes · onboarding", accent: true }],
      [{ title: "Clerk", sub: "session · getToken with the supabase template", href: "https://github.com/bhupesh-roushan/cubekit-hiring/blob/master/src/hooks/useFetch.jsx" }],
      [{ title: "useFetch", sub: "one loading/error pair per call", href: "https://github.com/bhupesh-roushan/cubekit-hiring/blob/master/src/utils/supabase.js" }],
      [
        { title: "api/jobs", sub: "search · filter · save", href: "https://github.com/bhupesh-roushan/cubekit-hiring/blob/master/src/api/apijobs.js" },
        { title: "api/companies", sub: "listings · logos", href: "https://github.com/bhupesh-roushan/cubekit-hiring/blob/master/src/api/apiCompanies.js" },
        { title: "api/applications", sub: "apply · status", href: "https://github.com/bhupesh-roushan/cubekit-hiring/blob/master/src/api/apiApplications.js" },
      ],
    ],
    store: "Supabase Postgres — jobs, companies, applications, saved_jobs",
    note: "No server of its own. The browser holds only the anon key; every call mints a Supabase client with the Clerk JWT in its Authorization header, so what a row returns is decided by Postgres policies rather than by the client asking nicely.",
  },

  frequencii: {
    layers: [
      [{ title: "React SPA", sub: "Vite · React Router", accent: true }],
      [{ title: "Redux Toolkit store", sub: "cart · product slices", href: "https://github.com/bhupesh-roushan/frequencii/blob/master/src/redux/CartSlice.jsx" }],
      [
        { title: "Bundled catalogue", sub: "JSON fixtures" },
        { title: "Cart → Checkout", sub: "order confirmation", href: "https://github.com/bhupesh-roushan/frequencii/blob/master/src/pages/Checkout.jsx" },
        { title: "EmailJS", sub: "newsletter · contact" },
      ],
    ],
    note: "A prototype, and shaped like one: the catalogue is JSON inside the bundle and the cart lives in Redux, so an order ends at a confirmation screen rather than a payment gateway. EmailJS carries the only traffic that leaves the browser.",
  },

  pictelai: {
    layers: [
      [{ title: "React SPA", sub: "sidebar history · prompt panel", accent: true }],
      [{ title: "Context provider", sub: "prompt · response · recent prompts", href: "https://github.com/bhupesh-roushan/PictelAI-Powered-by-Gemini/blob/master/src/context/Context.jsx" }],
      [{ title: "config/gemini.js", sub: "@google/generative-ai · startChat", href: "https://github.com/bhupesh-roushan/PictelAI-Powered-by-Gemini/blob/master/src/config/gemini.js" }],
      [{ title: "Gemini 1.5 Flash", sub: "temp 1 · topP 0.95 · 8192 max tokens" }],
    ],
    note: "Single page, no server: the SDK is called straight from the browser and chat history lives in React context, so nothing survives a refresh. The key comes from a Vite env var, which means it ships inside the bundle — the price of having no backend to hide it behind.",
  },
};
