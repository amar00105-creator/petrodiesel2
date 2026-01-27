import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/finance_controller.dart';
import '../../models/finance_account.dart';

class AddTransactionView extends StatefulWidget {
  const AddTransactionView({super.key});

  @override
  State<AddTransactionView> createState() => _AddTransactionViewState();
}

class _AddTransactionViewState extends State<AddTransactionView> {
  final FinanceController controller = Get.find();
  final _formKey = GlobalKey<FormState>();

  String type = 'expense'; // expense, income
  double amount = 0.0;
  String description = '';
  FinanceAccount? selectedAccount;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('اضافة معاملة')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // Type Selector
              // Type Selector
              RadioGroup<String>(
                groupValue: type,
                onChanged: (val) => setState(() => type = val.toString()),
                child: const Row(
                  children: [
                    Expanded(
                      child: RadioListTile(
                        title: Text('منصرف (Expense)'),
                        value: 'expense',
                        activeColor: Colors.red,
                      ),
                    ),
                    Expanded(
                      child: RadioListTile(
                        title: Text('إيراد (Income)'),
                        value: 'income',
                        activeColor: Colors.green,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Amount
              TextFormField(
                decoration: const InputDecoration(
                  labelText: 'المبلغ',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.attach_money),
                ),
                keyboardType: TextInputType.number,
                validator: (val) {
                  if (val == null || val.isEmpty) return 'ادخل المبلغ';
                  if (double.tryParse(val) == null) return 'مبلغ غير صحيح';
                  return null;
                },
                onSaved: (val) => amount = double.parse(val!),
              ),

              const SizedBox(height: 20),

              // Account Selector
              Obx(() {
                final allAccounts = [...controller.safes, ...controller.banks];
                return DropdownButtonFormField<FinanceAccount>(
                  decoration: const InputDecoration(
                    labelText: 'الحساب (Safe/Bank)',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.account_balance),
                  ),
                  items: allAccounts.map((acc) {
                    return DropdownMenuItem(
                      value: acc,
                      child: Text('${acc.name} (${acc.type})'),
                    );
                  }).toList(),
                  onChanged: (val) => setState(() => selectedAccount = val),
                  validator: (val) => val == null ? 'اختار الحساب' : null,
                );
              }),

              const SizedBox(height: 20),

              // Description
              TextFormField(
                decoration: const InputDecoration(
                  labelText: 'الوصف / البيان',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.description),
                ),
                maxLines: 3,
                onSaved: (val) => description = val ?? '',
              ),

              const SizedBox(height: 40),

              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        type == 'expense' ? Colors.red : Colors.green,
                  ),
                  onPressed: _submit,
                  child: const Text(
                    'حفظ المعاملة',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();

      bool success = await controller.recordTransaction(
        type: type,
        amount: amount,
        account: selectedAccount!,
        description: description,
      );

      if (success) {
        Get.back();
      }
    }
  }
}
