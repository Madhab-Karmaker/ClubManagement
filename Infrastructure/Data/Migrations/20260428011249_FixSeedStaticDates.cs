using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClubManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixSeedStaticDates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DonationType",
                table: "Donations");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Donations");

            migrationBuilder.UpdateData(
                table: "DonationCategories",
                keyColumn: "CategoryId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "DonationCategories",
                keyColumn: "CategoryId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "DonationCategories",
                keyColumn: "CategoryId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "DonationCategories",
                keyColumn: "CategoryId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "DonationStatuses",
                keyColumn: "StatusId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "DonationStatuses",
                keyColumn: "StatusId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "DonationStatuses",
                keyColumn: "StatusId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "PaymentMethodId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "PaymentMethodId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "PaymentMethodId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "PaymentMethodId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 0, DateTimeKind.Utc));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DonationType",
                table: "Donations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethod",
                table: "Donations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "DonationCategories",
                keyColumn: "CategoryId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 120, DateTimeKind.Utc).AddTicks(5994));

            migrationBuilder.UpdateData(
                table: "DonationCategories",
                keyColumn: "CategoryId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 120, DateTimeKind.Utc).AddTicks(5996));

            migrationBuilder.UpdateData(
                table: "DonationCategories",
                keyColumn: "CategoryId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 120, DateTimeKind.Utc).AddTicks(5998));

            migrationBuilder.UpdateData(
                table: "DonationCategories",
                keyColumn: "CategoryId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 120, DateTimeKind.Utc).AddTicks(5999));

            migrationBuilder.UpdateData(
                table: "DonationStatuses",
                keyColumn: "StatusId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 121, DateTimeKind.Utc).AddTicks(5223));

            migrationBuilder.UpdateData(
                table: "DonationStatuses",
                keyColumn: "StatusId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 121, DateTimeKind.Utc).AddTicks(5225));

            migrationBuilder.UpdateData(
                table: "DonationStatuses",
                keyColumn: "StatusId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 121, DateTimeKind.Utc).AddTicks(5226));

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "PaymentMethodId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 121, DateTimeKind.Utc).AddTicks(2579));

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "PaymentMethodId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 121, DateTimeKind.Utc).AddTicks(2581));

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "PaymentMethodId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 121, DateTimeKind.Utc).AddTicks(2582));

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "PaymentMethodId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 18, 4, 6, 121, DateTimeKind.Utc).AddTicks(2583));
        }
    }
}
