document.addEventListener("DOMContentLoaded", () => {
  const fetchLeavesBtn = document.getElementById("fetchLeavesBtn");
  const employeeIdInput = document.getElementById("employeeId");
  const statusFilterSelect = document.getElementById("statusFilter");
  const leavesList = document.getElementById("leaves-list");

  fetchLeavesBtn.addEventListener("click", () => {
    const employeeId = employeeIdInput.value;
    const statusFilter = statusFilterSelect.value;
    if (!employeeId) {
      alert(`Please enter an Employee ID. ${employeeIdInput.value}`);
      return;
    }

    fetchLeaves(employeeId, statusFilter);
  });

  async function fetchLeaves(employeeId, status) {
    leavesList.innerHTML = "<li>Loading leaves...</li>";

    let apiUrl = `http://localhost:3000/leaves?limit=10&skip=0`;
    if (status) {
      apiUrl += `&status=${status}`;
    }

    try {
      const response = await fetch(apiUrl, {
        headers: { "user-id": employeeId },
      });
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
      const leavesData = await response.json();
      displayLeaves(leavesData);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      leavesList.innerHTML = `<li>Error fetching leaves: ${error.message}</li>`;
    }
  }

  function displayLeaves(leaves) {
    leavesList.innerHTML = "";
    if (leaves.length === 0) {
      leavesList.innerHTML = "<li>No leaves found</li>";
      return;
    }

    leaves.forEach((leave) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
                <strong>Leave Type:</strong> ${leave.type}<br>
                <strong>Duration:</strong> ${leave.duration} days<br>
                <strong>Status:</strong> ${leave.status}<br>
                <strong>Created At:</strong> ${new Date(
                  leave.createdAt
                ).toLocaleString()}<br>
                <strong>Updated At:</strong> ${new Date(
                  leave.updatedAt
                ).toLocaleString()}
            `;
      leavesList.appendChild(listItem);
    });
  }
});
