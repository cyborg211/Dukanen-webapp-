# Security policy

## Supported version

Security fixes are applied to the latest code on the `main` branch.

## Reporting a vulnerability

Please do not publish credentials, personal data, exploit details, or an unpatched vulnerability in a public issue.

Use GitHub private vulnerability reporting for this repository when it is available. If it is unavailable, contact the repository owner through their GitHub profile and request a private reporting channel.

Include:

- A short description of the issue
- The affected route, component, or configuration
- Safe reproduction steps
- The likely impact
- A suggested fix, if known

## Secrets

Never commit Supabase service-role keys, passwords, access tokens, private customer data, or production environment files.

If a credential is exposed, revoke or rotate it immediately and treat removal from the current file as insufficient until the repository history and connected services have been reviewed.
