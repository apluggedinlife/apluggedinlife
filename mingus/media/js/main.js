(function($){
    $.extend($.fx.step, {
        backgroundPosition: function(fx){
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
    
    $('.share h1')
        .click(function(){
           $(this)
                .siblings('.share-items')
                .slideDown();
        });
    
    $('ul#nav-menu li.nav-item-current a')
        .css({backgroundPosition: 'bottom left'});
    
    $('ul#nav-menu li.nav-item  a')
        .css({backgroundPosition: '0 0'})
        .mouseover(function(){
            $(this)
                .stop()
                .animate({backgroundPosition: '(0 -17px)'}, {duration: 300});
        })
        .mouseout(function(){
            $(this)
                .stop()
                .animate({backgroundPosition: '(0 0)'}, {duration: 300});
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
    
    $('#twitter ul li,div.share-right,div.share-left').hover(function(){
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
});