// Mock Supabase Client for Offline/Demo Mode
// This allows the app to function fully without a valid backend connection
// by relying on the LocalStorage persistence layer implemented in the hooks.

const createMockChain = () => {
    // This chain mimics the Supabase Query Builder interface
    const chain: any = {
        select: () => chain,
        eq: () => chain,
        single: async () => ({ data: null, error: null }), // Return null to fallback to LocalStorage
        maybeSingle: async () => ({ data: null, error: null }),
        order: () => chain,
        limit: () => chain,
        insert: async () => ({ data: null, error: null }),
        update: () => chain,
        delete: () => chain,
        // Allow the chain to be awaited directly (like a Promise)
        then: (resolve: any) => resolve({ data: null, error: null })
    };
    return chain;
};

export const supabase = {
    from: (table: string) => createMockChain(),
    auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
        signUp: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
        signOut: async () => ({ error: null }),
    }
};

// Console log to confirm we are in mock mode
console.log('Supabase Mock Client initialized. App running in offline/demo mode.');
