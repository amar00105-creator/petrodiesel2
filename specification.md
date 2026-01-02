# Smart Fuel Station ERP - Project Specification

## 1. Project Overview
A comprehensive web-based ERP system for managing multiple fuel stations. The system handles stock management (fuel tanks), sales (pumps/counters), accounting (safes/banks), and HR (workers), with support for multi-station management under a single super-admin.

**Technology Stack:**
- **Backend:** PHP (Modern MVC structure or Laravel recommended for scalability).
- **Database:** MySQL.
- **Frontend:** HTML5, CSS3 (Modern UI), JavaScript (AJAX for seamless interactions).
- **Language:** Arabic (Primary) & English.

---

## 2. Core Features & Modules

### A. Dashboard (Home)
- **Layout:** Left Sidebar (Navigation), Top Bar (Notifications/User Profile).
- **Widgets:** 
  - Daily Sales Total.
  - Safe/Treasury Balance.
  - Fuel Stock Levels (Petrol, Diesel, etc.) visualized with tank gauges.
  - Incoming Fuel (Today's supply).
  - Quick Actions Buttons.
- **Visuals:** Date/Time display.

### B. Stock Management (Inventory)
- **Tanks:** define tanks (Capacity, Product Type).
- **Calibration:** Input calibration tables (Dipstick reading -> Volume).
- **Daily Readings:** Opening/Closing dipstick readings (Morning, Mid-day, Closing).
- **Variance Analysis:** Calculate Surplus/Deficit based on Sales vs. Dipstick.
- **Alerts:** Low stock alerts.

### C. Purchasing & Supply Chain
- **Suppliers:** Manage supplier profiles.
- **Transactions:** 
  - Record Purchase Order (Quantity, Price, Supplier).
  - **Truck/Transport Tracking:**
    - Driver Name, Truck Number, Invoice Number.
    - Status: Loaded, In-Transit, Arrived, Offloading, Offloaded.
    - Attachments: Upload Invoice Image, Delivery Note Image.
  - **Financial Impact:** Updates Supplier Ledger and Safe/Bank balance if paid.

### D. Pumps & Sales (Dispensers)
- **Pump Configuration:** 
  - Define Pumps linked to Tanks.
  - Define Counters (Nozzles) per pump.
- **Shift/Worker Assignment:** 
  - Assign a Worker to a Counter.
  - Auto-fetch Worker Name when Counter is selected in Sales.
- **Sales Recording:**
  - Select Pump -> Select Counter.
  - System fetches "Last Closing Reading" automatically.
  - Input "Current Reading".
  - System calculates: `Sold Quantity = Current - Previous`.
  - Calculate `Amount = sold Quantity * Price`.
  - Payment Type: Cash or Credit.
    - If Credit: Select Customer (Debtor).

### E. Financial Management
- **Treasury (Safes):** 
  - Multiple Safe support.
  - Transfers between Safes.
- **Banks:** 
  - Bank Accounts management.
  - Transfers: Bank to Bank, Safe to Bank.
- **Expenses:** 
  - Categories: Operational, Salaries, Electricity, Gov Fees, etc.
  - Record expense taken from Safe or Bank.
- **General Ledger:** 
  - Suppliers (Creditors).
  - Customers (Debtors).
  - P&L Reports.

### F. HR & Workers
- **Worker Management:** Name, Phone, ID.
- **Assignment:** Link Worker to Pump/Counter dynamically.
- **Financials:** 
  - Calculate Worker Sales.
  - Deduct Loans/Advances.
  - Manage Salaries & Bonuses.

### G. Multi-Station & Admin
- **Cloud/Centralized Structure:** Single login for Super Admin to view all stations.
- **Station Management:** Add/Edit Stations.
- **Branch Data Isolation:** Each station sees only its own data (unless Super Admin).
- **Roles & Permissions:** Admin, Manager, Accountant, Viewer.
- **Authentication:** Google OAuth & Standard Email/Password.

---

## 3. Reporting System
- **Daily Station Report:** Sales, Dipstick, Gain/Loss, Expenses, Net Cash.
- **Stock Report:** In/Out movements for specific periods.
- **Financial Reports:** Cash flow, Ledger statements.
- **Worker Performance:** Sales per worker.
- **Export:** PDF/Excel support.

## 4. UI/UX Requirements
- **Theme:** Modern, Clean, Professional. High contrast for outdoor use visibility.
- **Responsiveness:** Mobile-friendly for managers/owners on the go.
- **Input:** Smart defaults (e.g., Previous reading auto-filled) to minimize errors.
