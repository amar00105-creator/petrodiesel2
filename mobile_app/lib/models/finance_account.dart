class FinanceAccount {
  final int id;
  final String name;
  final String type; // 'safe' or 'bank'
  final String? accountNumber;
  final double balance;

  FinanceAccount({
    required this.id,
    required this.name,
    required this.type,
    this.accountNumber,
    required this.balance,
  });

  factory FinanceAccount.fromJson(Map<String, dynamic> json, String type) {
    return FinanceAccount(
      id: int.parse(json['id'].toString()),
      name: json['name'] ?? '',
      type: type,
      accountNumber: json['account_number'],
      balance: double.parse(json['balance'].toString()),
    );
  }
}
