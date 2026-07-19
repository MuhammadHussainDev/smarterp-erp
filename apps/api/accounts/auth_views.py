import uuid
from datetime import datetime, timedelta
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, RefreshToken as RefreshTokenModel


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'message': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email, status='ACTIVE')
    except User.DoesNotExist:
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.check_password(password):
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    refresh_record = RefreshTokenModel.objects.create(
        user=user,
        token=str(refresh),
        expires_at=datetime.now() + timedelta(days=7)
    )

    user.last_login = datetime.now()
    user.save()

    return Response({
        'user': {
            'id': user.id,
            'email': user.email,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'tenantId': user.tenant_id,
        },
        'accessToken': access_token,
        'refreshToken': str(refresh),
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    tenant_id = request.data.get('tenantId')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('firstName')
    last_name = request.data.get('lastName')

    if User.objects.filter(email=email).exists():
        return Response({'message': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    user = User(
        tenant_id=tenant_id,
        email=email,
        first_name=first_name,
        last_name=last_name,
    )
    user.set_password(password)
    user.save()

    return Response({'message': 'User created successfully', 'userId': user.id}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    token = request.data.get('refreshToken')
    if not token:
        return Response({'message': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        refresh = RefreshToken(token)
        return Response({
            'accessToken': str(refresh.access_token),
        })
    except Exception:
        return Response({'message': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({
        'id': user.id,
        'email': user.email,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'tenantId': user.tenant_id,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    from crm.models import Customer, Lead
    from inventory.models import Product
    from sales.models import Invoice
    from hr.models import Employee
    from accounting.models import Account

    tenant = request.user.tenant

    return Response({
        'overview': {
            'totalUsers': User.objects.filter(tenant=tenant).count(),
            'totalCustomers': Customer.objects.filter(tenant=tenant).count(),
            'totalProducts': Product.objects.filter(tenant=tenant).count(),
            'totalEmployees': Employee.objects.filter(tenant=tenant).count(),
            'totalInvoices': Invoice.objects.filter(tenant=tenant).count(),
            'totalAccounts': Account.objects.filter(tenant=tenant).count(),
            'totalBranches': tenant.branches.count(),
            'totalDepartments': tenant.departments.count(),
        },
        'recentActivity': [],
    })
