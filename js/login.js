/* ==========================================
   MODERN CHAIN LINK COMPANY - LOGIN JS (MODULE 1)
========================================== */

const username = document.getElementById("username");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const togglePassword = document.getElementById("togglePassword");
const togglePasswordIcon = document.getElementById("togglePasswordIcon");
const errorMessage = document.getElementById("errorMessage");

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
        await API.login(user, pass);
        UI.hideLoader();
        UI.success("Login Successful!");
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
    if (event.key === "Enter") {
        login();
    }
});