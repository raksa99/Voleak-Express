import 'package:flutter/material.dart';

import '../../../core/error/result.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/product_model.dart';
import '../../../repositories/product_repository.dart';

class ManagerInventoryScreen extends StatefulWidget {
  final String operatorId;
  const ManagerInventoryScreen({super.key, required this.operatorId});

  @override
  State<ManagerInventoryScreen> createState() => _ManagerInventoryScreenState();
}

class _ManagerInventoryScreenState extends State<ManagerInventoryScreen> {
  final ProductRepository _productRepo = ProductRepository();

  List<ProductModel> _allProducts = [];
  List<ProductModel> _filteredProducts = [];
  bool _isLoading = true;
  bool _isGridView = true;
  String _searchQuery = '';
  String _selectedCategory = 'All';

  final List<String> _categories = [
    'All',
    'Functional Performance Fabrics',
    'Synthetic Knits & Interlock',
    'Premium Apparel Trims',
    'Activewear Textiles',
    'Woven & Stretch Twill',
    'Specialized Yarns & Threads',
  ];

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoading = true);
    final result = await _productRepo.getProducts();
    if (mounted) {
      setState(() {
        if (result is Success<List<ProductModel>>) {
          _allProducts = result.data;
        } else {
          _allProducts = [];
        }
        _filter();
        _isLoading = false;
      });
    }
  }

  void _filter() {
    final query = _searchQuery.toLowerCase().trim();
    setState(() {
      _filteredProducts = _allProducts.where((prod) {
        final matchesCat = _selectedCategory == 'All' ||
            prod.category.toLowerCase() == _selectedCategory.toLowerCase();
        final matchesQuery = query.isEmpty ||
            prod.name.toLowerCase().contains(query) ||
            prod.sku.toLowerCase().contains(query) ||
            (prod.warehouseLocation ?? '').toLowerCase().contains(query) ||
            (prod.barcode ?? '').toLowerCase().contains(query) ||
            prod.category.toLowerCase().contains(query);
        return matchesCat && matchesQuery;
      }).toList();
    });
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
              'Cargo & Inventory Catalog',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            Text(
              'Top Sports Textile • ${_allProducts.length} Items Synced',
              style: const TextStyle(fontSize: 12, color: Colors.black54),
            ),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        foregroundColor: Colors.black87,
        actions: [
          IconButton(
            icon: Icon(_isGridView ? Icons.view_list_rounded : Icons.grid_view_rounded),
            tooltip: _isGridView ? 'Switch to List' : 'Switch to Grid',
            onPressed: () => setState(() => _isGridView = !_isGridView),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Reload from Supabase',
            onPressed: _loadProducts,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_box_rounded),
        label: const Text('Add Cargo'),
        onPressed: () => _showAddProductSheet(context),
      ),
      body: Column(
        children: [
          _buildSearchAndFilters(),
          _buildStatsSummary(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredProducts.isEmpty
                    ? _buildEmptyState()
                    : _isGridView
                        ? _buildGridView()
                        : _buildListView(),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilters() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Column(
        children: [
          TextField(
            onChanged: (val) {
              _searchQuery = val;
              _filter();
            },
            decoration: InputDecoration(
              hintText: 'Search SKU, fabric name, bay, barcode...',
              prefixIcon: const Icon(Icons.search_rounded, color: Colors.black45),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 18),
                      onPressed: () {
                        setState(() {
                          _searchQuery = '';
                          _filter();
                        });
                      },
                    )
                  : null,
              contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
              filled: true,
              fillColor: const Color(0xFFF1F5F9),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _categories.map((cat) {
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(
                      cat == 'All' ? 'All (${_allProducts.length})' : cat,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected ? Colors.white : const Color(0xFF334155),
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    backgroundColor: const Color(0xFFF1F5F9),
                    checkmarkColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(
                        color: isSelected ? AppColors.primary : const Color(0xFFE2E8F0),
                      ),
                    ),
                    onSelected: (selected) {
                      setState(() {
                        _selectedCategory = cat;
                        _filter();
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsSummary() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: const BoxDecoration(
        color: Color(0xFFF8FAFC),
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Showing ${_filteredProducts.length} of ${_allProducts.length} cargo items',
            style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
          ),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Row(
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
                      'Live Supabase Catalog',
                      style: TextStyle(fontSize: 11, color: Colors.green.shade800, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey.shade400),
          const SizedBox(height: 12),
          const Text(
            'No Cargo Products Found',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
          ),
          const SizedBox(height: 6),
          Text(
            _searchQuery.isNotEmpty
                ? 'Try adjusting your search query or category filter'
                : 'No items currently in the catalog',
            style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () {
              setState(() {
                _searchQuery = '';
                _selectedCategory = 'All';
                _filter();
              });
            },
            icon: const Icon(Icons.refresh, size: 16),
            label: const Text('Reset Filters'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGridView() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 900
            ? 4
            : constraints.maxWidth > 600
                ? 3
                : 2;
        return GridView.builder(
          padding: const EdgeInsets.all(12),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            childAspectRatio: 0.72,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: _filteredProducts.length,
          itemBuilder: (context, index) {
            final product = _filteredProducts[index];
            return _buildProductGridCard(product);
          },
        );
      },
    );
  }

  Widget _buildListView() {
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: _filteredProducts.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final product = _filteredProducts[index];
        return _buildProductListTile(product);
      },
    );
  }

  Widget _buildProductGridCard(ProductModel product) {
    final catColor = _getCategoryColor(product.category);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _showProductDetails(product),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image or Icon Header
            Container(
              height: 110,
              width: double.infinity,
              color: catColor.withOpacity(0.08),
              child: Stack(
                children: [
                  Center(
                    child: product.imageUrl != null && product.imageUrl!.isNotEmpty
                        ? Image.network(
                            product.imageUrl!,
                            fit: BoxFit.cover,
                            width: double.infinity,
                            height: 110,
                            errorBuilder: (_, __, ___) => _buildFallbackIcon(product),
                          )
                        : _buildFallbackIcon(product),
                  ),
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.7),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        product.sku,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: _buildStockStatusBadge(product.stockAtHub),
                  ),
                ],
              ),
            ),
            // Details
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.category,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: catColor,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1E293B),
                        height: 1.2,
                      ),
                    ),
                    const Spacer(),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 12, color: Color(0xFF64748B)),
                        const SizedBox(width: 3),
                        Expanded(
                          child: Text(
                            product.warehouseLocation ?? 'Sen Sok HQ',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          product.unit,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF334155),
                          ),
                        ),
                        Text(
                          '${product.weightKg.toStringAsFixed(1)} kg',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductListTile(ProductModel product) {
    final catColor = _getCategoryColor(product.category);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _showProductDetails(product),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  color: catColor.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(child: _buildFallbackIcon(product)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            product.sku,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        _buildStockStatusBadge(product.stockAtHub),
                        const Spacer(),
                        Text(
                          '${product.weightKg.toStringAsFixed(1)} kg',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      product.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      product.category,
                      style: TextStyle(
                        fontSize: 12,
                        color: catColor,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.warehouse_rounded, size: 13, color: Color(0xFF64748B)),
                        const SizedBox(width: 4),
                        Text(
                          product.warehouseLocation ?? 'Sen Sok HQ Bay A',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                        const SizedBox(width: 12),
                        const Icon(Icons.straighten_rounded, size: 13, color: Color(0xFF64748B)),
                        const SizedBox(width: 4),
                        Text(
                          product.unit,
                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFallbackIcon(ProductModel product) {
    IconData iconData = Icons.layers_rounded;
    final cat = product.category.toLowerCase();
    if (cat.contains('functional') || cat.contains('performance')) {
      iconData = Icons.shield_rounded;
    } else if (cat.contains('knit') || cat.contains('interlock')) {
      iconData = Icons.texture_rounded;
    } else if (cat.contains('trim') || cat.contains('zipper')) {
      iconData = Icons.linear_scale_rounded;
    } else if (cat.contains('activewear') || cat.contains('spandex')) {
      iconData = Icons.fitness_center_rounded;
    } else if (cat.contains('yarn') || cat.contains('thread')) {
      iconData = Icons.fiber_smart_record_rounded;
    } else if (cat.contains('twill') || cat.contains('woven')) {
      iconData = Icons.grid_on_rounded;
    }

    return Icon(iconData, size: 36, color: _getCategoryColor(product.category));
  }

  Widget _buildStockStatusBadge(String status) {
    Color bg = Colors.green.shade50;
    Color fg = Colors.green.shade800;
    String label = 'In Stock';

    final s = status.toLowerCase();
    if (s.contains('low')) {
      bg = Colors.amber.shade50;
      fg = Colors.amber.shade800;
      label = 'Low Stock';
    } else if (s.contains('out') || s.contains('inactive')) {
      bg = Colors.red.shade50;
      fg = Colors.red.shade800;
      label = 'Restock';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: fg.withOpacity(0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(color: fg, fontSize: 9, fontWeight: FontWeight.bold),
      ),
    );
  }

  Color _getCategoryColor(String category) {
    final cat = category.toLowerCase();
    if (cat.contains('functional')) return const Color(0xFF0284C7); // Sky blue
    if (cat.contains('knit')) return const Color(0xFF7C3AED); // Purple
    if (cat.contains('trim')) return const Color(0xFFD97706); // Amber
    if (cat.contains('activewear')) return const Color(0xFF059669); // Emerald
    if (cat.contains('twill') || cat.contains('woven')) return const Color(0xFF4F46E5); // Indigo
    if (cat.contains('yarn')) return const Color(0xFFDB2777); // Pink
    return const Color(0xFF475569);
  }

  void _showProductDetails(ProductModel product) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.75,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: false,
          builder: (context, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          product.sku,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      _buildStockStatusBadge(product.stockAtHub),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.delete_outline_rounded, color: Colors.red),
                        onPressed: () => _confirmDelete(product),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    product.name,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product.category,
                    style: TextStyle(
                      fontSize: 14,
                      color: _getCategoryColor(product.category),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Divider(height: 28),
                  const Text(
                    'SPECIFICATIONS & LOGISTICS',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildSpecRow('Unit Packaging', product.unit, Icons.all_inbox_rounded),
                  _buildSpecRow('Unit Weight', '${product.weightKg.toStringAsFixed(1)} kg (${product.unitWeight})', Icons.fitness_center_rounded),
                  _buildSpecRow('Warehouse Location', product.warehouseLocation ?? 'Sen Sok Hub Bay A-1', Icons.warehouse_rounded),
                  _buildSpecRow('Barcode / GTIN', product.barcode ?? '884920000000', Icons.qr_code_2_rounded),
                  _buildSpecRow('Min Stock Alert Level', '${product.minStockAlert} units', Icons.notifications_active_outlined),
                  _buildSpecRow('Logistics Status', product.stockAtHub, Icons.check_circle_outline_rounded),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: const [
                            Icon(Icons.local_shipping_outlined, size: 18, color: Color(0xFF0F172A)),
                            SizedBox(width: 8),
                            Text(
                              'Standard Corridor Dispatching',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Dispatched from Top Sports Textile HQ (Sen Sok) directly to SEZ garment partner factories across 32 corridors. Handled by AKR Heavy Freight Fleet.',
                          style: TextStyle(fontSize: 12, color: Color(0xFF475569), height: 1.4),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.check),
                      label: const Text('Close'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0F172A),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildSpecRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 18, color: const Color(0xFF64748B)),
          const SizedBox(width: 10),
          Text(
            label,
            style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
          ),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(ProductModel product) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Product?'),
        content: Text('Are you sure you want to remove "${product.name}" (${product.sku}) from the catalog?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              Navigator.pop(context);
              final res = await _productRepo.deleteProduct(product.id);
              if (mounted) {
                if (res is Success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Deleted ${product.sku}')),
                  );
                  _loadProducts();
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Delete failed: ${(res as Failure).message}')),
                  );
                }
              }
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _showAddProductSheet(BuildContext context) {
    final skuController = TextEditingController();
    final nameController = TextEditingController();
    final weightController = TextEditingController(text: '15.0');
    final bayController = TextEditingController(text: 'Fabric Bay A-1');
    final barcodeController = TextEditingController();
    String selectedCategory = _categories[1];
    String selectedUnit = 'Roll (50m)';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Add Cargo Product',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: skuController,
                      decoration: const InputDecoration(
                        labelText: 'SKU Code *',
                        hintText: 'e.g. TST-FAB-023',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: nameController,
                      decoration: const InputDecoration(
                        labelText: 'Cargo / Fabric Name *',
                        hintText: 'e.g. Recycled Polyester Jersey',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: selectedCategory,
                      decoration: const InputDecoration(
                        labelText: 'Category',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                      items: _categories
                          .where((c) => c != 'All')
                          .map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 13))))
                          .toList(),
                      onChanged: (v) {
                        if (v != null) setSheetState(() => selectedCategory = v);
                      },
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: selectedUnit,
                            decoration: const InputDecoration(
                              labelText: 'Packaging Unit',
                              border: OutlineInputBorder(),
                              isDense: true,
                            ),
                            items: const [
                              DropdownMenuItem(value: 'Roll (50m)', child: Text('Roll (50m)')),
                              DropdownMenuItem(value: 'Roll (100m)', child: Text('Roll (100m)')),
                              DropdownMenuItem(value: 'Box (500 pcs)', child: Text('Box (500 pcs)')),
                              DropdownMenuItem(value: 'Carton (1,000 pcs)', child: Text('Carton (1,000 pcs)')),
                              DropdownMenuItem(value: 'Spool (5,000m)', child: Text('Spool (5,000m)')),
                            ],
                            onChanged: (v) {
                              if (v != null) setSheetState(() => selectedUnit = v);
                            },
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: weightController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(
                              labelText: 'Weight (kg)',
                              border: OutlineInputBorder(),
                              isDense: true,
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
                            controller: bayController,
                            decoration: const InputDecoration(
                              labelText: 'Warehouse Location',
                              hintText: 'Fabric Bay B-2',
                              border: OutlineInputBorder(),
                              isDense: true,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: barcodeController,
                            decoration: const InputDecoration(
                              labelText: 'Barcode (Optional)',
                              border: OutlineInputBorder(),
                              isDense: true,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        onPressed: () async {
                          final sku = skuController.text.trim();
                          final name = nameController.text.trim();
                          if (sku.isEmpty || name.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Please provide SKU and Name')),
                            );
                            return;
                          }

                          final newProduct = ProductModel(
                            id: 'tst-prod-${DateTime.now().millisecondsSinceEpoch}',
                            sku: sku,
                            name: name,
                            category: selectedCategory,
                            unit: selectedUnit,
                            unitWeight: '${weightController.text.trim()} kg',
                            weightKg: double.tryParse(weightController.text.trim()) ?? 15.0,
                            stockAtHub: 'In Stock',
                            status: 'in_stock',
                            warehouseLocation: bayController.text.trim(),
                            barcode: barcodeController.text.trim().isNotEmpty
                                ? barcodeController.text.trim()
                                : null,
                          );

                          final res = await _productRepo.saveProduct(newProduct);
                          if (ctx.mounted) {
                            Navigator.pop(ctx);
                            if (res is Success) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Added $sku successfully!')),
                              );
                              _loadProducts();
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Failed: ${(res as Failure).message}')),
                              );
                            }
                          }
                        },
                        child: const Text('Save Cargo to Supabase', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}
