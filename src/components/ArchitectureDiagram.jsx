/**
 * CloudWatch request flow.
 *
 * Drawn from the repo's actual layout rather than an idealised sketch —
 * backend/src/{app,db}.ts, the lib/ service wrappers (ai-intelligence,
 * firecrawl, razorpay, cloudinary, websocket), requireAuth middleware, and the
 * routes/ handlers. Inline SVG so it scales and needs no extra request.
 */

const BORDER = "#2a2a3a";
const SURFACE = "#12121a";
const TEXT = "#e2e8f0";
const MUTED = "#94a3b8";
const ACCENT = "#818cf8";

const Box = ({ x, y, w, h, title, sub, accent = false }) => (
  <g>
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx="10"
      fill={SURFACE}
      stroke={accent ? ACCENT : BORDER}
      strokeWidth={accent ? 1.5 : 1}
    />
    <text
      x={x + w / 2}
      y={sub ? y + h / 2 - 4 : y + h / 2 + 5}
      textAnchor="middle"
      fill={accent ? ACCENT : TEXT}
      fontSize="15"
      fontWeight="600"
    >
      {title}
    </text>
    {sub && (
      <text
        x={x + w / 2}
        y={y + h / 2 + 16}
        textAnchor="middle"
        fill={MUTED}
        fontSize="12.5"
      >
        {sub}
      </text>
    )}
  </g>
);

const Arrow = ({ x1, y1, x2, y2 }) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke={BORDER}
    strokeWidth="1.5"
    markerEnd="url(#cw-arrow)"
  />
);

export const ArchitectureDiagram = () => (
  <svg
    viewBox="0 0 880 476"
    className="h-auto w-full"
    role="img"
    aria-label="CloudWatch architecture: Next.js client to Express API, routed to AI, checkout and product handlers, backed by Gemini, Firecrawl, SerpAPI, Razorpay, Cloudinary and MongoDB."
  >
    <defs>
      <marker
        id="cw-arrow"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill={BORDER} />
      </marker>
    </defs>

    {/* client */}
    <Box x={330} y={16} w={220} h={62} title="Next.js 16 client" sub="TypeScript · Tailwind" accent />
    <Arrow x1={440} y1={78} x2={440} y2={116} />

    {/* api gateway */}
    <Box x={300} y={118} w={280} h={68} title="Express API" sub="requireAuth · role-based access" />

    {/* fan-out to route groups */}
    <line x1={440} y1={186} x2={440} y2={214} stroke={BORDER} strokeWidth="1.5" />
    <line x1={130} y1={214} x2={750} y2={214} stroke={BORDER} strokeWidth="1.5" />
    <Arrow x1={130} y1={214} x2={130} y2={248} />
    <Arrow x1={440} y1={214} x2={440} y2={248} />
    <Arrow x1={750} y1={214} x2={750} y2={248} />

    <Box x={40} y={250} w={180} h={58} title="/ai" sub="listing · SEO" />
    <Box x={350} y={250} w={180} h={58} title="/checkout" sub="orders" />
    <Box x={660} y={250} w={180} h={58} title="/products" sub="catalog · media" />

    <Arrow x1={130} y1={308} x2={130} y2={346} />
    <Arrow x1={440} y1={308} x2={440} y2={346} />
    <Arrow x1={750} y1={308} x2={750} y2={346} />

    {/* external services */}
    <Box x={20} y={348} w={220} h={58} title="Gemini · Firecrawl" sub="SerpAPI" />
    <Box x={350} y={348} w={180} h={58} title="Razorpay" sub="payments" />
    <Box x={660} y={348} w={180} h={58} title="Cloudinary" sub="media" />

    {/* Persistence collects from all three paths — an arrow straight down from
        the middle column alone would read as "only checkout writes to Mongo". */}
    <line x1={130} y1={406} x2={130} y2={420} stroke={BORDER} strokeWidth="1.5" />
    <line x1={440} y1={406} x2={440} y2={420} stroke={BORDER} strokeWidth="1.5" />
    <line x1={750} y1={406} x2={750} y2={420} stroke={BORDER} strokeWidth="1.5" />
    <line x1={130} y1={420} x2={750} y2={420} stroke={BORDER} strokeWidth="1.5" />
    <Arrow x1={440} y1={420} x2={440} y2={434} />
    <Box x={300} y={436} w={280} h={32} title="MongoDB — users, products, orders" />
  </svg>
);
