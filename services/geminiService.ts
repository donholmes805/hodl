// This file has been intentionally left blank.
// The Gemini API calls were moved to serverless functions (/api/analyze.ts and /api/chat.ts)
// for security reasons. Attempting to use the Gemini SDK directly from the client-side
// would expose the secret API key, which is a major security vulnerability.
//
// This file is kept to avoid breaking any potential (but incorrect) imports
// during development, but it should not be used. Please use the /api endpoints instead.
