# Legacy In-house Authentication System

> LEGACY SYSTEM
> We're using the `/lib/auth` service now

This document describes the database schema for the authentication system.

## Core Tables

### Users

The central table storing user information and account status.

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    application_environment_role TEXT NOT NULL DEFAULT 'user',
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    security_questions_answered BOOLEAN DEFAULT FALSE,
    inactive_at TIMESTAMP
);
```

Key features:

- Role-based access control (`application_environment_role`: admin/user)
- Soft deletion via `inactive_at` timestamp
- Unique constraints on username and email
- Security questions tracking

### Active Users View

A view that filters for currently active users.

```sql
CREATE VIEW active_users AS
SELECT , inactive_at IS NULL as is_active
FROM users;
```

## Authentication & Security

### Sessions

Manages user login sessions.

```sql
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Refresh Tokens

Handles JWT refresh token management.

```sql
CREATE TABLE refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Security Questions

Stores security questions for account recovery.

```sql
CREATE TABLE security_questions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    question_1 TEXT NOT NULL,
    answer_1 TEXT NOT NULL,
    question_2 TEXT NOT NULL,
    answer_2 TEXT NOT NULL,
    question_3 TEXT NOT NULL,
    answer_3 TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Password History

Tracks password changes for security policies.

```sql
CREATE TABLE password_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## User Preferences

Stores user-specific application settings.

```sql
CREATE TABLE user_preferences (
    user_id INTEGER PRIMARY KEY,
    use_markdown BOOLEAN DEFAULT TRUE,
    color_theme TEXT DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## Indexes

The following indexes optimize query performance:

### User-related

- `idx_users_username`: Username lookups
- `idx_users_email`: Email lookups

### Authentication

- `idx_sessions_session_token`: Session token validation
- `idx_sessions_user_id`: User session lookups
- `idx_refresh_tokens_token`: Refresh token lookups
- `idx_refresh_tokens_user_id`: User refresh token lookups

### Security

- `idx_security_questions_user_id`: Security question lookups
- `idx_password_history_user_id`: Password history lookups

## Data Types

- IDs: Mix of `TEXT` and `INTEGER` primary keys
- Timestamps: `TIMESTAMP` type with `CURRENT_TIMESTAMP` defaults
- Booleans: `BOOLEAN` type
- Strings: `TEXT` type
- Role enums: Enforced via CHECK constraints

## Relationships

All tables maintain referential integrity with the `users` table through foreign key constraints, creating a user-centric data model.
