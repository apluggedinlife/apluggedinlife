$(document).ready(function () {
    var MpttComment = {
        commentsLoaded: [],
        repliesLoaded: [],
        
        init: function () {
            this.commentPk = new RegExp("comment-(\\d+)", "");
            this.posted = new RegExp("this_is_a_comment", "g");
            
            var _this = this;
            $('#comments-more').bind("click", function () {
                $.get($(this).attr('href') + '?is_ajax=1', {}, function (data, textStatus) {
                    var commentsForUpdate = data.comments_for_update;
                    if (commentsForUpdate) {
                        var comment;
                        for (var c = 0; c < commentsForUpdate.length; c++) {
                            comment = commentsForUpdate[c];
                            $('.comment-level-' + (comment.level - 1))
                                .append(comment.html);
                        }
                    }
                    var commentsTree = data.comments_tree;
                    if (commentsTree) {
                        $('#mptt-comments-tree')
                            .append(commentsTree.html);
                    }
                    commentsLoaded = $('.comment');
                    var remainingCount = data.remaining_count;
                    if (remainingCount > 0) {
                        $('#comments-more-remaining').html(remainingCount);
                        var _href = $('#comments-more').attr('href');
                        $('#comments-more').attr(
                            'href', 
                            _href.replace(
                                new RegExp("\\d+/$"), 
                                parseInt(_this.commentPk.exec(
                                    $(commentsLoaded[commentsLoaded.length - 1])
                                    .attr('id'))[1]) + '/'
                                )
                        );
                    } else {
                        $('#comments-more')
                            .parent()
                            .hide();
                    }
                    _this.replies();
                },
                "json");
                return false;
            });
            
            $('.new-comment-form-wrapper').each(function () {
                var nxt = $(this);
                var frm = $('form', nxt);
                _this.submit(frm, nxt);
            });
            
            this.replies();
        },
        
        submit: function (form, nxt) {
            var _this = this;
            var postData = {}
            $("input[type=submit]", form).bind("mousedown", function () {
                postData = {};
                postData[this.name] = this.value;
            });

            form.bind("submit", function () {
                var dataDict = $(":input", form).serializeArray();
                $.each(dataDict, function () {
                    postData[this.name] = this.value;
                });

                postData['is_ajax'] = 1;
                $.post(form.attr("action"), postData, function (data, textStatus) {
                    if (_this.posted.test(data)) {
                        if (nxt.hasClass('new-comment-form-wrapper')) {
                            $('#mptt-comments-tree').append(data);
                            nxt.replaceWith('<p>{% trans "Your comment was posted." %}</p>');
                        } else {
                            nxt.replaceWith(data);
                            _this.replies();
                        }
                    } else {
                        nxt.empty();
                        nxt.append(data);
                        nxt.slideDown("slow");
                        var newForm = $("form", nxt);
                        _this.submit(newForm, nxt);
                    }
                }, "html");
                return false;
            });
        },
        
        replies: function () {
            var _this = this;
            $('.comment-reply').each(function () {
                 var parent = $(this).parents('.comment-whole:first');
                 parent.after('<div class="comment-form-wrapper"></div>');
                 $(this).click(function (e) {
                     $('.comment-form-wrapper').slideUp("slow");
                     $.get($(this).attr('href') + '?is_ajax=1', function (data, textStatus) {
                         var nxt = parent.next('.comment-form-wrapper');
                         nxt.empty();
                         nxt.append(data);
                         nxt.slideDown("slow");
                         var form = $("form", nxt);
                         _this.submit(form, nxt);
                     }, "html");
                     return false;
                 });
             });

             $('.comment-replies').each(function () {
                 var elem = $(this);
                 elem
                     .unbind('click')
                     .bind('click', function (e) {
                         var href = $(this).attr('href') + '?is_ajax=1';
                         if ($.inArray(href, _this.repliesLoaded) == -1) {
                             $.get(href, {}, function (data, textStatus) {
                                 var commentsTree = data.comments_tree;
                                 if (commentsTree) {
                                     elem
                                         .parents('.comment:first')
                                         .append(commentsTree.html);
                                 }
                                 _this.repliesLoaded.push($(this).get(0).url);
                                 _this.replies();
                             }, "json");
                         }
                         return false;
                     });
             });
        }
    }
    
    MpttComment.init(); // intercept links
});