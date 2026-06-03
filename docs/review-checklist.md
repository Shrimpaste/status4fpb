# Review Checklist

Use this checklist after every implementation round before asking the ChatGPT web thread for复审.

## Code

- Are changed files focused on one responsibility?
- Is there any unnecessary abstraction or speculative extension?
- Are type names and status keys consistent across tests and implementation?
- Are error states handled without crashing the app?

## Privacy And Safety

- Does the change avoid QQ private APIs and unauthorized monitoring?
- Does it avoid collecting real QQ IDs by default?
- Does it keep MVP data local?
- Is any imported/exported data explicitly user-provided?

## UI

- Is the first screen the usable status home, not a landing page?
- Do important controls have accessible names?
- Does text fit on narrow and wide viewports?
- Are pixel visuals purposeful rather than decorative clutter?

## Tests And Verification

- Did tests fail for the expected reason before implementation?
- Do `npm test`, `npm run lint`, and `npm run build` pass after the change?
- Was the app opened in a browser for visual verification after UI changes?
- Were self-review notes sent to the ChatGPT web thread for复审?
