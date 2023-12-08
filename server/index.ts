import dotenv from 'dotenv';
import express from 'express';

const cors = require('cors');

const { google } = require('googleapis');

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const { OAuth2 } = google.auth;
const { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET } = process.env;
// const redirectUri = process.env.NODE_ENV ? 'produrl' : 'http://localhost:5174';
const redirectUri = 'http://localhost:5174'
module.exports.redirectUri = redirectUri;

const scope = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
]

const getGoogleProfileData = async (accessToken: any) => {
  try {
    const auth = new OAuth2(
      GOOGLE_OAUTH_CLIENT_ID,
      GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri
    );
    auth.setCredentials({ access_token: accessToken });
    const oauth2 = google.oauth2({ auth, version: 'v2' });
    const { data } = await oauth2.userinfo.get();
    return data;
  } catch (e) {
    // console.log(e)
    throw "Invalid Grant: Google Profile Data";
  }
}

function getAuthUrl() {
  const auth = new OAuth2(
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri
  );

  return auth.generateAuthUrl({
    access_type: 'offline',
    login_hint: 'select_account',
    scope,
  });
}

const queriesRoute = require('./queries');

app.use('/api', queriesRoute);

app.get('/api/auth/url', (req, res) => {
  res.json({ url: getAuthUrl() });
}); // redirect to ths url to login

app.get('/api/auth/:authCode', async (req, res) => {
  const { authCode } = req.params;
  try {
    const auth = new OAuth2(
      GOOGLE_OAUTH_CLIENT_ID,
      GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri
    );
    const { tokens } = await auth.getToken(authCode);
    const { access_token: accessToken } = tokens;
    
    res.json({
      access_token: accessToken
    })
  } catch (e) {
    res.json({
      error: 'INVALID AUTH CODE'
    });
  }
})

app.get('/api/user', async (req, res) => {
  const { authorization } = req.headers;
  const accessToken = authorization?.split(' ')[1];

  try {
    const userProfile = await getGoogleProfileData(accessToken);
    res.json({
      profileData: {
        ...userProfile,
      }
    });
  } catch (e) {
    console.log(e)
    res.status(401).json({ error: 'Forbidden' });
  }
});

// DB API

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello World!'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}. Ready to accept requests!`);
});
