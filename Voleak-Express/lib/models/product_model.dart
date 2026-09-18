class ProductModel {
  final String id;
  final String sku;
  final String name;
  final String category;
  final String unitWeight;
  final String stockAtHub;
  final String status;
  final String? imageUrl;
  final String? corporateId;
  final DateTime? createdAt;

  ProductModel({
    required this.id,
    required this.sku,
    required this.name,
    required this.category,
    required this.unitWeight,
    required this.stockAtHub,
    required this.status,
    this.imageUrl,
    this.corporateId,
    this.createdAt,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as String? ?? '',
      sku: json['sku'] as String? ?? '',
      name: json['name'] as String? ?? '',
      category: json['category'] as String? ?? 'General',
      unitWeight: json['unit_weight'] as String? ?? json['unitWeight'] as String? ?? '0 Tons',
      stockAtHub: json['stock_at_hub'] as String? ?? json['stockAtHub'] as String? ?? 'In Stock',
      status: json['status'] as String? ?? 'in_stock',
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
      'unit_weight': unitWeight,
      'stock_at_hub': stockAtHub,
      'status': status,
      'image_url': imageUrl,
      'corporate_id': corporateId,
    };
  }
}
