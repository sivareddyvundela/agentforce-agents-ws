/* ==========================================================================
   healthEdge AI — Provider Contract Inquiry Agent
   Login gate + dashboard tab-switching logic. No frameworks, no build step.
   ========================================================================== */

(function () {
  "use strict";

  var DEMO_USERNAME = "contract.analyst";
  var DEMO_PASSWORD = "Demo@123";

  /* ------------------------------------------------------------------
     LOGIN PAGE LOGIC (index.html)
     ------------------------------------------------------------------ */
  function initLoginPage() {
    var form = document.getElementById("he-login-form");
    if (!form) return;

    var errorBox = document.getElementById("he-login-error");
    var usernameInput = document.getElementById("he-username");
    var passwordInput = document.getElementById("he-password");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var username = usernameInput.value.trim();
      var password = passwordInput.value;

      if (!username || !password) {
        showError("Please enter both username and password.");
        return;
      }

      if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        sessionStorage.setItem("heAI_authenticated", "true");
        sessionStorage.setItem("heAI_agent", "ProviderContractEnquiryAgent");
        window.location.href = "dashboard.html";
        return;
      }

      showError("Invalid credentials. Please use the demo credentials shown above.");
    });

    function showError(message) {
      errorBox.textContent = message;
      errorBox.classList.add("he-visible");
    }

    [usernameInput, passwordInput].forEach(function (el) {
      el.addEventListener("input", function () {
        errorBox.classList.remove("he-visible");
      });
    });
  }

  /* ------------------------------------------------------------------
     DASHBOARD LOGIC (dashboard.html)
     ------------------------------------------------------------------ */
  function initDashboard() {
    var app = document.getElementById("he-app");
    if (!app) return;

    // Auth gate: bounce back to the login page if not authenticated.
    if (sessionStorage.getItem("heAI_authenticated") !== "true") {
      window.location.href = "index.html";
      return;
    }

    wireSignOut();
    wireSidebarToggle();
    wireTabSwitching();
    wireChatLauncher();
    wireContractSearch();

    renderOverview();
    renderContractSearchResults(HE_DATA.contracts);
    renderNetworkInfo();
    renderFeeSchedules();
    renderAmendments();
    renderExpiringContracts();
  }

  function wireSignOut() {
    var btn = document.getElementById("he-signout-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      sessionStorage.removeItem("heAI_authenticated");
      sessionStorage.removeItem("heAI_agent");
      window.location.href = "index.html";
    });
  }

  function wireSidebarToggle() {
    var hamburger = document.getElementById("he-hamburger");
    var sidebar = document.getElementById("he-sidebar");
    if (!hamburger || !sidebar) return;

    hamburger.addEventListener("click", function () {
      sidebar.classList.toggle("he-open");
    });

    // Close the mobile sidebar after choosing a tab.
    sidebar.addEventListener("click", function (e) {
      var navItem = e.target.closest(".he-nav-item");
      if (navItem && window.innerWidth <= 900) {
        sidebar.classList.remove("he-open");
      }
    });
  }

  function wireTabSwitching() {
    var navItems = document.querySelectorAll(".he-nav-item[data-tab]");
    var panels = document.querySelectorAll(".he-panel[data-panel]");

    navItems.forEach(function (item) {
      item.addEventListener("click", function () {
        var target = item.getAttribute("data-tab");

        navItems.forEach(function (n) { n.classList.remove("he-active"); });
        item.classList.add("he-active");

        panels.forEach(function (p) {
          p.classList.toggle("he-active", p.getAttribute("data-panel") === target);
        });

        window.location.hash = target;
      });
    });

    // Support direct-link / reload via hash.
    var initialHash = window.location.hash.replace("#", "");
    if (initialHash) {
      var match = document.querySelector('.he-nav-item[data-tab="' + initialHash + '"]');
      if (match) match.click();
    }
  }

  function wireChatLauncher() {
    var launcher = document.getElementById("he-chat-launcher");
    var stub = document.getElementById("he-chat-stub");
    var closeBtn = document.getElementById("he-chat-stub-close");
    if (!launcher || !stub) return;

    launcher.addEventListener("click", function () {
      stub.classList.toggle("he-visible");
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        stub.classList.remove("he-visible");
      });
    }
  }

  /* ------------------------------------------------------------------
     Render helpers
     ------------------------------------------------------------------ */

  function statusPillClass(status) {
    if (status === "Active") return "he-pill-active";
    if (status === "Expiring Soon") return "he-pill-warn";
    if (status === "Expired") return "he-pill-danger";
    return "he-pill-neutral";
  }

  function expirationAlertHtml(contract) {
    if (contract.status === "Expired") {
      return (
        '<div class="he-alert-inline he-alert-expired">' +
        expiredIconSvg() +
        "<span><strong>Contract expired</strong> on " + contract.expirationDate +
        ". Recommend initiating renewal outreach immediately to avoid network gaps.</span>" +
        "</div>"
      );
    }
    if (contract.status === "Expiring Soon") {
      return (
        '<div class="he-alert-inline">' +
        warnIconSvg() +
        "<span><strong>Expiring in " + contract.daysToExpiration + " day" + (contract.daysToExpiration === 1 ? "" : "s") + "</strong> (" + contract.expirationDate +
        "). Recommend starting the renewal process now.</span>" +
        "</div>"
      );
    }
    return "";
  }

  function warnIconSvg() {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
  }

  function expiredIconSvg() {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  }

  function renderOverview() {
    var el = document.getElementById("he-overview-stats");
    if (!el) return;
    var s = HE_DATA.stats;

    el.innerHTML =
      statTile(s.totalContracts, "Total Contracts", "") +
      statTile(s.activeContracts, "Active Contracts", "he-ok") +
      statTile(s.expiringSoon, "Expiring Soon (30 days)", "he-warn") +
      statTile(s.expired, "Expired Contracts", "he-danger");
  }

  function statTile(value, label, modifier) {
    return (
      '<div class="he-stat-card ' + modifier + '">' +
      '<div class="he-stat-value">' + value + "</div>" +
      '<div class="he-stat-label">' + label + "</div>" +
      "</div>"
    );
  }

  function contractRowHtml(contract) {
    return (
      "<tr>" +
      "<td>" + contract.contractNumber + "</td>" +
      "<td>" + contract.providerName + "</td>" +
      "<td>" + contract.specialty + "</td>" +
      "<td>" + contract.effectiveDate + "</td>" +
      "<td>" + contract.expirationDate + "</td>" +
      "<td><span class='he-badge-pill " + statusPillClass(contract.status) + "'>" + contract.status + "</span></td>" +
      "</tr>"
    );
  }

  function renderContractSearchResults(list) {
    var tbody = document.getElementById("he-contract-search-tbody");
    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--he-slate-400); padding:24px;">No contracts matched your search. Try a contract number, provider name, or NPI.</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(contractRowHtml).join("");
  }

  function wireContractSearch() {
    var input = document.getElementById("he-contract-search-input");
    var btn = document.getElementById("he-contract-search-btn");
    if (!input || !btn) return;

    function doSearch() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        renderContractSearchResults(HE_DATA.contracts);
        return;
      }
      var results = HE_DATA.contracts.filter(function (c) {
        return (
          c.contractNumber.toLowerCase().indexOf(q) !== -1 ||
          c.providerName.toLowerCase().indexOf(q) !== -1 ||
          c.npi.indexOf(q) !== -1
        );
      });
      renderContractSearchResults(results);
    }

    btn.addEventListener("click", doSearch);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") doSearch();
    });
  }

  function renderNetworkInfo() {
    var tbody = document.getElementById("he-network-tbody");
    if (!tbody) return;

    tbody.innerHTML = HE_DATA.networkInfo.map(function (row) {
      return (
        "<tr>" +
        "<td>" + row.contractNumber + "</td>" +
        "<td>" + row.providerName + "</td>" +
        "<td>" + row.networkName + "</td>" +
        "<td><span class='he-badge-pill he-pill-neutral'>" + row.tier + "</span></td>" +
        "<td><span class='he-badge-pill " + (row.enrollmentStatus === "Enrolled" ? "he-pill-active" : "he-pill-warn") + "'>" + row.enrollmentStatus + "</span></td>" +
        "</tr>"
      );
    }).join("");
  }

  function renderFeeSchedules() {
    var tbody = document.getElementById("he-fee-tbody");
    if (!tbody) return;

    tbody.innerHTML = HE_DATA.feeSchedules.map(function (row) {
      return (
        "<tr>" +
        "<td>" + row.contractNumber + "</td>" +
        "<td>" + row.code + "</td>" +
        "<td>" + row.description + "</td>" +
        "<td>" + row.rateType + "</td>" +
        "<td>" + row.rate + "</td>" +
        "<td>" + row.effectiveDate + "</td>" +
        "<td>" + row.endDate + "</td>" +
        "</tr>"
      );
    }).join("");
  }

  function renderAmendments() {
    var tbody = document.getElementById("he-amendment-tbody");
    if (!tbody) return;

    tbody.innerHTML = HE_DATA.amendments.map(function (row) {
      return (
        "<tr>" +
        "<td>" + row.contractNumber + "</td>" +
        "<td>" + row.amendmentDate + "</td>" +
        "<td>" + row.changedField + "</td>" +
        "<td>" + row.oldValue + "</td>" +
        "<td>" + row.newValue + "</td>" +
        "<td>" + row.summary + "</td>" +
        "</tr>"
      );
    }).join("");
  }

  function renderExpiringContracts() {
    var wrap = document.getElementById("he-expiring-list");
    if (!wrap) return;

    var flagged = HE_DATA.contracts.filter(function (c) {
      return c.status === "Expiring Soon" || c.status === "Expired";
    }).sort(function (a, b) { return a.daysToExpiration - b.daysToExpiration; });

    wrap.innerHTML = flagged.map(function (c) {
      return (
        '<div class="he-card-row">' +
        '<div class="he-card-row-head">' +
        '<div>' +
        '<div class="he-card-row-title">' + c.providerName + " &middot; Contract " + c.contractNumber + "</div>" +
        '<div class="he-card-row-sub">' + c.specialty + " &bull; NPI " + c.npi + "</div>" +
        "</div>" +
        "<span class='he-badge-pill " + statusPillClass(c.status) + "'>" + c.status + "</span>" +
        "</div>" +
        '<div class="he-card-row-sub">Effective ' + c.effectiveDate + " &rarr; Expires " + c.expirationDate + "</div>" +
        expirationAlertHtml(c) +
        "</div>"
      );
    }).join("");

    if (!flagged.length) {
      wrap.innerHTML = '<p style="color:var(--he-slate-400); font-size:13.5px;">No contracts are currently expired or expiring within 30 days.</p>';
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLoginPage();
    initDashboard();
  });
})();
