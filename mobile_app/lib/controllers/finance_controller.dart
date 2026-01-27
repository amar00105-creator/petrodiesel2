import 'dart:developer' as developer;
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../models/finance_account.dart';
import '../models/transaction.dart';
import '../services/finance_service.dart';
import 'auth_controller.dart';

class FinanceController extends GetxController {
  final AuthController authController = Get.find();

  var isLoading = false.obs;
  var balancesLoaded = false.obs;

  var safes = <FinanceAccount>[].obs;
  var banks = <FinanceAccount>[].obs;
  var totalSafeBalance = 0.0.obs;
  var totalBankBalance = 0.0.obs;

  var transactions = <Transaction>[].obs;
  var incomeTotal = 0.0.obs;
  var expenseTotal = 0.0.obs;

  late FinanceService _service;

  @override
  void onInit() {
    super.onInit();
    _service = FinanceService(authController.token.value);
  }

  Future<void> fetchBalances() async {
    try {
      isLoading.value = true;
      final data = await _service.getBalances();

      if (data['status'] == true) {
        final d = data['data'];

        final safesList = (d['safes'] as List)
            .map((e) => FinanceAccount.fromJson(e, 'safe'))
            .toList();
        final banksList = (d['banks'] as List)
            .map((e) => FinanceAccount.fromJson(e, 'bank'))
            .toList();

        safes.assignAll(safesList);
        banks.assignAll(banksList);

        totalSafeBalance.value =
            double.parse(d['total_safe_balance'].toString());
        totalBankBalance.value =
            double.parse(d['total_bank_balance'].toString());

        balancesLoaded.value = true;
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to fetch balances: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> recordTransaction({
    required String type,
    required double amount,
    required FinanceAccount account,
    String? description,
  }) async {
    try {
      isLoading.value = true;
      await _service.recordTransaction(
        type: type,
        amount: amount,
        accountType: account.type,
        accountId: account.id,
        description: description,
      );

      await fetchBalances(); // Refresh balances
      await fetchHistory(); // Refresh history

      Get.snackbar('Success', 'Transaction recorded');
      return true;
    } catch (e) {
      Get.snackbar('Error', '$e');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchHistory() async {
    try {
      // Default to current month
      String start = DateFormat('yyyy-MM-01').format(DateTime.now());
      String end = DateFormat('yyyy-MM-dd').format(DateTime.now());

      final list = await _service.getHistory(startDate: start, endDate: end);
      transactions.assignAll(list);

      calculateTotals();
    } catch (e) {
      developer.log('Failed to fetch history',
          name: 'FinanceController', error: e);
    }
  }

  void calculateTotals() {
    double inc = 0;
    double exp = 0;
    for (var t in transactions) {
      if (t.type == 'income') inc += t.amount;
      if (t.type == 'expense') exp += t.amount;
    }
    incomeTotal.value = inc;
    expenseTotal.value = exp;
  }
}
