using ClubManagement.Domain.DTOs;

namespace ClubManagement.Services.Interfaces
{
    public interface ISearchService
    {
        Task<SearchResultDto> SearchAsync(string query, int maxResultsPerType = 5);
    }
}
