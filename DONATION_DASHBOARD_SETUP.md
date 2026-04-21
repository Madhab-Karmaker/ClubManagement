# 🎯 Donation Dashboard - Setup & Integration Guide

## Overview

This guide walks you through setting up and customizing the Donation Dashboard for your application. The dashboard is production-ready with dummy data and can be easily integrated with your backend API.

---

## 📦 Installation

All files are already created and integrated. No additional npm packages are required!

### Already Included ✓
- React 19.2.0
- TypeScript
- Vite
- CSS3

### Optional Enhancements (Not Required)
If you want to add more features, these libraries can be integrated:
```bash
npm install recharts  # For more advanced charts
npm install xlsx      # For Excel export functionality
npm install date-fns  # For advanced date manipulation
```

---

## 🚀 Quick Start

### 1. **Navigate to Donations**
Simply visit `/donations` in your application. The page is already routed.

### 2. **Access Points**
- URL: `http://localhost:5173/donations` (adjust port as needed)
- Sidebar: Click "💰 Donations" (if added to navigation)

### 3. **Test Features**
- ✓ Summary cards showing metrics
- ✓ Dynamic filters (date range, search, sort)
- ✓ Interactive charts (line, bar, pie)
- ✓ Paginated donor table
- ✓ Timeline feed
- ✓ Leaderboard rankings

---

## 🔧 Customization Guide

### Change Color Scheme

Edit `client/src/assets/styles/donations.css`:

```css
/* Find and replace color values */
.donation-summary-card--green::before {
  background: linear-gradient(90deg, #10b981, #059669); /* Change these */
}

/* OR use CSS variables for easier management */
:root {
  --donation-primary: #10b981;
  --donation-secondary: #3b82f6;
  --donation-accent: #f59e0b;
}
```

### Adjust Responsive Breakpoints

```css
/* Current breakpoints */
@media (max-width: 1024px) { } /* Tablet */
@media (max-width: 768px) { }  /* Small Tablet */
@media (max-width: 480px) { }  /* Mobile */

/* Modify as needed for your design */
```

### Customize Summary Cards

Edit `SummaryCards.tsx`:

```typescript
// Change icons
<SummaryCard
  icon="📊"              // Change emoji
  label="Revenue"        // Change label
  value={formatBDT(999)} // Change format
  color="green"          // Change color
/>

// Add new card
<SummaryCard
  icon="🎁"
  label="Pledges"
  value={50}
  color="blue"
/>
```

### Modify Chart Data

Edit `DonationAnalytics.tsx`:

```typescript
// Change last 10 days to last 30 days
const last10Days = useMemo(() => {
  return data.dailyDonations.slice(-30); // Change number
}, [data.dailyDonations]);

// Change top 5 to top 10 donors
.slice(0, 5)  // Change to slice(0, 10)
```

### Adjust Table Pagination

Edit `TopDonorsTable.tsx`:

```typescript
const itemsPerPage = 10; // Change to 20, 50, etc.
```

---

## 🔌 API Integration

### Option 1: Replace Dummy Data (Recommended)

1. **Update `donation.service.ts`**:

```typescript
// Old: getDummyDonationData()
// New: fetchDonationData()

export async function fetchDonationData(): Promise<DonationData> {
  try {
    const response = await apiClient.get('/api/donations/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    // Fallback to dummy data if needed
    return getDummyDonationData();
  }
}
```

2. **Update `DonationDashboard.tsx`**:

```typescript
// Add useEffect to fetch data
useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const newData = await fetchDonationData();
      setData(newData);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Use dummy data as fallback
      setData(getDummyDonationData());
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);
```

### Option 2: Use Provided Example

Copy `donation.api.example.ts` to replace `donation.service.ts` and update endpoints:

```typescript
// Update API endpoints
const response = await apiClient.get('/api/donations/dashboard');
const response = await apiClient.get('/api/donations/recent');
const response = await apiClient.get('/api/donors/top');
```

### Expected API Endpoints

Your backend should provide these endpoints:

```
GET  /api/donations/dashboard          - Get complete dashboard data
GET  /api/donations/recent             - Get recent donations (with filters)
GET  /api/donations/statistics         - Get statistics
GET  /api/donors/top                   - Get top donors
GET  /api/donors/{id}                  - Get donor profile
GET  /api/donors/search?q=name         - Search donors
POST /api/donations                    - Create donation
PUT  /api/donations/{id}               - Update donation
DELETE /api/donations/{id}             - Delete donation
GET  /api/donations/export/excel       - Export to Excel
```

### Expected Data Format

```typescript
// DonationData response
{
  totalDonations: 5250000,
  totalMembers: 250,
  activeDonors: 145,
  recentDonations: [...],
  topDonors: [...],
  trends: [...],
  categories: [...],
  dailyDonations: [...]
}

// DonationRecord
{
  id: "DT-00001",
  donorId: "DONOR-0001",
  donorName: "Ahsan Ahmed",
  donorEmail: "ahsan@example.com",
  donorPhone: "+8801234567890",
  amount: 25000,
  date: "2026-04-21",
  category: "general|event|cause|project",
  paymentMethod: "cash|online|cheque|bank_transfer",
  status: "completed|pending|cancelled",
  notes: "Optional notes"
}
```

---

## 📊 Adding New Features

### Add Export to Excel

1. **Install dependency** (optional):
```bash
npm install xlsx
```

2. **Add to `DonationDashboard.tsx`**:
```typescript
const handleExportExcel = () => {
  // Implement export logic
  const ws = XLSX.utils.json_to_sheet(filteredDonations);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Donations");
  XLSX.writeFile(wb, "donations.xlsx");
};

// Add button
<button onClick={handleExportExcel}>📥 Export Excel</button>
```

### Add Donor Search Modal

1. **Create new component**: `DonorSearchModal.tsx`
2. **Add to dashboard**:
```typescript
const [showSearch, setShowSearch] = useState(false);

{showSearch && <DonorSearchModal onClose={() => setShowSearch(false)} />}
```

### Add Real-time Notifications

1. **Create notification context**
2. **Add WebSocket listener**
3. **Update dashboard with new donations in real-time**

### Add Donation Goals

1. **Add goal field to DonationData**
2. **Create `DonationGoalCard` component**
3. **Display progress bars**

---

## 🎨 Theming

### Switch to Dark Mode

Add to `donations.css`:

```css
@media (prefers-color-scheme: dark) {
  .donation-dashboard {
    --bg-primary: #1f2937;
    --bg-secondary: #111827;
    --text-primary: #f3f4f6;
    --text-secondary: #d1d5db;
  }

  .donation-summary-card {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
  
  /* Apply to all components */
}
```

### Create Theme Provider

```typescript
const DashboardTheme = {
  light: {
    bg: '#ffffff',
    text: '#1a1a2e',
    primary: '#10b981',
  },
  dark: {
    bg: '#1a1a2e',
    text: '#ffffff',
    primary: '#34d399',
  },
};
```

---

## ⚡ Performance Tips

### 1. **Memoization**
Already implemented with `useMemo` for:
- Filtered donations
- Aggregated donors
- Chart data

### 2. **Pagination**
- Table: 10 items per page (configurable)
- Feed: Shows top 10 (configurable)

### 3. **Lazy Loading Images**
```typescript
<img
  src={donor.profileImage}
  alt={donor.name}
  loading="lazy"  // Add this
  onError={(e) => e.currentTarget.style.display = 'none'}
/>
```

### 4. **Code Splitting**
```typescript
const DonationDashboard = lazy(() => import('./DonationDashboard'));
const DonationAnalytics = lazy(() => import('./DonationAnalytics'));
```

### 5. **Virtual Scrolling (for large lists)**
```typescript
import { FixedSizeList } from 'react-window';

// Use for very large donation feeds
<FixedSizeList
  height={600}
  itemCount={donations.length}
  itemSize={80}
>
  {Row}
</FixedSizeList>
```

---

## 🧪 Testing

### Unit Tests Example

```typescript
// donation.service.test.ts
describe('Donation Service', () => {
  it('should format BDT correctly', () => {
    expect(formatBDT(100000)).toBe('১,০০,০০০.০০ ৳');
  });

  it('should calculate days ago', () => {
    expect(getDaysAgo('2026-04-21')).toBe('Today');
  });
});
```

### Component Tests Example

```typescript
// SummaryCards.test.tsx
describe('SummaryCards', () => {
  it('should render all four cards', () => {
    const stats = {...};
    render(<SummaryCards stats={stats} />);
    expect(screen.getAllByRole('heading')).toHaveLength(4);
  });
});
```

---

## 🔐 Security Considerations

1. **Input Validation**
```typescript
// Validate search input
const validateSearch = (query: string) => {
  // Remove dangerous characters
  return query.replace(/[<>]/g, '');
};
```

2. **XSS Prevention**
```typescript
// Use TextContent instead of innerHTML
element.textContent = userInput; // Safe
// NOT: element.innerHTML = userInput; // Unsafe
```

3. **CSRF Protection**
- Ensure API calls include CSRF tokens
- Use `apiClient` which should handle this

---

## 🐛 Debugging

### Enable Debug Mode

```typescript
// In DonationDashboard.tsx
if (process.env.NODE_ENV === 'development') {
  console.log('Dashboard data:', data);
  console.log('Filtered donations:', filteredDonations);
}
```

### Check Chrome DevTools

1. **React DevTools**: Inspect component state
2. **Network tab**: Monitor API calls
3. **Console**: Check for errors
4. **Performance**: Profile rendering

### Common Issues

| Issue | Solution |
|-------|----------|
| Charts not showing | Check CSS import, verify data format |
| Filters not working | Verify date format (YYYY-MM-DD) |
| Slow performance | Reduce items per page, enable memoization |
| Images not loading | Check image URL, add fallback avatars |

---

## 📱 Mobile Optimization

Dashboard is fully responsive. Test on:
- iPhone 12/13/14
- Samsung Galaxy
- iPad
- Tablet devices

Key optimizations:
- Single column layout on mobile
- Larger touch targets
- Simplified navigation
- Optimized images

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

```env
VITE_API_URL=https://your-api.com
VITE_APP_NAME=Donation Dashboard
VITE_ENABLE_ANALYTICS=true
```

### Performance Checklist

- [ ] Minify CSS/JS
- [ ] Compress images
- [ ] Enable caching
- [ ] Use CDN for static assets
- [ ] Implement lazy loading
- [ ] Monitor Core Web Vitals

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [CSS Best Practices](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [Vite Guide](https://vitejs.dev/guide/)

---

## 💬 Support

For issues or questions:
1. Check the main `README.md`
2. Review component comments
3. Check browser console for errors
4. Review API response format

---

**Last Updated**: 2026-04-21  
**Status**: Production Ready  
**Version**: 1.0.0
