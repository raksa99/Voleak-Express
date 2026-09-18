class CooperatorModel {
  final String id;
  final String name;
  final String shortName;
  final String code;
  final String industry;
  final String tier;
  final String discountRate;
  final String paymentTerms;
  final double creditLimit;
  final double currentBalance;
  final String contactPerson;
  final String contactTitle;
  final String phone;
  final String email;
  final String taxId;
  final String province;
  final String address;
  final String primaryCorridor;
  final String logoUrl;
  final int totalWaybills;
  final double totalTonnage;
  final double totalSpend;
  final String status;

  CooperatorModel({
    required this.id,
    required this.name,
    required this.shortName,
    required this.code,
    required this.industry,
    required this.tier,
    required this.discountRate,
    required this.paymentTerms,
    required this.creditLimit,
    required this.currentBalance,
    required this.contactPerson,
    required this.contactTitle,
    required this.phone,
    required this.email,
    required this.taxId,
    required this.province,
    required this.address,
    required this.primaryCorridor,
    required this.logoUrl,
    this.totalWaybills = 148,
    this.totalTonnage = 420.5,
    this.totalSpend = 58200.0,
    this.status = 'active',
  });

  factory CooperatorModel.fromJson(Map<String, dynamic> json) {
    return CooperatorModel(
      id: json['id'] as String? ?? '55555555-5555-5555-5555-555555555555',
      name: json['name'] as String? ?? json['factory_name'] as String? ?? 'Top Sports Textile (TST Group)',
      shortName: json['short_name'] as String? ?? json['shortName'] as String? ?? 'Manhattan Garments',
      code: json['code'] as String? ?? 'COP-MANHATTAN-01',
      industry: json['industry'] as String? ?? 'Garments & Textiles',
      tier: json['tier'] as String? ?? 'VIP Platinum Partner',
      discountRate: json['discount_rate'] as String? ?? json['discountRate'] as String? ?? '15% Corporate Off',
      paymentTerms: json['payment_terms'] as String? ?? json['paymentTerms'] as String? ?? 'Net 30 Days',
      creditLimit: (json['credit_limit'] as num?)?.toDouble() ?? 50000.0,
      currentBalance: (json['current_balance'] as num?)?.toDouble() ?? 12400.0,
      contactPerson: json['contact_person'] as String? ?? json['contactPerson'] as String? ?? 'Mr. Kenji Takahashi',
      contactTitle: json['contact_title'] as String? ?? json['contactTitle'] as String? ?? 'Procurement & Supply Chain Director',
      phone: json['phone'] as String? ?? '+855 23 881 200',
      email: json['email'] as String? ?? 'procurement@manhattanmills.kh',
      taxId: json['tax_id'] as String? ?? json['taxId'] as String? ?? 'K002-98471203',
      province: json['province'] as String? ?? 'Phnom Penh',
      address: json['address'] as String? ?? 'Phnom Penh Special Economic Zone (PPSEZ), National Road 4',
      primaryCorridor: json['primary_corridor'] as String? ?? json['primaryCorridor'] as String? ?? 'Phnom Penh Central Hub ⇄ Sihanoukville Port Deep Sea Terminal',
      logoUrl: json['logo_url'] as String? ?? json['logoUrl'] as String? ?? 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80',
      totalWaybills: (json['total_waybills'] as num?)?.toInt() ?? 148,
      totalTonnage: (json['total_tonnage'] as num?)?.toDouble() ?? 420.5,
      totalSpend: (json['total_spend'] as num?)?.toDouble() ?? 58200.0,
      status: json['status'] as String? ?? 'active',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'factory_name': name,
      'short_name': shortName,
      'code': code,
      'industry': industry,
      'tier': tier,
      'discount_rate': discountRate,
      'payment_terms': paymentTerms,
      'credit_limit': creditLimit,
      'current_balance': currentBalance,
      'contact_person': contactPerson,
      'contact_title': contactTitle,
      'phone': phone,
      'email': email,
      'tax_id': taxId,
      'province': province,
      'address': address,
      'primary_corridor': primaryCorridor,
      'logo_url': logoUrl,
      'total_waybills': totalWaybills,
      'total_tonnage': totalTonnage,
      'total_spend': totalSpend,
      'status': status,
    };
  }
}
