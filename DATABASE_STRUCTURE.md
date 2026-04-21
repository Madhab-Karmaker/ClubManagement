# 📊 Donation System - Clean Database Structure

## 🏗️ Table Organization

```
CORE TABLES (4)
├── Donation (Main)
├── DonationStatus (Lookup)
├── DonationCategory (Lookup)
└── PaymentMethodLookup (Lookup)

SUPPORT TABLES (3 - Optional)
├── DonationStatistic (Analytics)
├── MonthlySummary (Analytics)
└── DonationAuditLog (Audit)
```

---

## 🟢 CORE TABLES

### 1. Donation (Main Transaction Table)
- From: Domain/Models/Donation.cs
- Enhanced with: StatusId, CategoryId, PaymentMethodId

| Column | Type |
|--------|------|
| Id | INT (PK) |
| MemberId | INT (FK) |
| Amount | DECIMAL(15,2) |
| DonationDate | DATETIME |
| StatusId | INT (FK) |
| CategoryId | INT (FK) |
| PaymentMethodId | INT (FK) |
| ReferenceNumber | NVARCHAR(100) |
| Note | NVARCHAR(500) |
| CreatedAt | DATETIME |

**Indexes:** MemberId, DonationDate, StatusId, CategoryId, Amount

---

### 2. DonationStatus (Lookup)
- From: Domain/Models/DonationModels.cs
- Values: Completed, Pending, Cancelled

| Column | Type |
|--------|------|
| StatusId | INT (PK) |
| StatusName | NVARCHAR(50) (UNIQUE) |
| Description | NVARCHAR(200) |
| CreatedAt | DATETIME |

---

### 3. DonationCategory (Lookup)
- From: Domain/Models/DonationModels.cs
- Values: General, Event, Cause, Project

| Column | Type |
|--------|------|
| CategoryId | INT (PK) |
| CategoryName | NVARCHAR(100) (UNIQUE) |
| Description | NVARCHAR(500) |
| CreatedAt | DATETIME |
| IsActive | BIT |

---

### 4. PaymentMethodLookup (Lookup)
- From: Domain/Models/DonationModels.cs
- Values: Cash, Online, Cheque, Bank Transfer

| Column | Type |
|--------|------|
| PaymentMethodId | INT (PK) |
| MethodName | NVARCHAR(50) (UNIQUE) |
| Description | NVARCHAR(200) |
| CreatedAt | DATETIME |
| IsActive | BIT |

---

## 🟠 SUPPORT TABLES (Optional)

### 5. DonationStatistic (Daily Cache)
- From: Domain/Models/DonationModels.cs
- Purpose: Fast dashboard queries

| Column | Type |
|--------|------|
| StatisticId | INT (PK) |
| StatisticDate | DATE (UNIQUE) |
| TotalDonations | DECIMAL(15,2) |
| CompletedDonations | DECIMAL(15,2) |
| PendingDonations | DECIMAL(15,2) |
| TotalDonationCount | INT |
| UniqueDonors | INT |
| LastUpdatedAt | DATETIME |

---

### 6. MonthlySummary (Trend Analysis)
- From: Domain/Models/DonationModels.cs
- Purpose: Monthly trends for charts

| Column | Type |
|--------|------|
| SummaryId | INT (PK) |
| YearMonth | NVARCHAR(7) (UNIQUE) |
| TotalAmount | DECIMAL(15,2) |
| DonationCount | INT |
| UniqueDonors | INT |
| PreviousMonthAmount | DECIMAL(15,2) |
| PercentageChange | DECIMAL(5,2) |
| LastUpdatedAt | DATETIME |

---

### 7. DonationAuditLog (Change Tracking)
- From: Domain/Models/DonationModels.cs
- Purpose: Compliance & audit trail

| Column | Type |
|--------|------|
| AuditId | INT (PK) |
| DonationId | INT (FK) |
| ActionType | NVARCHAR(50) |
| OldValue | NVARCHAR(MAX) |
| NewValue | NVARCHAR(MAX) |
| ChangedBy | NVARCHAR(100) |
| ChangedAt | DATETIME |

---

## 📊 Relationships

```
Donation (FK) ──→ DonationStatus
Donation (FK) ──→ DonationCategory
Donation (FK) ──→ PaymentMethodLookup
Donation (FK) ──→ Member [existing]
Donation (1) ──←→ (Many) DonationAuditLog
```

---

## 🚀 Migration Steps

```bash
# 1. Create migration
dotnet ef migrations add AddDonationSystem

# 2. Apply migration
dotnet ef database update

# 3. Verify
dotnet ef dbcontext info
```

---

**Core Tables:** Required ✅
**Support Tables:** Optional ⭐

