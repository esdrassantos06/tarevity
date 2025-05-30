# Changelog

All notable changes to the Tarevity project will be documented in this file.

## [1.1.3] - 2025-05-27

### Added

- Ping utils and Route for Supabase

## [1.1.2] - 2025-04-05

### Added

- Enhance calendar and todo components with new date picker and UI improvements
- Integrated a new DatePickerWithClear component in NewTodoPage and TodoEditPage for better date selection and clearing functionality.

### Changed

- Updated Calendar component to improve UI with card layout and enhanced event display.

### Fixed

- Refactored CalendarEvent component for better styling and responsiveness.
- Added new localized messages for date selection guidance in both English and Portuguese.

### Security

- Cleaned up code by removing unnecessary comments and improving overall readability.

### Removed

-

## [1.1.1] - 2025-03-30

### Added

-

### Changed

- Optimized parts of the code to improve performance
- Replaced country icons with SVG for better Windows compatibility

### Fixed

- Fixed an error in OAuth authentication with Google and GitHub using next-auth
- Fixed a bug where users weren't redirected to the login page when attempting to access the dashboard without being logged in
- Resolved a bug where opening the dropdown showed an unwanted margin-right

### Security

- Added caching to significant portions of the authentication and notifications code

### Removed

-

## [1.1.0] - 2025-03-30

### Added

- Integrated shadcn/ui dropdown in header and NotificationsDropdown component
- Added caching system for profile images using refs and React Query
- Implemented tooltips instead of title in calendar

### Changed

- Replaced custom dropdown with shadcn/ui component for better consistency and accessibility
- Optimized UserImage component to prevent unnecessary requests between page changes
- Improved React Query cache management for profile data

### Fixed

- Fixed issue with multiple profile image requests on each navigation
- Resolved profile image flickering during route changes
- Improved image data persistence between UserImage component renders

### Security

- Enhanced validation and error handling for unavailable profile images

### Removed

- Removed custom dropdown in favor of shadcn/ui component
- Eliminated use of Date.now() as cache key which forced unnecessary reloads

## [1.0.9] - 2025-03-28

### Added

- Implemented internationalization (i18n) system for multilingual support
- Complete calendar translation including weekdays and navigation controls

### Changed

- Modified date display to respect language-specific conventions

### Fixed

- Corrected capitalization of month names in Portuguese to start with uppercase letter
- Adjusted date formatting to follow regional patterns

### Security

-

### Removed

-

## [1.0.8] - 2025-03-27

### Added

- ...

### Changed

- Update size classes across components

### Fixed

- ...

### Security

- ...

### Removed

- w- h- and added size-

## [1.0.6] - 2025-03-27

### Added

- Implemented back/forward cache support to improve navigation
- Optimized component loading to reduce layout shifts

### Changed

- Modified HTTP headers to allow proper bfcache functionality
- Adjusted Next.js cache configuration to balance performance and security

### Fixed

- Resolved issue preventing back/forward cache usage on dashboard pages
- Fixed significant layout shift (CLS 0.557) in task listing component

### Security

- Maintained all existing security policies (X-Content-Type-Options, X-Frame-Options, etc.)
- Preserved cache configuration for sensitive APIs

### Removed

- Eliminated global "no-store" header that was negatively impacting navigation performance

## [1.0.5] - 2025-03-27

### Added

-Reinstalled the `cookie` package to fix TypeScript type error.

### Changes

-

### Fixed

-Type error in the `cookie` module fixed by reinstalling the dependency.

### Security

-

### Removed

-

## [1.0.4] - 2025-03-27

### Added

-Updated next to version 15.2.4
-Updated @types/node to version 22.13.14

### Changed

- Allowed future updates by adding ^ to next, eslint-config-next, and @types/node in package.json

### Fixed

- Resolved an issue where npm update was not updating dependencies due to fixed versions in package.json

### Security

- Updated dependencies to the latest versions to address potential security vulnerabilities

### Removed

-

## [1.0.3] - 2025-03-27

### Added

-...

### Changed

- Updated outdated dependencies

### Fixed

-

### Security

- Nextjs updated because had a security breach

### Removed

-

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
