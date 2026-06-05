# Release Checklist

Use this as a release gate before merging or shipping a status4fpb slice. It is not a roadmap or feature plan.

## Safety Boundaries

- [ ] No QQ private API.
- [ ] No QQ bot.
- [ ] No chat scraping.
- [ ] No unauthorized monitoring.
- [ ] No network requests for member or status data.
- [ ] No real QQ IDs, cookies, tokens, chat content, member secrets, credentials, or authorization data in storage or DOM.
- [ ] No cloud sync wording unless implemented, reviewed, and explicitly approved.
- [ ] No invite link copy that implies a real shared room or auto-join behavior.

## Local Home Acceptance

- [ ] Empty town explains local and manual-only behavior.
- [ ] Empty town does not look like a loading failure.
- [ ] Add member works.
- [ ] Status preset groups work.
- [ ] Status notes and expiration presets work.
- [ ] Status expiration fallback is understandable.
- [ ] Delete member copy is clearly local.
- [ ] Reset copy is clearly local and does not imply any effect on QQ.
- [ ] Corrupt stored data is handled conservatively.

## Shared Town Lab Acceptance

- [ ] Lab says local-only, no network, and refresh clears state.
- [ ] Demo room state stays local to the current page/session.
- [ ] Invite link checker only parses.
- [ ] Invite link checker rejects secret-like params.
- [ ] Invite link checker does not auto-join a member.
- [ ] Reset clears generated link, parsed link, error state, room state, members, and statuses.
- [ ] Copy does not promise real shared rooms, online rooms, cloud sync, or automatic group-member onboarding.

## Accessibility And Layout

- [ ] Keyboard focus is visible.
- [ ] Status controls are reachable by keyboard.
- [ ] Status buttons expose selected state.
- [ ] Destructive buttons have accessible names that include local scope.
- [ ] Reduced motion is respected.
- [ ] No horizontal overflow on common desktop widths.

## Documentation

- [ ] README says the MVP is local-first and manual-only.
- [ ] README says there is no QQ private API, QQ bot, chat scraping, upload, cloud sync, or real shared room.
- [ ] README lists current supported local paths.
- [ ] README lists unsupported high-risk capabilities.
- [ ] Visual-direction docs describe broad cozy pixel town mood inspiration without copying any specific game assets, UI chrome, characters, maps, palette signatures, or franchise-identifying details.
- [ ] Continuity notes identify the current release polish state and the next verification loop.
