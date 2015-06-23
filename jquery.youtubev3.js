(function ($) {

    /**
     * Chamada API Youtube V3 Simples 
     * Para alternativa a bloqueio file_get_contents PHP em servidores Web
     * Developed by Fabio Gonzaga
     * 
     * 
     * 
     */
    //DEBUG
    //var apiKey = '';
    //var playlistId = 'PL590L5WQmH8djDwF4JuHGEMUD4wNSIwlt';
    //var get_params = { key: apiKey, playlistId: playlistId, part: 'snippet', maxResults: limitItens };
    //var url = 'https://www.googleapis.com/youtube/v3/playlistItems?' + jQuery.param( get_params );
    //console.log(url);

    var self = this;
    
    var defaults = {
        apiKey: '{YOUR_API_KEY}', //Set your API Key
        playlistId: 'PL590L5WQmH8djDwF4JuHGEMUD4wNSIwlt', //Playlist ID Youtube
        playlistTitle: null, //Set html element to get the title
        playlistDescription: null, //Set html element to get the description
        playlistThumbnail: null, //Set html element to get the thumbnail
        playlistChannel: null, //Set html element to get the channel
        playlistVideoId: null, //Set html element to get the link video
        playlistLimit: 50, //Number of videos to list
        playerId: null, 
        playerType: "iframe", //Set iframe or thumbnail
        playerWidth: "560", 
        playerHeight: "315",
        playerScreen: "standard", //Options: default, medium, high, standard or maxres
        playerTitle: ".playertitle", //Create the elemento into player element to get the title
        playerDescription: ".playerdescription", //Create the elemento into player element to get the description
        playerChannel: ".playerchannel", //Create the elemento into player element to get the Channel Title
        playerAssocPlaylist: true //If enabled the open video in the player will not be shown in the playlist
    };

    var methods = {
        playlist: function (options) {
            var settings = $.extend(defaults, options);
            var elem = this;
            
            $.ajax({
                method: "GET",
                url: 'https://www.googleapis.com/youtube/v3/playlistItems',
                data: {key: settings.apiKey, playlistId: settings.playlistId, part: 'snippet', maxResults: settings.playlistLimit}
            }).done(function (handleResponse) {

                $.each([handleResponse.items], function (index, value) {
                    $.each(value, function (i, e) {
                        
                        var $div = $(elem).first();
                        var $clone = $div.clone();

                        $clone.prop('id', e.snippet.resourceId.videoId);
                        $clone.prop('class', 'playlistItem');
                        $clone.find(settings.playlistTitle).text(e.snippet.title);
                        $clone.find(settings.playlistDescription).text(e.snippet.description);
                        $clone.find(settings.playlistThumbnail).attr('src', e.snippet.thumbnails.medium.url);
                        $clone.find(settings.playlistChannel).attr('href', 'https://www.youtube.com/user/' + e.snippet.channelTitle).html(e.snippet.channelTitle);
                        $clone.find(settings.playlistVideoId).attr('href', function (i, h) {
                            return h + '#' + e.snippet.resourceId.videoId
                        });

                        $(elem).before($clone);

                    });
                });

                $(elem).hide();
                
            });
            
        },
        player: function (options) {
            var settings = $.extend(defaults, options);
            var elem = this;
            
            $(self).click(function(){
                location.reload();
            });
            
            if (settings.playerAssocPlaylist === true){
                if (!settings.playerId) {
                    var t = methods._firstPlaylistItem();
                    settings.playerId = (document.URL.split('#')[1]) ? document.URL.split('#')[1] : t.items[0].snippet.resourceId.videoId;
                }
            }

            $.ajax({
                method: "GET",
                url: 'https://www.googleapis.com/youtube/v3/videos',
                data: {key: settings.apiKey, id: settings.playerId, part: 'snippet'}
            }).done(function (handleResponse) {
                
                if (settings.playerType === "iframe") {
                    $('<iframe></iframe>', {
                        src: 'https://www.youtube.com/embed/' + handleResponse.items[0].id,
                        id: handleResponse.items[0].id,
                        frameborder: 0,
                        scrolling: 'no',
                        allowfullscreen: '1',
                        width: settings.playerWidth,
                        height: settings.playerHeight
                    }).prependTo(elem);
                }

                if (settings.playerType === "thumbnail") {
                    $('<img>', {
                        src: handleResponse.items[0].snippet.thumbnails[settings.playerScreen].url,
                        id: handleResponse.items[0].id
                    }).prependTo(elem);
                }

                if ($(settings.playerTitle)) {
                    $(settings.playerTitle).html(handleResponse.items[0].snippet.title);
                }
                if ($(settings.playerDescription)) {
                    $(settings.playerDescription).html(handleResponse.items[0].snippet.description);
                }
                if ($(settings.playerChannel)) {
                    $(settings.playerChannel).html(handleResponse.items[0].snippet.channelTitle);
                }
                
                if (settings.playerAssocPlaylist){
                    methods._hideVideo(handleResponse.items[0].id);
                }

            });
            
        },
        _getUrlParameter: function (paramName) {
            var sPageURL = window.location.search.substring(1);
            var sURLVariables = sPageURL.split('&');
            for (var i = 0; i < sURLVariables.length; i++) {
                var sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0] == paramName) {
                    return sParameterName[1];
                }
            }
        },
        _firstPlaylistItem: function(){
            var settings = $.extend(defaults);
            var result;
            
            result = $.ajax({
                method: "GET",
                url: 'https://www.googleapis.com/youtube/v3/playlistItems',
                data: {key: settings.apiKey, playlistId: settings.playlistId, part: 'snippet', maxResults: 1},
                async: false,
                global: false,
                dataType: 'json'
            }).responseJSON;
            
            return result;
            
        },
        _hideVideo: function(param){
            $('.playlistItem').each(function(i, e){
                if ( $(this).attr('id') === param ){
                    $(this).hide();
                }
            });
        }
    }
            

    $.fn.Youtube = function (methodName, options) {
        
        // use some logic to control what methods are public
        if (methodName === "playlist") {
            return methods.playlist.apply(this, Array.prototype.slice.call(arguments, 1));
        }
        if (methodName === "player") {
            return methods.player.apply(this, Array.prototype.slice.call(arguments, 1));
        }
        
    };
    
})(jQuery);
