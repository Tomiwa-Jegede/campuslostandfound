import { EMAIL_PATTERN, EMAIL_EXAMPLE, MATRIC_PATTERN, MATRIC_EXAMPLE } from './config.js'

const text = (value) => String(value ?? '').trim()

/** Returns {} when the form is good, or { field: message }. */
export function validateRegister(values) {
  const errors = {}
  if (text(values.full_name).length < 3) errors.full_name = 'Enter your full name.'
  if (!MATRIC_PATTERN.test(text(values.matric_no).toLowerCase())) {
    errors.matric_no = `Use the format ${MATRIC_EXAMPLE}.`
  }
  if (!text(values.department)) errors.department = 'Choose or type your department.'
  const emailText = text(values.email).toLowerCase()
  if (!EMAIL_PATTERN.test(emailText)) {
    errors.email = `Use your matric email, e.g. ${EMAIL_EXAMPLE}.`
  } else if (!errors.matric_no && emailText.split('@')[0] !== text(values.matric_no).split('/').pop()) {
    errors.email = 'Your email must start with the last 5 digits of your matric number.'
  }
  if (!/^0\d{10}$/.test(text(values.phone))) {
    errors.phone = 'Enter an 11-digit phone number starting with 0.'
  }
  if (text(values.password).length < 8) errors.password = 'Use at least 8 characters.'
  if (values.password !== values.confirm_password) errors.confirm_password = 'The two passwords do not match.'
  return errors
}

export function validateLogin(values) {
  const errors = {}
  if (!text(values.email)) errors.email = 'Enter your email address.'
  if (!values.password) errors.password = 'Enter your password.'
  return errors
}

export function validateProfile(values) {
  const errors = {}
  if (text(values.full_name).length < 3) errors.full_name = 'Enter your full name.'
  if (!text(values.department)) errors.department = 'Type your department.'
  if (!/^0\d{10}$/.test(text(values.phone))) {
    errors.phone = 'Enter an 11-digit phone number starting with 0.'
  }
  return errors
}

export function validatePassword(values) {
  const errors = {}
  if (!values.current_password) errors.current_password = 'Enter your current password.'
  if (text(values.new_password).length < 8) errors.new_password = 'Use at least 8 characters.'
  if (values.new_password !== values.confirm_password) errors.confirm_password = 'The two passwords do not match.'
  return errors
}

export function validateItem(values) {
  const errors = {}
  if (text(values.title).length < 5) errors.title = 'Give the item a title of at least 5 characters.'
  if (text(values.title).length > 100) errors.title = 'Keep the title under 100 characters.'
  if (!values.category_id) errors.category_id = 'Choose a category.'
  if (text(values.description).length < 20) errors.description = 'Describe the item in at least 20 characters.'
  if (text(values.description).length > 1000) errors.description = 'Keep the description under 1000 characters.'
  if (!values.occurred_on) errors.occurred_on = 'Choose the date.'
  if (text(values.location).length < 3) errors.location = 'Say where it was lost or found.'
  return errors
}

export function validateClaim(values) {
  const errors = {}
  const proof = text(values.proof)
  if (proof.length < 30) errors.proof = 'Write at least 30 characters explaining why this is yours.'
  if (proof.length > 1000) errors.proof = 'Keep the proof under 1000 characters.'
  if (!values.confirmed) errors.confirmed = 'Tick the box to confirm the item is yours.'
  return errors
}

/** Error text for any field, from client checks or from the server. */
export function fieldError(clientErrors, serverFields, name) {
  return clientErrors[name] || serverFields?.[name] || ''
}
