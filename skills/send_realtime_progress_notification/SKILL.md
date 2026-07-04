---
name: send_realtime_progress_notification
description: MANDATORY FIRST STEP. You MUST call this tool IMMEDIATELY as the very first action if the user's task requires executing other tools (like bash, database queries, or long-running scripts). Use it to instantly report that you are starting execution. NEVER use this tool for the final answer or for trivial text-only tasks.
---

# Real-Time User Messaging

## Strict Execution Rules

1. BEFORE triggering any other tool (e.g., executing code or searching files), you MUST call `send_realtime_progress_notification` to confirm task receipt and state your immediate next action.
2. If a task contains multiple sequential tool calls, you MUST call `send_realtime_progress_notification` between those tool calls to report intermediate progress milestones.
3. This tool is a system webhook. It does not replace your final text response.

## Overview

This skill enables sending instant text messages to the user while executing tasks. Unlike the normal response flow (which returns only after task completion), this tool delivers messages in real-time, allowing the agent to keep the user informed during long-running operations.

## Endpoint

```bash
curl -X POST http://localhost:3002/api/send-message \
  -H "Content-Type: application/json" \
  -d '{"message": "Your message here"}'

```

**Response:**

```json
{"success": true, "delivered": true}

```

## When to Use

### 1. Confirm Task Receipt

When the user sends a request that will take significant time, immediately confirm you received it.

**Examples:**

* "Task accepted, sir. Working on it, this will take a few minutes."
* "Received, sir. Starting to process your request."
* "Task accepted. I need some time for this — I will report the results."

### 2. Report Progress / Status Updates

Keep the user informed about where you are in the task. Do not spam — only report meaningful milestones.

**Examples:**

* "Sir, currently searching for information in arXiv. Discovered issue X — switching to Wikipedia."
* "50% complete. Already processed the first 3 files out of 7."
* "Sir, encountered an API error. Trying an alternative method."

### 3. Explain Delays or Issues

If something unexpected happens, explain it briefly so the user is not left wondering.

**Examples:**

* "Sir, the source is temporarily unavailable. I will wait 30 seconds and try again."
* "Failed to access the database. Using local cache."

**Examples:**

* "Sir, found unexpectedly a lot of material on the topic. Filtering and will keep only the relevant part."
* "Notification: your file contains potentially dangerous links. Checking before processing."
* "Sir, noticed that there is logic duplication in the code. I can refactor it in parallel — let me know if I should."

## Quick Test

```bash
curl -X POST http://localhost:3002/api/send-message \
  -H "Content-Type: application/json" \
  -d '{"message": "Connection established, sir."}'

```
