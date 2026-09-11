// ──────────────────────────────────────────────────────────────────
// GET /profile/me – Full profile response
// ──────────────────────────────────────────────────────────────────

export interface ProfileResponse {
    profile: {
        image: string;
        name: string;
        email: string;
        rating: number;
        totalReviews: number;
        activeStatus: boolean;
        blockStatus: boolean;
        approvalStatus: string; // "approved" etc.
        language: string;
    };
    basicInformation: {
        storeId: string;
        vendor: {
            vendorName: string;
            vendorId: string;
        };
        tagLine: string;
        minimumOrderValue: number;
        createdDate: string;
        city: string;
        zoneId: string;
        description: string;
    };
    contactInformation: {
        email: string;
        phoneNumber: string;
        showContactOnStorePage: boolean;
    };
    settings: {
        pickupAllowed: boolean;
        deliveryAllowed: boolean;
        cardPaymentAllowed: boolean;
        codPaymentAllowed: boolean;
    };
    additionalNotes: string;
    kycDocuments: {
        businessLicenseFront: string;
        businessLicenseBack: string;
        nationalIdFront: string;
        nationalIdBack: string;
        registeredStoreDocs: string;
        taxIdCertificate: string;
    };
}

// ──────────────────────────────────────────────────────────────────
// GET /profile/me/availability
// ──────────────────────────────────────────────────────────────────

export interface AvailabilityResponse {
    store_id: string;
    store_available: boolean;
}

// PATCH /profile/me/availability
export type UpdateAvailabilityRequest = {
    storeAvailable: boolean;
};

export interface UpdateAvailabilityResponse {
    message: string;
    store_id: string;
}

// ──────────────────────────────────────────────────────────────────
// Work schedule types
// ──────────────────────────────────────────────────────────────────

export interface TimeSlot {
    open: string;
    close: string;
}

export interface DaySchedule {
    slots: TimeSlot[];
    is_active: boolean;
}

export type StoreTimings = {
    monday?: DaySchedule;
    tuesday?: DaySchedule;
    wednesday?: DaySchedule;
    thursday?: DaySchedule;
    friday?: DaySchedule;
    saturday?: DaySchedule;
    sunday?: DaySchedule;
};

export interface WorkScheduleResponse {
    store_timings: StoreTimings;
}

// PATCH /profile/me/work-schedule
// The request body expects a JSON string under "storeTimings"
export type UpdateWorkScheduleRequest = {
    storeTimings: string; // JSON string of StoreTimings
};

export interface UpdateWorkScheduleResponse {
    message: string;
    store_id: string;
}

// ──────────────────────────────────────────────────────────────────
// Language endpoints
// ──────────────────────────────────────────────────────────────────

export interface LanguageResponse {
    store_id: string;
    store_language: string;
}

export type UpdateLanguageRequest = {
    storeLanguage: string; // e.g. "en-US"
};

export interface UpdateLanguageResponse {
    message: string;
    store_id: string;
}

// ──────────────────────────────────────────────────────────────────
// Bank management endpoints
// ──────────────────────────────────────────────────────────────────

export interface BankManagementResponse {
    bank_name: string;
    account_holder_name: string;
    account_number: string;
    branch_code: string;
}

export type UpdateBankManagementRequest = {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    branchCode: string;
};

export interface UpdateBankManagementResponse {
    message: string;
    store_id: string;
}

// ──────────────────────────────────────────────────────────────────
// Profile contact/basic info update
// ──────────────────────────────────────────────────────────────────

export type UpdateProfileInfoRequest = {
    city?: string;
    phoneNumber?: string;
};

export interface UpdateProfileInfoResponse {
    message: string;
    store_id: string;
}
