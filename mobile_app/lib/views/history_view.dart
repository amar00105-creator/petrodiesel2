import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/sales_controller.dart';
import 'package:intl/intl.dart';

class HistoryView extends StatelessWidget {
  const HistoryView({super.key});

  @override
  Widget build(BuildContext context) {
    // Ensure controller is available (it might be put by SalesView or Dashboard)
    // If entered from Dashboard, we might need to find it or put it.
    final controller = Get.put(SalesController());

    // Refresh history on entry
    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.fetchHistory();
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sales History'),
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
      ),
      body: Obx(() {
        if (controller.salesHistory.isEmpty) {
           return const Center(child: Text('No sales recorded yet.'));
        }
        
        return ListView.builder(
          padding: const EdgeInsets.all(12),
          itemCount: controller.salesHistory.length,
          itemBuilder: (context, index) {
            final sale = controller.salesHistory[index];
            final date = DateTime.parse(sale['created_at']);
            final formattedDate = DateFormat('MMM dd, hh:mm a').format(date); // Requires intl package

            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: sale['payment_method'] == 'cash' ? Colors.green[100] : Colors.orange[100],
                  child: Icon(
                    sale['payment_method'] == 'cash' ? Icons.money : Icons.credit_card,
                    color: sale['payment_method'] == 'cash' ? Colors.green : Colors.orange,
                  ),
                ),
                title: Text('${sale['pump_name']} - ${sale['volume_sold']} L', style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text(formattedDate),
                trailing: Text(
                  '${sale['total_amount']} SDG', 
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)
                ),
              ),
            );
          },
        );
      }),
    );
  }
}
