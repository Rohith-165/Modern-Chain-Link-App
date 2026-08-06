/* ==========================================
   MODERN CHAIN LINK COMPANY - LOGIN JS (MODULE 1)
========================================== */

let selectedRole = "admin";

const roleSelectCard = document.getElementById("roleSelectCard");
const loginFormCard = document.getElementById("loginFormCard");
const loginTitle = document.getElementById("loginTitle");
const roleBadge = document.getElementById("roleBadge");

const username = document.getElementById("username");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const togglePassword = document.getElementById("togglePassword");
const togglePasswordIcon = document.getElementById("togglePasswordIcon");
const errorMessage = document.getElementById("errorMessage");

function selectRole(role) {
    selectedRole = role;
    localStorage.setItem("userRole", role);

    roleSelectCard.style.display = "none";
    loginFormCard.style.display = "block";
    errorMessage.innerHTML = "";
    password.value = "";

    if (role === "admin") {
        loginTitle.innerHTML = '<i class="fa-solid fa-user-shield color-primary"></i> Administrator Login';
        roleBadge.textContent = "Admin";
        roleBadge.style.cssText = "background: #f5fff8; color: #0b8f47; border: 1px solid #0b8f47;";
        username.placeholder = "Kumar@modernchainlink.com";
        username.value = "Kumar@modernchainlink.com";
    } else {
        loginTitle.innerHTML = '<i class="fa-solid fa-user-tie" style="color: #0284c7;"></i> Employee Login';
        roleBadge.textContent = "Employee";
        roleBadge.style.cssText = "background: #f0fdf4; color: #0284c7; border: 1px solid #0284c7;";
        username.placeholder = "Kavitha@modernchainlink.com";
        username.value = "Kavitha@modernchainlink.com";
    }
}

function backToRoleSelect() {
    loginFormCard.style.display = "none";
    roleSelectCard.style.display = "block";
    errorMessage.innerHTML = "";
}

togglePassword.addEventListener("click", function () {
    if (password.type === "password") {
        password.type = "text";
        togglePasswordIcon.className = "fa-solid fa-eye-slash";
    } else {
        password.type = "password";
        togglePasswordIcon.className = "fa-solid fa-eye";
    }
});

async function login() {
    const user = username.value.trim();
    const pass = password.value.trim();

    errorMessage.innerHTML = "";
    UI.clearFieldError(username);
    UI.clearFieldError(password);

    if (user === "" || pass === "") {
        errorMessage.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter Email and Password.';
        UI.warning("Please enter Email and Password");
        return;
    }

    UI.showLoader("Authenticating...");

    try {
        const data = await API.login(user, pass);
        UI.hideLoader();
        UI.success(`Welcome back, ${data.user?.full_name || 'User'}!`);
        setTimeout(() => {
            window.location.href = "home.html";
        }, 500);
    } catch (err) {
        UI.hideLoader();
        errorMessage.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${err.message}`;
        UI.error(err.message);
    }
}

loginBtn.addEventListener("click", login);

document.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && loginFormCard.style.display !== "none") {
        login();
    }
});