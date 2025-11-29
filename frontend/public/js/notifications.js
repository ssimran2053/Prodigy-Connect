// js/notifications.js

const mockNotifications = [
  {
    id: 1,
    title: "New booking request",
    text: "Alex requested a cleaning service for tomorrow at 10:00.",
    timestamp: "2 min ago",
    read: false,
    type: "booking_request"
  },
  {
    id: 2,
    title: "Booking accepted",
    text: "Your plumbing service booking has been accepted.",
    timestamp: "1 hour ago",
    read: true,
    type: "booking_accepted"
  },
  {
    id: 3,
    title: "New message",
    text: "You have a new message from Sarah.",
    timestamp: "Yesterday",
    read: false,
    type: "message"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const bellBtn = document.getElementById("notifBellBtn");
  const badge = document.getElementById("notifBadge");
  const dropdown = document.getElementById("notifDropdown");
  const list = document.getElementById("notifList");
  const markAllBtn = document.getElementById("notifMarkAllBtn");

  if (!bellBtn || !badge || !dropdown || !list) return;

  let notifications = [...mockNotifications];

  function renderNotifications() {
    list.innerHTML = "";

    if (!notifications.length) {
      list.innerHTML = `<div class="notif-empty">No notifications yet.</div>`;
      badge.hidden = true;
      return;
    }

    const unreadCount = notifications.filter(n => !n.read).length;
    badge.hidden = unreadCount === 0;
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? "9+" : String(unreadCount);
    }

    notifications.forEach(n => {
      const item = document.createElement("div");
      item.className = `notif-item ${n.read ? "read" : "unread"}`;
      item.dataset.id = n.id;

      item.innerHTML = `
        <div class="notif-bullet"></div>
        <div class="notif-content">
          <div class="notif-title">${n.title}</div>
          <div class="notif-meta">${n.text}</div>
          <div class="notif-meta">${n.timestamp}</div>
          <div class="notif-actions">
            ${
              n.type === "booking_request"
                ? '<button class="notif-action-btn" data-action="view-booking">View booking</button>'
                : ""
            }
          </div>
        </div>
      `;

      item.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (btn && btn.dataset.action === "view-booking") {
          window.location.href = "requests.html"; // adjust route as needed
          return;
        }

        markNotificationAsRead(n.id);
      });

      list.appendChild(item);
    });
  }

  function markNotificationAsRead(id) {
    notifications = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    renderNotifications();

    // TODO: backend: POST /api/notifications/:id/seen
    // fetch(`/api/notifications/${id}/seen`, { method: "POST" });
  }

  function markAllAsRead() {
    notifications = notifications.map(n => ({ ...n, read: true }));
    renderNotifications();

    // TODO: backend: POST /api/notifications/seen
    // fetch(`/api/notifications/seen`, { method: "POST" });
  }

  bellBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && !bellBtn.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });

  markAllBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    markAllAsRead();
  });

  renderNotifications();
});
