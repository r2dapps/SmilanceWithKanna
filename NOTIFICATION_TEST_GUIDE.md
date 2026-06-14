# Surprise Notification Test Guide 📱💖

*Keep this guide open for when you are on a call with her!*

## Prerequisites
Before you start the call, make sure you have logged into the GitHub CLI. You only need to do this step once.
1. Open your terminal in the project folder (`d:\ReactApps2Git\SmilanceWithKanna`).
2. Run the following command:
   ```bash
   gh auth login
   ```
3. Press **Enter** to accept the default options (GitHub.com -> HTTPS -> Login with a web browser).
4. Follow the prompts in the browser to authorize.

---

## When You're On The Call...

Wait for the perfect moment during the conversation, then quickly type this command into your terminal and hit **Enter**:

```bash
gh workflow run daily-push.yml
```

Within a few seconds, she will receive a surprise notification on her phone! It will randomly pick a cute nickname ("chinnoda", "bujjoda", etc.) and a message related to her dental subjects depending on the time of day.

### Alternate Method (If CLI doesn't work)
If for any reason the command prompt isn't working, you can trigger it silently from your browser:
1. Go to your GitHub repository.
2. Click the **Actions** tab.
3. Click **Daily Morning Push Notification** on the left menu.
4. On the right side, click the **Run workflow** dropdown, and then click the green **Run workflow** button.
