import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/finance_controller.dart';
import 'add_transaction_view.dart';
import 'finance_report_view.dart';

class FinanceDashboardView extends StatelessWidget {
  const FinanceDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    final FinanceController controller = Get.put(FinanceController());
    controller.fetchBalances();
    controller.fetchHistory();

    return Scaffold(
      appBar: AppBar(
        title: const Text('المالية (Finance)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.bar_chart),
            onPressed: () => Get.to(() => const FinanceReportView()),
          )
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value && !controller.balancesLoaded.value) {
          return const Center(child: CircularProgressIndicator());
        }

        return RefreshIndicator(
          onRefresh: () async {
            await controller.fetchBalances();
            await controller.fetchHistory();
          },
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Summary Cards
                _buildBalanceSection('الخزائن (Safes)', controller.safes),
                const SizedBox(height: 20),
                _buildBalanceSection(
                    'الحسابات البنكية (Banks)', controller.banks),

                const SizedBox(height: 30),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('أحدث المعاملات',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold)),
                    TextButton(
                        onPressed: () =>
                            Get.to(() => const FinanceReportView()),
                        child: const Text('عرض الكل'))
                  ],
                ),
                _buildRecentTransactions(controller),
              ],
            ),
          ),
        );
      }),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Get.to(() => const AddTransactionView()),
        label: const Text('اضافة معاملة'),
        icon: const Icon(Icons.add),
        backgroundColor: Colors.blue[800],
      ),
    );
  }

  Widget _buildBalanceSection(String title, List accounts) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title,
            style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.grey[700])),
        const SizedBox(height: 10),
        if (accounts.isEmpty)
          const Text('لا توجد حسابات', style: TextStyle(color: Colors.grey)),
        SizedBox(
          height: 140,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: accounts.length,
            itemBuilder: (context, index) {
              final acc = accounts[index];
              return Container(
                width: 200,
                margin: const EdgeInsets.only(left: 10),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.blue.shade800, Colors.blue.shade500],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [
                    BoxShadow(
                        color: Colors.black12,
                        blurRadius: 8,
                        offset: Offset(0, 4))
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Icon(Icons.account_balance_wallet,
                        color: Colors.white70, size: 30),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          acc.name,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold),
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (acc.accountNumber != null)
                          Text(acc.accountNumber!,
                              style: const TextStyle(
                                  color: Colors.white70, fontSize: 12)),
                        const SizedBox(height: 5),
                        Text(
                          '${acc.balance.toStringAsFixed(2)} SDG',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildRecentTransactions(FinanceController controller) {
    return Obx(() {
      if (controller.transactions.isEmpty) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 20),
          child: Center(child: Text('لا توجد معاملات حديثة')),
        );
      }
      return ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: controller.transactions.take(5).length,
        itemBuilder: (context, index) {
          final t = controller.transactions[index];
          final isIncome = t.type == 'income';
          return Card(
            margin: const EdgeInsets.symmetric(vertical: 5),
            elevation: 2,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor:
                    isIncome ? Colors.green.shade100 : Colors.red.shade100,
                child: Icon(
                  isIncome ? Icons.arrow_downward : Icons.arrow_upward,
                  color: isIncome ? Colors.green : Colors.red,
                ),
              ),
              title: Text(t.description ?? 'بدون وصف'),
              subtitle: Text(t.date ?? ''),
              trailing: Text(
                t.amount.toStringAsFixed(2),
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: isIncome ? Colors.green : Colors.red,
                ),
              ),
            ),
          );
        },
      );
    });
  }
}
