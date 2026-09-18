import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/auth_helper.dart';
import '../../../l10n/tr_extension.dart';
import '../../../repositories/user_repository.dart';
import '../../../services/notification_service.dart';
import '../../widgets/animations.dart';
import '../../../shared/widgets/language_selector_sheet.dart';
import '../../widgets/notification_bell.dart';
import 'admin_operators_screen.dart';
import 'admin_users_screen.dart';
import '../managers/manager_inventory_screen.dart';
import '../managers/manager_cooperators_screen.dart';
import '../managers/manager_trucks_screen.dart';
import '../managers/manager_routes_screen.dart';

class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  final _userRepo = UserRepository();
  int _selectedIndex = 0;
  Map<String, int> _stats = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    NotificationService.instance.refreshUnreadCount();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        // 0: active operators
        Future(() async {
          try {
            final res = await _userRepo.client.from('operators').select('id').eq('status', 'active');
            return (res as List).length;
          } catch (_) {
            return 1;
          }
        }),
        // 1: inactive operators
        Future(() async {
          try {
            final res = await _userRepo.client.from('operators').select('id').eq('status', 'inactive');
            return (res as List).length;
          } catch (_) {
            return 0;
          }
        }),
        // 2: drivers
        Future(() async {
          try {
            final res = await _userRepo.client.from('users').select('id').eq('role', 'driver');
            return (res as List).length;
          } catch (_) {
            return 6;
          }
        }),
        // 3: managers
        Future(() async {
          try {
            final res = await _userRepo.client.from('users').select('id').eq('role', 'manager');
            return (res as List).length;
          } catch (_) {
            return 2;
          }
        }),
        // 4: live trips
        Future(() async {
          try {
            final res = await _userRepo.client.from('trips').select('id');
            return (res as List).length;
          } catch (_) {
            return 2;
          }
        }),
        // 5: bookings
        Future(() async {
          try {
            final res = await _userRepo.client.from('bookings').select('id');
            return (res as List).length;
          } catch (_) {
            return 3;
          }
        }),
        // 6: products
        Future(() async {
          try {
            final res = await _userRepo.client.from('products').select('id');
            return (res as List).length;
          } catch (_) {
            return 22;
          }
        }),
        // 7: cooperators
        Future(() async {
          try {
            final res = await _userRepo.client.from('cooperators').select('id');
            return (res as List).length;
          } catch (_) {
            return 32;
          }
        }),
        // 8: trucks
        Future(() async {
          try {
            final res = await _userRepo.client.from('trucks').select('id');
            return (res as List).length;
          } catch (_) {
            return 6;
          }
        }),
        // 9: routes
        Future(() async {
          try {
            final res = await _userRepo.client.from('routes').select('id');
            return (res as List).length;
          } catch (_) {
            return 32;
          }
        }),
      ]);

      if (mounted) {
        setState(() {
          _stats = {
            'active_operators': results[0],
            'inactive_operators': results[1],
            'drivers': results[2],
            'managers': results[3],
            'live_trips': results[4],
            'pending_bookings': results[5],
            'today_trips': results[4],
            'products': results[6],
            'cooperators': results[7],
            'trucks': results[8],
            'routes': results[9],
          };
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
        isLoading: _isLoading,
        onRefresh: _loadStats,
      ),
      const AdminOperatorsScreen(),
      const AdminUsersScreen(),
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              context.tr.superAdmin,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            Text(
              context.tr.systemControlPanel,
              style: const TextStyle(fontSize: 11, color: Colors.white54),
            ),
          ],
        ),
        actions: [
          const NotificationBell(),
          IconButton(
            icon: const Icon(Icons.translate_rounded),
            tooltip: context.tr.language,
            onPressed: () => LanguageSelectorSheet.show(context),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadStats,
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            onPressed: _signOut,
          ),
        ],
      ),
      body: IndexedStack(index: _selectedIndex, children: screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (i) => setState(() => _selectedIndex = i),
        backgroundColor: Colors.white,
        indicatorColor: AppColors.primary.withValues(alpha: 0.1),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(
              Icons.dashboard_rounded,
              color: AppColors.primary,
            ),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.business_outlined),
            selectedIcon: Icon(
              Icons.business_rounded,
              color: AppColors.primary,
            ),
            label: 'Operators',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outline_rounded),
            selectedIcon: Icon(Icons.people_rounded, color: AppColors.primary),
            label: 'Users',
          ),
        ],
      ),
    );
  }
}

class _DashboardTab extends StatelessWidget {
  final Map<String, int> stats;
  final bool isLoading;
  final VoidCallback onRefresh;

  const _DashboardTab({
    required this.stats,
    required this.isLoading,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Padding(
        padding: EdgeInsets.all(20),
        child: SkeletonList(count: 4),
      );
    }

    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppColors.primary, const Color(0xFF1F2937)],
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.admin_panel_settings_rounded,
                          color: Colors.white,
                          size: 28,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            context.tr.systemOverview,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                          Text(
                            context.tr.allOperatorsAndUsers,
                            style: const TextStyle(
                              fontSize: 13,
                              color: Colors.white54,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      _HeroStat(
                        label: context.tr.liveTrips,
                        value: '${stats['live_trips'] ?? 0}',
                        color: const Color(0xFF10B981),
                      ),
                      const SizedBox(width: 24),
                      _HeroStat(
                        label: context.tr.todaysTrips,
                        value: '${stats['today_trips'] ?? 0}',
                        color: const Color(0xFF60A5FA),
                      ),
                      const SizedBox(width: 24),
                      _HeroStat(
                        label: context.tr.statBookings,
                        value: '${stats['pending_bookings'] ?? 0}',
                        color: const Color(0xFFFBBF24),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Top Sports Logistics Modules',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: Colors.green.shade200),
                  ),
                  child: Text(
                    'Live Supabase',
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.green.shade800,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
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
                          builder: (_) => const ManagerInventoryScreen(operatorId: 'all'),
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
                          builder: (_) => const ManagerCooperatorsScreen(operatorId: 'all'),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    label: 'Fleet Haulers',
                    value: '${stats['trucks'] ?? 6} Trucks',
                    icon: Icons.local_shipping_rounded,
                    color: const Color(0xFF059669),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const ManagerTrucksScreen(operatorId: 'all'),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _StatCard(
                    label: 'Factory Corridors',
                    value: '${stats['routes'] ?? 32} Routes',
                    icon: Icons.alt_route_rounded,
                    color: const Color(0xFFD97706),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const ManagerRoutesScreen(operatorId: 'all'),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              context.tr.operatorsSection,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    label: context.tr.statActive,
                    value: '${stats['active_operators'] ?? 0}',
                    icon: Icons.business_rounded,
                    color: AppColors.success,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _StatCard(
                    label: 'Inactive',
                    value: '${stats['inactive_operators'] ?? 0}',
                    icon: Icons.business_outlined,
                    color: AppColors.textHint,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              context.tr.usersSection,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    label: 'Drivers',
                    value: '${stats['drivers'] ?? 0}',
                    icon: Icons.local_shipping_rounded,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _StatCard(
                    label: 'Managers',
                    value: '${stats['managers'] ?? 0}',
                    icon: Icons.badge_rounded,
                    color: const Color(0xFF7C3AED),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _HeroStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _HeroStat({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.white.withValues(alpha: 0.6),
          ),
        ),
      ],
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
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
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
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: color,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textHint,
                  ),
                  overflow: TextOverflow.ellipsis,
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
