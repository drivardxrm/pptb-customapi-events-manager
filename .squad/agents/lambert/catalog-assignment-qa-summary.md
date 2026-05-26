# 🧪 Lambert QA Review — Catalog Assignment Fix

## My Assessment

I've reviewed the polymorphic object binding bug in the catalog assignment create flow. Here's what I found:

### The Risk
The `createCatalogAssignment()` method binds the polymorphic `_object_value` field to Dataverse using the wrong collection name, or possibly not at all. This means:
- Custom API assignments might create with `workflow` collection name
- Workflow assignments might not have `objectidtype` properly set
- Silent failures that corrupt data integrity

### What I Built (36 Test Cases)
A comprehensive regression checklist covering:
1. **Custom API assignments** — Verify payload, OData binding format, objectidtype auto-population, solution context
2. **Workflow assignments** — Verify type dropdown behavior, correct collection name, persistence across saves
3. **Entity assignments** — Verify table assignment works, logical name displays correctly
4. **Binding validation** — Verify collection name mapping exact (customapis, workflows, entities), no silent fallbacks
5. **Failure modes** — Verify GUID validation, type mismatch detection, graceful error handling
6. **Metadata retrieval** — Verify OData annotations return correctly for UI rendering (getObjectType helpers)
7. **Payload structure** — Verify _object_value excluded from payload, Object@odata.bind present with correct format
8. **UI state** — Verify modal resets correctly, object picker clears on type changes, no stale selections

### Key Assumptions I'm Flagging for Kane
**Critical things to verify:**
1. **Exact collection names** — 'customapis', 'workflows', 'entities' (no typos, no fallback guessing)
2. **Binding field name** — Must be `Object@odata.bind` (not `_object_value@odata.bind`)
3. **Dataverse auto-sets objectidtype** — If this assumption is wrong, fix must set it explicitly
4. **Modal validates GUID** — Service trusts modal validation; doesn't re-validate empty _object_value
5. **Solution assignment optional** — Missing solutionUniqueName is OK; record still creates
6. **Unknown entity types** — Current fallback to `${name}s` could mask errors; recommend throwing exception instead

### Risk Areas I'm Watching
- **Type ↔ GUID mismatch**: If user selects "Custom API" but then picks a Workflow GUID, binding succeeds but data is corrupted. This needs end-to-end validation.
- **Orphaned assignments**: If solution add fails, record still exists but orphaned from solution. Consider rollback pattern.
- **Silent failures**: Collection name typos won't error; Dataverse just rejects the binding. Test payload in DevTools before submission.

### Next Steps
✅ Regression checklist is locked and ready.  
🧪 **For Kane:** Implement the fix, verify the 8 assumptions above.  
👀 **For David:** Once Kane is done, I'll manually execute all 36 test cases to sign off.

---
**QA Status:** Ready for implementation.  
**Test Data Needed:** Custom API (unmanaged), Workflow, Entity, Catalog, Solution records (pre-created in test environment).  
**Est. Manual QA Time:** ~30 min for full regression suite.
