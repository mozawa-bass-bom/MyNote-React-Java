// state/useRefreshNav.ts
import { useApplyNav } from './applyNav';
import { getNavById } from '../helpers/UserNavService';
import { getTocMap } from '../helpers/TocService';

type RefreshOpts = {
  userId: number;
  nav?: boolean; // categories+notes
  toc?: boolean; // toc map
};

export function useRefreshNav() {
  const { applyNav, applyToc } = useApplyNav();

  return async ({ userId, nav = true, toc = false }: RefreshOpts) => {
    if (nav) {
      const snapshot = await getNavById(userId);
      applyNav(snapshot);
    }
    if (toc) {
      const tocResp = await getTocMap();
      applyToc(tocResp);
    }
  };
}
