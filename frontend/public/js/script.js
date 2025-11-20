// Modal open/close
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const reviewsModal = document.getElementById("reviewsModal");

function openModal() {
  reviewsModal.classList.add("is-open");
}

function closeModal() {
  reviewsModal.classList.remove("is-open");
}

openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);

reviewsModal.addEventListener("click", (e) => {
  if (e.target === reviewsModal) closeModal();
});

// Tabs inside modal
const tabButtons = document.querySelectorAll(".tab");
const tabPanels = {
  details: document.getElementById("tab-details"),
  reviews: document.getElementById("tab-reviews"),
};

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");

    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    Object.keys(tabPanels).forEach((key) => {
      tabPanels[key].classList.toggle("active", key === tab);
    });
  });
});
