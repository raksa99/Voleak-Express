class ProductModel {
  final String id;
  final String sku;
  final String name;
  final String category;
  final String unit;
  final String unitWeight;
  final String stockAtHub;
  final String status;
  final String? barcode;
  final String? warehouseLocation;
  final double weightKg;
  final int minStockAlert;
  final String? imageUrl;
  final String? corporateId;
  final DateTime? createdAt;

  ProductModel({
    required this.id,
    required this.sku,
    required this.name,
    required this.category,
    this.unit = 'Roll (50m)',
    required this.unitWeight,
    required this.stockAtHub,
    required this.status,
    this.barcode,
    this.warehouseLocation,
    this.weightKg = 15.0,
    this.minStockAlert = 10,
    this.imageUrl,
    this.corporateId,
    this.createdAt,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as String? ?? '',
      sku: json['sku'] as String? ?? '',
      name: json['name'] as String? ?? '',
      category: json['category'] as String? ?? 'Functional Performance Fabrics',
      unit: json['unit'] as String? ?? 'Roll (50m)',
      unitWeight: json['unit_weight'] as String? ?? json['unitWeight'] as String? ?? '${json['weight_kg'] ?? 15} kg',
      stockAtHub: json['stock_at_hub'] as String? ?? json['stockAtHub'] as String? ?? 'In Stock',
      status: json['status'] as String? ?? (json['is_active'] == false ? 'inactive' : 'in_stock'),
      barcode: json['barcode'] as String?,
      warehouseLocation: json['warehouse_location'] as String? ?? 'Fabric Bay A-1',
      weightKg: (json['weight_kg'] as num?)?.toDouble() ?? 15.0,
      minStockAlert: (json['min_stock_alert'] as num?)?.toInt() ?? 10,
      imageUrl: json['image_url'] as String? ?? json['image'] as String?,
      corporateId: json['corporate_id'] as String?,
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'sku': sku,
      'name': name,
      'category': category,
      'unit': unit,
      'unit_weight': unitWeight,
      'stock_at_hub': stockAtHub,
      'status': status,
      'barcode': barcode,
      'warehouse_location': warehouseLocation,
      'weight_kg': weightKg,
      'min_stock_alert': minStockAlert,
      'image_url': imageUrl,
      'corporate_id': corporateId,
    };
  }
}
