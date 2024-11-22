// @ts-check
/// <reference path="types.d.ts" />
/// <reference path="const.js" />

class OneToolCRMApi {
    
    /** @type {Record<string, string>} */
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }


    /**
     * @description Authenticate as a user by submitting valid credentials to the endpoint.
     * If the authentication was successful, an api_token is returned.
     * This api_token can be used to access other API endpoints.
     * @param {AuthRequest} user 
     * @returns {Promise<ApiResponse<AuthResponse>>}
     */
    async authUser(user) {
        return await this._call({
            method: 'POST',
            url: `${BASE_URL}/auth/user`,
            body: user
        });
    }

    /**
     * @description Shows a contact.
     * @param {Partial<Contact & {include: string, sort: keyof Contact}>} filters
     * @returns {Promise<ApiResponse<{data: Contact[]}>>}
     */
    async showContact(filters) {
        const queryParams = Object.keys(filters)
            .map(key => `filter[${key}]=${filters[key]}`)
            .join('&')

        return await this._call({
            method: 'GET',
            url:`${BASE_URL}/contacts?${queryParams}`
        });
    }
    
    /**
     * @description Creates a new contact.
     * @param {Partial<Contact>} contact
     * @returns {Promise<ApiResponse<{data: Contact}>>}
     */
    async createContact(contact) {
        return await this._call({
            method: 'POST',
            url:`${BASE_URL}/contacts`,
            body: contact
        });
    }


    /**
     * @function
     * @template TBody
     * @template TResult
     * @param {ApiRequest<TBody>} request 
     * @returns {Promise<ApiResponse<TResult>>}
     */
    async _call(request) {
        const returnValue = {
            success: false,
            data: undefined
        };

        try {
            const init = {
                method: request.method,
                headers: this.headers,
            }
            
            if (request.method !== 'GET') {
                init.body = JSON.stringify(request.body).trim();
            }

            const response = await fetch(encodeURI(request.url.trim()), init);
            
            returnValue.data = await response.json();
            
            if (response.ok) {
                returnValue.success = true;
            }
        } catch (e) {
            returnValue.data = e;
        } finally {
            return returnValue;
        }
    }
}
