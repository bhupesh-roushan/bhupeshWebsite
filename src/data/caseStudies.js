/**
 * Long-form write-ups, one per hard decision.
 *
 * Every claim is traceable to a commit or to shipped code — the Atlas pieces
 * to commits f2e961c and 3df3201, the CloudWatch one to its auth commit trail
 * and to client/next.config.ts as it stands, the Frequencii one to the byte
 * counts in the diff stats of bc7f6bf, ee94533, f16ad55 and 302b8b5. Nothing
 * here is illustrative, and nothing is written that the repository cannot
 * back up.
 *
 * Which is also why there are five and not seven: Hourglass, Cubekit and
 * PictelAI have no decision record to draw on — their histories are four to
 * eleven commits of building and tidying, with no failure found and fixed and
 * no approach tried and rejected. A case study invented to fill a slot is
 * worse than an empty slot, because someone will ask about it.
 * @type {Record<string, import("./types").CaseStudy>}
 */
export const CASE_STUDIES = {
  "atlas-false-failures": {
    project: "Atlas",
    projectId: "atlas",
    accent: "45,212,191",
    title: "470 students were told they failed a run that never happened",
    dek: "An absent record is not a failure record — and what a timed-out read actually tells you.",
    date: "July 2026",
    published: "2026-07",
    tags: ["Failure modes", "Fail closed", "Data integrity"],

    sections: [
      {
        heading: "What staff downloaded",
        body: [
          "Atlas exports a spreadsheet of results for each batch. The export had a branch for jobs that had exhausted their retries, which wrote a failure notice into the mark column.",
          "That branch never checked the job's status. It fired for any job with no result row attached — and a job sitting untouched in the queue has no result row either. Production held 697 jobs in that state and exactly zero that had genuinely failed, so every failure notice the export was capable of producing was false.",
          "Downloading the paused Module 4 batch gave staff 964 rows. 470 of them read \"EVALUATION FAILED: unknown error\" beside a blank mark. Forwarded to a student, that is the worst thing this system can say — and it would have been said about work nobody had looked at yet.",
        ],
        compare: {
          caption: "The same batch, exported before and after",
          rows: [
            { label: "Before", score: "470 rows", quote: "EVALUATION FAILED: unknown error", bad: true },
            { label: "After", score: "470 rows", quote: "NOT GRADED YET" },
          ],
        },
        after: [
          "The row count is unchanged. The difference is entirely in what the file claims about work that had not been done. Only a job that actually reached a failed status gets failure text now.",
        ],
      },
      {
        heading: "The second bug was the interesting one",
        body: [
          "Adding a deadline to the queue read made an existing catch block reachable for the first time. Nobody had ever seen what it did, and what it did was carry on and enqueue the batch anyway — on the reasoning that a duplicate submission beats a batch that stalls forever.",
          "That has the risk backwards. A read that timed out tells you nothing about whether messages exist. And the likeliest cause of a slow read — a broker that is alive but under load — is exactly the case where the messages do exist and are about to be graded.",
          "So enqueueing buys no progress at all. It re-submits work already queued, and on a 20,000-submission cycle it doubles the GPU bill for it.",
        ],
        list: [
          "It now refuses, with a message telling the user to press Start again.",
          "The jobs stay queued in Mongo, which is the durable record either way — Redis was never the source of truth.",
          "The read gets a 20-second deadline rather than the API's 5, because it fetches every message hash in the queue and 5 seconds was never enough for a real batch.",
        ],
      },
      {
        heading: "What I take from it",
        body: [
          "Both bugs are the same shape: a piece of code treating \"I do not have this\" as \"this went wrong\". The export could not tell an ungraded job from a failed one. The catch block could not tell a timed-out read from an empty queue. In both cases the system answered confidently, and in both cases the confident answer was the damaging one.",
          "The rule I now apply to anything that reports on work: state absence as absence. \"Not graded yet\" and \"failed\" are different facts about a student, and a system that cannot tell them apart should say so rather than guess — because the guess gets forwarded, and by then it has your name on it.",
        ],
      },
    ],

    footnote:
      "Job counts, row counts and reasoning are from commit 3df3201 in the Atlas repository. The repo is private — internal tooling built at Masai — so the figures are quoted rather than linked.",
  },

  "buildingblocks-mixed-content": {
    project: "BuildingBlocks",
    projectId: "buildingblocks",
    accent: "56,189,248",
    title: "The lecture videos that only played on my machine",
    dek: "Cloudinary hands back two URLs for every upload. Only one of them works on an HTTPS page.",
    date: "January 2025",
    published: "2025-01",
    tags: ["Mixed content", "Media pipeline", "Boundaries"],

    sections: [
      {
        heading: "Fine locally, blank in production",
        body: [
          "Instructors upload lecture videos, which go to Cloudinary and come back as a URL stored against the course. Locally every video played. On the deployed site the players were blank and the console was full of errors.",
          "Cloudinary returns two URLs for every upload. `url` is `http://`, `secure_url` is `https://`, and the code was storing `url` — which is the obvious field to reach for, and the one that is wrong for anything served over HTTPS.",
          "Browsers block an `http://` video embedded in an `https://` page. That is mixed content, and the block is silent as far as the page is concerned: no exception, no failed promise, just a player with nothing in it and a console warning nobody sees until they look. It worked locally because local development is `http://`, where there is nothing to mix.",
        ],
      },
      {
        heading: "Where to fix it",
        body: [
          "The quick fix is to use `secure_url` at the point where the course record is written. That works, and it lasts exactly until the next feature reads `url` again — because `url` still exists, still looks correct, and still returns a working-looking string.",
          "So the fix went in the upload helper instead. `uploadMediaToCloudinary` now resolves the whole result with `url` overwritten by `secure_url`, and rejects outright if Cloudinary did not return one:",
        ],
        compare: {
          caption: "What the upload helper hands back",
          rows: [
            { label: "Cloudinary's result", score: "url", quote: "http://res.cloudinary.com/… — blocked on an HTTPS page", bad: true },
            { label: "What callers get", score: "url", quote: "https://res.cloudinary.com/… — secure_url, always" },
          ],
        },
        after: [
          "Every caller now gets an HTTPS URL from the field it was already reading. `secure_url` appears in exactly one file in the repository, which is the point: there is no longer a wrong value available to pick.",
        ],
      },
      {
        heading: "What I take from it",
        body: [
          "The bug was not that I used the wrong field. It was that the API offered two fields where one of them can never be used, and my code passed that choice along to every consumer downstream.",
          "The general form: when a dependency hands you a value that is correct in one environment and broken in another, normalise it at the boundary where it enters your system. A rule you have to remember at each call site is a rule you will eventually forget at one of them — and this particular failure gives you no error to find it by, only a blank rectangle where the lesson was supposed to be.",
        ],
      },
    ],

    footnote:
      "From server/helpers/cloudinary.js in bhupesh-roushan/BuildingBlocks — the override and its guard are both in uploadMediaToCloudinary. The repository is public.",
  },

  "cloudwatch-cookie-origin": {
    project: "CloudWatch",
    projectId: "cloudwatch",
    accent: "99,102,241",
    title: "The login that worked everywhere except production",
    dek: "Forty commits chasing a cross-subdomain auth cookie, and the reason none of them could have worked.",
    date: "February 2026",
    published: "2026-02",
    tags: ["Auth", "Cookies", "Serverless deploys"],

    sections: [
      {
        heading: "The setup that broke",
        body: [
          "CloudWatch signs users in with a JWT in an httpOnly cookie. `requireAuth` reads it on every protected route, verifies it, loads the user and attaches them to the request. Standard, and it worked perfectly in development, where the Next.js client and the Express API share an origin.",
          "In production they did not. The client was one Vercel deployment and the API was another, so the browser was being asked to send a cookie to a different origin from the one that set it — and it declined, every time. Login appeared to succeed and the next request was anonymous.",
        ],
      },
      {
        heading: "What I tried",
        body: [
          "The commit history is an honest record of working the problem from the cookie end, because that is where the symptom was:",
        ],
        list: [
          "`sameSite: none` with `secure: true`, so the cookie would be sent cross-site at all.",
          "Setting the cookie's `domain` to `.vercel.app`, so both deployments would fall under it.",
          "Then a specific domain, then no domain, then the custom domain once there was one.",
          "`VERCEL_ENV` instead of `NODE_ENV` to detect production, after finding the environment check was wrong.",
          "`Max-Age` in seconds rather than milliseconds — a real bug, found on the way, that was expiring the cookie instantly.",
          "CORS widened to allow every Vercel subdomain dynamically, then both HTTP and HTTPS origins.",
          "Eventually, bypassing Express routing entirely, because by then it was unclear which layer was even at fault.",
        ],
        after: [
          "Several of those were genuine bugs and worth fixing. None of them was the problem.",
        ],
      },
      {
        heading: "Why the domain attempt could never work",
        body: [
          "`.vercel.app` is on the Public Suffix List — the same registry that stops a site setting a cookie on `.co.uk` or `.com`. Browsers refuse to set a cookie scoped to a public suffix, because if they did not, any project on the platform could write a cookie every other project would send.",
          "So the most promising-looking fix in that list was not merely wrong, it was unreachable. The browser was enforcing a rule that exists specifically to prevent what I was attempting, and it was right to.",
          "That is the part worth remembering: I spent a long time tuning the parameters of an approach that had no working configuration. No amount of care with `sameSite` and `secure` gets you a cookie shared across two `.vercel.app` deployments.",
        ],
      },
      {
        heading: "The fix was to stop crossing the boundary",
        body: [
          "The cookie was never the problem. Two origins was the problem, and the cookie was where it showed up.",
          "`client/next.config.ts` now rewrites `/api/:path*` to the backend deployment. The browser only ever talks to the frontend origin; Next.js forwards the request server-side, where same-origin rules do not apply. The auth cookie became first-party, and every piece of cross-site cookie configuration became unnecessary.",
        ],
        compare: {
          caption: "Where the request goes",
          rows: [
            { label: "Before", score: "2 origins", quote: "browser -> api.example -> cookie refused", bad: true },
            { label: "After", score: "1 origin", quote: "browser -> /api -> proxied server-side" },
          ],
        },
        after: [
          "The `sameSite` and `secure` settings stayed, because they are correct on their own merits. They just stopped being load-bearing.",
        ],
      },
      {
        heading: "What I take from it",
        body: [
          "When a fix has many knobs and none of them help, that is evidence about the approach rather than about the knobs. I read the repeated failures as \"not tuned correctly yet\" for far longer than I should have, when they were saying \"this cannot work\".",
          "The question I would ask an hour in now, instead of a week in: is there any configuration of this approach that succeeds? For cookies across two public-suffix subdomains the answer was no, and it was knowable before the first attempt.",
        ],
      },
    ],

    footnote:
      "Reconstructed from the auth commit trail in bhupesh-roushan/cloudwatch-digital and from client/next.config.ts as it currently stands. The repository is public — the rewrite is at the bottom of that file.",
  },

  "atlas-constrained-decoding": {
    project: "Atlas",
    projectId: "atlas",
    accent: "45,212,191",
    title: "The safety net was breaking the grades",
    dek: "Why Atlas stopped forcing the model to emit valid JSON — and what it cost to find out.",
    date: "July 2026",
    published: "2026-07",
    tags: ["LLM evaluation", "Constrained decoding", "Failure modes"],

    sections: [
      {
        heading: "The obvious defence",
        body: [
          "Atlas grades student submissions against per-question rubrics. The model returns JSON — a score and a comment for each criterion — and if that JSON is malformed the job fails and someone has to run it again.",
          "The obvious defence is constrained decoding. Ollama compiles a `format` schema into a generation grammar, so the model physically cannot emit a token that would break the structure. Valid output, guaranteed, every time. It is the sort of fix that looks like pure upside: you trade nothing and you remove an entire class of failure.",
        ],
      },
      {
        heading: "What it actually did",
        body: [
          "On a rubric with 30 sub-criteria, that grammar wrecked the grading itself.",
          "Here is the same submission, the same prompt, the same model, with the only difference being whether the schema was enforced at the decoder:",
        ],
        compare: {
          caption: "One SQL submission, graded twice",
          rows: [
            {
              label: "Schema enforced",
              score: "0 / 15",
              quote: "No WHERE clause included in query",
              bad: true,
            },
            {
              label: "Schema off",
              score: "4.5 / 15",
              quote: "Included a WHERE clause",
            },
          ],
        },
        after: [
          "The WHERE clause was plainly there. The model was not misreading the answer so much as failing to reason about it at all: the grammar constrained the shape of the output and, in doing so, constrained the thinking that produced it.",
          "It was not one unlucky submission. Across four valid queries that had all scored zero, three scored above zero once the grammar was removed. One went from 0 to 12 out of 15.",
        ],
      },
      {
        heading: "Why it was safe to remove",
        body: [
          "The argument for constrained decoding is that malformed JSON breaks the pipeline. That was worth checking rather than assuming, because by then three separate things were already handling it:",
        ],
        list: [
          "The prompt specifies the JSON shape explicitly — the model is told exactly what to return.",
          "`extractJson` tolerates the usual wrapping: prose before the object, fenced code blocks, trailing commentary.",
          "`validateResult` rejects anything that still does not parse or does not add up, and the job retries.",
        ],
        after: [
          "So the grammar was insurance against a failure the system could already survive — and it was charging for that insurance in wrong marks. It is now opt-in behind `ATLAS_LLM_ENFORCE_SCHEMA=1` rather than the default.",
        ],
      },
      {
        heading: "The failure underneath the failure",
        body: [
          "Shortly before this, the grade schema's keys had been shortened to `c`, `m`, `a`, `r` to save tokens. That change was the reason the collapse was as bad as it was.",
          "The decoder's grammar demanded the new short keys. Manifests baked before the change still asked for the long ones. So the grammar was forcing the model to answer in a vocabulary the prompt had never introduced — and a model made to fill in a structure it was not told about produces exactly what we saw: syntactically perfect, semantically empty.",
          "The abbreviation was reverted with the schema enforcement, and the rule it taught is now written down beside both definitions: the prompt and the schema must always name the same keys. They are two halves of one contract, and nothing in the type system connects them.",
        ],
      },
      {
        heading: "What I take from it",
        body: [
          "A guarantee applied at the wrong layer does not announce itself. Nothing crashed. No job failed. No alert fired. The pipeline reported a clean run, the dashboard showed green, and the output was a student receiving zero for correct work.",
          "That is the failure mode worth designing against in this kind of system — not the one that pages you, but the one that produces a confident, well-formed, wrong answer at scale. Every layer added after this one is checked the same way: not \"does it produce valid output\", but \"what would it look like if this were quietly wrong, and would anyone find out?\"",
          "It is also why the flagged-result review queue exists, and why any zero with real content behind it goes to a human before it counts.",
        ],
      },
    ],

    footnote:
      "Measurements and reasoning are from commit f2e961c in the Atlas repository. The repo is private — it is internal tooling built at Masai — so the numbers here are quoted rather than linked.",
  },

  "frequencii-image-weight": {
    project: "Frequencii",
    projectId: "frequencii",
    accent: "249,115,22",
    title: "The empty-cart screen was a 28 MB image",
    dek: "Three passes over the same photos in one day, and the format change that made the hero banners 63% heavier.",
    date: "October 2024",
    published: "2024-10",
    tags: ["Image weight", "Asset pipeline", "Measure first"],

    sections: [
      {
        heading: "What the first push carried",
        body: [
          "Frequencii is a storefront, which makes it mostly photographs: five hero banners, category tiles, product shots. They went into the first push (bc7f6bf) at whatever size they had on disk.",
          "`emptyCart.jpg` — the picture the Cart page renders under \"Your Cart Is Empty\" — was 28,418,876 bytes. `product1.jpg` was 17,426,632. A 7,829,367-byte photo of a retro alarm clock was in there as well, and was dropped in the first pass. The 33 images that pass touched came to 180,845,156 bytes between them.",
          "The first push was at 01:53 on 22 October 2024. Every image commit that day, up to 23:01, is some response to those numbers.",
        ],
      },
      {
        heading: "Three passes",
        body: [
          "The first recompression went in at 03:02 under the message \"vercel file added\", which describes the previous commit rather than this one. It touched 32 images and removed the alarm clock. A second pass at 15:16 and a third at 21:41 followed, all on 22 October 2024 (times as committed, IST).",
          "The picture that makes the case on its own is the empty-cart image, because it moved the furthest:",
        ],
        compare: {
          caption: "emptyCart.jpg, in bytes, after each commit",
          rows: [
            { label: "First push", score: "28,418,876", quote: "bc7f6bf", bad: true },
            { label: "03:02", score: "1,375,020", quote: "ee94533" },
            { label: "15:16", score: "94,330", quote: "f16ad55" },
            { label: "21:41", score: "80,429", quote: "302b8b5" },
          ],
        },
        after: [
          "Across the 32 images that were recompressed the totals run 173,015,789, then 15,231,431, then 3,944,003, then 2,669,058 bytes. Not every step was a clean win, though, and the one that was not is the interesting one.",
        ],
      },
      {
        heading: "The WebP detour went the wrong way",
        body: [
          "The 15:16 commit converted the five hero banners from `.jpg` to `.webp`, which is the move you reach for when you want a smaller file. Every one of them came out larger than the JPEG it replaced. `hero1` went from 260,288 bytes to 375,948. The five together went from 1,253,939 to 2,048,914 — 794,975 bytes, or 63%, heavier — while the same commit took the other 27 images from 13,977,492 bytes down to 1,895,089.",
          "The 21:41 commit put the `.jpg` imports back in `Home.jsx` and re-exported the heroes, which now came to 363,398 bytes for all five: less than either version before it.",
        ],
        compare: {
          caption: "The five hero banners, combined",
          rows: [
            { label: "JPEG, after pass one", score: "1,253,939", quote: "ee94533" },
            { label: "WebP", score: "2,048,914", quote: "f16ad55 — the format change", bad: true },
            { label: "JPEG, re-exported", score: "363,398", quote: "302b8b5" },
          ],
        },
        after: [
          "The commit messages do not say why the WebP files were larger, and I am not going to supply a reason after the fact. What they do record, in the byte counts, is that changing the format did not shrink the heroes; the sizes only came down when they were JPEGs again.",
          "The same 21:41 commit re-encoded the other 27 images and they came back bigger, 1,895,089 bytes to 2,305,660. That is also in the diff and also unexplained there. The set ended at 2,669,058 bytes, against 3,944,003 one commit earlier.",
        ],
      },
      {
        heading: "A preload that could not have done anything",
        body: [
          "At 22:58 I added `rel=\"preload\"` to six `<img>` elements: five in `CategoryCard.jsx` and the carousel in `Home.jsx`. At 23:01, under three minutes later, a second commit removed every one of them. Both are titled \"images Updated\", and neither says why.",
          "`rel` is not an attribute of `<img>`. Preloading is a `rel` value on a `<link>` element, so those six attributes were inert from the moment they were written. It is the same shape as the WebP step in miniature: a change meant to make images faster, made without looking at whether it did.",
        ],
      },
      {
        heading: "What I take from it",
        body: [
          "A format is not a compression ratio. The only step in this sequence that made the files bigger was the one where I changed the format instead of looking at the output, and it was only visible as a number. The stat line that `git show` prints for a binary file, old size to new size, is all it takes to catch that, and a size check after each step costs nothing.",
          "The other lesson is about what \"fixed\" means. The original files are gone from the working tree and are still in the history at bc7f6bf — the 28 MB `emptyCart.jpg` included — so anyone cloning the repository still downloads them, and history was not rewritten to drop them. Making the site's images light and making the repository light are two different jobs, and only one of them was done.",
        ],
      },
    ],

    footnote:
      "Every byte count is from the diff stats of bc7f6bf, ee94533, f16ad55 and 302b8b5 in bhupesh-roushan/frequencii; the preload attempt and its removal are 739e8d0 and 15c717a. All six commits are dated 22 October 2024. The commit messages do not explain these choices, so where this page says why, it is read from the numbers. The repository is public: github.com/bhupesh-roushan/frequencii.",
  },
};
