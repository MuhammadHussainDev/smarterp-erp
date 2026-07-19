from rest_framework import viewsets
from .models import Customer, Contact, Lead, Opportunity, Meeting, Note
from .serializers import (CustomerSerializer, ContactSerializer, LeadSerializer,
                          OpportunitySerializer, MeetingSerializer, NoteSerializer)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filterset_fields = ['tenant', 'currency']
    search_fields = ['name', 'company_name', 'email', 'phone']


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    filterset_fields = ['tenant', 'customer', 'is_primary']
    search_fields = ['first_name', 'last_name', 'email']


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    filterset_fields = ['tenant', 'status', 'source']
    search_fields = ['first_name', 'last_name', 'email', 'company']


class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer
    filterset_fields = ['tenant', 'stage', 'customer']
    search_fields = ['title']


class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer
    filterset_fields = ['tenant', 'customer']


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    filterset_fields = ['tenant', 'customer']
