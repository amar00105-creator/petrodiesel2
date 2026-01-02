import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthController extends GetxController {
  var isLoggedIn = false.obs;
  var isLoading = false.obs;
  var token = ''.obs;
  var user = {}.obs;

  // Change this to your local IP address for emulator (10.0.2.2 for Android emulator)
  // For Real Device/Same Network: Use PC's IP address (e.g., http://192.168.1.5/PETRODIESEL...)
  static const String baseUrl = 'http://localhost/PETRODIESEL2/public/api/v1';

  @override
  void onInit() {
    super.onInit();
    checkLoginStatus();
  }

  Future<void> checkLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();
    token.value = prefs.getString('token') ?? '';
    if (token.value.isNotEmpty) {
      isLoggedIn.value = true;
      // Ideally verify token with API here
      user.value = jsonDecode(prefs.getString('user') ?? '{}');
    }
  }

  Future<bool> login(String email, String password) async {
    print('Login called with $email');
    isLoading.value = true;
    try {
      final url = Uri.parse('$baseUrl/login');
      print('Sending POST request to: $url');

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['status'] == true) {
          token.value = data['token'];
          user.value = data['user'];
          isLoggedIn.value = true;

          // Save to prefs
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('token', token.value);
          await prefs.setString('user', jsonEncode(user.value));

          return true;
        } else {
          Get.snackbar('Error', data['message'] ?? 'Login failed');
        }
      } else {
        Get.snackbar(
            'Error', 'Server Error: ${response.statusCode}\n${response.body}');
      }
    } catch (e) {
      print('Login Error: $e');
      Get.snackbar('Error', 'Connection Error: $e');
    } finally {
      isLoading.value = false;
    }
    return false;
  }

  void logout() async {
    isLoading.value = true;
    try {
      await http.post(
        Uri.parse('$baseUrl/logout'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${token.value}'
        },
      );
    } catch (e) {
      // ignore error on logout
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    isLoggedIn.value = false;
    token.value = '';
    user.value = {};
    isLoading.value = false;
  }
}
