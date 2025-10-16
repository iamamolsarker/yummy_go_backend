# User Profile Update API Documentation

## Endpoint
`PATCH /api/users/:email/profile`

## Description
Updates a user's profile information including name, phone number, and address details. This endpoint allows partial updates - you can send only the fields you want to update.

## HTTP Method
`PATCH`

## URL Parameters
- `email` (string, required): The user's email address

## Request Headers
```
Content-Type: application/json
```

## Request Body
All fields are optional. Send only the fields you want to update.

```json
{
  "name": "string (optional)",
  "phone": "string (optional)",
  "address": {
    "street": "string (optional)",
    "city": "string (optional)", 
    "area": "string (optional)",
    "postal_code": "string (optional)"
  }
}
```

### Field Descriptions
- **name**: User's full name (string, 2-100 characters)
- **phone**: User's phone number (string, valid phone format)
- **address**: User's address object
  - **street**: Street address
  - **city**: City name
  - **area**: Area/neighborhood name
  - **postal_code**: Postal/ZIP code

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "User profile updated successfully",
  "data": {
    "_id": "67159e30b9f5432dd83ae3da",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+8801234567890",
    "role": "user",
    "status": "active",
    "address": {
      "street": "123 Main Street",
      "city": "Dhaka",
      "area": "Dhanmondi",
      "postal_code": "1205"
    },
    "created_at": "2025-10-14T15:30:00.000Z",
    "updated_at": "2025-10-14T16:45:30.123Z"
  }
}
```

### Error Responses

#### User Not Found (404)
```json
{
  "success": false,
  "message": "User not found"
}
```

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error: Name must be between 2 and 100 characters"
}
```

#### Invalid Phone Format (400)
```json
{
  "success": false,
  "message": "Invalid phone number format"
}
```

#### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to update user profile",
  "error": "Error details..."
}
```

## Examples

### Update Only Name
```bash
curl -X PATCH https://yummy-go-server.vercel.app/api/users/john@example.com/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith"
  }'
```

### Update Phone and Address
```bash
curl -X PATCH https://yummy-go-server.vercel.app/api/users/john@example.com/profile \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+8801234567890",
    "address": {
      "street": "456 New Street",
      "city": "Dhaka",
      "area": "Gulshan",
      "postal_code": "1212"
    }
  }'
```

### Update All Fields
```bash
curl -X PATCH https://yummy-go-server.vercel.app/api/users/john@example.com/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Alexander Smith",
    "phone": "+8801987654321",
    "address": {
      "street": "789 Complete Address Street",
      "city": "Dhaka",
      "area": "Banani",
      "postal_code": "1213"
    }
  }'
```

### JavaScript/Frontend Example
```javascript
const updateUserProfile = async (email, profileData) => {
  try {
    const response = await fetch(`https://yummy-go-server.vercel.app/api/users/${email}/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Profile updated successfully:', result.data);
      return result.data;
    } else {
      console.error('Update failed:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Usage examples
await updateUserProfile('john@example.com', {
  name: 'John Smith'
});

await updateUserProfile('john@example.com', {
  phone: '+8801234567890',
  address: {
    street: '123 Main St',
    city: 'Dhaka',
    area: 'Dhanmondi',
    postal_code: '1205'
  }
});
```

## Validation Rules

### Name Validation
- **Required**: No (optional field)
- **Type**: String
- **Min Length**: 2 characters
- **Max Length**: 100 characters
- **Pattern**: Letters, spaces, hyphens, and apostrophes allowed

### Phone Validation
- **Required**: No (optional field)
- **Type**: String
- **Format**: Valid phone number (supports international formats)
- **Examples**: `+8801234567890`, `01234567890`, `+1-555-123-4567`

### Address Validation
- **Required**: No (optional field)
- **Type**: Object
- **Fields**: All subfields are optional
- Each address field has a maximum length of 255 characters

## Notes

1. **Partial Updates**: You can update only specific fields without affecting others
2. **Email Cannot Be Changed**: The email in the URL parameter is the identifier and cannot be updated
3. **Role and Status**: These fields cannot be updated through this endpoint (use dedicated endpoints)
4. **Timestamps**: `updated_at` is automatically set to current timestamp
5. **Data Persistence**: All updates are immediately saved to the database
6. **Response Format**: Always returns the complete updated user object

## Related Endpoints

- `GET /api/users/:email` - Get user by email
- `PATCH /api/users/:email/role` - Update user role
- `PATCH /api/users/:email/status` - Update user status
- `POST /api/users` - Create new user

## Security Considerations

- Validate user authentication before allowing profile updates
- Sanitize input data to prevent injection attacks
- Rate limit this endpoint to prevent abuse
- Log profile changes for audit purposes

## Production URL
`https://yummy-go-server.vercel.app/api/users/:email/profile`