# Committee Requests API

## Base URL
`/api/committee-requests`

## Authentication
All routes require authentication via JWT cookie (`protect` middleware).
Admin routes (GET all, UPDATE status) additionally require `xcom` or `board` role.

---

## 1. Create Committee Request
**POST** `/api/committee-requests/`

### Description
Allows any authenticated user to submit a request to join a specific committee. The request is created with `pending` status.

### Authorization
- Any authenticated user (`protect` middleware)

### Request Body
```json
{
  "committee_position": "Technical"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Committee request submitted successfully",
  "data": {
    "_id": "64f...",
    "userId": "64f...",
    "committee_position": "Technical",
    "request_status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Errors
- `400` - Committee position is required
- `400` - User already has a pending request for this position
- `401` - Not authorized (no token/invalid token)
- `404` - User not found

---

## 2. Update Request Status
**PUT** `/api/committee-requests/:requestId/status`

### Description
Allows admins (xcom/board) to approve or reject a pending committee request.

### Authorization
- Requires `xcom` or `board` role

### Path Parameters
- `requestId` - MongoDB ObjectId of the pending request

### Request Body
```json
{
  "status": "approved"
}
```
Valid values: `approved`, `rejected`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Request approved successfully",
  "data": {
    "_id": "64f...",
    "userId": {
      "_id": "64f...",
      "name": "John Doe",
      "email": "john@example.com",
      "committee": "Technical",
      "position": "member",
      "yearOfStudy": 3,
      "university": "MIT",
      "college": "Computer Science"
    },
    "committee_position": "Technical",
    "request_status": "approved",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### Errors
- `400` - Status must be either approved or rejected
- `400` - Request has already been processed
- `403` - Forbidden (not xcom/board)
- `404` - Request not found

---

## 3. Get All Requests
**GET** `/api/committee-requests/`

### Description
Retrieves all committee requests with filtering and pagination. Only accessible by admins (xcom/board).

### Authorization
- Requires `xcom` or `board` role

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | Filter by status: `pending`, `approved`, `rejected` |
| `committee_position` | string | - | Filter by committee position (e.g., "Technical", "HR", "PR") |
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Items per page |

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f...",
      "userId": {
        "_id": "64f...",
        "name": "John Doe",
        "email": "john@example.com",
        "committee": "Technical",
        "position": "member",
        "yearOfStudy": 3,
        "university": "MIT",
        "college": "Computer Science"
      },
      "committee_position": "Technical",
      "request_status": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "totalItems": 25,
    "totalPages": 3,
    "currentPage": 1,
    "itemsPerPage": 10
  }
}
```

### Errors
- `403` - Forbidden (not xcom/board)

---

## Model: PendingRequest

```javascript
{
  userId: { type: ObjectId, ref: 'User', required: true },
  committee_position: { type: String, required: true },
  request_status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  timestamps: true
}
```

---

## Example Usage (Frontend)

### Submit a Request
```javascript
const submitRequest = async (committeePosition) => {
  const response = await fetch('/api/committee-requests/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ committee_position: committeePosition })
  });
  return response.json();
};
```

### Approve/Reject Request (Admin)
```javascript
const updateRequest = async (requestId, status) => {
  const response = await fetch(`/api/committee-requests/${requestId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status })
  });
  return response.json();
};
```

### Get All Requests (Admin)
```javascript
const getRequests = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/committee-requests/?${params}`, {
    credentials: 'include'
  });
  return response.json();
};
```