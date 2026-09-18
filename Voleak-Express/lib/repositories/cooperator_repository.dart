import '../core/error/result.dart';
import '../models/cooperator_model.dart';
import '../supabase_config.dart';

class CooperatorRepository {
  static const String defaultId = '55555555-5555-5555-5555-555555555555';

  /// Fetch Corporate Cooperator Profile from Supabase 'cooperators' table.
  Future<Result<CooperatorModel>> getCooperator({String id = defaultId}) async {
    try {
      final data = await SupabaseConfig.client
          .from('cooperators')
          .select('*')
          .eq('id', id)
          .maybeSingle();

      if (data != null && data.isNotEmpty) {
        return Success(CooperatorModel.fromJson(data));
      }

      // If not found, check if any cooperators exist
      final allData = await SupabaseConfig.client
          .from('cooperators')
          .select('*')
          .limit(1);

      if (allData.isNotEmpty) {
        return Success(CooperatorModel.fromJson(Map<String, dynamic>.from(allData.first)));
      }

      // If table is empty, create default cooperator in Supabase
      final defaultCoop = CooperatorModel(
        id: defaultId,
        name: 'Top Sports Textile (TST Group)',
        shortName: 'Manhattan Garments',
        code: 'COP-MANHATTAN-01',
        industry: 'Garments & Textiles',
        tier: 'VIP Platinum Partner',
        discountRate: '15% Corporate Off',
        paymentTerms: 'Net 30 Days',
        creditLimit: 50000.0,
        currentBalance: 12400.0,
        contactPerson: 'Mr. Kenji Takahashi',
        contactTitle: 'Procurement & Supply Chain Director',
        phone: '+855 23 881 200',
        email: 'procurement@manhattanmills.kh',
        taxId: 'K002-98471203',
        province: 'Phnom Penh',
        address: 'Phnom Penh Special Economic Zone (PPSEZ), National Road 4',
        primaryCorridor: 'Phnom Penh Central Hub ⇄ Sihanoukville Port Deep Sea Terminal',
        logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80',
      );

      await saveCooperator(defaultCoop);
      return Success(defaultCoop);
    } catch (e) {
      return Failure('Failed to fetch cooperator profile: $e');
    }
  }

  /// Fetch all Cooperators / Factory Partners from Supabase 'cooperators' table.
  Future<Result<List<CooperatorModel>>> getCooperators() async {
    try {
      final data = await SupabaseConfig.client
          .from('cooperators')
          .select('*')
          .order('name', ascending: true);

      if (data.isNotEmpty) {
        final list = data
            .map((json) => CooperatorModel.fromJson(Map<String, dynamic>.from(json)))
            .toList();
        return Success(list);
      }
      return Success([]);
    } catch (e) {
      return Failure('Failed to fetch cooperators: $e');
    }
  }

  /// Update or save corporate cooperator details to Supabase.
  Future<Result<CooperatorModel>> saveCooperator(CooperatorModel cooperator) async {
    try {
      final payload = cooperator.toJson();
      final data = await SupabaseConfig.client
          .from('cooperators')
          .upsert(payload)
          .select()
          .single();
      return Success(CooperatorModel.fromJson(data));
    } catch (e) {
      return Failure('Failed to save cooperator profile to Supabase: $e');
    }
  }

  /// Delete cooperator by ID
  Future<Result<bool>> deleteCooperator(String id) async {
    try {
      await SupabaseConfig.client
          .from('cooperators')
          .delete()
          .eq('id', id);
      return Success(true);
    } catch (e) {
      return Failure('Failed to delete cooperator: $e');
    }
  }
}
