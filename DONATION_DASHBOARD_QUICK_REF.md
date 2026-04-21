# 🚀 Quick Reference - Donation Dashboard

## File Locations

```
client/src/
├── pages/donations/
│   ├── DonationDashboard.tsx      ← Main component
│   └── README.md                  ← Full documentation
├── components/donations/
│   ├── SummaryCards.tsx           ← Stat cards
│   ├── DonationAnalytics.tsx      ← Charts
│   ├── DonationFilters.tsx        ← Filters
│   ├── TopDonorsTable.tsx         ← Table
│   ├── RecentDonationsFeed.tsx    ← Feed
│   ├── TopDonorLeaderboard.tsx    ← Leaderboard
│   └── index.ts
├── services/
│   ├── donation.service.ts        ← Current (dummy data)
│   └── donation.api.example.ts    ← API integration template
├── types/
│   └── donation.types.ts          ← TypeScript types
└── assets/styles/
    └── donations.css              ← All styles
```

## URL & Routing

```
http://localhost:5173/donations
Route: /donations
Component: DonationDashboard
Layout: ProtectedLayout (requires auth)
```

## Key Types

```typescript
DonationRecord {
  id, donorId, donorName, donorEmail, donorPhone,
  amount, date, category, paymentMethod, status, notes
}

DonorProfile {
  id, name, email, phone, profileImage,
  totalDonation, lastDonation, status, donationCount, joinDate
}

DonationData {
  totalDonations, totalMembers, activeDonors,
  recentDonations[], topDonors[], trends[], categories[], dailyDonations[]
}
```

## Component Props

```typescript
// SummaryCards
stats: {
  totalDonations, totalMembers, activeDonors,
  donationsThisMonth, trends
}

// DonationAnalytics
data: DonationData
filteredDonations: DonationRecord[]
dateRange: '7d' | '30d' | 'custom'

// TopDonorsTable
donations: DonationRecord[]

// RecentDonationsFeed
donations: DonationRecord[]

// TopDonorLeaderboard
donors: DonorProfile[]

// DonationFilters
dateRange, setDateRange, searchQuery, setSearchQuery,
sortBy, setSortBy, customDateStart, setCustomDateStart,
customDateEnd, setCustomDateEnd
```

## Utility Functions

```typescript
// Format amount to BDT
formatBDT(50000)        // "৳50,000"

// Format date
formatDate("2026-04-21") // "21 Apr 2026"

// Get relative time
getDaysAgo("2026-04-21") // "Today", "2 days ago", etc.

// Get dummy data
getDummyDonationData()   // Complete dataset for demo
```

## CSS Classes (Main)

```css
.donation-dashboard              /* Container */
.donation-summary-cards          /* Cards grid */
.donation-summary-card           /* Single card */
.donation-chart-card             /* Chart card */
.donation-table-wrapper          /* Table wrapper */
.donation-feed                   /* Feed container */
.donation-leaderboard            /* Leaderboard */
.donation-filters-section        /* Filters */
```

## State Variables (in DashboardComponent)

```typescript
dateRange: '7d' | '30d' | 'custom'
searchQuery: string
sortBy: 'amount' | 'recent'
customDateStart: string
customDateEnd: string
```

## Data Flow

```
DonationDashboard (main)
├── getDummyDonationData() → DonationData
├── filteredDonations (useMemo)
├── summaryStats (useMemo)
├── SummaryCards (stats)
├── DonationAnalytics (data, filteredDonations, dateRange)
├── DonationFilters (all state + setters)
├── TopDonorLeaderboard (data.topDonors)
├── TopDonorsTable (filteredDonations)
└── RecentDonationsFeed (filteredDonations.slice(0,10))
```

## Common Tasks

### Change a Summary Card Label
```typescript
// In SummaryCards.tsx
<SummaryCard label="New Label" ... />
```

### Add a New Filter
```typescript
// 1. Add state in DashboardComponent
const [newFilter, setNewFilter] = useState('');

// 2. Add to DonationFilters component
// 3. Filter donations in useMemo
```

### Update Chart Data
```typescript
// In DonationAnalytics.tsx
const last10Days = data.dailyDonations.slice(-10);
// Change to: .slice(-30) for 30 days
```

### Customize Colors
```css
/* In donations.css */
.donation-summary-card--green { /* Color green cards */ }
.donation-summary-card--blue  { /* Color blue cards */ }
```

### Change Table Items Per Page
```typescript
// In TopDonorsTable.tsx
const itemsPerPage = 10; // Change to 20, 50, etc.
```

## Connecting to Real API

### Step 1: Update donation.service.ts
```typescript
// Replace getDummyDonationData with:
export async function fetchDonationData(): Promise<DonationData> {
  const response = await apiClient.get('/api/donations/dashboard');
  return response.data;
}
```

### Step 2: Update DonationDashboard.tsx
```typescript
useEffect(() => {
  const loadData = async () => {
    try {
      const newData = await fetchDonationData();
      setData(newData);
    } catch (error) {
      setData(getDummyDonationData()); // Fallback
    }
  };
  loadData();
}, []);
```

## Browser DevTools Tips

### React DevTools
1. Install React DevTools extension
2. Inspect `<DonationDashboard>` component
3. Check state variables in right panel

### Network Tab
1. Check API responses (when connected)
2. Verify data format matches types
3. Monitor request/response times

### Performance Tab
1. Profile component rendering
2. Check for unnecessary re-renders
3. Monitor memory usage

## Common Errors & Solutions

| Error | Solution |
|-------|----------|
| Charts not rendering | Check CSS import, verify data |
| Filters not working | Check date format (YYYY-MM-DD) |
| Images not loading | Check URL, verify fallback avatar |
| Type errors | Check donation.types.ts for interface |
| Styles not applied | Verify CSS file is imported in main |

## Testing Checklist

- [ ] All 4 summary cards display
- [ ] Filters apply to data
- [ ] Charts render correctly
- [ ] Table paginates
- [ ] Feed displays donations
- [ ] Leaderboard shows top 10
- [ ] Mobile view responsive
- [ ] Animations smooth
- [ ] No console errors
- [ ] Data updates correctly

## Performance Notes

- Summary cards: Update on data change
- Charts: Memoized, redraw on filter
- Table: Paginated (10/page)
- Feed: Limited to 10 items
- Images: Lazy loading ready
- No infinite loops

## Deployment Checklist

- [ ] Remove console.logs
- [ ] Test on mobile
- [ ] Check browser compatibility
- [ ] Verify API endpoints
- [ ] Test error states
- [ ] Check accessibility
- [ ] Build: `npm run build`
- [ ] Preview: `npm run preview`

## Resources

- Main Docs: `client/src/pages/donations/README.md`
- Setup Guide: `DONATION_DASHBOARD_SETUP.md`
- Component Code: `client/src/components/donations/*.tsx`
- Styles: `client/src/assets/styles/donations.css`

---

**Last Updated**: 2026-04-21  
**Version**: 1.0.0  
**Status**: Production Ready
