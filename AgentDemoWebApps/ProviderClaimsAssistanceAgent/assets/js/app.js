/* ============================================================
   healthEdge AI — Provider Claims Assistance
   Login gate + dashboard tab-switching logic.
   Depends on heAI_DATA from assets/js/data.js.
   ============================================================ */

(function () {
  "use strict";

  // Small helper: turn "Under Review" -> "underreview", "Denied" -> "denied"
  // so we can map arbitrary status text to a CSS class.
  function slug(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function statusPillHTML(status) {
    return '<span class="status-pill status-' + slug(status) + '">' + status + "</span>";
  }

  /* ============================================================
     LOGIN PAGE LOGIC (index.html)
     ============================================================ */
  function initLoginPage() {
    const form = document.getElementById("loginForm");
    if (!form) return; // not on the login page

    // Populate "Try asking..." prompts from data.js
    const list = document.getElementById("tryAskingList");
    if (list && Array.isArray(heAI_DATA.samplePrompts)) {
      heAI_DATA.samplePrompts.forEach(function (prompt) {
        const li = document.createElement("li");
        li.textContent = prompt;
        list.appendChild(li);
      });
    }

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorEl = document.getElementById("formError");

    form.addEventListener("submit", function (evt) {
      evt.preventDefault();

      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      // Basic required-field validation
      if (!username || !password) {
        showError("Please enter both a username and password.");
        return;
      }

      const creds = heAI_DATA.credentials || {
        username: "claims.support",
        password: "Demo@123"
      };

      if (username === creds.username && password === creds.password) {
        sessionStorage.setItem("heAI_authenticated", "true");
        sessionStorage.setItem("heAI_agent", "ProviderClaimsAssistanceAgent");
        sessionStorage.setItem("heAI_username", username);
        window.location.href = "dashboard.html";
      } else {
        showError("Invalid credentials. Please use the demo credentials shown above.");
      }
    });

    function showError(message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  }

  /* ============================================================
     DASHBOARD LOGIC (dashboard.html)
     ============================================================ */
  function initDashboardPage() {
    const sidebarNav = document.getElementById("navList");
    if (!sidebarNav) return; // not on the dashboard page

    // ---- Auth gate: redirect immediately if not authenticated ----
    if (sessionStorage.getItem("heAI_authenticated") !== "true") {
      window.location.href = "index.html";
      return;
    }

    const data = heAI_DATA;

    // ---- Sign out ----
    const signOutBtn = document.getElementById("signOutBtn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", function () {
        sessionStorage.removeItem("heAI_authenticated");
        sessionStorage.removeItem("heAI_agent");
        sessionStorage.removeItem("heAI_username");
        window.location.href = "index.html";
      });
    }

    // ---- Build sidebar nav from data.js tabs config ----
    const icons = {
      overview: "&#9673;",     // circled dot
      claimLookup: "&#128269;", // magnifying glass
      claimHistory: "&#128196;" // page with lines
    };

    data.tabs.forEach(function (tab, index) {
      const li = document.createElement("li");
      li.className = "nav-item";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.tab = tab.id;
      btn.innerHTML =
        '<span class="nav-icon">' + (icons[tab.id] || "&#9679;") + "</span>" +
        '<span class="nav-label">' + tab.label + "</span>";

      if (index === 0) btn.classList.add("active");

      btn.addEventListener("click", function () {
        activateTab(tab.id);
      });

      li.appendChild(btn);
      sidebarNav.appendChild(li);
    });

    function activateTab(tabId) {
      // Toggle nav button active state
      sidebarNav.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("active", b.dataset.tab === tabId);
      });

      // Show/hide panels
      document.querySelectorAll(".tab-panel").forEach(function (panel) {
        panel.hidden = panel.dataset.panel !== tabId;
      });

      // Close mobile sidebar after selection
      const sidebar = document.getElementById("appSidebar");
      if (sidebar) sidebar.classList.remove("open");
    }

    // ---- Hamburger toggle (mobile) ----
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const appSidebar = document.getElementById("appSidebar");
    if (hamburgerBtn && appSidebar) {
      hamburgerBtn.addEventListener("click", function () {
        appSidebar.classList.toggle("open");
      });
    }

    // ---- Render Overview tab ----
    const overviewDescriptionEl = document.getElementById("overviewDescription");
    if (overviewDescriptionEl) overviewDescriptionEl.textContent = data.overviewDescription;

    const statTileRow = document.getElementById("statTileRow");
    if (statTileRow) {
      data.overviewStats.forEach(function (stat) {
        const tile = document.createElement("div");
        tile.className = "stat-tile";
        tile.innerHTML =
          '<div class="stat-tile-label">' + stat.label + "</div>" +
          '<div class="stat-tile-value tone-' + stat.tone + '">' + stat.value + "</div>";
        statTileRow.appendChild(tile);
      });
    }

    // ---- Render Claim Lookup tab ----
    const claimCard = document.getElementById("claimLookupCard");
    if (claimCard) {
      const c = data.currentClaim;
      const fields = [
        ["Claim Number", c.claimNumber],
        ["Healthcare Provider", c.healthcareProvider],
        ["Claim Type", c.claimType],
        ["Status", statusPillHTML(c.status)],
        ["Initiation Date", c.initiationDate],
        ["Finalized Date", c.finalizedDate],
        ["Estimated Amount", c.estimatedAmount],
        ["Actual Amount", c.actualAmount],
        ["Approved Amount", c.approvedAmount]
      ];
      // The denial reason is only ever surfaced when the claim's Status is Denied,
      // mirroring the real agent's flow logic.
      if (c.status === "Denied" && c.claimDenialReason) {
        fields.push(["Claim Denial Reason", c.claimDenialReason]);
      }
      claimCard.innerHTML = fields.map(function (f) {
        return (
          '<div class="profile-field">' +
          "<dt>" + f[0] + "</dt>" +
          "<dd>" + f[1] + "</dd>" +
          "</div>"
        );
      }).join("");
    }

    // ---- Render Claim History tab ----
    const claimHistoryBody = document.querySelector("#claimHistoryTable tbody");
    if (claimHistoryBody) {
      data.claimHistory.forEach(function (row) {
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + row.claimNumber + "</td>" +
          "<td>" + row.claimType + "</td>" +
          "<td>" + statusPillHTML(row.status) + "</td>" +
          "<td>" + row.initiationDate + "</td>" +
          "<td>" + row.approvedAmount + "</td>";
        claimHistoryBody.appendChild(tr);
      });
    }

    // ---- Floating chat launcher stub ----
    const chatLauncher = document.getElementById("chatLauncher");
    const chatStubPanel = document.getElementById("chatStubPanel");
    const chatStubClose = document.getElementById("chatStubClose");

    if (chatLauncher && chatStubPanel) {
      chatLauncher.addEventListener("click", function () {
        chatStubPanel.hidden = !chatStubPanel.hidden;
      });
    }
    if (chatStubClose && chatStubPanel) {
      chatStubClose.addEventListener("click", function () {
        chatStubPanel.hidden = true;
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLoginPage();
    initDashboardPage();
  });
})();
