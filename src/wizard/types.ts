/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SiteType =
  | 'landing'
  | 'mini'
  | 'vetrina'
  | 'pro'
  | 'portfolio'
  | 'blog'
  | 'vetrina-blog'
  | 'ecommerce';

export type DesignApproach = 'template' | 'code' | 'figma';

export type CmsChoice = 'markdown' | 'decap' | 'sanity';

export type SeoLevel = 'none' | 'base' | 'avanzato';

export type MigrationType = 'none' | 'contenuti' | 'wordpress' | 'hosting';

export type MaintenancePackage = 'none' | 'base' | 'standard' | 'pro';

export type DiscountId = 'ricorrente' | 'noprofit' | 'anticipato';

export interface WizardState {
  // Step 1
  siteType: SiteType | null;

  // Step 2
  designApproach: DesignApproach | null;
  logo: boolean;
  brandIdentity: boolean;

  // Step 3 — extras multi-select
  extras: string[];

  // Step 4
  cms: CmsChoice | null;
  multilingua: boolean;
  extraLanguages: number;

  // Step 5
  seo: SeoLevel;
  schemaAdvanced: boolean;
  analytics: boolean;

  // Step 6
  hostingSetup: boolean;
  dnsSetup: boolean;
  emailSetup: boolean;
  migration: MigrationType;

  // Step 7
  maintenance: MaintenancePackage;
  maintenanceMonths: number;

  // Step 8
  discounts: DiscountId[];
}

export const initialState: WizardState = {
  siteType: null,
  designApproach: null,
  logo: false,
  brandIdentity: false,
  extras: [],
  cms: null,
  multilingua: false,
  extraLanguages: 1,
  seo: 'none',
  schemaAdvanced: false,
  analytics: false,
  hostingSetup: false,
  dnsSetup: false,
  emailSetup: false,
  migration: 'none',
  maintenance: 'none',
  maintenanceMonths: 3,
  discounts: []
};
