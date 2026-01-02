import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/finance_controller.dart';

class FinanceReportView extends StatelessWidget {
  final FinanceController controller = Get.find();

  @override
  Widget build(BuildContext context) {
    // Refresh history on load
    controller.fetchHistory();

    return Scaffold(
      appBar: AppBar(title: Text('التقارير المالية')),
      body: Column(
        children: [
          // Totals Header
          Obx(() => Container(
                padding: EdgeInsets.all(20),
                color: Colors.blue.shade50,
                child: Row(
                  children: [
                    Expanded(
                      child: _buildInfoCard('اجمالي الإيرادات',
                          controller.incomeTotal.value, Colors.green),
                    ),
                    SizedBox(width: 10),
                    Expanded(
                      child: _buildInfoCard('اجمالي المنصرفات',
                          controller.expenseTotal.value, Colors.red),
                    ),
                  ],
                ),
              )),

          Expanded(
            child: Obx(() {
              if (controller.transactions.isEmpty) {
                return Center(child: Text('لا توجد بيانات للفترة الحالية'));
              }

              return ListView.separated(
                padding: EdgeInsets.all(16),
                itemCount: controller.transactions.length,
                separatorBuilder: (_, __) => Divider(),
                itemBuilder: (context, index) {
                  final t = controller.transactions[index];
                  final isIncome = t.type == 'income';

                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: isIncome
                          ? Colors.green.withOpacity(0.1)
                          : Colors.red.withOpacity(0.1),
                      child: Icon(
                        isIncome ? Icons.arrow_downward : Icons.arrow_upward,
                        color: isIncome ? Colors.green : Colors.red,
                        size: 20,
                      ),
                    ),
                    title: Text(t.description ?? 'بدون وصف',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${t.date} • ${t.category ?? "عام"}'),
                    trailing: Text(
                      '${t.amount.toStringAsFixed(2)}',
                      style: TextStyle(
                        color: isIncome ? Colors.green : Colors.red,
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                  );
                },
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(String title, double value, Color color) {
    return Container(
      padding: EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 5)],
        border: Border(right: BorderSide(color: color, width: 4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
          SizedBox(height: 5),
          Text(
            value.toStringAsFixed(2),
            style: TextStyle(
                color: color, fontWeight: FontWeight.bold, fontSize: 18),
          ),
        ],
      ),
    );
  }
}
