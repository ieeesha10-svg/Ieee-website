API — Reference (starter template)

This document should list the backend API endpoints used by the frontend. Update it as routes are added.

Base URL (development): http://localhost:5000/api

Endpoint template

- `GET /api/example`
  - Description: returns example data
  - Query params: `?page=1`
  - Response: 200 OK, JSON

- `POST /api/auth/login`
  - Description: authenticate a user
  - Body: `{ email, password }`
  - Response: 200 OK `{ token }`

How to document new endpoints
1. Add route path and HTTP method
2. Add short description and required permissions
3. Specify request body, query params, and example responses

Consider generating OpenAPI/Swagger docs in future for automation.
