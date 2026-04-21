# 🗄️ Database Implementation Guide

## Quick Start - Step by Step

### Option 1: SQL Server (Recommended)

#### Step 1: Create Database
```sql
CREATE DATABASE ClubManagementDB;
USE ClubManagementDB;
```

#### Step 2: Run Full Schema Script
Execute the `DATABASE_SCHEMA_SQLSERVER.sql` file:
```bash
sqlcmd -S YOUR_SERVER -U sa -P YOUR_PASSWORD -d ClubManagementDB -i DATABASE_SCHEMA_SQLSERVER.sql
```

#### Step 3: Verify Tables Created
```sql
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo';
```

---

### Option 2: Entity Framework Core (.NET)

#### Step 1: Install EF Core Tools
```bash
dotnet tool install --global dotnet-ef
```

#### Step 2: Update Connection String
In `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=ClubManagementDB;User Id=sa;Password=YOUR_PASSWORD;"
  }
}
```

#### Step 3: Register DbContext in Startup
In `Program.cs`:
```csharp
builder.Services.AddDbContext<ClubManagementDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
```

#### Step 4: Create and Apply Migration
```bash
# Create migration
dotnet ef migrations add InitialDonationSchema

# Apply migration
dotnet ef database update
```

#### Step 5: Verify
```bash
dotnet ef dbcontext info
```

---

## Database Structure Overview

### 8 Main Tables:
1. **DonationCategories** - Donation types (General, Event, Cause, Project)
2. **PaymentMethods** - Payment ways (Cash, Online, Cheque, Bank Transfer)
3. **DonationStatuses** - Status types (Completed, Pending, Cancelled)
4. **Members** - Club members/donors
5. **Donations** - Donation transactions ⭐ Main table
6. **DonationStatistics** - Daily aggregated stats (optional)
7. **MonthlySummary** - Monthly trends (optional)
8. **DonationAuditLog** - Change tracking (optional)

---

## Table Relationships

```
┌─────────────────────────────────────┐
│ DonationCategories / PaymentMethods │
│         / DonationStatuses          │
│      (Lookup Tables)                │
└─────────────────────────────────────┘
                 ▲
                 │
                 ├─ Many ─┐
                          │
┌──────────────┐   ┌──────────────────┐
│   Members    │◄──│   Donations      │
│              │   │  (Main Table)    │
│ 1 : Many     │   │                  │
└──────────────┘   └──────────────────┘
                          ▲
                          │
                   ┌──────────────────┐
                   │ DonationAuditLog │
                   │  (Optional)      │
                   └──────────────────┘
```

---

## Column Details

### Members Table
```
Column              Type            Purpose
─────────────────────────────────────────────────
MemberId           INT (PK)        Unique identifier
MemberName         NVARCHAR(150)   Full name
Email              NVARCHAR(100)   Contact email (UNIQUE)
PhoneNumber        NVARCHAR(20)    Contact phone
Address            NVARCHAR(300)   Physical address
ProfileImageUrl    NVARCHAR(500)   Avatar/photo URL
JoinDate           DATETIME        When joined
LastDonationDate   DATETIME        Most recent donation
IsActive           BIT             Active/Inactive status
TotalDonationAmount DECIMAL(15,2)  Sum of all donations (auto-updated)
DonationCount      INT             Number of donations (auto-updated)
CreatedAt          DATETIME        Record creation time
UpdatedAt          DATETIME        Last update time
```

### Donations Table (Core)
```
Column              Type            Purpose
────────────────────────────────────────────────────
DonationId         INT (PK)        Unique identifier
DonationCode       NVARCHAR(50)    Display code (like DT-00001)
MemberId           INT (FK)        Who donated
Amount             DECIMAL(15,2)   Amount in BDT
DonationDate       DATETIME        When donated
CategoryId         INT (FK)        Category (General/Event/Cause/Project)
PaymentMethodId    INT (FK)        How paid (Cash/Online/Cheque/Bank)
StatusId           INT (FK)        Status (Completed/Pending/Cancelled)
Notes              NVARCHAR(500)   Comments/remarks
ReferenceNumber    NVARCHAR(100)   Transaction reference
ReceiptIssuedDate  DATETIME        When receipt issued
CreatedAt          DATETIME        Record creation
UpdatedAt          DATETIME        Last modification
CreatedBy          NVARCHAR(100)   Who created record
```

---

## Key Features

### ✓ Automatic Updates
- **Members.TotalDonationAmount** - Auto-updated when donation added/modified
- **Members.DonationCount** - Auto-updated via trigger
- **Members.LastDonationDate** - Auto-updated via trigger

### ✓ Data Integrity
- Check constraint: `Amount > 0`
- Foreign keys prevent orphaned records
- Cascade delete: Delete member → delete donations
- Unique constraints: Email, DonationCode, CategoryName

### ✓ Performance Optimized
- Indexes on frequently queried columns
- Date-range optimized for filtering
- Member lookups by email/phone
- Amount sorting support

### ✓ Audit Trail
- All changes tracked in AuditLog table
- User/timestamp of changes
- Old and new values stored
- Compliance ready

---

## Sample Queries

### Get Dashboard Summary (Last 30 Days)
```sql
EXEC sp_GetDashboardSummary 
    @StartDate = '2024-03-21',
    @EndDate = '2024-04-21';
```

### Get Top 10 Donors
```sql
EXEC sp_GetTopDonors @Limit = 10;
```

### Get Recent Donations (Filtered)
```sql
EXEC sp_GetRecentDonations 
    @StartDate = '2024-04-01',
    @EndDate = '2024-04-21',
    @Limit = 50;
```

### Get Donations by Category
```sql
EXEC sp_GetDonationsByCategory 
    @StartDate = '2024-03-21',
    @EndDate = '2024-04-21';
```

### Get Monthly Trends
```sql
EXEC sp_GetMonthlyTrends @Months = 6;
```

### Get Daily Data for Chart
```sql
EXEC sp_GetDailyDonations @Days = 30;
```

---

## Connection Strings

### SQL Server
```
Server=localhost;Database=ClubManagementDB;User Id=sa;Password=YourPassword;
```

### Azure SQL Database
```
Server=yourserver.database.windows.net;Database=ClubManagementDB;User Id=admin;Password=YourPassword;Encrypt=true;
```

### Local Development
```
Server=(localdb)\mssqllocaldb;Database=ClubManagementDB;Integrated Security=true;
```

---

## Backup & Restore

### Backup Database
```sql
BACKUP DATABASE ClubManagementDB 
TO DISK = 'C:\Backups\ClubManagement_$(DATE).bak';
```

### Restore Database
```sql
RESTORE DATABASE ClubManagementDB 
FROM DISK = 'C:\Backups\ClubManagement_2024-04-21.bak';
```

---

## Performance Tips

1. **Create indexes** on frequently filtered columns
2. **Archive old data** to improve query speed
3. **Use pagination** for large result sets
4. **Cache dashboard data** daily in statistics table
5. **Monitor query execution plans**

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Foreign key constraint | Ensure parent records exist first |
| Duplicate email error | Email must be unique |
| Amount validation error | Amount must be > 0 |
| Connection timeout | Check server availability |
| Migration conflicts | Delete pending migrations and reapply |

---

## Data Validation Rules

### At Database Level:
- Amount > 0 (CHECK constraint)
- Email is unique
- DonationCode is unique
- FK constraints enforced

### At Application Level:
- Validate email format
- Validate phone number format
- Sanitize notes/comments
- Validate date ranges

---

## Database Monitoring

### Check Table Sizes
```sql
SELECT 
    t.name AS TableName,
    p.rows AS RowCount,
    (ps.used_page_count * 8) / 1024 AS UsedMB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.object_id = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.object_id
INNER JOIN sys.dm_db_partition_stats ps ON i.object_id = ps.object_id
ORDER BY ps.used_page_count DESC;
```

### Check Index Performance
```sql
SELECT 
    OBJECT_NAME(ips.object_id) AS TableName,
    i.name AS IndexName,
    ips.user_seeks,
    ips.user_scans,
    ips.user_lookups
FROM sys.dm_db_index_usage_stats ips
INNER JOIN sys.indexes i ON ips.object_id = i.object_id;
```

---

## Migration Checklist

- [ ] Create database
- [ ] Run SQL schema script OR apply EF migrations
- [ ] Verify all tables created
- [ ] Insert lookup data (Categories, PaymentMethods, Statuses)
- [ ] Test connections from application
- [ ] Run stored procedures
- [ ] Verify triggers are working
- [ ] Set up backups
- [ ] Configure user permissions
- [ ] Test data flow end-to-end

---

## Next Steps

1. **Create Database** using the schema provided
2. **Connect Frontend** to API
3. **Create API Endpoints** using models
4. **Test CRUD Operations**
5. **Verify Aggregations** (totals, counts)
6. **Set Up Backups**
7. **Monitor Performance**

---

## Support Resources

- **Schema File**: `DATABASE_SCHEMA_SQLSERVER.sql`
- **Models File**: `Models/DonationModels.cs`
- **DbContext File**: `Data/ClubManagementDbContext.cs`
- **Schema Guide**: `DATABASE_SCHEMA_GUIDE.md`

---

**Version**: 1.0.0  
**Last Updated**: 2026-04-21  
**Status**: Ready for Implementation
