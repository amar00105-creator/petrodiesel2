import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/finance_controller.dart';
import 'add_transaction_view.dart';
import 'finance_report_view.dart';

class FinanceDashboardView extends StatelessWidget {
  final FinanceController controller = Get.put(FinanceController());

  @override
  Widget build(BuildContext context) {
    controller.fetchBalances();
    controller.fetchHistory();

    return Scaffold(
      appBar: AppBar(
        title: Text('المالية (Finance)'),
        actions: [
          IconButton(
            icon: Icon(Icons.bar_chart),
            onPressed: () => Get.to(() => FinanceReportView()),
          )
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value && !controller.balancesLoaded.value) {
          return Center(child: CircularProgressIndicator());
        }

        return RefreshIndicator(
          onRefresh: () async {
            await controller.fetchBalances();
            await controller.fetchHistory();
          },
          child: SingleChildScrollView(
            padding: EdgeInsets.all(16),
            physics: AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Summary Cards
                _buildBalanceSection('الخزائن (Safes)', controller.safes),
                SizedBox(height: 20),
                _buildBalanceSection(
                    'الحسابات البنكية (Banks)', controller.banks),

                SizedBox(height: 30),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('أحدث المعاملات',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold)),
                    TextButton(
                        onPressed: () => Get.to(() => FinanceReportView()),
                        child: Text('عرض الكل'))
                  ],
                ),
                _buildRecentTransactions(),
              ],
            ),
          ),
        );
      }),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Get.to(() => AddTransactionView()),
        label: Text('اضافة معاملة'),
        icon: Icon(Icons.add),
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
        SizedBox(height: 10),
        if (accounts.isEmpty)
          Text('لا توجد حسابات', style: TextStyle(color: Colors.grey)),
        Container(
          height: 140,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: accounts.length,
            itemBuilder: (context, index) {
              final acc = accounts[index];
              return Container(
                width: 200,
                margin: EdgeInsets.only(left: 10),
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.blue.shade800, Colors.blue.shade500],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
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
                    Icon(Icons.account_balance_wallet,
                        color: Colors.white70, size: 30),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          acc.name,
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold),
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (acc.accountNumber != null)
                          Text(acc.accountNumber!,
                              style: TextStyle(
                                  color: Colors.white70, fontSize: 12)),
                        SizedBox(height: 5),
                        Text(
                          '${acc.balance.toStringAsFixed(2)} SDG',
                          style: TextStyle(
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

  Widget _buildRecentTransactions() {
    return Obx(() {
      if (controller.transactions.isEmpty) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Center(child: Text('لا توجد معاملات حديثة')),
        );
      }
      return ListView.builder(
        shrinkWrap: true,
        physics: NeverScrollableScrollPhysics(),
        itemCount: controller.transactions.take(5).length,
        itemBuilder: (context, index) {
          final t = controller.transactions[index];
          final isIncome = t.type == 'income';
          return Card(
            margin: EdgeInsets.symmetric(vertical: 5),
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
                '${t.amount.toStringAsFixed(2)}',
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
