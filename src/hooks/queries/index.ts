/**
 * Query Hooks Barrel Export
 *
 * This file exports all query hooks from a single location
 * for easier imports and better code organization.
 */

// Needy Persons
export {
  useNeedyList,
  useNeedyDetail,
  useCreateNeedy,
  useUpdateNeedy,
  useDeleteNeedy,
} from "./use-needy";

// Applications
export {
  useApplicationsList,
  useApplicationDetail,
  useCreateApplication,
  useUpdateApplication,
} from "./use-applications";

// Donations
export {
  useDonationsList,
  useDonationDetail,
  useCreateDonation,
  useUpdateDonation,
  useDonationStats,
} from "./use-donations";

// Aids
export {
  useAidsList,
  useAidDetail,
  useCreateAid,
  useUpdateAid,
} from "./use-aids";

// Events
export {
  useEventsList,
  useEventDetail,
  useCreateEvent,
  useUpdateEvent,
} from "./use-events";

// Finance
export {
  useFinanceTransactions,
  useFinanceSummary,
  useCashTransactions,
  useBankTransactions,
} from "./use-finance";

// Volunteers
export {
  useVolunteersList,
  useVolunteerDetail,
  useCreateVolunteer,
  useUpdateVolunteer,
  useMissionsList,
  useCreateMission,
  useUpdateMission,
} from "./use-volunteers";

// Orphans
export {
  useOrphansList,
  useOrphanDetail,
  useCreateOrphan,
  useUpdateOrphan,
} from "./use-orphans";

// Calendar
export {
  useCalendarEvents,
  useEventsList as useUpcomingEvents,
} from "./use-calendar";

// Reports
export {
  useReportSummary,
  useAidsByTypeReport,
  useDonationsByTypeReport,
  useMonthlyTrendReport,
} from "./use-reports";

// Users
export {
  useUsersList,
  useUserDetail,
  useCreateUser,
  useUpdateUser,
} from "./use-users";

// Messages
export { useSMSList, useSendBulkSMS, useSendBulkEmail } from "./use-messages";

// Purchases
export {
  usePurchaseRequestsList,
  useCreatePurchaseRequest,
  useUpdatePurchaseRequest,
  useMerchantsList,
  useCreateMerchant,
  useUpdateMerchant,
} from "./use-purchase";

// Lookups
export {
  useCountries,
  useCities,
  useDistricts,
  useCategories,
  usePartners,
} from "./use-lookups";

// Bank Accounts
export {
  useBankAccountsList,
  useCreateBankAccount,
  useUpdateBankAccount,
  useDeleteBankAccount,
} from "./use-bank-accounts";

// Linked Records
export {
  useLinkedRecords,
  useCreateLinkedRecord,
  useUpdateLinkedRecord,
  useDeleteLinkedRecord,
  useNeedyDependents,
  useNeedyReferences,
  useNeedyInterviews,
  useNeedyAidsReceived,
  useNeedyConsents,
  useNeedySocialCards,
} from "./use-linked-records";

// Dashboard Stats
export {
  useDashboardStats,
  useMonthlyDonationTrend,
  useApplicationTypeDistribution,
  useCityDistribution,
  useApplicationStatusDistribution,
} from "./use-dashboard-stats";

// Generic hooks
export {
  useGenericQuery,
  useGenericMutation,
  useGenericPaginatedQuery,
  createQueryHook,
  createMutationHook,
  useOptimisticMutation,
} from "./use-generic-query";
