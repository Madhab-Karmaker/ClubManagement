using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClubManagement.Controllers
{
    [ApiController]
    [Route("api/search")]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;

        public SearchController(ISearchService searchService) =>
            _searchService = searchService;

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] int maxResults = 5)
        {
            if (string.IsNullOrWhiteSpace(q))
                return Ok(new { members = new List<object>(), donations = new List<object>(), events = new List<object>(), totalResults = 0 });

            var results = await _searchService.SearchAsync(q, maxResults);
            return Ok(results);
        }
    }
}
