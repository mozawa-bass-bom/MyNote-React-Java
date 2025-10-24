// state/useRefreshNav.ts
import { useApplyNav } from './applyNav';
import { getNavById } from '../helpers/RefreshNavService';
import { getTocMap } from '../helpers/TocService';

type RefreshOpts = {
  userId: number;
};

export function useRefreshNav() {
  const { applyNav, applyToc } = useApplyNav();

  return async ({ userId }: RefreshOpts) => {
    const snapshot = await getNavById(userId);
    applyNav(snapshot);

    const tocResp = await getTocMap();
    applyToc(tocResp);
  };
}
