

        /**
         * Obtains parameters from the hash of the URL
         * @return Object
         */
        function getHashParams() {
          var hashParams = {};
          var e, r = /([^&;=]+)=?([^&;]*)/g,
              q = window.location.hash.substring(1);
          while ( e = r.exec(q)) {
             hashParams[e[1]] = decodeURIComponent(e[2]);
          }
          return hashParams;
        }

        var userProfileSource = document.getElementById('user-profile-template').innerHTML,
            userProfileTemplate = Handlebars.compile(userProfileSource),
            userProfilePlaceholder = document.getElementById('user-profile');

        var oauthSource = document.getElementById('oauth-template').innerHTML,
            oauthTemplate = Handlebars.compile(oauthSource),
            oauthPlaceholder = document.getElementById('oauth');

        var params = getHashParams();

        var access_token = params.access_token,
            refresh_token = params.refresh_token,
            error = params.error;

        if (error) {
          alert('There was an error during the authentication');
        } else {
          if (access_token) {
            // render oauth info
            oauthPlaceholder.innerHTML = oauthTemplate({
              access_token: access_token,
              refresh_token: refresh_token
            });

            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                  userProfilePlaceholder.innerHTML = userProfileTemplate(response);

                  $('#login').hide();
                  $('#loggedin').show();
                }
            });
          } else {
              // render initial screen
              $('#login').show();
              $('#loggedin').hide();
          }

          document.getElementById('obtain-new-token').addEventListener('click', function() {
            $.ajax({
              url: '/refresh_token',
              data: {
                'refresh_token': refresh_token
              }
            }).done(function(data) {
              access_token = data.access_token;
              oauthPlaceholder.innerHTML = oauthTemplate({
                access_token: access_token,
                refresh_token: refresh_token
              });
            });
          }, false);

          // INCLUDED TO LINK BUTTONS TO APP.GET URL REQUESTS WITHOUT ACTUALLY CHANGING URL
          document.getElementById('get-favorite-artists').addEventListener('click', function() {
            $.ajax({
              url: '/favorite',
              data: {
                'access_token': access_token
              }
            });
          }, false);

          // sends access_token with /recommendation query
          document.getElementById('get-recommendation').addEventListener('click', function() {
            var artists = '';
            var checkboxes = document.getElementsByName('artist-checkbox');
            var checkboxesChecked = [];
  
            for (var i=0; i<checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    artists = artists + checkboxes[i].value + ',';
                }
            }
            $.ajax({
              url: '/recommendation',
              data: {
                'access_token': access_token,
                'artists': artists
              }
            }).done(function(data) {
                var tracks = data.tracks;
                var lastRecommendation = document.getElementById('recommended-list');

                while (lastRecommendation.children.length > 0) {
                    lastRecommendation.children[0].remove();
                }
                
                if (tracks) {
                    for (var i=0; i<tracks.length; i++) {
                        var outerDiv = document.getElementById("recommended-list");
                        var innerDiv = document.createElement("div");
                    
                        innerDiv.setAttribute('class', 'recommended-track');
                        outerDiv.appendChild(innerDiv);

                        var nameTag = document.createElement("p");
                        var artistTag = document.createElement("p");
                        var albumTag = document.createElement("p");
                        var artTag = document.createElement("p");
                        var previewTag = document.createElement("p");

                        nameTag.innerHTML = tracks[i].name;
                        artistTag.innerHTML = tracks[i].artists[0].name;
                        albumTag.innerHTML = tracks[i].album.name;
                        artTag.innerHTML = tracks[i].album.images[0]
                        previewTag.innerHTML = tracks[i].preview_url;

                        for (var j=1; j<tracks[i].artists.length; j++) {
                            artistTag.innerHTML = artistTag.innerHTML + ',' + tracks[i].artists[j].name;
                        }

                        innerDiv.appendChild(nameTag);
                        innerDiv.appendChild(artistTag);
                        innerDiv.appendChild(albumTag);
                        innerDiv.appendChild(artTag);
                        innerDiv.appendChild(previewTag);
                    }
                }
            });
          }, false);

          // sends access_token and search word with /artist_search query
          // then generates a list of checkboxes that the user can choose to include in their recommendation seed
          document.getElementById('search-artists').addEventListener('click', function() {
            var input = document.getElementById('artist-input').value;
            var lastSearch = document.getElementById('artist-list');

            for (var i=0; i<lastSearch.children.length; i += 3) {
                if (!lastSearch.children[i].checked) {
                    for (var j=0; j<3; j++) {
                        lastSearch.children[i].remove();
                    }
                    i -= 3;
                }
            }

            $.ajax({
                url: '/artist_search',
                data: {
                    'access_token': access_token,
                    'input': input
                }
            }).done(function(data) {
                var artists = data.items;
                
                for (var i=0; i<artists.length; i++) {
                    var div = document.getElementById("artist-list");
                    var unique = true;

                    for (var j=0; j<div.children.length; j++) {
                        if (artists[i].id == div.children[j].getAttribute('id')) {
                            unique = false;
                            break;
                        }
                    }
                    if (!unique) {
                        continue;
                    }

                    var tag = document.createElement("input");
                    var label = document.createElement("label");
                    var lineBreak = document.createElement("br");

                    tag.setAttribute('type', 'checkbox');
                    tag.setAttribute('name', 'artist-checkbox');
                    tag.setAttribute('id', artists[i].id);
                    tag.setAttribute('value', artists[i].id);
                    label.setAttribute('for', artists[i].id);
                    label.textContent = artists[i].name;
                    div.appendChild(tag);
                    div.appendChild(label);
                    div.appendChild(lineBreak);
                }
            });
          }, false);
        }
