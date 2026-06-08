import apiClient from "../api/apiClient";

export interface SearchResult {
  members: MemberSearchHit[];
  donations: DonationSearchHit[];
  events: EventSearchHit[];
  totalResults: number;
}

export interface MemberSearchHit {
  memberId: number;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
}

export interface DonationSearchHit {
  donationId: number;
  memberName: string;
  amount: number;
  donationDate: string;
  referenceNumber: string | null;
}

export interface EventSearchHit {
  eventId: number;
  eventName: string;
  eventDate: string;
  location: string | null;
}

const searchService = {
  search: (q: string, maxResults = 5) =>
    apiClient.get<SearchResult>("/api/search", { params: { q, maxResults } }),
};

export default searchService;
