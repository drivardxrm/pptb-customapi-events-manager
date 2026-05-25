# Managed State Filter Pattern

## Overview
A reusable UI pattern for filtering entities by managed/unmanaged state using ManagedStateToggle and badge-based collapsed summary display.

## Pattern Components

### 1. State Setup
```typescript
const [showEntityType, setShowEntityType] = useState<ManagedStateFilter>('all')
```

### 2. Filter Logic
```typescript
const filteredEntities = entitiesQuery.entities?.filter(e =>
  showEntityType === 'all' ||
  (e.ismanaged && showEntityType === 'managed') ||
  (!e.ismanaged && showEntityType === 'unmanaged')
) ?? []
```

### 3. Active Filter Count Accumulation
Add to existing counter:
```typescript
const activeFilterCount = 
  (selectedItemId ? 1 : 0) +
  (showSolution !== 'all' ? 1 : 0) +
  (showEntityType !== 'all' ? 1 : 0)  // ← Add for each new filter
```

### 4. Badge Summary Generation (Collapsed State)
Pattern for building `filterSummary` array:
```typescript
const filterSummary = useMemo(() => {
  const parts: React.ReactElement[] = []
  
  // Solution badge (if applicable)
  if (selectedSolutionId) {
    const solution = solutionsQuery.solutions?.find(s => s.solutionid === selectedSolutionId)
    if (solution) {
      parts.push(
        <Badge key="solution" appearance="outline" size="small">
          {solution.ismanaged ? <LockClosedRegular /> : <LockOpenRegular />} 
          {solution.friendlyname}
        </Badge>
      )
    }
  }
  
  // Managed state filter badge for entity type
  if (showEntityType !== 'all') {
    parts.push(
      <Badge key="entitytype-managed" appearance="outline" size="small">
        {showEntityType === 'managed' ? <LockClosedRegular /> : <LockOpenRegular />} 
        {showEntityType === 'managed' ? 'Managed' : 'Unmanaged'} [EntityTypePlural]
      </Badge>
    )
  }
  
  return parts
}, [selectedSolutionId, showEntityType, solutionsQuery.solutions])
```

### 5. Conditional Rendering (Collapsed Summary)
```typescript
{!filtersExpanded && filterSummary.length > 0 && (
  <div className={styles.badgeContainer}>
    {filterSummary}
  </div>
)}
```

### 6. Filter Subsection in Expanded State
```typescript
<div className={styles.filterSubsection}>
  <Field label={
    <div className={styles.fieldLabelWithToggle}>
      <span className={styles.semiBoldLabel}>[Entity Type Name] Filters</span>
    </div>
  }>
    <ManagedStateToggle 
      value={showEntityType} 
      onChange={setShowEntityType} 
    />
  </Field>
</div>
```

## Integration Points

### In Picker Display
Filter items source from filtered array:
```typescript
items={filteredEntities
  .map(e => ({
    id: e.entityid,
    displayText: `${e.name} (${e.uniquename})`,
    image: e.ismanaged ? <LockClosedRegular /> : <LockOpenRegular />
  } as SelectableItem))
  .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}
```

### Empty State Messaging
```typescript
{filteredEntities.length === 0 && (
  <Text className={styles.hintTextItalic}>No [EntityTypePlural] match your filters.</Text>
)}
```

## Icon Usage
- **Managed Icon:** `LockClosedRegular` (unselected), `LockClosedFilled` (selected in toggle)
- **Unmanaged Icon:** `LockOpenRegular` (unselected), `LockOpenFilled` (selected in toggle)
- **Toggle Circular:** Use `shape="circular"` for consistent appearance
- **Badge:** Use non-filled icons that match toggle state

## Styling Conventions
- **Toggle Group Wrapper:** `className={styles.toggleGroup}`
- **Badge Container:** `className={styles.badgeContainer}`
- **Filter Subsection:** `className={styles.filterSubsection}`
- **Field Label with Toggle:** `className={styles.fieldLabelWithToggle}`
- **Hint Text:** `className={styles.hintTextItalic}` for empty state messages

## Testing Checklist
- [ ] Default state is `'all'`
- [ ] Toggle buttons show primary appearance when selected
- [ ] Filter updates picker items immediately
- [ ] Active filter count increments correctly
- [ ] Badge displays when filter active and section collapsed
- [ ] Badge disappears when filter reset to `'all'`
- [ ] Empty state message displays when no items match
- [ ] Empty state message hides when filter cleared
- [ ] No console errors on rapid filter changes
- [ ] Filter state preserved when expanding/collapsing section

## Real-World Examples
- **CatalogSelector:** `showCatalogs` filter for root catalogs
- **CustomApiSelector:** `showCustomApis` filter for custom APIs (with additional PowerFx and BusinessEvent filters)

## Notes
- ManagedStateFilter type: `'all' | 'unmanaged' | 'managed'`
- Always use `useMemo` for filterSummary to prevent unnecessary re-renders
- Badge appearance should be `"outline"` (not filled) to distinguish from feature-specific badges like PowerFx
- Order matters in badge array: Solution first, then entity type filters, then feature filters (PowerFx, BusinessEvent)
