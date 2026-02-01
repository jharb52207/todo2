using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.Services;
using TodoApi.Shared.DTOs;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class TodoController : ControllerBase
{
    private readonly ITodoService _todoService;

    public TodoController(ITodoService todoService)
    {
        _todoService = todoService;
    }

    /// <summary>
    /// Gets all todo items for the current user.
    /// </summary>
    /// <remarks>
    /// Returns every todo item owned by the authenticated user, ordered by creation date descending.
    /// </remarks>
    /// <response code="200">Returns the list of todo items.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<TodoItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var items = await _todoService.GetAllAsync(userId);
        return Ok(ApiResponse<IEnumerable<TodoItemDto>>.Ok(items));
    }

    /// <summary>
    /// Gets a specific todo item by ID.
    /// </summary>
    /// <param name="id">The unique identifier of the todo item.</param>
    /// <response code="200">Returns the requested todo item.</response>
    /// <response code="404">No todo item exists with the given ID.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<TodoItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();
        var item = await _todoService.GetByIdAsync(id, userId);
        if (item is null)
            return NotFound(ApiResponse.Fail("Todo item not found."));

        return Ok(ApiResponse<TodoItemDto>.Ok(item));
    }

    /// <summary>
    /// Creates a new todo item.
    /// </summary>
    /// <remarks>
    /// Title is required and must be 200 characters or fewer. Priority defaults to Medium if not specified.
    /// </remarks>
    /// <param name="request">The todo item to create.</param>
    /// <response code="201">The todo item was created successfully.</response>
    /// <response code="400">Validation failed (e.g. missing or oversized title).</response>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<TodoItemDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateTodoItemRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(ApiResponse.Fail("Title is required.", new[] { "Title cannot be empty." }));

        if (request.Title.Length > 200)
            return BadRequest(ApiResponse.Fail("Title is too long.", new[] { "Title must be 200 characters or fewer." }));

        var userId = GetUserId();
        var item = await _todoService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<TodoItemDto>.Ok(item, "Todo item created."));
    }

    /// <summary>
    /// Updates an existing todo item.
    /// </summary>
    /// <remarks>
    /// Uses partial-update semantics: only non-null fields in the request body are applied.
    /// Omit a field or set it to null to leave it unchanged.
    /// </remarks>
    /// <param name="id">The unique identifier of the todo item to update.</param>
    /// <param name="request">The fields to update.</param>
    /// <response code="200">The todo item was updated successfully.</response>
    /// <response code="404">No todo item exists with the given ID.</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<TodoItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTodoItemRequest request)
    {
        if (request.Title is not null && request.Title.Length > 200)
            return BadRequest(ApiResponse.Fail("Title is too long.", new[] { "Title must be 200 characters or fewer." }));

        var userId = GetUserId();
        var item = await _todoService.UpdateAsync(id, request, userId);
        if (item is null)
            return NotFound(ApiResponse.Fail("Todo item not found."));

        return Ok(ApiResponse<TodoItemDto>.Ok(item, "Todo item updated."));
    }

    /// <summary>
    /// Deletes a todo item.
    /// </summary>
    /// <param name="id">The unique identifier of the todo item to delete.</param>
    /// <response code="200">The todo item was deleted successfully.</response>
    /// <response code="404">No todo item exists with the given ID.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var deleted = await _todoService.DeleteAsync(id, userId);
        if (!deleted)
            return NotFound(ApiResponse.Fail("Todo item not found."));

        return Ok(ApiResponse.Ok("Todo item deleted."));
    }

    /// <summary>
    /// Health check endpoint.
    /// </summary>
    /// <remarks>
    /// Returns the current server status and UTC timestamp. Use this to verify the API is running.
    /// </remarks>
    /// <response code="200">The API is healthy.</response>
    /// <summary>
    /// Bulk create todo items.
    /// </summary>
    [HttpPost("bulk")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<TodoItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> BulkCreate([FromBody] CreateTodoItemRequest[] requests)
    {
        var userId = GetUserId();
        var items = await _todoService.BulkCreateAsync(requests, userId);
        return Ok(ApiResponse<IEnumerable<TodoItemDto>>.Ok(items, "Todo items created."));
    }

    [AllowAnonymous]
    [HttpGet("/api/health")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public IActionResult Health()
    {
        return Ok(ApiResponse<object>.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
}
