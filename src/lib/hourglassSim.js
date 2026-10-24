/**
 * A model of how a Hourglass chat message travels, written from the real source
 * (bhupesh-roushan/hourglass) rather than from the architecture note:
 *
 *   backend/socket/socket.js
 *     userSocketMap maps userId -> socketId. A connection registers itself from
 *     handshake.query.userId, a disconnect deletes the entry, and both
 *     broadcast `getOnlineUsers` with the map's keys.
 *   backend/controllers/message.controller.js
 *     sendMessage finds or creates the Conversation, creates the Message,
 *     pushes it into the conversation, saves, and only then looks the
 *     receiver up in the map. With a socket id it emits `newMessage` to that
 *     socket; without one it emits nothing. Either way it answers 201 with the
 *     stored message. getMessage returns the conversation's populated messages,
 *     or an empty list when no conversation exists.
 *   frontend/src/hooks/useGetRTM.jsx, useGetAllMessage.jsx, ChatPage.jsx
 *     The receiver appends whatever `newMessage` delivers. The sender appends
 *     the message from the 201 response, not from a socket event. A client only
 *     learns of stored messages by GET /message/all/:id, which runs when a chat
 *     is opened, and that replaces its list outright.
 *
 * Both "paths" therefore live inside one POST handler and run in sequence —
 * persist, then emit — rather than racing. What makes the socket optional is
 * that the persist step has already happened by the time the lookup fails.
 *
 * No React, no network, no clock: every function takes a state and returns
 * { state, steps } without mutating its input, so the whole flow is testable
 * and the UI can simply hold the latest state. An offline user here means a
 * closed client (no socket, no in-memory chat), which is what makes
 * "reconnect, then fetch" the only way to catch up.
 */

/** @typedef {"alice" | "bob"} UserId */

/**
 * One line of the trace the demo shows. `path` is which half of the handler ran
 * (the REST call or the socket emit); `miss` marks the step where something
 * did not happen — no socket, nothing to send — as opposed to the normal case.
 * @typedef {object} Step
 * @property {"rest" | "socket"} path
 * @property {string} text
 * @property {"ok" | "miss"} tone
 */

/**
 * A stored Message document, as far as the model needs one.
 * @typedef {object} StoredMessage
 * @property {string} _id
 * @property {UserId} senderId
 * @property {UserId} receiverId
 * @property {string} message
 */

/**
 * A Conversation document: who is in it and its messages, by id.
 * @typedef {object} Conversation
 * @property {UserId[]} participants
 * @property {string[]} messages
 */

/**
 * Everything the simulation holds, server and clients together.
 * @typedef {object} SimState
 * @property {Partial<Record<UserId, string>>} registry  userSocketMap: user to socket id, present only while connected
 * @property {Conversation[]} conversations
 * @property {StoredMessage[]} messages
 * @property {Record<UserId, StoredMessage[]>} views  what each client is showing
 * @property {Record<UserId, UserId[]>} onlineLists  the last `getOnlineUsers` payload each client got
 * @property {{ socket: number, message: number }} counters  next socket and message numbers
 */

/**
 * What every transition returns: the new state (the same object when nothing
 * changed) and the trace of what happened.
 * @typedef {{ state: SimState, steps: Step[] }} SimResult
 */

/** @type {readonly [UserId, UserId]} */
export const USERS = ["alice", "bob"];

/** @type {Record<UserId, string>} */
export const NAMES = { alice: "Alice", bob: "Bob" };

/** @param {UserId} id */
const peerOf = (id) => (id === USERS[0] ? USERS[1] : USERS[0]);

// Socket ids from a counter, so runs are repeatable (and testable), but still a
// fresh, unrelated-looking id on every connect — which is the point of the
// registry: the same user is a different socket each time.
/** @param {number} n */
const socketIdFor = (n) =>
  (Math.imul(n + 7919, 2654435761) >>> 0).toString(36).padStart(7, "0").slice(0, 7);

/** @param {number} n */
const messageIdFor = (n) => `m${n}`;

/**
 * @param {Step["path"]} path
 * @param {string} text
 * @param {Step["tone"]} [tone]
 * @returns {Step}
 */
const step = (path, text, tone = "ok") => ({ path, text, tone });

/**
 * @param {Conversation} conv
 * @param {UserId} a
 * @param {UserId} b
 */
const sameConversation = (conv, a, b) =>
  conv.participants.includes(a) && conv.participants.includes(b);

/** @returns {SimState} */
export const createSim = () => ({
  // userSocketMap
  registry: {},
  // Conversation collection: { participants, messages: [messageId] }
  conversations: [],
  // Message collection
  messages: [],
  // What each client is showing right now. Lives in the browser, not the server.
  views: { alice: [], bob: [] },
  // The last `getOnlineUsers` payload each connected client received.
  onlineLists: { alice: [], bob: [] },
  counters: { socket: 0, message: 0 },
});

/**
 * @param {SimState} state
 * @param {UserId} user
 */
export const isOnline = (state, user) => Boolean(state.registry[user]);

/**
 * @param {SimState} state
 * @param {UserId} user
 * @returns {SimResult}
 */
export const connect = (state, user) => {
  if (isOnline(state, user)) {
    return { state, steps: [step("socket", `${NAMES[user]} already has a socket — nothing to do`, "miss")] };
  }
  const socketId = socketIdFor(state.counters.socket);
  const registry = { ...state.registry, [user]: socketId };
  // The registry is only ever keyed by UserId, but Object.keys says string.
  const online = /** @type {UserId[]} */ (Object.keys(registry));

  // io.emit reaches every connected socket, including the one that just joined.
  const onlineLists = { ...state.onlineLists };
  online.forEach((u) => {
    onlineLists[u] = online;
  });

  return {
    state: {
      ...state,
      registry,
      onlineLists,
      counters: { ...state.counters, socket: state.counters.socket + 1 },
    },
    steps: [
      step("socket", `connection: handshake.query.userId = ${user}, socket.id = ${socketId}`),
      step("socket", `registry: userSocketMap[${user}] = ${socketId}`),
      step("socket", `io.emit("getOnlineUsers", [${online.join(", ")}])`),
    ],
  };
};

/**
 * @param {SimState} state
 * @param {UserId} user
 * @returns {SimResult}
 */
export const disconnect = (state, user) => {
  if (!isOnline(state, user)) {
    return { state, steps: [step("socket", `${NAMES[user]} has no socket — nothing to close`, "miss")] };
  }
  const { [user]: gone, ...registry } = state.registry;
  const online = /** @type {UserId[]} */ (Object.keys(registry));

  // The closed client loses its list and its in-memory chat; everyone still
  // connected hears the new roster.
  const onlineLists = { ...state.onlineLists, [user]: [] };
  online.forEach((u) => {
    onlineLists[u] = online;
  });

  return {
    state: {
      ...state,
      registry,
      onlineLists,
      views: { ...state.views, [user]: [] },
    },
    steps: [
      step("socket", `disconnect: ${user} (socket ${gone}) closed`),
      step("socket", `registry: delete userSocketMap[${user}]`),
      step("socket", `io.emit("getOnlineUsers", [${online.join(", ")}])`),
    ],
  };
};

/**
 * @param {SimState} state
 * @param {UserId} from
 * @param {UserId} to
 * @param {string | null | undefined} text  blank or missing text is refused, not sent
 * @returns {SimResult}
 */
export const send = (state, from, to, text) => {
  const body = String(text ?? "").trim();
  if (!isOnline(state, from)) {
    return {
      state,
      steps: [step("rest", `${NAMES[from]} has no open client, so nothing can send`, "miss")],
    };
  }
  if (!body) {
    return { state, steps: [step("rest", "empty message — nothing sent", "miss")] };
  }

  const steps = [step("rest", `POST /api/v1/message/send/${to}  { textMessage }`)];

  // Conversation.findOne({ participants: { $all: [sender, receiver] } }), then
  // Conversation.create when there isn't one.
  let conversations = state.conversations;
  let index = conversations.findIndex((c) => sameConversation(c, from, to));
  if (index === -1) {
    conversations = [...conversations, { participants: [from, to], messages: [] }];
    index = conversations.length - 1;
    steps.push(step("rest", "Conversation.findOne: none → Conversation.create"));
  } else {
    steps.push(step("rest", "Conversation.findOne: found"));
  }

  /** @type {StoredMessage} */
  const message = {
    _id: messageIdFor(state.counters.message + 1),
    senderId: from,
    receiverId: to,
    message: body,
  };
  conversations = conversations.map((c, i) =>
    i === index ? { ...c, messages: [...c.messages, message._id] } : c,
  );
  steps.push(step("rest", `MongoDB: Message ${message._id} created, pushed into the conversation, saved`));

  // Only now does the controller touch the socket registry.
  const socketId = state.registry[to];
  const views = { ...state.views };
  if (socketId) {
    steps.push(step("socket", `registry lookup: ${to} → socket ${socketId}`));
    steps.push(step("socket", `io.to(${socketId}).emit("newMessage", message)`));
    // useGetRTM: the receiver appends what the event carries.
    views[to] = [...views[to], message];
  } else {
    steps.push(step("socket", `registry lookup: ${to} → not found`, "miss"));
    steps.push(step("socket", "no socket: nothing emitted — stored only", "miss"));
  }

  // ChatPage: the sender appends res.data.newMessage from the 201 response.
  views[from] = [...views[from], message];
  steps.push(step("rest", `201 { success, newMessage } → ${NAMES[from]}'s client appends it`));
  if (socketId) {
    steps.push(step("socket", `${NAMES[to]}'s client: socket.on("newMessage") appends it`));
  }

  return {
    state: {
      ...state,
      conversations,
      messages: [...state.messages, message],
      views,
      counters: { ...state.counters, message: state.counters.message + 1 },
    },
    steps,
  };
};

// What GET /message/all/:id returns for a pair: the populated messages of the
// conversation, in the order they were pushed, or [] when none exists.
/**
 * @param {SimState} state
 * @param {UserId} a
 * @param {UserId} b
 * @returns {StoredMessage[]}
 */
export const storedMessages = (state, a, b) => {
  const conv = state.conversations.find((c) => sameConversation(c, a, b));
  if (!conv) return [];
  // send() creates the message and pushes its id in the same step, so an id in
  // a conversation always has a message to go with it.
  return conv.messages.map((id) => /** @type {StoredMessage} */ (state.messages.find((m) => m._id === id)));
};

/**
 * @param {SimState} state
 * @param {UserId} user
 * @param {UserId} [peer]  the other participant by default
 * @returns {SimResult}
 */
export const fetchConversation = (state, user, peer = peerOf(user)) => {
  if (!isOnline(state, user)) {
    return {
      state,
      steps: [step("rest", `${NAMES[user]} has no open client, so nothing can fetch`, "miss")],
    };
  }
  const steps = [step("rest", `GET /api/v1/message/all/${peer}`)];
  const found = state.conversations.some((c) => sameConversation(c, user, peer));
  const messages = storedMessages(state, user, peer);
  steps.push(
    found
      ? step("rest", `Conversation.findOne(...).populate("messages") → ${messages.length}`)
      : step("rest", "Conversation.findOne: none → { success, messages: [] }", "miss"),
  );
  // useGetAllMessage dispatches setMessages(res.data.messages): a replace.
  steps.push(step("rest", `${NAMES[user]}'s client: setMessages(...) now shows ${messages.length}`));
  return {
    state: { ...state, views: { ...state.views, [user]: messages } },
    steps,
  };
};
