import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:voleak_express/features/screens/splash_screen.dart';
import 'package:voleak_express/l10n/app_localizations.dart';

void main() {
  setUpAll(() async {
    // Initialize standard test bindings
    TestWidgetsFlutterBinding.ensureInitialized();

    // Mock SharedPreferences to avoid MissingPluginException
    SharedPreferences.setMockInitialValues({});

    // Initialize Supabase with dummy credentials for widget testing
    await Supabase.initialize(
      url: 'https://dummy-url.supabase.co',
      anonKey: 'dummy-anon-key',
    );
  });

  testWidgets('Splash screen layout smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: SplashScreen(),
        ),
      ),
    );

    // Verify that the splash screen shows the progress indicator and layout.
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.byIcon(Icons.local_shipping_rounded), findsOneWidget);

    // Let the 2-second navigation timer expire and navigate to LoginScreen
    await tester.pump(const Duration(seconds: 3));
    await tester.pumpAndSettle();
  });
}
