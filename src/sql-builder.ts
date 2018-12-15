import * as squel from 'squel'

const client = squel.useFlavour('postgres')
client.registerValueHandler(Array, (array) => {
  return 'ARRAY(SELECT json_array_elements_text(\'' + JSON.stringify(array) + '\'))'
})

export default client
