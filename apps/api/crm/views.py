from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
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

    @action(detail=True, methods=['post'])
    def convert(self, request, pk=None):
        lead = self.get_object()
        customer, created = Customer.objects.get_or_create(
            tenant=lead.tenant,
            name=f"{lead.first_name} {lead.last_name}",
            defaults={
                'email': lead.email,
                'phone': lead.phone,
                'tenant': lead.tenant,
            }
        )
        lead.customer = customer
        lead.status = 'CONVERTED'
        lead.save()
        return Response(CustomerSerializer(customer).data, status=status.HTTP_201_CREATED)


class OpportunityViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer

    @action(detail=False, methods=['get'])
    def pipeline(self, request):
        opportunities = self.get_queryset()
        stages = {}
        for opp in opportunities:
            stage = opp.stage or 'LEAD'
            if stage not in stages:
                stages[stage] = []
            stages[stage].append(OpportunitySerializer(opp).data)
        return Response(stages)


class MeetingViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer


class NoteViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
