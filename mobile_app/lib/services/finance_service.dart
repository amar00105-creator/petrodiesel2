import 'dart:convert';
import 'package:http/http.dart' as http;
import '../controllers/auth_controller.dart';
import '../models/transaction.dart';

class FinanceService {
  final String token;
  final String baseUrl = AuthController.baseUrl;

  FinanceService(this.token);

  Future<Map<String, dynamic>> getBalances() async {
    final response = await http.get(
      Uri.parse('$baseUrl/finance/balances'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load balances: ${response.body}');
    }
  }

  Future<void> recordTransaction({
    required String type,
    required double amount,
    required String accountType,
    required int accountId,
    String? categoryId,
    String? description,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/finance/transaction'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'type': type,
        'amount': amount,
        'account_type': accountType,
        'account_id': accountId,
        'category_id': categoryId,
        'description': description,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to record transaction: ${response.body}');
    }
  }

  Future<List<Transaction>> getHistory(
      {String? startDate, String? endDate}) async {
    final uri = Uri.parse('$baseUrl/finance/history').replace(queryParameters: {
      if (startDate != null) 'start_date': startDate,
      if (endDate != null) 'end_date': endDate,
    });

    final response = await http.get(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      if (json['status'] == true) {
        final List data = json['data'];
        return data.map((e) => Transaction.fromJson(e)).toList();
      }
    }
    throw Exception('Failed to load history');
  }
}
