import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../l10n/tr_extension.dart';
import '../../../supabase_config.dart';
import '../../../core/theme/app_theme.dart';

class ManagerTrucksScreen extends StatefulWidget {
  final String operatorId;
  const ManagerTrucksScreen({super.key, required this.operatorId});

  @override
  State<ManagerTrucksScreen> createState() => _ManagerTrucksScreenState();
}

class _ManagerTrucksScreenState extends State<ManagerTrucksScreen> {
  List<Map<String, dynamic>> _trucks = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTrucks();
  }

  Future<void> _loadTrucks() async {
    setState(() => _isLoading = true);
    try {
      final data = await SupabaseConfig.client
          .from('buses')
          .select('id, plate_number, model, capacity, status, image_url')
          .eq('operator_id', widget.operatorId)
          .order('created_at', ascending: false);
      if (mounted) {
        setState(() {
          _trucks = List<Map<String, dynamic>>.from(data);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showTruckForm({Map<String, dynamic>? existing}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _TruckFormSheet(
        operatorId: widget.operatorId,
        existing: existing,
        onSaved: _loadTrucks,
      ),
    );
  }

  Future<void> _updateStatus(String id, String status) async {
    try {
      await SupabaseConfig.client
          .from('buses')
          .update({'status': status})
          .eq('id', id);
      _loadTrucks();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(context.tr.failedToUpdate('$e')),
          backgroundColor: const Color(0xFFEF4444),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadTrucks,
              child: _trucks.isEmpty
                  ? _EmptyState(
                      icon: Icons.local_shipping_rounded,
                      message: context.tr.noTrucksYet,
                      subtitle: context.tr.addYourFirstTruck,
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _trucks.length,
                      itemBuilder: (context, index) {
                        final t = _trucks[index];
                        return _TruckCard(
                          truck: t,
                          onEdit: () => _showTruckForm(existing: t),
                          onStatusChange: (status) =>
                              _updateStatus(t['id'], status),
                        );
                      },
                    ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'fab_trucks',
        onPressed: () => _showTruckForm(),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: Text(
          context.tr.addTruck,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}

// ─── Truck Card ───────────────────────────────────────────────────────────────

class _TruckCard extends StatelessWidget {
  final Map<String, dynamic> truck;
  final VoidCallback onEdit;
  final Function(String) onStatusChange;

  const _TruckCard({
    required this.truck,
    required this.onEdit,
    required this.onStatusChange,
  });

  Color _statusColor(String s) {
    switch (s) {
      case 'active':
        return const Color(0xFF059669);
      case 'maintenance':
        return const Color(0xFFF59E0B);
      default:
        return const Color(0xFF9CA3AF);
    }
  }

  IconData _statusIcon(String s) {
    switch (s) {
      case 'active':
        return Icons.check_circle_rounded;
      case 'maintenance':
        return Icons.build_rounded;
      default:
        return Icons.cancel_rounded;
    }
  }

  String _statusText(BuildContext context, String s) {
    final t = context.tr;
    switch (s) {
      case 'active':
        return t.active;
      case 'maintenance':
        return t.underMaintenance;
      default:
        return t.inactive;
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = truck['status'] as String;
    final color = _statusColor(status);

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
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    width: 48,
                    height: 48,
                    color: color.withOpacity(0.1),
                    child: truck['image_url'] != null && (truck['image_url'] as String).isNotEmpty
                        ? Image.network(
                            truck['image_url'],
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Icon(
                                Icons.local_shipping_rounded,
                                color: color,
                                size: 24,
                              );
                            },
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return Center(
                                child: SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: color,
                                    value: loadingProgress.expectedTotalBytes != null
                                        ? loadingProgress.cumulativeBytesLoaded /
                                            loadingProgress.expectedTotalBytes!
                                        : null,
                                  ),
                                ),
                              );
                            },
                          )
                        : Icon(
                            Icons.local_shipping_rounded,
                            color: color,
                            size: 24,
                          ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        truck['plate_number'] ?? '',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF111827),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        truck['model'] ?? '',
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF6B7280),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(
                            Icons.inventory_2_rounded,
                            size: 12,
                            color: Color(0xFF9CA3AF),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            context.tr.truckCapacity(truck['capacity'] as int),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF6B7280),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                // Status
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(_statusIcon(status), size: 12, color: color),
                          const SizedBox(width: 4),
                          Text(
                            _statusText(context, status),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: color,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFF3F4F6)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              children: [
                TextButton.icon(
                  onPressed: onEdit,
                  icon: const Icon(Icons.edit_rounded, size: 16),
                  label: Text(context.tr.edit),
                  style: TextButton.styleFrom(
                    foregroundColor: const Color(0xFF1A73E8),
                  ),
                ),
                // Status toggle popup
                PopupMenuButton<String>(
                  onSelected: onStatusChange,
                  itemBuilder: (_) => [
                    PopupMenuItem(
                      value: 'active',
                      child: Row(
                        children: [
                          const Icon(
                            Icons.check_circle_rounded,
                            color: Color(0xFF059669),
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(context.tr.setActive),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'maintenance',
                      child: Row(
                        children: [
                          const Icon(
                            Icons.build_rounded,
                            color: Color(0xFFF59E0B),
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(context.tr.underMaintenance),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'retired',
                      child: Row(
                        children: [
                          const Icon(
                            Icons.cancel_rounded,
                            color: Color(0xFF9CA3AF),
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(context.tr.retireTruck),
                        ],
                      ),
                    ),
                  ],
                  child: TextButton.icon(
                    onPressed: null,
                    icon: const Icon(Icons.swap_horiz_rounded, size: 16),
                    label: Text(context.tr.status),
                    style: TextButton.styleFrom(
                      foregroundColor: const Color(0xFF6B7280),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Truck Form Sheet ────────────────────────────────────────────────────────

class _TruckFormSheet extends StatefulWidget {
  final String operatorId;
  final Map<String, dynamic>? existing;
  final VoidCallback onSaved;

  const _TruckFormSheet({
    required this.operatorId,
    required this.onSaved,
    this.existing,
  });

  @override
  State<_TruckFormSheet> createState() => _TruckFormSheetState();
}

class _TruckFormSheetState extends State<_TruckFormSheet> {
  final _formKey = GlobalKey<FormState>();
  final _plateCtrl = TextEditingController();
  final _modelCtrl = TextEditingController();
  final _capacityCtrl = TextEditingController();
  bool _isLoading = false;

  XFile? _selectedImage;
  Uint8List? _selectedImageBytes;
  String? _existingImageUrl;

  @override
  void initState() {
    super.initState();
    if (widget.existing != null) {
      _plateCtrl.text = widget.existing!['plate_number'] ?? '';
      _modelCtrl.text = widget.existing!['model'] ?? '';
      _capacityCtrl.text = widget.existing!['capacity']?.toString() ?? '';
      _existingImageUrl = widget.existing!['image_url'];
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final image = await picker.pickImage(
        source: source,
        maxWidth: 800,
        imageQuality: 80,
      );
      if (image != null) {
        final bytes = await image.readAsBytes();
        setState(() {
          _selectedImage = image;
          _selectedImageBytes = bytes;
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

  void _showImagePickerSheet() {
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
              context.tr.truckPhoto,
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
                _pickImage(ImageSource.camera);
              },
              icon: const Icon(Icons.camera_alt_rounded),
              label: Text(context.tr.takePhoto),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
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
                _pickImage(ImageSource.gallery);
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

  @override
  void dispose() {
    _plateCtrl.dispose();
    _modelCtrl.dispose();
    _capacityCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    try {
      String? imageUrl = _existingImageUrl;
      if (_selectedImage != null && _selectedImageBytes != null) {
        final fileName = '${DateTime.now().millisecondsSinceEpoch}_${_selectedImage!.name}';
        await SupabaseConfig.client.storage
            .from('truck-images')
            .uploadBinary(fileName, _selectedImageBytes!);
        imageUrl = '${SupabaseConfig.storageUrl}/truck-images/$fileName';
      }

      final data = {
        'operator_id': widget.operatorId,
        'plate_number': _plateCtrl.text.trim(),
        'model': _modelCtrl.text.trim(),
        'capacity': int.parse(_capacityCtrl.text.trim()),
        'status': widget.existing != null ? widget.existing!['status'] : 'active',
        'image_url': imageUrl,
      };

      if (widget.existing != null) {
        await SupabaseConfig.client
            .from('buses')
            .update(data)
            .eq('id', widget.existing!['id']);
      } else {
        await SupabaseConfig.client.from('buses').insert(data);
      }

      if (mounted) {
        Navigator.pop(context);
        widget.onSaved();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.existing != null
                  ? context.tr.truckUpdated
                  : context.tr.truckAdded,
            ),
            backgroundColor: const Color(0xFF059669),
            behavior: SnackBarBehavior.floating,
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
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.existing != null;
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
                isEdit ? context.tr.editTruck : context.tr.addTruck,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 20),
              GestureDetector(
                onTap: _showImagePickerSheet,
                child: Container(
                  height: 140,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: AppColors.primary.withOpacity(0.3),
                      style: BorderStyle.solid,
                      width: 1.5,
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: _selectedImageBytes != null
                        ? Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.memory(_selectedImageBytes!, fit: BoxFit.cover),
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
                        : _existingImageUrl != null && _existingImageUrl!.isNotEmpty
                            ? Stack(
                                fit: StackFit.expand,
                                children: [
                                  Image.network(_existingImageUrl!, fit: BoxFit.cover),
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
                                      color: AppColors.primary.withOpacity(0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.camera_alt_rounded,
                                      color: AppColors.primary,
                                      size: 28,
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    context.tr.addPhoto,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    context.tr.truckPhoto,
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
                controller: _plateCtrl,
                label: context.tr.plateNumber,
                hint: context.tr.plateNumberHint,
                icon: Icons.pin_rounded,
                validator: (v) => v!.isEmpty ? context.tr.required : null,
              ),
              const SizedBox(height: 14),
              _FormField(
                controller: _modelCtrl,
                label: context.tr.truckModel,
                hint: context.tr.truckModelHint,
                icon: Icons.local_shipping_rounded,
                validator: (v) => v!.isEmpty ? context.tr.required : null,
              ),
              const SizedBox(height: 14),
              _FormField(
                controller: _capacityCtrl,
                label: context.tr.seatCapacity,
                hint: context.tr.seatCapacityHint,
                icon: Icons.inventory_2_rounded,
                keyboardType: TextInputType.number,
                validator: (v) => v!.isEmpty ? context.tr.required : null,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
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
                          isEdit ? context.tr.saveChanges : context.tr.addTruck,
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
              borderSide: const BorderSide(color: Color(0xFF9E7E38), width: 2),
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
