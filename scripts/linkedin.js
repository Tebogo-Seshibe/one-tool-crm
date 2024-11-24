// @ts-check

/**
 * @function
 * @returns {void}
 */
function openContactInfoModal() {
    /** @type {HTMLButtonElement | null} */
    const contactInfoLink = document.querySelector('a[href*="/overlay/contact-info"]');
    contactInfoLink?.click();
    contactInfoLink?.blur();
}


/**
 * @function
 * @returns {void}
 */
function closeModal() {
    /** @type {HTMLButtonElement | null} */
    const closeModalButton = document.querySelector('button.artdeco-modal__dismiss');
    closeModalButton?.click();
}


/**
 * @function
 * @description Parses our the first and last name from the profile
 * @returns {{firstname: string, lastname: string} | null}
 */
function getProfileName() {
    const modalHeader = document.querySelector('h1#pv-contact-info');
    const fullname = modalHeader?.innerHTML ?? '';
    
    if (!fullname) {
        return null;
    }

    const linkedInLabel = document.querySelector('h3.pv-contact-info__header');
    const expectedFirstname = linkedInLabel?.innerHTML.replace('’s Profile', '').trim() ?? '';
    
    return {
        firstname: expectedFirstname,
        lastname: fullname.replace(expectedFirstname, '').trim()
    }
}

/**
 * @function
 * @description Parses the user's profile to their name
 * @returns {{firstNames: string, lastName:string}}
 * @deprecated
 */
function getUserNames() {
    let firstNames = ''
    let lastName = ''

    const notificationButtonLabel = document.getElementsByTagName('main')[0]
        ?.getElementsByClassName('artdeco-button')[0]
        ?.getAttribute('aria-label') ?? '';
    const fullName = document.getElementsByTagName('main')[0]
        ?.getElementsByTagName('a')[0]
        ?.getElementsByTagName('h1')[0]
        ?.innerHTML ?? '';

    if (notificationButtonLabel) {
        firstNames = notificationButtonLabel
            .replace('Notify me about all of ', '')
            .replace('’s posts', '')
            .replace('Message ', '')
            .trim()
            ?? '';
        lastName = fullName.replace(firstNames, '').trim();
    } else {
        firstNames = fullName;
    }

    return {
        firstNames,
        lastName
    };
}

/**
 * @function
 * @description Parses out the user email address
 * @returns {string}
 */
function getProfileEmail() {    
    /** @type {HTMLButtonElement | null} */
    const emailLabel = document.querySelector('a[href*="mailto:"]');
    const email = emailLabel?.innerHTML.replaceAll(/\s\n\r/gi, '') ?? '';
    return email.trim()
}

/**
 * @function
 * @description Parses the regional data of the user
 * @returns {{city: string, country: string}}
 */
function getProfileRegion() {
    let city = '';
    let country = '';

    const region = document.querySelector('main')
        ?.querySelector('section')
        ?.querySelector('span.text-body-small.inline')
        ?.innerHTML ?? '';

    if (region.includes(',')) {
        city = region.split(',').at(0)?.trim() ?? '';
        country = region.split(',').at(-1)?.trim() ?? '';
    } else {
        city = region;
    }

    return {
        city,
        country
    };
}


/**
 * @function
 * @description Parses the user's linked in url
 * @returns {{url: string, id: string}}
 */
function getProfileWebsite() {
    const url = window.location.href;
    const id = url.match(/(?:in\/)([^/]+)(\/)?/)?.at(1) ?? '';

    return {
        url,
        id
    }
}


/**
 * @function
 * @description Parses out the user's current employement
 * @returns {{company: string, title: string} | null}
 */
function getCurrentEmployement() {
    /** @type {HTMLDivElement | null} */
    const experienceAnchor = document.querySelector('#experience');
    if (!experienceAnchor) {
        return null;
    }

    const currentEmployerDiv = experienceAnchor
        ?.parentElement
        ?.querySelectorAll('div')
        ?.item(6)
        ?.querySelector('div.display-flex');

    if (!currentEmployerDiv) {
        return null;
    }

    let company = '';
    let title = '';
    
    if (currentEmployerDiv?.children.length === 1) {
        const spans = currentEmployerDiv?.querySelectorAll('span[aria-hidden="true"]');
        title = spans.item(0).innerHTML;
        company = spans.item(1).innerHTML;
    } else {
        company = currentEmployerDiv.children.item(0)?.querySelector('div.display-flex span[aria-hidden="true"]')?.innerHTML ?? '';
        title = currentEmployerDiv.children.item(1)?.querySelector('div.display-flex span[aria-hidden="true"]')?.innerHTML ?? '';
    }

    return {
        company: company.replaceAll('<!---->', '').replace(/·.+/, '').trim(),
        title: title.replaceAll('<!---->', '').trim()
    };
}
