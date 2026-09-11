import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { profileService } from '../api/profileServices';
import { ApiError } from '../api/apiClient';
import {
    ProfileResponse,
    AvailabilityResponse,
    WorkScheduleResponse,
    LanguageResponse,
    BankManagementResponse,
} from '../api/profileServicesTypes';
import { profileKeys } from '../api/queryKeys';

// ─── Full profile ────────────────────────────────────────────────
export function useProfileQuery(
    options?: Omit<UseQueryOptions<ProfileResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
    return useQuery<ProfileResponse, ApiError>({
        queryKey: profileKeys.profile(),
        queryFn: () => profileService.getProfile(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
}

// ─── Availability ────────────────────────────────────────────────
export function useAvailabilityQuery(
    options?: Omit<UseQueryOptions<AvailabilityResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
    return useQuery<AvailabilityResponse, ApiError>({
        queryKey: profileKeys.availability(),
        queryFn: () => profileService.getAvailability(),
        staleTime: 30 * 1000, // 30 seconds – can change often
        ...options,
    });
}

// ─── Work schedule ───────────────────────────────────────────────
export function useWorkScheduleQuery(
    options?: Omit<UseQueryOptions<WorkScheduleResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
    return useQuery<WorkScheduleResponse, ApiError>({
        queryKey: profileKeys.workSchedule(),
        queryFn: () => profileService.getWorkSchedule(),
        staleTime: 60 * 1000,
        ...options,
    });
}

// ─── Language ────────────────────────────────────────────────────
export function useLanguageQuery(
    options?: Omit<UseQueryOptions<LanguageResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
    return useQuery<LanguageResponse, ApiError>({
        queryKey: profileKeys.language(),
        queryFn: () => profileService.getLanguage(),
        staleTime: 60 * 1000,
        ...options,
    });
}

// ─── Bank management ─────────────────────────────────────────────
export function useBankManagementQuery(
    options?: Omit<UseQueryOptions<BankManagementResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
    return useQuery<BankManagementResponse, ApiError>({
        queryKey: profileKeys.bankManagement(),
        queryFn: () => profileService.getBankManagement(),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}