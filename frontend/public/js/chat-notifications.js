// js/chat-notifications.js

document.addEventListener("DOMContentLoaded", () => {
  const badge = document.getElementById("msgBadge");
  const snackbar = document.getElementById("msgSnackbar");

  if (!badge || !snackbar) return;

  let unreadCount = 0;

  function updateBadge() {
    if (unreadCount <= 0) {
      badge.hidden = true;
      return;
    }
    badge.hidden = false;
    badge.textContent = unreadCount > 9 ? "9+" : String(unreadCount);
  }

  function showSnackbar(message) {
    snackbar.textContent = message || "New message received";
    snackbar.classList.add("show");
    setTimeout(() => snackbar.classList.remove("show"), 2500);
  }

  // Simulate a new incoming message after 4s (demo)
  // Later, replace this with your WebSocket / polling event
  setTimeout(() => {
    unreadCount += 1;
    updateBadge();
    showSnackbar("New message from Alex");
  }, 4000);

  // Example: if you're on messages.html, you might clear unread
  if (window.location.pathname.endsWith("messages.html")) {
    unreadCount = 0;
    updateBadge();
  }

  // TODO: hook this into your real-time messaging:
  // onNewMessage(() => { unreadCount++; updateBadge(); showSnackbar("New message"); });
});
