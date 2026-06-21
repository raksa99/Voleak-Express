import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../l10n/tr_extension.dart';
import '../../../supabase_config.dart';

class ManagerStaffScreen extends StatefulWidget {
  final String operatorId;
  const ManagerStaffScreen({super.key, required this.operatorId});

  @override
  State<ManagerStaffScreen> createState() => _ManagerStaffScreenState();
}

class _ManagerStaffScreenState extends State<ManagerStaffScreen> {
  List<Map<String, dynamic>> _drivers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStaff();
  }

  Future<void> _loadStaff() async {
    setState(() => _isLoading = true);
    try {
      final data = await SupabaseConfig.client
          .from('users')
          .select('id, name, email, phone, role, status, card_id_url')
          .eq('operator_id', widget.operatorId)
          .eq('role', 'driver')
          .order('name');

      if (mounted) {
        setState(() {
          _drivers = List<Map<String, dynamic>>.from(data);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showAddStaffForm() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _StaffFormSheet(
        operatorId: widget.operatorId,
        defaultRole: 'driver',
        onSaved: _loadStaff,
      ),
    );
  }

  Future<void> _toggleStatus(String id, String current) async {
    final newStatus = current == 'active' ? 'suspended' : 'active';
    try {
      await SupabaseConfig.client
          .from('users')
          .update({'status': newStatus})
          .eq('id', id);
      _loadStaff();
      _showSnack(
        newStatus == 'active' ? context.tr.staffActivated : context.tr.staffSuspended,
      );
    } catch (e) {
      _showSnack(context.tr.failedToUpdate('$e'), isError: true);
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: isError
            ? const Color(0xFFEF4444)
            : const Color(0xFF059669),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _StaffList(
              staff: _drivers,
              role: 'driver',
              emptyMessage: context.tr.noDriversYet,
              emptySubtitle: context.tr.addDriverSubtitle,
              onToggle: _toggleStatus,
            ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'fab_staff',
        onPressed: _showAddStaffForm,
        backgroundColor: const Color(0xFF9E7E38),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.person_add_rounded),
        label: Text(
          context.tr.addDriver,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}

// ─── Staff List ───────────────────────────────────────────────────────────────

class _StaffList extends StatelessWidget {
  final List<Map<String, dynamic>> staff;
  final String role;
  final String emptyMessage;
  final String emptySubtitle;
  final Function(String, String) onToggle;

  const _StaffList({
    required this.staff,
    required this.role,
    required this.emptyMessage,
    required this.emptySubtitle,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    if (staff.isEmpty) {
      return _EmptyState(
        icon: role == 'driver'
            ? Icons.drive_eta_rounded
            : Icons.confirmation_number_rounded,
        message: emptyMessage,
        subtitle: emptySubtitle,
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: staff.length,
      itemBuilder: (context, index) {
        final s = staff[index];
        return _StaffCard(
          member: s,
          onToggle: () => onToggle(s['id'], s['status']),
        );
      },
    );
  }
}

// ─── Staff Card ───────────────────────────────────────────────────────────────

class _StaffCard extends StatelessWidget {
  final Map<String, dynamic> member;
  final VoidCallback onToggle;

  const _StaffCard({required this.member, required this.onToggle});

  void _showCardIdDialog(BuildContext context, String url, String name) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        clipBehavior: Clip.antiAlias,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AppBar(
              backgroundColor: const Color(0xFF9E7E38),
              foregroundColor: Colors.white,
              title: Text(
                '$name - ${context.tr.cardIdPhoto}',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              elevation: 0,
              leading: IconButton(
                icon: const Icon(Icons.close_rounded),
                onPressed: () => Navigator.pop(context),
              ),
            ),
            Container(
              color: const Color(0xFFF8FAFC),
              constraints: const BoxConstraints(maxHeight: 400),
              width: double.infinity,
              child: Image.network(
                url,
                fit: BoxFit.contain,
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24.0),
                      child: CircularProgressIndicator(color: Color(0xFF9E7E38)),
                    ),
                  );
                },
                errorBuilder: (context, error, stackTrace) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.broken_image_rounded, size: 48, color: Colors.grey),
                          SizedBox(height: 8),
                          Text('Failed to load image', style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final status = member['status'] as String;
    final role = member['role'] as String;
    final isActive = status == 'active';
    final cardIdUrl = member['card_id_url'] as String?;

    final roleColor = role == 'driver'
        ? const Color(0xFF1A73E8)
        : const Color(0xFF7C3AED);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Avatar
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: roleColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Center(
                child: Text(
                  (member['name'] as String)[0].toUpperCase(),
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: roleColor,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          member['name'] as String,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF111827),
                          ),
                        ),
                      ),
                      // Role badge
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: roleColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          role[0].toUpperCase() + role.substring(1),
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: roleColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(
                        Icons.email_outlined,
                        size: 12,
                        color: Color(0xFF9CA3AF),
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          member['email'] as String? ?? '—',
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF6B7280),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      const Icon(
                        Icons.phone_outlined,
                        size: 12,
                        color: Color(0xFF9CA3AF),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        member['phone'] as String? ?? '—',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF6B7280),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  // Status + toggle
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: isActive
                              ? const Color(0xFFD1FAE5)
                              : const Color(0xFFFEE2E2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: BoxDecoration(
                                color: isActive
                                    ? const Color(0xFF059669)
                                    : const Color(0xFFEF4444),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 5),
                            Text(
                              isActive ? context.tr.activeStatus : context.tr.suspendedStatus,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: isActive
                                    ? const Color(0xFF059669)
                                    : const Color(0xFFEF4444),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (cardIdUrl != null && cardIdUrl.isNotEmpty)
                        GestureDetector(
                          onTap: () => _showCardIdDialog(context, cardIdUrl, member['name'] ?? ''),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFF9E7E38).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: const Color(0xFF9E7E38).withOpacity(0.3),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.badge_rounded,
                                  size: 12,
                                  color: Color(0xFF9E7E38),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  context.tr.cardIdPhoto,
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF9E7E38),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      const Spacer(),
                      GestureDetector(
                        onTap: onToggle,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: isActive
                                ? const Color(0xFFFEE2E2)
                                : const Color(0xFFD1FAE5),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            isActive ? context.tr.suspend : context.tr.activate,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isActive
                                  ? const Color(0xFFEF4444)
                                  : const Color(0xFF059669),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Staff Form Sheet ─────────────────────────────────────────────────────────

class _StaffFormSheet extends StatefulWidget {
  final String operatorId;
  final String defaultRole;
  final VoidCallback onSaved;

  const _StaffFormSheet({
    required this.operatorId,
    required this.defaultRole,
    required this.onSaved,
  });

  @override
  State<_StaffFormSheet> createState() => _StaffFormSheetState();
}

class _StaffFormSheetState extends State<_StaffFormSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  late String _selectedRole;
  bool _isLoading = false;
  bool _obscurePassword = true;

  XFile? _selectedCardIdImage;
  Uint8List? _selectedCardIdBytes;

  @override
  void initState() {
    super.initState();
    _selectedRole = widget.defaultRole;
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickCardIdImage(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final image = await picker.pickImage(
        source: source,
        maxWidth: 1200,
        imageQuality: 85,
      );
      if (image != null) {
        final bytes = await image.readAsBytes();
        setState(() {
          _selectedCardIdImage = image;
          _selectedCardIdBytes = bytes;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to pick image: $e'),
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  void _showCardIdPickerSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              context.tr.cardIdPhoto,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Color(0xFF111827),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.pop(context);
                _pickCardIdImage(ImageSource.camera);
              },
              icon: const Icon(Icons.camera_alt_rounded),
              label: Text(context.tr.takePhoto),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF9E7E38),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.pop(context);
                _pickCardIdImage(ImageSource.gallery);
              },
              icon: const Icon(Icons.photo_library_rounded),
              label: Text(context.tr.importFromGallery),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF3F4F6),
                foregroundColor: const Color(0xFF374151),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                context.tr.cancel,
                style: const TextStyle(
                  color: Color(0xFF6B7280),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCardIdBytes == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(context.tr.cardIdRequired),
          backgroundColor: const Color(0xFFEF4444),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      );
      return;
    }
    setState(() => _isLoading = true);

    try {
      String email = _emailCtrl.text.trim();
      if (email.isEmpty) {
        final cleanPhone = _phoneCtrl.text.trim().replaceAll(RegExp(r'[^0-9+]'), '');
        email = '$cleanPhone@voleak.express';
      }

      // Step 1: Create Supabase auth account
      final response = await SupabaseConfig.client.auth.signUp(
        email: email,
        password: _passwordCtrl.text.trim(),
        data: {'name': _nameCtrl.text.trim(), 'phone': _phoneCtrl.text.trim()},
      );

      if (response.user == null) {
        throw Exception('Failed to create auth account');
      }

      // Upload Card ID image to storage
      String? cardIdUrl;
      if (_selectedCardIdBytes != null && _selectedCardIdImage != null) {
        final ext = _selectedCardIdImage!.name.split('.').last;
        final fileName = '${response.user!.id}_card_id_${DateTime.now().millisecondsSinceEpoch}.$ext';
        await SupabaseConfig.client.storage
            .from('staff-card-ids')
            .uploadBinary(fileName, _selectedCardIdBytes!);
        cardIdUrl = '${SupabaseConfig.storageUrl}/staff-card-ids/$fileName';
      }

      // Step 2: Update the auto-created users row with correct role
      await SupabaseConfig.client
          .from('users')
          .update({
            'name': _nameCtrl.text.trim(),
            'phone': _phoneCtrl.text.trim(),
            'role': _selectedRole,
            'operator_id': widget.operatorId,
            'status': 'active',
            'card_id_url': cardIdUrl,
          })
          .eq('id', response.user!.id);

      if (mounted) {
        Navigator.pop(context);
        widget.onSaved();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '${_selectedRole[0].toUpperCase()}${_selectedRole.substring(1)} added ✅',
            ),
            backgroundColor: const Color(0xFF059669),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(context.tr.failedToUpdate('$e')),
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: const Color(0xFFE5E7EB),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Text(
                context.tr.addStaffMember,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 20),

              // Card ID Selection Widget
              GestureDetector(
                onTap: _showCardIdPickerSheet,
                child: Container(
                  height: 140,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: _selectedCardIdBytes != null
                          ? const Color(0xFF059669)
                          : const Color(0xFF9E7E38).withOpacity(0.3),
                      style: BorderStyle.solid,
                      width: 1.5,
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: _selectedCardIdBytes != null
                        ? Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.memory(_selectedCardIdBytes!, fit: BoxFit.cover),
                              Positioned(
                                right: 8,
                                top: 8,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withOpacity(0.6),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.edit_rounded, color: Colors.white, size: 14),
                                      const SizedBox(width: 4),
                                      Text(
                                        context.tr.changePhoto,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          )
                        : Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF9E7E38).withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.credit_card_rounded,
                                  color: Color(0xFF9E7E38),
                                  size: 28,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                context.tr.insertCardId, // Khmer: បញ្ចូលអត្តសញ្ញាណប័ណ្ណ
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF9E7E38),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                context.tr.cardIdPhoto,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF9CA3AF),
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              _FormField(
                controller: _nameCtrl,
                label: context.tr.staffFullName,
                hint: context.tr.staffFullNameHint,
                icon: Icons.person_outline_rounded,
                validator: (v) => v!.isEmpty ? context.tr.required : null,
              ),
              const SizedBox(height: 14),
              _FormField(
                controller: _emailCtrl,
                label: context.tr.staffEmail,
                hint: context.tr.staffEmailHint,
                icon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
                validator: (v) {
                  if (v == null || v.isEmpty) return null;
                  if (!v.contains('@')) return context.tr.invalidEmail;
                  return null;
                },
              ),
              const SizedBox(height: 14),
              _FormField(
                controller: _phoneCtrl,
                label: context.tr.staffPhone,
                hint: context.tr.staffPhoneHint,
                icon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
                validator: (v) => v!.isEmpty ? context.tr.required : null,
              ),
              const SizedBox(height: 14),

              // Password field
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    context.tr.temporaryPassword,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF374151),
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _passwordCtrl,
                    obscureText: _obscurePassword,
                    validator: (v) {
                      if (v!.isEmpty) return context.tr.required;
                      if (v.length < 8) return context.tr.min8Chars;
                      return null;
                    },
                    decoration: InputDecoration(
                      hintText: context.tr.min8Chars,
                      hintStyle: const TextStyle(
                        color: Color(0xFF9CA3AF),
                        fontSize: 14,
                      ),
                      prefixIcon: const Icon(
                        Icons.lock_outline,
                        color: Color(0xFF6B7280),
                        size: 18,
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                          color: const Color(0xFF6B7280),
                          size: 18,
                        ),
                        onPressed: () => setState(
                          () => _obscurePassword = !_obscurePassword,
                        ),
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF9FAFB),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(
                          color: Color(0xFF059669),
                          width: 2,
                        ),
                      ),
                      errorBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFEF4444)),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 12,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFFBEB),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFFDE68A)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.info_outline_rounded,
                      color: Color(0xFFF59E0B),
                      size: 14,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        context.tr.staffInfoNote,
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF92400E),
                          height: 1.5,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(
                          context.tr.addDriver,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }
}



class _FormField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String hint;
  final IconData icon;
  final TextInputType keyboardType;
  final String? Function(String?)? validator;

  const _FormField({
    required this.controller,
    required this.label,
    required this.hint,
    required this.icon,
    this.keyboardType = TextInputType.text,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Color(0xFF374151),
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 14),
            prefixIcon: Icon(
              icon,
              color: const Color(0xFF6B7280),
              size: 18,
            ),
            filled: true,
            fillColor: const Color(0xFFF9FAFB),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF059669), width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFEF4444)),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 12,
            ),
          ),
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String message;
  final String subtitle;
  const _EmptyState({
    required this.icon,
    required this.message,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(50),
            ),
            child: Icon(icon, size: 40, color: const Color(0xFF9CA3AF)),
          ),
          const SizedBox(height: 16),
          Text(
            message,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF374151),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: const TextStyle(fontSize: 13, color: Color(0xFF9CA3AF)),
          ),
        ],
      ),
    );
  }
}
