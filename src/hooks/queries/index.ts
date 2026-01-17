/**
 * Query Hooks Barrel Export
 * 
 * This file exports all query hooks from a single location
 * for easier imports and better code organization.
 */

// Needy Persons
export { useNeedyList, useNeedyPerson, useCreateNeedyPerson, useUpdateNeedyPerson, useDeleteNeedyPerson } from './use-needy'

// Applications
export { useApplicationsList, useApplication, useCreateApplication, useUpdateApplication, useDeleteApplication } from './use-applications'

// Donations
export { useDonationStats, useDonationsList, useDonation, useCreateDonation, useUpdateDonation, useDeleteDonation } from './use-donations'

// Aids
export { useAidsList, useAid, useCreateAid, useUpdateAid, useDeleteAid } from './use-aids'

// Events
export { useEventsList, useEvent, useCreateEvent, useUpdateEvent, useDeleteEvent } from './use-events'

// Finance
export { useFinanceList, useFinanceStats, useCreateTransaction, useUpdateTransaction } from './use-finance'

// Volunteers
export { useVolunteersList, useVolunteer, useCreateVolunteer, useUpdateVolunteer, useDeleteVolunteer } from './use-volunteers'

// Orphans
export { useOrphansList, useOrphan, useCreateOrphan, useUpdateOrphan, useDeleteOrphan } from './use-orphans'

// Calendar
export { useCalendarEvents, useUpcomingEvents } from './use-calendar'

// Reports
export { useReportsList, useReportStats, useGenerateReport } from './use-reports'

// Users
export { useUsersList, useUser, useCreateUser, useUpdateUser, useDeleteUser } from './use-users'

// Messages
export { useMessagesList, useMessage, useCreateMessage, useMarkAsRead } from './use-messages'

// Purchases
export { usePurchasesList, usePurchase, useCreatePurchase, useUpdatePurchase, useDeletePurchase } from './use-purchase'

// Lookups
export { useCategories, useCities, useDistricts, useNeighborhoods } from './use-lookups'

// Generic hooks
export {
  useGenericQuery,
  useGenericMutation,
  useGenericPaginatedQuery,
  createQueryHook,
  createMutationHook,
} from './use-generic-query'
