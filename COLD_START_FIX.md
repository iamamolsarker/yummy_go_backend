# Yummy Go Backend - Cold Start Fix Documentation

## Problem Solved
Fixed the 404 errors and cold start issues in Vercel serverless deployment where the first API call would fail and subsequent calls would work.

## Solutions Implemented

### 1. Optimized Database Connection
- **Connection Pooling**: Reuses existing database connections
- **Connection State Management**: Prevents multiple simultaneous connection attempts
- **Automatic Retry**: Handles temporary connection failures
- **Warm-up Queries**: Pre-loads collections on connection

### 2. Health Check & Warmup Endpoints
- **Health Check**: `GET /api/health` - Verifies server and database status
- **Warmup**: `GET /api/warmup` - Pre-loads all critical collections
- **Fast Response**: Both endpoints respond quickly and warm up the serverless function

### 3. Serverless-Optimized Code
- **Lazy Loading**: Database connects only when needed
- **Connection Reuse**: Maintains connection across function invocations
- **Error Handling**: Graceful handling of connection failures
- **Memory Optimization**: Efficient resource management

### 4. Vercel Configuration
- **Route Prioritization**: Health/warmup routes get priority
- **Function Settings**: Optimized memory and timeout settings
- **Lambda Size**: Increased max size for better performance

## API Endpoints

### Health Check
```bash
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "message": "Server and database are running",
  "timestamp": "2025-10-14T14:45:07.721Z",
  "uptime": 47.2325124,
  "connected": true
}
```

### Warmup
```bash
GET /api/warmup
```
**Response:**
```json
{
  "status": "success",
  "message": "Server warmed up successfully",
  "timestamp": "2025-10-14T14:46:10.830Z",
  "collections": [
    {"collection": "users", "status": "warmed"},
    {"collection": "restaurants", "status": "warmed"},
    {"collection": "orders", "status": "warmed"},
    {"collection": "menus", "status": "warmed"},
    {"collection": "carts", "status": "warmed"}
  ],
  "uptime": 110.5325124
}
```

## Deployment Steps

### 1. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. Environment Variables
Make sure these are set in Vercel dashboard:
- `MONGODB_URI`
- `NODE_ENV=production`
- Any other required environment variables

### 3. Test Deployment
```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test warmup endpoint  
curl https://your-app.vercel.app/api/warmup
```

## Frontend Integration

### Using the API Utility (Recommended)
Copy `utils/apiUtils.js` to your frontend project and use:

```javascript
import { apiCallWithRetry, initializeApp, keepServerWarm } from './apiUtils';

// Initialize when app starts
await initializeApp('https://your-api.vercel.app');

// Use for all API calls
const response = await apiCallWithRetry('https://your-api.vercel.app/api/users');
const data = await response.json();

// Optional: Keep server warm
keepServerWarm('https://your-api.vercel.app', 5); // Every 5 minutes
```

### Manual Implementation
```javascript
const apiCall = async (url, options = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) return response;
      
      // If 404/500 error, try warmup and retry
      if ((response.status === 404 || response.status >= 500) && i < retries - 1) {
        const baseUrl = url.split('/api/')[0];
        await fetch(`${baseUrl}/api/warmup`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## Testing

### Local Testing
```bash
# Start server
npm start

# Test endpoints
npm run test:coldstart  # Will be added

# Manual testing
curl http://localhost:5000/api/health
curl http://localhost:5000/api/warmup
```

### Production Testing
```bash
# Run the test script with production URL
node testColdStart.js
```

## Performance Tips

### 1. Warmup Strategy
- Call `/api/warmup` when your frontend app loads
- Use health check for monitoring
- Implement periodic pinging (every 5-10 minutes)

### 2. Error Handling
- Always implement retry logic with exponential backoff
- Handle 503/404 errors gracefully
- Show loading states during warmup

### 3. Monitoring
- Monitor response times
- Track cold start frequency
- Set up alerts for health check failures

## Troubleshooting

### Still Getting 404 Errors?
1. Check Vercel function logs
2. Verify environment variables are set
3. Test warmup endpoint manually
4. Check database connection string

### Slow First Response?
1. Increase Vercel function memory (1024MB)
2. Optimize database queries
3. Implement frontend loading states
4. Use warmup endpoint proactively

### Database Connection Issues?
1. Check MongoDB Atlas IP whitelist (allow all: 0.0.0.0/0)
2. Verify connection string format
3. Check network policies in MongoDB Atlas
4. Test connection locally first

## Files Modified
- ✅ `config/database.js` - Connection pooling & state management
- ✅ `routes/index.js` - Added health & warmup endpoints
- ✅ `index.js` - Serverless optimization
- ✅ `vercel.json` - Deployment configuration
- ✅ `utils/apiUtils.js` - Frontend utility functions
- ✅ `testColdStart.js` - Testing script

## Support
If you still face issues:
1. Check Vercel function logs in dashboard
2. Test locally with same environment variables
3. Verify MongoDB Atlas configuration
4. Check network connectivity

---
**Note**: Cold start issues are inherent to serverless architectures, but these optimizations minimize their impact significantly.