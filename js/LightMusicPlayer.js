/**
 * Created by dan on 08/12/2016. DanialSabagh.com | All Rights Reserved.
 * Version 1.1 - 31/08/2017 - 24p
 */
(function ( $ ) {
    "use strict";

    $(".lightMusicPlayer").append('<div class="backG"></div> <div class="branding"></div><div class="plybtn icon-play"></div><div class="titleholder"></div><div class="timing">00:00</div><div class="artistholder"></div><div class="seekbar"><div class="played"></div></div>');
    $.fn.LightMusicPlayer = function(options) {
        var settings = $.extend({
            // These are the defaults
            type: "",
            title: "",
            track_URL: "",
            SC_Client_ID: "",
            SC_Track_URL: "",
            iTunes_Track_ID: "",
            autoplay: "false",
            theme: "#fff",
            extra_Link: "",
            artwork_URL:"",
            artwork_blur:""
        }, options);
        var audio, thisPlayer, ppBtn;
        audio = new Audio();
        thisPlayer = this;
        ppBtn = $(".plybtn", thisPlayer);

        //EVENTS
        $(audio).on("playing", function() {
            togglePlying(ppBtn, true);
            $(ppBtn).addClass("icon-pause");
            $(ppBtn).removeClass("icon-play");
        });
        $(audio).on("pause", function() {
            togglePlying(ppBtn, false);
            $(ppBtn).removeClass("icon-pause");
            $(ppBtn).addClass("icon-play");
        });
        $(audio).on("timeupdate", function() {
            $(".timing", thisPlayer).text(getReadableTime(this.currentTime));
            $(".played", thisPlayer).css("width", audio.currentTime * (100 / audio.duration) + "%"); // UPDATEs SEEKBAR
        });
        $(audio).on("ended", function(){

        });

        // EACH Player
        thisPlayer.each(function() {
            if(settings.type == "audio"){
                updateTitle(settings.title);
                
                updateAudioSrc(settings.track_URL);
                
                updateBackground(settings.artwork_URL);

                if (settings.extra_Link.length <= 0){
                    $(".icon-music").addClass("not-active");
                }
            }
            else if(settings.type == "soundcloud"){
                var scID = settings.SC_Client_ID;
                var scURL = settings.SC_Track_URL;
                SC.initialize({
                    client_id: scID
                });
                SC.resolve(scURL).then(function (sound) {
                    updateAudioSrc(sound.uri + "/stream?client_id=" + scID);
                    updateTitle(sound.title);
                    
                    
                    updateBackground(sound.artwork_url.replace("large", "crop"));
                });
            }
            else if(settings.type == "itunes"){
                var id = settings.iTunes_Track_ID;
                var iTuensLink = "https://itunes.apple.com/lookup?id=" + id + "&callback=?";
                $.getJSON(iTuensLink, function(data) {
                    if (data.results[0].previewUrl.length > 0){
                        updateAudioSrc(data.results[0].previewUrl);
                        updateTitle(data.results[0].trackName);
                        
                        
                        updateBackground(data.results[0].artworkUrl100);
                    }else{
                        console.log("No valid iTunes track ID is provided! Or the track is not for public streaming")
                    }
                }).fail(function() {
                    console.log("Data could not be loaded: A valid iTunes track ID is not provided! Or the track is not for public streaming");
                });
            }
            else if (settings.type == "radio"){
                updateAudioSrc(settings.track_URL);
                updateTitle(settings.title);
                
                updateBackground(settings.artwork_URL);
                $(".branding", thisPlayer).addClass("live").text("Live");
            }


            $(thisPlayer).css("color", settings.theme);
            if (settings.autoplay == "true"){
                audio.autoplay = true;
            }
            if (settings.artwork_blur.length > 0){
                var num = settings.artwork_blur;
                $(".backG", thisPlayer).css({
                    "-webkit-filter": "blur(" + num + ")",
                    "-moz-filter": "blur(" + num + ")",
                    "-o-filter": "blur(" + num + ")",
                    "-ms-filter": "blur(" + num + ")",
                    "filter": "blur(" + num + ")"
                });
            }
        });


        // BUTTONS
        $(ppBtn, thisPlayer).on("click tap", function() {
            playManagement();
        });
        $(".seekbar", thisPlayer).on('click tap',function (e) {
            var x = e.pageX - $(this).offset().left,
                width = $(this).width(),
                duration = audio.duration;
            audio.currentTime = (x / width) * duration;

        });

        // UTILITY FUNCTION
        function playManagement(){
            if (audio.paused) {
                setTimeout(function () {
                    audio.play();
                }, 150);

                var $playing = $('.plybtn.playing');
                if ($(thisPlayer).find($playing).length === 0) {
                    $playing.click();
                }

                $(thisPlayer).addClass("bekhon");
                $(".lightMusicPlayer").removeClass("nakhon ");
            } else {
                audio.pause();

                $(thisPlayer).addClass("nakhon");
                $(".lightMusicPlayer").removeClass("bekhon");
            }

        }
        function getReadableTime(value) {
            //Convert milisec to "readable" time
            if (value == "Infinity") {
                return "live";
            } else {
                var durmins = Math.floor(value / 60);
                var dursecs = Math.floor(value - durmins * 60);
                if (dursecs < 10) {
                    dursecs = "0" + dursecs;
                }
                if (durmins < 10) {
                    durmins = "0" + durmins;
                }
                return durmins + ":" + dursecs;
            }

        }
        function updateTitle(data) {
            $(".titleholder", thisPlayer).text(checkTextLength(data, 23));
        }
        function updateArtist(data) {
            $(".artistholder", thisPlayer).text(checkTextLength(data, 25));
        }
        function updateAudioSrc(data) {
            audio.src = data;
        }
        function updateBranding(icon, url, text) {
            $(".branding", thisPlayer).addClass(icon).append("<a href='" + url + "' target='_blank' title='" + text +"'></a>");
        }
        function updateBackground(url) {
            var artwork = settings.artwork_URL;
            if(artwork.length > 0){
                $(".backG", thisPlayer).css("background", "url("+ artwork +")");
            }
            else{
                $(".backG", thisPlayer).css("background", "url("+ url +")");
            }

        }
        function togglePlying(aClassName, bool) {
            $(aClassName).toggleClass("playing", bool);
        }
        function checkTextLength(text, lendth){
            if(text.length > lendth){
                return text.substring(0, lendth - 1) + "...";
            }else{
                return text;
            }
        }
        // Keyboard
        $(window).keypress(function(e) {
            if (e.keyCode === 0 || e.keyCode === 32) {
                e.preventDefault();
                if ($(thisPlayer).hasClass("bekhon")) {
                    audio.pause();
                    $(thisPlayer).removeClass("bekhon");
                    $(thisPlayer).addClass("nakhon");
                } else if ($(thisPlayer).hasClass("nakhon")) {
                    audio.play();
                    $(thisPlayer).removeClass("nakhon");
                    $(thisPlayer).addClass("bekhon");
                }
            }
        })
    }
}( jQuery ));