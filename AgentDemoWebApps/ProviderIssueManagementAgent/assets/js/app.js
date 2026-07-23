/* ============================================================
   healthEdge AI — Provider Issue Management
   Login gate + dashboard tab-switching logic.
   Depends on heAI_DATA from assets/js/data.js.
   ============================================================ */

(function () {
  "use strict";

  // Small helper: turn "In Review" -> "inreview", "Escalated" -> "escalated" etc
  // so we can map arbitrary status text to a CSS class.
  function slug(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function statusPillHTML(status) {
    return '<span class="status-pill status-' + slug(status) + '">' + status + "</span>";
  }

  // Map a full issue-type label to the short class key used in style.css.
  function issueTypeClassKey(issueType) {
    const map = {
      "Claims Issue": "claims",
      "Payment Inquiry": "payment",
      "Credentialing Issue": "credentialing",
      "Contract Issue": "contract",
      "Directory Issue": "directory",
      "Unknown": "unknown"
    };
    return map[issueType] || "unknown";
  }

  function issuePillHTML(issueType) {
    return '<span class="issue-pill issue-' + issueTypeClassKey(issueType) + '">' + issueType + "</span>";
  }

  // Map a recommended-action label to a tone (positive/warning/danger).
  function actionToneKey(action) {
    const map = {
      "Provide Status Update": "positive",
      "Request Additional Information": "warning",
      "Escalate to Support Queue": "danger",
      "No Action Available – Recommend Escalation": "danger"
    };
    return map[action] || "warning";
  }

  function actionPillHTML(action) {
    return '<span class="action-pill action-' + actionToneKey(action) + '">' + action + "</span>";
  }

  // Map a numeric confidence score to a tone (high/medium/low) per the
  // agent's >= 60 confidence-gating rule.
  function confidenceToneKey(score) {
    if (score >= 80) return "high";
    if (score >= 60) return "medium";
    return "low";
  }

  function confidencePillHTML(score) {
    return '<span class="confidence-pill confidence-' + confidenceToneKey(score) + '">' + score + " / 100</span>";
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
        username: "support.rep",
        password: "Demo@123"
      };

      if (username === creds.username && password === creds.password) {
        sessionStorage.setItem("heAI_authenticated", "true");
        sessionStorage.setItem("heAI_agent", "ProviderIssueManagementAgent");
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
        window.location.href = "index.html";
      });
    }

    // ---- Build sidebar nav from data.js tabs config ----
    const icons = {
      overview: "&#9673;",         // circled dot
      profile: "&#128100;",        // bust silhouette
      classification: "&#128269;", // magnifying glass
      recommendation: "&#128161;", // light bulb
      cases: "&#128203;"           // clipboard
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

    // ---- Render Provider Profile tab ----
    const profileCard = document.getElementById("profileCard");
    if (profileCard) {
      const p = data.provider;
      const fields = [
        ["Provider Name", p.name],
        ["NPI", p.npi],
        ["Specialty", p.specialty],
        ["Practice Name", p.practiceName],
        ["Phone", p.phone],
        ["Identity Status", p.status]
      ];
      profileCard.innerHTML = fields.map(function (f) {
        return (
          '<div class="profile-field">' +
          "<dt>" + f[0] + "</dt>" +
          "<dd>" + f[1] + "</dd>" +
          "</div>"
        );
      }).join("");
    }

    // ---- Render Issue Classification tab ----
    const classificationCard = document.getElementById("classificationCard");
    if (classificationCard) {
      const c = data.classification;
      classificationCard.innerHTML =
        '<div class="detail-card-row">' +
        issuePillHTML(c.issueType) +
        confidencePillHTML(c.confidenceScore) +
        "</div>" +
        '<div class="detail-card-label">Summary</div>' +
        '<p class="detail-card-summary">' + c.summary + "</p>";
    }

    // ---- Render Resolution Recommendation tab ----
    const recommendationCard = document.getElementById("recommendationCard");
    if (recommendationCard) {
      const r = data.recommendation;
      recommendationCard.innerHTML =
        '<div class="detail-card-row">' +
        actionPillHTML(r.action) +
        "</div>" +
        '<div class="detail-card-label">Explanation</div>' +
        '<p class="detail-card-summary">' + r.explanation + "</p>";
    }

    // ---- Render Recent Cases tab ----
    const casesBody = document.querySelector("#recentCasesTable tbody");
    if (casesBody) {
      data.recentCases.forEach(function (row) {
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + row.caseNumber + "</td>" +
          "<td>" + issuePillHTML(row.issueType) + "</td>" +
          "<td>" + confidencePillHTML(row.confidenceScore) + "</td>" +
          "<td>" + actionPillHTML(row.recommendedAction) + "</td>" +
          "<td>" + statusPillHTML(row.status) + "</td>";
        casesBody.appendChild(tr);
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
