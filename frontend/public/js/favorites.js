// js/favorites.js

document.addEventListener("DOMContentLoaded", () => {
  const favButtons = document.querySelectorAll(".fav-btn");

  favButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isActive = btn.classList.toggle("active");
      const listingId = btn.dataset.id;

      // TODO: integrate with backend favorites API
      // const method = isActive ? "POST" : "DELETE";
      // fetch(`/api/favorites/${listingId}`, { method });

      console.log(
        isActive
          ? `Added ${listingId} to favorites`
          : `Removed ${listingId} from favorites`
      );
    });
  });
});
