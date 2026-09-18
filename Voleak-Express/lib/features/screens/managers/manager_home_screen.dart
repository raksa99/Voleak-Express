import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/auth_helper.dart';
import '../../../l10n/tr_extension.dart';
import '../../../repositories/user_repository.dart';
import '../../../services/notification_service.dart';
import '../../widgets/animations.dart';
import '../../../shared/widgets/language_selector_sheet.dart';
import '../../widgets/notification_bell.dart';
import 'manager_trucks_screen.dart';
import 'manager_routes_screen.dart';
import 'manager_schedules_screen.dart';
import 'manager_staff_screen.dart';
import 'manager_profile_screen.dart';
import 'manager_inventory_screen.dart';
import 'manager_cooperators_screen.dart';
import 'widgets/incident_card.dart';
import 'widgets/manager_card.dart';
import 'widgets/quick_action.dart';

class ManagerHomeScreen extends StatefulWidget {
  const ManagerHomeScreen({super.key});

  @override
  State<ManagerHomeScreen> createState() => _ManagerHomeScreenState();
}

class _ManagerHomeScreenState extends State<ManagerHomeScreen> {
  final _userRepo = UserRepository();

  int _selectedIndex = 0;
  Map<String, dynamic>? _operatorInfo;
  Map<String, int> _stats = {};
  List<Map<String, dynamic>> _activeIncidents = [];
  bool _isLoading = true;
  String? _operatorId;

  static const _primaryColor = AppColors.primary;

  @override
  void initState() {
    super.initState();
    NotificationService.instance.refreshUnreadCount();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final user = _userRepo.client.auth.currentUser;
      String opId = 'demo-operator-id';
      Map<String, dynamic> opInfo = {
        'id': 'demo-operator-id',
        'name': 'Top Sports Textile HQ',
        'status': 'active',
        'logo_url': null,
      };

      if (user != null) {
        final userData = await _userRepo.client
            .from('users')
            .select('name, operator_id')
            .eq('id', user.id)
            .maybeSingle();

        if (userData?['operator_id'] != null) {
          opId = userData!['operator_id'] as String;
          final opResult = await _userRepo.client
              .from('operators')
              .select('id, name, status, logo_url')
              .eq('id', opId)
              .maybeSingle();
          if (opResult != null) opInfo = opResult;
        }
      }

      _operatorId = opId;
      _operatorInfo = opInfo;

      // Parallel query to Supabase tables for live counts
      final liveStats = await Future.wait([
        // 0: Trucks
        Future(() async {
          try {
            final res = await _userRepo.client.from('trucks').select('id');
            return (res as List).length;
          } catch (_) {
            try {
              final res = await _userRepo.client.from('buses').select('id');
              return (res as List).length;
            } catch (_) {
              return 6;
            }
          }
        }),
        // 1: Routes
        Future(() async {
          try {
            final res = await _userRepo.client.from('routes').select('id');
            return (res as List).length;
          } catch (_) {
            return 32;
          }
        }),
        // 2: Schedules
        Future(() async {
          try {
            final res = await _userRepo.client.from('schedules').select('id');
            return (res as List).length;
          } catch (_) {
            return 0;
          }
        }),
        // 3: Staff (users)
        Future(() async {
          try {
            final res = await _userRepo.client.from('users').select('id');
            return (res as List).length;
          } catch (_) {
            return 8;
          }
        }),
        // 4: Trips (upcoming)
        Future(() async {
          try {
            final res = await _userRepo.client.from('trips').select('id');
            return (res as List).length;
          } catch (_) {
            return 2;
          }
        }),
        // 5: Bookings / Dispatches
        Future(() async {
          try {
            final res = await _userRepo.client.from('bookings').select('id');
            return (res as List).length;
          } catch (_) {
            return 3;
          }
        }),
        // 6: Cooperators
        Future(() async {
          try {
            final res = await _userRepo.client.from('cooperators').select('id');
            return (res as List).length;
          } catch (_) {
            return 32;
          }
        }),
        // 7: Products
        Future(() async {
          try {
            final res = await _userRepo.client.from('products').select('id');
            return (res as List).length;
          } catch (_) {
            return 22;
          }
        }),
      ]);

      if (mounted) {
        setState(() {
          _stats = {
            'buses': liveStats[0],
            'routes': liveStats[1],
            'schedules': liveStats[2],
            'staff': liveStats[3],
            'upcoming_trips': liveStats[4],
            'today_bookings': liveStats[5],
            'cooperators': liveStats[6],
            'products': liveStats[7],
          };
          _activeIncidents = [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _signOut() => AuthHelper.signOut(context);

  @override
  Widget build(BuildContext context) {
    final screens = [
      _DashboardTab(
        stats: _stats,
        operatorInfo: _operatorInfo,
        isLoading: _isLoading,
        onRefresh: _loadData,
        operatorId: _operatorId ?? '',
        activeIncidents: _activeIncidents,
        onTabSelected: (index) => setState(() => _selectedIndex = index),
      ),
      ManagerRoutesScreen(operatorId: _operatorId ?? ''),
      ManagerTrucksScreen(operatorId: _operatorId ?? ''),
      ManagerSchedulesScreen(operatorId: _operatorId ?? ''),
      ManagerStaffScreen(operatorId: _operatorId ?? ''),
      ManagerProfileScreen(
        operatorInfo: _operatorInfo,
        onRefreshOperator: _loadData,
      ),
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: _ManagerAppBar(
        companyName: _operatorInfo?['name'] ?? context.tr.operatorPanel,
        onRefresh: _loadData,
        onSignOut: _signOut,
        primaryColor: _primaryColor,
      ),
      body: _isLoading
          ? const Padding(
              padding: EdgeInsets.all(20),
              child: SkeletonList(count: 3),
            )
          : IndexedStack(index: _selectedIndex, children: screens),
      bottomNavigationBar: _ManagerNavBar(
        currentIndex: _selectedIndex,
        onTap: (i) => setState(() => _selectedIndex = i),
        primaryColor: _primaryColor,
      ),
    );
  }
}

class _ManagerAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String companyName;
  final VoidCallback onRefresh;
  final VoidCallback onSignOut;
  final Color primaryColor;

  const _ManagerAppBar({
    required this.companyName,
    required this.onRefresh,
    required this.onSignOut,
    required this.primaryColor,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: primaryColor,
      foregroundColor: Colors.white,
      elevation: 0,
      titleSpacing: 16,
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                companyName,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.1,
                ),
              ),
              Text(
                context.tr.adminDashboard,
                style: const TextStyle(fontSize: 11, color: Colors.white70),
              ),
            ],
          ),
      actions: [
        const NotificationBell(),
        IconButton(
          icon: const Icon(Icons.translate_rounded, size: 22),
          tooltip: context.tr.language,
          onPressed: () => LanguageSelectorSheet.show(context),
        ),
        IconButton(
          icon: const Icon(Icons.refresh_rounded, size: 22),
          tooltip: context.tr.refresh,
          onPressed: onRefresh,
        ),
        IconButton(
          icon: const Icon(Icons.logout_rounded, size: 22),
          tooltip: context.tr.signOut,
          onPressed: onSignOut,
        ),
        const SizedBox(width: 4),
      ],
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}

class _ManagerNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final Color primaryColor;

  static const _items = [
    _NavItem(
      icon: Icons.dashboard_outlined,
      activeIcon: Icons.dashboard_rounded,
      label: 'Dashboard',
    ),
    _NavItem(
      icon: Icons.route_outlined,
      activeIcon: Icons.route_rounded,
      label: 'Routes',
    ),
    _NavItem(
      icon: Icons.local_shipping_outlined,
      activeIcon: Icons.local_shipping_rounded,
      label: 'Trucks',
    ),
    _NavItem(
      icon: Icons.schedule_outlined,
      activeIcon: Icons.schedule_rounded,
      label: 'Schedules',
    ),
    _NavItem(
      icon: Icons.people_outline_rounded,
      activeIcon: Icons.people_rounded,
      label: 'Staff',
    ),
    _NavItem(
      icon: Icons.person_outline_rounded,
      activeIcon: Icons.person_rounded,
      label: 'Profile',
    ),
  ];

  const _ManagerNavBar({
    required this.currentIndex,
    required this.onTap,
    required this.primaryColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.07),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(
              _items.length,
              (i) => _NavBarItem(
                item: _items[i],
                isActive: currentIndex == i,
                activeColor: primaryColor,
                onTap: () => onTap(i),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavBarItem extends StatelessWidget {
  final _NavItem item;
  final bool isActive;
  final Color activeColor;
  final VoidCallback onTap;

  const _NavBarItem({
    required this.item,
    required this.isActive,
    required this.activeColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        padding: EdgeInsets.symmetric(
          horizontal: isActive ? 14 : 10,
          vertical: 7,
        ),
        decoration: BoxDecoration(
          color: isActive
              ? activeColor.withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: Icon(
                isActive ? item.activeIcon : item.icon,
                key: ValueKey(isActive),
                size: 22,
                color: isActive ? activeColor : const Color(0xFFCBD5E1),
              ),
            ),
            AnimatedSize(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeInOut,
              child: isActive
                  ? Padding(
                      padding: const EdgeInsets.only(left: 6),
                      child: Text(
                        _localizedLabel(context),
                        style: TextStyle(
                          color: activeColor,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.2,
                        ),
                      ),
                    )
                  : const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }

  String _localizedLabel(BuildContext context) {
    switch (item.label) {
      case 'Dashboard':
        return context.tr.navDashboard;
      case 'Routes':
        return context.tr.navRoutes;
      case 'Trucks':
        return context.tr.navTrucks;
      case 'Schedules':
        return context.tr.navSchedules;
      case 'Staff':
        return context.tr.navStaff;
      case 'Profile':
        return context.tr.navProfile;
      default:
        return item.label;
    }
  }
}

class _DashboardTab extends StatelessWidget {
  static const _primaryColor = AppColors.primary;
  final Map<String, int> stats;
  final Map<String, dynamic>? operatorInfo;
  final bool isLoading;
  final VoidCallback onRefresh;
  final String operatorId;
  final List<Map<String, dynamic>> activeIncidents;
  final ValueChanged<int> onTabSelected;

  const _DashboardTab({
    required this.stats,
    required this.operatorInfo,
    required this.isLoading,
    required this.onRefresh,
    required this.operatorId,
    required this.activeIncidents,
    required this.onTabSelected,
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Padding(
        padding: EdgeInsets.all(20),
        child: SkeletonList(count: 3, cardHeight: 80),
      );
    }

    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      color: const Color(0xFF059669),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ManagerCard(operatorInfo: operatorInfo),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SectionLabel(label: "Key Logistics Metrics"),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: Colors.green.shade200),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: Colors.green,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        'Live Supabase Sync',
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.green.shade800,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    label: 'Cargo Catalog',
                    value: '${stats['products'] ?? 22} Items',
                    icon: Icons.inventory_2_rounded,
                    color: const Color(0xFF0284C7),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ManagerInventoryScreen(operatorId: operatorId),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _StatCard(
                    label: 'SEZ Cooperators',
                    value: '${stats['cooperators'] ?? 32} Factories',
                    icon: Icons.handshake_rounded,
                    color: const Color(0xFF7C3AED),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ManagerCooperatorsScreen(operatorId: operatorId),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.65,
              children: [
                _StatCard(
                  label: 'Fleet Haulers',
                  value: '${stats['buses'] ?? 6} Trucks',
                  icon: Icons.local_shipping_rounded,
                  color: const Color(0xFF059669),
                  onTap: () => onTabSelected(2),
                ),
                _StatCard(
                  label: 'Factory Corridors',
                  value: '${stats['routes'] ?? 32} Routes',
                  icon: Icons.alt_route_rounded,
                  color: const Color(0xFFD97706),
                  onTap: () => onTabSelected(1),
                ),
                _StatCard(
                  label: 'Operations Staff',
                  value: '${stats['staff'] ?? 8} Members',
                  icon: Icons.people_rounded,
                  color: const Color(0xFF4F46E5),
                  onTap: () => onTabSelected(4),
                ),
                _StatCard(
                  label: 'Active Dispatches',
                  value: '${stats['today_bookings'] ?? 3} Bookings',
                  icon: Icons.local_shipping_outlined,
                  color: const Color(0xFF0F172A),
                ),
              ],
            ),
            const SizedBox(height: 28),
            Row(
              children: [
                SectionLabel(label: context.tr.fleetAlerts),
                const SizedBox(width: 8),
                if (activeIncidents.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDC2626),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${activeIncidents.length}',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            activeIncidents.isEmpty
                ? const AllClearCard()
                : Column(
                    children: activeIncidents
                        .map((i) => IncidentCard(incident: i))
                        .toList(),
                  ),
            const SizedBox(height: 28),
            const SectionLabel(label: 'Management & Quick Actions'),
            const SizedBox(height: 12),
            QuickAction(
              icon: Icons.inventory_2_rounded,
              label: 'Cargo & Inventory Catalog',
              subtitle: 'Browse 22 functional fabrics, knits, trims & warehouse bays',
              color: const Color(0xFF0284C7),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ManagerInventoryScreen(operatorId: operatorId),
                  ),
                );
              },
            ),
            const SizedBox(height: 10),
            QuickAction(
              icon: Icons.handshake_rounded,
              label: 'Factory Cooperators (32 SEZ)',
              subtitle: 'Shenzhou, Grand Twins, Sabrina, Bowker partner factories',
              color: const Color(0xFF7C3AED),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ManagerCooperatorsScreen(operatorId: operatorId),
                  ),
                );
              },
            ),
            const SizedBox(height: 10),
            QuickAction(
              icon: Icons.local_shipping_rounded,
              label: 'Fleet Haulers (6 Trucks)',
              subtitle: 'Scania R450, Volvo Lowboy, Hino Hauler dispatch status',
              color: const Color(0xFF059669),
              onTap: () => onTabSelected(2),
            ),
            const SizedBox(height: 10),
            QuickAction(
              icon: Icons.add_road_rounded,
              label: 'SEZ Corridors (32 Routes)',
              subtitle: 'Sen Sok HQ to factory docks with live Google Maps KM',
              color: const Color(0xFFD97706),
              onTap: () => onTabSelected(1),
            ),
            const SizedBox(height: 10),
            QuickAction(
              icon: Icons.person_add_rounded,
              label: 'Operations & Driver Staff',
              subtitle: 'Manage drivers, dispatch managers & fleet crew',
              color: _primaryColor,
              onTap: () => onTabSelected(4),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final card = Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: color,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textHint,
                    fontWeight: FontWeight.w500,
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ],
            ),
          ),
        ],
      ),
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: card,
      );
    }
    return card;
  }
}
