// Test scenarios for resolveCatalogPath

type Catalog = {
  catalogid: string;
  _parentcatalogid_value: string;
  name: string;
};

const resolveCatalogPath = (
  catalogId: string,
  catalogsById: Map<string, Catalog>,
) => {
  const category = catalogsById.get(catalogId) ?? null;

  if (!category) {
    return {
      category: null,
      rootCatalog: null,
    };
  }

  let rootCatalog = category;
  let currentCatalog = category;
  const visitedCatalogIds = new Set<string>([category.catalogid]);

  while (currentCatalog._parentcatalogid_value) {
    const parentCatalog = catalogsById.get(currentCatalog._parentcatalogid_value);
    if (!parentCatalog || visitedCatalogIds.has(parentCatalog.catalogid)) {
      break;
    }

    rootCatalog = parentCatalog;
    currentCatalog = parentCatalog;
    visitedCatalogIds.add(parentCatalog.catalogid);
  }

  return {
    category,
    rootCatalog,
  };
};

// Test scenarios
console.log('=== Test 1: Single root catalog (no parent) ===');
const root1: Catalog = { catalogid: 'root1', _parentcatalogid_value: '', name: 'Root1' };
const map1 = new Map([[root1.catalogid, root1]]);
const result1 = resolveCatalogPath('root1', map1);
console.log('Input: Root with no parent');
console.log('Expected: category=Root1, rootCatalog=Root1');
console.log('Actual:', result1.category?.name, result1.rootCatalog?.name);
console.log('Match:', result1.category?.catalogid === result1.rootCatalog?.catalogid);

console.log('\n=== Test 2: Two-level hierarchy (Root -> Category) ===');
const root2: Catalog = { catalogid: 'root2', _parentcatalogid_value: '', name: 'Root2' };
const cat2: Catalog = { catalogid: 'cat2', _parentcatalogid_value: 'root2', name: 'Category2' };
const map2 = new Map([[root2.catalogid, root2], [cat2.catalogid, cat2]]);
const result2 = resolveCatalogPath('cat2', map2);
console.log('Input: Category with parent Root');
console.log('Expected: category=Category2, rootCatalog=Root2');
console.log('Actual:', result2.category?.name, result2.rootCatalog?.name);
console.log('Correct:', result2.category?.name === 'Category2' && result2.rootCatalog?.name === 'Root2');

console.log('\n=== Test 3: Three-level hierarchy (Root -> Cat1 -> Cat2) ===');
const root3: Catalog = { catalogid: 'root3', _parentcatalogid_value: '', name: 'Root3' };
const cat3a: Catalog = { catalogid: 'cat3a', _parentcatalogid_value: 'root3', name: 'Category3A' };
const cat3b: Catalog = { catalogid: 'cat3b', _parentcatalogid_value: 'cat3a', name: 'Category3B' };
const map3 = new Map([[root3.catalogid, root3], [cat3a.catalogid, cat3a], [cat3b.catalogid, cat3b]]);
const result3 = resolveCatalogPath('cat3b', map3);
console.log('Input: Category3B -> Category3A -> Root3');
console.log('Expected: category=Category3B, rootCatalog=Root3');
console.log('Actual:', result3.category?.name, result3.rootCatalog?.name);
console.log('Correct:', result3.category?.name === 'Category3B' && result3.rootCatalog?.name === 'Root3');

console.log('\n=== Test 4: Catalog not found ===');
const map4 = new Map();
const result4 = resolveCatalogPath('missing', map4);
console.log('Input: Non-existent catalog ID');
console.log('Expected: category=null, rootCatalog=null');
console.log('Actual:', result4.category, result4.rootCatalog);
console.log('Correct:', result4.category === null && result4.rootCatalog === null);

console.log('\n=== Test 5: Circular reference protection ===');
const circular1: Catalog = { catalogid: 'circ1', _parentcatalogid_value: 'circ2', name: 'Circular1' };
const circular2: Catalog = { catalogid: 'circ2', _parentcatalogid_value: 'circ1', name: 'Circular2' };
const map5 = new Map([[circular1.catalogid, circular1], [circular2.catalogid, circular2]]);
const result5 = resolveCatalogPath('circ1', map5);
console.log('Input: Circular reference (circ1 -> circ2 -> circ1)');
console.log('Expected: Should detect and break, category=Circular1, rootCatalog=Circular2');
console.log('Actual:', result5.category?.name, result5.rootCatalog?.name);
console.log('No infinite loop:', true);

console.log('\n=== Test 6: Broken parent link (parent not in map) ===');
const orphan: Catalog = { catalogid: 'orphan', _parentcatalogid_value: 'missing-parent', name: 'Orphan' };
const map6 = new Map([[orphan.catalogid, orphan]]);
const result6 = resolveCatalogPath('orphan', map6);
console.log('Input: Catalog with parent ID that does not exist');
console.log('Expected: category=Orphan, rootCatalog=Orphan (stops at first catalog)');
console.log('Actual:', result6.category?.name, result6.rootCatalog?.name);
console.log('Correct:', result6.category?.name === 'Orphan' && result6.rootCatalog?.name === 'Orphan');
