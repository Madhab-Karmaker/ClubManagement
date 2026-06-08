using System.Globalization;
using System.Text;
using ClubManagement.Domain.Models;
using ClubManagement.Infrastructure.Data;
using ClubManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Services.Implementations
{
    public class ExportService : IExportService
    {
        private readonly AppDbContext _context;

        public ExportService(AppDbContext context) => _context = context;

        public async Task<byte[]> ExportDonationsToCsvAsync(DateTime? fromDate = null, DateTime? toDate = null, int? categoryId = null)
        {
            var query = _context.Donations
                .Include(d => d.Member)
                .Include(d => d.Category)
                .Include(d => d.PaymentMethodLookup)
                .Include(d => d.Status)
                .AsQueryable();

            if (fromDate.HasValue) query = query.Where(d => d.DonationDate >= fromDate.Value);
            if (toDate.HasValue) query = query.Where(d => d.DonationDate <= toDate.Value);
            if (categoryId.HasValue) query = query.Where(d => d.CategoryId == categoryId.Value);

            var donations = await query.OrderByDescending(d => d.DonationDate).ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("ID,MemberName,Email,Amount,Category,PaymentMethod,Status,DonationDate,ReferenceNumber,Note");

            foreach (var d in donations)
            {
                sb.AppendLine($"{d.Id},\"{d.Member.FirstName} {d.Member.LastName}\",\"{d.Member.Email}\",{d.Amount.ToString("F2", CultureInfo.InvariantCulture)},\"{d.Category?.CategoryName}\",\"{d.PaymentMethodLookup?.MethodName}\",\"{d.Status?.StatusName}\",{d.DonationDate:yyyy-MM-dd},\"{d.ReferenceNumber}\",\"{d.Note?.Replace("\"", "\"\"")}\"");
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public async Task<byte[]> ExportMembersToCsvAsync(string? search = null, bool? isActive = null)
        {
            var query = _context.Members.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(m =>
                    m.FirstName.ToLower().Contains(s) ||
                    m.LastName.ToLower().Contains(s) ||
                    m.Email.ToLower().Contains(s) ||
                    m.PhoneNumber.Contains(s));
            }

            if (isActive.HasValue)
                query = query.Where(m => m.IsActive == isActive.Value);

            var members = await query.OrderBy(m => m.LastName).ThenBy(m => m.FirstName).ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("MemberID,FirstName,LastName,Email,Phone,Address,JoinDate,ExpiryDate,IsActive");

            foreach (var m in members)
            {
                sb.AppendLine($"{m.MemberId},\"{m.FirstName}\",\"{m.LastName}\",\"{m.Email}\",\"{m.PhoneNumber}\",\"{m.Address?.Replace("\"", "\"\"")}\",{m.JoinDate:yyyy-MM-dd},{m.ExpiryDate:yyyy-MM-dd},{m.IsActive}");
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public async Task<byte[]> ExportDonationsToExcelAsync(DateTime? fromDate = null, DateTime? toDate = null, int? categoryId = null)
        {
            var csv = await ExportDonationsToCsvAsync(fromDate, toDate, categoryId);
            var excelBytes = ConvertCsvToExcelBytes(csv);
            return excelBytes;
        }

        public async Task<byte[]> ExportMembersToExcelAsync(string? search = null, bool? isActive = null)
        {
            var csv = await ExportMembersToCsvAsync(search, isActive);
            var excelBytes = ConvertCsvToExcelBytes(csv);
            return excelBytes;
        }

        private static byte[] ConvertCsvToExcelBytes(byte[] csvBytes)
        {
            var html = $@"
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:x='urn:schemas-microsoft-com:office:excel'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='UTF-8'>
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>td {{ mso-number-format:'\@'; }}</style>
</head><body><table>{CsvToHtmlTable(Encoding.UTF8.GetString(csvBytes))}</table></body></html>";
            return Encoding.UTF8.GetBytes(html);
        }

        private static string CsvToHtmlTable(string csv)
        {
            var lines = csv.Split('\n', StringSplitOptions.RemoveEmptyEntries);
            var sb = new StringBuilder();
            foreach (var line in lines)
            {
                sb.Append("<tr>");
                var inQuotes = false;
                var current = new StringBuilder();
                for (int i = 0; i < line.Length; i++)
                {
                    var c = line[i];
                    if (c == '"') { inQuotes = !inQuotes; continue; }
                    if (c == ',' && !inQuotes)
                    {
                        sb.Append("<td>").Append(current).Append("</td>");
                        current.Clear();
                        continue;
                    }
                    current.Append(c);
                }
                sb.Append("<td>").Append(current).Append("</td>");
                sb.Append("</tr>");
            }
            return sb.ToString();
        }
    }
}
