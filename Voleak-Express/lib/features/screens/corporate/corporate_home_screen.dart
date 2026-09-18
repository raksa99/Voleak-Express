import 'package:flutter/material.dart';
import '../../../models/goods_model.dart';
import '../../../models/product_model.dart';
import '../../../models/cooperator_model.dart';
import '../../../core/theme/app_theme.dart';
import '../../../repositories/auth_repository.dart';
import '../../../repositories/goods_repository.dart';
import '../../../repositories/product_repository.dart';
import '../../../repositories/cooperator_repository.dart';
import '../../../core/error/result.dart';
import '../../auth/login_screen.dart';
import '../live_tracking_screen.dart';

class CorporateLocalizations {
  static const Map<String, Map<String, String>> _localizedValues = {
    'en': {
      'portalTitle': 'Corporate Portal',
      'portalSubtitle': 'Enterprise Logistics & Cargo Tracking',
      'searchHint': 'Search shipments, waybills, or receivers...',
      'totalWeight': 'Total Weight',
      'activeCargo': 'Active Cargo',
      'delivered': 'Delivered',
      'pending': 'Pending',
      'logout': 'Log Out',
      'logisticsInfo': 'Logistics Information',
      'weight': 'Weight',
      'sender': 'Sender',
      'receiver': 'Receiver',
      'phone': 'Phone',
      'status': 'Status',
      'route': 'Route',
      'truckPlate': 'Truck Plate',
      'trackLive': 'Track Live Vehicle',
      'goodsDetail': 'Cargo Details',
      'notAssigned': 'Trip Not Assigned',
      'estimatedArrival': 'Est. Arrival',
      'emptyState': 'No cargo shipments found matching filters.',
      'all': 'All',
      'inTransit': 'In Transit',
      'loaded': 'Loaded',
      'cancelled': 'Cancelled',
      'kg': 'kg',
      'ton': 'tons',
      'close': 'Close',
      // Tabs
      'shipmentsTab': 'Shipments',
      'productsTab': 'Products',
      'recordsTab': 'Analytics',
      'profileTab': 'Profile',
      // Corporate Profile
      'companyTier': 'VIP Platinum Partner',
      'taxId': 'Tax ID',
      'creditLimit': 'Credit Limit',
      'currentBalance': 'Current Balance',
      'paymentTerms': 'Payment Terms',
      'primaryCorridor': 'Primary Corridor',
      'contactPerson': 'Contact Director',
      'discountRate': 'Discount Rate',
      'companyAddress': 'SEZ Address',
      'editDetails': 'Edit Details',
      'changeLogo': 'Change Logo',
      // Products
      'productCatalog': 'Corporate Product Inventory',
      'searchProducts': 'Search SKUs or product categories...',
      'requestDispatch': 'Order Dispatch',
      'stockAtHub': 'Staged at Hub',
      'totalShipped': 'Total Shipped',
      // Analytics & Records
      'onTimeRate': 'On-Time Delivery',
      'completedWaybills': 'Completed Waybills',
      'avgTransitTime': 'Avg Transit Time',
      'totalSpend': 'Total Logistics Spend',
      'recentInvoices': 'Recent Payment Invoices',
      'downloadWaybill': 'Download PDF',
    },
    'km': {
      'portalTitle': 'បញ្ជរដៃគូសាជីវកម្ម',
      'portalSubtitle': 'ការតាមដានភស្តុភារ និងទំនិញក្រុមហ៊ុន',
      'searchHint': 'ស្វែងរកទំនិញ លិខិតដឹក ឬអ្នកទទួល...',
      'totalWeight': 'ទម្ងន់សរុប',
      'activeCargo': 'ទំនិញកំពុងដឹក',
      'delivered': 'បានប្រគល់រួច',
      'pending': 'កំពុងរង់ចាំ',
      'logout': 'ចាកចេញ',
      'logisticsInfo': 'ព័ត៌មានភស្តុភារ',
      'weight': 'ទម្ងន់',
      'sender': 'អ្នកផ្ញើ',
      'receiver': 'អ្នកទទួល',
      'phone': 'លេខទូរស័ព្ទ',
      'status': 'ស្ថានភាព',
      'route': 'ផ្លូវដឹកជញ្ជូន',
      'truckPlate': 'ស្លាកលេខឡាន',
      'trackLive': 'តាមដានឡានផ្ទាល់',
      'goodsDetail': 'ព័ត៌មានលម្អិតអំពីទំនិញ',
      'notAssigned': 'មិនទាន់កំណត់ជើងឡាន',
      'estimatedArrival': 'ពេលវេលាមកដល់',
      'emptyState': 'មិនរកឃើញព័ត៌មានទំនិញឡើយ។',
      'all': 'ទាំងអស់',
      'inTransit': 'កំពុងដឹកជញ្ជូន',
      'loaded': 'បានផ្ទុកឡើង',
      'cancelled': 'បានលុបចោល',
      'kg': 'គីឡូក្រាម',
      'ton': 'តោន',
      'close': 'បិទ',
      // Tabs
      'shipmentsTab': 'ការដឹកជញ្ជូន',
      'productsTab': 'កាតាឡុកទំនិញ',
      'recordsTab': 'ការវិភាគ & កំណត់ត្រា',
      'profileTab': 'ព័ត៌មានក្រុមហ៊ុន',
      // Corporate Profile
      'companyTier': 'ដៃគូកម្រិត VIP Platinum',
      'taxId': 'លេខអត្តសញ្ញាណពន្ធ',
      'creditLimit': 'ឥណទានអតិបរមា',
      'currentBalance': 'សមតុល្យបច្ចុប្បន្ន',
      'paymentTerms': 'លក្ខខណ្ឌទូទាត់',
      'primaryCorridor': 'ខ្សែផ្លូវដឹកជញ្ជូនចម្បង',
      'contactPerson': 'អ្នកគ្រប់គ្រងការងារ',
      'discountRate': 'អត្រាបញ្ចុះតម្លៃ',
      'companyAddress': 'អាសយដ្ឋានតំបន់សេដ្ឋកិច្ចពិសេស',
      'editDetails': 'កែប្រែព័ត៌មាន',
      'changeLogo': 'ប្តូរឡូហ្គោ',
      // Products
      'productCatalog': 'កាតាឡុកទំនិញក្រុមហ៊ុន',
      'searchProducts': 'ស្វែងរកលេខកូដ SKU ឬប្រភេទទំនិញ...',
      'requestDispatch': 'ស្នើសុំបញ្ជូនទំនិញ',
      'stockAtHub': 'ទំនិញនៅដេប៉ូ',
      'totalShipped': 'បានដឹកចេញសរុប',
      // Analytics & Records
      'onTimeRate': 'អត្រាដឹកទាន់វេលា',
      'completedWaybills': 'លិខិតដឹកជញ្ជូនបានបញ្ចប់',
      'avgTransitTime': 'រយ:ពេលដឹកជាមធ្យម',
      'totalSpend': 'ចំណាយភស្តុភារសរុប',
      'recentInvoices': 'វិក្កយបត្រទូទាត់ថ្មីៗ',
      'downloadWaybill': 'ទាញយក PDF',
    }
  };

  static String tr(BuildContext context, String key) {
    final locale = Localizations.localeOf(context).languageCode;
    final map = _localizedValues[locale] ?? _localizedValues['en']!;
    return map[key] ?? key;
  }
}

class CorporateHomeScreen extends StatefulWidget {
  const CorporateHomeScreen({super.key});

  @override
  State<CorporateHomeScreen> createState() => _CorporateHomeScreenState();
}

class _CorporateHomeScreenState extends State<CorporateHomeScreen> {
  final GoodsRepository _goodsRepo = GoodsRepository();
  final ProductRepository _productRepo = ProductRepository();
  final CooperatorRepository _cooperatorRepo = CooperatorRepository();
  bool _isLoading = true;
  int _currentTab = 0; // 0: Shipments, 1: Products, 2: Analytics, 3: Profile

  List<GoodsModel> _allGoods = [];
  List<GoodsModel> _filteredGoods = [];
  String _searchQuery = '';
  String _selectedStatus = 'All';
  String _productSearchQuery = '';

  // Demo corporate client ID configured in seed script
  final String _corporateId = 'demo-corporate-id';

  // Demo Corporate Profile Details (Editable State)
  final Map<String, dynamic> _companyProfile = {
    'name': 'Top Sports Textile (TST Group)',
    'shortName': 'Manhattan Garments',
    'code': 'COP-MANHATTAN-01',
    'industry': 'Garments & Textiles',
    'tier': 'VIP Platinum Partner',
    'discountRate': '15% Corporate Off',
    'paymentTerms': 'Net 30 Days',
    'creditLimit': 50000.0,
    'currentBalance': 12400.0,
    'contactPerson': 'Mr. Kenji Takahashi',
    'contactTitle': 'Procurement & Supply Chain Director',
    'phone': '+855 23 881 200',
    'email': 'procurement@manhattanmills.kh',
    'taxId': 'K002-98471203',
    'province': 'Phnom Penh',
    'address': 'Phnom Penh Special Economic Zone (PPSEZ), National Road 4',
    'primaryCorridor': 'Phnom Penh Central Hub ⇄ Sihanoukville Port Deep Sea Terminal',
    'logoUrl': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80',
  };

  // Preset Corporate Logos
  final List<String> _presetLogos = [
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
  ];

  // Demo Corporate Products Catalog
  final List<Map<String, dynamic>> _productsCatalog = [
    {
      'sku': 'TST-FAB-001',
      'name': 'Spandex Textile Fabric Rolls',
      'category': 'Textiles & Knits',
      'unitWeight': '24.5 Tons / Container',
      'totalShipped': '185.0 Tons',
      'stockAtHub': '42 Rolls (2,100m)',
      'status': 'In Stock',
      'image': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80',
    },
    {
      'sku': 'TST-YRN-002',
      'name': 'Activewear Polyester Yarns',
      'category': 'Raw Yarn Material',
      'unitWeight': '18.0 Tons / Truck',
      'totalShipped': '142.0 Tons',
      'stockAtHub': '28 Pallets',
      'status': 'In Stock',
      'image': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=300&q=80',
    },
    {
      'sku': 'TST-CHM-003',
      'name': 'Dye Chemical Drum Containers',
      'category': 'Industrial Chemicals',
      'unitWeight': '12.5 Tons / Shipment',
      'totalShipped': '68.5 Tons',
      'stockAtHub': '15 Drums',
      'status': 'Low Stock',
      'image': 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80',
    },
    {
      'sku': 'TST-EQP-004',
      'name': 'Precision Sewing Machinery & Parts',
      'category': 'Factory Equipment',
      'unitWeight': '8.2 Tons / Crate',
      'totalShipped': '25.0 Tons',
      'stockAtHub': '6 Crates',
      'status': 'In Stock',
      'image': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
    },
  ];

  // Demo Record Data & Analytics
  final List<Map<String, dynamic>> _waybillInvoices = [
    {
      'id': 'VKX-WAY-1092',
      'date': '2026-08-19',
      'destination': 'Sihanoukville Port Deep Sea Terminal',
      'tonnage': '24.5 Tons',
      'amount': '\$420.00',
      'status': 'Paid',
    },
    {
      'id': 'VKX-WAY-1094',
      'date': '2026-08-18',
      'destination': 'Bavet Border Special Economic Zone Depot',
      'tonnage': '18.0 Tons',
      'amount': '\$310.00',
      'status': 'Paid',
    },
    {
      'id': 'VKX-WAY-1095',
      'date': '2026-08-15',
      'destination': 'Phnom Penh Central Freight Hub',
      'tonnage': '28.0 Tons',
      'amount': '\$480.00',
      'status': 'Paid',
    },
    {
      'id': 'VKX-WAY-1098',
      'date': '2026-08-12',
      'destination': 'Poipet SEZ Cargo Logistics Depot',
      'tonnage': '22.4 Tons',
      'amount': '\$360.00',
      'status': 'Pending Net 30',
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadGoods();
  }

  Future<void> _loadGoods() async {
    setState(() => _isLoading = true);
    final coopResult = await _cooperatorRepo.getCooperator();
    final goodsResult = await _goodsRepo.getCorporateGoods(_corporateId);
    final productsResult = await _productRepo.getProducts(corporateId: _corporateId);

    if (mounted) {
      setState(() {
        _isLoading = false;
        if (coopResult is Success<CooperatorModel>) {
          final c = coopResult.data;
          _companyProfile['name'] = c.name;
          _companyProfile['shortName'] = c.shortName;
          _companyProfile['code'] = c.code;
          _companyProfile['industry'] = c.industry;
          _companyProfile['tier'] = c.tier;
          _companyProfile['discountRate'] = c.discountRate;
          _companyProfile['paymentTerms'] = c.paymentTerms;
          _companyProfile['creditLimit'] = c.creditLimit;
          _companyProfile['currentBalance'] = c.currentBalance;
          _companyProfile['contactPerson'] = c.contactPerson;
          _companyProfile['contactTitle'] = c.contactTitle;
          _companyProfile['phone'] = c.phone;
          _companyProfile['email'] = c.email;
          _companyProfile['taxId'] = c.taxId;
          _companyProfile['province'] = c.province;
          _companyProfile['address'] = c.address;
          _companyProfile['primaryCorridor'] = c.primaryCorridor;
          _companyProfile['logoUrl'] = c.logoUrl;
        }

        if (goodsResult is Success<List<GoodsModel>> && goodsResult.data.isNotEmpty) {
          _allGoods = goodsResult.data;
        } else {
          _allGoods = _getSeedCorporateGoods();
        }

        if (productsResult is Success<List<ProductModel>> && productsResult.data.isNotEmpty) {
          _productsCatalog.clear();
          for (final p in productsResult.data) {
            _productsCatalog.add({
              'sku': p.sku,
              'name': p.name,
              'category': p.category,
              'unitWeight': p.unitWeight,
              'stockAtHub': p.stockAtHub,
              'status': p.status,
              'image': p.imageUrl ?? 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80',
            });
          }
        }
        _applyFilters();
      });
    }
  }

  Future<void> _saveCooperatorToSupabase() async {
    final model = CooperatorModel(
      id: CooperatorRepository.defaultId,
      name: _companyProfile['name'] ?? '',
      shortName: _companyProfile['shortName'] ?? '',
      code: _companyProfile['code'] ?? '',
      industry: _companyProfile['industry'] ?? '',
      tier: _companyProfile['tier'] ?? '',
      discountRate: _companyProfile['discountRate'] ?? '',
      paymentTerms: _companyProfile['paymentTerms'] ?? '',
      creditLimit: (_companyProfile['creditLimit'] as num?)?.toDouble() ?? 50000.0,
      currentBalance: (_companyProfile['currentBalance'] as num?)?.toDouble() ?? 12400.0,
      contactPerson: _companyProfile['contactPerson'] ?? '',
      contactTitle: _companyProfile['contactTitle'] ?? '',
      phone: _companyProfile['phone'] ?? '',
      email: _companyProfile['email'] ?? '',
      taxId: _companyProfile['taxId'] ?? '',
      province: _companyProfile['province'] ?? '',
      address: _companyProfile['address'] ?? '',
      primaryCorridor: _companyProfile['primaryCorridor'] ?? '',
      logoUrl: _companyProfile['logoUrl'] ?? '',
    );
    await _cooperatorRepo.saveCooperator(model);
  }


  List<GoodsModel> _getSeedCorporateGoods() {
    return [
      GoodsModel(
        id: '901a1111-1111-1111-1111-111111111111',
        description: '40ft Container - Top Sports Textile Fabric Export',
        weightKg: 28500.0,
        senderName: 'Top Sports Textile (TST Group)',
        receiverName: 'Manhattan Textile Mills Ltd',
        receiverPhone: '+855 23 881 200',
        status: 'in_transit',
        tripId: 'tr-1',
        corporateId: _corporateId,
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      ),
      GoodsModel(
        id: '902b2222-2222-2222-2222-222222222222',
        description: 'Heavy Container - Activewear Garment Consignment',
        weightKg: 22000.0,
        senderName: 'Top Sports Textile (TST Group)',
        receiverName: 'Crystal Garment International Ltd',
        receiverPhone: '+855 34 934 888',
        status: 'in_transit',
        tripId: 'tr-2',
        corporateId: _corporateId,
        createdAt: DateTime.now().subtract(const Duration(hours: 5)),
      ),
      GoodsModel(
        id: '903c3333-3333-3333-3333-333333333333',
        description: 'Flatbed - Spandex Textile Rolls Delivery',
        weightKg: 25000.0,
        senderName: 'Top Sports Textile (TST Group)',
        receiverName: 'Shenzhou International SEZ Plant',
        receiverPhone: '+855 44 712 345',
        status: 'loaded',
        tripId: 'tr-3',
        corporateId: _corporateId,
        createdAt: DateTime.now().subtract(const Duration(hours: 8)),
      ),
      GoodsModel(
        id: '904d4444-4444-4444-4444-444444444444',
        description: 'Refrigerated Truck - High-Precision Dye Materials',
        weightKg: 15000.0,
        senderName: 'Top Sports Textile (TST Group)',
        receiverName: 'Sanco Poipet Apparel Logistics',
        receiverPhone: '+855 54 822 004',
        status: 'pending',
        corporateId: _corporateId,
        createdAt: DateTime.now().subtract(const Duration(hours: 12)),
      ),
      GoodsModel(
        id: '905e5555-5555-5555-5555-555555555555',
        description: 'Standard Freight - Craft & Agri-Textile Pack',
        weightKg: 18200.0,
        senderName: 'Top Sports Textile (TST Group)',
        receiverName: 'Angkor Craft & Agri-Export Corp',
        receiverPhone: '+855 63 966 005',
        status: 'delivered',
        corporateId: _corporateId,
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
    ];
  }

  void _applyFilters() {
    setState(() {
      _filteredGoods = _allGoods.where((goods) {
        final matchesSearch = goods.description.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            goods.receiverName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            goods.receiverPhone.contains(_searchQuery);

        final matchesStatus = _selectedStatus == 'All' ||
            (_selectedStatus == 'Pending' && goods.isPending) ||
            (_selectedStatus == 'Loaded' && goods.isLoaded) ||
            (_selectedStatus == 'In Transit' && goods.isInTransit) ||
            (_selectedStatus == 'Delivered' && goods.isDelivered) ||
            (_selectedStatus == 'Cancelled' && goods.isCancelled);

        return matchesSearch && matchesStatus;
      }).toList();
    });
  }

  double get _totalWeightKg => _allGoods.fold(0.0, (sum, item) => sum + item.weightKg);
  int get _activeCount => _allGoods.where((e) => e.isInTransit || e.isLoaded).length;
  int get _deliveredCount => _allGoods.where((e) => e.isDelivered).length;
  int get _pendingCount => _allGoods.where((e) => e.isPending).length;

  Color _getStatusColor(String status) {
    switch (status) {
      case 'in_transit':
        return const Color(0xFF10B981); // Emerald
      case 'loaded':
        return const Color(0xFF3B82F6); // Blue
      case 'pending':
        return const Color(0xFFF59E0B); // Amber
      case 'delivered':
        return const Color(0xFF6B7280); // Gray
      default:
        return const Color(0xFFEF4444); // Red
    }
  }

  String _getStatusDisplay(BuildContext context, String status) {
    switch (status) {
      case 'in_transit':
        return CorporateLocalizations.tr(context, 'inTransit');
      case 'loaded':
        return CorporateLocalizations.tr(context, 'loaded');
      case 'pending':
        return CorporateLocalizations.tr(context, 'pending');
      case 'delivered':
        return CorporateLocalizations.tr(context, 'delivered');
      default:
        return CorporateLocalizations.tr(context, 'cancelled');
    }
  }

  Future<void> _logout() async {
    await AuthRepository().signOut();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  // Add Product Modal (Sync to Supabase)
  void _showAddProductModal() {
    final skuCtrl = TextEditingController(text: 'TST-SKU-00${_productsCatalog.length + 1}');
    final nameCtrl = TextEditingController();
    final catCtrl = TextEditingController(text: 'Textiles & Knits');
    final weightCtrl = TextEditingController(text: '20.0 Tons / Container');
    final stockCtrl = TextEditingController(text: '30 Units');
    final imgCtrl = TextEditingController(text: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
        child: Container(
          constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.85),
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Add Product SKU (Supabase Sync)', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                  ],
                ),
                const Divider(height: 20),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(labelText: 'Product Name', hintText: 'e.g. Cotton Yarn Spools', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: skuCtrl,
                        decoration: const InputDecoration(labelText: 'SKU Code', border: OutlineInputBorder()),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: catCtrl,
                        decoration: const InputDecoration(labelText: 'Category', border: OutlineInputBorder()),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: weightCtrl,
                        decoration: const InputDecoration(labelText: 'Unit Weight / Load', border: OutlineInputBorder()),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: stockCtrl,
                        decoration: const InputDecoration(labelText: 'Stock Staged at Hub', border: OutlineInputBorder()),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: imgCtrl,
                  decoration: const InputDecoration(labelText: 'Product Image URL', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton.icon(
                    onPressed: () async {
                      if (nameCtrl.text.isEmpty) return;

                      final newProd = ProductModel(
                        id: DateTime.now().millisecondsSinceEpoch.toString(),
                        sku: skuCtrl.text,
                        name: nameCtrl.text,
                        category: catCtrl.text,
                        unitWeight: weightCtrl.text,
                        stockAtHub: stockCtrl.text,
                        status: 'in_stock',
                        imageUrl: imgCtrl.text,
                        corporateId: _corporateId,
                      );

                      setState(() {
                        _productsCatalog.insert(0, {
                          'sku': newProd.sku,
                          'name': newProd.name,
                          'category': newProd.category,
                          'unitWeight': newProd.unitWeight,
                          'stockAtHub': newProd.stockAtHub,
                          'status': newProd.status,
                          'image': newProd.imageUrl,
                        });
                      });

                      Navigator.pop(context);

                      final res = await _productRepo.saveProduct(newProd);
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(res is Success ? 'Product ${newProd.name} synced to Supabase!' : 'Product added locally! (Run Supabase SQL script to sync online)'),
                            backgroundColor: const Color(0xFF10B981),
                          ),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                    icon: const Icon(Icons.cloud_upload_rounded),
                    label: const Text('Save & Sync to Supabase', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Edit Company Details Modal
  void _showEditCompanyModal() {
    final nameCtrl = TextEditingController(text: _companyProfile['name']);
    final personCtrl = TextEditingController(text: _companyProfile['contactPerson']);
    final titleCtrl = TextEditingController(text: _companyProfile['contactTitle']);
    final phoneCtrl = TextEditingController(text: _companyProfile['phone']);
    final emailCtrl = TextEditingController(text: _companyProfile['email']);
    final taxCtrl = TextEditingController(text: _companyProfile['taxId']);
    final addressCtrl = TextEditingController(text: _companyProfile['address']);
    final corridorCtrl = TextEditingController(text: _companyProfile['primaryCorridor']);
    final logoCtrl = TextEditingController(text: _companyProfile['logoUrl']);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
          child: Container(
            constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.88),
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Edit Company Details',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      ),
                      IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                    ],
                  ),
                  const Divider(height: 20),

                  // Corporate Brand Logo Section
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Company Logo & Brand Avatar',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                width: 54,
                                height: 54,
                                color: const Color(0xFF0F172A),
                                child: logoCtrl.text.isNotEmpty
                                    ? Image.network(
                                        logoCtrl.text,
                                        width: 54,
                                        height: 54,
                                        fit: BoxFit.cover,
                                        errorBuilder: (c, e, s) => const Icon(Icons.business_rounded, color: Colors.white70),
                                      )
                                    : const Icon(Icons.business_rounded, color: Colors.white70),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Preset Logos:', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
                                  const SizedBox(height: 6),
                                  SingleChildScrollView(
                                    scrollDirection: Axis.horizontal,
                                    child: Row(
                                      children: _presetLogos.map((url) {
                                        final isSel = logoCtrl.text == url;
                                        return GestureDetector(
                                          onTap: () {
                                            setModalState(() {
                                              logoCtrl.text = url;
                                            });
                                          },
                                          child: Container(
                                            margin: const EdgeInsets.only(right: 8),
                                            decoration: BoxDecoration(
                                              border: Border.all(
                                                color: isSel ? AppColors.primary : Colors.transparent,
                                                width: 2,
                                              ),
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            child: ClipRRect(
                                              borderRadius: BorderRadius.circular(8),
                                              child: Image.network(url, width: 36, height: 36, fit: BoxFit.cover),
                                            ),
                                          ),
                                        );
                                      }).toList(),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        TextField(
                          controller: logoCtrl,
                          onChanged: (_) => setModalState(() {}),
                          decoration: InputDecoration(
                            labelText: 'Logo Image URL',
                            isDense: true,
                            border: const OutlineInputBorder(),
                            prefixIcon: const Icon(Icons.image_outlined, size: 20),
                            suffixIcon: logoCtrl.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear, size: 18),
                                    onPressed: () {
                                      setModalState(() {
                                        logoCtrl.clear();
                                      });
                                    },
                                  )
                                : null,
                          ),
                        ),
                      ],
                    ),
                  ),

                  TextField(
                    controller: nameCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Company Name',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.business_rounded),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: personCtrl,
                          decoration: const InputDecoration(
                            labelText: 'Contact Director',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.person_outline_rounded),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: titleCtrl,
                          decoration: const InputDecoration(
                            labelText: 'Director Title',
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: phoneCtrl,
                          decoration: const InputDecoration(
                            labelText: 'Phone',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.phone_outlined),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: emailCtrl,
                          decoration: const InputDecoration(
                            labelText: 'Email',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.email_outlined),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: taxCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Tax Identification (Tax ID)',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.badge_outlined),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: addressCtrl,
                    decoration: const InputDecoration(
                      labelText: 'SEZ Factory Address',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.location_on_outlined),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: corridorCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Primary Logistics Corridor',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.alt_route_rounded),
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        setState(() {
                          _companyProfile['name'] = nameCtrl.text;
                          _companyProfile['contactPerson'] = personCtrl.text;
                          _companyProfile['contactTitle'] = titleCtrl.text;
                          _companyProfile['phone'] = phoneCtrl.text;
                          _companyProfile['email'] = emailCtrl.text;
                          _companyProfile['taxId'] = taxCtrl.text;
                          _companyProfile['address'] = addressCtrl.text;
                          _companyProfile['primaryCorridor'] = corridorCtrl.text;
                          if (logoCtrl.text.isNotEmpty) {
                            _companyProfile['logoUrl'] = logoCtrl.text;
                          }
                        });
                        Navigator.pop(context);
                        await _saveCooperatorToSupabase();
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Company profile updated & synced to Supabase!'),
                              backgroundColor: Color(0xFF10B981),
                            ),
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.save_rounded),
                      label: const Text('Save Profile Changes', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // Edit Company Logo Dialog
  void _showEditLogoDialog() {
    final urlCtrl = TextEditingController(text: _companyProfile['logoUrl']);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.photo_camera_rounded, color: AppColors.primary),
            const SizedBox(width: 10),
            Text(CorporateLocalizations.tr(context, 'changeLogo')),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Choose a preset corporate logo or enter an image URL:', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
            const SizedBox(height: 14),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: _presetLogos.map((url) {
                final isSelected = _companyProfile['logoUrl'] == url;
                return InkWell(
                  onTap: () {
                    setState(() => _companyProfile['logoUrl'] = url);
                    urlCtrl.text = url;
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: isSelected ? AppColors.primary : Colors.transparent, width: 2.5),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(url, width: 48, height: 48, fit: BoxFit.cover),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: urlCtrl,
              decoration: const InputDecoration(
                labelText: 'Logo Image URL',
                hintText: 'https://example.com/logo.jpg',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: Text(CorporateLocalizations.tr(context, 'close'))),
          ElevatedButton(
            onPressed: () async {
              if (urlCtrl.text.isNotEmpty) {
                setState(() => _companyProfile['logoUrl'] = urlCtrl.text);
              }
              Navigator.pop(context);
              await _saveCooperatorToSupabase();
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Company logo updated & synced to Supabase!'), backgroundColor: Color(0xFF10B981)),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            child: const Text('Apply Logo'),
          ),
        ],
      ),
    );
  }

  void _showDispatchOrderModal(Map<String, dynamic> product) {
    final destCtrl = TextEditingController(text: 'Sihanoukville Port Deep Sea Terminal');
    final qtyCtrl = TextEditingController(text: '24.5 Tons');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product['name'],
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    Text(
                      'SKU: ${product['sku']} • ${product['category']}',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
              ],
            ),
            const Divider(height: 24),
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Unit Weight', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                        const SizedBox(height: 4),
                        Text(product['unitWeight'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Stock Staged', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                        const SizedBox(height: 4),
                        Text(product['stockAtHub'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF10B981))),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            TextField(
              controller: destCtrl,
              decoration: const InputDecoration(
                labelText: 'Destination Staging Hub / Factory',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: qtyCtrl,
              decoration: const InputDecoration(
                labelText: 'Quantity / Tons to Dispatch',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: () {
                  final newGoods = GoodsModel(
                    id: DateTime.now().millisecondsSinceEpoch.toString(),
                    description: 'Dispatch: ${product['name']} (${product['sku']})',
                    weightKg: 24500.0,
                    senderName: _companyProfile['name'] as String,
                    receiverName: destCtrl.text.isNotEmpty ? destCtrl.text : 'Sihanoukville Port Deep Sea Terminal',
                    receiverPhone: _companyProfile['phone'] as String,
                    status: 'pending',
                    corporateId: _corporateId,
                    createdAt: DateTime.now(),
                  );

                  setState(() {
                    _allGoods.insert(0, newGoods);
                    _applyFilters();
                  });

                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Dispatch order for ${product['name']} submitted & created in Shipments!'),
                      backgroundColor: const Color(0xFF10B981),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.local_shipping_rounded),
                label: Text(CorporateLocalizations.tr(context, 'requestDispatch'), style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showDetails(GoodsModel goods) {
    showDialog(
      context: context,
      builder: (context) {
        final hasRoute = goods.trip?.schedule?.route != null;
        final origin = hasRoute ? goods.trip!.schedule!.route!.origin : 'Phnom Penh Central Hub';
        final destination = hasRoute ? goods.trip!.schedule!.route!.destination : 'Sihanoukville Port Terminal';

        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          elevation: 10,
          backgroundColor: Colors.white,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: _getStatusColor(goods.status).withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.local_shipping_rounded,
                        color: _getStatusColor(goods.status),
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            goods.description,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'WAYBILL: VKX-${goods.id.substring(0, 6).toUpperCase()}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFF94A3B8),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Color(0xFF64748B)),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const Divider(height: 28, color: Color(0xFFF1F5F9)),

                // Weight & Status
                Row(
                  children: [
                    Expanded(
                      child: _buildDetailTile(
                        context,
                        CorporateLocalizations.tr(context, 'weight'),
                        '${goods.weightKg} ${CorporateLocalizations.tr(context, 'kg')}',
                        Icons.monitor_weight_outlined,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildDetailTile(
                        context,
                        CorporateLocalizations.tr(context, 'status'),
                        _getStatusDisplay(context, goods.status),
                        Icons.info_outline_rounded,
                        valueColor: _getStatusColor(goods.status),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Route Information
                _buildDetailTile(
                  context,
                  CorporateLocalizations.tr(context, 'route'),
                  '$origin → $destination',
                  Icons.map_outlined,
                ),
                const SizedBox(height: 12),

                // Sender & Receiver
                Row(
                  children: [
                    Expanded(
                      child: _buildDetailTile(
                        context,
                        CorporateLocalizations.tr(context, 'sender'),
                        goods.senderName,
                        Icons.business_rounded,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildDetailTile(
                        context,
                        CorporateLocalizations.tr(context, 'receiver'),
                        goods.receiverName,
                        Icons.assignment_ind_outlined,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Phone
                _buildDetailTile(
                  context,
                  CorporateLocalizations.tr(context, 'phone'),
                  goods.receiverPhone,
                  Icons.phone_iphone_outlined,
                ),

                if (goods.isInTransit || goods.isLoaded) ...[
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => LiveTrackingScreen(
                              tripId: goods.tripId ?? 'tr-1',
                              origin: origin,
                              destination: destination,
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      icon: const Icon(Icons.my_location_rounded, size: 18),
                      label: Text(
                        CorporateLocalizations.tr(context, 'trackLive'),
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildDetailTile(
    BuildContext context,
    String label,
    String value,
    IconData icon, {
    Color? valueColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF64748B), size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 10,
                    color: Color(0xFF94A3B8),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: valueColor ?? const Color(0xFF334155),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        foregroundColor: Colors.white,
        title: Row(
          children: [
            InkWell(
              onTap: _showEditLogoDialog,
              borderRadius: BorderRadius.circular(8),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  _companyProfile['logoUrl'],
                  width: 32,
                  height: 32,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF59E0B).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.workspace_premium_rounded, color: Color(0xFFF59E0B), size: 18),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    CorporateLocalizations.tr(context, 'portalTitle'),
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: -0.3),
                  ),
                  Text(
                    _companyProfile['name'],
                    style: TextStyle(fontSize: 11, color: Colors.white.withValues(alpha: 0.7)),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_note_rounded, color: Colors.white),
            tooltip: 'Edit Company Profile & Logo',
            onPressed: _showEditCompanyModal,
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.white70),
            onPressed: _logout,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : IndexedStack(
              index: _currentTab,
              children: [
                _buildShipmentsTab(context),
                _buildProductsTab(context),
                _buildAnalyticsTab(context),
                _buildProfileTab(context),
              ],
            ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentTab,
        onTap: (index) => setState(() => _currentTab = index),
        selectedItemColor: AppColors.primary,
        unselectedItemColor: const Color(0xFF94A3B8),
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        elevation: 8,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
        unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.local_shipping_rounded),
            label: CorporateLocalizations.tr(context, 'shipmentsTab'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.inventory_2_rounded),
            label: CorporateLocalizations.tr(context, 'productsTab'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.insights_rounded),
            label: CorporateLocalizations.tr(context, 'recordsTab'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.business_center_rounded),
            label: CorporateLocalizations.tr(context, 'profileTab'),
          ),
        ],
      ),
    );
  }

  // TAB 1: SHIPMENTS & FLEET TRACKING
  Widget _buildShipmentsTab(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _loadGoods,
      child: CustomScrollView(
        slivers: [
          // Corporate Quick Telemetry Summary Card
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1E1B4B), Color(0xFF312E81)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF312E81).withValues(alpha: 0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.1),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.satellite_alt_rounded, color: Color(0xFF10B981), size: 18),
                            ),
                            const SizedBox(width: 10),
                            const Text(
                              'Live Active Fleet Telemetry',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                          ),
                          child: const Row(
                            children: [
                              CircleAvatar(radius: 3, backgroundColor: Color(0xFF10B981)),
                              SizedBox(width: 4),
                              Text('LIVE GPS', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildWhiteMetric('Total Tonnage', '${(_totalWeightKg / 1000).toStringAsFixed(2)} tons'),
                        Container(width: 1, height: 30, color: Colors.white24),
                        _buildWhiteMetric('Active Trucks', '$_activeCount In Transit'),
                        Container(width: 1, height: 30, color: Colors.white24),
                        _buildWhiteMetric('On-Time Rate', '98.4%'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Stat Grid
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      context,
                      CorporateLocalizations.tr(context, 'activeCargo'),
                      '$_activeCount',
                      Icons.local_shipping_rounded,
                      const Color(0xFF10B981),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildStatCard(
                      context,
                      CorporateLocalizations.tr(context, 'delivered'),
                      '$_deliveredCount',
                      Icons.task_alt_rounded,
                      const Color(0xFF3B82F6),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildStatCard(
                      context,
                      CorporateLocalizations.tr(context, 'pending'),
                      '$_pendingCount',
                      Icons.pending_actions_rounded,
                      const Color(0xFFF59E0B),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Search and Filter Header
          SliverToBoxAdapter(
            child: Container(
              color: const Color(0xFFF8FAFC),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    onChanged: (val) {
                      _searchQuery = val;
                      _applyFilters();
                    },
                    decoration: InputDecoration(
                      hintText: CorporateLocalizations.tr(context, 'searchHint'),
                      prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF94A3B8)),
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFCBD5E1), width: 1.5),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 36,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: ['All', 'Pending', 'Loaded', 'In Transit', 'Delivered', 'Cancelled'].map((status) {
                        final isSelected = _selectedStatus == status;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: ChoiceChip(
                            label: Text(
                              status == 'All'
                                  ? CorporateLocalizations.tr(context, 'all')
                                  : status == 'In Transit'
                                      ? CorporateLocalizations.tr(context, 'inTransit')
                                      : status == 'Loaded'
                                          ? CorporateLocalizations.tr(context, 'loaded')
                                          : status == 'Pending'
                                              ? CorporateLocalizations.tr(context, 'pending')
                                              : status == 'Delivered'
                                                  ? CorporateLocalizations.tr(context, 'delivered')
                                                  : CorporateLocalizations.tr(context, 'cancelled'),
                              style: TextStyle(
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                fontSize: 11,
                                color: isSelected ? Colors.white : const Color(0xFF64748B),
                              ),
                            ),
                            selected: isSelected,
                            onSelected: (val) {
                              if (val) {
                                _selectedStatus = status;
                                _applyFilters();
                              }
                            },
                            selectedColor: AppColors.primary,
                            backgroundColor: Colors.white,
                            checkmarkColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                              side: BorderSide(
                                color: isSelected ? AppColors.primary : const Color(0xFFE2E8F0),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Cargo Shipments List
          _filteredGoods.isEmpty
              ? SliverFillRemaining(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.inventory_2_outlined, size: 64, color: Color(0xFFCBD5E1)),
                          const SizedBox(height: 16),
                          Text(
                            CorporateLocalizations.tr(context, 'emptyState'),
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Color(0xFF64748B), fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              : SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final item = _filteredGoods[index];
                      return _buildGoodsCard(context, item);
                    },
                    childCount: _filteredGoods.length,
                  ),
                ),
        ],
      ),
    );
  }

  Widget _buildGoodsCard(BuildContext context, GoodsModel item) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: InkWell(
        onTap: () => _showDetails(item),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      item.description,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getStatusColor(item.status).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: Text(
                      _getStatusDisplay(context, item.status),
                      style: TextStyle(
                        color: _getStatusColor(item.status),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.scale_outlined, size: 14, color: Color(0xFF94A3B8)),
                  const SizedBox(width: 6),
                  Text(
                    '${item.weightKg} ${CorporateLocalizations.tr(context, 'kg')}',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF475569), fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(width: 16),
                  const Icon(Icons.business_outlined, size: 14, color: Color(0xFF94A3B8)),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      item.receiverName,
                      style: const TextStyle(fontSize: 12, color: Color(0xFF475569), fontWeight: FontWeight.w600),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              if (item.isInTransit || item.isLoaded) ...[
                const Divider(height: 20, color: Color(0xFFF1F5F9)),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.directions_bus_rounded, size: 14, color: Color(0xFF10B981)),
                        SizedBox(width: 6),
                        Text(
                          'Trailer: PP-3D-8890 (Scania R450)',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                    TextButton.icon(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => LiveTrackingScreen(
                              tripId: item.tripId ?? 'tr-1',
                              origin: 'Phnom Penh Central Hub',
                              destination: 'Sihanoukville Port Terminal',
                            ),
                          ),
                        );
                      },
                      icon: const Icon(Icons.my_location_rounded, size: 14),
                      label: Text(
                        CorporateLocalizations.tr(context, 'trackLive'),
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      style: TextButton.styleFrom(
                        foregroundColor: const Color(0xFF4F46E5),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        backgroundColor: const Color(0xFF4F46E5).withValues(alpha: 0.08),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  // TAB 2: PRODUCTS CATALOG
  Widget _buildProductsTab(BuildContext context) {
    final filtered = _productsCatalog.where((p) {
      final name = p['name'].toString().toLowerCase();
      final sku = p['sku'].toString().toLowerCase();
      final cat = p['category'].toString().toLowerCase();
      final q = _productSearchQuery.toLowerCase();
      return name.contains(q) || sku.contains(q) || cat.contains(q);
    }).toList();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      CorporateLocalizations.tr(context, 'productCatalog'),
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Registered factory SKUs & Supabase sync',
                      style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: _showAddProductModal,
                icon: const Icon(Icons.add_rounded, size: 18),
                label: const Text('Add SKU', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          TextField(
            onChanged: (val) => setState(() => _productSearchQuery = val),
            decoration: InputDecoration(
              hintText: CorporateLocalizations.tr(context, 'searchProducts'),
              prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF94A3B8)),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              itemCount: filtered.length,
              itemBuilder: (context, index) {
                final p = filtered[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          p['image'],
                          width: 70,
                          height: 70,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            width: 70,
                            height: 70,
                            color: const Color(0xFFF1F5F9),
                            child: const Icon(Icons.inventory_2_rounded, color: Color(0xFF94A3B8)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(p['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1E293B))),
                            const SizedBox(height: 2),
                            Text('SKU: ${p['sku']} • ${p['category']}', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981).withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text('Hub: ${p['stockAtHub']}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF10B981))),
                                ),
                                const SizedBox(width: 8),
                                Text('Unit: ${p['unitWeight']}', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                              ],
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add_shopping_cart_rounded, color: AppColors.primary),
                        onPressed: () => _showDispatchOrderModal(p),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // TAB 3: ANALYTICS & RECORDS
  Widget _buildAnalyticsTab(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Analytics & Waybill Records', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          const SizedBox(height: 4),
          const Text('Monthly performance metrics and invoice archives', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
          const SizedBox(height: 16),

          // Overview KPI Grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.5,
            children: [
              _buildKpiCard('On-Time Delivery', '98.4%', Icons.verified_rounded, const Color(0xFF10B981)),
              _buildKpiCard('Completed Waybills', '148', Icons.assignment_turned_in_rounded, const Color(0xFF3B82F6)),
              _buildKpiCard('Avg Transit Time', '4.2 Hours', Icons.timer_rounded, const Color(0xFF8B5CF6)),
              _buildKpiCard('Total Spend', '\$58,200', Icons.account_balance_wallet_rounded, const Color(0xFFF59E0B)),
            ],
          ),
          const SizedBox(height: 24),

          // Invoice & Waybill Records List
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(CorporateLocalizations.tr(context, 'recentInvoices'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1E293B))),
              const Text('Filter Month', style: TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _waybillInvoices.length,
            itemBuilder: (context, index) {
              final inv = _waybillInvoices[index];
              final isPaid = inv['status'] == 'Paid';
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: (isPaid ? const Color(0xFF10B981) : const Color(0xFFF59E0B)).withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isPaid ? Icons.check_circle_outline_rounded : Icons.pending_outlined,
                        color: isPaid ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(inv['id'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                          const SizedBox(height: 2),
                          Text('${inv['destination']} • ${inv['tonnage']}', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(inv['amount'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A))),
                        const SizedBox(height: 2),
                        Text(inv['status'], style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isPaid ? const Color(0xFF10B981) : const Color(0xFFF59E0B))),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildKpiCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 18),
              const SizedBox(width: 8),
              Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
            ],
          ),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  // TAB 4: CORPORATE PROFILE
  Widget _buildProfileTab(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Corporate Header Banner Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.network(
                            _companyProfile['logoUrl'],
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Container(
                              width: 60,
                              height: 60,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF59E0B).withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: const Icon(Icons.business_rounded, color: Color(0xFFF59E0B), size: 32),
                            ),
                          ),
                        ),
                        Positioned(
                          right: -2,
                          bottom: -2,
                          child: InkWell(
                            onTap: _showEditLogoDialog,
                            child: Container(
                              padding: const EdgeInsets.all(5),
                              decoration: const BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 12),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_companyProfile['name'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFD97706)]),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _companyProfile['tier'],
                              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit_rounded, color: Colors.white70),
                      onPressed: _showEditCompanyModal,
                      tooltip: 'Edit Profile',
                    ),
                  ],
                ),
                const Divider(height: 28, color: Colors.white24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildWhiteMetric('Credit Limit', '\$${_companyProfile['creditLimit'].toStringAsFixed(0)}'),
                    _buildWhiteMetric('Current Balance', '\$${_companyProfile['currentBalance'].toStringAsFixed(0)}'),
                    _buildWhiteMetric('Terms', _companyProfile['paymentTerms']),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Company & Contract Details', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              TextButton.icon(
                onPressed: _showEditCompanyModal,
                icon: const Icon(Icons.edit_note_rounded, size: 18),
                label: Text(CorporateLocalizations.tr(context, 'editDetails'), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  backgroundColor: AppColors.primary.withValues(alpha: 0.08),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          _buildProfileRow(Icons.pin_outlined, CorporateLocalizations.tr(context, 'taxId'), _companyProfile['taxId']),
          _buildProfileRow(Icons.local_offer_outlined, CorporateLocalizations.tr(context, 'discountRate'), _companyProfile['discountRate']),
          _buildProfileRow(Icons.alt_route_rounded, CorporateLocalizations.tr(context, 'primaryCorridor'), _companyProfile['primaryCorridor']),
          _buildProfileRow(Icons.person_outline_rounded, CorporateLocalizations.tr(context, 'contactPerson'), '${_companyProfile['contactPerson']} (${_companyProfile['contactTitle']})'),
          _buildProfileRow(Icons.phone_outlined, CorporateLocalizations.tr(context, 'phone'), _companyProfile['phone']),
          _buildProfileRow(Icons.email_outlined, 'Email', _companyProfile['email']),
          _buildProfileRow(Icons.location_on_outlined, CorporateLocalizations.tr(context, 'companyAddress'), _companyProfile['address']),

          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: OutlinedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Contacting Top Sports Textile Key Account Manager...')),
                );
              },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.primary, width: 1.5),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.support_agent_rounded, color: AppColors.primary),
              label: const Text('Contact Key Account Manager', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWhiteMetric(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
      ],
    );
  }

  Widget _buildProfileRow(IconData icon, String label, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF64748B), size: 18),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.w500)),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                child: Icon(icon, color: color, size: 16),
              ),
              Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
            ],
          ),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
