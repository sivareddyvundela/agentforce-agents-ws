/* ==========================================================================
   healthEdge AI — Provider Enrollment Agent
   Login gate, tab switching, and New Enrollment form logic.
   Static demo only — no backend, no network calls.
   ========================================================================== */

(function () {
  "use strict";

  var STATUS_CLASS_MAP = {
    "New": "status-new",
    "Processing": "status-processing",
    "Payment Processing": "status-payment-processing",
    "Finish Application": "status-finish-application",
    "Completed": "status-completed"
  };

  /* ------------------------------------------------------------------
     LOGIN PAGE LOGIC (index.html)
     ------------------------------------------------------------------ */

  function initLoginPage() {
    var loginForm = document.getElementById("loginForm");
    if (!loginForm) {
      return; // Not on the login page.
    }

    renderBadges();
    renderTryAsking();

    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var username = document.getElementById("username").value.trim();
      var password = document.getElementById("password").value;
      var errorEl = document.getElementById("loginError");

      if (!username || !password) {
        errorEl.hidden = false;
        return;
      }

      if (username === HEAI_DEMO_USERNAME && password === HEAI_DEMO_PASSWORD) {
        errorEl.hidden = true;
        sessionStorage.setItem("heAI_authenticated", "true");
        sessionStorage.setItem("heAI_agent", "ProviderEnrollmentAgent");
        window.location.href = "dashboard.html";
      } else {
        errorEl.hidden = false;
      }
    });
  }

  function renderBadges() {
    var badgeRow = document.getElementById("badgeRow");
    if (!badgeRow || typeof HEAI_CAPABILITY_BADGES === "undefined") {
      return;
    }
    var html = "";
    HEAI_CAPABILITY_BADGES.forEach(function (badge) {
      html += '<span class="capability-badge"><span class="badge-icon">' + badge.icon +
        '</span>' + escapeHtml(badge.label) + '</span>';
    });
    badgeRow.innerHTML = html;
  }

  function renderTryAsking() {
    var list = document.getElementById("tryAskingList");
    if (!list || typeof HEAI_TRY_ASKING === "undefined") {
      return;
    }
    var html = "";
    HEAI_TRY_ASKING.forEach(function (prompt) {
      html += "<li>" + escapeHtml(prompt) + "</li>";
    });
    list.innerHTML = html;
  }

  /* ------------------------------------------------------------------
     DASHBOARD LOGIC (dashboard.html)
     ------------------------------------------------------------------ */

  function initDashboard() {
    var sidebar = document.getElementById("appSidebar");
    if (!sidebar) {
      return; // Not on the dashboard page.
    }

    // Auth gate: bounce back to login if not authenticated.
    if (sessionStorage.getItem("heAI_authenticated") !== "true") {
      window.location.href = "index.html";
      return;
    }

    renderNav();
    renderStatTiles();
    renderEnrollmentTable();
    renderDocumentTable();
    renderSpecialtyGrid();
    wireSignOut();
    wireHamburger();
    wireChatLauncher();
    wireEnrollmentForm();
  }

  function renderNav() {
    var navList = document.getElementById("navList");
    if (!navList || typeof HEAI_TABS === "undefined") {
      return;
    }

    var html = "";
    HEAI_TABS.forEach(function (tab, index) {
      html += '<li>' +
        '<button class="nav-item' + (index === 0 ? " active" : "") + '" data-tab-target="' + tab.id + '">' +
        '<span class="nav-icon">' + tab.icon + '</span>' +
        '<span>' + escapeHtml(tab.label) + '</span>' +
        '</button>' +
        '</li>';
    });
    navList.innerHTML = html;

    var navItems = navList.querySelectorAll(".nav-item");
    navItems.forEach(function (item) {
      item.addEventListener("click", function () {
        var targetId = item.getAttribute("data-tab-target");
        switchTab(targetId);

        navItems.forEach(function (i) { i.classList.remove("active"); });
        item.classList.add("active");

        // Collapse mobile nav after selection.
        var sidebarEl = document.getElementById("appSidebar");
        if (sidebarEl) {
          sidebarEl.classList.remove("open");
        }
      });
    });
  }

  function switchTab(tabId) {
    var panels = document.querySelectorAll("[data-tab-panel]");
    panels.forEach(function (panel) {
      panel.hidden = panel.id !== "tab-" + tabId;
    });
  }

  function renderStatTiles() {
    var statGrid = document.getElementById("statGrid");
    if (!statGrid || typeof HEAI_ENROLLMENTS === "undefined") {
      return;
    }

    var counts = {
      "New": 0,
      "Processing": 0,
      "Payment Processing": 0,
      "Finish Application": 0,
      "Completed": 0
    };

    HEAI_ENROLLMENTS.forEach(function (row) {
      if (counts.hasOwnProperty(row.status)) {
        counts[row.status]++;
      }
    });

    var tiles = [
      { label: "New Applications", value: counts["New"] },
      { label: "In Processing", value: counts["Processing"] + counts["Payment Processing"] },
      { label: "Awaiting Completion", value: counts["Finish Application"] },
      { label: "Completed Enrollments", value: counts["Completed"] }
    ];

    var html = "";
    tiles.forEach(function (tile) {
      html += '<div class="stat-tile">' +
        '<div class="stat-value">' + tile.value + '</div>' +
        '<div class="stat-label">' + escapeHtml(tile.label) + '</div>' +
        '</div>';
    });
    statGrid.innerHTML = html;
  }

  function statusPillHtml(status) {
    var cls = STATUS_CLASS_MAP[status] || "status-new";
    return '<span class="status-pill ' + cls + '">' + escapeHtml(status) + '</span>';
  }

  function renderEnrollmentTable() {
    var tbody = document.getElementById("enrollmentTableBody");
    if (!tbody || typeof HEAI_ENROLLMENTS === "undefined") {
      return;
    }

    var html = "";
    HEAI_ENROLLMENTS.forEach(function (row) {
      html += "<tr>" +
        "<td>" + escapeHtml(row.id) + "</td>" +
        "<td>" + escapeHtml(row.applicantName) + "</td>" +
        "<td>" + escapeHtml(row.npi) + "</td>" +
        "<td>" + escapeHtml(row.license) + "</td>" +
        "<td>" + escapeHtml(row.specialty) + "</td>" +
        "<td>" + escapeHtml(row.network) + "</td>" +
        '<td><span class="plan-pill">' + escapeHtml(row.planLevel) + "</span></td>" +
        "<td>" + statusPillHtml(row.status) + "</td>" +
        "</tr>";
    });
    tbody.innerHTML = html;
  }

  function renderDocumentTable() {
    var tbody = document.getElementById("documentTableBody");
    if (!tbody || typeof HEAI_DOCUMENTS === "undefined") {
      return;
    }

    var html = "";
    HEAI_DOCUMENTS.forEach(function (doc) {
      html += "<tr>" +
        "<td>" + escapeHtml(doc.name) + "</td>" +
        "<td>" + escapeHtml(doc.type) + "</td>" +
        "<td>" + escapeHtml(doc.enrollmentId) + "</td>" +
        "<td>" + escapeHtml(doc.uploadedDate) + "</td>" +
        "</tr>";
    });
    tbody.innerHTML = html;
  }

  function renderSpecialtyGrid() {
    var grid = document.getElementById("specialtyGrid");
    if (!grid || typeof HEAI_SPECIALTIES === "undefined") {
      return;
    }

    var html = "";
    HEAI_SPECIALTIES.forEach(function (spec) {
      html += '<div class="specialty-card">' +
        '<div class="specialty-name">' + escapeHtml(spec.name) + "</div>" +
        '<div class="specialty-description">' + escapeHtml(spec.description) + "</div>" +
        "</div>";
    });
    grid.innerHTML = html;
  }

  function wireSignOut() {
    var btn = document.getElementById("signOutBtn");
    if (!btn) {
      return;
    }
    btn.addEventListener("click", function () {
      sessionStorage.removeItem("heAI_authenticated");
      sessionStorage.removeItem("heAI_agent");
      window.location.href = "index.html";
    });
  }

  function wireHamburger() {
    var hamburgerBtn = document.getElementById("hamburgerBtn");
    var sidebar = document.getElementById("appSidebar");
    if (!hamburgerBtn || !sidebar) {
      return;
    }
    hamburgerBtn.addEventListener("click", function () {
      var isOpen = sidebar.classList.toggle("open");
      hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function wireChatLauncher() {
    var launcher = document.getElementById("chatLauncher");
    var panel = document.getElementById("chatStubPanel");
    var closeBtn = document.getElementById("chatStubClose");
    if (!launcher || !panel) {
      return;
    }
    launcher.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
    });
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        panel.hidden = true;
      });
    }
  }

  function wireEnrollmentForm() {
    var form = document.getElementById("enrollmentForm");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var errorEl = document.getElementById("enrollmentFormError");

      var firstName = document.getElementById("firstName").value.trim();
      var lastName = document.getElementById("lastName").value.trim();
      var phone = document.getElementById("phone").value.trim();
      var email = document.getElementById("email").value.trim();
      var npiNumber = document.getElementById("npiNumber").value.trim();
      var licenseNumber = document.getElementById("licenseNumber").value.trim();
      var specialty = document.getElementById("specialty").value;
      var network = document.getElementById("network").value;
      var planLevel = document.getElementById("planLevel").value;

      if (!firstName || !lastName || !phone || !email || !npiNumber ||
          !licenseNumber || !specialty || !network || !planLevel) {
        errorEl.hidden = false;
        return;
      }

      errorEl.hidden = true;

      var newId = generateEnrollmentId();
      var newRow = {
        id: newId,
        applicantName: firstName + " " + lastName,
        npi: npiNumber,
        license: licenseNumber,
        specialty: specialty,
        network: network,
        status: "New",
        planLevel: planLevel
      };

      HEAI_ENROLLMENTS.unshift(newRow);
      renderEnrollmentTable();
      renderStatTiles();

      showSuccessToast("Enrollment " + newId + " submitted successfully for " + newRow.applicantName + ".");
      form.reset();
      resetFileUploadLabel();
    });

    var fileInput = document.getElementById("supportingDocument");
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var textEl = document.getElementById("fileUploadText");
        if (!textEl) {
          return;
        }
        if (fileInput.files && fileInput.files.length > 0) {
          textEl.textContent = fileInput.files[0].name;
        } else {
          resetFileUploadLabel();
        }
      });
    }
  }

  function resetFileUploadLabel() {
    var textEl = document.getElementById("fileUploadText");
    if (textEl) {
      textEl.textContent = "Click to upload PDF, PNG, or JPEG (up to ~4.5MB)";
    }
  }

  function generateEnrollmentId() {
    var digits = Math.floor(Math.random() * 900000) + 100000;
    return "BE-" + digits;
  }

  var toastTimer = null;

  function showSuccessToast(message) {
    var toast = document.getElementById("successToast");
    var textEl = document.getElementById("successToastText");
    if (!toast || !textEl) {
      return;
    }
    textEl.textContent = message;
    toast.hidden = false;

    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(function () {
      toast.hidden = true;
    }, 4500);
  }

  /* ------------------------------------------------------------------
     Utilities
     ------------------------------------------------------------------ */

  function escapeHtml(value) {
    var div = document.createElement("div");
    div.textContent = String(value == null ? "" : value);
    return div.innerHTML;
  }

  /* ------------------------------------------------------------------
     Bootstrap
     ------------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", function () {
    initLoginPage();
    initDashboard();
  });
})();
