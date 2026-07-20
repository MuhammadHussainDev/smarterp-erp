from rest_framework import viewsets
from tenant_mixin import TenantViewSetMixin
from .models import Customer, Contact, Lead, Opportunity, Meeting, Note
from .serializers import (CustomerSerializer, ContactSerializer, LeadSerializer,
                          OpportunitySerializer, MeetingSerializer, NoteSerializer)


class CustomerViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class ContactViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer


class LeadViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer


class OpportunityViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer


class MeetingViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer


class NoteViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
