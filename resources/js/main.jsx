import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import FuturisticHeader from './components/ui/FuturisticHeader';
import AutoLock from './components/AutoLock';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// DEBUG ALERT
// console.log("Main.jsx is executing...");
// window.alert("Main.jsx is executing..."); // Uncomment if console is not visible.

// Lazy Load Components
const AddPump = React.lazy(() => import('./AddPump'));
const PumpList = React.lazy(() => import('./PumpList'));
const ManagePump = React.lazy(() => import('./ManagePump'));
const AddSale = React.lazy(() => import('./AddSale'));
const WorkerList = React.lazy(() => import('./WorkerList'));
const SupplierList = React.lazy(() => import('./SupplierList'));
const PurchaseList = React.lazy(() => import('./PurchaseList'));
const TankList = React.lazy(() => import('./TankList'));

// FIX: Static Import for Accounting Dashboard to prevent "Cannot access 'c'" initialization error
import AccountingDashboard from './AccountingDashboard'; 

const BanksPage = React.lazy(() => import('./BanksPage'));
// const SafesPage = React.lazy(() => import('./SafesPage')); // Converted to static below
import SafesPage from './SafesPage';
const FinancialAssetsPage = React.lazy(() => import('./FinancialAssetsPage'));
const HumanResources = React.lazy(() => import('./HumanResources'));
const Partners = React.lazy(() => import('./Partners'));
const ExpenseList = React.lazy(() => import('./ExpenseList'));
const CreatePurchase = React.lazy(() => import('./CreatePurchase'));
const EditPurchase = React.lazy(() => import('./EditPurchase'));
const SalesList = React.lazy(() => import('./SalesList'));
const Settings = React.lazy(() => import('./Settings'));
const Dashboard = React.lazy(() => import('./Dashboard'));
const Reports = React.lazy(() => import('./Reports'));
const StationList = React.lazy(() => import('./StationList'));
const CustomerReport = React.lazy(() => import('./CustomerReport')); // Restored

// Import Tailwind directives via CSS
import '../css/app.css';

const rootElement = document.getElementById('root');

try {
    if (rootElement) {
        const root = createRoot(rootElement); // FIX: Use createRoot directly
        const page = rootElement.dataset.page?.trim().toLowerCase();
    
    // Debugging (Temporary)
    console.log('Detected Page:', page);

    // Parse Data Helper
    const getData = (key) => {
        // Try reading from global window.phpData first (injected by PHP view)
        if (window.phpData && Array.isArray(window.phpData[key])) {
            return window.phpData[key];
        }
        
        // Fallback to dataset
        try {
            return JSON.parse(rootElement.dataset[key] || '[]');
        } catch (e) {
            console.error(`Error parsing data for ${key}:`, e);
            return [];
        }
    };

    const getStats = () => {
        try {
            return JSON.parse(rootElement.dataset.stats || '{}');
        } catch (e) {
            console.error('Error parsing stats:', e);
            return {};
        }
    };

    // Dynamic Base URL for Live vs Local
    // On Localhost: /PETRODIESEL2/public
    // On Live: /public (assuming app.petrodiesel.net/public)
    window.BASE_URL = rootElement.dataset.baseUrl || 
                     (window.location.hostname.includes('petrodiesel') ? '/public' : '/PETRODIESEL2/public');

    const user = getData('user');
    const allStations = getData('allStations');
    const stats = getStats(); // Now contains activeUsers from view
    const settings = getData('settings') || {};

    // Determine Currency
    // settings is usually { base_currency: "SAR", ... } if associating array or object
    // If it comes as array of objects [{key_name:..., value:...}], we need to parse it.
    // The Setting model getAllBySection returns ['key' => 'value']. So it should be an object.
    
    // Check if settings is array (from empty json_encode) or object
    let currencyCode = 'SDG';
    if (settings && !Array.isArray(settings)) {
         // Based on screenshot, label is 'base_currency' or similar
         // Let's look for known currency keys
         if (settings.base_currency) currencyCode = settings.base_currency;
         else if (settings.system_currency) currencyCode = settings.system_currency;
         else if (settings.currency) currencyCode = settings.currency;
         
         // If formatting is "Generic Currency (Code)", extract Code
         const match = currencyCode.match(/\(([^)]+)\)/);
         if (match) {
             currencyCode = match[1];
         }
    }

    let Component;
    let props = {};

    switch (page) {
        case 'add-pump':
        case 'edit-pump':
            Component = AddPump;
            props = {
                stats: getStats(),
                tanks: getData('tanks'),
                workers: getData('workers'),
                initialData: {
                    pump: getData('pump'),
                    counters: getData('counters')
                }
            };
            break;
        case 'sales-create':
            Component = AddSale;
            props = {
                pumps: getData('pumps'),
                safes: getData('safes'),
                banks: getData('banks'),
                customers: getData('customers'),
                initialSale: getData('sale') // For edit mode
            };
            break;

        case 'pumps':
            Component = PumpList;
            props = {
                pumps: getData('pumps'),
                tanks: getData('tanks'),
                workers: getData('workers')
            };
            break;
        case 'manage-pump':
            Component = ManagePump;
            props = {
                pump: getData('pump'),
                counters: getData('counters'),
                workers: getData('workers'),
                tanks: getData('tanks')
            };
            break;
        case 'workers':
            Component = WorkerList;
            props = {
                workers: getData('workers')
            };
            break;
        case 'supplier-list':
            // Redirecting old page key to new component logic if needed, but we changed the view.
            // Keeping this for backward compatibility if any cached view uses it, or just replace it.
            // The view now sends 'partners'.
            Component = SupplierList;
            props = {
                suppliers: getData('suppliers')
            };
            break;
        case 'partners':
            Component = Partners;
            props = {
                suppliers: getData('suppliers'),
                customers: getData('customers')
            };
            break;
        case 'purchase-list':
            Component = PurchaseList;
            props = {
                purchases: getData('purchases'),
                tanks: getData('tanks')
            };
            break;
        case 'tank-list':
            Component = TankList;
            props = {
                tanks: getData('tanks'),
                suppliers: getData('suppliers'),
                fuelSettings: getData('fuelSettings'),
                fuelTypes: getData('fuelTypes')
            };
            break;
            case 'accounting-dashboard':
            Component = AccountingDashboard;
            // Component = SimpleAccounting; // DEBUG: Test Isolation
            props = {
                safes: getData('safes'),
                banks: getData('banks'),
                transactions: getData('transactions'),
                categories: getData('categories'),
                suppliers: getData('suppliers'),
                customers: getData('customers'),
                baseUrl: rootElement.dataset.baseUrl || '/PETRODIESEL2/public',
                currency: currencyCode // Standardized
            };
            break;
        case 'accounting-banks':
            Component = BanksPage;
            props = {
                banks: getData('banks'),
                currency: currencyCode
            };
            break;
        case 'accounting-safes':
            Component = SafesPage;
            props = {
                safes: getData('safes'), // Should match view's ->with('safes', ...)
                currency: currencyCode 
            };
            break;
        case 'accounting-assets':
            Component = FinancialAssetsPage;
            props = {
                banks: getData('banks'),
                safes: getData('safes')
            };
            break;
        case 'human-resources':
            Component = HumanResources;
            props = {
                workers: getData('workers'),
                employees: getData('employees'),
                drivers: getData('drivers')
            };
            break;
        case 'expense-list':
        case 'expenses':
            Component = ExpenseList;
            props = {
                expenses: getData('expenses')
            };
            break;
        case 'purchases':
            Component = PurchaseList;
            props = {
                purchases: getData('purchases'),
                suppliers: getData('suppliers'),
                tanks: getData('tanks'),
                currency: currencyCode
            };
            break;
        case 'edit-purchase':
            Component = EditPurchase;
            props = {
                purchase: getData('purchase'),
                suppliers: getData('suppliers'),
                tanks: getData('tanks'),
                drivers: getData('drivers'),
                fuelTypes: getData('fuelTypes')
            };
            break;
        case 'create-purchase':
            Component = CreatePurchase;
            props = {
                suppliers: getData('suppliers'),
                tanks: getData('tanks'),
                safes: getData('safes'),
                banks: getData('banks'),
                drivers: getData('drivers'),
                invoiceNumber: rootElement.dataset.invoiceNumber, // read from data-invoice-number
                canAddSupplier: getData('canAddSupplier'),
                canAddDriver: getData('canAddDriver'),
                fuelTypes: getData('fuelTypes')
            };
            break;
        case 'sales-list':
            Component = SalesList;
            props = {
                sales: getData('sales')
            };
            break;
        case 'settings':
            Component = Settings;
            props = {
                general: getData('general'),
                fuel: getData('fuel'),
                alerts: getData('alerts'),
                roles: getData('roles'),
                fuelTypes: getData('fuelTypes'),
                stations: getData('stations'),
                users: getData('users')
            };
            break;
        case 'reports':
            Component = Reports;
            props = {
                user: getData('user') // Pass user info if needed
            };
            break;
        case 'report-customer':
             Component = CustomerReport;
             props = {
                 customers: getData('customers')
             };
             break;
        case 'station-list':
             Component = StationList;
             props = {
                 stations: getData('stations'),
                 users: getData('users')
             };
             break;
        case 'dashboard':
        default:
            // Default to Dashboard if page is unknown or intentionally dashboard
            Component = Dashboard;
            props = {
                data: getData('data') // Dashboard data from controller
            };
            if (page && page !== 'dashboard') {
               console.warn(`Unknown page "${page}", falling back to Dashboard.`);
            }
    }


    // Global Error Suppression for Hydration/RemoveChild errors
    if (typeof window !== 'undefined') {
        const suppressErrors = ['NotFoundError', 'removeChild', 'Node'];
        window.addEventListener('error', (e) => {
            if (suppressErrors.some(err => e.message?.includes(err))) {
                e.preventDefault();
                console.warn('Suppressed React RemoveChild Error:', e.message);
            }
        });
        const originalError = console.error;
        console.error = (...args) => {
            if (args[0] && typeof args[0] === 'string' && suppressErrors.some(err => args[0].includes(err))) {
                return;
            }
            originalError.call(console, ...args);
        };
    }

    // Unified Render Logic
    root.render(
        <ErrorBoundary>
            <Toaster 
                position="top-left" 
                richColors 
                toastOptions={{
                    className: 'font-cairo !bg-white/95 !backdrop-blur-md !border-slate-200 !shadow-2xl !rounded-2xl',
                    style: { fontFamily: 'Cairo, sans-serif' }
                }}
            />
            <FuturisticHeader 
                page={page} 
                user={user} 
                stats={stats} 
                allStations={allStations}
                currency={currencyCode} 
            />

            {/* Explicitly bypass Suspense for SafesPage to fix hydration error */}
            {page === 'accounting-safes' ? (
                <SafesPage {...props} />
            ) : (
                <React.Suspense fallback={<LoadingSpinner />}>
                    <Component {...props} />
                </React.Suspense>
            )}
        </ErrorBoundary>
    );

    }
} catch (err) {
    console.error("CRITICAL JS ERROR:", err);
    window.alert("CRITICAL JS ERROR: " + err.message);
}
