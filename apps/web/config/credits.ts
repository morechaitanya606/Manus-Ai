export type CreditPackage = {
    id: string;
    title: string;
    credits: number;
    price: number;
    popular?: boolean;
};

export const CREDIT_PACKAGES: CreditPackage[] = [
    {
        id: 'pkg_small',
        title: 'Starter Pack',
        credits: 50,
        price: 99,
    },
    {
        id: 'pkg_medium',
        title: 'Creator Pack',
        credits: 250,
        price: 399,
        popular: true,
    },
    {
        id: 'pkg_large',
        title: 'Pro Pack',
        credits: 1000,
        price: 999,
    },
];

export function getCreditPackage(id: string): CreditPackage | undefined {
    return CREDIT_PACKAGES.find(pkg => pkg.id === id);
}
