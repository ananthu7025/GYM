// enums/commonEnum.js

const Status = {
  ACTIVE: 0,
  INACTIVE: 1,
  UNDER_REVIEW: 2,
};

const GymStatus = {
  OPEN: 0,
  CLOSED: 1,
  UNDER_RENOVATION: 2,
};
const FrSubStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
  PENDING: 2,
  EXPIRED: 3,
};

const FrSubscriptionDuration = {
  MONTHLY: 1,   // 1 month
  THREE_MONTHS: 3,  // 3 months
  SIX_MONTHS: 6,    // 6 months
  TWELVE_MONTHS: 12, // 12 months (1 year)
};
// Exporting all enums
module.exports = {
  Status,
  FrSubStatus,
  FrSubscriptionDuration,
  GymStatus,
};
