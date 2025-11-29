// js/analytics.js

document.addEventListener("DOMContentLoaded", () => {
  const revBookingsCanvas = document.getElementById("revBookingsChart");
  const userGrowthCanvas = document.getElementById("userGrowthChart");

  if (revBookingsCanvas) {
    new Chart(revBookingsCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Revenue ($)",
            data: [12000, 15000, 18000, 22000, 26000, 31000],
            tension: 0.35
          },
          {
            label: "Bookings",
            data: [180, 210, 240, 280, 320, 365],
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  if (userGrowthCanvas) {
    new Chart(userGrowthCanvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["W1", "W2", "W3", "W4", "W5", "W6"],
        datasets: [
          {
            label: "Active Users",
            data: [120, 140, 170, 200, 240, 280]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
});
