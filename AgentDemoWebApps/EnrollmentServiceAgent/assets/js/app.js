/* ============================================================
   healthEdge AI — Enrollment Service Agent
   Login gate + dashboard logic. Plain JS, no dependencies.
   ============================================================ */

(function () {
  "use strict";

  const DEMO_USERNAME = "member.portal";
  const DEMO_PASSWORD = "Demo@123";
  const AGENT_KEY = "EnrollmentServiceAgent";

  const isDashboardPage = !!document.getElementById("navList");
  const isLoginPage = !!document.getElementById("loginForm");

  /* ----------------------------------------------------------
     LOGIN PAGE
     ---------------------------------------------------------- */
  if (isLoginPage) {
    renderBadges();
    renderTryAsking();

    const form = document.getElementById("loginForm");
    const errorEl = document.getElementById("loginError");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;

      if (!username || !password) {
        showError();
        return;
      }

      if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        sessionStorage.setItem("heAI_authenticated", "true");
        sessionStorage.setItem("heAI_agent", AGENT_KEY);
        window.location.href = "dashboard.html";
      } else {
        showError();
      }
    });

    function showError() {
      errorEl.hidden = false;
    }

    // Hide error once the user starts correcting their input.
    ["username", "password"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", function () {
        errorEl.hidden = true;
      });
    });
  }

  function renderBadges() {
    const row = document.querySelector(".badge-row");
    if (!row || typeof heAI_DATA === "undefined") return;

    heAI_DATA.capabilityBadges.forEach(function (badge) {
      const el = document.createElement("div");
      el.className = "capability-badge";
      el.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none">' + badge.svg + "</svg>" +
        "<span>" + badge.label + "</span>";
      row.appendChild(el);
    });
  }

  function renderTryAsking() {
    const list = document.querySelector(".try-asking-list");
    if (!list || typeof heAI_DATA === "undefined") return;

    heAI_DATA.tryAsking.forEach(function (prompt, idx) {
      const li = document.createElement("li");
      li.textContent = prompt;
      if (idx === heAI_DATA.tryAsking.length - 1) {
        const note = document.createElement("span");
        note.className = "try-asking-note";
        note.textContent = "PCP Change is coming soon — the agent will offer to log a case instead.";
        li.appendChild(note);
      }
      list.appendChild(li);
    });
  }

  /* ----------------------------------------------------------
     DASHBOARD PAGE
     ---------------------------------------------------------- */
  if (isDashboardPage) {
    // Auth gate — redirect immediately if not authenticated.
    if (sessionStorage.getItem("heAI_authenticated") !== "true") {
      window.location.href = "index.html";
      return;
    }

    document.getElementById("signOutBtn").addEventListener("click", function () {
      sessionStorage.removeItem("heAI_authenticated");
      sessionStorage.removeItem("heAI_agent");
      window.location.href = "index.html";
    });

    initTabs();
    initHamburger();
    initChatStub();
    renderOverview();
    renderCoverage();
    renderDependents();
    renderChangeRequests();
    renderCaseTracker();
  }

  function initTabs() {
    const navItems = document.querySelectorAll(".nav-item");
    const panels = document.querySelectorAll(".tab-panel");
    const sidebar = document.getElementById("sidebar");

    navItems.forEach(function (item) {
      item.addEventListener("click", function () {
        const tab = item.getAttribute("data-tab");

        navItems.forEach(function (n) { n.classList.remove("active"); });
        item.classList.add("active");

        panels.forEach(function (p) { p.classList.remove("active"); });
        const targetPanel = document.getElementById("tab-" + tab);
        if (targetPanel) targetPanel.classList.add("active");

        // Close mobile sidebar after selecting a tab.
        if (sidebar) sidebar.classList.remove("open");
      });
    });
  }

  function initHamburger() {
    const btn = document.getElementById("hamburgerBtn");
    const sidebar = document.getElementById("sidebar");
    if (!btn || !sidebar) return;

    btn.addEventListener("click", function () {
      const isOpen = sidebar.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function initChatStub() {
    const launcher = document.getElementById("chatLauncher");
    const panel = document.getElementById("chatStubPanel");
    const closeBtn = document.getElementById("chatStubClose");
    if (!launcher || !panel) return;

    launcher.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
    });
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        panel.hidden = true;
      });
    }
  }

  function statusClass(status) {
    return "status-" + status.toLowerCase().replace(/\s+/g, "-");
  }

  function renderOverview() {
    const statGrid = document.getElementById("statGrid");
    const snapshot = document.getElementById("memberSnapshot");
    if (!statGrid || typeof heAI_DATA === "undefined") return;

    const m = heAI_DATA.member;
    const deps = heAI_DATA.dependents;
    const reqs = heAI_DATA.changeRequests;

    const activeDependents = deps.filter(function (d) { return d.status === "Active"; }).length;
    const pendingRequests = reqs.filter(function (r) { return r.status === "New" || r.status === "Processing"; }).length;
    const completedRequests = reqs.filter(function (r) { return r.status === "Completed" || r.status === "Approved"; }).length;

    const stats = [
      { value: activeDependents, label: "Active Dependents" },
      { value: pendingRequests, label: "Requests In Progress" },
      { value: completedRequests, label: "Requests Resolved" },
      { value: reqs.length, label: "Total Change Requests" }
    ];

    statGrid.innerHTML = stats.map(function (s) {
      return '<div class="stat-tile"><div class="stat-value">' + s.value + '</div>' +
        '<div class="stat-label">' + s.label + '</div></div>';
    }).join("");

    if (snapshot) {
      snapshot.innerHTML =
        snapshotItem("Member Name", m.memberName) +
        snapshotItem("Member ID", m.memberId) +
        snapshotItem("Account", m.accountName) +
        snapshotItem("Plan Name", m.planName) +
        snapshotItem("Plan Level", '<span class="plan-level-pill">' + m.planLevel + '</span>') +
        snapshotItem("Effective Date", m.effectiveDate);
    }
  }

  function snapshotItem(label, value) {
    return '<div class="snapshot-item"><div class="snapshot-label">' + label + '</div>' +
      '<div class="snapshot-value">' + value + '</div></div>';
  }

  function renderCoverage() {
    const grid = document.getElementById("coverageGrid");
    if (!grid || typeof heAI_DATA === "undefined") return;

    const m = heAI_DATA.member;
    grid.innerHTML =
      coverageItem("Account Name", m.accountName) +
      coverageItem("Member Name", m.memberName) +
      coverageItem("Member ID", m.memberId) +
      coverageItem("Group Number", m.groupNumber) +
      coverageItem("Plan Name", m.planName) +
      coverageItem("Plan Level", '<span class="plan-level-pill">' + m.planLevel + '</span>') +
      coverageItem("Effective Date", m.effectiveDate);
  }

  function coverageItem(label, value) {
    return '<div class="coverage-item"><div class="coverage-label">' + label + '</div>' +
      '<div class="coverage-value">' + value + '</div></div>';
  }

  function renderDependents() {
    const tbody = document.getElementById("dependentsTableBody");
    if (!tbody || typeof heAI_DATA === "undefined") return;

    tbody.innerHTML = heAI_DATA.dependents.map(function (d) {
      return "<tr>" +
        "<td>" + d.name + "</td>" +
        "<td>" + d.gender + "</td>" +
        "<td>" + d.dob + "</td>" +
        "<td>" + d.relation + "</td>" +
        '<td><span class="status-pill ' + statusClass(d.status) + '">' + d.status + "</span></td>" +
        "</tr>";
    }).join("");
  }

  function renderChangeRequests() {
    const tbody = document.getElementById("requestsTableBody");
    if (!tbody || typeof heAI_DATA === "undefined") return;

    tbody.innerHTML = heAI_DATA.changeRequests.map(requestRow).join("");
  }

  function renderCaseTracker() {
    const tbody = document.getElementById("trackerTableBody");
    if (!tbody || typeof heAI_DATA === "undefined") return;

    tbody.innerHTML = heAI_DATA.changeRequests.map(requestRow).join("");
  }

  function requestRow(r) {
    return "<tr>" +
      "<td><code>" + r.issueId + "</code></td>" +
      "<td>" + r.type + "</td>" +
      "<td>" + r.dependentName + "</td>" +
      "<td>" + r.effectiveDate + "</td>" +
      '<td><span class="status-pill ' + statusClass(r.status) + '">' + r.status + "</span></td>" +
      "</tr>";
  }
})();
