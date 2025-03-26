# Changelog

All notable changes to the Tarevity project will be documented in this file.
## [1.0.2] - 2025-03-26

### Added
- Integrate todos into calendar and enhance todo list with date filtering 

### Changed
- useTodoFilters, calendar and TodoList for implementation

### Fixed
- Bugs with date filtering, clicking on day 31 in the calendar would redirect to day 30 due to timezone issues

### Security
- ...

### Removed
- ...



## [1.0.1] - 2025-03-22

### Added

- Changelog and tag versions

## [1.0.0] - 2025-03-22

### Added

- Initial release of Tarevity task management application
- Complete task management functionality with create, edit, and complete actions
- Priority levels (Low, Medium, High) with visual indicators
- Status workflow (Active, Review, Completed) for organized task progression
- Due date management with automated reminders
- Sorting and filtering capabilities
- Visual indicators for task priority and status
- Enterprise-grade security features:
  - Password security with Have I Been Pwned API integration
  - JWT token rotation
  - Progressive lockout after failed login attempts
  - Secure authentication with GitHub and Google OAuth
  - Content Security Policy implementation
  - Rate limiting on sensitive endpoints
- Analytics dashboard with task statistics
- Smart notifications with automatic reminders based on due dates
- Responsive design supporting all screen sizes
- Light and dark mode with system preference detection
- User management features
- Email notifications for password resets
- Account management features including profile editing and deletion

### Security

- Implemented CSRF protection for all state-changing operations
- Added strict CSP headers to prevent XSS attacks
- HttpOnly cookies for secure session management
- Input validation using Zod schema validation
- API protection with request validation middleware
- Rate limiting on auth endpoints to prevent brute force attacks
