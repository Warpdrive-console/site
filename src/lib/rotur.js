import { signal, computed } from "@preact/signals";
import { Rotur, performAuth, AuthError, ApiError } from "rotur-sdk";

// Rotur is the account layer behind Warpdrive: library, saves, friends.
//
// Sign in: with a registered Rotur app (VITE_ROTUR_APP=app_…) this is the
// SDK's OAuth `signIn()`. Without one it is `performAuth()`, which asks
// rotur.dev for a token scoped to the permissions below.

const APP = import.meta.env.VITE_ROTUR_APP || undefined;
// Only what the dashboard reads and writes. Managing the Rotur account itself
// (bio, avatar, badges) happens on rotur.dev, not here.
const PERMISSIONS = ["account:view", "friends:view", "storage:view", "storage:manage"];
/** Storage bag on the user's account that holds Warpdrive's own data. */
const STORAGE_ID = "warpdrive";

function safeStorage() {
  try {
    localStorage.setItem("__wd", "1");
    localStorage.removeItem("__wd");
    return localStorage;
  } catch {
    return undefined; // private mode etc: the SDK falls back to memory
  }
}

const ls = safeStorage();
export const rotur = new Rotur(APP ? { app: APP } : { storage: ls });

// The old site kept a raw account key under `rotur_token`. Carry it over once.
try {
  const legacy = ls?.getItem("rotur_token");
  if (legacy) {
    ls.removeItem("rotur_token");
    ls.removeItem("warpdrive_rotur_user");
    if (!rotur.token) rotur.setToken(legacy);
  }
} catch {}

/** Who is signed in, from the SDK: { id, username, name, avatar, profile } or null. */
export const user = signal(rotur.user);
/** The signed-in account's public profile (display name, banner, pronouns). */
export const profile = signal(null);
export const friends = signal(null); // usernames, once loaded
/** Warpdrive's own saved data on the account (best score, shell colour). */
export const saved = signal({});
export const authState = signal("idle"); // idle | waiting | error
export const authError = signal("");

export const signedIn = computed(() => !!user.value);
export const username = computed(() => user.value?.username || "");
export const displayName = computed(
  () => profile.value?.display_name || user.value?.name || username.value,
);

export const avatarUrl = (name, size = 128) =>
  name ? `https://avatars.rotur.dev/${encodeURIComponent(name)}?radius=128&s=${size}` : "";
export const profileUrl = (name) => "https://rotur.dev/@" + encodeURIComponent(name);

/** A message a person can read, from whatever the SDK threw. */
export function explain(e) {
  if (e instanceof AuthError) {
    return (
      {
        cancelled: "Sign in cancelled.",
        popup_closed: "The sign in window was closed.",
        popup_blocked: "Your browser blocked the sign in window. Allow popups for this site.",
        timeout: "Sign in timed out. Try again.",
      }[e.code] || e.message
    );
  }
  if (e instanceof ApiError) return e.message || "Rotur said no.";
  if (e instanceof TypeError) return "Could not reach Rotur. Check your connection.";
  return e?.message || "Something went wrong.";
}

/* ───────── public data, no sign in needed ───────── */

export const getProfile = (name) => rotur.profiles.get(name);
export const searchPosts = (q, limit = 8) => rotur.posts.search(q, limit);
export const userStats = () => rotur.stats.users();
/** Live presence: { presence, status, activities[] }. Public. */
export const liveStatus = (name) => rotur.status.get(name);
/** What the device showing `code` is asking for, or null once it expired. */
export const linkInfo = (code) => rotur.link.info(code);
export const linkUrl = (code) => "https://rotur.dev/link?code=" + encodeURIComponent(code);
export const ROTUR_ACCOUNT_URL = "https://rotur.dev/me";

/* ───────── signed in ───────── */

async function loadAccount() {
  const name = user.value?.username;
  if (!name) return;
  getProfile(name).then((p) => (profile.value = p), () => {});
  rotur.friends.list().then(
    (d) => (friends.value = d.friends || d.items || []),
    () => (friends.value = []),
  );
  rotur.storage.get(STORAGE_ID).then(
    (bag) => (saved.value = { ...bag?.data, ...saved.value }),
    () => {},
  );
}

rotur.onChange((u) => {
  const changed = u?.username !== user.value?.username;
  user.value = u;
  if (!u) {
    profile.value = friends.value = null;
    saved.value = {};
  } else if (changed || !profile.value) {
    loadAccount();
  }
});

export async function signIn() {
  authState.value = "waiting";
  authError.value = "";
  try {
    if (APP) await rotur.signIn();
    else {
      const res = await performAuth({ mode: "popup", requires: PERMISSIONS });
      rotur.setToken(res.token);
    }
    authState.value = "idle";
  } catch (e) {
    authState.value = "error";
    authError.value = explain(e);
  }
}

export const closeAuth = () => {
  authState.value = "idle";
  authError.value = "";
};

export const signOut = () => rotur.signOut();

/**
 * Save a value to the account's Warpdrive storage. Signed out, it only lives in
 * this browser. Failures are swallowed: this is a nicety, never a blocker.
 */
export function remember(key, value) {
  saved.value = { ...saved.value, [key]: value };
  try {
    ls?.setItem("wd_" + key, JSON.stringify(value));
  } catch {}
  if (user.value) rotur.storage.set(STORAGE_ID, key, value).catch(() => {});
}

/** Forget everything Warpdrive saved, on the account and in this browser. */
export async function forgetSaved() {
  for (const k of Object.keys(saved.value)) {
    try {
      ls?.removeItem("wd_" + k);
    } catch {}
  }
  saved.value = {};
  if (user.value) await rotur.storage.clear(STORAGE_ID);
}

/** Read a saved value: the account's copy when signed in, else this browser's. */
export function recall(key, fallback) {
  if (key in saved.value) return saved.value[key];
  try {
    const v = ls?.getItem("wd_" + key);
    return v == null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}
