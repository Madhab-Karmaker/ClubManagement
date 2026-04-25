using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ClubManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceDonationWithStatusCategoryPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ProfilePhotoUrl",
                table: "Members",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                table: "Members",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "Members",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "FirstName",
                table: "Members",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Members",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Members",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceNumber",
                table: "Donations",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Note",
                table: "Donations",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "Donations",
                type: "numeric(15,2)",
                precision: 15,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Donations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethodId",
                table: "Donations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "StatusId",
                table: "Donations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "DonationAuditLogs",
                columns: table => new
                {
                    AuditId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DonationId = table.Column<int>(type: "integer", nullable: false),
                    ActionType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    OldValue = table.Column<string>(type: "text", nullable: true),
                    NewValue = table.Column<string>(type: "text", nullable: true),
                    ChangedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonationAuditLogs", x => x.AuditId);
                    table.ForeignKey(
                        name: "FK_DonationAuditLogs_Donations_DonationId",
                        column: x => x.DonationId,
                        principalTable: "Donations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DonationCategories",
                columns: table => new
                {
                    CategoryId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CategoryName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonationCategories", x => x.CategoryId);
                });

            migrationBuilder.CreateTable(
                name: "DonationStatistics",
                columns: table => new
                {
                    StatisticId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StatisticDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TotalDonations = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    CompletedDonations = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    PendingDonations = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    TotalDonationCount = table.Column<int>(type: "integer", nullable: false),
                    UniqueDonors = table.Column<int>(type: "integer", nullable: false),
                    LastUpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonationStatistics", x => x.StatisticId);
                });

            migrationBuilder.CreateTable(
                name: "DonationStatuses",
                columns: table => new
                {
                    StatusId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StatusName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonationStatuses", x => x.StatusId);
                });

            migrationBuilder.CreateTable(
                name: "MonthlySummaries",
                columns: table => new
                {
                    SummaryId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    YearMonth = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    DonationCount = table.Column<int>(type: "integer", nullable: false),
                    UniqueDonors = table.Column<int>(type: "integer", nullable: false),
                    PreviousMonthAmount = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    PercentageChange = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    LastUpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonthlySummaries", x => x.SummaryId);
                });

            migrationBuilder.CreateTable(
                name: "PaymentMethods",
                columns: table => new
                {
                    PaymentMethodId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MethodName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentMethods", x => x.PaymentMethodId);
                });

            migrationBuilder.InsertData(
                table: "DonationCategories",
                columns: new[] { "CategoryId", "CategoryName", "CreatedAt", "Description", "IsActive" },
                values: new object[,]
                {
                    { 1, "General", new DateTime(2026, 4, 21, 18, 4, 6, 120, DateTimeKind.Utc).AddTicks(5994), "General donations for club operations", true },
                    { 2, "Event", new DateTime(2026, 4, 21, 18, 4, 6, 120, DateTimeKind.Utc).AddTicks(5996), "Donations for specific events", true },
                    { 3, "Cause", new DateTime(2026, 4, 21, 18, 4, 6, 120, DateTimeKind.Utc).AddTicks(5998), "Donations for special causes", true },
                    { 4, "Project", new DateTime(2026, 4, 21, 18, 4, 6, 120, DateTimeKind.Utc).AddTicks(5999), "Donations for specific projects", true }
                });

            migrationBuilder.InsertData(
                table: "DonationStatuses",
                columns: new[] { "StatusId", "CreatedAt", "Description", "StatusName" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 4, 21, 18, 4, 6, 121, DateTimeKind.Utc).AddTicks(5223), "Donation has been completed and verified", "Completed" },
                    { 2, new DateTime(2026, 4, 21, 18, 4, 6, 121, DateTimeKind.Utc).AddTicks(5225), "Donation is pending verification", "Pending" },
                    { 3, new DateTime(2026, 4, 21, 18, 4, 6, 121, DateTimeKind.Utc).AddTicks(5226), "Donation has been cancelled", "Cancelled" }
                });

            migrationBuilder.InsertData(
                table: "PaymentMethods",
                columns: new[] { "PaymentMethodId", "CreatedAt", "Description", "IsActive", "MethodName" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 4, 21, 18, 4, 6, 121, DateTimeKind.Utc).AddTicks(2579), "Cash payment", true, "Cash" },
                    { 2, new DateTime(2026, 4, 21, 18, 4, 6, 121, DateTimeKind.Utc).AddTicks(2581), "Online payment via bank or payment gateway", true, "Online" },
                    { 3, new DateTime(2026, 4, 21, 18, 4, 6, 121, DateTimeKind.Utc).AddTicks(2582), "Payment via cheque", true, "Cheque" },
                    { 4, new DateTime(2026, 4, 21, 18, 4, 6, 121, DateTimeKind.Utc).AddTicks(2583), "Direct bank transfer", true, "Bank Transfer" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Members_Email",
                table: "Members",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Members_IsActive",
                table: "Members",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Members_JoinDate",
                table: "Members",
                column: "JoinDate");

            migrationBuilder.CreateIndex(
                name: "IX_Members_PhoneNumber",
                table: "Members",
                column: "PhoneNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_Amount",
                table: "Donations",
                column: "Amount");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_CategoryId",
                table: "Donations",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_CreatedAt",
                table: "Donations",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_DonationDate",
                table: "Donations",
                column: "DonationDate");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_PaymentMethodId",
                table: "Donations",
                column: "PaymentMethodId");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_StatusId",
                table: "Donations",
                column: "StatusId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Donation_Amount",
                table: "Donations",
                sql: "\"Amount\" > 0");

            migrationBuilder.CreateIndex(
                name: "IX_DonationAuditLogs_DonationId",
                table: "DonationAuditLogs",
                column: "DonationId");

            migrationBuilder.CreateIndex(
                name: "IX_DonationCategories_CategoryName",
                table: "DonationCategories",
                column: "CategoryName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DonationStatistics_StatisticDate",
                table: "DonationStatistics",
                column: "StatisticDate");

            migrationBuilder.CreateIndex(
                name: "IX_DonationStatuses_StatusName",
                table: "DonationStatuses",
                column: "StatusName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MonthlySummaries_YearMonth",
                table: "MonthlySummaries",
                column: "YearMonth",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentMethods_MethodName",
                table: "PaymentMethods",
                column: "MethodName",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Donations_DonationCategories_CategoryId",
                table: "Donations",
                column: "CategoryId",
                principalTable: "DonationCategories",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Donations_DonationStatuses_StatusId",
                table: "Donations",
                column: "StatusId",
                principalTable: "DonationStatuses",
                principalColumn: "StatusId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Donations_PaymentMethods_PaymentMethodId",
                table: "Donations",
                column: "PaymentMethodId",
                principalTable: "PaymentMethods",
                principalColumn: "PaymentMethodId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Donations_DonationCategories_CategoryId",
                table: "Donations");

            migrationBuilder.DropForeignKey(
                name: "FK_Donations_DonationStatuses_StatusId",
                table: "Donations");

            migrationBuilder.DropForeignKey(
                name: "FK_Donations_PaymentMethods_PaymentMethodId",
                table: "Donations");

            migrationBuilder.DropTable(
                name: "DonationAuditLogs");

            migrationBuilder.DropTable(
                name: "DonationCategories");

            migrationBuilder.DropTable(
                name: "DonationStatistics");

            migrationBuilder.DropTable(
                name: "DonationStatuses");

            migrationBuilder.DropTable(
                name: "MonthlySummaries");

            migrationBuilder.DropTable(
                name: "PaymentMethods");

            migrationBuilder.DropIndex(
                name: "IX_Members_Email",
                table: "Members");

            migrationBuilder.DropIndex(
                name: "IX_Members_IsActive",
                table: "Members");

            migrationBuilder.DropIndex(
                name: "IX_Members_JoinDate",
                table: "Members");

            migrationBuilder.DropIndex(
                name: "IX_Members_PhoneNumber",
                table: "Members");

            migrationBuilder.DropIndex(
                name: "IX_Donations_Amount",
                table: "Donations");

            migrationBuilder.DropIndex(
                name: "IX_Donations_CategoryId",
                table: "Donations");

            migrationBuilder.DropIndex(
                name: "IX_Donations_CreatedAt",
                table: "Donations");

            migrationBuilder.DropIndex(
                name: "IX_Donations_DonationDate",
                table: "Donations");

            migrationBuilder.DropIndex(
                name: "IX_Donations_PaymentMethodId",
                table: "Donations");

            migrationBuilder.DropIndex(
                name: "IX_Donations_StatusId",
                table: "Donations");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Donation_Amount",
                table: "Donations");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Donations");

            migrationBuilder.DropColumn(
                name: "PaymentMethodId",
                table: "Donations");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "Donations");

            migrationBuilder.AlterColumn<string>(
                name: "ProfilePhotoUrl",
                table: "Members",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                table: "Members",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "Members",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "FirstName",
                table: "Members",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Members",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Members",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(300)",
                oldMaxLength: 300,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceNumber",
                table: "Donations",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Note",
                table: "Donations",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "Donations",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(15,2)",
                oldPrecision: 15,
                oldScale: 2);
        }
    }
}
