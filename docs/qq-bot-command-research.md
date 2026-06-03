# QQ Bot Command Integration Research

## Status

Draft / Research only

## Purpose

Assess whether official QQ Bot capabilities can be used as an explicit status command input for status4fpb.

This document does not implement a bot, webhook, backend service, sync service, room system, account system, or QQ integration.

## Official Sources Checked

Checked on 2026-06-03:

- QQ Bot startup and credentials: <https://bot.q.qq.com/wiki/develop/api-v2/>
- QQ Bot API authentication: <https://bot.q.qq.com/wiki/develop/api-v2/dev-prepare/interface-framework/api-use.html>
- QQ Bot event subscription and intents: <https://bot.q.qq.com/wiki/develop/api-v2/dev-prepare/interface-framework/event-emit.html>
- QQ Bot message events: <https://bot.q.qq.com/wiki/develop/api-v2/server-inter/message/send-receive/event.html>
- QQ Bot sending messages: <https://bot.q.qq.com/wiki/develop/api-v2/server-inter/message/send-receive/send.html>
- QQ Bot group management events: <https://bot.q.qq.com/wiki/develop/api-v2/server-inter/group/manage/event.html>
- QQ Bot unique identity mechanism: <https://bot.q.qq.com/wiki/develop/api-v2/dev-prepare/unique-id.html>

No third-party source is treated as authoritative in this research. Final product decisions should continue to use the official QQ Bot documentation as the source of truth.

## Findings

### Setup And Authentication

- A QQ Bot can be added to one-on-one chat, group chat, and channel contexts.
- Creating a bot provides `AppID` and `AppSecret`.
- OpenAPI calls use `AccessToken` authentication.
- The token is requested from `https://bots.qq.com/app/getAppAccessToken`.
- OpenAPI requests use the `Authorization: QQBot {ACCESS_TOKEN}` header.

### Event Transport

QQ Bot events can be received through:

- Webhook.
- WebSocket.

Webhook notes:

- The developer configures a callback URL in the management console.
- The callback URL must use HTTPS.
- The documented allowed callback ports are `80`, `443`, `8080`, and `8443`.
- Callback verification and signature validation are required.

WebSocket notes:

- The client gets a gateway URL, identifies with token and intents, sends heartbeats, and can resume sessions.
- Event subscription uses bitwise `intents`.
- Some intents require permission; unsupported intents can fail connection.

### Group Message Event Boundary

For group message content, the official message event documented for QQ groups is:

```text
GROUP_AT_MESSAGE_CREATE
```

The documented trigger is when a user sends a message in a group while mentioning the bot. Based on the official pages checked, this should not be treated as a full group chat stream.

The event subscription page lists group and C2C events under `GROUP_AND_C2C_EVENT (1 << 25)`, including:

- `C2C_MESSAGE_CREATE`
- `GROUP_AT_MESSAGE_CREATE`
- `GROUP_ADD_ROBOT`
- `GROUP_DEL_ROBOT`
- `GROUP_MSG_REJECT`
- `GROUP_MSG_RECEIVE`

The current official pages checked do not document an ordinary QQ group "all messages" event for reading every group message. status4fpb must not design around full group monitoring.

### Group @ Message Fields

The `GROUP_AT_MESSAGE_CREATE` event includes:

- `id`: platform message ID, usable for passive reply.
- `author`: sender object.
- `author.member_openid`: user's `member_openid` in the group.
- `content`: message content.
- `timestamp`: message creation time.
- `group_openid`: group openid.
- `attachments`: optional media attachments.

The event does not expose a real QQ number in the documented fields.

### Unique Identity

Official identity behavior:

- Different bots receive different user, group, and channel openids.
- A group has a `group_openid`.
- The same user in different groups has different `member_openid` values for the same bot.

For status4fpb, this means:

- `group_openid` can identify a group only within this bot's scope.
- `member_openid` can identify a member only within one group and bot scope.
- Real QQ IDs should not be stored or expected.
- A user-facing display name or nickname command is still needed.

### Group Management Events

The group management event page documents events including:

- `GROUP_ADD_ROBOT`: bot is added to a group.
- `GROUP_DEL_ROBOT`: bot is removed from a group.
- `GROUP_MSG_REJECT`: group admin disables active bot messages.
- `GROUP_MSG_RECEIVE`: group admin enables active bot messages.

These events can help a future service know whether the bot is present or whether active messages are allowed, but they do not replace explicit user status commands.

### Reply Capability

The group send-message endpoint is:

```text
POST /v2/groups/{group_openid}/messages
```

Key fields include:

- `content`: text message content.
- `msg_type`: message type.
- `event_id`: previous event ID for passive messages in supported events.
- `msg_id`: previous user message ID for passive reply.
- `msg_seq`: reply sequence used with `msg_id` to avoid duplicate replies.

Official frequency notes include:

- Group active messages are limited.
- Group passive reply is time-limited.
- The docs describe group passive replies as valid for 5 minutes, with each message replyable up to 5 times.

status4fpb should prefer short passive replies to explicit status commands and should not rely on active group pushes for core behavior.

## Product Decision

QQ Bot may be considered only as an explicit command input for status4fpb.

Acceptable future direction:

- A user mentions the bot and sends a command.
- The bot parses that command.
- The bot updates a status record for that `group_openid` and `member_openid`.
- The bot optionally sends a short passive confirmation.

Unacceptable direction:

- Monitoring all group messages.
- Reading ordinary group chat context.
- Inferring status from user behavior.
- Exporting or analyzing QQ chat logs.
- Using QQ private APIs.
- Simulating or hooking QQ clients.
- Reading local QQ databases.
- Integrating ChatLab or qq-chat-exporter as a data source.

## Proposed Commands

These command sketches are for future product discussion only:

```text
@状态小镇 /status 套卷中 1h 第二套卷
@状态小镇 /status 缩圈中 30m 有机重点
@状态小镇 /nick 北北
@状态小镇 /town
@状态小镇 /clear
@状态小镇 /help
```

Command meanings:

- `/status`: set the sender's status, optional duration, optional note.
- `/nick`: set the sender's display name for this group town.
- `/town`: show a summary or link for the current group town.
- `/clear`: clear the sender's current status.
- `/help`: show supported commands.

## Data Model Sketch

Future bot-backed status records may need:

- `groupOpenId`
- `memberOpenId`
- `roomId`
- `memberId`
- `displayName`
- `statusKey`
- `note`
- `expiresAt`
- `source: "qq_bot_command"`
- `sourceMessageId`
- `updatedAt`

Do not store:

- Real QQ ID.
- Raw chat logs.
- Cookies.
- Tokens.
- Credentials.
- Ordinary group message context.

## Command Source Model

Future status records should distinguish how a status was set. A possible source model is:

```ts
type StatusSource =
  | "desktop_manual"
  | "web_manual"
  | "qq_bot_command"
  | "timer_rule";
```

`qq_bot_command` means the user explicitly mentioned the QQ Bot in a group and sent a supported status command. It does not mean automatic detection, group chat analysis, ordinary message monitoring, or chat log import.

## Privacy And Safety Boundaries

- No real QQ ID storage.
- No raw chat log storage.
- No group monitoring.
- No automatic inference from ordinary messages.
- No QQ private API.
- No QQ client scraping.
- No local QQ database reads.
- No chat export import.
- No status inference from speaking frequency, keywords, or social behavior.

## Architecture Implications

A future QQ Bot integration would require a backend service because official bot events need webhook or WebSocket handling and OpenAPI authentication.

Likely future components:

- Bot event receiver.
- Command parser.
- Status write API.
- Group/member mapping by openid.
- Passive reply sender.
- Deduplication by `msg_id` and `msg_seq`.

This should remain separate from the current local Web/Tauri MVP until a backend and consent model are designed.

## Non-Goals For This Research Round

- No QQ Bot registration.
- No webhook implementation.
- No backend service.
- No sync service.
- No room system.
- No account system.
- No app code changes.
- No Tauri config changes.
- No ChatLab integration.
- No qq-chat-exporter integration.

## Open Questions

- What approval, review, or permission process applies before a bot can join ordinary QQ groups in production?
- What are the current rate limits and abuse-prevention rules for group passive replies?
- Are `group_openid` and `member_openid` stable enough for long-lived status mapping under all expected bot lifecycle changes?
- What hosting requirements and cost would a reliable webhook or WebSocket receiver have?
- Should status4fpb expose a public group town page, or keep bot-backed status data local to a private service?
- What user consent text is needed before mapping a `member_openid` to a display name?
