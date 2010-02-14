(function($){
    $.extend($.fx.step, {
        backgroundPosition: function(fx) {
            if(fx.state === 0 && typeof fx.end == 'string'){
                var start = $.curCSS(fx.elem, 'backgroundPosition');
                start = toArray(start);
                fx.start = [start[0], start[2]];
                var end = toArray(fx.end);
                fx.end = [end[0], end[2]];
                fx.unit = [end[1], end[3]];
            }
            var nowPosX = [];
            nowPosX[0] = ((fx.end[0] - fx.start[0]) * fx.pos) + fx.start[0] + fx.unit[0];
            nowPosX[1] = ((fx.end[1] - fx.start[1]) * fx.pos) + fx.start[1] + fx.unit[1];
            fx.elem.style.backgroundPosition = nowPosX[0] + ' ' + nowPosX[1];

           function toArray(strg){
               strg = strg.replace(/left|top/g, '0px');
               strg = strg.replace(/right|bottom/g, '100%');
               strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g, '$1px$2');
               var res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
               return [parseFloat(res[1], 10), res[2], parseFloat(res[3],10), res[4]];
           }
        }
    });
})(jQuery)

$(document).ready(function(){
    
    $('.share-items')
        .hide()
    
    $('a[href*=#]').click(function() {
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
    
    $('a[rel*=external]').click( function() {
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
    
    $('ul#nav-menu li.nav-item  a').each(function(){
        var backgroundPositionX = $(this).css('backgroundPosition').split(' ')[0];
        $(this)
            .mouseover(function(){
                $(this)
                    .stop()
                    .animate({backgroundPosition: '('+ backgroundPositionX +' -17px)'}, {duration: 300});
            })
            .mouseout(function(){
                $(this)
                    .stop()
                    .animate({backgroundPosition: '('+ backgroundPositionX +' 0)'}, {duration: 300});
            });
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
    
    
    // function updateTwitterContainer(object, results){
    //     if(results.length > 0){
    //         var result = results[0];
    //         object
    //             .find('p')
    //             .html(
    //                 '<a href="http://twitter.com/'
    //                 + object.attr('id')
    //                 +'/status/'
    //                 + result.id 
    //                 +'" title="status '
    //                 + result.id +'">'
    //                 + result.text + '</a>'
    //             );
    //     }
    // }
    // 
    // $(".twitter-container-account").each(function(){
    //     var _this = $(this);
    //     $.twitter.search.user($(this).attr('id'), function(data, textStatus){
    //         updateTwitterContainer(_this, data.results);
    //     });
    // })
    // 
    // $.twitter.search.hashtag("apluggedinlife", function(data, textStatus){
    //     updateTwitterContainer($("#apluggedinlife-hashtag"), data.results);
    // });
});
