# Project Backlog

**Generated:** 2026-03-01  
**Project:** PPTB Dataverse Custom API Manager

---

## Priority Legend
- **High**: Critical functionality or blockers
- **Medium**: Important improvements or features
- **Low**: Nice-to-have enhancements

---

## Backlog Items

| ID | Title | Description | Assigned To | Priority | Category |
|----|-------|-------------|-------------|----------|----------|
| B001 | Implement Business Events Feature | Complete the Business Events management UI currently showing "Coming Soon". Include CRUD operations for Catalogs with detail views similar to Custom APIs. | Dallas | High | Feature |
| B002 | Add Unit Test Framework | Set up a testing framework (Vitest/Jest) and create initial test suites for critical paths: service layer, diff utilities, validation logic, and Zustand store actions. | Lambert | High | Testing |
| B003 | Add Integration Tests for TanStack Query Hooks | Test query invalidation, cache updates, optimistic updates, and error handling for all entity hooks (CustomApis, RequestParameters, ResponseProperties, Catalogs). | Lambert | High | Testing |
| B004 | Add Request URL Preview in API Tester | Complete TODO in CustomApiTester.tsx line 148 - construct and display the full request URL in the preview panel, not just parameters. | Dallas | High | Enhancement |
| B005 | Validate Connection State in useSolutions | Implement proper connection validation (TODO in useSolutions.ts line 21) before executing queries to prevent errors with invalid connections. | Kane | Medium | Bug Fix |
| B006 | Add Image Support to GenericTagPicker | Complete TODO in GenericTagPicker.tsx line 7 - enable rendering images alongside text in dropdown options (Publisher logos, entity icons). | Dallas | Medium | Enhancement |
| B007 | Add Error Boundaries for Components | Wrap major feature components (CustomApiDetails, RequestParameterDetails, ResponsePropertyDetails) with React error boundaries to gracefully handle runtime errors. | Dallas | High | Quality |
| B008 | Standardize Loading States | Ensure all data-fetching components show consistent loading spinners with proper positioning and messaging across the app. | Dallas | Medium | UX |
| B009 | Add Field-Level Validation | Expand ValidationStatus interface to support field-level validation messages (not just form-level) for better UX in create/edit forms. | Kane | Medium | Enhancement |
| B010 | Implement Optimistic Updates | Add optimistic updates to mutations (create/update/delete) for smoother UX - update UI immediately before server confirmation. | Kane | Medium | UX |
| B011 | Add Retry Logic for Failed Mutations | Implement automatic retry with exponential backoff for transient Dataverse API failures in all mutation hooks. | Kane | Medium | Reliability |
| B012 | Add Bulk Operations for Request Parameters | Allow users to create/delete multiple request parameters at once, useful when defining complex APIs. | Dallas | Low | Feature |
| B013 | Add Bulk Operations for Response Properties | Allow users to create/delete multiple response properties at once, useful when defining complex APIs. | Dallas | Low | Feature |
| B014 | Add Custom API Template Library | Create a library of common Custom API patterns (CRUD operations, batch processing, notifications) that users can clone and customize. | Dallas | Low | Feature |
| B015 | Add Request/Response Schema Import | Allow importing OpenAPI/Swagger definitions to auto-generate request parameters and response properties. | Kane | Low | Feature |
| B016 | Enhance Error Messages | Provide more specific, actionable error messages when Dataverse operations fail (e.g., permission errors, constraint violations). | Kane | Medium | UX |
| B017 | Add Undo/Redo for Edit Operations | Implement undo/redo functionality for form edits before saving, enhancing user confidence when making changes. | Dallas | Low | UX |
| B018 | Add Keyboard Shortcuts | Implement keyboard shortcuts for common actions (Ctrl+S to save, Ctrl+N for new, Esc to cancel) for power users. | Dallas | Low | UX |
| B019 | Add Export/Import for Custom APIs | Allow exporting Custom API definitions (with parameters/properties) as JSON for backup or transfer between environments. | Kane | Medium | Feature |
| B020 | Add Search/Filter in Custom API List | Implement search by name/unique name and filter by binding type, function vs action, managed state in CustomApiList component. | Dallas | Medium | UX |
| B021 | Add Request Parameter Reordering | Allow drag-and-drop reordering of request parameters (updates logicalname or ordinal field) for better organization. | Dallas | Low | Enhancement |
| B022 | Add Response Property Reordering | Allow drag-and-drop reordering of response properties for better organization. | Dallas | Low | Enhancement |
| B023 | Add Field-Level Locking UI | Visually indicate which fields are locked/read-only in edit mode (not just in headers) to improve clarity. | Dallas | Low | UX |
| B024 | Add Validation Tests | Create comprehensive test suite for validation logic covering edge cases: special characters, length limits, naming conventions. | Lambert | High | Testing |
| B025 | Add Component Tests for Forms | Test form components (Create/Edit/Read views) to ensure proper state management, validation, and user interactions. | Lambert | Medium | Testing |
| B026 | Add E2E Tests for Critical Paths | Implement end-to-end tests for core user journeys: create Custom API, add parameters, test execution, delete API. | Lambert | Medium | Testing |
| B027 | Add Diff Utility Tests | Test buildCreatePayload and buildUpdatePayload edge cases: null values, lookup binding, empty strings, nested objects. | Lambert | High | Testing |
| B028 | Implement API Request History | Store recent API test executions in local storage for quick re-execution and debugging. | Kane | Low | Feature |
| B029 | Add Response Time Metrics | Display execution time and response size in API Tester results for performance analysis. | Dallas | Low | Feature |
| B030 | Add Request/Response Comparison | Allow users to compare multiple test executions side-by-side to spot differences. | Dallas | Low | Feature |
| B031 | Cleanup Commented Code | Remove commented-out code in App.tsx, models, and other files identified during architecture review. | Kane | Low | Maintenance |
| B032 | Split Large Styles File | Refactor single Styles.ts into component-specific style modules or use CSS Modules for better maintainability. | Dallas | Low | Maintenance |
| B033 | Add Connection Status Indicator | Show real-time connection status in the header (connected/disconnected/reconnecting) with visual indicator. | Dallas | Medium | UX |
| B034 | Add Privilege-Based UI Filtering | Hide/disable operations (edit, delete, create) based on user privileges fetched from Dataverse. | Kane | Medium | Security |
| B035 | Add Audit Trail Display | Show created/modified dates and users for Custom APIs (createdby, modifiedby fields) in detail view. | Dallas | Low | Feature |
| B036 | Add Solution Dependency Viewer | Display solution dependencies for Custom APIs to prevent accidental deletion of required components. | Kane | Low | Feature |
| B037 | Add Monaco Editor for PowerFx | Replace plain textarea with Monaco Editor for PowerFx expressions with syntax highlighting. | Dallas | Low | UX |
| B038 | Add FetchXML Validation | Validate FetchXML queries in service layer before execution to provide better error messages. | Kane | Medium | Quality |
| B039 | Add Query Performance Logging | Log slow queries (>1s) to EventLog to help identify performance bottlenecks. | Kane | Low | Performance |
| B040 | Add Pagination for Large Lists | Implement virtual scrolling or pagination for Custom API lists with 100+ items. | Dallas | Medium | Performance |
| B041 | Optimize TanStack Query Keys | Review and optimize query key structure to minimize unnecessary cache invalidations. | Kane | Low | Performance |
| B042 | Add Stale Data Indicators | Show visual indicators when cached data may be stale (e.g., connection changed but cache not invalidated). | Dallas | Low | UX |
| B043 | Add Offline Mode Support | Cache data in IndexedDB for offline viewing and queue mutations for execution when connection restored. | Kane | Low | Feature |
| B044 | Add Dark Mode Refinements | Review all components for dark mode readability and contrast issues, especially badges and icons. | Dallas | Low | UX |
| B045 | Add Accessibility Audit | Run accessibility audit and fix ARIA labels, keyboard navigation, screen reader support across all components. | Lambert | Medium | Accessibility |
| B046 | Add Custom API Cloning | Allow users to clone an existing Custom API with all parameters/properties for quick variation creation. | Dallas | Medium | Feature |
| B047 | Add Parameter/Property Templates | Save commonly-used parameter/property configurations as templates for reuse. | Dallas | Low | Feature |
| B048 | Add Catalog Detail Views | Create full CRUD UI for Catalogs (similar to Custom API details) once Business Events feature is prioritized. | Dallas | High | Feature |
| B049 | Add Catalog Navigation | Implement navigation between parent and child catalogs in the Catalog hierarchy. | Dallas | Medium | Feature |
| B050 | Add Type-Specific Input Validation | Add client-side validation for parameter inputs based on type (Integer range, String max length, DateTime format). | Dallas | Medium | Quality |

---

## Categories Summary

- **Feature**: 17 items - New functionality to be built
- **Testing**: 7 items - Test coverage improvements
- **Enhancement**: 5 items - Improvements to existing features
- **UX**: 15 items - User experience improvements
- **Quality**: 4 items - Code quality and reliability
- **Maintenance**: 2 items - Code cleanup and refactoring
- **Bug Fix**: 1 item - Known bugs to fix
- **Reliability**: 1 item - System reliability improvements
- **Security**: 1 item - Security enhancements
- **Performance**: 4 items - Performance optimizations
- **Accessibility**: 1 item - Accessibility improvements

---

## Notes

### Immediate Focus Areas
1. **Testing Infrastructure** (B002, B003) - Critical foundation missing
2. **Business Events** (B001, B048) - Major feature gap
3. **Error Handling** (B007, B011, B016) - Improve resilience
4. **Connection Validation** (B005, B033) - Prevent invalid states

### Technical Debt
- No test framework configured
- Single monolithic styles file
- Commented-out code in multiple files
- TODO comments indicate incomplete implementations

### User Experience Priorities
- Loading states consistency (B008)
- Search/filter capabilities (B020)
- Keyboard shortcuts (B018)
- Error boundaries (B007)

### Known Limitations
- Business Events UI is stubbed out ("Coming Soon" message)
- GenericTagPicker doesn't support images (architecture prepared but not implemented)
- API Tester URL preview is incomplete
- No undo/redo for forms
