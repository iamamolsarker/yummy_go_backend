# Bulk Activate Pending Users

## Problem
Existing users in the database have status `'pending'` and cannot access cart endpoints (403 Forbidden).

## Solution
Use the bulk activation endpoint to activate all pending users with role `'user'`.

---

## Option 1: Using Browser Console (Easiest) ⭐

1. **Login as Admin** at your frontend app
   - Email: `saddamhosen1433@gmail.com`

2. **Open Browser DevTools** (F12)

3. **Get Firebase Token** - Run in Console:
   ```javascript
   await firebase.auth().currentUser.getIdToken()
   ```
   Copy the token that appears.

4. **Call Activation Endpoint** - Run in Console:
   ```javascript
   fetch('https://yummy-go-server.vercel.app/api/users/bulk-activate', {
     method: 'POST',
     headers: {
       'Authorization': 'Bearer YOUR_TOKEN_HERE',
       'Content-Type': 'application/json'
     }
   })
   .then(res => res.json())
   .then(data => console.log('✅ Result:', data))
   .catch(err => console.error('❌ Error:', err));
   ```
   Replace `YOUR_TOKEN_HERE` with the token from step 3.

5. **Check Result**
   - You should see: `"X pending users with role 'user' have been activated"`

---

## Option 2: Using PowerShell

```powershell
# 1. Get admin token (from browser console as above)
$token = "YOUR_ADMIN_FIREBASE_TOKEN"

# 2. Call API
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://yummy-go-server.vercel.app/api/users/bulk-activate" `
    -Method POST `
    -Headers $headers
```

---

## Option 3: Using Node.js Script

Run the included script:
```bash
node activateUsers.js
```
(First edit the script and add your admin token)

---

## Verification

After activation, check a user's status:

**Browser Console:**
```javascript
fetch('https://yummy-go-server.vercel.app/api/users/hosen1433@gmail.com/status')
  .then(res => res.json())
  .then(data => console.log('User status:', data));
```

Expected response:
```json
{
  "success": true,
  "data": {
    "email": "hosen1433@gmail.com",
    "status": "active"
  },
  "message": "User status retrieved successfully"
}
```

---

## API Endpoint Details

**Endpoint:** `POST /api/users/bulk-activate`

**Authentication:** Requires admin JWT token

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": true,
    "modifiedCount": 5,
    "message": "5 pending users with role 'user' have been activated"
  },
  "message": "Bulk activation completed successfully"
}
```

**What it does:**
- Finds all users with `role: 'user'` AND `status: 'pending'`
- Updates their status to `'active'`
- Does NOT affect restaurant owners, riders, or admins (they need manual approval)

---

## Future Prevention

New users created after this fix will automatically get `'active'` status:
- ✅ Regular users (`role: 'user'`) → `status: 'active'` (automatic)
- ⏳ Restaurant owners (`role: 'restaurant_owner'`) → `status: 'pending'` (needs approval)
- ⏳ Riders (`role: 'rider'`) → `status: 'pending'` (needs approval)
- ⏳ Admins (`role: 'admin'`) → `status: 'pending'` (needs approval)
