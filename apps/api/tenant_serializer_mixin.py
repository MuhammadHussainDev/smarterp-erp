class TenantSerializerMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'tenant' in self.fields:
            self.fields['tenant'].read_only = True
