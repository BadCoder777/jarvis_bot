---
name: send-file-to-telegram
description: Send files/documents from the local computer to the user's Telegram chat. Use this skill whenever the user asks to receive a file, needs a document delivered, or when you generate/create a file that should be sent to them.
---

# Send File to Telegram

## Overview

This skill sends files from the local filesystem directly to the user's Telegram chat via a locally hosted server. Use it whenever a file needs to be delivered to the user — whether it's a generated document, converted file, or any other artifact.

## Preconditions

- The file-sending server must be running at `http://localhost:3002`
- The target file must exist on the local filesystem

## API

### Endpoint

```
POST http://localhost:3002/api/send-file
```

### Headers

```
Content-Type: application/json
```

### Body

```json
{
  "file_path": "/absolute/path/to/file"
}
```

| Parameter  | Type   | Required | Description                        |
|------------|--------|----------|------------------------------------|
| `file_path`| string | Yes      | Absolute path to the file to send  |

### Response

**Success (200):**
```json
{
  "success": true,
  "delivered": true
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "error": "description of the error"
}
```

## Workflow

1. **Locate or create the file** — ensure the file exists and you have the absolute path.
2. **Send the file** — execute a POST request via `curl`:

```bash
curl -X POST http://localhost:3002/api/send-file \
  -H "Content-Type: application/json" \
  -d '{"file_path": "/absolute/path/to/file"}'
```

3. **Verify delivery** — check the response for `"success": true`.
4. **Report to user** — confirm the file was sent, or describe any error.

## Example (bash)

```bash
curl -s -X POST http://localhost:3002/api/send-file \
  -H "Content-Type: application/json" \
  -d '{"file_path": "/home/badcoder/output/report.pdf"}' \
  | jq -e 'if .success then "File delivered successfully" else halt_error(1) end'
```

## Supported File Types

Any file type is supported: PDF, DOCX, XLSX, PPTX, images, archives, text files, etc. The server handles the Telegram upload natively.

## Troubleshooting

| Symptom                 | Likely cause                            | Fix                                      |
|-------------------------|-----------------------------------------|------------------------------------------|
| `Connection refused`    | Server not running on port 3002         | Start the file-sending server            |
| `404 Not Found`         | Wrong endpoint URL                      | Ensure path is `/api/send-file` (with hyphen) |
| `success: false`        | File not found or permission denied     | Verify absolute path and file permissions |

## Resources

No bundled scripts or assets required. This skill relies solely on the locally running file-sending server.
