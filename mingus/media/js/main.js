$(document).ready(function(){
    prettyPrint();

    $('.share-items')
        .hide();

    $('form#locale-switcher')
        .children('input[type=submit]')
        .hide()
        .end()
        .children('select[name=locale]')
        .change(function(){
            $(this).parent().submit();
        });

    $('a[href*=#]').click(function(){
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'')
            && location.hostname == this.hostname) {
            var $target = $(this.hash);
            $target = $target.length && $target || $('[name=' + this.hash.slice(1) +']');
            if ($target.length) {
                var targetOffset = $target.offset().top;
                $('html,body')
                    .animate({scrollTop: targetOffset}, 1000);
                return false;
            }
        }
    });

    $('a[rel*=external]').click( function(){
        window.open(this.href);
        return false;
    });

    $('.share h1')
        .click(function(){
           $(this)
                .siblings('.share-items')
                .slideToggle()
                .end()
                .toggleClass('share-hide')
        });

    $('ul li.title h2')
        .click(function(){
            $(this)
                .toggleClass('active')
                .parent()
                .find('ul')
                    .slideToggle();
        });

    $('ul li.title h2.active')
        .parent()
        .find('ul')
            .css({display: 'none'});

    $('#twitter ul li, div.share-items > div').hover(function(){
        $(this)
            .siblings(':not(".clear")')
            .stop()
            .fadeTo(500, 0.3);
    }, function(){
        $(this)
            .siblings(':not(".clear")')
            .stop()
            .fadeTo(500, 1);
    });

    $('#search-engine').hover(function(){
        $('#search-mentions')
            .children()
            .stop()
            .animate({color: '#FFFFFF'}, {duration: 500});
    }, function(){
        $('#search-mentions')
            .children()
            .stop()
            .animate({color: '#000000'}, {duration: 500});
    })

    $('.entry-meta ul li').hover(function(){
       $(this)
            .stop()
            .animate({left: "-10px"}, {duration: 500});
    }, function(){
        $(this)
            .stop()
            .animate({left: "0"}, {duration: 500});
    });

    function twitterize(text) {
        text = text.replace(/\bwww\.\w.\w/ig, 'http://$&');
        text = text.replace(/((https?|s?ftp|ssh)\:\/\/[^"\s\<\>]*[^.,;'">\:\s\<\>\)\]\!])/g, '<a href="$1">$1</a>');
        text = text.replace(/\B@([_a-z0-9]+)/ig, '@<a href="http://twitter.com/$1">$1</a>');
        text = text.replace(/\B#([_a-z0-9]+)/ig, '#<a href="http://twitter.com/search?q=$1">$1</a>');

        return text;
    }

    function updateTwitterContainer(object, results){
        if(results.length > 0){
            var result = results[0];
            object
                .find('p')
                .html(twitterize(result.text));
        }
    }

    $(".twitter-container-account").each(function(){
        var _this = $(this);
        $.twitter.search.user($(this).attr('id'), function(data, textStatus){
            updateTwitterContainer(_this, data.results);
        });
    })

    $.twitter.search.hashtag("apluggedinlife", function(data, textStatus){
        updateTwitterContainer($("#apluggedinlife-hashtag"), data.results);
    });
});
