# How to Get Your Firebase Configuration

Firebase does **not** provide a downloadable JSON file for Web Apps (unlike Android which uses `google-services.json`). Instead, it provides a code snippet.

Here is how to get the values to fill your `src/firebaseConfig.json` file:

1.  **Go to the Firebase Console**: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2.  **Select your project** (or create a new one).
3.  Click the **Gear Icon (⚙️)** next to "Project Overview" in the top left and select **Project settings**.
4.  Scroll down to the **"Your apps"** section.
5.  If you haven't created a web app yet:
    *   Click the **`</>` (Web)** icon.
    *   Give it a nickname (e.g., "Burlays Web").
    *   Click **Register app**.
6.  You will see a code block under **"SDK setup and configuration"**.
7.  Look for the `const firebaseConfig = { ... };` object.
8.  **Copy the values** inside that object and paste them into your `src/firebaseConfig.json` file.

## Example of what to copy:

If Firebase shows this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "burlays.firebaseapp.com",
  projectId: "burlays",
  storageBucket: "burlays.firebasestorage.app",
  messagingSenderId: "12345...",
  appId: "1:12345..."
};
```

Update your `src/firebaseConfig.json` to look like this:
```json
{
  "apiKey": "AIzaSy...",
  "authDomain": "burlays.firebaseapp.com",
  "projectId": "burlays",
  "storageBucket": "burlays.firebasestorage.app",
  "messagingSenderId": "12345...",
  "appId": "1:12345..."
}
```
