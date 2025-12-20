"use client";

import { useEffect, useState } from 'react';

export function useAnonymousUser() {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        // Wrap in a function to clean up logic
        const initUser = () => {
            let storedId = localStorage.getItem('serene_user_id');
            if (!storedId) {
                storedId = crypto.randomUUID();
                localStorage.setItem('serene_user_id', storedId);
            }
            setUserId(storedId);
        };

        initUser();
    }, []);

    return userId;
}
