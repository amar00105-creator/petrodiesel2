import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import '../controllers/auth_controller.dart';

class DashboardController extends GetxController {
  final AuthController authController = Get.find();
  
  var isLoading = true.obs;
  var summaryData = {}.obs;
  var tanksData = <dynamic>[].obs;

  @override
  void onInit() {
    super.onInit();
    fetchData();
  }

  void fetchData() async {
    isLoading.value = true;
    try {
      final token = authController.token.value;
      final headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token'
      };

      // Fetch Summary
      final summaryRes = await http.get(
        Uri.parse('${AuthController.baseUrl}/summary'),
        headers: headers,
      );

      // Fetch Tanks
      final tanksRes = await http.get(
        Uri.parse('${AuthController.baseUrl}/tanks'),
        headers: headers,
      );

      if (summaryRes.statusCode == 200 && tanksRes.statusCode == 200) {
        final smry = jsonDecode(summaryRes.body);
        final tnks = jsonDecode(tanksRes.body);

        if (smry['status'] == true) {
          summaryData.value = smry['data'];
        }
        if (tnks['status'] == true) {
          tanksData.value = tnks['data'];
        }
      } else if (summaryRes.statusCode == 401) {
        authController.logout();
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to load dashboard: $e');
    } finally {
      isLoading.value = false;
    }
  }
}
