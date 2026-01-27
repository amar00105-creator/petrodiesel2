import React from 'react';
import ReactDOM from 'react-dom/client';
import FuturisticHeader from './components/ui/FuturisticHeader';
import AutoLock from './components/AutoLock';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy Load Components
const AddPump = React.lazy(() => import('./AddPump'));
const PumpList = React.lazy(() => import('./PumpList'));
const ManagePump = React.lazy(() => import('./ManagePump'));
const AddSale = React.lazy(() => import('./AddSale'));
const WorkerList = React.lazy(() => import('./WorkerList'));
const SupplierList = React.lazy(() => import('./SupplierList'));
const PurchaseList = React.lazy(() => import('./PurchaseList'));
const TankList = React.lazy(() => import('./TankList'));
const AccountingDashboard = React.lazy(() => import('./AccountingDashboard'));
const BanksPage = React.lazy(() => import('./BanksPage'));
const SafesPage = React.lazy(() => import('./SafesPage'));
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

// Import Tailwind directives via CSS
import '../css/app.css';

const rootElement = document.getElementById('root');

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    const page = rootElement.dataset.page?.trim().toLowerCase();
    
    // Debugging (Temporary)
    console.log('Detected Page:', page);
    console.log('Page Length:', page?.length);

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

    let Component;
    let props = {};


    switch (page) {
        case 'add-pump':
            Component = AddPump;
            props = {
                stats: getStats(),
                tanks: getData('tanks'),
                workers: getData('workers')
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
            props = {
                safes: getData('safes'),
                banks: getData('banks'),
                transactions: getData('transactions'),
                categories: getData('categories'),
                suppliers: getData('suppliers'),
                customers: getData('customers'),
                baseUrl: rootElement.dataset.baseUrl || '/PETRODIESEL2/public'
            };
            break;
        case 'accounting-banks':
            Component = BanksPage;
            props = {
                banks: getData('banks')
            };
            break;
        case 'accounting-safes':
            Component = SafesPage;
            props = {
                safes: getData('safes')
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



    const user = getData('user');
    const allStations = getData('allStations');
    const stats = getStats(); // Now contains activeUsers from view

    root.render(
        <React.StrictMode>
            <ErrorBoundary>
                <Toaster 
                    position="top-left" 
                    richColors 
                    toastOptions={{
                        className: 'font-cairo !bg-white/95 !backdrop-blur-md !border-slate-200 !shadow-2xl !rounded-2xl',
                        style: {
                            fontFamily: 'Cairo, sans-serif',
                        },
                        classNames: {
                            toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                            title: 'group-[.toast]:font-bold group-[.toast]:text-base',
                            description: 'group-[.toast]:text-slate-500 group-[.toast]:text-sm',
                            actionButton: 'group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50',
                            cancelButton: 'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500',
                            success: 'group-[.toaster]:!bg-emerald-50 group-[.toaster]:!border-emerald-200 group-[.toaster]:!text-emerald-900',
                            error: 'group-[.toaster]:!bg-red-50 group-[.toaster]:!border-red-200 group-[.toaster]:!text-red-900',
                        }
                    }}
                />
                <FuturisticHeader 
                    page={page} 
                    user={user} 
                    stats={stats} 
                    allStations={allStations} 
                />
                <AutoLock />
                <React.Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
                    <Component {...props} />
                </React.Suspense>
            </ErrorBoundary>
        </React.StrictMode>
    );
}
