import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/error/result.dart';
import '../../../core/utils/auth_helper.dart';
import '../../../l10n/tr_extension.dart';
import '../../../repositories/user_repository.dart';
import '../../../models/user_model.dart';
import '../../../shared/widgets/language_selector_sheet.dart';

class ManagerProfileScreen extends StatefulWidget {
  final Map<String, dynamic>? operatorInfo;
  final VoidCallback onRefreshOperator;

  const ManagerProfileScreen({
    super.key,
    required this.operatorInfo,
    required this.onRefreshOperator,
  });

  @override
  State<ManagerProfileScreen> createState() => _ManagerProfileScreenState();
}

class _ManagerProfileScreenState extends State<ManagerProfileScreen> {
  final _userRepo = UserRepository();
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _ageController = TextEditingController();
  final _nationalityController = TextEditingController();

  UserModel? _profile;
  bool _isLoading = true;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _ageController.dispose();
    _nationalityController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    final user = _userRepo.client.auth.currentUser;
    if (user == null) {
      // Demo Data
      setState(() {
        _profile = const UserModel(
          id: 'demo-manager-id',
          name: 'Voleak Operator',
          email: 'manager@voleakexpress.com',
          phone: '+855 12 345 678',
          role: 'manager',
          status: 'active',
          age: 32,
          nationality: 'Cambodian',
        );
        _nameController.text = _profile?.name ?? '';
        _phoneController.text = _profile?.phone ?? '';
        _ageController.text = _profile?.age?.toString() ?? '';
        _nationalityController.text = _profile?.nationality ?? '';
        _isLoading = false;
      });
      return;
    }

    final result = await _userRepo.getCurrentUser(user.id);
    if (mounted) {
      setState(() {
        _isLoading = false;
        if (result is Success<UserModel>) {
          _profile = result.data;
          _nameController.text = _profile?.name ?? '';
          _phoneController.text = _profile?.phone ?? '';
          _ageController.text = _profile?.age?.toString() ?? '';
          _nationalityController.text = _profile?.nationality ?? '';
        }
      });
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    final user = _userRepo.client.auth.currentUser;
    if (user == null) {
      // Mock save
      await Future.delayed(const Duration(milliseconds: 800));
      if (mounted) {
        setState(() {
          _isSaving = false;
          _profile = _profile?.copyWith(
            name: _nameController.text.trim(),
            phone: _phoneController.text.trim(),
            age: int.tryParse(_ageController.text.trim()),
            nationality: _nationalityController.text.trim(),
          );
        });
        _showSuccess(context.tr.profileUpdatedSuccess);
      }
      return;
    }

    final result = await _userRepo.updateProfile(
      userId: user.id,
      name: _nameController.text.trim(),
      phone: _phoneController.text.trim(),
      age: int.tryParse(_ageController.text.trim()),
      nationality: _nationalityController.text.trim(),
    );

    if (mounted) {
      setState(() => _isSaving = false);
      if (result is Success<void>) {
        _showSuccess(context.tr.profileUpdatedSuccess);
        _loadProfile();
      } else {
        _showError((result as Failure).message);
      }
    }
  }

  void _showSuccess(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: const Color(0xFF10B981),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  Future<void> _signOut() => AuthHelper.signOut(context);

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8FAFC),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final initials = _profile?.initials ?? 'OP';
    final hasLogo = widget.operatorInfo?['logo_url'] != null &&
        (widget.operatorInfo?['logo_url'] as String).startsWith('http');

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar & Role Section
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        gradient: AppGradients.primaryBlue,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        initials,
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _profile?.name ?? context.tr.myCompany,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryDark,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _profile?.email ?? '',
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE0F2FE),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        context.tr.operatorPanel,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0369A1),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Personal Details Card
              _buildSectionLabel(context.tr.profilePersonalDetails),
              const SizedBox(height: 12),
              Container(
                decoration: _cardDecoration(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    _buildTextField(
                      controller: _nameController,
                      label: context.tr.profileFullNameLabel,
                      icon: Icons.person_outline_rounded,
                      validator: (v) => v!.isEmpty ? context.tr.required : null,
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(
                      controller: _phoneController,
                      label: context.tr.bookingPhoneLabel,
                      icon: Icons.phone_android_outlined,
                      keyboardType: TextInputType.phone,
                      validator: (v) => v!.isEmpty ? context.tr.required : null,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: _buildTextField(
                            controller: _ageController,
                            label: context.tr.bookingAgeLabel,
                            icon: Icons.cake_outlined,
                            keyboardType: TextInputType.number,
                            validator: (v) {
                              if (v == null || v.isEmpty) return context.tr.required;
                              final age = int.tryParse(v);
                              if (age == null || age < 18 || age > 100) {
                                return context.tr.bookingEnterValidAge;
                              }
                              return null;
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildTextField(
                            controller: _nationalityController,
                            label: context.tr.bookingNationalityLabel,
                            icon: Icons.flag_outlined,
                            validator: (v) => v!.isEmpty ? context.tr.required : null,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton.icon(
                        onPressed: _isSaving ? null : _saveProfile,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        icon: _isSaving
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Colors.white,
                                ),
                              )
                            : const Icon(Icons.save_rounded, size: 20),
                        label: Text(
                          context.tr.profileSaveDetails,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Company Info Card
              _buildSectionLabel(context.tr.myCompany),
              const SizedBox(height: 12),
              Container(
                decoration: _cardDecoration(),
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    Container(
                      width: 54,
                      height: 54,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(12),
                        image: hasLogo
                            ? DecorationImage(
                                image: NetworkImage(
                                    widget.operatorInfo!['logo_url'] as String),
                                fit: BoxFit.cover,
                              )
                            : null,
                      ),
                      alignment: Alignment.center,
                      child: hasLogo
                          ? null
                          : const Icon(Icons.business_rounded,
                              color: Color(0xFF64748B), size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.operatorInfo?['name'] ?? context.tr.myCompany,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Container(
                                width: 7,
                                height: 7,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF10B981),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                widget.operatorInfo?['status']?.toUpperCase() ??
                                    'ACTIVE',
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF10B981),
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
              const SizedBox(height: 28),

              // Settings & Sign Out Section
              _buildSectionLabel(context.tr.settings),
              const SizedBox(height: 12),
              Container(
                decoration: _cardDecoration(),
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.translate_rounded,
                          color: Color(0xFF475569)),
                      title: Text(
                        context.tr.language,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            Localizations.localeOf(context)
                                .languageCode
                                .toUpperCase(),
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF64748B),
                            ),
                          ),
                          const Icon(Icons.chevron_right_rounded,
                              color: Color(0xFF94A3B8)),
                        ],
                      ),
                      onTap: () => LanguageSelectorSheet.show(context),
                    ),
                    const Divider(height: 1, color: Color(0xFFF1F5F9)),
                    ListTile(
                      leading: const Icon(Icons.logout_rounded,
                          color: Color(0xFFEF4444)),
                      title: Text(
                        context.tr.profileSignOut,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFEF4444),
                        ),
                      ),
                      trailing: const Icon(Icons.chevron_right_rounded,
                          color: Color(0xFFFCA5A5)),
                      onTap: _signOut,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w800,
        color: Color(0xFF64748B),
        letterSpacing: 0.5,
      ),
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
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
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: Color(0xFF475569),
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          validator: validator,
          decoration: InputDecoration(
            prefixIcon: Icon(icon, color: const Color(0xFF64748B), size: 18),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
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
              borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
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
