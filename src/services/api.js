const axios = require('axios')

const server = 'http://localhost:3050/'
const apiv1 = 'api/v1'
const apiUrl = server + apiv1

export const api = {
  getRecipe (userId, recipeId) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + userId
    return axios.get(apiUrl + '/recipes/' + recipeId)
  },

  deleteRecipe (userId, recipeId) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + userId
    return axios.delete(apiUrl + '/recipes/' + recipeId)
  },

  updateRecipe (userId, recipeId, recipeObject) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + userId
    return axios.put(apiUrl + '/recipes/' + recipeId, recipeObject)
  },

  getTags (userId) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + userId
    return axios.get(apiUrl + '/tags')
  },

  getLists (userId) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + userId
    return axios.get(apiUrl + '/lists')
  },

  createList (userId, listObject) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + userId
    return axios.post(apiUrl + '/lists', listObject)
  },

  addRecipeToList (userId, listId, recipeObject) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + userId
    return axios.post(apiUrl + '/lists/' + listId + '/recipes', recipeObject)
  },

  getList (userId, listId) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + userId
    return axios.get(apiUrl + '/lists/' + listId)
  },

  deleteList (userId, listId) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + userId
    return axios.delete(apiUrl + '/lists/' + listId)
  },

  deleteRecipeFromList (userId, listId, recipeId) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + userId
    return axios.delete(apiUrl + '/lists/' + listId + '/recipes/' + recipeId)
  },

  deleteItemFromList (userId, listId, itemId) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + userId
    return axios.delete(apiUrl + '/lists/' + listId + '/items/' + itemId)
  },

  searchRecipes (userId, searchHref) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + userId
    return axios.get(apiUrl + '/recipes?' + searchHref)
  }
}
