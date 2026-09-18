import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/error/result.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/cooperator_model.dart';
import '../../../repositories/cooperator_repository.dart';

class ManagerCooperatorsScreen extends StatefulWidget {
  final String operatorId;
  const ManagerCooperatorsScreen({super.key, required this.operatorId});

  @override
  State<ManagerCooperatorsScreen> createState() => _ManagerCooperatorsScreenState();
}

class _ManagerCooperatorsScreenState extends State<ManagerCooperatorsScreen> {
  final CooperatorRepository _coopRepo = CooperatorRepository();

  List<CooperatorModel> _allCooperators = [];
  List<CooperatorModel> _filteredCooperators = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String _selectedCategory = 'All';

  final List<String> _categories = [
    'All',
    'Cut & Sew (កាត់ដេរ)',
    'Knitting & Spinning (ត្បាញ & ប៉ាក់)',
    'Embroidery & Screen Printing (ប៉ាក់ & បោះពុម្ព)',
    'Dyeing & Finishing (ជ្រលក់ & កែច្នៃ)',
    'Accessories & Trims (គ្រឿងបន្លាស់)',
    'Printing & Packaging (វេចខ្ចប់)',
  ];

  @override
  void initState() {
    super.initState();
    _loadCooperators();
  }

  Future<void> _loadCooperators() async {
    setState(() => _isLoading = true);
    final result = await _coopRepo.getCooperators();
    if (mounted) {
      setState(() {
        if (result is Success<List<CooperatorModel>>) {
          _allCooperators = result.data;
        } else {
          _allCooperators = [];
        }
        _filter();
        _isLoading = false;
      });
    }
  }

  void _filter() {
    final query = _searchQuery.toLowerCase().trim();
    setState(() {
      _filteredCooperators = _allCooperators.where((c) {
        final matchesSearch = query.isEmpty ||
            c.name.toLowerCase().contains(query) ||
            c.shortName.toLowerCase().contains(query) ||
            c.contactPerson.toLowerCase().contains(query) ||
            c.sezZone.toLowerCase().contains(query) ||
            c.province.toLowerCase().contains(query) ||
            c.code.toLowerCase().contains(query);

        final matchesCategory = _selectedCategory == 'All' ||
            c.category.toLowerCase().contains(_selectedCategory.toLowerCase().split(' ').first);

        return matchesSearch && matchesCategory;
      }).toList();
    });
  }

  Future<void> _makePhoneCall(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^\d+]'), '');
    final uri = Uri.parse('tel:$cleanPhone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _sendEmail(String email) async {
    final uri = Uri.parse('mailto:$email');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _showDetailSheet(CooperatorModel coop) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _CooperatorDetailSheet(
        coop: coop,
        onCall: () => _makePhoneCall(coop.phone),
        onEmail: () => _sendEmail(coop.email),
      ),
    );
  }

  void _showAddSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _AddCooperatorSheet(
        onSaved: () {
          _loadCooperators();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Factory Cooperators',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            Text(
              '${_allCooperators.length} SEZ Garment & Textile Manufacturing Hubs',
              style: const TextStyle(fontSize: 11, color: Colors.white70),
            ),
          ],
        ),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh Cooperators',
            onPressed: _loadCooperators,
          ),
          IconButton(
            icon: const Icon(Icons.add_business_rounded),
            tooltip: 'Add Factory Partner',
            onPressed: _showAddSheet,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Column(
              children: [
                // Search Input
                TextField(
                  onChanged: (val) {
                    _searchQuery = val;
                    _filter();
                  },
                  decoration: InputDecoration(
                    hintText: 'Search factory, SEZ zone, contact person...',
                    hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                    prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF64748B), size: 20),
                    filled: true,
                    fillColor: const Color(0xFFF1F5F9),
                    contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                // Category Pills
                SizedBox(
                  height: 34,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _categories.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (ctx, i) {
                      final cat = _categories[i];
                      final isSelected = _selectedCategory == cat;
                      return ChoiceChip(
                        label: Text(cat),
                        selected: isSelected,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() {
                              _selectedCategory = cat;
                              _filter();
                            });
                          }
                        },
                        labelStyle: TextStyle(
                          fontSize: 11,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          color: isSelected ? Colors.white : const Color(0xFF475569),
                        ),
                        selectedColor: AppColors.primary,
                        backgroundColor: const Color(0xFFF1F5F9),
                        side: BorderSide.none,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // Count bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Text(
                  'Showing ${_filteredCooperators.length} of ${_allCooperators.length} factory partners',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                ),
                const Spacer(),
                const Icon(Icons.verified_rounded, size: 14, color: Color(0xFF10B981)),
                const SizedBox(width: 4),
                const Text(
                  'Verified SEZ Partners',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF10B981)),
                ),
              ],
            ),
          ),

          // List View
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredCooperators.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.factory_outlined, size: 48, color: Colors.grey.shade400),
                            const SizedBox(height: 12),
                            Text(
                              'No factory cooperators found',
                              style: TextStyle(fontSize: 14, color: Colors.grey.shade600, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadCooperators,
                        child: ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                          itemCount: _filteredCooperators.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (ctx, i) {
                            final coop = _filteredCooperators[i];
                            return _CooperatorCard(
                              coop: coop,
                              onTap: () => _showDetailSheet(coop),
                              onCall: () => _makePhoneCall(coop.phone),
                              onEmail: () => _sendEmail(coop.email),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

class _CooperatorCard extends StatelessWidget {
  final CooperatorModel coop;
  final VoidCallback onTap;
  final VoidCallback onCall;
  final VoidCallback onEmail;

  const _CooperatorCard({
    required this.coop,
    required this.onTap,
    required this.onCall,
    required this.onEmail,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Logo/Avatar + Factory Name + Tier
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFDE68A)),
                      ),
                      child: const Center(
                        child: Icon(Icons.factory_rounded, color: Color(0xFFD97706), size: 24),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            coop.name,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF0F172A),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  coop.code,
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF475569),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  coop.category,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: Color(0xFF64748B),
                                    fontWeight: FontWeight.w500,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFA7F3D0)),
                      ),
                      child: Text(
                        coop.tier,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF059669),
                        ),
                      ),
                    ),
                  ],
                ),
                const Divider(height: 20, color: Color(0xFFF1F5F9)),

                // Middle: SEZ Zone & Contact Director
                Row(
                  children: [
                    const Icon(Icons.location_on_rounded, size: 14, color: Color(0xFFEF4444)),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        '${coop.sezZone} • ${coop.province}',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.person_rounded, size: 14, color: Color(0xFF0284C7)),
                    const SizedBox(width: 4),
                    Text(
                      '${coop.contactPerson} (${coop.contactTitle})',
                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Bottom Action Buttons
                Row(
                  children: [
                    OutlinedButton.icon(
                      onPressed: onCall,
                      icon: const Icon(Icons.phone_rounded, size: 14, color: Color(0xFF059669)),
                      label: Text(
                        coop.phone,
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF059669)),
                      ),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        side: const BorderSide(color: Color(0xFFA7F3D0)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      onPressed: onEmail,
                      icon: const Icon(Icons.email_outlined, size: 18, color: Color(0xFF64748B)),
                      tooltip: coop.email,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    const Spacer(),
                    TextButton.icon(
                      onPressed: onTap,
                      icon: const Text(
                        'Details',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFFD97706)),
                      ),
                      label: const Icon(Icons.chevron_right_rounded, size: 16, color: Color(0xFFD97706)),
                      style: TextButton.styleFrom(padding: EdgeInsets.zero),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _CooperatorDetailSheet extends StatelessWidget {
  final CooperatorModel coop;
  final VoidCallback onCall;
  final VoidCallback onEmail;

  const _CooperatorDetailSheet({
    required this.coop,
    required this.onCall,
    required this.onEmail,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag Handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFCBD5E1),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Header
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.factory_rounded, color: Color(0xFFD97706), size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      coop.name,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                    ),
                    Text(
                      '${coop.code} • ${coop.tier}',
                      style: const TextStyle(fontSize: 12, color: Color(0xFFD97706), fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Profile Info Grid
          _buildInfoRow('Category', coop.category),
          _buildInfoRow('SEZ Special Economic Zone', coop.sezZone),
          _buildInfoRow('Province / Municipality', coop.province),
          _buildInfoRow('Plant Address', coop.address),
          _buildInfoRow('Tax ID (TIN)', coop.taxId),
          _buildInfoRow('Payment Terms', coop.paymentTerms),
          _buildInfoRow('Discount Rate', coop.discountRate),
          _buildInfoRow('Primary Transport Corridor', coop.primaryCorridor),
          const SizedBox(height: 16),

          // Contact Actions
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onCall,
                  icon: const Icon(Icons.phone_rounded, size: 16),
                  label: const Text('Call Director'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onEmail,
                  icon: const Icon(Icons.email_rounded, size: 16),
                  label: const Text('Send Email'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(
              label,
              style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 12, color: Color(0xFF1E293B), fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

class _AddCooperatorSheet extends StatefulWidget {
  final VoidCallback onSaved;
  const _AddCooperatorSheet({required this.onSaved});

  @override
  State<_AddCooperatorSheet> createState() => _AddCooperatorSheetState();
}

class _AddCooperatorSheetState extends State<_AddCooperatorSheet> {
  final _nameCtrl = TextEditingController();
  final _sezCtrl = TextEditingController();
  final _contactCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  String _selectedCategory = 'Cut & Sew (កាត់ដេរ)';
  bool _isSaving = false;

  final List<String> _cats = [
    'Cut & Sew (កាត់ដេរ)',
    'Knitting & Spinning (ត្បាញ & ប៉ាក់)',
    'Embroidery & Screen Printing (ប៉ាក់ & បោះពុម្ព)',
    'Dyeing & Finishing (ជ្រលក់ & កែច្នៃ)',
    'Accessories & Trims (គ្រឿងបន្លាស់)',
    'Printing & Packaging (វេចខ្ចប់)',
  ];

  Future<void> _submit() async {
    final name = _nameCtrl.text.trim();
    if (name.isEmpty) return;

    setState(() => _isSaving = true);
    final repo = CooperatorRepository();
    final newCoop = CooperatorModel(
      id: 'coop-${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      shortName: name.split(' ').first,
      code: 'COP-${name.substring(0, name.length > 4 ? 4 : name.length).toUpperCase()}-${DateTime.now().millisecondsSinceEpoch % 1000}',
      industry: _selectedCategory,
      category: _selectedCategory,
      tier: 'VIP Gold Partner',
      discountRate: '10% Corporate Off',
      paymentTerms: 'Net 30 Days',
      creditLimit: 25000.0,
      currentBalance: 0.0,
      contactPerson: _contactCtrl.text.trim().isEmpty ? 'General Manager' : _contactCtrl.text.trim(),
      contactTitle: 'Factory Director',
      phone: _phoneCtrl.text.trim().isEmpty ? '+855 23 888 999' : _phoneCtrl.text.trim(),
      email: _emailCtrl.text.trim().isEmpty ? 'info@factory.kh' : _emailCtrl.text.trim(),
      taxId: 'K002-${DateTime.now().millisecondsSinceEpoch % 1000000}',
      province: 'Phnom Penh',
      address: _sezCtrl.text.trim().isEmpty ? 'Phnom Penh Special Economic Zone (PPSEZ)' : _sezCtrl.text.trim(),
      primaryCorridor: 'Top Sports Textile HQ ⇄ Phnom Penh SEZ Corridor',
      logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80',
      sezZone: _sezCtrl.text.trim().isEmpty ? 'Phnom Penh SEZ' : _sezCtrl.text.trim(),
    );

    final res = await repo.saveCooperator(newCoop);
    setState(() => _isSaving = false);
    if (res is Success && mounted) {
      widget.onSaved();
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              const Text(
                'Add Factory Cooperator Partner',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: _nameCtrl,
                decoration: const InputDecoration(labelText: 'Factory Name *', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                decoration: const InputDecoration(labelText: 'Manufacturing Category', border: OutlineInputBorder()),
                items: _cats.map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 12)))).toList(),
                onChanged: (v) => setState(() => _selectedCategory = v!),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _sezCtrl,
                decoration: const InputDecoration(labelText: 'SEZ Industrial Zone / Address', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _contactCtrl,
                decoration: const InputDecoration(labelText: 'Contact Person / Director', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _phoneCtrl,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Phone Number', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email Address', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isSaving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Save Factory Partner', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
