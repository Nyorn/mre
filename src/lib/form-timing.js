/*
 * Form timing shared between the browser form and the server's spam check.
 *
 * THE BUG THIS EXISTS TO PREVENT (P2):
 * When the server answers 409 (`new_lead_required`), `stale_form` or
 * `missing_timing`, it tells the visitor to press «Отправить» again. The client
 * has to restart its timing window at that point — but naively setting it to
 * `Date.now()` means the very next press is under the minimum fill time, so the
 * server answers `too_fast` and the visitor is stuck in a loop, having done
 * exactly what the message told them to do.
 *
 * The minimum fill time exists to show a human spent time on the form. That was
 * already demonstrated on the first submission; an instructed retry should not
 * have to prove it a second time. So the restarted window is backdated past the
 * minimum rather than reset to now — the timestamp still describes a form a
 * person really did fill, and the staleness ceiling still applies from here.
 */

/** Must stay above the server's MIN_FILL_MS (3000) with room for clock jitter. */
export const RETRY_BACKDATE_MS = 8000;

/**
 * Timing mark to use when restarting the window after an instructed retry.
 * Backdated so an immediate press is not mistaken for a bot.
 */
export function retryStartedAt(now = Date.now()) {
	return now - RETRY_BACKDATE_MS;
}

/** Timing mark for a genuinely fresh form (first render, or after a real send). */
export function freshStartedAt(now = Date.now()) {
	return now;
}
