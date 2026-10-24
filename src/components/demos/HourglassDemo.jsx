import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { LuExternalLink, LuSend, LuDatabase, LuRadio, LuListOrdered } from "react-icons/lu";
import {
  USERS,
  NAMES,
  createSim,
  connect,
  disconnect,
  send,
  fetchConversation,
  storedMessages,
  isOnline,
} from "../../lib/hourglassSim";

const LIVE_APP = "https://hourglass-0e3w.onrender.com/";
const SOCKET_SOURCE = "https://github.com/bhupesh-roushan/hourglass/blob/main/backend/socket/socket.js";

// Lane colours for the log. Amber-ish "miss" steps use orange because the light
// theme re-steps that hue (index.css) while it leaves amber alone.
const LANE = {
  rest: { label: "REST", cls: "border-sky-400/30 bg-sky-400/10 text-sky-300" },
  socket: { label: "Socket", cls: "border-indigo-400/30 bg-indigo-400/10 text-indigo-300" },
};

const Panel = ({ icon: Icon, title, hint, children }) => (
  <section className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-3">
    <h5 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-300">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {title}
    </h5>
    {hint && <p className="mb-2 text-[11px] leading-snug text-gray-400">{hint}</p>}
    {children}
  </section>
);

function Phone({ user, sim, draft, onDraft, onToggle, onSend, onFetch, reduceMotion }) {
  const peer = USERS.find((u) => u !== user);
  const online = isOnline(sim, user);
  const view = sim.views[user];
  const peerOnline = sim.onlineLists[user].includes(peer);
  const listRef = useRef(null);

  // Keep the newest message in view; the list is short but the pane is fixed.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [view.length]);

  const inputId = `hg-input-${user}`;

  return (
    <section
      aria-label={`${NAMES[user]}'s phone`}
      className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04]"
    >
      <header className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <div className="min-w-0">
          <div className="text-sm font-bold text-white">{NAMES[user]}</div>
          <div className="text-[11px] leading-snug text-gray-400">
            {online
              ? `${NAMES[peer]} ${peerOnline ? "is online" : "is offline"} (getOnlineUsers)`
              : "Client closed — no socket"}
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={online}
          onClick={onToggle}
          className="flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1 pl-1 pr-2.5 text-[11px] font-semibold text-gray-200 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          <span
            aria-hidden="true"
            className={`flex h-4 w-7 items-center rounded-full p-0.5 transition-colors ${
              online ? "bg-emerald-500 justify-end" : "bg-gray-500/60 justify-start"
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-white shadow" />
          </span>
          {online ? "Online" : "Offline"}
          <span className="sr-only">: toggle {NAMES[user]}&apos;s connection</span>
        </button>
      </header>

      <div
        ref={listRef}
        role="log"
        tabIndex={0}
        aria-label={`${NAMES[user]}'s chat with ${NAMES[peer]}`}
        className="h-40 min-w-0 space-y-1.5 overflow-y-auto px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
      >
        {view.length === 0 && (
          <p className="pt-6 text-center text-[11px] leading-snug text-gray-400">
            {online
              ? "Nothing loaded. Messages arrive live over the socket, or all at once by opening the chat."
              : "Closed. Nothing is held in memory here."}
          </p>
        )}
        {view.map((msg) => {
          const mine = msg.senderId === user;
          return (
            <m.div
              key={msg._id}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <span
                className={`max-w-[85%] break-words rounded-2xl px-3 py-1.5 text-sm ${
                  mine
                    ? "rounded-br-md bg-indigo-500/25 text-white"
                    : "rounded-bl-md bg-white/10 text-white"
                }`}
              >
                {msg.message}
              </span>
            </m.div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="flex gap-2 border-t border-white/10 p-2"
      >
        <label htmlFor={inputId} className="sr-only">
          Message from {NAMES[user]} to {NAMES[peer]}
        </label>
        <input
          id={inputId}
          type="text"
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          disabled={!online}
          maxLength={140}
          autoComplete="off"
          placeholder={online ? `Message ${NAMES[peer]}...` : "Offline"}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!online || !draft.trim()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-indigo-400/40 bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <LuSend className="h-3.5 w-3.5" aria-hidden="true" />
          Send
        </button>
      </form>

      <div className="border-t border-white/10 px-2 py-2">
        <button
          type="button"
          onClick={onFetch}
          disabled={!online}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Open chat · GET /message/all/{peer}
        </button>
      </div>
    </section>
  );
}

export default function HourglassDemo() {
  const reduceMotion = useReducedMotion();
  const [sim, setSim] = useState(() => connect(connect(createSim(), "alice").state, "bob").state);
  const [drafts, setDrafts] = useState({ alice: "", bob: "" });
  // The last action's steps. `run` re-keys the list so it replays each time.
  const [last, setLast] = useState({ run: 0, label: "Both clients connected", steps: [] });

  const apply = (label, result) => {
    setSim(result.state);
    setLast((prev) => ({ run: prev.run + 1, label, steps: result.steps }));
  };

  const toggle = (user) =>
    isOnline(sim, user)
      ? apply(`${NAMES[user]} went offline`, disconnect(sim, user))
      : apply(`${NAMES[user]} came online`, connect(sim, user));

  const submit = (from) => {
    const to = USERS.find((u) => u !== from);
    const text = drafts[from];
    if (!text.trim() || !isOnline(sim, from)) return;
    apply(`${NAMES[from]} → ${NAMES[to]}: “${text.trim()}”`, send(sim, from, to, text));
    setDrafts((d) => ({ ...d, [from]: "" }));
  };

  const open = (user) => {
    const peer = USERS.find((u) => u !== user);
    apply(`${NAMES[user]} opened the chat with ${NAMES[peer]}`, fetchConversation(sim, user, peer));
  };

  const reset = () => {
    setSim(connect(connect(createSim(), "alice").state, "bob").state);
    setDrafts({ alice: "", bob: "" });
    setLast({ run: 0, label: "Both clients connected", steps: [] });
  };

  const registry = Object.entries(sim.registry);
  const stored = storedMessages(sim, USERS[0], USERS[1]);
  const conversation = sim.conversations[0];

  // One sentence for screen readers: the step that decided the outcome.
  const spoken = last.steps.length
    ? `${last.label}. ${(last.steps.find((s) => s.tone === "miss") ?? last.steps.at(-1)).text}`
    : "";

  return (
    <div>
      <p className="mb-3 text-xs leading-relaxed text-gray-300">
        A simulation of Hourglass&apos;s message flow, written from its socket.js and message
        controller — not the live app.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {USERS.map((user) => (
          <Phone
            key={user}
            user={user}
            sim={sim}
            draft={drafts[user]}
            onDraft={(v) => setDrafts((d) => ({ ...d, [user]: v }))}
            onToggle={() => toggle(user)}
            onSend={() => submit(user)}
            onFetch={() => open(user)}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Panel
          icon={LuRadio}
          title="Socket registry"
          hint="userSocketMap: userId → socketId. Set on connect, deleted on disconnect."
        >
          {registry.length === 0 ? (
            <p className="font-mono text-xs text-gray-400">{"{ }"}</p>
          ) : (
            <ul className="space-y-1 font-mono text-xs text-gray-200">
              {registry.map(([user, socketId]) => (
                <m.li
                  key={`${user}-${socketId}`}
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="break-all"
                >
                  {user} → <span className="text-emerald-300">{socketId}</span>
                </m.li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          icon={LuDatabase}
          title="MongoDB"
          hint="Every send is stored here first, whether or not anyone is connected."
        >
          {conversation ? (
            <p className="mb-1.5 break-words font-mono text-[11px] text-gray-400">
              Conversation {"{"} participants: [{conversation.participants.join(", ")}], messages: [
              {conversation.messages.join(", ")}] {"}"}
            </p>
          ) : (
            <p className="mb-1.5 font-mono text-[11px] text-gray-400">No conversation yet.</p>
          )}
          <ul className="max-h-28 space-y-1 overflow-y-auto font-mono text-xs text-gray-200">
            {stored.map((msg) => (
              <m.li
                key={msg._id}
                initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="break-words"
              >
                <span className="text-gray-400">{msg._id}</span> {msg.senderId} → {msg.receiverId}:{" "}
                {msg.message}
              </m.li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-3">
        <Panel
          icon={LuListOrdered}
          title="Last action"
          hint="One POST handler: persist first, then look up the socket. The two paths run in that order."
        >
          <p className="mb-2 break-words text-xs font-semibold text-white">{last.label}</p>
          {last.steps.length === 0 ? (
            <p className="text-xs text-gray-400">
              Send a message, toggle a client offline, or open a chat to see what the server does.
            </p>
          ) : (
            <ol className="space-y-1.5">
              {last.steps.map((s, i) => (
                <m.li
                  key={`${last.run}-${i}`}
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.09 }}
                  className="flex min-w-0 items-start gap-2 text-xs"
                >
                  <span
                    className={`mt-px shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${LANE[s.path].cls}`}
                  >
                    {LANE[s.path].label}
                  </span>
                  <span
                    className={`min-w-0 break-words font-mono ${
                      s.tone === "miss" ? "text-orange-300" : "text-gray-200"
                    }`}
                  >
                    {s.text}
                  </span>
                </m.li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <div role="status" className="sr-only">
        {spoken}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-white/10 px-2.5 py-1 font-semibold text-gray-300 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Reset
        </button>
        <a
          href={LIVE_APP}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-indigo-300 hover:underline"
        >
          Live app <LuExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
        <a
          href={SOCKET_SOURCE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-indigo-300 hover:underline"
        >
          Socket.io server source <LuExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
