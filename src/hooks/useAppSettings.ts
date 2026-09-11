import { useQuery } from '@tanstack/react-query';
import { appSettingsService } from '../api/appSettingsService';
import { appSettingsKeys } from '../api/queryKeys';

export function useAppSettingsQuery() {
  return useQuery({
    queryKey: appSettingsKeys.store(),
    queryFn: appSettingsService.getAppSettings,
    staleTime: 0,
  });
}
