'use strict'

module.exports = str => {
  const hasUser = str.includes('id_user=') && !str.includes('guest')

  if (!hasUser)
    return null

  return str.split('id_user=')[1].trim().substring(0, 36)
}
