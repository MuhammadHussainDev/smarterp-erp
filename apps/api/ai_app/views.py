import json
from django.http import JsonResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .serializers import ChatRequestSerializer, InsightSerializer
from inventory.models import Product, Stock
from sales.models import Invoice
from datetime import datetime, timedelta


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat(request):
    serializer = ChatRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    message = serializer.validated_data['message'].lower()
    context = serializer.validated_data.get('context', '')

    responses = {
        'hello': 'Hello! How can I help you with your ERP today?',
        'hi': 'Hi there! I\'m your SmartERP AI assistant. What do you need?',
        'help': 'I can help with: dashboard insights, inventory queries, sales data, and more. Try asking about stock levels or recent sales!',
    }

    for key, resp in responses.items():
        if key in message:
            return Response({'response': resp, 'type': 'text'})

    if 'stock' in message or 'inventory' in message:
        low_stock = Stock.objects.filter(quantity__lt=10).select_related('product', 'warehouse')[:5]
        if low_stock:
            items = [{'product': s.product.name, 'warehouse': s.warehouse.name, 'quantity': s.quantity} for s in low_stock]
            return Response({
                'response': f'Found {len(low_stock)} low-stock items:',
                'type': 'table',
                'data': items
            })
        return Response({'response': 'All stock levels are healthy.', 'type': 'text'})

    if 'sale' in message or 'revenue' in message or 'invoice' in message:
        recent = Invoice.objects.filter(created_at__gte=datetime.now() - timedelta(days=30))
        total = sum(i.grand_total for i in recent)
        count = recent.count()
        return Response({
            'response': f'Last 30 days: {count} invoices, total ${total:,.2f}',
            'type': 'text'
        })

    return Response({
        'response': 'I understand your query. For detailed analytics, please visit the Reporting dashboard.',
        'type': 'text'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def insights(request):
    low_stock_count = Stock.objects.filter(quantity__lt=10).count()
    recent_invoices = Invoice.objects.filter(
        created_at__gte=datetime.now() - timedelta(days=30)
    )
    total_revenue = sum(i.grand_total for i in recent_invoices)

    return Response({
        'insights': [
            {
                'type': 'warning',
                'title': 'Low Stock Alert',
                'description': f'{low_stock_count} products are below minimum stock level.',
                'data': {'count': low_stock_count}
            },
            {
                'type': 'info',
                'title': 'Revenue Overview',
                'description': f'Total revenue in last 30 days: ${total_revenue:,.2f}',
                'data': {'revenue': total_revenue}
            },
            {
                'type': 'success',
                'title': 'System Status',
                'description': 'All systems operational.',
                'data': {'status': 'healthy'}
            },
        ]
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def suggestions(request, context):
    from inventory.models import Product
    suggestions_list = []
    if context == 'product':
        products = Product.objects.filter(tenant=request.user.tenant)[:5]
        for p in products:
            suggestions_list.append({'id': p.id, 'label': p.name, 'value': p.name})
    return Response(suggestions_list)
