-- ============================================================================
-- DONATION MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ============================================================================
-- Database: ClubManagementDB
-- Tables: Users, Members, Donations, DonationCategories, DonationStatistics
-- ============================================================================

-- ============================================================================
-- 1. DONATION CATEGORIES TABLE
-- ============================================================================
CREATE TABLE DonationCategories (
    CategoryId INT PRIMARY KEY IDENTITY(1,1),
    CategoryName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);

-- Insert sample categories
INSERT INTO DonationCategories (CategoryName, Description)
VALUES
    ('General', 'General donations for club operations'),
    ('Event', 'Donations for specific events'),
    ('Cause', 'Donations for special causes'),
    ('Project', 'Donations for specific projects');

-- ============================================================================
-- 2. PAYMENT METHODS TABLE
-- ============================================================================
CREATE TABLE PaymentMethods (
    PaymentMethodId INT PRIMARY KEY IDENTITY(1,1),
    MethodName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(200),
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);

-- Insert sample payment methods
INSERT INTO PaymentMethods (MethodName, Description)
VALUES
    ('Cash', 'Cash payment'),
    ('Online', 'Online payment via bank or payment gateway'),
    ('Cheque', 'Payment via cheque'),
    ('Bank Transfer', 'Direct bank transfer');

-- ============================================================================
-- 3. DONATION STATUS TABLE
-- ============================================================================
CREATE TABLE DonationStatuses (
    StatusId INT PRIMARY KEY IDENTITY(1,1),
    StatusName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(200),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Insert sample statuses
INSERT INTO DonationStatuses (StatusName, Description)
VALUES
    ('Completed', 'Donation has been completed and verified'),
    ('Pending', 'Donation is pending verification'),
    ('Cancelled', 'Donation has been cancelled');

-- ============================================================================
-- 4. MEMBERS/DONORS TABLE
-- ============================================================================
CREATE TABLE Members (
    MemberId INT PRIMARY KEY IDENTITY(1,1),
    MemberName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(100) UNIQUE,
    PhoneNumber NVARCHAR(20),
    Address NVARCHAR(300),
    ProfileImageUrl NVARCHAR(500),
    JoinDate DATETIME DEFAULT GETDATE(),
    LastDonationDate DATETIME,
    IsActive BIT DEFAULT 1,
    TotalDonationAmount DECIMAL(15,2) DEFAULT 0,
    DonationCount INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create index for frequently searched columns
CREATE INDEX IDX_Members_Email ON Members(Email);
CREATE INDEX IDX_Members_PhoneNumber ON Members(PhoneNumber);
CREATE INDEX IDX_Members_IsActive ON Members(IsActive);
CREATE INDEX IDX_Members_JoinDate ON Members(JoinDate);

-- ============================================================================
-- 5. DONATIONS TABLE
-- ============================================================================
CREATE TABLE Donations (
    DonationId INT PRIMARY KEY IDENTITY(1,1),
    DonationCode NVARCHAR(50) UNIQUE,
    MemberId INT NOT NULL,
    Amount DECIMAL(15,2) NOT NULL CHECK (Amount > 0),
    DonationDate DATETIME DEFAULT GETDATE(),
    CategoryId INT NOT NULL,
    PaymentMethodId INT NOT NULL,
    StatusId INT NOT NULL,
    Notes NVARCHAR(500),
    ReferenceNumber NVARCHAR(100),
    ReceiptIssuedDate DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),

    -- Foreign Keys
    CONSTRAINT FK_Donations_Members FOREIGN KEY (MemberId)
        REFERENCES Members(MemberId) ON DELETE CASCADE,
    CONSTRAINT FK_Donations_Categories FOREIGN KEY (CategoryId)
        REFERENCES DonationCategories(CategoryId),
    CONSTRAINT FK_Donations_PaymentMethods FOREIGN KEY (PaymentMethodId)
        REFERENCES PaymentMethods(PaymentMethodId),
    CONSTRAINT FK_Donations_Statuses FOREIGN KEY (StatusId)
        REFERENCES DonationStatuses(StatusId)
);

-- Create indexes for query optimization
CREATE INDEX IDX_Donations_MemberId ON Donations(MemberId);
CREATE INDEX IDX_Donations_DonationDate ON Donations(DonationDate);
CREATE INDEX IDX_Donations_CategoryId ON Donations(CategoryId);
CREATE INDEX IDX_Donations_PaymentMethodId ON Donations(PaymentMethodId);
CREATE INDEX IDX_Donations_StatusId ON Donations(StatusId);
CREATE INDEX IDX_Donations_Amount ON Donations(Amount);
CREATE INDEX IDX_Donations_DonationCode ON Donations(DonationCode);

-- ============================================================================
-- 6. DONATION STATISTICS TABLE (Optional - for caching aggregated data)
-- ============================================================================
CREATE TABLE DonationStatistics (
    StatisticId INT PRIMARY KEY IDENTITY(1,1),
    StatisticDate DATE NOT NULL UNIQUE,
    TotalDonations DECIMAL(15,2) DEFAULT 0,
    CompletedDonations DECIMAL(15,2) DEFAULT 0,
    PendingDonations DECIMAL(15,2) DEFAULT 0,
    TotalDonationCount INT DEFAULT 0,
    UniqueDonors INT DEFAULT 0,
    LastUpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create index for date queries
CREATE INDEX IDX_DonationStatistics_Date ON DonationStatistics(StatisticDate);

-- ============================================================================
-- 7. MONTHLY DONATION SUMMARY TABLE (Optional - for analytics)
-- ============================================================================
CREATE TABLE MonthlySummary (
    SummaryId INT PRIMARY KEY IDENTITY(1,1),
    YearMonth NVARCHAR(7) NOT NULL UNIQUE, -- Format: YYYY-MM
    TotalAmount DECIMAL(15,2) DEFAULT 0,
    DonationCount INT DEFAULT 0,
    UniqueDonors INT DEFAULT 0,
    PreviousMonthAmount DECIMAL(15,2) DEFAULT 0,
    PercentageChange DECIMAL(5,2) DEFAULT 0,
    LastUpdatedAt DATETIME DEFAULT GETDATE()
);

-- ============================================================================
-- 8. DONATION AUDIT LOG TABLE (Optional - for tracking changes)
-- ============================================================================
CREATE TABLE DonationAuditLog (
    AuditId INT PRIMARY KEY IDENTITY(1,1),
    DonationId INT NOT NULL,
    ActionType NVARCHAR(50), -- Created, Updated, Deleted, Verified
    OldValue NVARCHAR(MAX),
    NewValue NVARCHAR(MAX),
    ChangedBy NVARCHAR(100),
    ChangedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_AuditLog_Donations FOREIGN KEY (DonationId)
        REFERENCES Donations(DonationId) ON DELETE CASCADE
);

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- 1. Get Dashboard Summary
CREATE PROCEDURE sp_GetDashboardSummary
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL
AS
BEGIN
    SET @StartDate = ISNULL(@StartDate, CAST(GETDATE() - 30 AS DATE));
    SET @EndDate = ISNULL(@EndDate, CAST(GETDATE() AS DATE));

    SELECT
        (SELECT SUM(Amount) FROM Donations WHERE StatusId = 1 AND DonationDate >= @StartDate AND DonationDate <= @EndDate) AS TotalDonations,
        (SELECT COUNT(DISTINCT MemberId) FROM Members WHERE IsActive = 1) AS TotalMembers,
        (SELECT COUNT(DISTINCT MemberId) FROM Donations WHERE DonationDate >= @StartDate AND DonationDate <= @EndDate) AS ActiveDonors,
        (SELECT SUM(Amount) FROM Donations WHERE MONTH(DonationDate) = MONTH(GETDATE()) AND YEAR(DonationDate) = YEAR(GETDATE()) AND StatusId = 1) AS DonationsThisMonth;
END;

-- 2. Get Top Donors
CREATE PROCEDURE sp_GetTopDonors
    @Limit INT = 10,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL
AS
BEGIN
    SET @StartDate = ISNULL(@StartDate, CAST(DATEADD(DAY, -30, GETDATE()) AS DATE));
    SET @EndDate = ISNULL(@EndDate, CAST(GETDATE() AS DATE));

    SELECT TOP (@Limit)
        M.MemberId,
        M.MemberName,
        M.Email,
        M.PhoneNumber,
        M.ProfileImageUrl,
        M.IsActive,
        M.JoinDate,
        MAX(D.DonationDate) AS LastDonationDate,
        SUM(CASE WHEN D.StatusId = 1 THEN D.Amount ELSE 0 END) AS TotalDonation,
        COUNT(D.DonationId) AS DonationCount
    FROM Members M
    LEFT JOIN Donations D ON M.MemberId = D.MemberId
        AND D.DonationDate >= @StartDate
        AND D.DonationDate <= @EndDate
    GROUP BY M.MemberId, M.MemberName, M.Email, M.PhoneNumber, M.ProfileImageUrl, M.IsActive, M.JoinDate
    ORDER BY SUM(CASE WHEN D.StatusId = 1 THEN D.Amount ELSE 0 END) DESC;
END;

-- 3. Get Recent Donations
CREATE PROCEDURE sp_GetRecentDonations
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @Limit INT = 50
AS
BEGIN
    SET @StartDate = ISNULL(@StartDate, CAST(DATEADD(DAY, -30, GETDATE()) AS DATE));
    SET @EndDate = ISNULL(@EndDate, CAST(GETDATE() AS DATE));

    SELECT TOP (@Limit)
        D.DonationId,
        D.DonationCode,
        M.MemberId,
        M.MemberName,
        M.Email,
        M.PhoneNumber,
        D.Amount,
        D.DonationDate,
        DC.CategoryName,
        PM.MethodName,
        DS.StatusName,
        D.Notes
    FROM Donations D
    INNER JOIN Members M ON D.MemberId = M.MemberId
    INNER JOIN DonationCategories DC ON D.CategoryId = DC.CategoryId
    INNER JOIN PaymentMethods PM ON D.PaymentMethodId = PM.PaymentMethodId
    INNER JOIN DonationStatuses DS ON D.StatusId = DS.StatusId
    WHERE D.DonationDate >= @StartDate AND D.DonationDate <= @EndDate
    ORDER BY D.DonationDate DESC;
END;

-- 4. Get Donation Analytics by Category
CREATE PROCEDURE sp_GetDonationsByCategory
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL
AS
BEGIN
    SET @StartDate = ISNULL(@StartDate, CAST(DATEADD(DAY, -30, GETDATE()) AS DATE));
    SET @EndDate = ISNULL(@EndDate, CAST(GETDATE() AS DATE));

    SELECT
        DC.CategoryId,
        DC.CategoryName,
        SUM(CASE WHEN D.StatusId = 1 THEN D.Amount ELSE 0 END) AS TotalAmount,
        COUNT(D.DonationId) AS DonationCount,
        CAST(
            SUM(CASE WHEN D.StatusId = 1 THEN D.Amount ELSE 0 END) * 100.0 /
            NULLIF(SUM(SUM(CASE WHEN D.StatusId = 1 THEN D.Amount ELSE 0 END)) OVER (), 0)
            AS DECIMAL(5,2)
        ) AS Percentage
    FROM DonationCategories DC
    LEFT JOIN Donations D ON DC.CategoryId = D.CategoryId
        AND D.DonationDate >= @StartDate
        AND D.DonationDate <= @EndDate
    GROUP BY DC.CategoryId, DC.CategoryName
    ORDER BY TotalAmount DESC;
END;

-- 5. Get Monthly Donation Trends
CREATE PROCEDURE sp_GetMonthlyTrends
    @Months INT = 6
AS
BEGIN
    ;WITH MonthlyData AS (
        SELECT
            CAST(DATEFROMPARTS(YEAR(D.DonationDate), MONTH(D.DonationDate), 1) AS DATE) AS MonthStart,
            SUM(CASE WHEN D.StatusId = 1 THEN D.Amount ELSE 0 END) AS TotalAmount
        FROM Donations D
        WHERE D.DonationDate >= DATEADD(MONTH, -@Months, GETDATE())
        GROUP BY YEAR(D.DonationDate), MONTH(D.DonationDate)
    )
    SELECT
        FORMAT(MonthStart, 'MMMM') AS Month,
        TotalAmount,
        LAG(TotalAmount) OVER (ORDER BY MonthStart) AS PreviousMonthAmount,
        CAST(
            CASE
                WHEN LAG(TotalAmount) OVER (ORDER BY MonthStart) > 0
                THEN ((TotalAmount - LAG(TotalAmount) OVER (ORDER BY MonthStart)) * 100.0 / LAG(TotalAmount) OVER (ORDER BY MonthStart))
                ELSE 0
            END AS DECIMAL(5,2)
        ) AS PercentageChange
    FROM MonthlyData
    ORDER BY MonthStart DESC;
END;

-- 6. Get Daily Donations (for charts)
CREATE PROCEDURE sp_GetDailyDonations
    @Days INT = 30
AS
BEGIN
    ;WITH DateRange AS (
        SELECT CAST(DATEADD(DAY, -@Days + 1, CAST(GETDATE() AS DATE)) AS DATE) AS DonationDate
        UNION ALL
        SELECT DATEADD(DAY, 1, DonationDate)
        FROM DateRange
        WHERE DonationDate < CAST(GETDATE() AS DATE)
    )
    SELECT
        DR.DonationDate,
        ISNULL(SUM(CASE WHEN D.StatusId = 1 THEN D.Amount ELSE 0 END), 0) AS TotalAmount
    FROM DateRange DR
    LEFT JOIN Donations D ON CAST(D.DonationDate AS DATE) = DR.DonationDate
    GROUP BY DR.DonationDate
    ORDER BY DR.DonationDate;
END;

-- 7. Get Donor Profile
CREATE PROCEDURE sp_GetDonorProfile
    @MemberId INT
AS
BEGIN
    SELECT
        M.MemberId,
        M.MemberName,
        M.Email,
        M.PhoneNumber,
        M.Address,
        M.ProfileImageUrl,
        M.JoinDate,
        M.IsActive,
        M.TotalDonationAmount,
        M.DonationCount,
        M.LastDonationDate,
        COUNT(D.DonationId) AS RecentDonationCount,
        SUM(CASE WHEN D.StatusId = 1 THEN D.Amount ELSE 0 END) AS RecentTotalAmount
    FROM Members M
    LEFT JOIN Donations D ON M.MemberId = D.MemberId
        AND D.DonationDate >= DATEADD(MONTH, -3, GETDATE())
    WHERE M.MemberId = @MemberId
    GROUP BY M.MemberId, M.MemberName, M.Email, M.PhoneNumber, M.Address,
             M.ProfileImageUrl, M.JoinDate, M.IsActive, M.TotalDonationAmount,
             M.DonationCount, M.LastDonationDate;
END;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Trigger to update member's total donation and count
CREATE TRIGGER trg_UpdateMemberDonationStats
ON Donations
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    -- Update Members with new donation statistics
    UPDATE M
    SET
        M.TotalDonationAmount = ISNULL((SELECT SUM(Amount) FROM Donations WHERE MemberId = M.MemberId AND StatusId = 1), 0),
        M.DonationCount = (SELECT COUNT(*) FROM Donations WHERE MemberId = M.MemberId AND StatusId = 1),
        M.LastDonationDate = (SELECT MAX(DonationDate) FROM Donations WHERE MemberId = M.MemberId AND StatusId = 1),
        M.UpdatedAt = GETDATE()
    FROM Members M
    WHERE M.MemberId IN (SELECT DISTINCT MemberId FROM inserted UNION SELECT DISTINCT MemberId FROM deleted);
END;

-- Trigger for audit log
CREATE TRIGGER trg_DonationAuditLog
ON Donations
AFTER INSERT, UPDATE
AS
BEGIN
    INSERT INTO DonationAuditLog (DonationId, ActionType, NewValue, ChangedBy, ChangedAt)
    SELECT
        DonationId,
        CASE WHEN EXISTS(SELECT 1 FROM deleted WHERE deleted.DonationId = inserted.DonationId)
             THEN 'Updated'
             ELSE 'Created'
        END,
        CONVERT(NVARCHAR(MAX), inserted.Amount) + ' - ' + CAST(inserted.DonationDate AS NVARCHAR(50)),
        SYSTEM_USER,
        GETDATE()
    FROM inserted;
END;

-- ============================================================================
-- VIEWS FOR EASY QUERYING
-- ============================================================================

-- View: Complete Donation Info
CREATE VIEW vw_DonationDetails AS
SELECT
    D.DonationId,
    D.DonationCode,
    M.MemberId,
    M.MemberName,
    M.Email,
    M.PhoneNumber,
    D.Amount,
    D.DonationDate,
    DC.CategoryName,
    PM.MethodName,
    DS.StatusName,
    D.Notes,
    D.ReferenceNumber,
    D.CreatedAt
FROM Donations D
INNER JOIN Members M ON D.MemberId = M.MemberId
INNER JOIN DonationCategories DC ON D.CategoryId = DC.CategoryId
INNER JOIN PaymentMethods PM ON D.PaymentMethodId = PM.PaymentMethodId
INNER JOIN DonationStatuses DS ON D.StatusId = DS.StatusId;

-- View: Member Donation Summary
CREATE VIEW vw_MemberDonationSummary AS
SELECT
    M.MemberId,
    M.MemberName,
    M.Email,
    M.PhoneNumber,
    M.JoinDate,
    M.IsActive,
    COUNT(D.DonationId) AS TotalDonationCount,
    SUM(CASE WHEN D.StatusId = 1 THEN D.Amount ELSE 0 END) AS TotalDonationAmount,
    MAX(D.DonationDate) AS LastDonationDate,
    AVG(CASE WHEN D.StatusId = 1 THEN D.Amount ELSE NULL END) AS AverageDonation
FROM Members M
LEFT JOIN Donations D ON M.MemberId = D.MemberId
GROUP BY M.MemberId, M.MemberName, M.Email, M.PhoneNumber, M.JoinDate, M.IsActive;

-- ============================================================================
-- SAMPLE DATA INSERT
-- ============================================================================

-- Insert sample members
INSERT INTO Members (MemberName, Email, PhoneNumber, Address, JoinDate, IsActive)
VALUES
    ('Ahsan Ahmed', 'ahsan.ahmed@example.com', '+8801712345678', 'Dhaka, Bangladesh', '2023-01-15', 1),
    ('Fatima Khan', 'fatima.khan@example.com', '+8801798765432', 'Chittagong, Bangladesh', '2023-02-20', 1),
    ('Muhammad Hassan', 'hassan.m@example.com', '+8801654321098', 'Sylhet, Bangladesh', '2023-03-10', 1),
    ('Zara Malik', 'zara.malik@example.com', '+8801523456789', 'Khulna, Bangladesh', '2023-04-05', 1),
    ('Omar Farooq', 'omar.farooq@example.com', '+8801856789012', 'Rajshahi, Bangladesh', '2023-05-12', 1);

-- Insert sample donations
INSERT INTO Donations (DonationCode, MemberId, Amount, DonationDate, CategoryId, PaymentMethodId, StatusId, Notes)
VALUES
    ('DT-00001', 1, 25000, '2024-04-10', 1, 2, 1, NULL),
    ('DT-00002', 2, 50000, '2024-04-12', 2, 4, 1, 'For annual event'),
    ('DT-00003', 3, 15000, '2024-04-14', 3, 1, 1, NULL),
    ('DT-00004', 1, 30000, '2024-04-15', 1, 2, 1, NULL),
    ('DT-00005', 4, 40000, '2024-04-18', 4, 3, 1, 'Project donation'),
    ('DT-00006', 5, 20000, '2024-04-20', 1, 2, 2, NULL),
    ('DT-00007', 2, 35000, '2024-04-22', 2, 4, 1, NULL),
    ('DT-00008', 3, 25000, '2024-04-25', 3, 1, 1, NULL);

-- ============================================================================
-- GRANT PERMISSIONS (Optional)
-- ============================================================================
-- Grant SELECT permission to app user
-- GRANT SELECT ON vw_DonationDetails TO [AppUser];
-- GRANT EXECUTE ON sp_GetDashboardSummary TO [AppUser];
-- etc.

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
