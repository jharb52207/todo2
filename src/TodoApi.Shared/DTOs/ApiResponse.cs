namespace TodoApi.Shared.DTOs;

/// <summary>
/// Standard API response envelope with a typed data payload.
/// </summary>
/// <typeparam name="T">Type of the data payload.</typeparam>
/// <param name="Success">Whether the request succeeded.</param>
/// <param name="Data">The response payload. Null on failure.</param>
/// <param name="Message">Optional human-readable message.</param>
/// <param name="Errors">Optional list of validation or error details.</param>
public record ApiResponse<T>(
    bool Success,
    T? Data,
    string? Message = null,
    IEnumerable<string>? Errors = null
)
{
    public static ApiResponse<T> Ok(T data, string? message = null) =>
        new(true, data, message);

    public static ApiResponse<T> Fail(string message, IEnumerable<string>? errors = null) =>
        new(false, default, message, errors);
}

/// <summary>
/// Standard API response envelope without a data payload.
/// </summary>
/// <param name="Success">Whether the request succeeded.</param>
/// <param name="Message">Optional human-readable message.</param>
/// <param name="Errors">Optional list of validation or error details.</param>
public record ApiResponse(
    bool Success,
    string? Message = null,
    IEnumerable<string>? Errors = null
)
{
    public static ApiResponse Ok(string? message = null) =>
        new(true, message);

    public static ApiResponse Fail(string message, IEnumerable<string>? errors = null) =>
        new(false, message, errors);
}
