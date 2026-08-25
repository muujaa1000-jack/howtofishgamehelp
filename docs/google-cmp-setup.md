# Google-certified CMP Setup

Status on 2026-08-25: **not configured and not published**. This repository does not imitate a Google CMP with a generic cookie banner and does not display a non-working consent-withdrawal link.

## Owner action after AdSense account access

In AdSense, open:

```text
Privacy & messaging
→ European regulations
→ Create message
```

Use a Google-certified consent management platform and provide three clear choices where applicable:

```text
Consent
Do not consent
Manage options
```

Do not publish site copy claiming that a certified CMP is active until the message is actually published and its behavior has been checked on the live apex domain.

## Required checks

Test the published message for visitors in:

- the European Economic Area;
- the United Kingdom;
- Switzerland.

For each applicable region, verify:

- Consent allows only the configured purposes and vendors.
- Do not consent prevents advertising storage and non-essential advertising tags. If the site continues to use advanced Consent Mode, GA4 may still send cookieless pings while analytics storage remains denied.
- Manage options accurately changes individual choices.
- A visitor can later withdraw or change consent.
- Google advertising Consent Mode receives the expected state.
- GA4 receives the expected consent default before the Google tag loads, and denied-choice measurement requests retain the denied state.
- Reloading and revisiting preserve or re-request choices according to the configured policy.
- The core guides remain readable without an account, purchase, newsletter subscription, or ad click.

## Footer link gate

Add `Privacy and cookie settings` to the footer only after the certified CMP exposes a working reopen/settings action on production. Until then, omitting the link is more accurate than displaying a dead control.
