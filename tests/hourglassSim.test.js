import { describe, it, expect } from "vitest";
import {
  createSim,
  connect,
  disconnect,
  send,
  fetchConversation,
  storedMessages,
  isOnline,
} from "../src/lib/hourglassSim.js";

const both = () => connect(connect(createSim(), "alice").state, "bob").state;
/** @typedef {import("../src/lib/hourglassSim.js").Step} Step */
/** @typedef {import("../src/lib/hourglassSim.js").StoredMessage} StoredMessage */

/** @param {Step[]} steps */
const texts = (steps) => steps.map((s) => s.text);

describe("registry", () => {
  it("maps each connecting user to a socket id and broadcasts the roster", () => {
    const a = connect(createSim(), "alice");
    expect(Object.keys(a.state.registry)).toEqual(["alice"]);
    expect(texts(a.steps).at(-1)).toBe('io.emit("getOnlineUsers", [alice])');

    const b = connect(a.state, "bob");
    expect(Object.keys(b.state.registry)).toEqual(["alice", "bob"]);
    expect(b.state.registry.alice).not.toBe(b.state.registry.bob);
    // io.emit reaches Alice too, not just the socket that joined.
    expect(b.state.onlineLists.alice).toEqual(["alice", "bob"]);
    expect(b.state.onlineLists.bob).toEqual(["alice", "bob"]);
  });

  it("removes the entry on disconnect and tells whoever is left", () => {
    const s = both();
    const out = disconnect(s, "bob");
    expect(out.state.registry).toEqual({ alice: s.registry.alice });
    expect(out.state.onlineLists.alice).toEqual(["alice"]);
    expect(out.state.onlineLists.bob).toEqual([]);
    expect(texts(out.steps)).toContain("registry: delete userSocketMap[bob]");
    expect(isOnline(out.state, "bob")).toBe(false);
  });

  it("gives a reconnecting user a different socket id", () => {
    const s = both();
    const first = s.registry.bob;
    const again = connect(disconnect(s, "bob").state, "bob").state;
    expect(again.registry.bob).toBeTruthy();
    expect(again.registry.bob).not.toBe(first);
  });

  it("treats connecting twice or disconnecting a stranger as a no-op", () => {
    const s = both();
    expect(connect(s, "bob").state).toBe(s);
    expect(disconnect(disconnect(s, "bob").state, "bob").steps[0].tone).toBe("miss");
  });

  it("does not mutate the state it was given", () => {
    const s = both();
    const frozen = JSON.stringify(s);
    send(s, "alice", "bob", "hi");
    disconnect(s, "bob");
    expect(JSON.stringify(s)).toBe(frozen);
  });
});

describe("sending while the receiver is online", () => {
  it("stores the message, finds the socket, emits, and shows it on both clients", () => {
    const s = both();
    const out = send(s, "alice", "bob", "hello");

    expect(texts(out.steps)).toEqual([
      "POST /api/v1/message/send/bob  { textMessage }",
      "Conversation.findOne: none → Conversation.create",
      "MongoDB: Message m1 created, pushed into the conversation, saved",
      `registry lookup: bob → socket ${s.registry.bob}`,
      `io.to(${s.registry.bob}).emit("newMessage", message)`,
      "201 { success, newMessage } → Alice's client appends it",
      `Bob's client: socket.on("newMessage") appends it`,
    ]);
    expect(out.state.views.alice.map((m) => m.message)).toEqual(["hello"]);
    expect(out.state.views.bob.map((m) => m.message)).toEqual(["hello"]);
    expect(storedMessages(out.state, "alice", "bob")).toHaveLength(1);
  });

  it("reuses the conversation on the second send", () => {
    const first = send(both(), "alice", "bob", "one");
    const second = send(first.state, "bob", "alice", "two");
    expect(texts(second.steps)[1]).toBe("Conversation.findOne: found");
    expect(first.state.conversations).toHaveLength(1);
    expect(second.state.conversations).toHaveLength(1);
    expect(second.state.conversations[0].messages).toEqual(["m1", "m2"]);
  });
});

describe("sending while the receiver is offline", () => {
  const offline = () => disconnect(both(), "bob").state;

  it("persists the message and emits nothing", () => {
    const out = send(offline(), "alice", "bob", "are you there?");
    const log = texts(out.steps);

    expect(log).toContain("MongoDB: Message m1 created, pushed into the conversation, saved");
    expect(log).toContain("registry lookup: bob → not found");
    expect(log).toContain("no socket: nothing emitted — stored only");
    expect(log.some((t) => t.includes("emit(\"newMessage\""))).toBe(false);
    // Persist happens before the lookup, which is why a miss loses nothing.
    expect(log.findIndex((t) => t.startsWith("MongoDB"))).toBeLessThan(
      log.findIndex((t) => t.startsWith("registry lookup")),
    );

    expect(storedMessages(out.state, "alice", "bob")).toHaveLength(1);
    // Alice still gets the 201 and shows her own message; Bob's client is closed.
    expect(out.state.views.alice).toHaveLength(1);
    expect(out.state.views.bob).toEqual([]);
  });

  it("refuses to send from a client that is not open", () => {
    const s = offline();
    const out = send(s, "bob", "alice", "hi");
    expect(out.state).toBe(s);
    expect(out.steps[0].tone).toBe("miss");
  });

  it("ignores empty text", () => {
    const s = both();
    expect(send(s, "alice", "bob", "   ").state).toBe(s);
  });
});

describe("reconnecting and fetching", () => {
  it("learns of stored messages only by fetching, and the fetch replaces the list", () => {
    let s = disconnect(both(), "bob").state;
    s = send(s, "alice", "bob", "first").state;
    s = send(s, "alice", "bob", "second").state;

    s = connect(s, "bob").state;
    // Reconnecting alone delivers nothing: the socket has no backlog.
    expect(s.views.bob).toEqual([]);

    const out = fetchConversation(s, "bob", "alice");
    expect(texts(out.steps)).toEqual([
      "GET /api/v1/message/all/alice",
      'Conversation.findOne(...).populate("messages") → 2',
      "Bob's client: setMessages(...) now shows 2",
    ]);
    expect(out.state.views.bob.map((m) => m.message)).toEqual(["first", "second"]);
  });

  it("returns an empty list when the pair has never talked", () => {
    const out = fetchConversation(both(), "alice", "bob");
    expect(out.state.views.alice).toEqual([]);
    expect(out.steps[1].text).toBe("Conversation.findOne: none → { success, messages: [] }");
  });

  it("will not fetch for a closed client", () => {
    const s = disconnect(both(), "alice").state;
    expect(fetchConversation(s, "alice", "bob").state).toBe(s);
  });

  it("does not duplicate a message the client already received live", () => {
    let s = send(both(), "alice", "bob", "live").state;
    s = fetchConversation(s, "bob", "alice").state;
    expect(s.views.bob).toHaveLength(1);
  });
});

describe("ordering", () => {
  it("keeps several sends in the order they were made, on both clients and in storage", () => {
    let s = both();
    s = send(s, "alice", "bob", "1").state;
    s = send(s, "bob", "alice", "2").state;
    s = send(s, "alice", "bob", "3").state;

    /** @param {StoredMessage[]} list */
    const order = (list) => list.map((m) => m.message);
    expect(order(s.views.alice)).toEqual(["1", "2", "3"]);
    expect(order(s.views.bob)).toEqual(["1", "2", "3"]);
    expect(order(storedMessages(s, "alice", "bob"))).toEqual(["1", "2", "3"]);
    expect(s.messages.map((m) => m._id)).toEqual(["m1", "m2", "m3"]);
  });

  it("interleaves live and stored messages correctly after a gap", () => {
    let s = both();
    s = send(s, "alice", "bob", "a").state;
    s = disconnect(s, "bob").state;
    s = send(s, "alice", "bob", "b").state;
    s = connect(s, "bob").state;
    s = send(s, "alice", "bob", "c").state;

    // Bob's fresh client only has the live one until he opens the chat.
    expect(s.views.bob.map((m) => m.message)).toEqual(["c"]);
    s = fetchConversation(s, "bob", "alice").state;
    expect(s.views.bob.map((m) => m.message)).toEqual(["a", "b", "c"]);
  });
});
