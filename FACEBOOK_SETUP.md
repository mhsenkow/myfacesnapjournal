# Facebook Integration Setup

To use the real Facebook login functionality, you need to set up a Facebook App and configure the credentials.

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App" → "Consumer" → "Next"
3. Fill in:
   - **App Name**: MyFace SnapJournal
   - **App Contact Email**: your-email@example.com
   - **App Purpose**: Personal use
4. Click "Create App"

## Step 2: Configure Facebook Login

1. In your app dashboard, go to "Facebook Login" → "Settings"
2. Add these **Valid OAuth Redirect URIs**:
   - `http://localhost:1420`
   - `https://yourdomain.com` (for production)
3. Save changes

## Step 3: Get App Credentials

1. Go to "Settings" → "Basic"
2. Copy your **App ID**
3. Copy your **App Secret** (click "Show")

## Step 4: Update the Code

1. Open `src/components/Facebook/FacebookLoginModal.tsx`
2. Replace the `FACEBOOK_APP_ID` constant:
   ```typescript
   const FACEBOOK_APP_ID = 'YOUR_ACTUAL_APP_ID_HERE';
   ```

## Step 5: Configure App Permissions

In your Facebook App settings, make sure these permissions are available:
- `public_profile` (default)
- `email` (default)
- `user_posts` (requires app review for production)
- `user_photos` (requires app review for production)
- `user_videos` (requires app review for production)

## Step 6: Test the Integration

1. Start your app: `npm run dev`
2. Go to the Journal page
3. Click the "Facebook" button
4. Click "Connect to Facebook"
5. The Facebook login modal should appear
6. Log in with your Facebook account
7. Grant the requested permissions
8. Your posts should import successfully

## Important Notes

- **Development Mode**: Your app starts in development mode, so only you and other developers can use it
- **App Review**: For production use, you'll need to submit your app for Facebook's review process
- **HTTPS Required**: Facebook requires HTTPS for production apps
- **Rate Limits**: Facebook has API rate limits - be mindful of how often you make requests

## Troubleshooting

### "App Not Setup" Error
- Make sure your App ID is correct
- Ensure your domain is added to the app settings
- Check that Facebook Login is enabled

### "Invalid Redirect URI" Error
- Add your current domain to the Valid OAuth Redirect URIs
- Make sure the URI matches exactly (including http/https)

### "Permissions Error"
- Some permissions require app review
- For development, you can only test with your own account
- Check that the permissions are properly requested in the login scope

### "Access Token Error"
- Make sure you're using the correct App ID
- Check that the user has granted the necessary permissions
- Verify the token hasn't expired

## Security Considerations

- Never expose your App Secret in client-side code
- Use environment variables for sensitive data
- Implement proper error handling
- Consider implementing token refresh logic
- Respect user privacy and data usage policies
