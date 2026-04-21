# 🔧 ACTION PLAN: Update Donation.cs

## What You Have Now

```csharp
public class Donation
{
    public int Id { get; set; }
    public int MemberId { get; set; }
    public Member Member { get; set; } = null!;
    
    public decimal Amount { get; set; }
    public DonationType DonationType { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    
    public string? ReferenceNumber { get; set; }
    public DateTime DonationDate { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

---

## What to ADD (Copy-Paste)

Add these properties to **Donation.cs**:

```csharp
// ============================================================
// NEW FIELDS FOR DASHBOARD SYSTEM
// ============================================================

/// <summary>Donation Status: Completed (1), Pending (2), Cancelled (3)</summary>
public int StatusId { get; set; } = 1; // Default: Completed

/// <summary>Navigation to DonationStatus</summary>
public DonationStatus Status { get; set; } = null!;

/// <summary>Donation Category: General, Event, Cause, Project</summary>
public int CategoryId { get; set; }

/// <summary>Navigation to DonationCategory</summary>
public DonationCategory Category { get; set; } = null!;

/// <summary>Payment Method: Cash, Online, Cheque, BankTransfer</summary>
public int PaymentMethodId { get; set; }

/// <summary>Navigation to PaymentMethodLookup</summary>
public PaymentMethodLookup PaymentMethodLookup { get; set; } = null!;

/// <summary>Audit logs for this donation (tracks all changes)</summary>
public ICollection<DonationAuditLog> AuditLogs { get; set; } 
    = new List<DonationAuditLog>();
```

---

## Complete Updated File

Here's the FULL updated **Donation.cs**:

```csharp
using ClubManagement.Domain.Constants;

namespace ClubManagement.Domain.Models
{
    public class Donation
    {
        // ============================================================
        // CORE FIELDS (Existing)
        // ============================================================
        public int Id { get; set; }
        public int MemberId { get; set; }
        public Member Member { get; set; } = null!;

        public decimal Amount { get; set; }
        public DateTime DonationDate { get; set; }
        public string? ReferenceNumber { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ============================================================
        // LEGACY FIELDS (Keep for backward compatibility - Mark Obsolete)
        // ============================================================
        [Obsolete("Use CategoryId with DonationCategory table instead")]
        public DonationType DonationType { get; set; }

        [Obsolete("Use PaymentMethodId with PaymentMethodLookup table instead")]
        public PaymentMethod PaymentMethod { get; set; }

        // ============================================================
        // NEW FIELDS FOR DASHBOARD SYSTEM
        // ============================================================

        /// <summary>
        /// Donation Status FK
        /// 1 = Completed, 2 = Pending, 3 = Cancelled
        /// </summary>
        public int StatusId { get; set; } = 1; // Default: Completed

        /// <summary>Navigation to DonationStatus (Completed/Pending/Cancelled)</summary>
        public DonationStatus Status { get; set; } = null!;

        /// <summary>
        /// Donation Category FK
        /// 1 = General, 2 = Event, 3 = Cause, 4 = Project
        /// </summary>
        public int CategoryId { get; set; }

        /// <summary>Navigation to DonationCategory</summary>
        public DonationCategory Category { get; set; } = null!;

        /// <summary>
        /// Payment Method FK
        /// 1 = Cash, 2 = Online, 3 = Cheque, 4 = BankTransfer
        /// </summary>
        public int PaymentMethodId { get; set; }

        /// <summary>Navigation to PaymentMethodLookup</summary>
        public PaymentMethodLookup PaymentMethodLookup { get; set; } = null!;

        /// <summary>Audit logs tracking all changes to this donation</summary>
        public ICollection<DonationAuditLog> AuditLogs { get; set; } 
            = new List<DonationAuditLog>();
    }
}
```

---

## Step-by-Step Instructions

### **Step 1: Open Donation.cs**
```
File: g:\ClubManagement\ClubManagement\Domain\Models\Donation.cs
```

### **Step 2: Copy the new fields above**
From "// ============================================================" 
To "= new List<DonationAuditLog>();"

### **Step 3: Add to your file after CreatedAt property**

### **Step 4: Mark old fields as Obsolete**
Add `[Obsolete("...")]` to DonationType and PaymentMethod

### **Step 5: Save file**

### **Step 6: Create migration**
```bash
dotnet ef migrations add EnhanceDonationWithStatusCategoryPayment
dotnet ef database update
```

---

## ✅ That's It!

Once you update Donation.cs, the dashboard will work perfectly with:
- ✅ Status tracking (Completed/Pending/Cancelled)
- ✅ Flexible categories (can add via DB)
- ✅ Flexible payment methods (can add via DB)
- ✅ Full audit trail (track all changes)
- ✅ Analytics tables (fast queries)

**No other changes needed!** 🎉
