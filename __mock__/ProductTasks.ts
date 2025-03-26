import { product, task } from "@/constants/defaultSession";
import defaultUserPreferences from "@/constants/userPreferences";

export const fakeProduct = {
    id: "1",
    product_name: "Sample Product",
    description: "This is a sample product.",
    inventory_id: "1",
    vendor_id: "1",
    auto_replenish: false,
    min_quantity: 10,
    max_quantity: 100,
    current_quantity: 50,
    quantity_unit: "pcs",
    current_quantity_status: "half",
    barcode: "1234567890123",
    qr_code: "sample_qr_code", 
    last_scanned: new Date().toISOString(),
    scan_history: {},
    expiration_date: new Date().toISOString(),
    updated_dt: new Date().toISOString(),
    draft_status: "draft",
    is_template: false,
    product_category: "general",
    icon_name: "sample_icon",
    tasks: []
} as product;

export const fakeTask = {
    id: "1",
    task_name: "Sample Task",
    description: "This is a sample task.",
    user_id: "1",
    product_id: "1",
    due_date: new Date("2025-03-28").toISOString(),
    completion_status: "overdue",
    recurrence_interval: "none",
    recurrence_end_date: new Date("2025-12-31").toISOString(),
    is_automated: false,
    automation_trigger: "none",
    created_by: "1",
    created_dt: new Date().toISOString(),
    updated_dt: new Date().toISOString(),
    last_updated_by: "1",
    draft_status: "draft",
    is_template: false,
    assigned_to: {
        user_id: "1",
        email: "user@example.com",
        phone_number: "1234567890",
        name: "John Doe",
        first_name: "John",
        last_name: "Doe",
        preferences: defaultUserPreferences,
        postalcode: "12345",
        city: "Sample City",
        state: "Sample State",
        country: "USA",
        draft_status: "draft",
        created_at: new Date().toISOString(),
        app_metadata: {
            avatar_url: "https://example.com/avatar.png",
            is_super_admin: false,
            sso_user: false,
            provider: null,
            setup: {
                email: true,
                authenticationMethod: true,
                account: true,
                details: true,
                preferences: true,
                confirmation: true
            },
            authMetaData: {}
        }
    }
} as task;
