'use client';

import { VisibilityType } from '@/components/visibility-selector';
import { useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';

export function useChatVisibility({
  chatId,
  initialVisibility,
}: {
  chatId: string;
  initialVisibility: VisibilityType;
}) {
  const { data: localVisibility, mutate: setLocalVisibility } = useSWR(
    `${chatId}-visibility`,
    null,
    {
      fallbackData: initialVisibility,
    },
  );

  const setVisibilityType = (updatedVisibilityType: VisibilityType) => {
    setLocalVisibility(updatedVisibilityType);
  };

  return { visibilityType: localVisibility, setVisibilityType };
}
