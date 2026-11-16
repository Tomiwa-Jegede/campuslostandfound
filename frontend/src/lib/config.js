// Values that the real server keeps in .env.
// If you change one here, change it there too — they must agree.
export const CAMPUS_EMAIL_DOMAIN = 'run.edu.ng'
export const EMAIL_PATTERN = /^\d{5}@run\.edu\.ng$/
export const MATRIC_PATTERN = /^run\/[a-z]{2,4}\/\d{2}\/\d{5}$/
export const MATRIC_EXAMPLE = 'run/cmp/24/17209'
export const EMAIL_EXAMPLE = '17209@run.edu.ng'

// One photo per item, JPG or PNG, maximum 2 MB (FR-10).
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024
export const MAX_PHOTO_MB = 2
