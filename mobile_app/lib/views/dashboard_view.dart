import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/dashboard_controller.dart';
import '../controllers/auth_controller.dart';
import 'sales_view.dart';
import 'history_view.dart';
import 'finance/finance_dashboard_view.dart';

class DashboardView extends StatelessWidget {
  const DashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(DashboardController());
    final AuthController authController = Get.find();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => controller.fetchData(),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => authController.logout(),
          ),
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () => Get.to(() => const HistoryView()),
          ),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        final summary = controller.summaryData;
        final tanks = controller.tanksData;

        return RefreshIndicator(
          onRefresh: () async => controller.fetchData(),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildSummaryCard(
                    'Today\'s Sales',
                    '${summary['todaySales'] ?? 0} SDG',
                    Icons.attach_money,
                    Colors.green),
                const SizedBox(height: 12),
                _buildSummaryCard(
                    'Safe Balance',
                    '${summary['safeBalance'] ?? 0} SDG',
                    Icons.account_balance_wallet,
                    Colors.blue),
                const SizedBox(height: 12),
                _buildSummaryCard(
                    'Incoming Fuel',
                    '${summary['todayIncoming'] ?? 0} L',
                    Icons.local_shipping,
                    Colors.orange),
                const SizedBox(height: 24),
                const Text(
                  'Tank Levels',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.0,
                  ),
                  itemCount: tanks.length,
                  itemBuilder: (context, index) {
                    final tank = tanks[index];
                    return _buildTankWidget(tank);
                  },
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.all(16),
                    backgroundColor: const Color(0xFF1565C0),
                    foregroundColor: Colors.white,
                  ),
                  onPressed: () => Get.to(() => const SalesView()),
                  icon: const Icon(Icons.local_gas_station),
                  label: const Text('New Sale / Meter Reading',
                      style: TextStyle(fontSize: 16)),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.all(16),
                    backgroundColor: Colors.green[700],
                    foregroundColor: Colors.white,
                  ),
                  onPressed: () => Get.to(() => FinanceDashboardView()),
                  icon: const Icon(Icons.account_balance_wallet),
                  label: const Text('Finance & Accounting',
                      style: TextStyle(fontSize: 16)),
                ),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _buildSummaryCard(
      String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.1),
          child: Icon(icon, color: color),
        ),
        title: Text(title,
            style: const TextStyle(fontSize: 14, color: Colors.grey)),
        subtitle: Text(value,
            style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.black87)),
      ),
    );
  }

  Widget _buildTankWidget(dynamic tank) {
    double current = double.parse(tank['current_volume'].toString());
    double capacity = double.parse(tank['capacity_liters'].toString());
    double percent = (current / capacity).clamp(0.0, 1.0);

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(tank['product_type'],
                style: const TextStyle(
                    fontWeight: FontWeight.bold, color: Colors.blueGrey)),
            const Spacer(),
            Stack(
              alignment: Alignment.center,
              children: [
                CircularProgressIndicator(
                  value: percent,
                  strokeWidth: 10,
                  backgroundColor: Colors.grey[200],
                  color: percent < 0.2 ? Colors.red : Colors.green,
                ),
                Text('${(percent * 100).toStringAsFixed(0)}%',
                    style: const TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const Spacer(),
            Text('${tank['name']}', style: const TextStyle(fontSize: 12)),
            Text(
                '${current.toStringAsFixed(0)} / ${capacity.toStringAsFixed(0)} L',
                style: const TextStyle(fontSize: 10, color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
