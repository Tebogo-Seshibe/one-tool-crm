type CachedAuth = {
    tenant: string
    token: string
    user: string
}

type ValidationError = {
    message: string
    errors: Record<string, string[]>
}

type ApiRequest<T> = {
    method: 'GET' | 'POST'
    url: string
    body?: T
}

type ApiResponseSuccess<T> = {
    success: true
    data: T | undefined
}
type ApiResponseFailure = {
    success: false
    data: ValidationError | undefined
}
type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseFailure;



type AuthRequest = {
    email: string
    password: string
}
type AuthResponse = {
    api_token: string
    tenant_identifier: string
}



type Contact = {
 id: number
 bNR: string
 account_of_proceeds: number
 vatin: string
 firma: string
 mail: string
 mail2: string
 titel: string
 title_after: string
 sex: string
 name: string
 vorname: string
 strasse: string
 plz: string
 ort: string
 federal_state: string
 land: number
 branche: number
 telefon: string
 handy: string
 fax: string
 web: string
 skype: string
 twitter: string
 facebook: string
 job: string
 del: boolean
 updated: string
 geburtsdatum: string
 salutation_type: number
 sms_nl: boolean
 mail_nl: boolean
 mail_nl_ip: string
 mail_nl_date: string
 bounced: boolean
 isfirma: boolean
 iban: string
 bic: string
 bill_to_post: number
 bill_to_email: number
 salutation: string
 longitude: number
 latitude: number
 is_geocoded: boolean
 maincontact: number
 mail_account_id: number
 mail_account_directory: string
 user: number
 creation_date: string
 last_contact_time: string
 reminder: string
 has_kss: boolean
 kss_password: string
 kss_hash: string
 username: string
 hash_password: string
 ip_adress: string
 salt: string
 forgotten_password_code: string
 forgotten_password_timestamp: string
 remember_code: string
 last_login: string
 invoice_name: string
 invoice_strasse: string
 invoice_plz: string
 invoice_ort: string
 invoice_land: string
 invoice_mail: string
 department: string
 favorite: boolean
 has_image: boolean
 view: number
 note: string
 kss_task_type: number
 bonus: number
 kss_policy: boolean
 payment_type: string
 payment_deadline: number
 active: boolean
 deviant_invoice_address: boolean
 stripe_user_id: number
 external_identifier: string
 incoterm_id: number
 language_id: number
 company_description: string
 company_description_title: string
 invoice_company: string
 invoice_first_name: string
 invoice_sex: string
 country_state_id: number
 invoice_country_state_id: number
 district: number
 organisation_type: number
 acronym: string
 budget: number
 order_code: string
 order_code_required: boolean
 ims: string
 skonto: number
 skonto_payment_deadline: number
 cost_unit_id: number
 location_id: number
 kostenstelle_id: number
 pay_on_bill: boolean
 is_payment_in_advance: boolean
 sales_responsible_user: number
 is_weg: boolean
 override_contact_adresses_for_child_contacts: boolean
 external_customernumber: string
 approval_user: number
 destructed_products: string
 api_token: string
 lead_stage_id: number
 contactGroups: number
}

declare const chrome: ChromeExtensionAPI;

type ChromeExtensionRuntimeAPI = {
    getURL: (path: string) => string
}

type ChromeExtensionStorageAreaAPI = {
    get: () => Promise<any>
    set: (data: any) => Promise<any>
    remove: (key?: string) => Promise<void>
}

type ChromeExtensionStorageAPI = {
    local: ChromeExtensionStorageAreaAPI
    managed: ChromeExtensionStorageAreaAPI
    sync: boolean
}
 
type ChromeExtensionAPI = {
    runtime: ChromeExtensionRuntimeAPI
    storage: ChromeExtensionStorageAPI
}
