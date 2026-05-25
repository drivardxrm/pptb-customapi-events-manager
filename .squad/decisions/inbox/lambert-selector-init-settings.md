# Selector Init Settings — UX/State Behavior Analysis & Regression Checklist

**By:** Lambert (Tester)  
**Date:** 2026-05-25  
**Request:** David Rivard  
**Scope:** New init settings for Custom API filter and Business Event filter

---

## Executive Summary

Two new app settings will control the **initial** filter state when selectors load:
- `customapiSelectionInit` (all | unmanaged | managed) → defaults `showCustomApis` in CustomApiSelector
- `businessEventSelectionInit` (all | unmanaged | managed) → defaults `showBusinessEventsOnly` toggle state

Settings form will reuse `ManagedStateToggle` component for both selectors. **Manual filter changes within a session persist independently** — settings only drive the initial state on component mount.

---

## Expected UX & State Behavior

### State Architecture

**State Sources (in load order):**
1. **AppSettings (persisted)** — Loads from `window.toolboxAPI.settings` on app init
2. **CustomApiSelector Local State** — `useState<ManagedStateFilter>('all')` 
3. **CatalogSelector Local State** — (unchanged; Business Event filter lives in CustomApiSelector)

**Initialization Chain:**
```
App loads
  ↓
AppSettings query runs (connection-scoped)
  ↓
CustomApiSelector mounts
  ↓
If appSettings.customapiSelectionInit exists:
  setShowCustomApis(appSettings.customapiSelectionInit)
Else:
  setShowCustomApis('all') [default fallback]
```

### Scenario 1: Fresh App Load with Default Settings

**Given:**
- User has never configured selector init settings
- AppSettings defaults: `{ customapiSelectionInit: undefined, businessEventSelectionInit: undefined }`

**When:** App loads

**Then:**
- CustomApiSelector shows `showCustomApis = 'all'` (default state)
- Business Event filter (`showBusinessEventsOnly`) shows `false` (default state)
- Settings form shows toggle buttons in "All" position (defaults)
- All Custom APIs visible (no managed/unmanaged filtering)

---

### Scenario 2: Configured Init Settings (First Load)

**Given:**
- User has saved settings: `customapiSelectionInit = 'managed'`, `businessEventSelectionInit = 'managed'`
- AppSettings loaded from store

**When:** App loads + CustomApiSelector mounts

**Then:**
1. **CustomApiSelector state:**
   - `showCustomApis` initializes to `'managed'` (from setting)
   - Only managed Custom APIs displayed
   - Managed State toggle shows "Managed" selected

2. **Business Event filter:**
   - `showBusinessEventsOnly` initializes to `true` (from setting = 'managed')
   - Business Event badge appears in filter summary
   - Only Business Event-linked Custom APIs displayed

3. **Settings form:**
   - Custom API filter toggle shows "Managed" button selected
   - Business Event selector would need: toggle showing 'managed' or semantic on/off

---

### Scenario 3: Manual Filter Change During Session (Persistence)

**Given:**
- App loaded with `customapiSelectionInit = 'all'` (settings default)
- CustomApiSelector now shows all Custom APIs

**When:** User clicks "Managed" button in Custom API filter section

**Then:**
1. **Immediate:**
   - `showCustomApis` state updates to `'managed'` (component state)
   - Custom API picker updates to show only managed APIs
   - Active filter count badge shows: `(1)` for managed filter
   - Managed State toggle shows "Managed" selected

2. **Session Persistence:**
   - Manual change DOES NOT write to AppSettings
   - Reload app → CustomApiSelector re-initializes to `appSettings.customapiSelectionInit` (original setting)
   - Manual session changes are ephemeral

---

### Scenario 4: Settings Form Modification & Save

**Given:**
- Settings form open
- Current settings: `customapiSelectionInit = 'all'`
- Settings form shows "All" toggle selected

**When:** User clicks "Managed" button and then "Save"

**Then:**
1. **Form UI:**
   - Toggle updates to "Managed" (visual feedback)
   - `hasChanges()` returns true (triggers Save/Reset button enable)

2. **Save Action:**
   - `updateAppSettings()` mutates setting to `'managed'`
   - Success log: "Settings saved successfully"

3. **Next App Load:**
   - CustomApiSelector initializes `showCustomApis = 'managed'`
   - Filter appears as active in selector

---

### Scenario 5: Business Event Filter Init Behavior

**Critical Design Question:** How should `businessEventSelectionInit` map to `showBusinessEventsOnly`?

**Option A (Semantic Mapping):**
- Setting stores as 'all' | 'managed' | 'unmanaged' (consistent with Custom API filter)
- In selector: if setting = 'all' → `showBusinessEventsOnly = false`; if setting ≠ 'all' → `showBusinessEventsOnly = true`
- Drawback: Loses granularity (can't set unmanaged Business Events only)

**Option B (Direct Boolean):**
- Setting stores as boolean: true (Business Events Only) / false (All)
- In selector: `showBusinessEventsOnly = appSettings.businessEventSelectionInit ?? false`
- Simpler but less consistent with Custom API filter UI

**Option C (Reuse ManagedStateToggle + Conditional Logic):**
- Settings form uses ManagedStateToggle for consistency
- Selector interprets: 'all' → toggle off, 'managed'/'unmanaged' → toggle on
- Keeps three-option form UI but collapses to binary runtime behavior
- Recommended approach for UI consistency

---

## Regression Checklist

### Phase 1: AppSettings Model & Persistence

- [ ] **1.1** AppSettings interface includes `customapiSelectionInit?: ManagedStateFilter` 
- [ ] **1.2** AppSettings interface includes `businessEventSelectionInit?: ManagedStateFilter`
- [ ] **1.3** DEFAULT_SETTINGS provides `customapiSelectionInit: 'all'` (explicit default)
- [ ] **1.4** DEFAULT_SETTINGS provides `businessEventSelectionInit: 'all'` (explicit default)
- [ ] **1.5** `mapRecordToSettings()` correctly falls back to defaults if settings undefined
- [ ] **1.6** Connection-scoped settings preserved across reloads (if applicable)

---

### Phase 2: Settings Form Integration

- [ ] **2.1** Settings form renders two new fields: "Custom API Selection Init" and "Business Event Selection Init"
- [ ] **2.2** Both fields use ManagedStateToggle component (three buttons: All/Unmanaged/Managed)
- [ ] **2.3** Initial values load from appSettings: Custom API toggle shows correct position
- [ ] **2.4** Initial values load from appSettings: Business Event toggle shows correct position
- [ ] **2.5** Toggling Custom API button updates local form state
- [ ] **2.6** Toggling Business Event button updates local form state
- [ ] **2.7** `hasChanges()` detects if either new setting changed from saved value
- [ ] **2.8** Save button triggers `updateAppSettings()` with new values
- [ ] **2.9** Success message logged: "Settings saved successfully"
- [ ] **2.10** Reset button restores form to saved values
- [ ] **2.11** Form disables Save/Reset if no changes detected

---

### Phase 3: CustomApiSelector Initialization

- [ ] **3.1** CustomApiSelector component has useEffect that reads appSettings on mount
- [ ] **3.2** If `appSettings.customapiSelectionInit` is defined, `setShowCustomApis(appSettings.customapiSelectionInit)`
- [ ] **3.3** If `appSettings.customapiSelectionInit` is undefined, falls back to `'all'`
- [ ] **3.4** If `appSettings.businessEventSelectionInit` defined, initialize Business Event filter accordingly
- [ ] **3.5** Initialization happens AFTER appSettings query completes (loading state check)
- [ ] **3.6** No initialization occurs if appSettings query fails (error state)

---

### Phase 4: Filter Default Values (First Load)

**Test Case 4.A: Load with Defaults**
- [ ] **4.A.1** App loads, settings not configured
- [ ] **4.A.2** CustomApiSelector shows `showCustomApis = 'all'` (All button selected)
- [ ] **4.A.3** Managed State toggle shows "All" button filled/primary
- [ ] **4.A.4** Custom API picker displays all managed + unmanaged Custom APIs
- [ ] **4.A.5** Business Event toggle NOT selected (showBusinessEventsOnly = false)
- [ ] **4.A.6** Filter summary (when collapsed) shows no managed-state badge for Custom APIs

**Test Case 4.B: Load with 'managed' Init**
- [ ] **4.B.1** Settings configured: `customapiSelectionInit = 'managed'`
- [ ] **4.B.2** App loads, CustomApiSelector initializes
- [ ] **4.B.3** Managed State toggle shows "Managed" button selected
- [ ] **4.B.4** Custom API picker shows only managed Custom APIs
- [ ] **4.B.5** Active filter count includes managed-state filter: `Filters (1)`
- [ ] **4.B.6** Collapsed filter summary displays badge: "🔒 Managed APIs"

**Test Case 4.C: Load with 'unmanaged' Init**
- [ ] **4.C.1** Settings configured: `customapiSelectionInit = 'unmanaged'`
- [ ] **4.C.2** CustomApiSelector initializes with unmanaged state
- [ ] **4.C.3** Managed State toggle shows "Unmanaged" button selected
- [ ] **4.C.4** Custom API picker shows only unmanaged Custom APIs
- [ ] **4.C.5** Collapsed filter badge: "🔓 Unmanaged APIs"

---

### Phase 5: Manual Filter Changes (Session Persistence)

**Test Case 5.A: Change Filter During Session**
- [ ] **5.A.1** App loaded with default: `customapiSelectionInit = 'all'`
- [ ] **5.A.2** User clicks "Managed" button in Custom API filter section
- [ ] **5.A.3** Filter state updates immediately: `showCustomApis = 'managed'`
- [ ] **5.A.4** Custom API picker re-filters to show only managed APIs
- [ ] **5.A.5** Active filter count badge updates: `Filters (1)`
- [ ] **5.A.6** Manual change does NOT write to AppSettings (no server call)
- [ ] **5.A.7** User refreshes/reloads page

**Test Case 5.B: Reload After Manual Change**
- [ ] **5.B.1** App reloads (Ctrl+R or F5)
- [ ] **5.B.2** AppSettings loads with original value: `customapiSelectionInit = 'all'`
- [ ] **5.B.3** CustomApiSelector initializes to `showCustomApis = 'all'` (reset)
- [ ] **5.B.4** Manual session change is forgotten
- [ ] **5.B.5** Filter summary shows no badge (matches default state)
- [ ] **5.B.6** Custom API picker displays all APIs again

---

### Phase 6: Business Event Filter Init (if using semantic mapping)

**Test Case 6.A: Business Event Init = 'all'**
- [ ] **6.A.1** Settings: `businessEventSelectionInit = 'all'`
- [ ] **6.A.2** CustomApiSelector initializes: `showBusinessEventsOnly = false`
- [ ] **6.A.3** Business Event toggle button NOT selected
- [ ] **6.A.4** Custom API picker shows all Custom APIs (Business Events + non-Business Events)

**Test Case 6.B: Business Event Init = 'managed' or 'unmanaged'**
- [ ] **6.B.1** Settings: `businessEventSelectionInit = 'managed'` (or 'unmanaged')
- [ ] **6.B.2** CustomApiSelector initializes: `showBusinessEventsOnly = true`
- [ ] **6.B.3** Business Event toggle button IS selected
- [ ] **6.B.4** Custom API picker shows only Business Event-linked Custom APIs
- [ ] **6.B.5** Active filter count includes Business Event filter

---

### Phase 7: Settings Form Changes & Persistence

**Test Case 7.A: Change and Save Custom API Init**
- [ ] **7.A.1** Settings form shows current value (e.g., "All")
- [ ] **7.A.2** User clicks "Managed" button
- [ ] **7.A.3** Local form state updates; button shows selected
- [ ] **7.A.4** `hasChanges()` returns true; Save button enabled
- [ ] **7.A.5** User clicks Save
- [ ] **7.A.6** `updateAppSettings()` called with new value
- [ ] **7.A.7** Success log: "Settings saved successfully"
- [ ] **7.A.8** Save button disabled (no more changes)

**Test Case 7.B: Verify New Init Value Takes Effect**
- [ ] **7.B.1** Settings saved: `customapiSelectionInit = 'managed'`
- [ ] **7.B.2** Return to Custom API selector view
- [ ] **7.B.3** CustomApiSelector shows "Managed" button selected (filter count 1)
- [ ] **7.B.4** Custom API picker displays only managed Custom APIs
- [ ] **7.B.5** Reload app (full page refresh)
- [ ] **7.B.6** New init value persists; CustomApiSelector re-initializes to managed state

**Test Case 7.C: Reset Changes Before Save**
- [ ] **7.C.1** Settings form: original value is "All"
- [ ] **7.C.2** User clicks "Managed" (state changes)
- [ ] **7.C.3** User clicks Reset button
- [ ] **7.C.4** Form state reverts to "All"
- [ ] **7.C.5** Save button disabled (no unsaved changes)
- [ ] **7.C.6** Log message: "Changes discarded"

---

### Phase 8: Edge Cases & Boundary Conditions

**Test Case 8.A: Settings Load Error**
- [ ] **8.A.1** AppSettings query fails with error
- [ ] **8.A.2** CustomApiSelector initializes with defaults (no initialization from settings)
- [ ] **8.A.3** Managed State toggle shows "All" (fallback)
- [ ] **8.A.4** Custom API picker displays all APIs
- [ ] **8.A.5** No console errors or React warnings

**Test Case 8.B: Partial Settings (One Init Value Missing)**
- [ ] **8.B.1** AppSettings loaded: `customapiSelectionInit = 'managed'`, `businessEventSelectionInit = undefined`
- [ ] **8.B.2** CustomApiSelector applies managed init for Custom API filter
- [ ] **8.B.3** Business Event filter initializes to default (false or 'all')
- [ ] **8.B.4** Both filters work correctly despite partial config

**Test Case 8.C: Rapid Filter Toggle**
- [ ] **8.C.1** User clicks "Managed", "Unmanaged", "All" buttons in quick succession
- [ ] **8.C.2** State updates reflect last click
- [ ] **8.C.3** No race conditions or stale filter values
- [ ] **8.C.4** No console errors

**Test Case 8.D: Filter Init + Manual Change Combination**
- [ ] **8.D.1** Settings: `customapiSelectionInit = 'managed'`
- [ ] **8.D.2** App loads; CustomApiSelector shows "Managed"
- [ ] **8.D.3** User selects a specific Custom API
- [ ] **8.D.4** User changes filter to "Unmanaged"
- [ ] **8.D.5** Custom API selection preserved (if it exists in unmanaged set)
- [ ] **8.D.6** User filters back to "Managed"
- [ ] **8.D.7** Original Custom API selection still present

---

### Phase 9: Cross-Selector Integration

**Test Case 9.A: Selector Filter Independence**
- [ ] **9.A.1** Custom API filter init = 'managed'; Business Event filter init = 'all'
- [ ] **9.A.2** CustomApiSelector shows "Managed" + no Business Event badge
- [ ] **9.A.3** User enables Business Event toggle
- [ ] **9.A.4** Filter count updates: `Filters (2)`
- [ ] **9.A.5** Toggling Business Event does NOT change Custom API filter state

**Test Case 9.B: Solution Filter Independence**
- [ ] **9.B.1** Custom API filter init = 'managed'
- [ ] **9.B.2** Solution-scoped toggle (showSolutions) is independent state
- [ ] **9.B.3** Changing `showSolutions` does not affect `showCustomApis`
- [ ] **9.B.4** Filter count: Solution toggle does NOT increment count (per 2026-05-21 decision)
- [ ] **9.B.5** Custom API managed-state filter increment count as normal

---

### Phase 10: Regression Baseline (No Regressions)

- [ ] **10.1** Existing Custom API selector behavior unchanged (when init settings undefined)
- [ ] **10.2** Existing Business Event filter behavior unchanged (when init setting undefined)
- [ ] **10.3** Settings form Save/Reset flows work as before
- [ ] **10.4** No new console errors or React warnings
- [ ] **10.5** Build succeeds: `npm run build`
- [ ] **10.6** Existing E2E tests pass: `npm run test:e2e`

---

## Implementation Notes

### AppSettings Changes Required
```typescript
export interface AppSettings {
  // ... existing fields ...
  customapiSelectionInit?: ManagedStateFilter;  // 'all' | 'unmanaged' | 'managed'
  businessEventSelectionInit?: ManagedStateFilter;
}

export const DEFAULT_SETTINGS: AppSettings = {
  // ... existing ...
  customapiSelectionInit: 'all',
  businessEventSelectionInit: 'all',
};
```

### CustomApiSelector Initialization
```typescript
useEffect(() => {
  if (settingsQuery.status === 'success' && settingsQuery.appsettings) {
    setShowCustomApis(settingsQuery.appsettings.customapiSelectionInit ?? 'all');
    // If using semantic mapping for Business Event:
    const beInit = settingsQuery.appsettings.businessEventSelectionInit ?? 'all';
    setShowBusinessEventsOnly(beInit !== 'all');
  }
}, [settingsQuery.status, settingsQuery.appsettings]);
```

### SettingsForm Integration
- Add two Field components with ManagedStateToggle children
- Update `hasChanges()` to include new settings
- Update local state update handlers for toggle changes

---

## Known Constraints

1. **Session-scoped changes only:** Manual filter changes within a session do NOT persist to AppSettings. Only form-based changes to settings persist.
2. **Business Event filter semantic:** If using semantic mapping, 'managed'/'unmanaged' options both enable Business Event filter. Granular business-event-managed filtering would require separate setting.
3. **Solution filter independent:** Solution-scoped managed state toggle (`showSolutions`) remains contextual and does not count toward active filter badge (per 2026-05-21 decision).

---

## Acceptance Criteria

✅ All 80+ regression checkpoints pass  
✅ No new console errors  
✅ No React warnings  
✅ `npm run build` succeeds  
✅ Existing E2E tests pass  
✅ Settings persist across reload  
✅ Manual session changes reset on reload  
