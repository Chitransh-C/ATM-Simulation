const BASE_URL = "https://atm-simul.onrender.com";
 // Replace with your backend URL

window.onload = () => {
  const path = window.location.pathname;

  if (path.includes("dashboard.html")) {
    loadDashboard();
  } else {
    loadHome();
  }
};

function loadHome() {
  // Attach dynamic screen or show default buttons if not already shown
  if (document.getElementById("main")) {
    goBack();
  }
}

function showLogin() {
  document.getElementById("main").innerHTML = `
    <h2>Login</h2>
    <input type="password" id="loginPin" placeholder="Enter 4-digit PIN" maxlength="4">
    <button onclick="login()">Login</button>
    <button onclick="goBack()">Back</button>
    <p id="message"></p>
  `;
}

function showSignup() {
  document.getElementById("main").innerHTML = `
    <h2>Create Account</h2>
    <input type="text" id="name" placeholder="Enter your name"><br>
    <input type="password" id="signupPin" placeholder="Choose a 4-digit PIN" maxlength="4"><br>
    <input type="number" id="balance" placeholder="Initial balance"><br>
    <button onclick="signup()">Create Account</button>
    <button onclick="goBack()">Back</button>
    <p id="message"></p>
  `;
}

function goBack() {
  document.getElementById("main").innerHTML = `
    <h2>Welcome to ATM Simulator</h2>
    <button onclick="showLogin()">Login</button>
    <button onclick="showSignup()">Create Account</button>
  `;
}

function login() {
  const pin = document.getElementById("loginPin").value;

  fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        localStorage.setItem("userPin", pin);
        localStorage.setItem("userId", data.user_id);
        window.location.href = "dashboard.html";
      } else {
        document.getElementById("message").innerText = data.message;
      }
    })
    .catch(() => {
      document.getElementById("message").innerText = "Network error.";
    });
}

function signup() {
  const name = document.getElementById("name").value.trim();
  const pin = document.getElementById("signupPin").value;
  const balance = parseFloat(document.getElementById("balance").value);

  if (!name || pin.length !== 4 || isNaN(pin) || isNaN(balance) || balance < 0) {
    document.getElementById("message").innerText = "Please enter valid details.";
    return;
  }

  fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, pin, balance })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("message").innerText = data.message;
      if (data.status === "success") setTimeout(goBack, 1500);
    })
    .catch(() => {
      document.getElementById("message").innerText = "Network error.";
    });
}

// ==== Dashboard ====

function loadDashboard() {
  const pin = localStorage.getItem("userPin");
  if (!pin) {
    alert("Not logged in.");
    window.location.href = "index.html";
    return;
  }

  fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        // Show name and pin
        const pinSpan = document.getElementById("userPin");
        const nameSpan = document.getElementById("userName");
        const balSpan = document.getElementById("balance");

        if (pinSpan) pinSpan.innerText = pin;
        if (nameSpan) nameSpan.innerText = data.name;
        if (balSpan) balSpan.innerText = data.balance.toFixed(2);

        // Attach event handlers
        const depositBtn = document.querySelector("button[onclick='deposit()']");
        const withdrawBtn = document.querySelector("button[onclick='withdraw()']");
        const historyBtn = document.querySelector("button[onclick='viewHistory()']");

        if (depositBtn) depositBtn.onclick = deposit;
        if (withdrawBtn) withdrawBtn.onclick = withdraw;
        if (historyBtn) historyBtn.onclick = viewHistory;
      } else {
        alert("Session expired or invalid PIN.");
        window.location.href = "index.html";
      }
    })
    .catch(() => {
      alert("Error connecting to server.");
    });
}


function deposit() {
  const pin = localStorage.getItem("userPin");
  const amt = parseFloat(document.getElementById("amount").value);
  if (isNaN(amt) || amt <= 0) return alert("Enter a valid amount");

  fetch(`${BASE_URL}/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin, amount: amt })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Deposited successfully");
      loadBalance();
    });
}

function withdraw() {
  const pin = localStorage.getItem("userPin");
  const amt = parseFloat(document.getElementById("amount").value);
  if (isNaN(amt) || amt <= 0) return alert("Enter a valid amount");

  fetch(`${BASE_URL}/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin, amount: amt })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        alert("Withdrawn successfully");
        loadBalance();
      } else {
        alert(data.message);
      }
    });
}

function viewHistory() {
  const pin = localStorage.getItem("userPin");
  fetch(`${BASE_URL}/history/${pin}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        const html = data.transactions.map(t =>
          `<p>${t[2]} - ${t[0]} - ₹${t[1]}</p>`
        ).join('');
        const historyDiv = document.getElementById("history");
        if (historyDiv) historyDiv.innerHTML = "<h3>Transaction History:</h3>" + html;
      }
    });
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
