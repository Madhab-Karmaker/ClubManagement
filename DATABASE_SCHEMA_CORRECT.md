# 🗄️ Database Schema - Corrected Structure

## ✅ Project Structure (CORRECT)

```
ClubManagement/
├── Domain/
│   ├── Models/
│   │   ├── User.cs                  ✓ (Existing)
│   │   ├── Member.cs                ✓ (Existing)
│   │   ├── Donation.cs              ✓ (Existing)
│   │   └── DonationModels.cs         ✓ (NEW - Lookup tables & DTOs)
│   └── Constants/
│       └── (DonationType, etc.)
│
├── Infrastructure/
│   └── Data/
│       ├── AppDbContext.cs           ✓ (UPDATED - Now includes all donation entities)
│       ├── DbInitializer.cs          ✓ (Existing)
│       └── Migrations/               ✓ (Auto-generated)
│
├── Controllers/                       ✓ (For API endpoints)
├── Services/                          ✓ (Business logic)
├── Models/                            ✓ (Response models if needed)
├── client/                            ✓ (React frontend)
└── ...
```

---

## 📊 Database Entity Relationships

```
┌──────────────┐       One-to-One       ┌──────────────┐
│    Users     │◄──────────────────────►│   Members    │
│ (Identity)   │                        │              │
└──────────────┘                        └──────────────┘
                                               ▲
                                        One-to-Many
                                               │
                                        ┌──────────────┐
                                        │  Donations   │
                                        │   (Main)     │
                                        └──────────────┘
                                               │
                    ┌──────────────┬───────────┴────────┬──────────────┐
                    │              │                    │              │
              Many-to-One    Many-to-One        Many-to-One    Many-to-One
                    │              │                    │              │
                    ▼              ▼                    ▼              ▼
        ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │DonationCategory │ │PaymentMethod │ │DonationStatus│ │   Members    │
        │   (Lookup)      │ │   (Lookup)   │ │  (Lookup)    │ │              │
        └─────────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
                    │              │                    │
                    └──────────────┬───────────┬────────┘
                                   │           │
                          One-to-Many   One-to-Many
                                   │           │
                            ┌──────────────────────┐
                            │ DonationAuditLog     │
                            │  (Optional - Audit)  │
                            └──────────────────────┘

Optional Analytics Tables (for performance):
┌──────────────────────┐    ┌──────────────────────┐
│ DonationStatistics   │    │   MonthlySummary     │
│  (Daily cache)       │    │   (Trend analysis)   │
└──────────────────────┘    └──────────────────────┘
```

---

## 📋 Table Details

### 1. **Members** (From existing Member.cs)
| Column | Type | Notes |
|--------|------|-------|
| MemberId | INT | PK |
| FirstName | NVARCHAR(100) | Required |
| LastName | NVARCHAR(100) | Required |
| Email | NVARCHAR(100) | UNIQUE, Required |
| PhoneNumber | NVARCHAR(20) | Optional |
| Address | NVARCHAR(300) | Optional |
| ProfilePhotoUrl | NVARCHAR(500) | Optional |
| JoinDate | DATETIME | Required |
| ExpiryDate | DATETIME | Required |
| IsActive | BIT | Default: 1 |
| UserId | NVARCHAR | FK to Users (one-to-one) |

**Indexes:**
- Email (UNIQUE)
- PhoneNumber
- IsActive
- JoinDate

---

### 2. **Donations** (From existing Donation.cs - Enhanced)
| Column | Type | Notes |
|--------|------|-------|
| Id | INT | PK |
| MemberId | INT | FK → Members |
| Amount | DECIMAL(15,2) | CHECK > 0 |
| DonationType | INT | Enum (from constants) |
| PaymentMethod | INT | Enum (from constants) |
| ReferenceNumber | NVARCHAR(100) | Optional |
| DonationDate | DATETIME | Required |
| Note | NVARCHAR(500) | Optional |
| CreatedAt | DATETIME | DEFAULT GETDATE() |

**Indexes:**
- MemberId
- DonationDate
- CreatedAt
- Amount

**Relationships:**
- FK: Members (one member → many donations)
- FK: DonationAuditLog (optional - one donation → many audit logs)

---

### 3. **DonationCategory** (NEW - Lookup)
| Column | Type | Notes |
|--------|------|-------|
| CategoryId | INT | PK |
| CategoryName | NVARCHAR(100) | UNIQUE, Required |
| Description | NVARCHAR(500) | Optional |
| CreatedAt | DATETIME | DEFAULT GETDATE() |
| IsActive | BIT | DEFAULT 1 |

**Seed Data:**
1. General
2. Event
3. Cause
4. Project

---

### 4. **PaymentMethodLookup** (NEW - Lookup)
| Column | Type | Notes |
|--------|------|-------|
| PaymentMethodId | INT | PK |
| MethodName | NVARCHAR(50) | UNIQUE, Required |
| Description | NVARCHAR(200) | Optional |
| CreatedAt | DATETIME | DEFAULT GETDATE() |
| IsActive | BIT | DEFAULT 1 |

**Seed Data:**
1. Cash
2. Online
3. Cheque
4. Bank Transfer

---

### 5. **DonationStatus** (NEW - Lookup)
| Column | Type | Notes |
|--------|------|-------|
| StatusId | INT | PK |
| StatusName | NVARCHAR(50) | UNIQUE, Required |
| Description | NVARCHAR(200) | Optional |
| CreatedAt | DATETIME | DEFAULT GETDATE() |

**Seed Data:**
1. Completed
2. Pending
3. Cancelled

---

### 6. **DonationStatistic** (OPTIONAL - Analytics)
| Column | Type | Purpose |
|--------|------|---------|
| StatisticId | INT | PK |
| StatisticDate | DATE | UNIQUE |
| TotalDonations | DECIMAL(15,2) | Daily total |
| CompletedDonations | DECIMAL(15,2) | Only completed |
| PendingDonations | DECIMAL(15,2) | Only pending |
| TotalDonationCount | INT | Count |
| UniqueDonors | INT | Unique member count |
| LastUpdatedAt | DATETIME | Update timestamp |

**Purpose:** Cache daily stats for dashboard performance

---

### 7. **MonthlySummary** (OPTIONAL - Analytics)
| Column | Type | Purpose |
|--------|------|---------|
| SummaryId | INT | PK |
| YearMonth | NVARCHAR(7) | YYYY-MM, UNIQUE |
| TotalAmount | DECIMAL(15,2) | Monthly total |
| DonationCount | INT | Monthly count |
| UniqueDonors | INT | Unique donors |
| PreviousMonthAmount | DECIMAL(15,2) | For comparison |
| PercentageChange | DECIMAL(5,2) | % change |
| LastUpdatedAt | DATETIME | Update timestamp |

**Purpose:** Store trends for quick chart rendering

---

### 8. **DonationAuditLog** (OPTIONAL - Audit Trail)
| Column | Type | Purpose |
|--------|------|---------|
| AuditId | INT | PK |
| DonationId | INT | FK → Donations |
| ActionType | NVARCHAR(50) | Created/Updated/Deleted |
| OldValue | NVARCHAR(MAX) | Previous value |
| NewValue | NVARCHAR(MAX) | New value |
| ChangedBy | NVARCHAR(100) | User who changed |
| ChangedAt | DATETIME | When changed |

**Purpose:** Track all changes for compliance

---

## 📄 Migration Steps

### Step 1: Add Lookup Classes to DonationModels.cs
✅ Done - File updated with:
- DonationCategory
- PaymentMethodLookup
- DonationStatus
- DonationStatistic
- MonthlySummary
- DonationAuditLog
- DTOs

### Step 2: Update AppDbContext
✅ Done - Now includes:
- All lookup table configurations
- Proper relationships
- Seed data
- Indexes and constraints

### Step 3: Create Migration
```bash
cd ClubManagement
dotnet ef migrations add AddDonationLookupTables
dotnet ef database update
```

### Step 4: Verify
```bash
dotnet ef dbcontext info
```

---

## 🎯 Key Points

### ✅ What's Correct Now:
1. **Single AppDbContext** - All entities in one place
2. **Proper Folder Structure** - Domain/Models contains all models
3. **No Duplicates** - Removed duplicate files
4. **Relationships Configured** - All FKs and navigations set up
5. **Seed Data** - Lookup tables pre-populated

### ⚡ Performance Features:
1. Indexes on frequently searched columns
2. Statistics tables for caching aggregates
3. Proper decimal precision (15,2)
4. Check constraints for data validation

### 🔐 Data Integrity:
1. Foreign key constraints
2. Unique constraints on lookup names
3. Check constraint for Amount > 0
4. Cascade delete where appropriate

---

## 📊 Sample Data Included

**DonationCategories:**
- General (ID: 1)
- Event (ID: 2)
- Cause (ID: 3)
- Project (ID: 4)

**PaymentMethods:**
- Cash (ID: 1)
- Online (ID: 2)
- Cheque (ID: 3)
- Bank Transfer (ID: 4)

**DonationStatuses:**
- Completed (ID: 1)
- Pending (ID: 2)
- Cancelled (ID: 3)

---

## 📁 Files Modified

1. **Infrastructure/Data/AppDbContext.cs** ✅ UPDATED
   - Added all donation entities
   - Added configurations for lookups
   - Added seed data

2. **Domain/Models/DonationModels.cs** ✅ CREATED
   - Lookup entities
   - Analytics entities
   - DTOs for API responses

### Files Removed (Cleanup):
- ❌ Data/ClubManagementDbContext.cs (duplicate)
- ❌ Models/DonationModels.cs (moved to Domain)

---

## 🚀 Next Steps

1. **Create Migration:**
   ```bash
   dotnet ef migrations add AddDonationSystem
   ```

2. **Update Database:**
   ```bash
   dotnet ef database update
   ```

3. **Create API Endpoints** (next phase)

4. **Connect Frontend** to API

---

## ⚠️ Important Notes

1. Donation table uses `Id` (not `DonationId`)
2. Member has `FirstName` and `LastName` (not `MemberName`)
3. Donation uses enums for `DonationType` and `PaymentMethod` (from Domain.Constants)
4. All lookup tables are seeded automatically
5. Indexes are created by EF Core

---

**Version:** 1.0  
**Status:** ✅ Ready for Migration  
**Last Updated:** 2026-04-21
