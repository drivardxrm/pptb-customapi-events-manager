# Settings-Backed Modal Defaults

## When to use
- A create modal depends on app settings or other async defaults.
- The default value may arrive after the modal has already opened.
- The selected value affects both visible UX state and the payload sent to Dataverse.

## Pattern
1. Keep an authoritative value in the modal's form state.
2. Seed that form value on open from `settings default || persisted store value || ''`.
3. Use a `useRef` guard so late settings hydration applies **once per open** instead of overriding manual edits.
4. Mirror the chosen value to shared store only for convenience across future create flows.
5. Build the submitted payload from the form-owned value, including any required `@odata.bind` transformation.

## Example in this repo
- `src/components/BusinessEventDetails/CatalogModal.tsx` stores `_publisherid_value` in local create-form state.
- The modal initializes from `useAppSettings().appsettings?.defaultPublisherId`, but only once per open.
- Submit logic converts the publisher to `PublisherId@odata.bind` so Dataverse receives the correct lookup value.

## Why it helps
- Prevents UI state from drifting away from the actual submitted payload.
- Handles async settings hydration without reintroducing flicker or stomping user choices.
- Preserves collapsed/default-selected UX for create dialogs that open before data has fully loaded.

## Checklist
- [ ] Default is applied when the modal opens after settings already loaded.
- [ ] Default is still applied if settings finish loading after the modal opens.
- [ ] Manual picker changes are not overwritten by a later effect in the same open cycle.
- [ ] Submit payload is built from the form-owned value, not only from shared UI state.
