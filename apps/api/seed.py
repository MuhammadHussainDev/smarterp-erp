import uuid
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smarterp.settings')
django.setup()

from tenants.models import Tenant, SubscriptionPlan
from accounts.models import User, Role, UserRole
from crm.models import Customer
from inventory.models import Category, Brand, Unit, Product, Warehouse, Stock
from hr.models import LeaveType, Employee
from accounting.models import Account
from settings_app.models import Company, Branch, Department


def seed():
    print('Seeding database...')

    tenant, _ = Tenant.objects.get_or_create(
        slug='acme-corp',
        defaults={
            'name': 'Acme Corp',
            'currency': 'USD',
            'timezone': 'UTC',
            'status': 'ACTIVE',
        }
    )
    print(f'  Tenant: {tenant.name}')

    plan, _ = SubscriptionPlan.objects.get_or_create(
        name='Enterprise',
        defaults={
            'price_monthly': 99.99,
            'price_yearly': 999.99,
            'max_users': 100,
            'max_branches': 10,
            'is_active': True,
        }
    )
    print(f'  Plan: {plan.name}')

    admin_user, created = User.objects.get_or_create(
        email='admin@smarterp.com',
        defaults={
            'tenant': tenant,
            'first_name': 'Admin',
            'last_name': 'User',
            'status': 'ACTIVE',
            'email_verified': True,
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
    print(f'  Admin user: {admin_user.email}')

    admin_role, _ = Role.objects.get_or_create(
        tenant=tenant,
        name='Admin',
        defaults={
            'description': 'Full system access',
            'is_system': True,
            'permissions': '["all"]',
        }
    )
    UserRole.objects.get_or_create(user=admin_user, role=admin_role)
    print(f'  Role: {admin_role.name}')

    Company.objects.get_or_create(
        tenant=tenant,
        defaults={
            'name': tenant.name,
            'currency': 'USD',
            'timezone': 'UTC',
        }
    )
    print('  Company settings created')

    Branch.objects.get_or_create(
        tenant=tenant,
        name='Head Office',
        defaults={
            'address': '123 Main St',
            'phone': '+1-555-0100',
            'email': 'ho@acme.com',
            'is_active': True,
        }
    )
    print('  Branch created')

    Department.objects.get_or_create(
        tenant=tenant,
        name='General',
        defaults={
            'description': 'General department',
            'is_active': True,
        }
    )
    print('  Department created')

    for account_data in [
        {'code': '1000', 'name': 'Cash', 'type': 'ASSET'},
        {'code': '2000', 'name': 'Accounts Payable', 'type': 'LIABILITY'},
        {'code': '3000', 'name': 'Owner Equity', 'type': 'EQUITY'},
        {'code': '4000', 'name': 'Sales Revenue', 'type': 'REVENUE'},
        {'code': '5000', 'name': 'Cost of Goods Sold', 'type': 'EXPENSE'},
    ]:
        Account.objects.get_or_create(
            tenant=tenant,
            code=account_data['code'],
            defaults=account_data
        )
    print('  Accounts created')

    for cat_name in ['Electronics', 'Office Supplies', 'Furniture']:
        Category.objects.get_or_create(
            tenant=tenant,
            name=cat_name,
            defaults={'description': f'{cat_name} category', 'is_active': True}
        )
    print('  Categories created')

    for brand_name in ['Generic', 'Premium', 'Eco']:
        Brand.objects.get_or_create(
            tenant=tenant,
            name=brand_name,
            defaults={'description': f'{brand_name} brand', 'is_active': True}
        )
    print('  Brands created')

    for unit_name, abbr in [('Piece', 'pc'), ('Box', 'bx'), ('Kilogram', 'kg')]:
        Unit.objects.get_or_create(
            tenant=tenant,
            name=unit_name,
            defaults={'abbreviation': abbr}
        )
    print('  Units created')

    wh, _ = Warehouse.objects.get_or_create(
        tenant=tenant,
        name='Main Warehouse',
        defaults={
            'address': '456 Warehouse Ave',
            'is_default': True,
            'is_active': True,
        }
    )
    print(f'  Warehouse: {wh.name}')

    category = Category.objects.filter(tenant=tenant).first()
    brand = Brand.objects.filter(tenant=tenant).first()
    unit = Unit.objects.filter(tenant=tenant).first()

    for i in range(1, 4):
        product, created = Product.objects.get_or_create(
            tenant=tenant,
            sku=f'SKU-{i:04d}',
            defaults={
                'name': f'Sample Product {i}',
                'category': category,
                'brand': brand,
                'unit': unit,
                'cost_price': 10.0 * i,
                'selling_price': 25.0 * i,
                'is_active': True,
            }
        )
        if created:
            Stock.objects.create(
                tenant=tenant,
                warehouse=wh,
                product=product,
                quantity=100 * i
            )
    print('  Products and stock created')

    Customer.objects.get_or_create(
        tenant=tenant,
        name='Walk-in Customer',
        defaults={
            'email': 'walkin@example.com',
            'phone': '+1-555-9999',
            'currency': 'USD',
        }
    )
    print('  Default customer created')

    LeaveType.objects.get_or_create(
        tenant=tenant,
        name='Annual Leave',
        defaults={'days_allowed': 20}
    )
    LeaveType.objects.get_or_create(
        tenant=tenant,
        name='Sick Leave',
        defaults={'days_allowed': 10}
    )
    print('  Leave types created')

    print('Seed completed successfully!')


if __name__ == '__main__':
    seed()
