/**
 * Long-form write-ups, one per hard decision.
 *
 * Every claim here is traceable to the Atlas repository — the measured scores
 * and the reasoning come from commit f2e961c, "Stop enforcing the JSON schema
 * at the decoder — it was fabricating zero scores". Nothing is illustrative.
 */
export const CASE_STUDIES = {
  "atlas-constrained-decoding": {
    project: "Atlas",
    projectId: "atlas",
    accent: "45,212,191",
    title: "The safety net was breaking the grades",
    dek: "Why Atlas stopped forcing the model to emit valid JSON — and what it cost to find out.",
    date: "July 2026",
    readingTime: "4 min",
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
};
