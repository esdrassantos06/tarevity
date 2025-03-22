# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Tarevity seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do not disclose the vulnerability publicly**
2. **Email us at [esdrasirion1@gmail.com](mailto:esdrasirion1@gmail.com) with details about the issue**
3. Include the following in your report:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Any suggested fixes if available

## What to expect

- We'll acknowledge receipt of your vulnerability report within 48 hours
- We'll provide a timeline for addressing the vulnerability
- We'll keep you informed about our progress
- Once the vulnerability is fixed, we'll credit you (if desired) for the discovery

## Security Features

Tarevity implements several security measures:

- **Password Security**: Integration with Have I Been Pwned API to detect compromised passwords
- **JWT Token Rotation** for enhanced protection
- **Progressive Lockout** after multiple failed login attempts
- **Secure Authentication** with GitHub and Google OAuth options
- **Content Security Policy** implementation to prevent XSS attacks
- **Rate Limiting** on sensitive endpoints to prevent brute force attacks
- **HttpOnly Cookies** for secure session management
- **CSRF Protection** for all state-changing operations
- **Input Validation** using Zod schema validation

## Security Best Practices for Users

- Use a strong, unique password
- Enable OAuth authentication when possible
- Keep your system and browser updated
- Be cautious about accessing your account on public or shared computers
- Log out when you're done using the application

Thank you for helping keep Tarevity secure!
