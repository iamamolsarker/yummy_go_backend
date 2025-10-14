// Frontend utility functions for handling cold start issues
// Copy this to your frontend project

/**
 * API call with automatic retry and warmup logic
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @param {number} retries - Number of retries (default: 3)
 * @returns {Promise<Response>} - Fetch response
 */
const apiCallWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            // If successful, return response
            if (response.ok) {
                return response;
            }
            
            // If it's a 404 or 503 error and not the last retry, try warmup
            if ((response.status === 404 || response.status >= 500) && i < retries - 1) {
                console.log(`Attempt ${i + 1} failed with status ${response.status}. Retrying...`);
                
                // Try to warm up the server
                try {
                    const baseUrl = url.split('/api/')[0];
                    await fetch(`${baseUrl}/api/warmup`);
                    console.log('Server warmup attempted');
                } catch (warmupError) {
                    console.log('Warmup failed, continuing with retry');
                }
                
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
                continue;
            }
            
            return response;
        } catch (error) {
            if (i === retries - 1) {
                throw error;
            }
            
            console.log(`Network error on attempt ${i + 1}:`, error.message);
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
};

/**
 * Warm up the server by calling health endpoint
 * @param {string} baseUrl - Base API URL
 * @returns {Promise<boolean>} - Success status
 */
const warmupServer = async (baseUrl) => {
    try {
        const response = await fetch(`${baseUrl}/api/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        return response.ok;
    } catch (error) {
        console.error('Server warmup failed:', error);
        return false;
    }
};

/**
 * Initialize app by warming up server
 * Call this when your app starts
 * @param {string} apiBaseUrl - Your API base URL
 */
const initializeApp = async (apiBaseUrl) => {
    console.log('Initializing app and warming up server...');
    
    try {
        const isWarm = await warmupServer(apiBaseUrl);
        if (isWarm) {
            console.log('Server is warm and ready');
        } else {
            console.log('Server warmup failed, but continuing...');
        }
    } catch (error) {
        console.error('App initialization error:', error);
    }
};

/**
 * Keep server warm by periodic pinging
 * @param {string} apiBaseUrl - Your API base URL
 * @param {number} intervalMinutes - Ping interval in minutes (default: 5)
 */
const keepServerWarm = (apiBaseUrl, intervalMinutes = 5) => {
    const interval = intervalMinutes * 60 * 1000; // Convert to milliseconds
    
    setInterval(async () => {
        try {
            await fetch(`${apiBaseUrl}/api/health`);
            console.log('Keep-warm ping sent');
        } catch (error) {
            console.log('Keep-warm ping failed:', error.message);
        }
    }, interval);
    
    console.log(`Keep-warm service started (${intervalMinutes} min intervals)`);
};

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        apiCallWithRetry,
        warmupServer,
        initializeApp,
        keepServerWarm
    };
}

// For browser environments, attach to window
if (typeof window !== 'undefined') {
    window.YummyGoAPI = {
        apiCallWithRetry,
        warmupServer,
        initializeApp,
        keepServerWarm
    };
}