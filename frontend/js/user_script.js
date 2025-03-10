function showCustomAlert(message, type = "info") {
  // Remove any existing alerts
  const existingAlerts = document.querySelectorAll(".custom-alert");
  existingAlerts.forEach((alert) => {
    if (alert.classList.contains("alert-removing")) return;
    removeAlert(alert);
  });

  // Create alert container if it doesn't exist
  let alertContainer = document.querySelector(".alert-container");
  if (!alertContainer) {
    alertContainer = document.createElement("div");
    alertContainer.className = "alert-container";
    document.body.appendChild(alertContainer);
  }

  // Create the alert element
  const alert = document.createElement("div");
  alert.className = `custom-alert alert-${type}`;

  // Set alert content with appropriate icon
  let icon = "";
  switch (type) {
    case "success":
      icon =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
      break;
    case "error":
      icon =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
      break;
    case "warning":
      icon =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
      break;
    default:
      icon =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }

  alert.innerHTML = `
            <div class="alert-icon">${icon}</div>
            <div class="alert-message">${message}</div>
            <button class="alert-close" onclick="removeAlert(this.parentNode)">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `;

  // Add to container
  alertContainer.appendChild(alert);

  // Trigger animation
  setTimeout(() => {
    alert.classList.add("alert-visible");
  }, 10);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      removeAlert(alert);
    }
  }, 5000);

  return alert;
}

function removeAlert(alert) {
  if (!alert) return;

  alert.classList.add("alert-removing");
  alert.classList.remove("alert-visible");

  setTimeout(() => {
    if (alert.parentNode) {
      alert.parentNode.removeChild(alert);
    }
  }, 300);
}

// Add CSS styles to the document
document.addEventListener("DOMContentLoaded", function () {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
            /* Alert Container */
            .alert-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                width: calc(100% - 40px);
            }
            
            /* Custom Alert */
            .custom-alert {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: translateX(120%);
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
                overflow: hidden;
                position: relative;
            }
            
            .custom-alert::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 4px;
            }
            
            .alert-visible {
                transform: translateX(0);
                opacity: 1;
            }
            
            .alert-removing {
                transform: translateX(120%);
                opacity: 0;
            }
            
            /* Alert Icon */
            .alert-icon {
                margin-right: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* Alert Message */
            .alert-message {
                flex-grow: 1;
                font-size: 14px;
                line-height: 1.4;
            }
            
            /* Alert Close Button */
            .alert-close {
                background: none;
                border: none;
                padding: 4px;
                margin-left: 8px;
                cursor: pointer;
                opacity: 0.5;
                transition: opacity 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .alert-close:hover {
                opacity: 1;
            }
            
            .alert-close svg {
                width: 16px;
                height: 16px;
                color: #666;
            }
            
            /* Alert Types */
            .alert-success::before {
                background-color: #10B981;
            }
            
            .alert-success .alert-icon svg {
                color: #10B981;
            }
            
            .alert-error::before {
                background-color: #EF4444;
            }
            
            .alert-error .alert-icon svg {
                color: #EF4444;
            }
            
            .alert-warning::before {
                background-color: #F59E0B;
            }
            
            .alert-warning .alert-icon svg {
                color: #F59E0B;
            }
            
            .alert-info::before {
                background-color: #3B82F6;
            }
            
            .alert-info .alert-icon svg {
                color: #3B82F6;
            }
        `;
  document.head.appendChild(styleElement);
});
function addPersistentStyle() {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
        #matchResults {
            display: block !important;
            margin-top: 25px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        .match-item {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            background-color: #f9fafb;
        }
        
        /* Prevent form resubmission */
        form[id="creditRequestForm"] {
            pointer-events: auto !important;
        }
        
        /* Ensure proper visibility of match content */
        #matchContent {
            display: block !important;
            visibility: visible !important;
        }
    `;
  document.head.appendChild(styleElement);
}

document.addEventListener("DOMContentLoaded", function () {
  // Your existing initialization code here...

  // Add the persistent style
  addPersistentStyle();
});
document.addEventListener("DOMContentLoaded", function () {
  // Add these styles to the page
  const styleElement = document.createElement("style");
  styleElement.textContent = `
            /* Match results styling */
            .matches-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 1rem;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .matches-table th, .matches-table td {
                padding: 0.75rem;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .matches-table th {
                background-color: #f3f4f6;
                font-weight: 600;
            }
            
            .match-percentage {
                position: relative;
                height: 24px;
                border-radius: 12px;
                overflow: hidden;
            }
            
            .percentage-bar {
                position: absolute;
                height: 100%;
                left: 0;
                top: 0;
                background-color: rgba(0,0,0,0.1);
                z-index: 1;
            }
            
            .percentage-text {
                position: relative;
                z-index: 2;
                font-weight: 600;
                padding-left: 8px;
                line-height: 24px;
            }
            
            .spinner {
                border: 3px solid rgba(0,0,0,0.1);
                border-radius: 50%;
                border-top: 3px solid #3498db;
                width: 24px;
                height: 24px;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Document viewer styling */
            .document-viewer {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                z-index: 1000;
                overflow: auto;
            }
            
            .document-content {
                position: relative;
                background-color: white;
                margin: 40px auto;
                padding: 20px;
                width: 80%;
                max-width: 900px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .close-btn {
                position: absolute;
                top: 15px;
                right: 15px;
                background-color: #f3f4f6;
                border: none;
                border-radius: 4px;
                padding: 5px 10px;
                cursor: pointer;
            }
            
            .document-section {
                margin-bottom: 1.5rem;
                padding-bottom: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .document-text {
                background-color: #f9fafb;
                padding: 1rem;
                border-radius: 4px;
                max-height: 300px;
                overflow-y: auto;
                white-space: pre-wrap;
                font-family: monospace;
            }
            
            .match-item {
                margin-bottom: 1.5rem;
                padding: 1rem;
                background-color: #f9fafb;
                border-radius: 4px;
            }
            
            .match-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.75rem;
            }
            
            .similarity-indicator {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .similarity-bar {
                width: 100px;
                height: 8px;
                background-color: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .bar-fill {
                height: 100%;
            }
            
            .percentage-value {
                font-weight: 600;
                font-size: 0.9rem;
            }
            
            .common-topics {
                margin-top: 0.75rem;
            }
            
            .common-topics ul {
                margin: 0.5rem 0;
                padding-left: 1.5rem;
            }
            
            .matching-passages {
                margin-top: 0.75rem;
            }
            
            .passages-list {
                max-height: 200px;
                overflow-y: auto;
                margin-top: 0.5rem;
            }
            
            .empty-results {
                text-align: center;
                padding: 2rem;
                color: #6b7280;
            }
            
            .scan-result-header {
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .view-doc-btn {
                background-color: #3b82f6;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 0.4rem 0.8rem;
                cursor: pointer;
                font-size: 0.9rem;
                transition: background-color 0.2s;
            }
            
            .view-doc-btn:hover {
                background-color: #2563eb;
            }
        `;
  document.head.appendChild(styleElement);
});

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  // Create overlay element
  const overlay = document.createElement("div");
  overlay.className = "sidebar-overlay";
  document.body.appendChild(overlay);

  // Toggle sidebar function
  function toggleSidebar() {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");

    // Toggle icon between bars and times
    const icon = menuToggle.querySelector("i");
    if (sidebar.classList.contains("active")) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-times");
    } else {
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  }

  // Event listeners
  menuToggle.addEventListener("click", toggleSidebar);

  // Close sidebar when clicking overlay
  overlay.addEventListener("click", toggleSidebar);

  // Close sidebar when clicking a nav item (optional)
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      if (window.innerWidth <= 576 && sidebar.classList.contains("active")) {
        toggleSidebar();
      }
    });
  });

  // Close sidebar when window is resized above breakpoint
  window.addEventListener("resize", function () {
    if (window.innerWidth > 576 && sidebar.classList.contains("active")) {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");

      const icon = menuToggle.querySelector("i");
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Navigation handling
  const navItems = document.querySelectorAll(".nav-item");
  const pages = document.querySelectorAll(".page");

  function activatePage(pageId) {
    // Deactivate all pages
    pages.forEach((page) => page.classList.remove("active"));
    // Activate target page
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) targetPage.classList.add("active");

    // Update active state in sidebar
    navItems.forEach((item) => {
      item.classList.remove("active");
      if (item.dataset.page === pageId) {
        item.classList.add("active");
      }
    });
  }

  // Add click handlers to nav items
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const pageId = item.dataset.page;
      window.location.hash = `#${pageId}`;
      activatePage(pageId);
    });
  });

  // Handle initial page load
  const initialPage = window.location.hash.substring(1) || "home";
  activatePage(initialPage);

  // File input setup

  // Authentication check
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "user") {
    window.location.href = "login.html";
    return;
  }

  // Update UI with user information
  document.getElementById("username").textContent = user.username;
  document.getElementById("userEmail").textContent = user.email;
  document.getElementById("userAvatar").textContent =
    user.username[0].toUpperCase();

  // Update all credit displays
  updateCreditDisplays(user.credits);

  // Initial data load
  loadCreditRequests();
  loadScanHistory();
});

// Logout function
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// Modal functions
function showCreditRequestModal() {
  document.getElementById("creditRequestModal").style.display = "block";
}

function hideCreditRequestModal() {
  document.getElementById("creditRequestModal").style.display = "none";
  document.getElementById("creditRequestForm").reset();
}

// Load user's credit requests

async function loadCreditRequests() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const response = await fetch(
      `http://localhost:3000/credits/requests/${user.email}`
    );

    if (response.ok) {
      const requests = await response.json();
      const container = document.getElementById("creditRequestsContainer");

      // Check if container exists (should only be on the credit requests page)
      if (!container) return;

      // Clear container and add filtering options
      container.innerHTML = `
                    <div class="filter-controls">
                        <div class="filter-group">
                            <label for="requestSort">Sort by:</label>
                            <select id="requestSort" class="filter-select">
                                <option value="date-desc">Date (Newest First)</option>
                                <option value="date-asc">Date (Oldest First)</option>
                                <option value="status">Status</option>
                                <option value="credits">Credits (High to Low)</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="statusFilter">Status:</label>
                            <select id="statusFilter" class="filter-select">
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                    <div id="requestsList"></div>
                `;

      const requestsList = document.getElementById("requestsList");

      if (!requests || requests.length === 0) {
        requestsList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon"><i class="fas fa-inbox"></i></div>
                        <p>No credit requests found</p>
                    </div>`;
        return;
      }

      // Function to render requests with current filters
      function renderRequests() {
        const sortBy = document.getElementById("requestSort").value;
        const statusFilter = document.getElementById("statusFilter").value;

        // Apply filters
        let filteredRequests = [...requests];
        if (statusFilter !== "all") {
          filteredRequests = filteredRequests.filter(
            (req) => req.status === statusFilter
          );
        }

        // Sort requests
        filteredRequests.sort((a, b) => {
          switch (sortBy) {
            case "date-desc":
              return new Date(b.request_date) - new Date(a.request_date);
            case "date-asc":
              return new Date(a.request_date) - new Date(b.request_date);
            case "status":
              return a.status.localeCompare(b.status);
            case "credits":
              return b.credits - a.credits;
            default:
              return new Date(b.request_date) - new Date(a.request_date);
          }
        });

        // Clear and rebuild the list
        requestsList.innerHTML = "";

        if (filteredRequests.length === 0) {
          requestsList.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon"><i class="fas fa-filter"></i></div>
                            <p>No requests match your filters</p>
                        </div>`;
          return;
        }

        filteredRequests.forEach((request) => {
          const statusClass =
            request.status === "pending"
              ? "status-pending"
              : request.status === "approved"
              ? "status-approved"
              : "status-rejected";

          // Format date in a more readable format
          const requestDate = new Date(request.request_date);
          const formattedDate = requestDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          const formattedTime = requestDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });

          // Create status display
          let statusText = request.status.toUpperCase();
          let rejectionInfo = "";

          if (request.status === "rejected" && request.rejection_reason) {
            rejectionInfo = `
                            <div class="rejection-box">
                                <div class="rejection-header">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <span>Purpose for Rejection:</span>
                                </div>
                                <p class="rejection-text">${request.rejection_reason}</p>
                            </div>`;
          }

          const requestItem = document.createElement("div");
          requestItem.className = "credit-request-item";
          requestItem.innerHTML = `
                        <div class="request-header">
                            <div class="request-date-wrapper">
                                <div class="request-date">
                                    <i class="fas fa-calendar-alt"></i>
                                    <span>${formattedDate}</span>
                                </div>
                                <div class="request-time">
                                    <i class="fas fa-clock"></i>
                                    <span>${formattedTime}</span>
                                </div>
                            </div>
                            <span class="request-status ${statusClass}">
                                ${statusText}
                            </span>
                        </div>
                        <div class="request-details">
                            <div class="credits-requested">
                                <h4><i class="fas fa-coins"></i> ${
                                  request.credits
                                } Credits Requested</h4>
                            </div>
                            <div class="request-reason-box">
                                <div class="reason-header">Reason for Request:</div>
                                <p class="request-reason">${request.reason}</p>
                            </div>
                            ${
                              request.status === "approved"
                                ? `
                                <div class="approved-box">
                                    <p class="approved-amount">
                                        <i class="fas fa-check-circle"></i>
                                        <span>Approved: ${request.approved_credits} credits</span>
                                    </p>
                                </div>`
                                : ""
                            }
                            ${rejectionInfo}
                        </div>`;

          requestsList.appendChild(requestItem);
        });
      }

      // Initial render
      renderRequests();

      // Add event listeners for filters
      document
        .getElementById("requestSort")
        .addEventListener("change", renderRequests);
      document
        .getElementById("statusFilter")
        .addEventListener("change", renderRequests);

      // Update credits if any approved requests exist
      if (requests.some((r) => r.status === "approved")) {
        updateUserCredits();
      }
    }
  } catch (error) {
    console.error("Error loading credit requests:", error);
    const container = document.getElementById("creditRequestsContainer");
    if (container) {
      container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <p>Error loading credit requests</p>
                </div>`;
    }
  }
}
async function updateUserCredits() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const response = await fetch(
      `http://localhost:3000/credits/balance/${user.email}`
    );

    if (response.ok) {
      const { credits } = await response.json();
      user.credits = credits;
      localStorage.setItem("user", JSON.stringify(user));
      document.getElementById("userCredits").textContent = credits;
      localStorage.setItem("user", JSON.stringify(user));
      document.getElementById("userCreditsDetail").textContent = credits;
    }
  } catch (error) {
    console.error("Error updating user credits:", error);
  }
}
function updateCreditDisplays(credits) {
  // Update credit display in header
  const userCreditsElement = document.getElementById("userCredits");
  if (userCreditsElement) {
    userCreditsElement.textContent = credits;
  }

  // Update credit detail display on the credit page
  const userCreditsDetailElement = document.getElementById("userCreditsDetail");
  if (userCreditsDetailElement) {
    userCreditsDetailElement.textContent = credits;
  }

  // Update any other credit displays
  document.querySelectorAll(".credit-display").forEach((el) => {
    el.textContent = credits;
  });

  // Show low credit warning if needed
  if (credits <= 0) {
    showLowCreditWarning();
  }
}
async function loadScanHistory() {
  const historyList = document.getElementById("scanHistory");
  if (!historyList) return; // Exit if not on the history page

  const user = JSON.parse(localStorage.getItem("user"));

  try {
    const response = await fetch(
      `http://localhost:3000/assignment/history/${user.email}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch scan history");
    }

    const history = await response.json();
    historyList.innerHTML = ""; // Clear existing history

    if (history.length === 0) {
      historyList.innerHTML = `
                <li class="history-item">
                    <div class="history-details">
                        <p style="color: #6b7280; font-style: italic;">No documents scanned yet</p>
                    </div>
                </li>`;
      return;
    }

    history.forEach(async (scan) => {
      const historyItem = document.createElement("li");
      historyItem.className = "history-item";

      // Initial rendering with loading state
      historyItem.innerHTML = `
        <div class="history-details">
            <span class="doc-name">${scan.fileName}</span>
            <span class="scan-date">${new Date(
              scan.scanDate
            ).toLocaleDateString()}</span>
            <div class="match-info">
                <span class="match-count" id="match-count-${scan.documentId}">
                    Loading similar documents...
                </span>
            </div>
        </div>
        <button class="view-doc-btn" onclick="viewDocument('${
          scan.documentId
        }')">
            View
        </button>`;

      historyList.appendChild(historyItem);

      try {
        const docResponse = await fetch(
          `http://localhost:3000/assignment/document/${scan.documentId}?email=${user.email}`
        );
        if (docResponse.ok) {
          const documentData = await docResponse.json();
          const matchCount = documentData.matches
            ? documentData.matches.length
            : 0;

          // Update the match count display
          const matchCountElement = document.getElementById(
            `match-count-${scan.documentId}`
          );
          if (matchCountElement) {
            matchCountElement.textContent = `${matchCount} similar document${
              matchCount === 1 ? "" : "s"
            } found`;
          }
        }
      } catch (error) {
        console.error(
          `Error fetching match count for document ${scan.documentId}:`,
          error
        );
        const matchCountElement = document.getElementById(
          `match-count-${scan.documentId}`
        );
        if (matchCountElement) {
          matchCountElement.textContent = "Error loading matches";
        }
      }
    });
  } catch (error) {
    console.error("Error loading scan history:", error);
    historyList.innerHTML = `
            <li class="history-item">
                <div class="history-details">
                    <p style="color: var(--danger-color);">Error loading scan history. Please try again later.</p>
                </div>
            </li>`;
  }
}

// Function to load scan history with match information
function closeDocumentViewer() {
  document.getElementById("documentViewer").style.display = "none";
}

function displayMatchResults(matches) {
  console.log(
    "displayMatchResults called with",
    matches ? matches.length : 0,
    "matches"
  );

  // Get reference to the results container
  const matchResults = document.getElementById("matchResults");

  if (!matchResults) {
    console.error("Results container not found");
    return;
  }

  // Clear previous results
  matchResults.innerHTML = "";

  // Safety check for matches
  if (!matches || !Array.isArray(matches)) {
    console.error("Invalid matches data:", matches);
    matches = [];
  }

  // Create heading for matches count
  const headingContainer = document.createElement("div");
  headingContainer.style.padding = "16px 16px 0 16px";
  headingContainer.style.borderBottom = "1px solid #e0e0e0";
  headingContainer.style.marginBottom = "8px";

  const heading = document.createElement("h3");
  heading.textContent = `Matching Similarity: ${matches.length} Document${
    matches.length !== 1 ? "s" : ""
  } Found`;
  heading.style.margin = "0 0 16px 0";
  heading.style.color = "#333";
  heading.style.fontSize = "18px";
  heading.style.fontWeight = "bold";

  headingContainer.appendChild(heading);
  matchResults.appendChild(headingContainer);

  // Create a container for all matches
  const matchesContainer = document.createElement("div");
  matchesContainer.className = "matches-container";
  matchesContainer.style.display = "flex";
  matchesContainer.style.flexDirection = "column";
  matchesContainer.style.gap = "16px";
  matchesContainer.style.width = "100%";
  matchesContainer.style.padding = "0 16px 16px 16px";
  matchesContainer.style.boxSizing = "border-box";

  // Populate matches
  matches.forEach((match) => {
    const matchElement = document.createElement("div");
    matchElement.className = "match-item";
    matchElement.style.display = "flex";
    matchElement.style.flexDirection = "row";
    matchElement.style.flexWrap = "wrap";
    matchElement.style.justifyContent = "space-between";
    matchElement.style.alignItems = "center";
    matchElement.style.padding = "16px";
    matchElement.style.backgroundColor = "#f8f9fa";
    matchElement.style.borderRadius = "8px";
    matchElement.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
    matchElement.style.gap = "12px";
    matchElement.style.transition = "all 0.2s ease";

    // Add hover effect
    matchElement.onmouseover = function () {
      this.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
      this.style.backgroundColor = "#f1f3f4";
    };
    matchElement.onmouseout = function () {
      this.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
      this.style.backgroundColor = "#f8f9fa";
    };

    // Document name
    const docName = document.createElement("div");
    docName.textContent = `Document : ${
      match.fileName || match.documentId || "Unnamed Document"
    }`;
    docName.style.fontWeight = "bold";
    docName.style.color = "#333";
    docName.style.flexGrow = "1";
    docName.style.minWidth = "150px";
    docName.style.margin = "4px 0";

    // Match percentage with progress bar
    const percentageContainer = document.createElement("div");
    percentageContainer.style.display = "flex";
    percentageContainer.style.alignItems = "center";
    percentageContainer.style.gap = "8px";
    percentageContainer.style.flexGrow = "1";
    percentageContainer.style.minWidth = "150px";
    percentageContainer.style.margin = "4px 0";

    const progressBar = document.createElement("div");
    progressBar.style.width = "100%";
    progressBar.style.maxWidth = "120px";
    progressBar.style.height = "8px";
    progressBar.style.backgroundColor = "#e0e0e0";
    progressBar.style.borderRadius = "4px";
    progressBar.style.overflow = "hidden";

    const progress = document.createElement("div");
    progress.style.width = `${match.percentage}%`;
    progress.style.height = "100%";
    progress.style.backgroundColor = "#4285f4";
    progressBar.appendChild(progress);

    const percentText = document.createElement("span");
    percentText.textContent = `${match.percentage}% match`;
    percentText.style.whiteSpace = "nowrap";

    percentageContainer.appendChild(progressBar);
    percentageContainer.appendChild(percentText);

    // View Document button
    const viewButton = document.createElement("button");
    viewButton.textContent = "View Document";
    viewButton.style.backgroundColor = "#4285f4";
    viewButton.style.color = "white";
    viewButton.style.border = "none";
    viewButton.style.borderRadius = "4px";
    viewButton.style.padding = "8px 16px";
    viewButton.style.cursor = "pointer";
    viewButton.style.fontWeight = "bold";
    viewButton.style.margin = "4px 0";
    viewButton.style.transition = "background-color 0.2s ease";

    // Add button hover effects
    viewButton.onmouseover = function () {
      this.style.backgroundColor = "#3367d6";
    };
    viewButton.onmouseout = function () {
      this.style.backgroundColor = "#4285f4";
    };

    // Connect to the viewDocument function for each button
    viewButton.addEventListener("click", () => {
      // Call the viewDocument function with the document ID
      viewDocument(match.documentId);
    });

    // Add all elements to the match item
    matchElement.appendChild(docName);
    matchElement.appendChild(percentageContainer);
    matchElement.appendChild(viewButton);

    // Add the match item to the container
    matchesContainer.appendChild(matchElement);
  });

  // Add the matches container to the results
  matchResults.appendChild(matchesContainer);

  // Add responsive media queries through a style tag
  const styleElement = document.createElement("style");
  styleElement.textContent = `
        @media (max-width: 768px) {
            .match-item {
                flex-direction: column !important;
                align-items: flex-start !important;
            }
            
            .match-item > div, 
            .match-item > button {
                width: 100% !important;
                margin: 4px 0 !important;
            }
        }
    `;
  document.head.appendChild(styleElement);

  // Ensure the results are visible
  matchResults.style.display = "block";

  // Scroll to results
  matchResults.scrollIntoView({ behavior: "smooth" });
}

async function submitCreditRequest(event) {
  // Prevent the default form submission
  event.preventDefault();

  const user = JSON.parse(localStorage.getItem("user"));
  const credits = document.getElementById("creditAmount").value;
  const reason = document.getElementById("requestReason").value;

  try {
    const response = await fetch("http://localhost:3000/credits/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        credits: parseInt(credits),
        reason,
        status: "pending",
      }),
    });

    if (response.ok) {
      showCustomAlert("Credit request submitted successfully!", "success");
      hideCreditRequestModal();
      // Reload credit requests to show the new one without page reload
      loadCreditRequests();

      // Reset form fields
      document.getElementById("creditAmount").value = "";
      document.getElementById("requestReason").value = "";
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to submit request");
    }
  } catch (error) {
    showCustomAlert(
      `Error submitting credit request: ${error.message}`,
      "error"
    );
    console.error(error);
  }

  // Return false to prevent form submission
  return false;
}
// Modify the processFileUpload function to prevent page navigation
async function processFileUpload(file) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.credits < 1) {
    showCustomAlert(
      "You have insufficient credits to perform a document scan.",
      "error"
    );
    return;
  }

  // Store original content before changing
  const uploadArea = document.querySelector(".upload-area");
  const originalContent = uploadArea.innerHTML;

  // Show loading state with animation
  uploadArea.innerHTML = `
        <div class="upload-icon">
            <div class="spinner"></div>
        </div>
        <p>Scanning document for similarities...</p>
        <p style="color: #6b7280; font-size: 0.9rem;">This may take a moment</p>
    `;

  // Make sure match results are hidden while loading
  const matchResults = document.getElementById("matchResults");
  if (matchResults) {
    matchResults.style.display = "none";
  }

  const formData = new FormData();
  formData.append("document", file);
  formData.append("email", user.email);

  try {
    const response = await fetch("http://localhost:3000/assignment/scan", {
      method: "POST",
      body: formData,
    });
    let result;
    try {
      result = await response.json();
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      throw new Error("Server returned an invalid response");
    }

    if (!response.ok) {
      throw new Error(result.error || "Failed to scan document");
    }

    // Update credits and UI
    user.credits = result.remainingCredits;
    localStorage.setItem("user", JSON.stringify(user));
    updateCreditDisplays(user.credits);

    // Reset upload area to original state
    uploadArea.innerHTML = originalContent;

    // Debug
    console.log("Scan result received:", result);
    console.log("Matches:", result.matches ? result.matches.length : 0);

    // Ensure we have the match results container
    if (!matchResults) {
      console.error("Match results container not found");
      return;
    }

    // Clear any existing content in matchContent
    const matchContent = document.getElementById("matchContent");
    if (matchContent) {
      matchContent.innerHTML = "";
    }

    // Display results immediately
    if (result.matches) {
      displayMatchResults(result.matches);
    } else {
      // Handle case where matches might be missing
      displayMatchResults([]);
    }

    // Force match results to be visible
    matchResults.style.display = "block";

    window.addEventListener(
      "beforeunload",
      function (e) {
        // Cancel the event
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = "";
      },
      { once: true }
    );

    // Show success message
    showCustomAlert(
      `Scan complete! Found ${
        result.matches ? result.matches.length : 0
      } matches`,
      "success"
    );

    // Update history without reloading
    loadScanHistory();
  } catch (error) {
    console.error("Upload error:", error);

    // Display error state
    uploadArea.innerHTML = `
            <div class="upload-icon">❌</div>
            <p style="color: var(--danger-color);">${
              error.message || "Error scanning document"
            }</p>
            <p style="color: #6b7280; font-size: 0.9rem;">Click to try again</p>
        `;

    // Reset to original state after a delay
    setTimeout(() => {
      uploadArea.innerHTML = originalContent;
    }, 5000);
  }

  // Reset file input
  document.getElementById("fileInput").value = "";

  return false;
}

// 7. Low credit warning function
function showLowCreditWarning() {
  // Check if warning already exists
  if (document.getElementById("credit-warning")) return;

  const warningDiv = document.createElement("div");
  warningDiv.id = "credit-warning";
  warningDiv.className = "credit-warning";
  warningDiv.innerHTML = `
            <div class="warning-icon">⚠️</div>
            <div class="warning-message">
                <p><strong>You have 0 credits left.</strong></p> 
                <p>Request more credits or wait until midnight reset.</p>
            </div>
            <button class="close-warning" onclick="this.parentElement.remove()">×</button>
        `;

  document.body.appendChild(warningDiv);

  // Add style for warning
  const style = document.createElement("style");
  style.textContent = `
            .credit-warning {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 1rem;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                z-index: 1000;
                max-width: 400px;
            }
            
            .warning-icon {
                font-size: 1.5rem;
            }
            
            .warning-message p {
                margin: 0.25rem 0;
            }
            
            .close-warning {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: none;
                border: none;
                font-size: 1.25rem;
                cursor: pointer;
                color: #6b7280;
            }
        `;
  document.head.appendChild(style);
}

function initCreditRequestForm() {
  const form = document.getElementById("creditRequestForm");
  if (form) {
    form.onsubmit = function (event) {
      return submitCreditRequest(event);
    };
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the credit request form
  initCreditRequestForm();
});
function triggerFileUpload() {
  const fileInput = document.getElementById("fileInput");
  fileInput.click();

  fileInput.onchange = function () {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    // Check if user has enough credits
    if (user.credits <= 0) {
      showCustomAlert(
        "You have insufficient credits to perform a document scan. Please request additional credits.",
        "error"
      );

      // Reset the file input
      fileInput.value = "";
      return;
    }

    // If we have credits, proceed with handling the file
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      processFileUpload(file);
    }
  };
}

// Function to display match results
// Consolidated handleFileUpload function

document.addEventListener("DOMContentLoaded", function () {
  // Add these styles to the page
  const styleElement = document.createElement("style");
  styleElement.textContent = `
                .document-matches {
                    margin-top: 1.5rem;
                    border-top: 1px solid var(--border-color);
                    padding-top: 1rem;
                }
                
                
                
                .common-topics {
                    margin-top: 0.5rem;
                    font-size: 0.9rem;
                }
                
                .common-topics ul {
                    margin: 0.5rem 0;
                    padding-left: 1.5rem;
                }
                
                .passages-list {
                    max-height: 200px;
                    overflow-y: auto;
                    margin-top: 0.5rem;
                }
                
                .common-topics-preview {
                    color: #4b5563;
                    font-size: 0.85rem;
                    margin: 0.2rem 0;
                }
                
                .highlighted-text {
                    background-color: #FFCCCC;
                }
                
                .similarity-options {
                    display: flex;
                    gap: 1rem;
                    margin: 1rem 0;
                }
                
                .toggle-highlights {
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 0.4rem 0.8rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
            `;
  document.head.appendChild(styleElement);
});
// Add document to history
function addToHistory(fileName, matches) {
  const historyList = document.getElementById("scanHistory");
  const historyItem = document.createElement("li");
  historyItem.className = "history-item";

  const matchCount = matches ? matches.length : 0;
  historyItem.innerHTML = `
                        <div>
                            <span>${fileName}</span>
                            <p style="color: #6b7280; font-size: 0.8rem;">
                                ${matchCount} similar documents found
                            </p>
                        </div>
                        <button class="view-doc-btn" onclick="viewDocument('${fileName}')">
                            View
                        </button>
                    `;

  historyList.insertBefore(historyItem, historyList.firstChild);
}

document.addEventListener("DOMContentLoaded", function () {
  // When the credit page is loaded
  if (document.getElementById("credits-page")) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.credits !== undefined) {
      updateCreditDisplays(user.credits);
    } else {
      // Fetch credits if not available in localStorage
      updateUserCredits();
    }
  }
});

async function viewDocument(documentId) {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const response = await fetch(
      `http://localhost:3000/assignment/document/${documentId}?email=${user.email}`
    );

    if (response.ok) {
      const documentData = await response.json();

      // Debug: Log the documentData to see what's being returned
      console.log("Document Data:", documentData);
      console.log("File Name:", documentData.fileName);

      const viewer = document.getElementById("documentViewer");
      const content = document.getElementById("documentContent");
      const title = document.getElementById("viewerTitle");

      const documentName =
        documentData.file_name ||
        documentData.name ||
        documentData.title ||
        documentData.documentName ||
        "Untitled Document";

      title.textContent = documentName;

      // Create document text display with the document name included
      let htmlContent = `
    <div class="document-section">
        <h3>Document Name: ${documentName}</h3>
        <h3>Document Content</h3>
        <div class="document-text"><pre>${documentData.content}</pre></div>
    </div>`;

      // Add matches section if there are matches
      if (documentData.matches && documentData.matches.length > 0) {
        htmlContent += `
                        <div class="document-matches">
                            <h3>Similar Documents (${documentData.matches.length})</h3>
                            <div id="matchesList" class="matches-list"></div>
                        </div>
                    `;
      }

      content.innerHTML = htmlContent;

      // Add match details if there are matches
      if (documentData.matches && documentData.matches.length > 0) {
        const matchesList = document.getElementById("matchesList");

        documentData.matches.forEach((match) => {
          const matchDiv = document.createElement("div");
          matchDiv.className = "match-item";

          // Apply color based on match percentage
          let matchBorderColor = "#e9f7ef"; // Light green for low matches
          if (match.percentage >= 80) {
            matchBorderColor = "#fadbd8"; // Light red for high matches
          } else if (match.percentage >= 50) {
            matchBorderColor = "#fef9e7"; // Light yellow for medium matches
          }

          matchDiv.style.borderLeft = `4px solid ${matchBorderColor}`;

          // Create topics list if available
          let topicsList = "";
          if (match.commonTopics && match.commonTopics.length > 0) {
            topicsList = `
                                <div class="common-topics">
                                    <h4>Common Topics:</h4>
                                    <ul>
                                        ${match.commonTopics
                                          .map((topic) => `<li>${topic}</li>`)
                                          .join("")}
                                    </ul>
                                </div>
                            `;
          }

          // Create matching passages section if available
          let passagesList = "";
          if (match.matchingPassages && match.matchingPassages.length > 0) {
            passagesList = `
                                <div class="matching-passages">
                                    <h4>Matching Content:</h4>
                                    <div class="passages-list">
                                        ${match.matchingPassages
                                          .map(
                                            (passage) =>
                                              `<div class="passage" style="background-color: #ffecec; padding: 8px; margin-bottom: 8px; border-radius: 4px;">${passage}</div>`
                                          )
                                          .join("")}
                                    </div>
                                </div>
                            `;
          }

          matchDiv.innerHTML = `
                            <div class="match-details">
                                <div class="match-header">
                                    <h4>${match.fileName}</h4>
                                    <div class="similarity-indicator">
                                        <div class="similarity-bar">
                                            <div class="bar-fill" style="width: ${
                                              match.percentage
                                            }%; background-color: ${matchBorderColor}"></div>
                                        </div>
                                        <span class="percentage-value">${match.percentage.toFixed(
                                          1
                                        )}% similar</span>
                                    </div>
                                </div>
                                ${topicsList}
                                ${passagesList}
                            </div>
                            <button class="view-doc-btn" onclick="viewDocument('${
                              match.documentId
                            }')">
                                View Document
                            </button>
                        `;

          matchesList.appendChild(matchDiv);
        });
      }

      viewer.style.display = "block";
    } else {
      throw new Error("Failed to load document");
    }
  } catch (error) {
    console.error("Error viewing document:", error);
    alert("Failed to load document: " + error.message);
  }
}

// Function to close document viewer
function closeDocumentViewer() {
  const viewer = document.getElementById("documentViewer");
  viewer.style.display = "none";
}

function setupDocumentListListeners() {
  const documentItems = document.querySelectorAll(".document-item"); //

  documentItems.forEach((item) => {
    item.addEventListener("click", function () {
      const documentId = this.getAttribute("data-document-id");
      if (documentId) {
        viewDocument(documentId);
      }
    });
  });
}

// Call this function after your document list is loaded
document.addEventListener("DOMContentLoaded", function () {
  setupDocumentListListeners();
});
// Close document viewer
function closeDocumentViewer() {
  document.getElementById("documentViewer").style.display = "none";
}

loadScanHistory();
