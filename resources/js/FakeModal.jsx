import React from 'react';

export default function FakeModal(props) {
    if (!props.isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-5 rounded">
                <h2>Fake Modal</h2>
                <button onClick={props.onClose}>Close</button>
            </div>
        </div>
    );
}
