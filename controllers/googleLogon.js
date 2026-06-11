const { OAuth2Client } = require("google-auth-library"); //
require("dotenv").config();
// 1. Build the client with your exact keys
const oAuth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: "postmessage",
});

// 2. The controller to handle the frontend request
async function googleLogon(req, res) {
  console.log("google-hand-shake");
  try {
    // Get the code sent from your React button
    const code = req.body.code;
    // oAuth2Client.redirectUri = req.body.redirectUri;
    // 3. Trade the code for access tokens
    const r = await oAuth2Client.getToken({
      code: code,
      redirectUri: "postmessage",
    }); //

    // 4. Save the tokens to the client
    oAuth2Client.setCredentials(r.tokens); //

    // Send a success message back to the frontend
    res.status(200).json({ message: "Tokens acquired!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get tokens." });
  }
}

module.exports = { googleLogon };
