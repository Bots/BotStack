# Verification

Every Botstack plugin must define verification operations.

Verification commands should prove the installed tool is available without
requiring network access when possible.

Current built-in checks:

- GStack: check whether `omx` is available.
- Serena MCP: check whether `serena` is available.
- GBrain: check whether `gbrain` is available.
- Graphify: check whether `graphify` is available.

Rules:

- Verification steps default to a 30 second timeout.
- Failed verification is recorded in the install ledger.
- The final report must show which tool failed and what the user should check.
