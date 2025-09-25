const admin = require("firebase-admin");

const initializeFirebase = () => {
    try {
        const decodedKey = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf8');
        const serviceAccount = JSON.parse(decodedKey);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        console.log("Firebase Admin initialized successfully");
    } catch (error) {
        console.error('Firebase initialization error:', error);
        throw error;
    }
};

module.exports = { admin, initializeFirebase };