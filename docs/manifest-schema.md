# Manifest Schema

Botstack manifests are versioned JSON documents. The current schema version is
`1`.

Required top-level fields:

- `schema_version`: must be `1`
- `id`: stable tool id
- `name`: display name
- `summary`: one-line purpose
- `category`: grouping label
- `stacks`: `base`, `everything`, or both
- `harnesses`: supported harness ids
- `install`: ordered install operations
- `verify`: ordered verification operations

Supported operation types:

- `mkdir`
- `command`
- `append_managed_block`
- `toml.merge`
- `json.merge`

Operation fields:

- `id`: stable operation id within the plugin
- `type`: supported operation type
- `description`: user-visible explanation
- `target`: target path for filesystem/config operations
- `value`: merge value or managed block body
- `command`: shell command for command operations
- `timeout_ms`: optional timeout override
- `harnesses`: optional list of harness ids this operation applies to

Templates supported in string fields:

- `${home}`
- `${botstackDir}`
- `${cacheDir}`
- `${toolsDir}`
- `${stateDir}`
- `${gstackInstallDir}`
- `${gbrainInstallDir}`
- `${harnesses}`
