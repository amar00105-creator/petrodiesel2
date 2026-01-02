class Transaction {
  final int id;
  final double amount;
  final String type; // 'income', 'expense', 'transfer'
  final String? description;
  final String? category;
  final String? date;

  Transaction({
    required this.id,
    required this.amount,
    required this.type,
    this.description,
    this.category,
    this.date,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: int.parse(json['id'].toString()),
      amount: double.parse(json['amount'].toString()),
      type: json['type'] ?? 'unknown',
      description: json['description'],
      category: json['category_name'],
      date: json['created_at'],
    );
  }
}
