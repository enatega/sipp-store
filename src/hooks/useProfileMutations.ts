import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { profileService } from '../api/profileServices';
import { ApiError } from '../api/apiClient';
import {
    UpdateAvailabilityRequest,
    UpdateAvailabilityResponse,
    UpdateWorkScheduleRequest,
    UpdateWorkScheduleResponse,
    UpdateLanguageRequest,
    UpdateLanguageResponse,
    UpdateBankManagementRequest,
    UpdateBankManagementResponse,
    AvailabilityResponse,
    UpdateProfileInfoRequest,
    UpdateProfileInfoResponse,
} from '../api/profileServicesTypes';
import { profileKeys } from '../api/queryKeys';

// ─── Update Availability ─────────────────────────────────────────

export function useUpdateAvailability(
  options?: UseMutationOptions<UpdateAvailabilityResponse, ApiError, UpdateAvailabilityRequest>
) {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateAvailabilityResponse,
    ApiError,
    UpdateAvailabilityRequest,
    { previous: AvailabilityResponse | undefined }
  >({
    mutationFn: (data: UpdateAvailabilityRequest) => profileService.updateAvailability(data),
    onMutate: async (newData) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: profileKeys.availability() });

      // Snapshot previous value for rollback
      const previous = queryClient.getQueryData<AvailabilityResponse>(profileKeys.availability());

      // Optimistically update the cache
      queryClient.setQueryData<AvailabilityResponse>(profileKeys.availability(), (old) => ({
        ...old,
        store_id: old?.store_id ?? '',
        store_available: newData.storeAvailable,
      }));

      return { previous };
    },
    onError: (error, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previous) {
        queryClient.setQueryData(profileKeys.availability(), context.previous);
      }
      options?.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      // Re-apply the successful value to avoid stale refetch flicker.
      queryClient.setQueryData<AvailabilityResponse>(profileKeys.availability(), (old) => ({
        ...old,
        store_id: old?.store_id ?? data.store_id ?? '',
        store_available: variables.storeAvailable,
      }));
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onSettled: (data, error, variables, context) => {
      // Refetch in background to sync eventual server state.
      queryClient.invalidateQueries({
        queryKey: profileKeys.availability(),
        refetchType: 'inactive',
      });
      options?.onSettled?.(data, error, variables, context);
    },
    ...options,
  });
}

// ─── Update Work Schedule ────────────────────────────────────────
export function useUpdateWorkSchedule(
    options?: UseMutationOptions<UpdateWorkScheduleResponse, ApiError, UpdateWorkScheduleRequest>
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => profileService.updateWorkSchedule(data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: profileKeys.workSchedule() });
            options?.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

// ─── Update Language ─────────────────────────────────────────────
export function useUpdateLanguage(
    options?: UseMutationOptions<UpdateLanguageResponse, ApiError, UpdateLanguageRequest>
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => profileService.updateLanguage(data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: profileKeys.language() });
            // Optionally also invalidate full profile if language is part of it
            queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
            options?.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

// ─── Update Bank Management ──────────────────────────────────────
export function useUpdateBankManagement(
    options?: UseMutationOptions<UpdateBankManagementResponse, ApiError, UpdateBankManagementRequest>
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => profileService.updateBankManagement(data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: profileKeys.bankManagement() });
            options?.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

// ─── Update Profile Info (Address / Phone) ──────────────────────
export function useUpdateProfileInfo(
    options?: UseMutationOptions<UpdateProfileInfoResponse, ApiError, UpdateProfileInfoRequest>
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => profileService.updateProfileInfo(data),
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
            options?.onSuccess?.(data, variables, onMutateResult, context);
        },
        ...options,
    });
}
