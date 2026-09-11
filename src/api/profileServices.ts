import apiClient from './apiClient';
import {
    ProfileResponse,
    AvailabilityResponse,
    UpdateAvailabilityRequest,
    UpdateAvailabilityResponse,
    WorkScheduleResponse,
    UpdateWorkScheduleRequest,
    UpdateWorkScheduleResponse,
    LanguageResponse,
    UpdateLanguageRequest,
    UpdateLanguageResponse,
    BankManagementResponse,
    UpdateBankManagementRequest,
    UpdateBankManagementResponse,
    UpdateProfileInfoRequest,
    UpdateProfileInfoResponse,
} from './profileServicesTypes';

const BASE_PATH = '/apps/deliveries/store-app/profile/me';

export const profileService = {
    // Full profile
    getProfile: () => apiClient.get<ProfileResponse>(`${BASE_PATH}`),

    // Availability
    getAvailability: () => apiClient.get<AvailabilityResponse>(`${BASE_PATH}/availability`),
    updateAvailability: (data: UpdateAvailabilityRequest) =>
        apiClient.patch<UpdateAvailabilityResponse>(`${BASE_PATH}/availability`, {
            storeAvailable: data.storeAvailable,
            store_available: data.storeAvailable,
        }),

    // Work schedule
    getWorkSchedule: () => apiClient.get<WorkScheduleResponse>(`${BASE_PATH}/work-schedule`),
    updateWorkSchedule: (data: UpdateWorkScheduleRequest) =>
        apiClient.patch<UpdateWorkScheduleResponse>(`${BASE_PATH}/work-schedule`, data),

    // Language
    getLanguage: () => apiClient.get<LanguageResponse>(`${BASE_PATH}/language`),
    updateLanguage: (data: UpdateLanguageRequest) =>
        apiClient.patch<UpdateLanguageResponse>(`${BASE_PATH}/language`, data),

    // Bank management
    getBankManagement: () => apiClient.get<BankManagementResponse>(`${BASE_PATH}/bank-management`),
    updateBankManagement: (data: UpdateBankManagementRequest) =>
        apiClient.patch<UpdateBankManagementResponse>(`${BASE_PATH}/bank-management`, data),

    // Profile details (address/phone)
    updateProfileInfo: (data: UpdateProfileInfoRequest) =>
        apiClient.patch<UpdateProfileInfoResponse>(`${BASE_PATH}`, {
            ...(data.city !== undefined
                ? {
                    city: data.city,
                    basicInformation: { city: data.city },
                }
                : {}),
            ...(data.phoneNumber !== undefined
                ? {
                    phoneNumber: data.phoneNumber,
                    phone_number: data.phoneNumber,
                    contactInformation: { phoneNumber: data.phoneNumber },
                }
                : {}),
        }),
};
