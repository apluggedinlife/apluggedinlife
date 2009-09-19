/*
 * jQuery JSONP Core Plugin 1.0.6 (2009-07-15)
 * 
 * http://code.google.com/p/jquery-jsonp/
 *
 * Copyright (c) 2009 Julian Aubourg
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 */
(function($){
    
    // ###################### UTILITIES ##
    // Test a value is neither undefined nor null
    var defined = function(v) {
        return v!==undefined && v!==null;
    },
    
    // Head element (for faster use)
    head = $("head"),
    // Page cache
    pageCache = {},
    
    // ###################### DEFAULT OPTIONS ##
    xOptionsDefaults = {
        //beforeSend: undefined,
        //cache: false,
        callback: "C",
        //callbackParameter: undefined,
        //complete: undefined,
        //data: ""
        //dataFilter: undefined,
        //error: undefined,
        //pageCache: false,
        //success: undefined,
        //timeout: 0,       
        url: location.href
    },

    // ###################### MAIN FUNCTION ##
    jsonp = function(xOptions) {
        
        // Build data with default
        xOptions = $.extend({},xOptionsDefaults,xOptions);
        
        var beforeSendCallback = xOptions.beforeSend;

        // Call beforeSend if provided
        // (early abort if false returned)
        if (defined(beforeSendCallback)) {
            var aborted = 0;
            xOptions.abort = function() { aborted = 1; };
            if (beforeSendCallback(xOptions,xOptions)===false || aborted) return xOptions;
        }
        
        // Control entries & data type
        // + declare variables
        var
        empty="",
        amp="&",
        qMark="?",
        success = "success",
        error = "error",
        
        successCallback = xOptions.success,
        completeCallback = xOptions.complete,
        errorCallback = xOptions.error,
        
        dataFilter = xOptions.dataFilter,
        
        callbackParameter = xOptions.callbackParameter,
        
        successCallbackName = xOptions.callback,

        cacheFlag = xOptions.cache,
        pageCacheFlag = xOptions.pageCache,
        
        url = xOptions.url,
        data = xOptions.data,
        
        timeout = xOptions.timeout,
        
        // Keep current thread running
        later = function(functor) { setTimeout(functor,1); },
        
        // Various variable
        splitUrl,splitData,i,j;

        // Control entries
        url = defined(url)?url:empty;
        data = defined(data)?((typeof data)=="string"?data:$.param(data)):empty;
        
        // Add callback parameter if provided as option
        defined(callbackParameter)
            && (data += (data==empty?empty:amp)+escape(callbackParameter)+"=?");
        
        // Add anticache parameter if needed
        !cacheFlag && !pageCacheFlag
            && (data += (data==empty?empty:amp)+"_"+(new Date()).getTime()+"=");
        
        // Search for ? in url
        splitUrl = url.split(qMark);
        // Also in parameters if provided
        // (and merge array)
        if (data!=empty) {
            splitData = data.split(qMark);
            j = splitUrl.length-1;
            j && (splitUrl[j] += amp + splitData.shift());
            splitUrl = splitUrl.concat(splitData);
        }
        // If more than 2 ? replace the last one by the callback
        i = splitUrl.length-2;
        i && (splitUrl[i] += successCallbackName + splitUrl.pop());
        
        // Build the final url
        var finalUrl = splitUrl.join(qMark),
        
        // Utility function
        notifySuccess = function(json) {
            // Apply the data filter if provided
            defined(dataFilter) && (json = dataFilter(json));
            // Call success then complete
            defined(successCallback) && successCallback(json,success);
            defined(completeCallback) && completeCallback(xOptions,success);                
        },
        notifyError = function(type) {
            // Call error then complete
            defined(errorCallback) && errorCallback(xOptions,type);
            defined(completeCallback) && completeCallback(xOptions,type);
        },
        
        // Get from pageCache
        pageCached = pageCache[finalUrl];
        
        // Check page cache
        if (pageCacheFlag && defined(pageCached)) {
            later(function() {
                // If an error was cached
                if (defined(pageCached.e)) notifyError(error);
                else notifySuccess(pageCached.s);
            });
            return xOptions;
        }
        
        // Create an iframe & add it to the document
        var frame = $("<iframe />").appendTo(head),
        
        // Get the iframe's window and document objects
        tmp = frame[0],
        window = tmp.contentWindow || tmp.contentDocument,
        document = window.document,
        
        // Flag to know if the request has been treated
        done = 0,
        
        // Declaration of cleanup function
        cleanUp,
        
        // Error function
        errorFunction = function (_,type) {
            // If pure error (not timeout), cache if needed
            pageCacheFlag && !defined(type) && (pageCache[finalUrl] = {e: 1}); 
            // Cleanup
            cleanUp();
            // Call error then complete
            notifyError(defined(type)?type:error);
        },
        
        // Cleaning function
        removeVariable = function(varName) {
            window[varName] = undefined;
            try { delete window[varName]; } catch(_) {}
        },
        
        // Error callback name
        errorCallbackName = successCallbackName=="E"?"X":"E";
        
        // Control if we actually retrieved the document
        if(!defined(document)) {
            document = window;
            window = document.getParentNode();
        }
        
        // We have to open the document before
        // declaring variables in the iframe's window
        // Don't ask me why, I have no clue
        document.open();
        
        // Install callbacks
        
        window[successCallbackName] = function(json) {
            // Set as treated
            done = 1;
            pageCacheFlag && (pageCache[finalUrl] = {s: json});
            // Give hand back to frame
            // To finish gracefully
            later(function(){
                // Cleanup
                cleanUp();
                // Call success then complete
                notifySuccess(json);
            });
        };
        
        window[errorCallbackName] = function(state) {
            // If not treated, mark
            // then give hand back to iframe
            // for it to finish gracefully
            (!state || state=="complete") && !done++ && later(errorFunction);
        };
        
        // Clean up function (declaration)
        xOptions.abort = cleanUp = function() {
            removeVariable(errorCallbackName);
            removeVariable(successCallbackName);
            document.open()
            document.write(empty);
            document.close();
            frame.remove();
        };
        
        // Write to the iframe (sends the request)
        // We let the hand to current code to avoid
        // pre-emptive callbacks
        
        // We also install the timeout here to avoid
        // timeout before the code has been dumped to the frame
        // (in case of insanely short timeout values)
        later(function() {
            // Write to the document
            document.write([
                '<html><head><script src="',
                finalUrl,'" onload="',
                errorCallbackName,'()" onreadystatechange="',
                errorCallbackName,'(this.readyState)"></script></head><body onload="',
                errorCallbackName,'()"></body></html>'
            ].join(empty)
            );
            // Close (makes some browsers happier)
            document.close();
            // If a timeout is needed, install it
            timeout>0 && setTimeout(function(){
                    !done && errorFunction(empty,"timeout");
            },timeout);
        });
        
        return xOptions;
    }
    
    // ###################### SETUP FUNCTION ##
    jsonp.setup = function(xOptions) {
        $.extend(xOptionsDefaults,xOptions);
    };

    // ###################### INSTALL in jQuery ##
    $.jsonp = jsonp;
    
})(jQuery);

/**
 * jQuery Twitter API
 * 
 * Copyright (C) 2009  Stéphane Roucheray stephane.roucheray [a] free.fr
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */


(function($){

var base_url    = "http://twitter.com/",
search_base_url = "http://search.twitter.com/",
urls = {
    search         : search_base_url + "search",
    help_test      : base_url + "help/test",
    
    trends         : search_base_url + "trends",
    trends_current : search_base_url + "trends/current",
    trends_daily   : search_base_url + "trends/daily",
    trends_weekly  : search_base_url + "trends/weekly",
    
    statuses_public_timeline  : base_url + "statuses/public_timeline",
    statuses_friends_timeline : base_url + "statuses/friends_timeline",
    statuses_user_timeline    : base_url + "statuses/user_timeline",
    statuses_mentions         : base_url + "statuses/mentions",
    statuses_show             : base_url + "statuses/show",
    statuses_update           : base_url + "statuses/update",
    statuses_destroy          : base_url + "statuses/destroy",
    statuses_friends          : base_url + "statuses/friends",
    statuses_followers        : base_url + "statuses/followers",
    
    users_show : base_url + "users/show",
    
    direct_messages      : base_url + "direct_messages",
    direct_messages_sent : base_url + "direct_messages/sent",
    direct_messages_new  : base_url + "direct_messages/new",
    direct_messages      : base_url + "direct_messages/destroy",
    
    friendship_create    : base_url + "friendships/create",
    friendship_destroy   : base_url + "friendships/destroy",
    friendship_exists    : base_url + "friendships/exists",
    
    friends_ids          : base_url + "friends/ids",
    followers_ids        : base_url + "followers/ids",
    
    account_verify_credentials               : base_url + "account/verify_credentials",
    account_rate_limit_status                : base_url + "account/rate_limit_status",
    account_end_session                      : base_url + "account/end_session",
    account_update_delivery_device           : base_url + "account/update_delivery_device",
    account_update_profile_colors            : base_url + "account/update_profile_colors",
    account_update_profile_image             : base_url + "account/update_profile_image",
    account_update_profile_background_image  : base_url + "account/",
    account_update_profile                   : base_url + "account/update_profile/update_profile_background_image",
    
    favorites              : base_url + "favorites",
    favorites_create       : base_url + "favorites/create/",
    favorites_destroy      : base_url + "favorites/destroy",
     
    notifications_follow   : base_url + "notifications/follow",
    notifications_leave    : base_url + "notifications/leave",
    
    blocks_create          : base_url + "blocks/create",
    blocks_destroy         : base_url + "blocks/destroy",
    blocks_exists          : base_url + "blocks/exists",
    blocks_blocking        : base_url + "blocks/blocking",
    blocks_ids             : base_url + "blocks/blocking/ids",
    
    saved_searches         : base_url + "saved_searches",
    saved_searches_show    : base_url + "saved_searches/show",
    saved_searches_create  : base_url + "saved_searches/create",
    saved_searches_destroy : base_url + "saved_searches/destroy",
    
    oauth_request_token    : base_url + "oauth/request_token",
    oauth_authorize        : base_url + "oauth/authorize",
    oauth_authenticate     : base_url + "oauth/authenticate",
    oauth_access_token     : base_url + "oauth/access_token"
    
};

//Generic private methods to build requests
// parameters : $.ajax method specific parameters
// data : data encoded in the get url string
function request(parameters /* Object */, data /* Object */){
    parameters = $.extend({
        data:data
    }, parameters);
    
    parameters.url = parameters.url + ".json";

    //Bug in jQuery with jsonp, if "jsonp" plugin is present then use it  
    if ($.jsonp && $.isFunction($.jsonp)) {
        parameters.url += "?callback=?";
        $.jsonp(parameters);
    }else{
        parameters.dataType = "jsonp";
        $.ajax( parameters );
    }
};

// Delete all parameters Object properties not specified in the authorized Array
function cleanupParam(parameters /* Object */, authorized /* Array */){
    if (parameters) {
        $.each(parameters, function(key, value){
            if ($.inArray(key, authorized) == -1) {
                delete parameters[key];
            }
        });
    }
    
    return parameters || {};
}

// Delete non wanted 
function getAjaxParam(options, url, success){
    var ajaxParams = [
        "async",
        "cache",
        "complete",
        "contentType",
    //  "data",   // In our case, data is set outside this object
        "dataFilter",
    //  "dataType", // Always jsonp
        "error",
        "global",
        "ifModified",
    //  "jsonp", // callback name must not be renamed
        "password",
        "processData",
        "scriptCharset",
    //  "success", // In our case, success is set outside this object
        "timeout",
    //  "type", // Type, GET or POST, is determined by the calling method
    //  "url", //  User not need to set the url
        "username",
        "xhr"],
        
    output = {};
    if (ajaxParams && options) {
        //Delete extra parameters
        $.each(options, function(key, value){
            if ($.inArray(key, ajaxParams) != -1) {
                output[key] = value;
            }
        });
    }
    
    output.url = url;
    output.success = success;
    
    return output;
}

/* 
 * Generic twitter object method 
 */
$.twitter = {

    /* Help Methods */
    test : function(callback, options){
        var ajaxParam = getAjaxParam(options, urls.help_test, callback);
        request(ajaxParam);
    },

    /* Search API Methods */ 
    search : function(query, callback, options){
        // From options, extract jQuery Ajax param
        // And add the url and the callback method 
        var ajaxParam = getAjaxParam(options, urls.search, callback);
        
        // From options cleanup non Twitter params
        options = cleanupParam(
            options, 
            ["callback","lang","rpp","page","since_id","geocode","show_user"]
        );
                    
        // Limit search to 140 characters
        // And add the query to the options
        options = $.extend(
            {
                q : query.substr(0, 140)
            },options
        );
        
        
        // Make the request
        request(ajaxParam, options);
    },
    
    /* Trends main method */
    trends : function(callback, options){
        var ajaxParam = getAjaxParam(options, urls.trends, callback);
        request(ajaxParam);
    },
    
    statuses : {}, //No direct function
    
    users : {}, //No direct function
    
    direct_messages : function(){}, //TODO: implements
    
    friendships : {}, //No direct function
    
    friends : {}, //No direct function
    
    followers : {}, //No direct function
    
    account : {}, //No direct function
    
    favorites : function(){}, //TODO: implements
    
    notifications : {}, //No direct function
    
    blocks : {},
    
    saved_searches : function(){}, //TODO: implements
    
    oauth : {}  //No direct function
    
};

/* Simple searches */
$.twitter.search.user = function(username, callback, options){
    $.twitter.search("from:"+username, callback, options);
};
    
$.twitter.search.repliesTo = function(username, callback, options){
    $.twitter.search("to:"+username, callback, options);
};
    
$.twitter.search.mentioned = function(username, callback, options){
    $.twitter.search("@"+username, callback, options);
};
    
$.twitter.search.hashtag = function(hashtag, callback, options){
    $.twitter.search("#"+hashtag, callback, options);
};

/* Specifics trends */
$.twitter.trends.current = function(callback, options){
    // From options, extract jQuery Ajax param
    // And add the url and the callback method 
    var ajaxParam = getAjaxParam(options, urls.trends_current, callback);
    
    // From options cleanup non Twitter params      
    options = cleanupParam(
        options, 
        ["exclude"]
    );
    
    request(ajaxParam, options);
};
$.twitter.trends.daily = function(callback){//TODO: implements options
    request(
        {
            url: urls.trends_daily,
            success: callback
        }
    );
};
$.twitter.trends.weekly = function(callback){//TODO: implements options
    request(
        {
            url: urls.trends_weekly,
            success: callback
        }
    );
};

/* Timeline Methods */

$.twitter.statuses.publicTimeline = function(callback, options){
    var ajaxParam = getAjaxParam(options, urls.statuses_public_timeline, callback);
    request(ajaxParam);
};

/* Status Methods */

//Requires authentication if the author of the status is protected
$.twitter.statuses.show = function(userid, callback, options){
    var ajaxParam = getAjaxParam(options, urls.statuses_show + "/" + userid, callback);
    request(ajaxParam);
};

/* User Methods */

$.twitter.users.show = function(userid, callback, options){ 
    //TODO : check userid is number until
    if (userid){
        options.user_id = userid;
    }
    
    var ajaxParam = getAjaxParam(options, urls.users_show + "/" + userid, callback);
    
    options = cleanupParam(
            options, 
            ["id","user_id","screen_name"]
        );

    request(ajaxParam, options);
};


$.twitter.statuses.friends = function(userid, callback, options){
    if (userid){
        options.user_id = userid;
    }
    
    var ajaxParam = getAjaxParam(options, urls.statuses_friends + "/" + userid, callback);
    
    options = cleanupParam(
            options, 
            ["id","user_id","screen_name", "page"]
        );
        
    request(ajaxParam, options);
};

/* Social Graph Methods */
$.twitter.friends.ids = function(userid, callback, options){
    if (userid){
        options.user_id = userid;
    }
    
    var ajaxParam = getAjaxParam(options, urls.friends_ids + "/" + userid, callback);
    
    options = cleanupParam(
            options, 
            ["id","user_id","screen_name", "page"]
        );
        
    request(ajaxParam, options);
};
$.twitter.followers.ids = function(userid, callback, options){
    if (userid){
        options.user_id = userid;
    }
    
    var ajaxParam = getAjaxParam(options, urls.followers_ids + "/" + userid, callback);
    
    options = cleanupParam(
            options, 
            ["id","user_id","screen_name", "page"]
        );
        
    request(ajaxParam, options);
};

//Only for IP rate limit status
$.twitter.account.rateLimitStatus = function(callback, options){
    var ajaxParam = getAjaxParam(options, urls.account_rate_limit_status, callback);
    
    request(ajaxParam);
};

})(jQuery);


/*
 * jQuery Color Animations
 * Copyright 2007 John Resig
 * Released under the MIT and GPL licenses.
 */

(function(jQuery){

    // We override the animation for all of these color styles
    jQuery.each(['backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'color', 'outlineColor'], function(i,attr){
        jQuery.fx.step[attr] = function(fx){
            if ( fx.state == 0 ) {
                fx.start = getColor( fx.elem, attr );
                fx.end = getRGB( fx.end );
            }

            fx.elem.style[attr] = "rgb(" + [
                Math.max(Math.min( parseInt((fx.pos * (fx.end[0] - fx.start[0])) + fx.start[0]), 255), 0),
                Math.max(Math.min( parseInt((fx.pos * (fx.end[1] - fx.start[1])) + fx.start[1]), 255), 0),
                Math.max(Math.min( parseInt((fx.pos * (fx.end[2] - fx.start[2])) + fx.start[2]), 255), 0)
            ].join(",") + ")";
        }
    });

    // Color Conversion functions from highlightFade
    // By Blair Mitchelmore
    // http://jquery.offput.ca/highlightFade/

    // Parse strings looking for color tuples [255,255,255]
    function getRGB(color) {
        var result;

        // Check if we're already dealing with an array of colors
        if ( color && color.constructor == Array && color.length == 3 )
            return color;

        // Look for rgb(num,num,num)
        if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
            return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];

        // Look for rgb(num%,num%,num%)
        if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
            return [parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];

        // Look for #a0b1c2
        if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
            return [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];

        // Look for #fff
        if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
            return [parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];

        // Otherwise, we're most likely dealing with a named color
        return colors[jQuery.trim(color).toLowerCase()];
    }
    
    function getColor(elem, attr) {
        var color;

        do {
            color = jQuery.curCSS(elem, attr);

            // Keep going until we find an element that has color, or we hit the body
            if ( color != '' && color != 'transparent' || jQuery.nodeName(elem, "body") )
                break; 

            attr = "backgroundColor";
        } while ( elem = elem.parentNode );

        return getRGB(color);
    };
    
    // Some named colors to work with
    // From Interface by Stefan Petre
    // http://interface.eyecon.ro/

    var colors = {
        aqua:[0,255,255],
        azure:[240,255,255],
        beige:[245,245,220],
        black:[0,0,0],
        blue:[0,0,255],
        brown:[165,42,42],
        cyan:[0,255,255],
        darkblue:[0,0,139],
        darkcyan:[0,139,139],
        darkgrey:[169,169,169],
        darkgreen:[0,100,0],
        darkkhaki:[189,183,107],
        darkmagenta:[139,0,139],
        darkolivegreen:[85,107,47],
        darkorange:[255,140,0],
        darkorchid:[153,50,204],
        darkred:[139,0,0],
        darksalmon:[233,150,122],
        darkviolet:[148,0,211],
        fuchsia:[255,0,255],
        gold:[255,215,0],
        green:[0,128,0],
        indigo:[75,0,130],
        khaki:[240,230,140],
        lightblue:[173,216,230],
        lightcyan:[224,255,255],
        lightgreen:[144,238,144],
        lightgrey:[211,211,211],
        lightpink:[255,182,193],
        lightyellow:[255,255,224],
        lime:[0,255,0],
        magenta:[255,0,255],
        maroon:[128,0,0],
        navy:[0,0,128],
        olive:[128,128,0],
        orange:[255,165,0],
        pink:[255,192,203],
        purple:[128,0,128],
        violet:[128,0,128],
        red:[255,0,0],
        silver:[192,192,192],
        white:[255,255,255],
        yellow:[255,255,0]
    };
    
})(jQuery);