/* ==========================================================================
   healthEdge AI — Employer Support Agent demo
   Shared app.js: handles BOTH the login gate (index.html) and the
   authenticated dashboard shell (dashboard.html). Each page only wires
   up the pieces relevant to it (elements that don't exist are skipped).
   ========================================================================== */

(function () {
  "use strict";

  var DEMO_USERNAME = "employer.admin";
  var DEMO_PASSWORD = "Demo@123";

  /* ---------------------------------------------------------------- */
  /* Login gate (index.html)                                          */
  /* ---------------------------------------------------------------- */

  var loginForm = document.getElementById("loginForm");

  if (loginForm) {
    var usernameField = document.getElementById("username");
    var passwordField = document.getElementById("password");
    var errorMsg = document.getElementById("loginError");

    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var username = (usernameField.value || "").trim();
      var password = passwordField.value || "";

      // Basic required-field validation
      if (!username || !password) {
        showError("Invalid credentials. Please use the demo credentials shown above.");
        return;
      }

      if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        sessionStorage.setItem("heAI_authenticated", "true");
        sessionStorage.setItem("heAI_agent", "EmployerGroupSupportAgent");
        window.location.href = "dashboard.html";
      } else {
        showError("Invalid credentials. Please use the demo credentials shown above.");
      }
    });

    function showError(message) {
      errorMsg.textContent = message;
      errorMsg.classList.add("he-visible");
    }
  }

  /* ---------------------------------------------------------------- */
  /* Dashboard shell (dashboard.html)                                  */
  /* ---------------------------------------------------------------- */

  var mainNav = document.getElementById("mainNav");

  if (mainNav) {
    // Auth gate: bounce back to login if session flag isn't set.
    if (sessionStorage.getItem("heAI_authenticated") !== "true") {
      window.location.href = "index.html";
      return;
    }

    renderDashboardData();
    wireTabSwitching();
    wireSignOut();
    wireHamburger();
    wireChatStub();
  }

  function wireTabSwitching() {
    var navButtons = document.querySelectorAll(".he-nav-btn");
    var panels = document.querySelectorAll(".he-tab-panel");

    navButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-tab");

        navButtons.forEach(function (b) { b.classList.remove("he-active"); });
        btn.classList.add("he-active");

        panels.forEach(function (panel) {
          if (panel.id === "tab-" + target) {
            panel.classList.add("he-active");
          } else {
            panel.classList.remove("he-active");
          }
        });

        // Close mobile nav after selecting a tab
        var nav = document.getElementById("mainNav");
        if (nav) { nav.classList.remove("he-nav-open"); }
      });
    });
  }

  function wireSignOut() {
    var btn = document.getElementById("signOutBtn");
    if (!btn) { return; }
    btn.addEventListener("click", function () {
      sessionStorage.removeItem("heAI_authenticated");
      sessionStorage.removeItem("heAI_agent");
      window.location.href = "index.html";
    });
  }

  function wireHamburger() {
    var hamburger = document.getElementById("hamburgerBtn");
    var nav = document.getElementById("mainNav");
    if (!hamburger || !nav) { return; }
    hamburger.addEventListener("click", function () {
      nav.classList.toggle("he-nav-open");
    });
  }

  function wireChatStub() {
    var launcher = document.getElementById("chatLauncherBtn");
    var stub = document.getElementById("chatStub");
    var closeBtn = document.getElementById("chatStubClose");
    if (!launcher || !stub) { return; }

    launcher.addEventListener("click", function () {
      stub.classList.toggle("he-visible");
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        stub.classList.remove("he-visible");
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Data rendering (from assets/js/data.js -> window.HE_DATA)         */
  /* ---------------------------------------------------------------- */

  function renderDashboardData() {
    if (typeof HE_DATA === "undefined") { return; }

    renderEmployerHeader();
    renderStatTiles();
    renderPolicies();
    renderParticipants();
    renderCoverages();
    renderContacts();
    renderCases();
  }

  function renderEmployerHeader() {
    var employer = HE_DATA.employer;
    setText("employerAcctNum", employer.accountNumber);
    setText("employerLocation", employer.billingCity + ", " + employer.billingState);
    setText("employerOwner", employer.accountOwner);
  }

  function renderStatTiles() {
    var grid = document.getElementById("statGrid");
    if (!grid) { return; }
    var s = HE_DATA.stats;

    var tiles = [
      { label: "Active Policies", value: s.activePolicies },
      { label: "Policy Participants", value: s.totalParticipants },
      { label: "Open Cases", value: s.openCases },
      { label: "Upcoming Renewals", value: s.upcomingRenewals }
    ];

    grid.innerHTML = tiles.map(function (t) {
      return (
        '<div class="he-stat-tile">' +
          '<div class="he-stat-label">' + t.label + '</div>' +
          '<div class="he-stat-value">' + t.value + '</div>' +
        '</div>'
      );
    }).join("");
  }

  function statusPillClass(status) {
    var map = {
      "Active": "he-pill-active",
      "Pending Renewal": "he-pill-pending",
      "Lapsed": "he-pill-lapsed",
      "New": "he-pill-new",
      "In Progress": "he-pill-progress",
      "Escalated": "he-pill-escalated",
      "Closed": "he-pill-closed",
      "Low": "he-pill-low",
      "Medium": "he-pill-medium",
      "High": "he-pill-high"
    };
    return map[status] || "he-pill-info";
  }

  function pill(text) {
    return '<span class="he-pill ' + statusPillClass(text) + '">' + text + '</span>';
  }

  function renderPolicies() {
    var body = document.getElementById("policiesTableBody");
    if (!body) { return; }

    body.innerHTML = HE_DATA.policies.map(function (p) {
      return (
        "<tr>" +
          "<td>" + p.policyName + "</td>" +
          "<td>" + pill(p.status) + "</td>" +
          "<td>" + p.policyType + "</td>" +
          "<td>" + p.effectiveFrom + "</td>" +
          "<td>" + p.effectiveTo + "</td>" +
          "<td>" + p.premiumAmount + "</td>" +
          "<td>" + p.premiumFrequency + "</td>" +
          "<td>" + p.renewalDate + "</td>" +
        "</tr>"
      );
    }).join("");
  }

  function renderParticipants() {
    var body = document.getElementById("participantsTableBody");
    if (!body) { return; }

    body.innerHTML = HE_DATA.participants.map(function (p) {
      var activeBadge = p.isActive === "Y"
        ? '<span class="he-pill he-pill-active">Active</span>'
        : '<span class="he-pill he-pill-info">Inactive</span>';

      return (
        "<tr>" +
          "<td>" + p.name + "</td>" +
          "<td>" + p.role + "</td>" +
          "<td>" + p.relationship + "</td>" +
          "<td>" + activeBadge + "</td>" +
          "<td>" + p.effectiveFrom + "</td>" +
          "<td>" + p.effectiveTo + "</td>" +
        "</tr>"
      );
    }).join("");
  }

  function renderCoverages() {
    var body = document.getElementById("coveragesTableBody");
    if (!body) { return; }

    body.innerHTML = HE_DATA.coverages.map(function (c) {
      return (
        "<tr>" +
          "<td>" + c.coverageName + "</td>" +
          "<td>" + c.category + "</td>" +
          "<td>" + c.effectiveFrom + "</td>" +
          "<td>" + c.effectiveTo + "</td>" +
          "<td>" + c.deductible + "</td>" +
        "</tr>"
      );
    }).join("");
  }

  function renderContacts() {
    var grid = document.getElementById("contactsGrid");
    if (!grid) { return; }

    grid.innerHTML = HE_DATA.contacts.map(function (c) {
      var initials = c.name.split(" ").map(function (n) { return n[0]; }).join("").slice(0, 2);
      return (
        '<div class="he-contact-card">' +
          '<div class="he-contact-avatar">' + initials + '</div>' +
          "<h4>" + c.name + "</h4>" +
          '<div class="he-contact-title">' + c.title + '</div>' +
          "<p>" + c.email + "<br />" + c.phone + "</p>" +
        "</div>"
      );
    }).join("");
  }

  function renderCases() {
    var grid = document.getElementById("casesGrid");
    if (!grid) { return; }

    grid.innerHTML = HE_DATA.cases.map(function (c) {
      return (
        '<div class="he-case-card">' +
          '<div class="he-case-top">' +
            '<span class="he-case-number">' + c.caseNumber + '</span>' +
            pill(c.status) +
          "</div>" +
          "<h4>" + c.subject + "</h4>" +
          "<p>" + c.description + "</p>" +
          '<div class="he-case-meta">' +
            pill(c.priority) +
            '<span class="he-pill he-pill-info">' + c.type + '</span>' +
          "</div>" +
        "</div>"
      );
    }).join("");
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) { el.textContent = value; }
  }
})();
