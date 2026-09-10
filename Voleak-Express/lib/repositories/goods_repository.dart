import '../core/error/result.dart';
import '../models/goods_model.dart';
import 'base_repository.dart';

class GoodsRepository extends BaseRepository {
  GoodsRepository() : super('goods');

  Future<Result<List<GoodsModel>>> getCorporateGoods(String corporateId) async {
    try {
      final data = await client
          .from('goods')
          .select('''
            id, trip_id, sender_name, receiver_name, receiver_phone, description, weight_kg, status, corporate_id, created_at,
            trips (
              id, status, departed_at, arrived_at, latitude, longitude,
              schedules (
                departure_time, arrival_time,
                routes ( origin, destination, distance_km, duration_min )
              )
            )
          ''')
          .eq('corporate_id', corporateId)
          .order('created_at', ascending: false);
      
      final list = (data as List).map<GoodsModel>((e) => GoodsModel.fromMap(e as Map<String, dynamic>)).toList();
      return Success(list);
    } catch (e) {
      return Failure('Failed to load corporate goods', error: e);
    }
  }
}
