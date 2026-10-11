import { goPage } from "./navigation.js";

const roturAcct = (() => {
  const TOKEN_KEY = "rotur_token";
  const API = "https://api.rotur.dev";
  const WS_URL = "wss://ws.rotur.dev";
  let loggedIn = false,
    username = "",
    userData = null,
    editing = false;
  let ws = null,
    wsAuthed = false,
    wsReconnectTimer = null,
    avatarCacheBust = 0;
  let authPopup = null,
    popupPollInterval = null;

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  function send(obj) {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  }

  function connectWS() {
    const token = getToken();
    if (!token || !username) return;
    if (
      ws &&
      (ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING)
    )
      return;
    wsAuthed = false;
    try {
      ws = new WebSocket(WS_URL);
    } catch (e) {
      return;
    }

    ws.onopen = () =>
      send({
        cmd: "handshake",
        val: { language: "Javascript", version: { editorType: "Warpdrive" } },
      });
    ws.onmessage = (evt) => {
      let data;
      try {
        data = JSON.parse(evt.data);
      } catch (e) {
        return;
      }
      if (!wsAuthed && data.cmd === "statuscode" && data.code_id === 100) {
        send({ cmd: "link", val: ["roturTW"] });
        setTimeout(
          () =>
            send({
              cmd: "direct",
              val: { cmd: "auth", val: token },
              id: "sys-rotur",
            }),
          200,
        );
      }
      if (
        data.cmd === "direct" &&
        data.origin === "sys-rotur" &&
        data.val &&
        data.val.cmd === "auth" &&
        data.val.val === true
      ) {
        wsAuthed = true;
      }
      if (data.cmd === "ulist" && !wsAuthed)
        send({ cmd: "setid", val: username });
    };
    ws.onclose = () => {
      wsAuthed = false;
      if (loggedIn && username) {
        clearTimeout(wsReconnectTimer);
        wsReconnectTimer = setTimeout(connectWS, 8000);
      }
    };
    ws.onerror = () => {};
  }

  function disconnectWS() {
    clearTimeout(wsReconnectTimer);
    wsAuthed = false;
    if (ws) {
      try {
        ws.close();
      } catch (e) {}
      ws = null;
    }
  }

  function avatarUrl(user, size) {
    if (!user) return "";
    let url =
      "https://avatars.rotur.dev/" + encodeURIComponent(user) + "?radius=128";
    if (size) url += "&s=" + size;
    if (avatarCacheBust) url += "&_=" + avatarCacheBust;
    return url;
  }
  const getBio = () => (userData && userData.bio ? userData.bio : "");

  function fetchUserData(token) {
    if (!token) return;
    fetch(API + "/get_user?auth=" + encodeURIComponent(token))
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          userData = data;
          username = data.username || data.display_name || "";
          localStorage.setItem("warpdrive_rotur_user", username);
          updateUI();
          updateAccountPage();
          connectWS();
        }
      })
      .catch(() => {});
  }

  function updateUI() {
    const navLabel = document.getElementById("navAcctLabel");
    const navBtn = document.getElementById("navAcctBtn");
    const mobileBtn = document.getElementById("mobileAcctBtn");
    const dropdownName = document.getElementById("dropdownName");
    const navAcctLink = document.getElementById("navAcctLink");
    if (!navBtn) return;

    if (loggedIn && username) {
      const src = avatarUrl(username, 64);
      let av = navBtn.querySelector(".acct-avatar");
      if (!av) {
        const svg = navBtn.querySelector("svg");
        av = document.createElement("div");
        av.className = "acct-avatar";
        if (svg) svg.replaceWith(av);
        else navBtn.prepend(av);
      }
      av.style.backgroundImage = "url(" + src + ")";
      av.style.backgroundSize = "cover";
      av.style.backgroundPosition = "center";
      navLabel.textContent = username;
      if (mobileBtn) mobileBtn.textContent = username;
      if (dropdownName) dropdownName.textContent = username;
      if (navAcctLink) navAcctLink.style.display = "";
    } else {
      const av = navBtn.querySelector(".acct-avatar");
      if (av) {
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg",
        );
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "1.5");
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");
        svg.innerHTML =
          '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>';
        av.replaceWith(svg);
      }
      navLabel.textContent = "Sign In";
      if (mobileBtn) mobileBtn.textContent = "Sign In";
      if (navAcctLink) navAcctLink.style.display = "none";
    }
  }

  function updateAccountPage() {
    const profileName = document.getElementById("acctProfileName");
    if (!profileName) return;
    const profileSub = document.getElementById("acctProfileSub");
    const bigAvatar = document.getElementById("acctBigAvatar");
    const bigAvatarImg = document.getElementById("acctBigAvatarImg");
    const pfpEdit = document.getElementById("acctPfpEdit");
    const bioEl = document.getElementById("acctBio");
    const notLogged = document.getElementById("acctNotLogged");
    const signInBtn = document.getElementById("acctSignInBtn");
    const logoutBtn = document.getElementById("acctLogoutBtn");
    const editBtn = document.getElementById("acctEditBtn");
    const editWrap = document.getElementById("acctEditWrap");
    const actions = document.getElementById("acctProfileActions");

    if (loggedIn && username) {
      profileName.textContent =
        userData && userData.display_name ? userData.display_name : username;
      profileSub.textContent = "@" + username;
      if (bigAvatarImg) {
        bigAvatarImg.src = avatarUrl(username, 256);
        bigAvatarImg.alt = username;
        bigAvatarImg.style.display = "";
      }
      if (bigAvatar) bigAvatar.style.display = "none";
      if (pfpEdit) pfpEdit.style.display = "";
      const bio = getBio();
      if (bioEl && !editing) {
        bioEl.textContent = bio;
        bioEl.style.display = bio ? "" : "none";
      }
      if (notLogged) notLogged.style.display = "none";
      if (signInBtn) signInBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "";
      if (editBtn) editBtn.style.display = "";
      if (!editing && editWrap) editWrap.style.display = "none";
      if (!editing && actions) actions.style.display = "";
    } else {
      profileName.textContent = "Not signed in";
      profileSub.textContent = "Sign in with Rotur to see your profile";
      if (bigAvatar) {
        bigAvatar.style.display = "";
        bigAvatar.textContent = "?";
      }
      if (bigAvatarImg) bigAvatarImg.style.display = "none";
      if (pfpEdit) pfpEdit.style.display = "none";
      if (bioEl) bioEl.style.display = "none";
      if (notLogged) notLogged.style.display = "";
      if (signInBtn) signInBtn.style.display = "";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (editBtn) editBtn.style.display = "none";
      if (editWrap) editWrap.style.display = "none";
    }
  }

  function startEdit() {
    editing = true;
    const editWrap = document.getElementById("acctEditWrap");
    const actions = document.getElementById("acctProfileActions");
    const bioEl = document.getElementById("acctBio");
    const bioInput = document.getElementById("acctEditBio");
    const status = document.getElementById("acctEditStatus");
    if (editWrap) editWrap.style.display = "";
    if (actions) actions.style.display = "none";
    if (bioEl) bioEl.style.display = "none";
    if (bioInput) bioInput.value = getBio();
    if (status) {
      status.textContent = "";
      status.className = "acct-edit-status";
    }
  }

  function cancelEdit() {
    editing = false;
    const editWrap = document.getElementById("acctEditWrap");
    const actions = document.getElementById("acctProfileActions");
    if (editWrap) editWrap.style.display = "none";
    if (actions) actions.style.display = "";
    updateAccountPage();
  }

  async function saveProfile() {
    const token = getToken();
    if (!token) return;
    const bioInput = document.getElementById("acctEditBio");
    const status = document.getElementById("acctEditStatus");
    const newBio = bioInput ? bioInput.value.trim() : "";
    if (status) {
      status.textContent = "Saving";
      status.className = "acct-edit-status";
    }
    try {
      const res = await fetch(API + "/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "bio", value: newBio, auth: token }),
      });
      const result = await res.json();
      if (result.error) {
        if (status) {
          status.textContent = result.error;
          status.className = "acct-edit-status err";
        }
      } else {
        if (status) {
          status.textContent = "Bio updated";
          status.className = "acct-edit-status ok";
        }
        fetchUserData(token);
        setTimeout(cancelEdit, 1200);
      }
    } catch (e) {
      if (status) {
        status.textContent = "Could not reach Rotur. Try again.";
        status.className = "acct-edit-status err";
      }
    }
  }

  function handlePfpFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const token = getToken();
    if (!token) return;
    const status = document.getElementById("acctEditStatus");
    if (!editing) startEdit();
    if (status) {
      status.textContent = "Uploading avatar";
      status.className = "acct-edit-status";
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      let ok = false;
      try {
        const res = await fetch(API + "/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "pfp", value: base64, auth: token }),
        });
        const result = await res.json();
        if (!result.error) ok = true;
        else if (status) {
          status.textContent = result.error;
          status.className = "acct-edit-status err";
        }
      } catch (e1) {}
      if (!ok) {
        try {
          const res2 = await fetch(API + "/me/update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ key: "pfp", value: base64 }),
          });
          const result2 = await res2.json();
          if (!result2.error) ok = true;
          else if (status) {
            status.textContent = result2.error;
            status.className = "acct-edit-status err";
          }
        } catch (e2) {
          if (status) {
            status.textContent = "Upload failed. Try a smaller image.";
            status.className = "acct-edit-status err";
          }
        }
      }
      if (ok) {
        if (status) {
          status.textContent = "Avatar updated";
          status.className = "acct-edit-status ok";
        }
        avatarCacheBust = Date.now();
        fetchUserData(token);
        setTimeout(cancelEdit, 1200);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function openAuthPopup() {
    const w = 480,
      h = 620;
    const left = Math.max(0, (screen.width - w) / 2 + (screen.availLeft || 0));
    const top = Math.max(0, (screen.height - h) / 2 + (screen.availTop || 0));
    authPopup = window.open(
      "https://rotur.dev/auth",
      "rotur_auth",
      "width=" +
        w +
        ",height=" +
        h +
        ",left=" +
        left +
        ",top=" +
        top +
        ",resizable=yes,scrollbars=yes",
    );
    clearInterval(popupPollInterval);
    popupPollInterval = setInterval(() => {
      if (authPopup && authPopup.closed) {
        clearInterval(popupPollInterval);
        authPopup = null;
        closeModal();
      }
    }, 500);
  }
  function reopenPopup() {
    if (authPopup && !authPopup.closed) {
      authPopup.focus();
      return;
    }
    openAuthPopup();
  }
  function openModal() {
    document.getElementById("roturAuthOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
    openAuthPopup();
  }
  function closeModal() {
    document.getElementById("roturAuthOverlay").classList.remove("open");
    document.body.style.overflow = "";
    clearInterval(popupPollInterval);
    if (authPopup && !authPopup.closed) authPopup.close();
    authPopup = null;
  }

  function handleAuthMessage(event) {
    if (event.origin !== "https://rotur.dev") return;
    if (event.data && event.data.type === "rotur-auth-token") {
      localStorage.setItem(TOKEN_KEY, event.data.token);
      loggedIn = true;
      updateUI();
      closeModal();
      fetchUserData(event.data.token);
    }
  }

  function toggle() {
    if (loggedIn)
      document.getElementById("acctDropdown").classList.toggle("open");
    else openModal();
  }
  function mobileToggle() {
    const mm = document.getElementById("mobileMenu");
    const hb = document.getElementById("hamburger");
    if (mm && mm.classList.contains("open")) {
      mm.classList.remove("open");
      if (hb) hb.classList.remove("open");
      document.body.style.overflow = "";
    }
    if (loggedIn) goPage("account");
    else openModal();
  }
  function logout() {
    disconnectWS();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("warpdrive_rotur_user");
    loggedIn = false;
    username = "";
    userData = null;
    editing = false;
    updateUI();
    updateAccountPage();
    document.getElementById("acctDropdown").classList.remove("open");
  }

  function init() {
    const token = getToken();
    if (token) {
      loggedIn = true;
      username = localStorage.getItem("warpdrive_rotur_user") || "";
      if (username) updateUI();
      fetchUserData(token);
    }
    updateAccountPage();
    window.addEventListener("message", handleAuthMessage);
    document.addEventListener("click", (e) => {
      const dd = document.getElementById("acctDropdown");
      const btn = document.getElementById("navAcctBtn");
      if (dd && btn && !dd.contains(e.target) && !btn.contains(e.target))
        dd.classList.remove("open");
    });
    const pfpFile = document.getElementById("acctPfpFile");
    if (pfpFile) pfpFile.addEventListener("change", handlePfpFile);
    const overlay = document.getElementById("roturAuthOverlay");
    if (overlay)
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
      });
  }
  init();

  return {
    toggle,
    mobileToggle,
    openModal,
    closeModal,
    reopenPopup,
    logout,
    startEdit,
    cancelEdit,
    saveProfile,
  };
})();

const roturActions = {
  toggle: () => roturAcct.toggle(),
  mobileToggle: () => roturAcct.mobileToggle(),
  openModal: () => roturAcct.openModal(),
  closeModal: () => roturAcct.closeModal(),
  reopenPopup: () => roturAcct.reopenPopup(),
  logout: () => roturAcct.logout(),
  startEdit: () => roturAcct.startEdit(),
  cancelEdit: () => roturAcct.cancelEdit(),
  saveProfile: () => roturAcct.saveProfile(),
};

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const trigger = event.target.closest("[data-rotur-action]");
  if (!trigger) return;
  const action = roturActions[trigger.dataset.roturAction];
  if (!action) return;
  if (trigger instanceof HTMLAnchorElement) event.preventDefault();
  action();
});
