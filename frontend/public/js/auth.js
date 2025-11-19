
// frontend/public/js/auth.js

document.addEventListener("DOMContentLoaded", () => {
  const roleSelect = document.querySelector("[data-role]");
  if (!roleSelect) return;

  const extras = document.querySelectorAll("[data-extra]");

  const updateExtras = () => {
    extras.forEach((el) => {
      el.style.display = el.dataset.extra === roleSelect.value ? "block" : "none";
    });
  };

  roleSelect.addEventListener("change", updateExtras);
  updateExtras();
});
