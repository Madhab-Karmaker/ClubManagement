/**
 * EXAMPLE: Integrating Donation Dashboard with Real API
 *
 * This file shows how to replace the dummy data with real API calls.
 * Copy this to your donation.service.ts file and update the endpoints.
 */

import apiClient from '../api/apiClient';
import { type DonationData, type DonationRecord, type DonorProfile } from '../types/donation.types';

// ─────────────────────────────────────────────────────────────────────────────
// REAL API INTEGRATION EXAMPLE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch donation data from API endpoint
 * Replace with your actual API endpoints
 */
export async function fetchDonationData(): Promise<DonationData> {
  try {
    const response = await apiClient.get('/api/donations/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching donation data:', error);
    throw error;
  }
}

/**
 * Fetch recent donations
 */
export async function fetchRecentDonations(
  dateRange: '7d' | '30d' | 'custom',
  startDate?: string,
  endDate?: string
): Promise<DonationRecord[]> {
  try {
    const params: Record<string, string> = { range: dateRange };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get('/api/donations/recent', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent donations:', error);
    throw error;
  }
}

/**
 * Fetch top donors
 */
export async function fetchTopDonors(limit: number = 10): Promise<DonorProfile[]> {
  try {
    const response = await apiClient.get('/api/donors/top', { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('Error fetching top donors:', error);
    throw error;
  }
}

/**
 * Get donation statistics
 */
export async function fetchDonationStats() {
  try {
    const response = await apiClient.get('/api/donations/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching donation statistics:', error);
    throw error;
  }
}

/**
 * Export donations to Excel
 */
export async function exportDonationsToExcel(
  dateRange: '7d' | '30d' | 'custom',
  startDate?: string,
  endDate?: string
): Promise<Blob> {
  try {
    const params: Record<string, string> = { range: dateRange };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get('/api/donations/export/excel', {
      params,
      responseType: 'blob',
    });

    return response.data;
  } catch (error) {
    console.error('Error exporting donations:', error);
    throw error;
  }
}

/**
 * Get donor profile details
 */
export async function fetchDonorProfile(donorId: string): Promise<DonorProfile> {
  try {
    const response = await apiClient.get(`/api/donors/${donorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching donor profile:', error);
    throw error;
  }
}

/**
 * Create a new donation (manual entry)
 */
export async function createDonation(data: Omit<DonationRecord, 'id'>) {
  try {
    const response = await apiClient.post('/api/donations', data);
    return response.data;
  } catch (error) {
    console.error('Error creating donation:', error);
    throw error;
  }
}

/**
 * Update a donation
 */
export async function updateDonation(
  donationId: string,
  data: Partial<DonationRecord>
) {
  try {
    const response = await apiClient.put(`/api/donations/${donationId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating donation:', error);
    throw error;
  }
}

/**
 * Delete a donation
 */
export async function deleteDonation(donationId: string) {
  try {
    await apiClient.delete(`/api/donations/${donationId}`);
  } catch (error) {
    console.error('Error deleting donation:', error);
    throw error;
  }
}

/**
 * Get donation analytics
 */
export async function fetchDonationAnalytics(
  dateRange: '7d' | '30d' | 'custom',
  startDate?: string,
  endDate?: string
) {
  try {
    const params: Record<string, string> = { range: dateRange };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get('/api/donations/analytics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching donation analytics:', error);
    throw error;
  }
}

/**
 * Search donors by name or email
 */
export async function searchDonors(query: string): Promise<DonorProfile[]> {
  try {
    const response = await apiClient.get('/api/donors/search', {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching donors:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS (Same as before)
// ─────────────────────────────────────────────────────────────────────────────

export function formatBDT(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

export function getDaysAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
