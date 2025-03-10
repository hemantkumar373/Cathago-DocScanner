// Function to format date
// Format date helper function
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

// Check admin authentication on page load
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "admin") {
    window.location.href = "login.html";
    return;
  }

  // Update UI with admin data
  document.getElementById("username").textContent = user.username;
  document.getElementById("userEmail").textContent = user.email;
  document.getElementById("userAvatar").textContent =
    user.username[0].toUpperCase();

  // Load initial data
  loadDashboardData();
  loadCreditRequests();
  loadUsers();
  loadAdmins();

  // Set up tab switching
  setupTabs();
});

// Tab switching functionality
function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and content
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active");
      });

      // Add active class to clicked button and corresponding content
      button.classList.add("active");
      const tabId = button.dataset.tab;
      document.getElementById(tabId).classList.add("active");
    });
  });
}

// Logout function
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// ===== DASHBOARD DATA LOADING =====
async function loadDashboardData() {
  try {
    // Fetch dashboard statistics
    const statsResponse = await fetch(
      "http://localhost:3000/admin/dashboard/stats"
    );
    if (!statsResponse.ok)
      throw new Error("Failed to fetch dashboard statistics");
    const stats = await statsResponse.json();

    // Update dashboard statistics with real data
    document.getElementById("totalUsers").textContent = stats.totalUsers || "0";
    document.getElementById("totalDocuments").textContent =
      stats.totalDocuments || "0";
    document.getElementById("pendingRequests").textContent =
      stats.pendingRequests || "0";
    document.getElementById("totalAdmins").textContent =
      stats.totalAdmins || "0";

    // Fetch recent activity (from today only)
    const activityResponse = await fetch(
      "http://localhost:3000/admin/dashboard/activity"
    );
    if (!activityResponse.ok)
      throw new Error("Failed to fetch recent activity");
    const activities = await activityResponse.json();

    // Load recent activity
    const activityTable = document.getElementById("activityTable");
    activityTable.innerHTML = "";

    if (activities.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML =
        '<td colspan="4" class="text-center">No activity today</td>';
      activityTable.appendChild(row);
    } else {
      activities.forEach((activity) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${activity.username || activity.user_email}</td>
                    <td>${activity.action}</td>
                    <td>${activity.details}</td>
                    <td>${formatTimestamp(activity.timestamp)}</td>
                `;
        activityTable.appendChild(row);
      });
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    showNotification("Failed to load dashboard data", "error");
  }
}

function formatTimestamp(timestamp) {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;

  return activityTime.toLocaleString();
}

function showNotification(message, type = "info") {
  if (type === "error") {
    console.error(message);
  }
}

// Load dashboard data when page loads
document.addEventListener("DOMContentLoaded", loadDashboardData);

// Load credit requests from the server
async function loadCreditRequests() {
  try {
    const statusFilter = document.getElementById("requestStatusFilter").value;

    // Fetch requests from the server
    const response = await fetch("http://localhost:3000/admin/credits/pending");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const requests = await response.json();
    if (!Array.isArray(requests)) {
      throw new Error("Invalid data received from server");
    }

    const requestsTable = document.getElementById("creditRequestsTable");
    requestsTable.innerHTML = "";

    // Filter requests based on status
    const filteredRequests =
      statusFilter === "all"
        ? requests
        : requests.filter((request) => request.status === statusFilter);

    if (filteredRequests.length === 0) {
      requestsTable.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">No credit requests found</td>
                </tr>
            `;
      return;
    }

    filteredRequests.forEach((request) => {
      const row = document.createElement("tr");
      const statusClass =
        {
          pending: "badge-warning",
          approved: "badge-success",
          rejected: "badge-danger",
        }[request.status] || "badge-secondary";

      console.log(request);
      row.innerHTML = `
                <td>${request.username || "N/A"}</td>
                <td>${request.user_email}</td>
                <td>${request.credits}</td>
                <td>${
                  request.approved_credits !== null
                    ? request.approved_credits
                    : "-"
                }</td>
                <td>${request.reason}</td>
                <td>${formatDate(request.request_date)}</td>
                <td><span class="badge ${statusClass}">${
        request.status || "pending"
      }</span></td>
                <td>${request.rejection_reason || "-"}</td>
                <td class="action-btn-group">
                    ${
                      !request.status || request.status === "pending"
                        ? `
                        <button class="btn btn-success" onclick="showCreditApprovalModal(${request.id}, '${request.user_email}', ${request.credits})">
                            Approve
                        </button>
                        <button class="btn btn-danger" onclick="rejectCreditRequest(${request.id})">
                            Reject
                        </button>
                    `
                        : ""
                    }
                </td>
            `;
      requestsTable.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading credit requests:", error);
    const requestsTable = document.getElementById("creditRequestsTable");
    requestsTable.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-red-600">
                    Error loading credit requests. Please try again later.
                </td>
            </tr>
        `;
  }
}

// Function to show credit approval modal
function showCreditApprovalModal(requestId, userEmail, requestedCredits) {
  document.getElementById("creditRequestId").value = requestId;
  document.getElementById("requestingUser").value = userEmail;
  document.getElementById("requestedAmount").value = requestedCredits;
  document.getElementById("approvedAmount").value = requestedCredits;
  document.getElementById("creditApprovalModal").style.display = "block";
}

function hideCreditApprovalModal() {
  document.getElementById("creditApprovalModal").style.display = "none";
}

// Handle credit approval form submission
document
  .getElementById("creditApprovalForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const requestId = document.getElementById("creditRequestId").value;
    const approvedAmount = document.getElementById("approvedAmount").value;
    const note = document.getElementById("approvalNote").value;

    try {
      const response = await fetch(
        "http://localhost:3000/admin/credits/approve",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId,
            action: "approved",
            approvedAmount: parseInt(approvedAmount),
            note,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve credits");
      }

      alert("Credits approved successfully!");
      hideCreditApprovalModal();
      loadCreditRequests();
    } catch (error) {
      console.error("Error approving credits:", error);
      alert("Error approving credits");
    }
  });

function rejectCreditRequest(requestId) {
  // Create and display modal
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.display = "block";
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Reject Credit Request</h2>
            </div>
            <form onsubmit="return false;">
                <div class="form-group">
                    <label>Rejection Reason</label>
                    <textarea id="rejectionReason" required class="form-control"></textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="modal-btn cancel-btn" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="modal-btn submit-btn" onclick="submitRejection(${requestId})">Submit</button>
                </div>
            </form>
        </div>
    `;
  document.body.appendChild(modal);
}
// Function to filter credit requests
function filterCreditRequests() {
  loadCreditRequests();
}

// ===== USER MANAGEMENT =====
async function loadUsers() {
  try {
    const response = await fetch("http://localhost:3000/admin/users");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const users = await response.json();

    const usersTable = document.getElementById("usersTable");
    usersTable.innerHTML = "";

    users.forEach((user) => {
      const row = document.createElement("tr");
      const statusClass =
        user.status === "active" ? "badge-success" : "badge-danger";

      // Store user data directly in the row
      row.dataset.userId = user.id;
      row.dataset.username = user.username;
      row.dataset.email = user.email;

      row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.credits}</td>
                <td>${user.role}</td>
                <td><span class="badge ${statusClass}">${
        user.status
      }</span></td>
                <td class="action-btn-group">
                    <button class="btn btn-primary" onclick="showEditUserModal(${
                      user.id
                    }, '${user.username}', '${user.email}', ${user.credits}, '${
        user.role
      }')">Edit</button>
                    <button class="btn btn-${
                      user.status === "active" ? "warning" : "success"
                    }" 
                            onclick="toggleUserStatus(${user.id})">
                        ${user.status === "active" ? "" : ""}
                    </button>
                    <button class="btn btn-danger" onclick="deleteUser(${
                      user.id
                    })">Delete</button>
                    ${
                      user.role === "user"
                        ? `<button class="btn btn-primary" onclick="promoteToAdmin(${user.id})">Make Admin</button>`
                        : ""
                    }
                </td>
            `;
      usersTable.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading users:", error);
    const usersTable = document.getElementById("usersTable");
    usersTable.innerHTML = `
            <tr><td colspan="6" class="text-center text-red-600">
                Error loading users. Please try again later.
            </td></tr>
        `;
  }
}

async function deleteUser(userId) {
  // Show confirmation dialog
  if (
    !confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/admin/users/${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete user");
    }

    showToast("User deleted successfully", "success");
    loadUsers(); // Reload the users table
  } catch (error) {
    console.error("Error deleting user:", error);
    showToast(`Error deleting user: ${error.message}`, "error");
  }
}

async function handleRejection(event, requestId) {
  event.preventDefault();
  const rejectionReason = document.getElementById("rejectionReason").value;

  if (!rejectionReason.trim()) {
    alert("Please provide a rejection reason");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/admin/credits/approve",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          action: "rejected",
          rejectionReason,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to reject credit request");
    }

    const result = await response.json();
    alert("Credit request rejected successfully");
    closeRejectionModal();
    loadCreditRequests(); // Reload the credit requests table
  } catch (error) {
    console.error("Error rejecting credit request:", error);
    alert("Error rejecting credit request: " + error.message);
  }
}

// Function to handle rejection submission
async function submitRejection(requestId) {
  const rejectionReason = document.getElementById("rejectionReason").value;

  if (!rejectionReason.trim()) {
    alert("Please provide a rejection reason");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/admin/credits/approve",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          action: "rejected",
          rejectionReason,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to reject credit request");
    }

    await response.json();
    alert("Credit request rejected successfully");
    // Remove the modal
    document.querySelector(".modal").remove();
    // Reload the credit requests
    loadCreditRequests();
  } catch (error) {
    console.error("Error rejecting credit request:", error);
    alert("Error rejecting credit request: " + error.message);
  }
}
function showAddUserModal() {
  document.getElementById("userModalTitle").textContent = "Add User";
  document.getElementById("userId").value = "";
  document.getElementById("userUsername").value = "";
  document.getElementById("userEmail").value = "";
  document.getElementById("userPassword").value = "";
  document.getElementById("userCredits").value = "20";
  document.getElementById("userRole").value = "user";
  document.getElementById("userPassword").required = true;
  document.getElementById("userModal").style.display = "block";
}

// Update the showEditUserModal function
function showEditUserModal(id, username, email, credits, role) {
  document.getElementById("userModalTitle").textContent = "Edit User";
  document.getElementById("userId").value = id;
  document.getElementById("userUsername").value = username;
  document.getElementById("userEmail").value = email;
  document.getElementById("userPassword").value = "";
  document.getElementById("userCredits").value = credits;
  document.getElementById("userRole").value = role;
  document.getElementById("userPassword").required = false;
  document.getElementById("userModal").style.display = "block";
}

function hideUserModal() {
  document.getElementById("userModal").style.display = "none";
}

// Updated user form submit handler
document
  .getElementById("userForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get form elements directly using getElementById
    const userIdElement = document.getElementById("userId");
    const usernameElement = document.getElementById("userUsername");
    const emailElement = document.getElementById("modalUserEmail");
    const passwordElement = document.getElementById("userPassword");
    const creditsElement = document.getElementById("userCredits");
    const roleElement = document.getElementById("userRole");

    // Get values and trim whitespace
    const userId = userIdElement.value;
    const username = usernameElement.value.trim();
    const email = emailElement.value.trim();
    const password = passwordElement.value.trim();
    const credits = parseInt(creditsElement.value) || 20;
    const role = roleElement.value;

    console.log("Form Elements:", {
      usernameElement,
      emailElement,
      passwordElement,
      creditsElement,
      roleElement,
    });

    console.log("Form Values:", {
      username,
      email,
      password,
      credits,
      role,
    });

    // Validate email
    if (!email) {
      alert("Email is required");
      emailElement.focus();
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      emailElement.focus();
      return;
    }

    // Validate username
    if (!username) {
      alert("Username is required");
      usernameElement.focus();
      return;
    }

    // Validate password for new users
    if (!userId && !password) {
      alert("Password is required for new users");
      passwordElement.focus();
      return;
    }

    // Prepare form data
    const formData = {
      username,
      email,
      credits,
      role,
    };

    // Add password if provided
    if (password) {
      formData.password = password;
    }

    try {
      const url = userId
        ? `http://localhost:3000/admin/users/${userId}`
        : "http://localhost:3000/admin/users";

      console.log("Sending request to:", url);
      console.log("Request data:", formData);

      const response = await fetch(url, {
        method: userId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log("Server response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to save user");
      }

      alert(userId ? "User updated successfully!" : "User added successfully!");
      hideUserModal();
      loadUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert(`Error: ${error.message}`);
    }
  });
async function toggleUserStatus(userId) {
  try {
    const response = await fetch(
      `http://localhost:3000/admin/users/${userId}/toggle-status`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to toggle user status");
    }

    alert("User status updated successfully");
    loadUsers();
  } catch (error) {
    console.error("Error toggling user status:", error);
    alert("Error updating user status: " + error.message);
  }
}

async function promoteToAdmin(userId) {
  if (!confirm("Are you sure you want to promote this user to admin?")) {
    return;
  }

  try {
    // Get the user row element
    const userRow = document.querySelector(`tr[data-user-id="${userId}"]`);
    if (!userRow) {
      throw new Error("User row not found");
    }

    // Get user data from the data attributes
    const username = userRow.dataset.username;
    const email = userRow.dataset.email;

    const response = await fetch(
      `http://localhost:3000/admin/users/${userId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          email: email,
          role: "admin",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to promote user to admin");
    }

    alert("User promoted to admin successfully");
    loadUsers(); // Reload the users table
  } catch (error) {
    console.error("Error promoting user:", error);
    alert(`Error promoting user: ${error.message}`);
  }
}

async function loadPendingRequests() {
  const response = await fetch("http://localhost:5500/admin/credits/pending");
  const requests = await response.json();

  const container = document.getElementById("pendingRequests");
  container.innerHTML = requests
    .map(
      (request) => `
        <div class="request-item">
            <p>User: ${request.user_email}</p>
            <p>Credits: ${request.credits}</p>
            <p>Reason: ${request.reason}</p>
            <button onclick="handleRequest(${request.id}, 'approved')">Approve</button>
            <button onclick="handleRequest(${request.id}, 'rejected')">Reject</button>
        </div>
    `
    )
    .join("");
}

async function handleRequest(requestId, action) {
  const response = await fetch("http://localhost:5500/admin/credits/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId, action }),
  });

  if (response.ok) {
    loadPendingRequests();
  }
}

// ===== ADMIN MANAGEMENT =====
async function loadAdmins() {
  try {
    const response = await fetch("http://localhost:3000/admin/admins");
    const data = await response.json();

    // Populate pending admins table
    const pendingAdminsTable = document.getElementById("pendingAdminsTable");
    pendingAdminsTable.innerHTML = "";

    data.pendingAdmins.forEach((admin) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${admin.username}</td>
                <td>${admin.email}</td>
                <td>${formatDate(admin.created_at)}</td>
                <td class="action-btn-group">
                    <button class="btn btn-success" onclick="approveAdmin(${
                      admin.id
                    })">Approve</button>
                    <button class="btn btn-danger" onclick="rejectAdmin(${
                      admin.id
                    })">Reject</button>
                </td>
            `;
      pendingAdminsTable.appendChild(row);
    });

    // Populate current admins table
    const adminsTable = document.getElementById("adminsTable");
    adminsTable.innerHTML = "";

    data.currentAdmins.forEach((admin) => {
      const row = document.createElement("tr");
      const statusClass =
        admin.approved === 1 ? "badge-success" : "badge-danger";
      const statusText = admin.approved === 1 ? "Active" : "Inactive";

      row.innerHTML = `
                <td>${admin.username}</td>
                <td>${admin.email}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td class="action-btn-group">
                    <button class="btn btn-warning" onclick="toggleAdminStatus(${
                      admin.id
                    }, ${admin.approved})">
                        ${admin.approved === 1 ? "" : ""}
                    </button>
                    <button class="btn btn-danger" onclick="removeAdmin(${
                      admin.id
                    })">Remove</button>
                </td>
            `;
      adminsTable.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading admins:", error);
    alert("Error loading admin data");
  }
}

async function approveAdmin(adminId) {
  try {
    const response = await fetch(
      `http://localhost:3000/admin/approve/${adminId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to approve admin");

    alert("Admin approved successfully");
    loadAdmins();
  } catch (error) {
    console.error("Error approving admin:", error);
    alert("Error approving admin");
  }
}

async function rejectAdmin(adminId) {
  if (!confirm("Are you sure you want to reject this admin request?")) return;

  try {
    const response = await fetch(
      `http://localhost:3000/admin/reject/${adminId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to reject admin");

    alert("Admin request rejected");
    loadAdmins();
  } catch (error) {
    console.error("Error rejecting admin:", error);
    alert("Error rejecting admin");
  }
}

async function toggleAdminStatus(adminId, currentStatus) {
  const action = currentStatus === 1 ? "deactivate" : "activate";
  if (!confirm(`Are you sure you want to ${action} this admin?`)) return;

  try {
    const response = await fetch(
      `http://localhost:3000/admin/toggle-status/${adminId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error(`Failed to ${action} admin`);

    alert(`Admin ${action}d successfully`);
    loadAdmins();
  } catch (error) {
    console.error(`Error ${action}ing admin:`, error);
    alert(`Error ${action}ing admin`);
  }
}

async function removeAdmin(adminId) {
  if (
    !confirm(
      "Are you sure you want to remove this admin? This cannot be undone."
    )
  )
    return;

  try {
    const response = await fetch(
      `http://localhost:3000/admin/remove/${adminId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to remove admin");

    alert("Admin removed successfully");
    loadAdmins();
  } catch (error) {
    console.error("Error removing admin:", error);
    alert("Error removing admin");
  }
}
function searchAdmins() {
  const searchTerm = document
    .getElementById("adminSearchInput")
    .value.toLowerCase();
  const rows = document
    .getElementById("adminsTable")
    .getElementsByTagName("tr");

  for (let row of rows) {
    const username = row.cells[0]?.textContent.toLowerCase() || "";
    const email = row.cells[1]?.textContent.toLowerCase() || "";

    if (username.includes(searchTerm) || email.includes(searchTerm)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  }
}

// Function to show modal for adding credits
function showAddCreditsModal(userId, username) {
  // Implement similar to other modals
  alert(`TODO: Show modal to add credits for user ${username}`);
}
// Load admins when page loads
document.addEventListener("DOMContentLoaded", loadAdmins);
// Load credit requests when the tab is shown
document
  .querySelector('[data-tab="credit-requests"]')
  .addEventListener("click", loadCreditRequests);

// Initial load of credit requests
loadCreditRequests();
