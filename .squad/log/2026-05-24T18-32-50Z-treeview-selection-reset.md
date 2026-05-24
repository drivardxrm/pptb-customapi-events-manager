# Session: Tree View Selection Reset

**Directive:** When entering TreeView mode, clear `selectedRequestParameterId` and `selectedResponsePropertyId` from Zustand store.

**Implementation:** Dallas added `useEffect` in `CustomApiDetails.tsx` to clear both selections when `showTreeView` becomes true.

**Validation:** ✅ Build passed; ✅ Focused regression test passed.

**Approval:** ✅ Ripley approved as safe and complete.

**Status:** COMPLETE
