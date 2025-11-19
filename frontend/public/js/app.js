// frontend/public/js/app.js

document.addEventListener("DOMContentLoaded", () => {
  const headerHost = document.getElementById("header");
  const sidebarHost = document.getElementById("sidebar");
  const footerHost = document.getElementById("footer");

  // Load header partial
  if (headerHost) {
    fetch("partials/header.html")
      .then((res) => res.text())
      .then((html) => (headerHost.innerHTML = html))
      .catch(console.error);
  }

  // Load sidebar partial + set active link
  if (sidebarHost) {
    fetch("partials/sidebar.html")
      .then((res) => res.text())
      .then((html) => {
        sidebarHost.innerHTML = html;
        setActiveSidebarLink();
      })
      .catch(console.error);
  }

  // Load footer partial
  if (footerHost) {
    fetch("partials/footer.html")
      .then((res) => res.text())
      .then((html) => (footerHost.innerHTML = html))
      .catch(console.error);
  }

  initServiceActions();
  initRequestTabs();
  initMessageDemo();
  initCalendarDemo();
  initNotifDot();
});

// Highlight current page in sidebar
function setActiveSidebarLink() {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const links = document.querySelectorAll("#sidebar a");
  links.forEach((a) => {
    const href = (a.getAttribute("href") || "").split("/").pop().toLowerCase();
    a.classList.toggle("active", href === path);
  });
}

/* ===============================
   SERVICE CARD ACTIONS (pause/edit/delete)
   =============================== */
function initServiceActions() {
  // Pattern 1: .service-card with [data-service-action]
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-service-action]");
    if (!btn) return;

    const action = btn.dataset.serviceAction;
    const card = btn.closest(".service-card");
    if (!card) return;

    switch (action) {
      case "pause": {
        const isPaused = card.classList.toggle("paused");
        const status = card.querySelector(".status");
        if (status) {
          status.classList.toggle("active", !isPaused);
          status.classList.toggle("paused", isPaused);
          status.textContent = isPaused ? "Paused" : "Active";
        }
        btn.textContent = isPaused ? "Activate" : "Pause";
        break;
      }
      case "delete": {
        if (confirm("Are you sure you want to delete this service?")) {
          card.style.opacity = "0";
          setTimeout(() => card.remove(), 250);
        }
        break;
      }
      case "edit": {
        alert("Edit service: front-end only demo.");
        break;
      }
    }
  });

  // Pattern 2: inside .service-grid with [data-action]
  const serviceGrid = document.querySelector(".service-grid");
  if (serviceGrid) {
    serviceGrid.addEventListener("click", (event) => {
      const btn = event.target.closest("button");
      if (!btn) return;

      const action = btn.dataset.action;
      const card = btn.closest(".service-card");
      if (!card) return;

      if (action === "toggle-pause") {
        const isPaused = card.classList.toggle("paused");
        const chip = card.querySelector(".pill-success");
        if (chip) {
          chip.textContent = isPaused ? "Paused" : "Active";
        }
        btn.textContent = isPaused ? "Activate" : "Pause";
      }

      if (action === "delete") {
        const confirmed = window.confirm("Delete this service listing?");
        if (confirmed) {
          card.remove();
        }
      }

      if (action === "edit") {
        alert("Edit service: this is just a static demo.");
      }
    });
  }
}

/* ===============================
   REQUESTS TABS FILTERING
   =============================== */
function initRequestTabs() {
  const requestTabs = document.querySelectorAll(".request-tab, .requests-tab");
  const requestCards = document.querySelectorAll(".request-card");

  if (!requestTabs.length || !requestCards.length) return;

  requestTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const filter = tab.dataset.filter || "all";

      // remove/add active on siblings with same parent
      const parent = tab.parentElement;
      if (parent) {
        parent
          .querySelectorAll("button")
          .forEach((t) => t.classList.remove("active"));
      }
      tab.classList.add("active");

      requestCards.forEach((card) => {
        const status = card.dataset.status;
        card.style.display =
          filter === "all" || filter === status ? "block" : "none";
      });
    });
  });
}

/* ===============================
   MESSAGES DEMO (provider / admin)
   =============================== */
function initMessageDemo() {
  const messageThreads = document.querySelectorAll(".message-thread");
  const messageHistory = document.querySelector(".message-history");
  const messageInput = document.querySelector("#message-input");
  const sendBtn = document.querySelector("#send-message");
  const chatUserName = document.querySelector(".chat-user-name");

  if (messageThreads.length) {
    messageThreads.forEach((thread) => {
      thread.addEventListener("click", () => {
        const name = thread.dataset.name;
        const lastText = thread.dataset.last;

        messageThreads.forEach((t) => t.classList.remove("active"));
        thread.classList.add("active");

        if (chatUserName) chatUserName.textContent = name;

        if (messageHistory) {
          messageHistory.innerHTML = "";
          const incoming = document.createElement("div");
          incoming.className = "msg incoming";
          incoming.textContent = lastText;
          messageHistory.appendChild(incoming);
        }
      });
    });
  }

  if (sendBtn && messageHistory && messageInput) {
    sendBtn.addEventListener("click", () => {
      const text = messageInput.value.trim();
      if (!text) return;

      const outgoing = document.createElement("div");
      outgoing.className = "msg outgoing";
      outgoing.textContent = text;
      messageHistory.appendChild(outgoing);
      messageInput.value = "";

      messageHistory.scrollTop = messageHistory.scrollHeight;

      setTimeout(() => {
        const reply = document.createElement("div");
        reply.className = "msg incoming";
        reply.textContent = "Thanks! I'll reply soon.";
        messageHistory.appendChild(reply);
        messageHistory.scrollTop = messageHistory.scrollHeight;
      }, 800);
    });
  }
}

/* ===============================
   CALENDAR DEMO
   =============================== */
function initCalendarDemo() {
  const calendarDays = document.querySelectorAll(".calendar-day");
  const appointmentContainer = document.querySelector(".appointments");

  if (!calendarDays.length || !appointmentContainer) return;

  calendarDays.forEach((day) => {
    day.addEventListener("click", () => {
      calendarDays.forEach((d) => d.classList.remove("selected"));
      day.classList.add("selected");

      const date = day.dataset.date || day.textContent.trim();
      appointmentContainer.innerHTML = `
        <h3>Appointments for ${date}</h3>
        <div class="appointment-card">
          <strong>2:00 PM</strong> – Water Heater Installation
        </div>
        <div class="appointment-card">
          <strong>4:30 PM</strong> – Kitchen Sink Inspection
        </div>
      `;
    });
  });
}

/* ===============================
   SIMPLE NOTIF DOT HIDING
   =============================== */
function initNotifDot() {
  const notifBtn = document.querySelector("#notif-btn");
  const notifDot = document.querySelector("#notif-dot");

  if (!notifBtn || !notifDot) return;

  notifBtn.addEventListener("click", () => {
    notifDot.style.display = "none";
  });
}
