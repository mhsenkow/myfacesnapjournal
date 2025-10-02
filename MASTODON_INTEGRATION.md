# Mastodon Integration

This document explains how to use the Mastodon integration feature in MyFace SnapJournal.

## Overview

The Mastodon integration allows you to connect your Mastodon account and import your posts as journal entries. This makes it easy to preserve your thoughts and memories from the decentralized social network.

## Features

- **Easy Authentication**: Connect to any Mastodon instance using OAuth
- **Post Import**: Import your posts, replies, and reblogs as journal entries
- **Smart Filtering**: Choose what content to import (replies, reblogs, media)
- **Preview Mode**: See your posts before importing them
- **Automatic Mood Detection**: AI-powered mood analysis of your posts
- **Tag Extraction**: Automatically extract hashtags from posts
- **Media Support**: Import posts with images and attachments

## How to Use

### 1. Access the Integration

1. Open MyFace SnapJournal
2. Go to Settings (gear icon in the sidebar)
3. Click on the "Integrations" tab
4. Find the "Mastodon Integration" section

### 2. Connect Your Account

1. Click "Connect to Mastodon"
2. Choose your Mastodon instance from the popular list, or enter a custom one
3. Click "Authorize on Mastodon" to complete the OAuth flow
4. You'll be redirected to your Mastodon instance to authorize the app

### 3. Configure Import Settings

Once connected, you can customize what content to import:

- **Import Limit**: Number of posts to import at once (1-100)
- **Auto Import Interval**: How often to automatically check for new posts (in hours)
- **Include Replies**: Import replies to other posts
- **Include Reblogs**: Import posts you've reblogged
- **Include Media**: Import posts with images and attachments

### 4. Preview and Import

1. Click "Preview" to see your recent posts
2. Review the posts that will be imported
3. Click "Import Posts" to add them to your journal
4. Posts will be converted to journal entries with:
   - Title generated from post content
   - Full post content (HTML stripped)
   - Extracted hashtags as tags
   - AI-determined mood
   - Original post metadata

## Supported Mastodon Instances

The integration works with any Mastodon instance that supports the standard API. Popular instances include:

- mastodon.social (original instance)
- mastodon.online
- mstdn.social
- mastodon.art (art-focused)
- tech.lgbt (LGBTQ+ tech community)
- fosstodon.org (open source community)

## Privacy and Security

- Your Mastodon credentials are stored securely on your device
- Only posts you authorize are accessed
- No data is sent to external servers
- You can disconnect your account at any time

## Troubleshooting

### "Failed to connect to instance"
- Check that the instance URL is correct
- Ensure the instance is online and accessible
- Try a different instance

### "Authentication failed"
- Make sure you completed the OAuth flow
- Check that popups are enabled in your browser
- Try disconnecting and reconnecting

### "No posts found"
- Check your import settings (replies, reblogs filters)
- Try increasing the import limit
- Make sure you have posts on your account

## Technical Details

The integration uses the Mastodon API v1 to:
- Authenticate via OAuth 2.0
- Fetch user posts and timeline
- Access post metadata and media
- Handle rate limiting and pagination

## Future Enhancements

Planned features include:
- Real-time post syncing
- Support for more Mastodon features (polls, bookmarks)
- Export journal entries back to Mastodon
- Integration with other Fediverse platforms

## Support

If you encounter issues with the Mastodon integration:
1. Check this documentation
2. Verify your Mastodon instance is working
3. Try disconnecting and reconnecting
4. Check the browser console for error messages

For additional help, please refer to the main app documentation or contact support.
