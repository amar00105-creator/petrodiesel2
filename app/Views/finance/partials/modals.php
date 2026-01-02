<!-- Income Modal -->
<div class="modal fade" id="incomeModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-card border-0">
            <div class="modal-header border-0">
                <h5 class="modal-title fw-bold text-success">إضافة إيراد جديد</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="<?= BASE_URL ?>/finance/storeTransaction" method="POST">
                <input type="hidden" name="type" value="income">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label text-muted">التصنيف</label>
                        <select name="category_id" class="form-select form-control-lg border-0 bg-light" required>
                            <option value="">اختر التصنيف...</option>
                            <?php foreach($data['categories'] as $cat): ?>
                                <?php if($cat['type'] == 'income'): ?>
                                    <option value="<?= $cat['id'] ?>"><?= $cat['name'] ?></option>
                                <?php endif; ?>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-muted">إيداع في</label>
                        <div class="row g-2">
                            <div class="col-4">
                                <select name="account_type" class="form-select border-0 bg-light">
                                    <option value="safe">خزينة</option>
                                    <option value="bank">بنك</option>
                                </select>
                            </div>
                            <div class="col-8">
                                <select name="account_id" class="form-select border-0 bg-light">
                                    <?php foreach($data['safes'] as $s): ?><option value="<?= $s['id'] ?>"><?= $s['name'] ?></option><?php endforeach; ?>
                                    <?php foreach($data['banks'] as $b): ?><option value="<?= $b['id'] ?>"><?= $b['name'] ?></option><?php endforeach; ?>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-muted">المبلغ</label>
                        <input type="number" step="0.01" name="amount" class="form-control form-control-lg border-0 bg-light" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-muted">ملاحظات</label>
                        <textarea name="description" class="form-control border-0 bg-light" rows="2"></textarea>
                    </div>
                </div>
                <div class="modal-footer border-0">
                    <button type="submit" class="btn btn-success w-100 py-2 rounded-3">حفظ الإيراد</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Expense Modal -->
<div class="modal fade" id="expenseModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-card border-0">
            <div class="modal-header border-0">
                <h5 class="modal-title fw-bold text-danger">إضافة منصرف جديد</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="<?= BASE_URL ?>/finance/storeTransaction" method="POST">
                <input type="hidden" name="type" value="expense">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label text-muted">التصنيف</label>
                        <select name="category_id" class="form-select form-control-lg border-0 bg-light" required>
                            <option value="">اختر التصنيف...</option>
                            <?php foreach($data['categories'] as $cat): ?>
                                <?php if($cat['type'] == 'expense'): ?>
                                    <option value="<?= $cat['id'] ?>"><?= $cat['name'] ?></option>
                                <?php endif; ?>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-muted">خصم من</label>
                        <div class="row g-2">
                            <div class="col-4">
                                <select name="account_type" class="form-select border-0 bg-light">
                                    <option value="safe">خزينة</option>
                                    <option value="bank">بنك</option>
                                </select>
                            </div>
                            <div class="col-8">
                                <select name="account_id" class="form-select border-0 bg-light">
                                    <?php foreach($data['safes'] as $s): ?><option value="<?= $s['id'] ?>"><?= $s['name'] ?></option><?php endforeach; ?>
                                    <?php foreach($data['banks'] as $b): ?><option value="<?= $b['id'] ?>"><?= $b['name'] ?></option><?php endforeach; ?>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-muted">المبلغ</label>
                        <input type="number" step="0.01" name="amount" class="form-control form-control-lg border-0 bg-light" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-muted">ملاحظات</label>
                        <textarea name="description" class="form-control border-0 bg-light" rows="2"></textarea>
                    </div>
                </div>
                <div class="modal-footer border-0">
                    <button type="submit" class="btn btn-danger w-100 py-2 rounded-3">حفظ المنصرف</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Transfer Modal -->
<div class="modal fade" id="transferModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-card border-0">
            <div class="modal-header border-0">
                <h5 class="modal-title fw-bold text-primary">تحويل بين الحسابات</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="<?= BASE_URL ?>/finance/transfer" method="POST">
                <div class="modal-body">
                    <div class="row mb-3">
                        <div class="col-6">
                            <label class="form-label text-muted">من</label>
                            <select name="from_id" class="form-select border-0 bg-light">
                                <optgroup label="الخزائن">
                                    <?php foreach($data['safes'] as $s): ?><option value="<?= $s['id'] ?>"><?= $s['name'] ?></option><?php endforeach; ?>
                                </optgroup>
                            </select>
                            <input type="hidden" name="from_type" value="safe"> 
                            <!-- Simplified for demo, ideally selectable type -->
                        </div>
                        <div class="col-6">
                            <label class="form-label text-muted">إلى</label>
                            <select name="to_id" class="form-select border-0 bg-light">
                                <optgroup label="البنوك">
                                    <?php foreach($data['banks'] as $b): ?><option value="<?= $b['id'] ?>"><?= $b['name'] ?></option><?php endforeach; ?>
                                </optgroup>
                            </select>
                            <input type="hidden" name="to_type" value="bank">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-muted">المبلغ</label>
                        <input type="number" step="0.01" name="amount" class="form-control form-control-lg border-0 bg-light" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-muted">ملاحظات</label>
                        <textarea name="description" class="form-control border-0 bg-light" rows="2"></textarea>
                    </div>
                </div>
                <div class="modal-footer border-0">
                    <button type="submit" class="btn btn-primary w-100 py-2 rounded-3">إتمام التحويل</button>
                </div>
            </form>
        </div>
    </div>
</div>
