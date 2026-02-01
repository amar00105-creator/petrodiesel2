import React from 'react';

export default function SimpleAccounting(props) {
    console.log('SimpleAccounting Props:', props);
    return (
        <div className="p-10 bg-white border-2 border-red-500 m-10">
            <h1 className="text-3xl font-bold text-red-600">TEST MODE: Accounting Dashboard</h1>
            <p>If you see this, React is working!</p>
            <div className="mt-4 p-4 bg-gray-100 rounded">
                <h3 className="font-bold">Received Data:</h3>
                <ul>
                    <li>Settings: {props.settings ? 'Yes' : 'No'}</li>
                    <li>Currency: {props.currency}</li>
                    <li>Banks: {props.banks?.length || 0}</li>
                    <li>Safes: {props.safes?.length || 0}</li>
                </ul>
            </div>
        </div>
    );
}
