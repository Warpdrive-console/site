import { useEffect, useState } from "preact/hooks";
import { useInView, useCountUp, fmt } from "../lib/hooks.jsx";
import { signedIn, user, displayName, signIn, searchPosts, userStats, avatarUrl, profileUrl } from "../lib/rotur.js";
import { href } from "../lib/router.js";

export function ago(ms) {
  const s = Math.max(1, (Date.now() - ms) / 1000);
  for (const [n, u] of [
    [31536000, "y"],
    [2592000, "mo"],
    [604800, "w"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ])
    if (s >= n) return Math.floor(s / n) + u;
  return Math.floor(s) + "s";
}

function LivePanel() {
  const [ref, seen] = useInView();
  const [total, setTotal] = useState(null);
  const [posts, setPosts] = useState(null);
  useEffect(() => {
    if (!seen) return;
    userStats().then((s) => setTotal(s.total_users), () => setTotal(0));
    searchPosts("warpdrive", 6).then(
      (p) => setPosts(p.filter((x) => x.content?.trim()).slice(0, 3)),
      () => setPosts([]),
    );
  }, [seen]);
  const n = useCountUp(total || 0, !!total);

  return (
    <div class="live" ref={ref}>
      <p class="live-count">
        <b>{total == null ? "…" : total ? fmt(n) : "Thousands of"}</b> people already have a Rotur
        account.
      </p>
      {posts && posts.length > 0 && (
        <div class="live-posts">
          <h3 class="live-sub">What people are saying about Warpdrive on Rotur</h3>
          {posts.map((p) => {
            const name = p.author?.username || p.user;
            return (
              <a key={p.id} class="post" href={profileUrl(name)} target="_blank" rel="noopener">
                <img class="avatar" src={p.author?.avatar_url || avatarUrl(name, 64)} alt="" width="40" height="40" loading="lazy" />
                <span class="post-body">
                  <span class="post-meta">
                    <b>{p.author?.display_name || name}</b> <span>{ago(p.timestamp)} ago</span>
                  </span>
                  <span class="post-text">{p.content}</span>
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function RoturBand() {
  return (
    <section class="sec" id="rotur">
      <div class="wrap rotur-grid">
        <div>
          <h2 class="h2">One account for all of it</h2>
          <p class="lede">
            Your Warpdrive signs in with a <strong>Rotur</strong> account. Your library, saves and
            friends come with you to every console you own, so the handheld and the TV feel like
            two halves of one thing.
          </p>
          <ul class="plain-list">
            <li>Games you buy, on disc or as a download, go into one library.</li>
            <li>Stop on the handheld, carry on from the same save on the TV.</li>
            <li>Handheld and console players share the same friends and lobbies.</li>
          </ul>

          {signedIn.value ? (
            <div class="me-card">
              <img class="avatar" src={avatarUrl(user.value.username, 96)} alt="" width="48" height="48" />
              <p>
                You're signed in as <b>{displayName.value}</b>. Your Dorito Drop score and shell
                colour already sync.
              </p>
              <a class="btn btn-quiet sm" href={href("account")}>
                Open your dashboard
              </a>
            </div>
          ) : (
            <div class="rotur-cta">
              <button class="btn" onClick={signIn}>
                Sign in with Rotur
              </button>
              <p class="small">No account yet? You can make one in the sign in window.</p>
            </div>
          )}
        </div>
        <LivePanel />
      </div>
    </section>
  );
}
