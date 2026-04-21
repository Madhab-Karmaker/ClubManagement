# 📊 Database Schema - Donation Management System

## ER Diagram (Entity Relationship)

```
┌──────────────────────┐
│ DonationCategories   │
├──────────────────────┤
│ CategoryId (PK)      │
│ CategoryName         │
│ Description          │
│ CreatedAt            │
│ IsActive             │
└──────────────────────┘
         │
         │ FK_CategoryId
         │
         ▼
┌──────────────────────────────────┐
│        Donations                 │
├──────────────────────────────────┤
│ DonationId (PK)                  │
│ DonationCode (UNIQUE)            │
│ MemberId (FK)                    │◄───────┐
│ Amount (DECIMAL)                 │        │
│ DonationDate                     │        │
│ CategoryId (FK)                  │        │
│ PaymentMethodId (FK)             │        │
│ StatusId (FK)                    │        │
│ Notes                            │        │
│ ReferenceNumber                  │        │
│ ReceiptIssuedDate                │        │
│ CreatedAt, UpdatedAt             │        │
│ CreatedBy                        │        │
└──────────────────────────────────┘        │
         │       │        │                 │
         │       │        │                 │
    FK_Cat  FK_Pay   FK_Status          FK_Member
         │       │        │                 │
         ▼       ▼        ▼                 │
    ┌────────┐ ┌────────┐ ┌──────────────┐ │
    │Payment │ │Donation│ │   Members    │◄┘
    │Methods │ │Status  │ ├──────────────┤
    ├────────┤ ├────────┤ │ MemberId(PK) │
    │Method  │ │Status  │ │ MemberName   │
    │NameId │ │NameId  │ │ Email        │
    │        │ │        │ │ Phone        │
    │ Method │ │Status  │ │ Address      │
    │ Name   │ │ Desc.  │ │ JoinDate     │
    │        │ │        │ │ LastDonDate  │
    │ Desc.  │ │        │ │ IsActive     │
    └────────┘ └────────┘ │ TotalAmount  │
                           │ DonationCnt  │
                           └──────────────┘
                                  ▲
                                  │
                          FK_DonationId
                                  │
                           ┌──────────────────┐
                           │ DonationAuditLog │
                           ├──────────────────┤
                           │ AuditId (PK)     │
                           │ DonationId (FK)  │
                           │ ActionType       │
                           │ OldValue         │
                           │ NewValue         │
                           │ ChangedBy        │
                           │ ChangedAt        │
                           └──────────────────┘

┌──────────────────────┐    ┌──────────────────────┐
│DonationStatistics    │    │   MonthlySummary     │
├──────────────────────┤    ├──────────────────────┤
│StatisticId (PK)      │    │ SummaryId (PK)       │
│StatisticDate (UNIQUE)│    │ YearMonth (UNIQUE)   │
│TotalDonations        │    │ TotalAmount          │
│CompletedDonations    │    │ DonationCount        │
│PendingDonations      │    │ UniqueDonors         │
│TotalDonationCount    │    │ PreviousMonthAmount  │
│UniqueDonors          │    │ PercentageChange     │
│LastUpdatedAt         │    │ LastUpdatedAt        │
└──────────────────────┘    └──────────────────────┘
```

---

## Table Structure Details

### 1. **DonationCategories** (Lookup Table)
| Column | Type | Constraints |
|--------|------|-------------|
| CategoryId | INT | PK, Identity |
| CategoryName | NVARCHAR(100) | NOT NULL, UNIQUE |
| Description | NVARCHAR(500) | NULL |
| CreatedAt | DATETIME | DEFAULT GETDATE() |
| IsActive | BIT | DEFAULT 1 |

**Sample Data:**
- General (for club operations)
- Event (for specific events)
- Cause (for special causes)
- Project (for specific projects)

---

### 2. **PaymentMethods** (Lookup Table)
| Column | Type | Constraints |
|--------|------|-------------|
| PaymentMethodId | INT | PK, Identity |
| MethodName | NVARCHAR(50) | NOT NULL, UNIQUE |
| Description | NVARCHAR(200) | NULL |
| CreatedAt | DATETIME | DEFAULT GETDATE() |
| IsActive | BIT | DEFAULT 1 |

**Sample Data:**
- Cash
- Online (bank or payment gateway)
- Cheque
- Bank Transfer

---

### 3. **DonationStatuses** (Lookup Table)
| Column | Type | Constraints |
|--------|------|-------------|
| StatusId | INT | PK, Identity |
| StatusName | NVARCHAR(50) | NOT NULL, UNIQUE |
| Description | NVARCHAR(200) | NULL |
| CreatedAt | DATETIME | DEFAULT GETDATE() |

**Sample Data:**
- Completed (verified and processed)
- Pending (awaiting verification)
- Cancelled (rejected or reversed)

---

### 4. **Members** (Core Entity - Donors/Club Members)
| Column | Type | Constraints |
|--------|------|-------------|
| MemberId | INT | PK, Identity |
| MemberName | NVARCHAR(150) | NOT NULL |
| Email | NVARCHAR(100) | UNIQUE |
| PhoneNumber | NVARCHAR(20) | NULL |
| Address | NVARCHAR(300) | NULL |
| ProfileImageUrl | NVARCHAR(500) | NULL |
| JoinDate | DATETIME | DEFAULT GETDATE() |
| LastDonationDate | DATETIME | NULL |
| IsActive | BIT | DEFAULT 1 |
| TotalDonationAmount | DECIMAL(15,2) | DEFAULT 0 |
| DonationCount | INT | DEFAULT 0 |
| CreatedAt | DATETIME | DEFAULT GETDATE() |
| UpdatedAt | DATETIME | DEFAULT GETDATE() |

**Indexes:**
- Email (UNIQUE)
- PhoneNumber
- IsActive
- JoinDate

---

### 5. **Donations** (Main Transactional Table)
| Column | Type | Constraints |
|--------|------|-------------|
| DonationId | INT | PK, Identity |
| DonationCode | NVARCHAR(50) | UNIQUE (like DT-00001) |
| MemberId | INT | FK → Members.MemberId |
| Amount | DECIMAL(15,2) | NOT NULL, CHECK (> 0) |
| DonationDate | DATETIME | DEFAULT GETDATE() |
| CategoryId | INT | FK → DonationCategories.CategoryId |
| PaymentMethodId | INT | FK → PaymentMethods.PaymentMethodId |
| StatusId | INT | FK → DonationStatuses.StatusId |
| Notes | NVARCHAR(500) | NULL |
| ReferenceNumber | NVARCHAR(100) | NULL |
| ReceiptIssuedDate | DATETIME | NULL |
| CreatedAt | DATETIME | DEFAULT GETDATE() |
| UpdatedAt | DATETIME | DEFAULT GETDATE() |
| CreatedBy | NVARCHAR(100) | NULL |

**Indexes:**
- MemberId
- DonationDate
- CategoryId
- PaymentMethodId
- StatusId
- Amount
- DonationCode (UNIQUE)

**Check Constraints:**
- Amount > 0

---

### 6. **DonationStatistics** (Analytics Table - Optional)
| Column | Type | Purpose |
|--------|------|---------|
| StatisticId | INT | PK |
| StatisticDate | DATE | UNIQUE |
| TotalDonations | DECIMAL(15,2) | Cache total for the day |
| CompletedDonations | DECIMAL(15,2) | Only completed donations |
| PendingDonations | DECIMAL(15,2) | Only pending donations |
| TotalDonationCount | INT | Count of donations |
| UniqueDonors | INT | Number of unique donors |
| LastUpdatedAt | DATETIME | Update timestamp |

**Purpose:** Caches daily statistics for faster dashboard queries

---

### 7. **MonthlySummary** (Analytics Table - Optional)
| Column | Type | Purpose |
|--------|------|---------|
| SummaryId | INT | PK |
| YearMonth | NVARCHAR(7) | YYYY-MM format, UNIQUE |
| TotalAmount | DECIMAL(15,2) | Monthly total |
| DonationCount | INT | Donations in month |
| UniqueDonors | INT | Unique donors in month |
| PreviousMonthAmount | DECIMAL(15,2) | For trend calculation |
| PercentageChange | DECIMAL(5,2) | % change from previous month |
| LastUpdatedAt | DATETIME | Update timestamp |

**Purpose:** Stores monthly trends for quick chart rendering

---

### 8. **DonationAuditLog** (Audit Trail Table - Optional)
| Column | Type | Purpose |
|--------|------|---------|
| AuditId | INT | PK |
| DonationId | INT | FK → Donations.DonationId |
| ActionType | NVARCHAR(50) | Created/Updated/Deleted/Verified |
| OldValue | NVARCHAR(MAX) | Previous value |
| NewValue | NVARCHAR(MAX) | New value |
| ChangedBy | NVARCHAR(100) | User who made change |
| ChangedAt | DATETIME | When change was made |

**Purpose:** Complete audit trail for compliance and tracking

---

## Relationships & Constraints

### Foreign Key Relationships:
```
Members ◄── Donations ──► DonationCategories
                   │
                   ├──► PaymentMethods
                   │
                   └──► DonationStatuses

Donations ◄── DonationAuditLog
```

### Cascade Rules:
- **Members → Donations**: CASCADE (delete member → delete donations)
- **Donations → AuditLog**: CASCADE (delete donation → delete audit logs)
- **Categories/Methods/Status → Donations**: RESTRICT (cannot delete if in use)

---

## Views (for easy querying)

### 1. **vw_DonationDetails**
Joins all donation data with lookups for easy frontend consumption.

```sql
SELECT
    DonationId, DonationCode,
    MemberId, MemberName, Email, Phone,
    Amount, DonationDate,
    CategoryName, MethodName, StatusName,
    Notes, ReferenceNumber
FROM Donations
INNER JOIN Members ON Donations.MemberId = Members.MemberId
INNER JOIN Categories ON Donations.CategoryId = Categories.CategoryId
INNER JOIN PaymentMethods ON Donations.PaymentMethodId = PaymentMethods.PaymentMethodId
INNER JOIN Statuses ON Donations.StatusId = Statuses.StatusId
```

### 2. **vw_MemberDonationSummary**
Shows aggregated donation info per member.

```sql
SELECT
    MemberId, MemberName, Email,
    COUNT(*) AS TotalDonations,
    SUM(Amount) AS TotalAmount,
    AVG(Amount) AS AverageDonation,
    MAX(DonationDate) AS LastDonationDate
FROM Members
LEFT JOIN Donations ON Members.MemberId = Donations.MemberId
GROUP BY MemberId, MemberName, Email
```

---

## Triggers (for automation)

### 1. **trg_UpdateMemberDonationStats**
Automatically updates `Members.TotalDonationAmount` and `DonationCount` when donations change.

### 2. **trg_DonationAuditLog**
Automatically creates audit log entries when donations are created/updated.

---

## Stored Procedures

| Procedure | Purpose |
|-----------|---------|
| `sp_GetDashboardSummary` | Get summary stats for dashboard |
| `sp_GetTopDonors` | Get top 10 donors with aggregates |
| `sp_GetRecentDonations` | Get recent donations with filters |
| `sp_GetDonationsByCategory` | Get donations grouped by category |
| `sp_GetMonthlyTrends` | Get 6 months of trend data |
| `sp_GetDailyDonations` | Get last 30 days daily totals |
| `sp_GetDonorProfile` | Get detailed donor profile |

---

## Sample Data Relationships

```
Member (Ahsan Ahmed)
├── Donation #1: 25,000 BDT | General | Online | Completed
├── Donation #2: 30,000 BDT | Event | Online | Completed
└── Donation #3: 50,000 BDT | Project | Cheque | Pending

Member (Fatima Khan)
├── Donation #4: 50,000 BDT | Event | Bank Transfer | Completed
└── Donation #5: 35,000 BDT | General | Cheque | Completed
```

---

## Indexes & Performance

### Key Indexes Created:
1. **Members.Email** - UNIQUE (login lookups)
2. **Members.IsActive** - For filtering active members
3. **Donations.MemberId** - Foreign key navigation
4. **Donations.DonationDate** - Date range queries
5. **Donations.Amount** - Sorting by amount
6. **Donations.StatusId** - Filter by status
7. **Donations.DonationCode** - UNIQUE lookup

### Estimated Query Performance:
- Dashboard summary: < 100ms
- Top donors (10 items): < 50ms
- Recent donations (50 items): < 100ms
- Monthly trends: < 50ms
- Donor profile: < 30ms

---

## Database Size Estimation

For 10,000 donations from 1,000 members:
- **Donations table**: ~5 MB
- **Members table**: ~1 MB
- **Indexes**: ~2 MB
- **Audit logs** (if 5 per donation): ~25 MB
- **Total**: ~35-40 MB

---

## Backup & Maintenance

### Recommended Maintenance:
1. **Daily**: Backup database
2. **Weekly**: Update statistics
3. **Monthly**: Archive old audit logs
4. **Quarterly**: Recalculate aggregates in StatisticsTable

---

## Migration Notes (EF Core)

To create these tables in .NET:
```bash
# Add migration
dotnet ef migrations add AddDonationSystem

# Apply migration
dotnet ef database update
```

All configurations are in `ClubManagementDbContext.cs`

---

## Security Considerations

1. ✓ User inputs validated at database level (CHECK constraints)
2. ✓ Sensitive data (phone) can be encrypted in application
3. ✓ Audit logs track all changes
4. ✓ Foreign keys prevent orphaned records
5. ✓ Unique constraints prevent duplicates

---

**Version**: 1.0.0  
**Database**: SQL Server 2019+  
**ORM**: Entity Framework Core 8.0+  
**Last Updated**: 2026-04-21
