/**
 * This uses an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 * 
 * It has been extended to perform more complex API calls
 * featuring artist IDs and modified track feature targets.
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = 'd9cb19add2e34874979809024b4c9e98'; // Your client id
var client_secret = '65aea33edaed4cbd9a3bd38d7ceb3998'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);

  //res.cookie(stateKey, state);

  // your application requests authorization

  // SCOPES PROVIDE SCRIPT ACCESS TO READ/WRITE https://developer.spotify.com/documentation/general/guides/authorization/scopes/ 
  var scope = 'user-read-private user-read-email user-top-read';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  /*var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  console.log("Cookies: " + req.cookies[stateKey]);
  console.log("State: " + state);
  console.log("Stored state: " + storedState);

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);*/
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          // MODIFYING THE URL ENDPOINT CHANGES WHAT DATA IS LOGGED TO CONSOLE
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };


        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  //}
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/favorite', function (req, res) {
    
  var access_token = req.query.access_token;
  var options = {
    // MODIFYING THE URL ENDPOINT CHANGES WHAT DATA IS LOGGED TO CONSOLE
    url: 'https://api.spotify.com/v1/users/acrowe4234/playlists',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };

  // use the access token to access the Spotify Web API
  request.get(options, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log(body); //.items[0]);
    } else if (response.statusCode === 401) {
      res.redirect('/#' + querystring.stringify({
        error: 'not_authorized'
      })); 
      console.log(access_token);
    } else {
      res.redirect('/#' + querystring.stringify({
        error: 'invalid_token'
      }));
      console.log(error);
      console.log(response.statusCode);
    } 
  });
});

app.get('/recommendation', function(req, res) {

    // Prepare the api call
    var access_token = req.query.access_token;
    var artists = req.query.artists;
    var genres = req.query.genres;
    var tracks = req.query.tracks;
    var scalars = req.query.scalars;
    var scalarNames = ['acousticness', 'danceability', 'duration_ms', 'energy', 'instrumentalness', 'key', 'liveness', 'loudness', 'mode', 'popularity', 'speechiness', 'tempo', 'time_signature', 'valence'];

    // Make the URL object for stringifying
    var url_query = new URL('https://api.spotify.com/v1/recommendations?');
    url_query.searchParams.append('seed_artists', artists);
    url_query.searchParams.append('seed_genres', genres);
    url_query.searchParams.append('seed_tracks', tracks);
    url_query.searchParams.append('limit', '5');

    if (scalars != null) {
        for (var i=0; i<scalars.length; i++) {
            if (scalars[i] != []) {
                url_query.searchParams.append('min_' + scalarNames[i], scalars[i][0]);
                url_query.searchParams.append('max_' + scalarNames[i], scalars[i][1]);
                url_query.searchParams.append('tar_' + scalarNames[i], scalars[i][2]);
            }
        }
    }

    var options = {
        url: url_query,
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
    };

    // Make the api call
    request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            res.send({
                'tracks': body.tracks,
            })
        } else {
            res.redirect('/#' + querystring.stringify({
                error: 'invalid_token'
            }));
        }
    });
});

app.get('/artist_search', function(req, res) {
    var access_token = req.query.access_token;
    var input = req.query.input;
    var url_query = 'https://api.spotify.com/v1/search?' + querystring.stringify({
        q: input,
        type: 'artist',
        limit: '5'
    });
    var options = {
        url: url_query,
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
    };

    request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200 && body.artists.items[0]) {
            res.send({
                'items': body.artists.items
            });
            
        } else {
            res.redirect('/#' + querystring.stringify({
                error: 'invalid_token'
            }));
        }
    })
});

app.get('/track_search', function(req, res) {
    var access_token = req.query.access_token;
    var input = req.query.input;
    var url_query = 'https://api.spotify.com/v1/search?' + querystring.stringify({
        q: input,
        type: 'track',
        limit: '10'
    });
    var options = {
        url: url_query,
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
    };

    request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200 && body.tracks.items[0]) {
            res.send({
                'items': body.tracks.items
            });
            
        } else {
            res.redirect('/#' + querystring.stringify({
                error: 'invalid_token'
            }));
        }
    })
});

console.log('Listening on 8888');
app.listen(8888);
