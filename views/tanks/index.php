<?php
// Expects $tanks array
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إدارة المخزون والآبار | بتروديزل</title>
    <link href="<?= BASE_URL ?>/css/style.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root {
            --primary: #4361ee;
            --primary-dark: #3f37c9;
            --secondary: #f72585;
            --bg-glass: rgba(255, 255, 255, 0.95);
        }

        body {
            font-family: 'Tajawal', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }

        .glass-card {
            background: var(--bg-glass);
            border-radius: 20px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
            padding: 2rem;
            margin-bottom: 2rem;
        }

        .tank-card {
            background: white;
            border-radius: 15px;
            padding: 1.5rem;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
            transition: transform 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .tank-card:hover {
            transform: translateY(-5px);
        }

        .tank-visual {
            width: 80px;
            height: 120px;
            border: 3px solid #ddd;
            border-radius: 8px;
            position: relative;
            background: #f8f9fa;
            margin: 0 auto 1rem;
            overflow: hidden;
            z-index: 1;
        }

        .liquid {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            background: var(--primary);
            transition: height 1.5s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0.8;
        }

        .liquid::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: rgba(255, 255, 255, 0.4);
        }

        .tank-info h5 {
            font-weight: 700;
            margin-bottom: 0.2rem;
        }

        .product-badge {
            font-size: 0.8rem;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            color: white;
            display: inline-block;
            margin-bottom: 1rem;
        }

        .bg-diesel {
            background: #ffbe0b;
            color: #000;
        }

        /* Yellow/Orange */
        .bg-petrol {
            background: #ef233c;
        }

        /* Red */
        .bg-gas {
            background: #3a86ff;
        }

        /* Blue */

        .variance-alert {
            font-size: 0.8rem;
            padding: 5px;
            border-radius: 5px;
            background: #ffe5e5;
            color: #d00000;
            margin-top: 10px;
            display: block;
            text-align: center;
        }
    </style>
</head>

<body>

    <div class="container py-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="fw-bold fs-2" style="color: var(--primary);">إدارة المخزون</h1>
                <p class="text-muted">مراقبة مستويات الوقود والمعايرة</p>
            </div>
        </div>

        <!-- Action Cards Grid -->
        <div class="row g-3 mb-5">
            <!-- Petrol Stock -->
            <div class="col-md-2 col-6">
                <a href="<?= BASE_URL ?>/tanks?type=petrol" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
                    <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                        <div class="icon-circle bg-danger text-white mb-2" style="background-color: #ef233c !important;">
                            <i class="fas fa-gas-pump fa-lg"></i>
                        </div>
                        <h6 class="text-dark fw-bold mb-0">مخزون البنزين</h6>
                    </div>
                </a>
            </div>
            <!-- Diesel Stock -->
            <div class="col-md-2 col-6">
                <a href="<?= BASE_URL ?>/tanks?type=diesel" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
                    <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                        <div class="icon-circle bg-warning text-dark mb-2" style="background-color: #ffbe0b !important;">
                            <i class="fas fa-truck-moving fa-lg"></i>
                        </div>
                        <h6 class="text-dark fw-bold mb-0">مخزون الديزل</h6>
                    </div>
                </a>
            </div>
            <!-- Low Alert -->
            <div class="col-md-2 col-6">
                <a href="<?= BASE_URL ?>/tanks/alerts" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
                    <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                        <div class="icon-circle bg-danger bg-opacity-10 text-danger mb-2">
                            <i class="fas fa-exclamation-triangle fa-lg"></i>
                        </div>
                        <h6 class="text-dark fw-bold mb-0">تنبيه النقص</h6>
                    </div>
                </a>
            </div>
            <!-- Stock Report -->
            <div class="col-md-2 col-6">
                <a href="<?= BASE_URL ?>/tanks/reports" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
                    <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                        <div class="icon-circle bg-info bg-opacity-10 text-info mb-2">
                            <i class="fas fa-chart-bar fa-lg"></i>
                        </div>
                        <h6 class="text-dark fw-bold mb-0">تقرير المخزون</h6>
                    </div>
                </a>
            </div>
            <!-- Unloaded Trucks -->
            <div class="col-md-2 col-6">
                <a href="<?= BASE_URL ?>/purchases/pending" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
                    <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                        <div class="icon-circle bg-secondary bg-opacity-10 text-secondary mb-2">
                            <i class="fas fa-truck-loading fa-lg"></i>
                        </div>
                        <h6 class="text-dark fw-bold mb-0">شاحنات غير مفرغة</h6>
                    </div>
                </a>
            </div>
            <!-- Calibration -->
            <div class="col-md-2 col-6">
                <a href="<?= BASE_URL ?>/tanks/calibration" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
                    <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                        <div class="icon-circle bg-primary bg-opacity-10 text-primary mb-2">
                            <i class="fas fa-ruler-vertical fa-lg"></i>
                        </div>
                        <h6 class="text-dark fw-bold mb-0">تسجيل معايرة</h6>
                    </div>
                </a>
            </div>
        </div>

        <style>
            .hover-lift {
                transition: transform 0.2s;
            }

            .hover-lift:hover {
                transform: translateY(-5px);
            }

            .icon-circle {
                width: 50px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
        </style>

        <div class="row">
            <?php foreach ($tanks as $tank):
                $percent = ($tank['capacity_liters'] > 0) ? ($tank['current_volume'] / $tank['capacity_liters']) * 100 : 0;
                $percent = min(100, max(0, $percent)); // Clamp

                $bgClass = 'bg-secondary';
                if ($tank['product_type'] === 'Diesel') $bgClass = 'bg-diesel';
                if ($tank['product_type'] === 'Petrol') $bgClass = 'bg-petrol';
                if ($tank['product_type'] === 'Gas') $bgClass = 'bg-gas';
            ?>
                <div class="col-md-6 col-lg-3 mb-4">
                    <div class="tank-card text-center">
                        <span class="product-badge <?= $bgClass ?>"><?= htmlspecialchars($tank['product_type']) ?></span>

                        <div class="tank-visual">
                            <div class="liquid" style="height: <?= $percent ?>%; background-color: <?php
                                                                                                    if ($tank['product_type'] == 'Diesel') echo '#ffbe0b';
                                                                                                    if ($tank['product_type'] == 'Petrol') echo '#ef233c';
                                                                                                    if ($tank['product_type'] == 'Gas') echo '#3a86ff';
                                                                                                    ?>"></div>
                        </div>

                        <h5><?= htmlspecialchars($tank['name']) ?></h5>
                        <h3 class="fw-bold my-2" dir="ltr"><?= number_format($tank['current_volume'], 0) ?> <small class="fs-6 text-muted">Liters</small></h3>
                        <p class="text-muted small">Max: <?= number_format($tank['capacity_liters']) ?> L</p>

                        <hr>
                        <div class="d-flex justify-content-around">
                            <button class="btn btn-sm btn-outline-primary" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-outline-info" title="History"><i class="fas fa-history"></i></button>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

</body>

</html>