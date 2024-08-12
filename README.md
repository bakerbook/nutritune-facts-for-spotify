# NutriTune Facts for Spotify
NutriTune Facts For Spotify is a web app designed to allow a user to sign in with their Spotify account and show some information about their playlists in a fun way.

## Steps to use

* **1**: Get your Spotify client ID and client secret at the [Spotify for Developers](https://developer.spotify.com/) website and put it in a `.env` file

* **2**: Set the `TEST_SITE` environment variable to the url you are using (most likely http://localhost:3000 in this case)

* **3**: Add that same url and itself with the callback (e.g. http://localhost:3000/callback) to your Spotify app dashboard

* **4**: Run `npm run build`

* **5**: Run `npm run start`