import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // MAIN PAGES
        main: resolve(__dirname, 'index.html'),
        landing: resolve(__dirname, 'landing.html'),
        login: resolve(__dirname, 'login.html'),
        adminLogin: resolve(__dirname, 'admin-login.html'),
        adminPanel: resolve(__dirname, 'admin-panel.html'),
        calendar: resolve(__dirname, 'calendar.html'),
        messages: resolve(__dirname, 'messages.html'),
        payments: resolve(__dirname, 'payments.html'),
        profile: resolve(__dirname, 'profile.html'),
        platformAnalytics: resolve(__dirname, 'platform-analytics.html'),
        requests: resolve(__dirname, 'requests.html'),
        reviews: resolve(__dirname, 'reviews.html'),
        browseServices: resolve(__dirname, 'browse-services.html'),
        postedServices: resolve(__dirname, 'posted-services.html'),
        map: resolve(__dirname, 'map.html'),

        // SEEKER PAGES
        seekerBrowse: resolve(__dirname, 'seeker-browse-services.html'),
        seekerBooking: resolve(__dirname, 'seeker-booking.html'),
        seekerFavorites: resolve(__dirname, 'seeker-favorites.html'),
        seekerHome: resolve(__dirname, 'seeker-home.html'),
        seekerMessages: resolve(__dirname, 'seeker-messages.html'),

        // SIGNUP PAGES
        signupAdmin: resolve(__dirname, 'signup-admin.html'),
        signupProvider: resolve(__dirname, 'signup-provider.html'),
        signupSeeker: resolve(__dirname, 'signup-seeker.html'),
      }
    }
  }
});
