/* ============================================================
   healthEdge AI — Provider Network Support
   Login gate + dashboard tab-switching logic.
   Depends on heAI_DATA from assets/js/data.js.
   ============================================================ */

(function () {
  "use strict";

  // Small helper: turn "In Review" -> "inreview", "Approved" -> "approved" etc
  // so we can map arbitrary status text to a CSS class.
  function slug(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function statusPillHTML(status) {
    return '<span class="status-pill status-' + slug(status) + '">' + status + "</span>";
  }

  function priorityPillHTML(priority) {
    return '<span class="priority-pill priority-' + slug(priority) + '">' + priority + "</span>";
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
        username: "provider.rep",
        password: "Demo@123"
      };

      if (username === creds.username && password === creds.password) {
        sessionStorage.setItem("heAI_authenticated", "true");
        sessionStorage.setItem("heAI_agent", "ProviderNetworkSupportAgent");
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
      overview: "&#9673;",       // circled dot
      profile: "&#128100;",      // bust silhouette
      credentialing: "&#128196;",// page with lines
      contracts: "&#128220;",    // scroll
      feeSchedules: "&#128176;", // money bag
      supportCases: "&#127991;"  // headset (fallback glyph)
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

    // ---- Render My Profile tab ----
    const profileCard = document.getElementById("profileCard");
    if (profileCard) {
      const p = data.provider;
      const fields = [
        ["Provider Name", p.name],
        ["NPI", p.npi],
        ["Phone", p.phone],
        ["Email", p.email],
        ["Tax ID", p.taxId],
        ["Specialty", p.specialty],
        ["Practice Name", p.practiceName]
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

    const verifiedBadge = document.getElementById("verifiedBadge");
    if (verifiedBadge && !data.provider.verified) {
      verifiedBadge.style.display = "none";
    }

    // ---- Render Credentialing Status tab ----
    const credentialingCurrent = document.getElementById("credentialingCurrent");
    if (credentialingCurrent) {
      const c = data.credentialing.current;
      const fields = [
        ["Credentialing Status", statusPillHTML(c.status)],
        ["Current Stage", c.currentStage],
        ["Application Date", c.applicationDate],
        ["Committee Review Date", c.committeeReviewDate],
        ["Expected Completion", c.expectedCompletion],
        ["Assigned Analyst", c.assignedAnalyst]
      ];
      if (c.rejectionReason) {
        fields.push(["Rejection Reason", c.rejectionReason]);
      }
      credentialingCurrent.innerHTML = fields.map(function (f) {
        return (
          '<div class="profile-field">' +
          "<dt>" + f[0] + "</dt>" +
          "<dd>" + f[1] + "</dd>" +
          "</div>"
        );
      }).join("");
    }

    const credHistoryBody = document.querySelector("#credentialingHistoryTable tbody");
    if (credHistoryBody) {
      data.credentialing.history.forEach(function (row) {
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + row.cycle + "</td>" +
          "<td>" + statusPillHTML(row.status) + "</td>" +
          "<td>" + row.applicationDate + "</td>" +
          "<td>" + row.completionDate + "</td>" +
          "<td>" + row.analyst + "</td>";
        credHistoryBody.appendChild(tr);
      });
    }

    // ---- Render Network Contracts tab ----
    const contractsBody = document.querySelector("#contractsTable tbody");
    if (contractsBody) {
      data.contracts.forEach(function (row) {
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + row.contractName + "</td>" +
          "<td>" + row.contractNumber + "</td>" +
          "<td>" + row.network + "</td>" +
          "<td>" + statusPillHTML(row.status) + "</td>" +
          "<td>" + row.startDate + "</td>" +
          "<td>" + row.endDate + "</td>";
        contractsBody.appendChild(tr);
      });
    }

    // ---- Render Fee Schedules tab ----
    const feeBody = document.querySelector("#feeSchedulesTable tbody");
    if (feeBody) {
      data.feeSchedules.forEach(function (row) {
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + row.cpt + "</td>" +
          "<td>" + row.description + "</td>" +
          "<td>" + row.allowedAmount + "</td>" +
          "<td>" + row.contract + "</td>";
        feeBody.appendChild(tr);
      });
    }

    // ---- Render Support Cases tab ----
    const casesBody = document.querySelector("#supportCasesTable tbody");
    if (casesBody) {
      data.supportCases.forEach(function (row) {
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + row.caseNumber + "</td>" +
          "<td>" + row.subject + "</td>" +
          "<td>" + statusPillHTML(row.status) + "</td>" +
          "<td>" + priorityPillHTML(row.priority) + "</td>";
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
