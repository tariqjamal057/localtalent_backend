export interface User {
    id: bigint;
    mobileNumber: string;
    countryCode: string;
    userType: number;
    appLanguageCode: string;
    isActive: boolean;
    refreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserRow {
    id: bigint;
    mobile_number: string;
    country_code: string;
    user_type: number;
    app_language_code: string;
    is_active: boolean;
    refresh_token: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserDto {
    mobileNumber: string;
    countryCode: string;
    userType: number;
    appLanguageCode?: string;
}

export interface UpdateUserDto {
    appLanguageCode: string;
}
