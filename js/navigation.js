/* ==========================================
   MODERN CHAIN LINK COMPANY - NAVIGATION JS
========================================== */

document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname.split("/").pop() || "home.html";
    const navItems = document.querySelectorAll(".navItem");

    navItems.forEach(function (item) {
        item.classList.remove("active");
        const href = item.getAttribute("href");
        if (href === path) {
            item.classList.add("active");
        }
    });
});

function goToPage(page) {
    window.location.href = page;
}

async function logout() {
    const confirmed = await UI.confirm(
        "Logout",
        "Are you sure you want to log out of Modern Chain Link Company?",
        "Log Out",
        "Cancel"
    );

    if (confirmed) {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("adminName");
        UI.success("Logged out successfully");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 500);
    }
}