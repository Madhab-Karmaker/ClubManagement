// Placeholder: add dashboard-specific API calls here as features grow.
// Example: member stats, donation summaries, recent activity, etc.

import apiClient from "../api/apiClient";

const dashboardService = {
  /** Placeholder — returns member count (wire up when endpoint is ready). */
  getSummary: () =>
    apiClient.get("/api/dashboard/summary"),
};

export default dashboardService;
