# MVP Acceptance Checklist

Use this checklist before handing off or demoing the MVP.

## Automated Checks

Run from the repository root:

```bash
npm test
npm run lint
npm run build
```

Expected result: all commands pass without errors.

## Browser Smoke Test

1. Start the app with `npm run dev`.
2. Open the Vite local URL.
3. Confirm the empty pixel home says `还没有群友入住`.
4. Add a member named `北北`.
5. Confirm `北北` appears in the pixel home and member card list.
6. Click `设置北北为套卷中`.
7. Confirm the card shows `当前：套卷中`.
8. Type `第二套卷` in `状态备注`.
9. Select `1 小时` in `有效期`.
10. Click `设置北北为缩圈中`.
11. Confirm the card shows `当前：缩圈中`, `备注：第二套卷`, and an `有效期至：...` line.
12. Refresh the page.
13. Confirm the member, status, note, and expiration line are still visible.
14. Click `删除北北`.
15. Confirm the member remains visible and the button changes to `确认删除`.
16. Click `确认删除北北`.
17. Confirm the empty pixel home returns.
18. Refresh again and confirm the member stays deleted.

## Reset Home Check

1. Add a member named `南南`.
2. Set any status.
3. Click `重置家园`.
4. Confirm the member remains visible and the button changes to `确认重置`.
5. Click `确认重置家园`.
6. Confirm the empty pixel home returns.
7. Refresh and confirm the home remains empty.

## Expiration Fallback Check

Automated tests cover this path directly. Manual verification is optional until a time-control UI exists.

Expected rule:

- An expired status displays the fallback status, currently `失联中`.
- Old notes and old expiration text are not shown after fallback.

## Privacy And Data Check

Inspect the stored value for `qq-status-pixel-home:v1` in browser DevTools if needed.

Expected:

- Stored data contains virtual members, status keys, notes, timestamps, and settings.
- Stored data does not contain real QQ IDs, cookies, tokens, or scraped chat content.
- Data stays in browser `localStorage`.

## Known Limitations To Mention In Demos

- This is a manual local web MVP, not a QQ automation client.
- It does not monitor QQ.
- It does not sync across devices.
- It does not refresh expiration countdowns in real time.
- `今天结束前` is based on the browser's local timezone.
