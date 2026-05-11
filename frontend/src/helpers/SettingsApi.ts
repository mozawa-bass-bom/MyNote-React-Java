import CustomAxios from './CustomAxios';

export type ThemeSettingData = {
    theme: string;
    customBgColor?: string;
    customBorderColor?: string;
    customFontColor?: string;
    customInputBgColor?: string;
};

/**
 * テーマ設定を取得する。
 *
 * CustomAxios の 401 インターセプターは window.location.assign('/') を呼ぶため、
 * このエンドポイントでは直接 fetch を使い、401 は静かに null を返す。
 * （ページロード直後にトークンが未セットの場合でも ERR_EMPTY_RESPONSE を防ぐ）
 */
export const fetchThemeSetting = async (): Promise<ThemeSettingData | null> => {
    try {
        const stored = localStorage.getItem('loginUser');
        if (!stored) return null;

        let token: string | null = null;
        try {
            const loginUser = JSON.parse(stored);
            token = loginUser?.token ?? null;
        } catch {
            return null;
        }
        if (!token) return null;

        const res = await fetch('http://localhost:8080/api/user-settings/theme', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        // 認証エラーはリダイレクトせず null を返す
        if (res.status === 401 || res.status === 403) return null;
        if (!res.ok) return null;

        const body = await res.json();
        if (body?.success && body?.data) {
            return body.data as ThemeSettingData;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch theme setting', error);
        return null;
    }
};

export const updateThemeSetting = async (data: ThemeSettingData): Promise<boolean> => {
    try {
        const response = await CustomAxios.put('/user-settings/theme', data);
        return response.data && response.data.success;
    } catch (error) {
        console.error('Failed to update theme setting', error);
        return false;
    }
};
