import '../core/error/result.dart';
import '../models/product_model.dart';
import '../supabase_config.dart';

class ProductRepository {
  /// Fetch corporate products from Supabase 'products' table.
  Future<Result<List<ProductModel>>> getProducts({String? corporateId}) async {
    try {
      var query = SupabaseConfig.client.from('products').select('*');
      var data = await query.order('created_at', ascending: false);
      
      if (data.isNotEmpty) {
        final products = data.map((json) => ProductModel.fromJson(Map<String, dynamic>.from(json))).toList();
        return Success(products);
      }

      // If empty, return empty list (caller can fallback or seed)
      return Success([]);
    } catch (e) {
      return Failure('Failed to fetch products from Supabase: $e');
    }
  }

  /// Add or update product in Supabase 'products' table.
  Future<Result<ProductModel>> saveProduct(ProductModel product) async {
    try {
      final payload = product.toJson();
      final data = await SupabaseConfig.client
          .from('products')
          .upsert(payload)
          .select()
          .single();
      return Success(ProductModel.fromJson(data));
    } catch (e) {
      return Failure('Failed to save product in Supabase: $e');
    }
  }
}

