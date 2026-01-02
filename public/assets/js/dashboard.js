// Dashboard Real-time Updates and Animations
document.addEventListener('DOMContentLoaded', function () {

    // Update Clock
    function updateClock() {
        const now = new Date();

        // Format time (24-hour format)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timeString = `${hours}:${minutes}:${seconds}`;

        // Format date in Arabic
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const dateString = now.toLocaleDateString('ar-SA', options);

        // Update DOM
        const timeElement = document.getElementById('current-time');
        const dateElement = document.getElementById('current-date');

        if (timeElement) timeElement.textContent = timeString;
        if (dateElement) timeElement.textContent = dateString;
    }

    // Update clock immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);

    // Animate counters
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = formatNumber(target);
                clearInterval(timer);
            } else {
                element.textContent = formatNumber(Math.floor(current));
            }
        }, 16);
    }

    // Format numbers with commas
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Animate all stat values on page load
    document.querySelectorAll('.stat-value').forEach(element => {
        const target = parseFloat(element.textContent.replace(/,/g, ''));
        if (!isNaN(target)) {
            element.textContent = '0';
            animateCounter(element, target);
        }
    });

    // Logo Upload Handler
    const logoInput = document.getElementById('logo-upload');
    if (logoInput) {
        logoInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('logo', file);

                // Show loading state
                const uploadBtn = document.querySelector('.logo-upload-btn');
                const originalText = uploadBtn.innerHTML;
                uploadBtn.innerHTML = '<span class="loading-spinner"></span> جاري الرفع...';
                uploadBtn.disabled = true;

                // Upload logo
                fetch('/api/upload-logo', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Update logo preview
                            document.getElementById('company-logo').src = data.logoUrl;
                            showNotification('تم تحديث الشعار بنجاح', 'success');
                        } else {
                            showNotification('فشل تحديث الشعار', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification('حدث خطأ أثناء رفع الشعار', 'error');
                    })
                    .finally(() => {
                        uploadBtn.innerHTML = originalText;
                        uploadBtn.disabled = false;
                    });
            }
        });
    }

    // Auto-refresh dashboard data every 30 seconds
    function refreshDashboardData() {
        fetch('/api/dashboard-data')
            .then(response => response.json())
            .then(data => {
                updateDashboardStats(data);
            })
            .catch(error => {
                console.error('Error refreshing dashboard:', error);
            });
    }

    // Update dashboard statistics
    function updateDashboardStats(data) {
        // Update sales
        if (data.todaySales !== undefined) {
            const salesElement = document.querySelector('[data-stat="sales"] .stat-value');
            if (salesElement) {
                animateCounter(salesElement, data.todaySales);
            }
        }

        // Update safe balance
        if (data.safeBalance !== undefined) {
            const safeElement = document.querySelector('[data-stat="safe"] .stat-value');
            if (safeElement) {
                animateCounter(safeElement, data.safeBalance);
            }
        }

        // Update fuel levels
        if (data.petrolStock !== undefined) {
            updateFuelGauge('petrol', data.petrolStock, data.petrolCapacity);
        }

        if (data.dieselStock !== undefined) {
            updateFuelGauge('diesel', data.dieselStock, data.dieselCapacity);
        }

        // Update recent sales table
        if (data.recentSales) {
            updateRecentSalesTable(data.recentSales);
        }
    }

    // Update fuel gauge visualization
    function updateFuelGauge(type, current, capacity) {
        const percentage = (current / capacity) * 100;
        const gaugeElement = document.querySelector(`[data-fuel="${type}"] .fuel-level`);

        if (gaugeElement) {
            gaugeElement.style.height = percentage + '%';
            gaugeElement.textContent = Math.round(percentage) + '%';
        }

        // Update stat card
        const statElement = document.querySelector(`[data-stat="${type}"] .stat-value`);
        if (statElement) {
            statElement.textContent = formatNumber(current) + ' لتر';
        }
    }

    // Update recent sales table
    function updateRecentSalesTable(sales) {
        const tbody = document.querySelector('.sales-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        sales.forEach(sale => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sale.id}</td>
                <td>${sale.counter}</td>
                <td>${sale.worker}</td>
                <td>${formatNumber(sale.volume)} لتر</td>
                <td>${formatNumber(sale.amount)} دينار</td>
                <td>${sale.time}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Refresh data every 30 seconds
    setInterval(refreshDashboardData, 30000);

    // Add hover effects to cards
    document.querySelectorAll('.stat-card, .panel, .well-item').forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-8px)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });

    // Initialize fuel gauges with animation
    document.querySelectorAll('.fuel-gauge').forEach(gauge => {
        const level = gauge.querySelector('.fuel-level');
        const targetHeight = level.getAttribute('data-level') || '0';

        setTimeout(() => {
            level.style.height = targetHeight + '%';
        }, 500);
    });

    // Quick action button handlers
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const action = this.getAttribute('data-action');
            handleQuickAction(action);
        });
    });

    // Handle quick actions
    function handleQuickAction(action) {
        switch (action) {
            case 'new-sale':
                window.location.href = '/sales/new';
                break;
            case 'tank-reading':
                window.location.href = '/tanks/reading';
                break;
            case 'new-purchase':
                window.location.href = '/purchases/new';
                break;
            case 'expense':
                window.location.href = '/expenses/new';
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
