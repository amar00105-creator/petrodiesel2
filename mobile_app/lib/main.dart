import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'views/login_view.dart';
import 'views/dashboard_view.dart';
import 'controllers/auth_controller.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Initialize Auth Controller to check session
    Get.put(AuthController());

    return GetMaterialApp(
      title: 'PetroDiesel',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1E88E5)),
        useMaterial3: true,
        fontFamily: 'Segoe UI', // Good for Windows/Arabic
      ),
      // Simple routing logic based on token presence
      home: Obx(() {
        return Get.find<AuthController>().isLoggedIn.value 
            ? const DashboardView() 
            : const LoginView();
      }),
    );
  }
}
