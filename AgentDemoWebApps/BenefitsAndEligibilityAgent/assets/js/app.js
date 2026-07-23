/* ============================================================
   healthEdge AI — Member Benefits and Eligibility
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
        username: "member.portal.user",
        password: "Demo@123"
      };

      if (username === creds.username && password === creds.password) {
        sessionStorage.setItem("heAI_authenticated", "true");
        sessionStorage.setItem("heAI_agent", "BenefitsAndEligibilityAgent");
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
      overview: "&#9673;",   // circled dot
      profile: "&#128100;",  // bust silhouette
      benefits: "&#128137;", // pill / medical
      claims: "&#128196;"    // page with lines
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
      const m = data.member;
      const fields = [
        ["Member Name", m.name],
        ["Date of Birth", m.dob],
        ["Phone", m.phone],
        ["Member Id", m.memberId],
        ["Plan", m.plan]
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
    if (verifiedBadge && !data.member.verified) {
      verifiedBadge.style.display = "none";
    }

    // ---- Render Benefits & Coverage tab ----
    const benefitsPlanNameEl = document.getElementById("benefitsPlanName");
    if (benefitsPlanNameEl) {
      benefitsPlanNameEl.textContent = "Plan: " + data.benefits.planName;
    }

    const benefitsCard = document.getElementById("benefitsCard");
    if (benefitsCard) {
      const b = data.benefits;
      const fields = [
        ["Primary Care Copay", b.copayPrimaryCare],
        ["Specialist Copay", b.copaySpecialist],
        ["ER Copay", b.copayER],
        ["Urgent Care Copay", b.copayUrgentCare],
        ["Deductible (Individual, In-Network)", b.deductibleIndividualInNetwork],
        ["Deductible (Family, In-Network)", b.deductibleFamilyInNetwork],
        ["Deductible (Individual, Out-of-Network)", b.deductibleIndividualOutNetwork],
        ["Deductible (Family, Out-of-Network)", b.deductibleFamilyOutNetwork],
        ["Coinsurance", b.coinsurance],
        ["Out-of-Pocket Max (Individual, In-Network)", b.oopMaxIndividualInNetwork],
        ["Out-of-Pocket Max (Family, In-Network)", b.oopMaxFamilyInNetwork],
        ["Out-of-Pocket Max (Individual, Out-of-Network)", b.oopMaxIndividualOutNetwork],
        ["Out-of-Pocket Max (Family, Out-of-Network)", b.oopMaxFamilyOutNetwork],
        ["Prior Authorization Notes", b.benefitNotes]
      ];
      benefitsCard.innerHTML = fields.map(function (f) {
        return (
          '<div class="profile-field">' +
          "<dt>" + f[0] + "</dt>" +
          "<dd>" + f[1] + "</dd>" +
          "</div>"
        );
      }).join("");
    }

    const benefitItemsBody = document.querySelector("#benefitItemsTable tbody");
    if (benefitItemsBody) {
      data.benefits.items.forEach(function (row) {
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + row.benefitCategory + "</td>" +
          "<td>" + row.serviceType + "</td>" +
          "<td>" + row.network + "</td>" +
          "<td>" + row.coverage + "</td>" +
          "<td>" + row.notes + "</td>";
        benefitItemsBody.appendChild(tr);
      });
    }

    // ---- Render Claims History tab ----
    const claimsBody = document.querySelector("#claimsTable tbody");
    if (claimsBody) {
      data.claims.forEach(function (row) {
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + row.claimExternalId + "</td>" +
          "<td>" + row.provider + "</td>" +
          "<td>" + row.serviceType + "</td>" +
          "<td>" + row.dateSubmitted + "</td>" +
          "<td>" + statusPillHTML(row.status) + "</td>" +
          "<td>" + row.memberResponsibility + "</td>" +
          "<td>" + (row.denialReason || "&mdash;") + "</td>";
        claimsBody.appendChild(tr);
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
