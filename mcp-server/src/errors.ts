/**
 * Error handling utilities for the ClauseGuard MCP server.
 *
 * Two error channels exist:
 *
 * 1. **Domain errors** (this module) -- Business logic failures that the
 *    calling LLM should handle gracefully. Returned as `{ isError: true }`
 *    in the MCP tool response so the LLM can inform the user.
 *    Examples: contract text too short, Claude API returned unexpected
 *    response, analysis produced no clauses.
 *
 * 2. **Protocol errors** (`McpError` from `@modelcontextprotocol/sdk/types.js`)
 *    -- Infrastructure or protocol-level failures. Thrown as exceptions so
 *    the MCP framework surfaces them to the client.
 *    Examples: missing ANTHROPIC_API_KEY, invalid tool name, schema
 *    validation failures.
 */

/**
 * Build a domain-error MCP tool response.
 *
 * Returns an object with `isError: true` and a JSON-encoded error message
 * in the content array. The MCP client / LLM can read the error and decide
 * how to communicate it to the user.
 */
export function handleDomainError(message: string) {
  return {
    isError: true as const,
    content: [
      { type: "text" as const, text: JSON.stringify({ error: message }) },
    ],
  };
}
