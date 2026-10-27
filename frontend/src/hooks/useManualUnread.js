// Danh dau chua doc thu cong. Danh sach lay tu GET /me/manual-unread (khong phu thuoc route cu), cap nhat lac quan khi bam,
// dong bo giua cac tab bang BroadcastChannel, tai lai khi cua so duoc focus (thiet bi khac thay doi se hien o lan focus sau).
import { useCallback, useEffect, useRef, useState } from 'react';
import '../extensions/unread-mark.css';

const BASE = '/api/v1';

async function call(method, path) {
    const res = await fetch(BASE + path, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Không thực hiện được.');
    }
    return res.json();
}

export function useManualUnread() {
    const [ids, setIds] = useState(() => new Set());
    const channel = useRef(null);

    const apply = useCallback((id, value) => setIds(prev => {
        if (prev.has(id) === value) return prev;
        const next = new Set(prev);
        if (value) next.add(id); else next.delete(id);
        return next;
    }), []);

    const reload = useCallback(async () => {
        try {
            const data = await call('GET', '/me/manual-unread');
            setIds(new Set((data.items || []).map(String)));
        } catch { /* giu trang thai hien tai */ }
    }, []);

    useEffect(() => {
        reload();
        const onVisible = () => { if (document.visibilityState === 'visible') reload(); };
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', reload);
        return () => {
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('focus', reload);
        };
    }, [reload]);

    useEffect(() => {
        if (typeof BroadcastChannel === 'undefined') return undefined;
        const bc = new BroadcastChannel('chatott-manual-unread');
        bc.onmessage = e => { const { id, value } = e.data || {}; if (id) apply(id, Boolean(value)); };
        channel.current = bc;
        return () => bc.close();
    }, [apply]);

    const set = useCallback(async (conversationId, value) => {
        const id = String(conversationId);
        apply(id, value);
        channel.current?.postMessage({ id, value });
        try {
            await call(value ? 'POST' : 'DELETE', `/conversations/${encodeURIComponent(id)}/unread`);
        } catch (error) {
            apply(id, !value);
            channel.current?.postMessage({ id, value: !value });
            throw error;
        }
    }, [apply]);

    const isManual = useCallback(conversationId => ids.has(String(conversationId)), [ids]);

    return { isManual, markUnread: id => set(id, true), markRead: id => set(id, false) };
}
