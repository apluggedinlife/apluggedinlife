from django.conf import settings
from django.views.generic import date_based
from django.http import HttpRequest
from django.template import Node, TemplateSyntaxError, VariableDoesNotExist, Library, Variable

from basic.blog.models import Post

register = Library()

class GetPostsForArchiveNode(Node):
    def __init__(self, archive_date):
        self.archive_date = Variable(archive_date)
        super(GetPostsForArchiveNode, self).__init__()
    
    def render(self, context):
        try:
            archive_date = self.archive_date.resolve(context)
            
            response = date_based.archive_month(
                context['request'],
                year = archive_date.year,
                month = archive_date.strftime("%b"),
                date_field = 'publish',
                queryset = Post.objects.published(),
                template_name = "blog/archive_post_list.html"
            )
            return response._container[0]
        except VariableDoesNotExist, e:
            raise e

def get_posts_for_archive(parser, token):
    """docstring for posts_for_archive"""
    bits = token.contents.split()
    return GetPostsForArchiveNode(bits[1])

register.tag(get_posts_for_archive)