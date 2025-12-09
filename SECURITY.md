# Security Policy

## Supported Versions

We actively support and provide security updates for the following versions:

| Version | Supported          | Security Status |
| ------- | ------------------ | --------------- |
| 0.1.12+ | :white_check_mark: | ✅ Patched (CVE-2025-66478) |
| 0.1.11  | :x:                | ⚠️  Vulnerable (CVE-2025-66478) |
| < 0.1.11 | :x:                | ⚠️  Vulnerable |

## Security Advisories

### CVE-2025-66478 (December 2025) - CRITICAL

**Status**: ✅ **PATCHED** in v0.1.12

**Impact**: Critical vulnerability (CVSS 10.0) in React Server Components allowing remote code execution.

**Affected Versions**: 
- Next.js 15.x
- Next.js 16.0.0 - 16.0.6
- Next.js 14.3.0-canary.77+

**Fixed Version**: 
- Next.js 16.0.7 (used in Nebula Chat v0.1.12+)

**Action Required**: 
- ✅ **Already fixed** in v0.1.12+
- If you're running an older version, upgrade immediately:
  ```bash
  npm install next@16.0.7
  ```

**References**:
- [Next.js Security Advisory](https://nextjs.org/blog/CVE-2025-66478)
- [React Security Advisory (CVE-2025-55182)](https://www.cve.org/CVERecord?id=CVE-2025-55182)

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email security details to: [Your security contact email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

We will respond within 48 hours and work with you to address the issue.

## Security Best Practices

- Always keep dependencies up to date
- Review security advisories regularly
- Use environment variables for sensitive data (never commit secrets)
- Rotate API keys and secrets regularly
- Monitor application logs for suspicious activity
- Use Docker for consistent, secure deployments

## Dependency Security

We regularly audit dependencies using:
- `npm audit` for vulnerability scanning
- Automated security updates via Dependabot (if enabled)
- Manual review of security advisories

## Environment Variables

Never commit sensitive environment variables to the repository. Use:
- `.env.local` for local development (already in `.gitignore`)
- Environment variable management in production (Docker secrets, cloud provider secrets, etc.)

## Additional Resources

- [Next.js Security Documentation](https://nextjs.org/docs/app/guides/environment-variables)
- [React Security Best Practices](https://react.dev/learn/escape-hatches)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

