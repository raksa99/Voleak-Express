import 'trip_model.dart';

class GoodsModel {
  final String id;
  final String? tripId;
  final String senderName;
  final String receiverName;
  final String receiverPhone;
  final String description;
  final double weightKg;
  final String status;
  final String? corporateId;
  final DateTime? createdAt;
  final TripModel? trip;

  const GoodsModel({
    required this.id,
    this.tripId,
    required this.senderName,
    required this.receiverName,
    required this.receiverPhone,
    required this.description,
    required this.weightKg,
    required this.status,
    this.corporateId,
    this.createdAt,
    this.trip,
  });

  factory GoodsModel.fromMap(Map<String, dynamic> map) {
    return GoodsModel(
      id: map['id'] as String,
      tripId: map['trip_id'] as String?,
      senderName: map['sender_name'] as String,
      receiverName: map['receiver_name'] as String,
      receiverPhone: map['receiver_phone'] as String,
      description: map['description'] as String,
      weightKg: (map['weight_kg'] as num).toDouble(),
      status: map['status'] as String,
      corporateId: map['corporate_id'] as String?,
      createdAt: map['created_at'] != null
          ? DateTime.parse(map['created_at'] as String).toLocal()
          : null,
      trip: map['trips'] != null
          ? TripModel.fromMap(map['trips'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toMap() => {
    'id': id,
    if (tripId != null) 'trip_id': tripId,
    'sender_name': senderName,
    'receiver_name': receiverName,
    'receiver_phone': receiverPhone,
    'description': description,
    'weight_kg': weightKg,
    'status': status,
    if (corporateId != null) 'corporate_id': corporateId,
    if (createdAt != null) 'created_at': createdAt!.toIso8601String(),
  };

  bool get isPending => status == 'pending';
  bool get isLoaded => status == 'loaded';
  bool get isInTransit => status == 'in_transit';
  bool get isDelivered => status == 'delivered';
  bool get isCancelled => status == 'cancelled';
}
