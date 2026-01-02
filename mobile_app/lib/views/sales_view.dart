import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/sales_controller.dart';

class SalesView extends StatelessWidget {
  const SalesView({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(SalesController());

    return Scaffold(
      appBar: AppBar(
        title: const Text('New Sale Entry'),
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        if (controller.selectedCounter.isEmpty) {
          return _buildPumpSelection(controller);
        } else {
          return _buildEntryForm(controller);
        }
      }),
    );
  }

  Widget _buildPumpSelection(SalesController controller) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: controller.pumps.length,
      itemBuilder: (context, index) {
        final item = controller.pumps[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: const Icon(Icons.local_gas_station, size: 32, color: Colors.blue),
            title: Text('${item['pump_name']} - ${item['product_type']}', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('Last Reading: ${item['current_reading']}'),
            trailing: const Icon(Icons.arrow_forward_ios),
            onTap: () => controller.selectCounter(item),
          ),
        );
      },
    );
  }

  Widget _buildEntryForm(SalesController controller) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Info
          Card(
            color: Colors.blue[50],
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Text('Pump: ${controller.selectedCounter['pump_name']}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Previous: ${controller.selectedCounter['current_reading']}'),
                      Text('Price: ${controller.selectedCounter['current_price']} SDG'),
                    ],
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          
          const SizedBox(height: 16),
          
          // Payment Method
          Obx(() => Row(
            children: [
              Expanded(
                child: RadioListTile(
                  title: const Text('Cash'),
                  value: 'cash',
                  groupValue: controller.selectedPaymentMethod.value,
                  onChanged: (val) => controller.selectedPaymentMethod.value = val.toString(),
                ),
              ),
              Expanded(
                child: RadioListTile(
                  title: const Text('Credit'),
                  value: 'credit',
                  groupValue: controller.selectedPaymentMethod.value,
                  onChanged: (val) => controller.selectedPaymentMethod.value = val.toString(),
                ),
              ),
            ],
          )),

          // Customer Selection (Visible only if Credit)
          Obx(() {
            if (controller.selectedPaymentMethod.value == 'credit') {
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: DropdownButtonFormField(
                  decoration: const InputDecoration(
                    labelText: 'Select Customer',
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                  items: controller.customers.map((c) {
                    return DropdownMenuItem(
                      value: c,
                      child: Text(c['name']),
                    );
                  }).toList(),
                  onChanged: (val) => controller.selectedCustomer.value = val,
                  value: controller.selectedCustomer.value,
                ),
              );
            }
            return const SizedBox.shrink();
          }),

          TextField(
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
            decoration: const InputDecoration(
              labelText: 'Current Reading',
              border: OutlineInputBorder(),
              focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.blue, width: 2)),
            ),
            onChanged: (val) => controller.calculate(val),
          ),
          
          const SizedBox(height: 24),
          
          // Calculation Result
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Volume Sold:', style: TextStyle(fontSize: 16)),
                    Obx(() => Text('${controller.volume.value.toStringAsFixed(2)} L', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
                  ],
                ),
                const Divider(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Amount:', style: TextStyle(fontSize: 18)),
                    Obx(() => Text('${controller.amount.value.toStringAsFixed(2)} SDG', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.green))),
                  ],
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 32),
          
          Obx(() => controller.isSubmitting.value 
            ? const Center(child: CircularProgressIndicator())
            : Column(
              children: [
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: const Color(0xFF1565C0),
                      foregroundColor: Colors.white,
                    ),
                    onPressed: controller.amount.value > 0 
                      ? () => controller.submitSale()
                      : null,
                    child: const Text('CONFIRM SALE', style: TextStyle(fontSize: 18)),
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => controller.selectedCounter.value = {},
                  child: const Text('Cancel / Select Different Pump'),
                ),
              ],
            )
          ),
        ],
      ),
    );
  }
}
