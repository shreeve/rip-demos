/**
 * Medical Tests Data
 * ------------------
 * Test catalog with pricing information
 */

export const medicalTests = [
    { 
        id: 1, 
        code: 'CBC', 
        name: 'Complete Blood Count', 
        retail: 45.00, 
        discount: 29.00,
        category: 'hematology'
    },
    { 
        id: 2, 
        code: 'CMP', 
        name: 'Comprehensive Metabolic Panel', 
        retail: 55.00, 
        discount: 39.00,
        category: 'chemistry'
    },
    { 
        id: 3, 
        code: 'TSH', 
        name: 'Thyroid Stimulating Hormone', 
        retail: 60.00, 
        discount: 42.00,
        category: 'endocrine'
    },
    { 
        id: 4, 
        code: 'LIPID', 
        name: 'Lipid Panel', 
        retail: 50.00, 
        discount: 35.00,
        category: 'chemistry'
    },
    { 
        id: 5, 
        code: 'A1C', 
        name: 'Hemoglobin A1c', 
        retail: 48.00, 
        discount: 32.00,
        category: 'chemistry'
    },
    { 
        id: 6, 
        code: 'VITD', 
        name: 'Vitamin D, 25-Hydroxy', 
        retail: 85.00, 
        discount: 59.00,
        category: 'nutrition'
    },
    { 
        id: 7, 
        code: 'UA', 
        name: 'Urinalysis, Complete', 
        retail: 30.00, 
        discount: 19.00,
        category: 'urinalysis'
    },
    { 
        id: 8, 
        code: 'FER', 
        name: 'Ferritin', 
        retail: 40.00, 
        discount: 28.00,
        category: 'hematology'
    },
    { 
        id: 9, 
        code: 'B12', 
        name: 'Vitamin B12', 
        retail: 55.00, 
        discount: 38.00,
        category: 'nutrition'
    },
    { 
        id: 10, 
        code: 'TEST', 
        name: 'Testosterone, Total', 
        retail: 90.00, 
        discount: 65.00,
        category: 'endocrine'
    },
    { 
        id: 11, 
        code: 'CRP', 
        name: 'C-Reactive Protein', 
        retail: 45.00, 
        discount: 30.00,
        category: 'immunology'
    },
    { 
        id: 12, 
        code: 'MG', 
        name: 'Magnesium', 
        retail: 35.00, 
        discount: 22.00,
        category: 'chemistry'
    }
];

/**
 * Get test by ID
 */
export function getTestById(id) {
    return medicalTests.find(test => test.id === id);
}

/**
 * Filter tests by search term
 */
export function searchTests(term) {
    const searchLower = term.toLowerCase();
    return medicalTests.filter(test => 
        test.name.toLowerCase().includes(searchLower) ||
        test.code.toLowerCase().includes(searchLower)
    );
}

/**
 * Get tests by category
 */
export function getTestsByCategory(category) {
    return medicalTests.filter(test => test.category === category);
}

/**
 * Calculate totals for selected tests
 */
export function calculateTotals(selectedIds) {
    return medicalTests.reduce((acc, test) => {
        if (selectedIds.has(test.id)) {
            acc.count++;
            acc.retail += test.retail;
            acc.discount += test.discount;
        }
        return acc;
    }, { count: 0, retail: 0, discount: 0 });
}
