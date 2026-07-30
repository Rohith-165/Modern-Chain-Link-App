/* ==========================================
   MODERN CHAIN LINK COMPANY
   SPLASH SCREEN
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    // Wait for 3 seconds
    setTimeout(function () {

        // Check login status
        const isLoggedIn = localStorage.getItem("isLoggedIn");

        if (isLoggedIn === "true") {

            window.location.href = "home.html";

        } else {

            window.location.href = "login.html";

        }

    }, 3000);

});