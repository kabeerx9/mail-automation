import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export function formatDate(isoDate: string | null | undefined): string {
    if (!isoDate) return '-';

    try {
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) return '-';

        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        // If less than 1 hour ago
        if (diffMinutes < 60) {
            return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
        }

        // If less than 24 hours ago
        if (diffHours < 24) {
            return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        }

        // If less than 7 days ago
        if (diffDays < 7) {
            return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        }

        // For older dates, show formatted date
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } catch {
        return '-';
    }
}
