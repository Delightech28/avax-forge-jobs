# Firebase Storage CORS Fix

The CORS error you're experiencing is because Firebase Storage needs to be configured to allow uploads from your development domain. Here's how to fix it:

## Option 1: Using Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Create a CORS configuration file** named `cors.json`:
   ```json
   [
     {
       "origin": ["http://localhost:8080", "http://localhost:3000", "http://localhost:5173"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"]
     }
   ]
   ```

4. **Apply the CORS configuration**:
   ```bash
   gsutil cors set cors.json gs://avax-forge-jobs.firebasestorage.app
   ```

## Option 2: Using Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to Cloud Storage > Browser
4. Select your storage bucket (`avax-forge-jobs.firebasestorage.app`)
5. Go to the "CORS" tab
6. Add a new CORS rule with:
   - Origins: `http://localhost:8080`, `http://localhost:3000`, `http://localhost:5173`
   - Methods: `GET`, `POST`, `PUT`, `DELETE`, `HEAD`
   - Response Headers: `Content-Type`, `Authorization`, `Content-Length`, `User-Agent`, `x-goog-resumable`
   - Max Age: `3600`

## Option 3: For Production

When deploying to production, update the CORS configuration to include your production domain:

```json
[
  {
    "origin": ["https://yourdomain.com", "https://www.yourdomain.com"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"]
  }
]
```

## Current Workaround

The code has been updated to automatically fallback to base64 storage if Firebase Storage fails due to CORS issues. This means:

- ✅ Avatar uploads will work immediately
- ✅ Images are compressed to fit within Firestore limits
- ✅ When CORS is fixed, it will automatically use Firebase Storage
- ✅ No data loss or manual intervention required

## Testing

After applying the CORS fix:
1. Try uploading an avatar
2. Check the console for "Avatar uploaded successfully to cloud storage" message
3. If you still see CORS errors, the fallback will handle it automatically

The fallback solution ensures your app works immediately while you fix the CORS configuration.
