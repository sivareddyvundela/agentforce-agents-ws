/* ============================================================
   healthEdge AI — Provider Search & Profile
   Login gate logic, dashboard tab-switching logic, and the
   client-side Provider Search / selected-provider logic.
   Depends on heAI_DATA from assets/js/data.js.
   ============================================================ */

(function () {
  "use strict";

  var SELECTED_PROVIDER_KEY = "heAI_selectedProviderId_ProviderSearchAndProfileLookup";

  // Small helper: turn "In Progress" -> "inprogress", "Board Certified" -> etc
  // so we can map arbitrary status/severity text to a CSS class.
  function slug(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function statusPillHTML(status) {
    return '<span class="status-pill status-' + slug(status) + '">' + status + "</span>";
  }

  function severityPillHTML(severity) {
    return '<span class="severity-pill severity-' + slug(severity) + '">' + severity + "</span>";
  }

  function boolPillHTML(value) {
    var isYes = String(value).toUpperCase() === "Y";
    return '<span class="bool-pill bool-' + (isYes ? "y" : "n") + '">' + (isYes ? "Yes" : "No") + "</span>";
  }

  function escapeHTML(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* ============================================================
     LOGIN PAGE LOGIC (index.html)
     ============================================================ */
  function initLoginPage() {
    var form = document.getElementById("loginForm");
    if (!form) return; // not on the login page

    // Populate "Try asking..." prompts from data.js
    var list = document.getElementById("tryAskingList");
    if (list && Array.isArray(heAI_DATA.samplePrompts)) {
      heAI_DATA.samplePrompts.forEach(function (prompt) {
        var li = document.createElement("li");
        li.textContent = prompt;
        list.appendChild(li);
      });
    }

    var usernameInput = document.getElementById("username");
    var passwordInput = document.getElementById("password");
    var errorEl = document.getElementById("formError");

    form.addEventListener("submit", function (evt) {
      evt.preventDefault();

      var username = usernameInput.value.trim();
      var password = passwordInput.value;

      // Basic required-field validation
      if (!username || !password) {
        showError("Please enter both a username and password.");
        return;
      }

      var creds = heAI_DATA.credentials || {
        username: "network.ops",
        password: "Demo@123"
      };

      if (username === creds.username && password === creds.password) {
        sessionStorage.setItem("heAI_authenticated", "true");
        sessionStorage.setItem("heAI_agent", "ProviderSearchAndProfileLookup");
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
    var sidebarNav = document.getElementById("navList");
    if (!sidebarNav) return; // not on the dashboard page

    // ---- Auth gate: redirect immediately if not authenticated ----
    if (sessionStorage.getItem("heAI_authenticated") !== "true") {
      window.location.href = "index.html";
      return;
    }

    var data = heAI_DATA;

    // ---- Currently selected provider (persisted across reloads) ----
    var selectedProviderId = localStorage.getItem(SELECTED_PROVIDER_KEY);
    if (!selectedProviderId || !findProvider(selectedProviderId)) {
      selectedProviderId = data.providers[0].id;
    }

    function findProvider(id) {
      for (var i = 0; i < data.providers.length; i++) {
        if (data.providers[i].id === id) return data.providers[i];
      }
      return null;
    }

    function setSelectedProvider(id) {
      selectedProviderId = id;
      localStorage.setItem(SELECTED_PROVIDER_KEY, id);
      renderProviderSearchTable(document.getElementById("providerSearchInput").value);
      renderDrillDownTabs();
    }

    // ---- Sign out ----
    var signOutBtn = document.getElementById("signOutBtn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", function () {
        sessionStorage.removeItem("heAI_authenticated");
        sessionStorage.removeItem("heAI_agent");
        window.location.href = "index.html";
      });
    }

    // ---- Build sidebar nav from data.js tabs config ----
    var icons = {
      overview: "◉",              // circled dot
      providerSearch: "\u{1F50D}",     // magnifying glass
      credentials: "\u{1F4C4}",        // page with lines
      networkParticipation: "\u{1F310}", // globe
      activeContracts: "\u{1F4DC}",    // scroll
      serviceLocations: "\u{1F4CD}",   // pin
      complianceIssues: "\u{26A0}"     // warning
    };

    data.tabs.forEach(function (tab, index) {
      var li = document.createElement("li");
      li.className = "nav-item";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.tab = tab.id;
      btn.innerHTML =
        '<span class="nav-icon">' + (icons[tab.id] || "●") + "</span>" +
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
      var sidebar = document.getElementById("appSidebar");
      if (sidebar) sidebar.classList.remove("open");
    }

    // ---- Hamburger toggle (mobile) ----
    var hamburgerBtn = document.getElementById("hamburgerBtn");
    var appSidebar = document.getElementById("appSidebar");
    if (hamburgerBtn && appSidebar) {
      hamburgerBtn.addEventListener("click", function () {
        appSidebar.classList.toggle("open");
      });
    }

    // ---- Render Overview tab ----
    var overviewDescriptionEl = document.getElementById("overviewDescription");
    if (overviewDescriptionEl) overviewDescriptionEl.textContent = data.overviewDescription;

    var statTileRow = document.getElementById("statTileRow");
    if (statTileRow) {
      var totalProviders = data.providers.length;

      var openComplianceIssues = 0;
      Object.keys(data.complianceIssuesByProvider).forEach(function (pid) {
        data.complianceIssuesByProvider[pid].forEach(function (issue) {
          if (issue.status === "Open" || issue.status === "Remediation Required" || issue.status === "Under Review") {
            openComplianceIssues++;
          }
        });
      });

      var activeContractCount = 0;
      Object.keys(data.contractsByProvider).forEach(function (pid) {
        data.contractsByProvider[pid].forEach(function (c) {
          if (c.status === "Active") activeContractCount++;
        });
      });

      var credentialingInProgress = 0;
      Object.keys(data.credentialsByProvider).forEach(function (pid) {
        data.credentialsByProvider[pid].forEach(function (c) {
          if (c.status === "In Progress" || c.status === "Pending Committee Review" || c.status === "Remediation Required") {
            credentialingInProgress++;
          }
        });
      });

      var stats = [
        { label: "Providers in Directory", value: String(totalProviders), tone: "neutral" },
        { label: "Open Compliance Issues", value: String(openComplianceIssues), tone: "warning" },
        { label: "Active Contracts", value: String(activeContractCount), tone: "positive" },
        { label: "Credentialing In Progress", value: String(credentialingInProgress), tone: "warning" }
      ];

      stats.forEach(function (stat) {
        var tile = document.createElement("div");
        tile.className = "stat-tile";
        tile.innerHTML =
          '<div class="stat-tile-label">' + stat.label + "</div>" +
          '<div class="stat-tile-value tone-' + stat.tone + '">' + stat.value + "</div>";
        statTileRow.appendChild(tile);
      });
    }

    // ---- Provider Search tab: render + client-side filter ----
    var searchTableBody = document.querySelector("#providerSearchTable tbody");
    var searchEmptyState = document.getElementById("providerSearchEmpty");
    var searchInput = document.getElementById("providerSearchInput");

    function renderProviderSearchTable(filterText) {
      if (!searchTableBody) return;
      var query = (filterText || "").trim().toLowerCase();

      var filtered = data.providers.filter(function (p) {
        if (!query) return true;
        return (
          p.name.toLowerCase().indexOf(query) !== -1 ||
          p.npi.toLowerCase().indexOf(query) !== -1 ||
          p.taxId.toLowerCase().indexOf(query) !== -1
        );
      });

      searchTableBody.innerHTML = "";

      if (filtered.length === 0) {
        searchEmptyState.hidden = false;
        return;
      }
      searchEmptyState.hidden = true;

      filtered.forEach(function (p) {
        var tr = document.createElement("tr");
        var isSelected = p.id === selectedProviderId;
        if (isSelected) tr.classList.add("row-selected");

        tr.innerHTML =
          "<td>" + escapeHTML(p.name) + "</td>" +
          "<td>" + escapeHTML(p.npi) + "</td>" +
          "<td>" + escapeHTML(p.taxId) + "</td>" +
          "<td>" + escapeHTML(p.specialty) + "</td>" +
          "<td>" + statusPillHTML(p.status) + "</td>" +
          "<td>" + escapeHTML(p.type) + "</td>" +
          "<td>" + escapeHTML(p.phone) + "</td>" +
          "<td>" + escapeHTML(p.email) + "</td>" +
          "<td>" + boolPillHTML(p.boardCertified) + "</td>" +
          "<td>" + boolPillHTML(p.acceptingNewPatients) + "</td>" +
          '<td><button type="button" class="btn-view-profile' + (isSelected ? " is-selected" : "") + '" data-provider-id="' + p.id + '">' +
          (isSelected ? "Selected" : "View Profile") + "</button></td>";

        searchTableBody.appendChild(tr);
      });

      searchTableBody.querySelectorAll(".btn-view-profile").forEach(function (btn) {
        btn.addEventListener("click", function () {
          setSelectedProvider(btn.dataset.providerId);
        });
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        renderProviderSearchTable(searchInput.value);
      });
    }
    renderProviderSearchTable("");

    // ---- Selected-provider banner (shown on each drill-down tab) ----
    function bannerHTML(provider) {
      return (
        '<span class="sp-name">' + escapeHTML(provider.name) + "</span>" +
        '<span class="sp-meta">NPI ' + escapeHTML(provider.npi) + " &middot; Tax ID " + escapeHTML(provider.taxId) +
        " &middot; " + escapeHTML(provider.specialty) + "</span>" +
        '<span class="sp-hint">Change the active provider from the Provider Search tab</span>'
      );
    }

    // ---- Render Credentials tab ----
    function renderCredentials(provider) {
      var banner = document.getElementById("banner-credentials");
      if (banner) banner.innerHTML = bannerHTML(provider);

      var body = document.querySelector("#credentialsTable tbody");
      if (!body) return;
      body.innerHTML = "";
      (data.credentialsByProvider[provider.id] || []).forEach(function (row) {
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + statusPillHTML(row.status) + "</td>" +
          "<td>" + escapeHTML(row.applicationDate) + "</td>" +
          "<td>" + escapeHTML(row.currentStage) + "</td>" +
          "<td>" + escapeHTML(row.assignedAnalyst) + "</td>" +
          "<td>" + escapeHTML(row.expectedCompletion) + "</td>";
        body.appendChild(tr);
      });
    }

    // ---- Render Network Participation tab ----
    function renderNetworkParticipation(provider) {
      var banner = document.getElementById("banner-networkParticipation");
      if (banner) banner.innerHTML = bannerHTML(provider);

      var body = document.querySelector("#networkParticipationTable tbody");
      if (!body) return;
      body.innerHTML = "";
      (data.networkParticipationByProvider[provider.id] || []).forEach(function (row) {
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + escapeHTML(row.networkName) + "</td>" +
          "<td>" + boolPillHTML(row.active) + "</td>" +
          "<td>" + escapeHTML(row.lineOfBusiness) + "</td>" +
          "<td>" + escapeHTML(row.effectiveStartDate) + "</td>" +
          "<td>" + escapeHTML(row.effectiveEndDate) + "</td>";
        body.appendChild(tr);
      });
    }

    // ---- Render Active Contracts tab ----
    function renderActiveContracts(provider) {
      var banner = document.getElementById("banner-activeContracts");
      if (banner) banner.innerHTML = bannerHTML(provider);

      var body = document.querySelector("#activeContractsTable tbody");
      if (!body) return;
      body.innerHTML = "";
      (data.contractsByProvider[provider.id] || []).forEach(function (row) {
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + escapeHTML(row.contractName) + "</td>" +
          "<td>" + escapeHTML(row.payerNetwork) + "</td>" +
          "<td>" + statusPillHTML(row.status) + "</td>" +
          "<td>" + escapeHTML(row.startDate) + "</td>" +
          "<td>" + escapeHTML(row.endDate) + "</td>";
        body.appendChild(tr);
      });
    }

    // ---- Render Service Locations tab ----
    function renderServiceLocations(provider) {
      var banner = document.getElementById("banner-serviceLocations");
      if (banner) banner.innerHTML = bannerHTML(provider);

      var body = document.querySelector("#serviceLocationsTable tbody");
      if (!body) return;
      body.innerHTML = "";
      (data.serviceLocationsByProvider[provider.id] || []).forEach(function (row) {
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + escapeHTML(row.locationName) + "</td>" +
          "<td>" + escapeHTML(row.address) + "</td>" +
          "<td>" + escapeHTML(row.city) + "</td>" +
          "<td>" + escapeHTML(row.country) + "</td>";
        body.appendChild(tr);
      });
    }

    // ---- Render Compliance Issues tab ----
    function renderComplianceIssues(provider) {
      var banner = document.getElementById("banner-complianceIssues");
      if (banner) banner.innerHTML = bannerHTML(provider);

      var body = document.querySelector("#complianceIssuesTable tbody");
      if (!body) return;
      body.innerHTML = "";
      (data.complianceIssuesByProvider[provider.id] || []).forEach(function (row) {
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + escapeHTML(row.issueTitle) + "</td>" +
          "<td>" + escapeHTML(row.complianceType) + "</td>" +
          "<td>" + statusPillHTML(row.status) + "</td>" +
          "<td>" + severityPillHTML(row.severity) + "</td>" +
          "<td>" + escapeHTML(row.identifiedDate) + "</td>" +
          "<td>" + escapeHTML(row.resolutionDueDate) + "</td>";
        body.appendChild(tr);
      });
    }

    function renderDrillDownTabs() {
      var provider = findProvider(selectedProviderId) || data.providers[0];
      renderCredentials(provider);
      renderNetworkParticipation(provider);
      renderActiveContracts(provider);
      renderServiceLocations(provider);
      renderComplianceIssues(provider);
    }

    renderDrillDownTabs();

    // ---- Floating chat launcher stub ----
    var chatLauncher = document.getElementById("chatLauncher");
    var chatStubPanel = document.getElementById("chatStubPanel");
    var chatStubClose = document.getElementById("chatStubClose");

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
