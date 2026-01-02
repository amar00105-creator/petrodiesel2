import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import '../controllers/auth_controller.dart';
import '../controllers/dashboard_controller.dart';

class SalesController extends GetxController {
  final AuthController authController = Get.find();

  var isLoading = false.obs;
  var isSubmitting = false.obs;
  var pumps = <dynamic>[].obs;
  var selectedCounter = {}.obs;

  // Form Observables
  var currentReading = 0.0.obs;
  var amount = 0.0.obs;
  var volume = 0.0.obs;

  // New Observables for Features
  var customers = <dynamic>[].obs;
  var salesHistory = <dynamic>[].obs;
  var selectedPaymentMethod = 'cash'.obs;
  var selectedCustomer = Rxn<dynamic>(); // Nullable

  @override
  void onInit() {
    super.onInit();
    fetchPumps();
    fetchCustomers();
    fetchHistory();
  }

  void fetchCustomers() async {
    try {
      final token = authController.token.value;
      final response = await http.get(
        Uri.parse('${AuthController.baseUrl}/customers'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token'
        },
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['status'] == true) {
          customers.value = data['data'];
        }
      }
    } catch (e) {
      print("Error fetching customers: $e");
    }
  }

  void fetchHistory() async {
    try {
      final token = authController.token.value;
      final response = await http.get(
        Uri.parse('${AuthController.baseUrl}/sales/history'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token'
        },
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['status'] == true) {
          salesHistory.value = data['data'];
        }
      }
    } catch (e) {
      print("Error fetching history: $e");
    }
  }

  void fetchPumps() async {
    isLoading.value = true;
    try {
      final token = authController.token.value;
      final response = await http.get(
        Uri.parse('${AuthController.baseUrl}/pumps'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token'
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['status'] == true) {
          pumps.value = data['data'];
        }
      } else if (response.statusCode == 401) {
        authController.logout();
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to load pumps');
    } finally {
      isLoading.value = false;
    }
  }

  void selectCounter(dynamic counter) {
    selectedCounter.value = counter;
    currentReading.value = 0.0;
    volume.value = 0.0;
    amount.value = 0.0;
  }

  void calculate(String readingStr) {
    if (readingStr.isEmpty) return;
    double current = double.tryParse(readingStr) ?? 0.0;
    double previous =
        double.tryParse(selectedCounter['current_reading'].toString()) ?? 0.0;
    double price =
        double.tryParse(selectedCounter['current_price'].toString()) ?? 0.0;

    if (current >= previous) {
      double vol = current - previous;
      volume.value = vol;
      amount.value = vol * price;
    } else {
      volume.value = 0.0;
      amount.value = 0.0;
    }
    currentReading.value = current;
  }

  Future<void> submitSale() async {
    if (selectedCounter.isEmpty) return;

    double previous =
        double.tryParse(selectedCounter['current_reading'].toString()) ?? 0.0;
    if (currentReading.value < previous) {
      Get.snackbar('Error',
          'Current reading cannot be less than previous reading ($previous)');
      return;
    }

    isSubmitting.value = true;
    try {
      final token = authController.token.value;
      final body = {
        'counter_id': selectedCounter['counter_id'],
        'current_reading': currentReading.value,
        'payment_method': selectedPaymentMethod.value,
        'customer_id': (selectedPaymentMethod.value == 'credit' &&
                selectedCustomer.value != null)
            ? selectedCustomer.value['id']
            : null,
      };

      final response = await http.post(
        Uri.parse('${AuthController.baseUrl}/sales/record'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token'
        },
        body: jsonEncode(body),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['status'] == true) {
        Get.back(); // Close screen
        Get.snackbar('Success', 'Sale recorded successfully');

        // Refresh Dashboard
        if (Get.isRegistered<DashboardController>()) {
          Get.find<DashboardController>().fetchData();
        }
        // Refresh History and reset form
        fetchHistory();
        currentReading.value = 0.0;
        volume.value = 0.0;
        amount.value = 0.0;
        selectedCustomer.value = null;
        selectedPaymentMethod.value = 'cash';
      } else {
        Get.snackbar('Error', data['message'] ?? 'Failed to record sale');
      }
    } catch (e) {
      Get.snackbar('Error', 'Connection Error');
    } finally {
      isSubmitting.value = false;
    }
  }
}
