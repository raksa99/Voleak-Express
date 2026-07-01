import 'package:flutter/material.dart';
import '../../../models/goods_model.dart';
import '../../../core/theme/app_theme.dart';
import '../../../repositories/auth_repository.dart';
import '../../../repositories/goods_repository.dart';
import '../../../core/error/result.dart';
import '../../auth/login_screen.dart';
import '../live_tracking_screen.dart';

class CorporateLocalizations {
  static const Map<String, Map<String, String>> _localizedValues = {
    'en': {
      'portalTitle': 'Corporate Portal',
      'portalSubtitle': 'Real-time Cargo & Fleet Tracking',
      'searchHint': 'Search shipments by receiver or description...',
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
    },
    'km': {
      'portalTitle': 'បញ្ជរដៃគូសាជីវកម្ម',
      'portalSubtitle': 'ការតាមដានទំនិញ និងយានយន្តផ្ទាល់',
      'searchHint': 'ស្វែងរកទំនិញតាមអ្នកទទួល ឬការពិពណ៌នា...',
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
  bool _isLoading = true;
  List<GoodsModel> _allGoods = [];
  List<GoodsModel> _filteredGoods = [];
  String _searchQuery = '';
  String _selectedStatus = 'All';

  // Demo corporate client ID configured in seed script
  final String _corporateId = 'demo-corporate-id';

  @override
  void initState() {
    super.initState();
    _loadGoods();
  }

  Future<void> _loadGoods() async {
    setState(() => _isLoading = true);
    final result = await _goodsRepo.getCorporateGoods(_corporateId);
    if (mounted) {
      setState(() {
        _isLoading = false;
        if (result is Success<List<GoodsModel>>) {
          _allGoods = result.data;
          _applyFilters();
        }
      });
    }
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

  double get _totalWeightKg {
    return _allGoods.fold(0.0, (sum, item) => sum + item.weightKg);
  }

  int get _activeCount {
    return _allGoods.where((e) => e.isInTransit || e.isLoaded).length;
  }

  int get _deliveredCount {
    return _allGoods.where((e) => e.isDelivered).length;
  }

  int get _pendingCount {
    return _allGoods.where((e) => e.isPending).length;
  }

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

  void _showDetails(GoodsModel goods) {
    showDialog(
      context: context,
      builder: (context) {
        final hasTrip = goods.trip != null;
        final hasRoute = goods.trip?.schedule?.route != null;
        final origin = hasRoute ? goods.trip!.schedule!.route!.origin : '';
        final destination = hasRoute ? goods.trip!.schedule!.route!.destination : '';

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
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'ID: ${goods.id.substring(0, 8).toUpperCase()}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF94A3B8),
                              fontWeight: FontWeight.w500,
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
                const Divider(height: 32, color: Color(0xFFF1F5F9)),
                
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
                const SizedBox(height: 16),
                
                // Route Information
                _buildDetailTile(
                  context,
                  CorporateLocalizations.tr(context, 'route'),
                  hasRoute
                      ? '$origin → $destination'
                      : CorporateLocalizations.tr(context, 'notAssigned'),
                  Icons.map_outlined,
                ),
                const SizedBox(height: 16),

                // Sender & Receiver
                Row(
                  children: [
                    Expanded(
                      child: _buildDetailTile(
                        context,
                        CorporateLocalizations.tr(context, 'sender'),
                        goods.senderName,
                        Icons.person_outline_rounded,
                      ),
                    ),
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
                const SizedBox(height: 16),

                // Phone
                _buildDetailTile(
                  context,
                  CorporateLocalizations.tr(context, 'phone'),
                  goods.receiverPhone,
                  Icons.phone_iphone_outlined,
                ),
                
                if (goods.isInTransit && hasTrip && hasRoute) ...[
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => LiveTrackingScreen(
                              tripId: goods.tripId!,
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
                      icon: const Icon(Icons.my_location_rounded, size: 20),
                      label: Text(
                        CorporateLocalizations.tr(context, 'trackLive'),
                        style: const TextStyle(fontWeight: FontWeight.w600),
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
          Icon(icon, color: const Color(0xFF64748B), size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF94A3B8),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: valueColor ?? const Color(0xFF334155),
                  ),
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
            gradient: AppGradients.primaryBlue,
          ),
        ),
        foregroundColor: Colors.white,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              CorporateLocalizations.tr(context, 'portalTitle'),
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: -0.5),
            ),
            Text(
              CorporateLocalizations.tr(context, 'portalSubtitle'),
              style: TextStyle(fontSize: 11, color: Colors.white.withValues(alpha: 0.7)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.white70),
            onPressed: _logout,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadGoods,
              child: CustomScrollView(
                slivers: [
                  // Stat Cards
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: _buildStatCard(
                                  context,
                                  CorporateLocalizations.tr(context, 'totalWeight'),
                                  '${(_totalWeightKg / 1000).toStringAsFixed(2)} ${CorporateLocalizations.tr(context, 'ton')}',
                                  Icons.scale_rounded,
                                  const Color(0xFF4F46E5), // Indigo
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildStatCard(
                                  context,
                                  CorporateLocalizations.tr(context, 'activeCargo'),
                                  '$_activeCount',
                                  Icons.local_shipping_rounded,
                                  const Color(0xFF10B981), // Emerald
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: _buildStatCard(
                                  context,
                                  CorporateLocalizations.tr(context, 'delivered'),
                                  '$_deliveredCount',
                                  Icons.task_alt_rounded,
                                  const Color(0xFF6B7280), // Gray
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildStatCard(
                                  context,
                                  CorporateLocalizations.tr(context, 'pending'),
                                  '$_pendingCount',
                                  Icons.pending_actions_rounded,
                                  const Color(0xFFF59E0B), // Amber
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Search and Filter Header
                  SliverPersistentHeader(
                    pinned: true,
                    delegate: _FilterHeaderDelegate(
                      child: Container(
                        color: const Color(0xFFF8FAFC),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Search Box
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
                                contentPadding: const EdgeInsets.symmetric(vertical: 12),
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
                            const SizedBox(height: 10),
                            // Horizontal Filter Chips
                            SizedBox(
                              height: 38,
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
                                          fontSize: 12,
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
                              final hasTrip = item.trip != null;
                              final route = item.trip?.schedule?.route;
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
                                        // Header Row
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Text(
                                                item.description,
                                                style: const TextStyle(
                                                  fontSize: 15,
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
                                        const SizedBox(height: 12),
                                        
                                        // Logistics details
                                        Row(
                                          children: [
                                            const Icon(Icons.scale_outlined, size: 14, color: Color(0xFF94A3B8)),
                                            const SizedBox(width: 6),
                                            Text(
                                              '${item.weightKg} ${CorporateLocalizations.tr(context, 'kg')}',
                                              style: const TextStyle(
                                                fontSize: 12,
                                                color: Color(0xFF475569),
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            const SizedBox(width: 16),
                                            const Icon(Icons.map_outlined, size: 14, color: Color(0xFF94A3B8)),
                                            const SizedBox(width: 6),
                                            Expanded(
                                              child: Text(
                                                route != null
                                                    ? '${route.origin} → ${route.destination}'
                                                    : CorporateLocalizations.tr(context, 'notAssigned'),
                                                style: const TextStyle(
                                                  fontSize: 12,
                                                  color: Color(0xFF475569),
                                                  fontWeight: FontWeight.w600,
                                                ),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ],
                                        ),
                                        
                                        // Track live action row
                                        if (item.isInTransit && hasTrip && route != null) ...[
                                          const Divider(height: 24, color: Color(0xFFF1F5F9)),
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Row(
                                                children: [
                                                  Container(
                                                    width: 8,
                                                    height: 8,
                                                    decoration: const BoxDecoration(
                                                      color: Color(0xFF10B981),
                                                      shape: BoxShape.circle,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 8),
                                                  Text(
                                                    '${CorporateLocalizations.tr(context, 'truckPlate')}: ${item.trip?.schedule?.truck?.plateNumber ?? 'N/A'}',
                                                    style: const TextStyle(
                                                      fontSize: 11,
                                                      fontWeight: FontWeight.w500,
                                                      color: Color(0xFF64748B),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              TextButton.icon(
                                                onPressed: () {
                                                  Navigator.of(context).push(
                                                    MaterialPageRoute(
                                                      builder: (_) => LiveTrackingScreen(
                                                        tripId: item.tripId!,
                                                        origin: route.origin,
                                                        destination: route.destination,
                                                      ),
                                                    ),
                                                  );
                                                },
                                                icon: const Icon(Icons.my_location_rounded, size: 14),
                                                label: Text(
                                                  CorporateLocalizations.tr(context, 'trackLive'),
                                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                                ),
                                                style: TextButton.styleFrom(
                                                  foregroundColor: const Color(0xFF4F46E5),
                                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
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
                            },
                            childCount: _filteredGoods.length,
                          ),
                        ),
                ],
              ),
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
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.01),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF64748B),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterHeaderDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;

  _FilterHeaderDelegate({required this.child});

  @override
  double get minExtent => 102;

  @override
  double get maxExtent => 102;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return child;
  }

  @override
  bool shouldRebuild(covariant _FilterHeaderDelegate oldDelegate) {
    return child != oldDelegate.child;
  }
}
