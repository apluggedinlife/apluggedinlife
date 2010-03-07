import os.path

def serve_download(view_func):
    def _wrapped_view_func(request, *args, **kwargs):
        response = view_func(request, *args, **kwargs)
        response['Content-Type'] = 'application/octet-stream';
        response['Content-Disposition'] = 'attachment; filename="%s"' % os.path.basename(kwargs['path'])
        return response
    return _wrapped_view_func