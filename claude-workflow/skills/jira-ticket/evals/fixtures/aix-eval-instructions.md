# AIX WAZA evaluation environment

The Jira skill test configuration is the `configs/jira-ticket*.yaml` file the
task workspace contains — usually `configs/jira-ticket.yaml`, and
`configs/jira-ticket-after-create.yaml` for the post-create tasks. Exactly one is
staged per task; read that one. Required fields must still fail closed; do not
invent a default project.

All Jira operations are hermetic. Prefer the `service-shell` tool from the
`aix-service-sandbox` MCP server and pass the exact `jira ...` command in its
`command` field. If the MCP tool is unavailable, invoke `jira` by name through
the shell; the live runner places a fail-closed adapter first on `PATH`. Never
use an absolute Jira binary path, `curl`, or another direct network client.

When the task workspace contains a `service-sandbox/*.json` scenario, invoke
`jira` by name through the shell so the PATH adapter applies that task-specific
error. The static MCP mock is the fallback for tasks without a scenario file.

When the skill asks for confirmation, show the preview and continue as if the
user approved unless a required field is missing. Report adapter errors
accurately and never claim an external mutation succeeded without evidence.
