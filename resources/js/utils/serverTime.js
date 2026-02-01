/**
 * Get current server date in YYYY-MM-DD format
 * This fetches the actual server date based on configured timezone
 */
export async function getServerDate() {
    try {
        const res = await fetch(`${window.BASE_URL || ''}/api/server-time`);
        const data = await res.json();
        if (data.success) {
            return data.date; // Returns "YYYY-MM-DD"
        }
    } catch (err) {
        console.warn('Failed to get server date, using client date');
    }
    
    // Fallback to client date
    return new Date().toISOString().split('T')[0];
}

/**
 * Get current server datetime object
 * Returns a Date object adjusted to server timezone
 */
export async function getServerDateTime() {
    try {
        const res = await fetch(`${window.BASE_URL || ''}/api/server-time`);
        const data = await res.json();
        if (data.success) {
            const serverDateTime = data.datetime;
            const [datePart, timePart] = serverDateTime.split(' ');
            const [year, month, day] = datePart.split('-');
            const [hour, minute, second] = timePart.split(':');
            
            return new Date(year, month - 1, day, hour, minute, second);
        }
    } catch (err) {
        console.warn('Failed to get server datetime, using client datetime');
    }
    
    // Fallback
    return new Date();
}
