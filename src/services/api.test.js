import { api } from './api'
import axios from 'axios'

jest.mock('axios')

const server = 'http://localhost:3050/api/v1'

describe('api', () => {
  describe('getRecipe', () => {
    it('returns recipe', async () => {
      const recipeData = {
        data: {
          _id: '1234',
          userId: 'testUser',
          title: 'testRecipe',
          ingredients: [{ quantity: 1, unit: 'g', name: 'test ingredient', displayQuantity: '1' }, { name: 'test ingredient without quantity or unit' }],
          instructions: ''
        }
      }
      axios.get.mockResolvedValue(recipeData)
      await expect(api.getRecipe('testUser', 'recipeId')).resolves.toEqual(recipeData)
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith(server + '/recipes/recipeId')
    })

    it('returns error if fetch fails', async () => {
      axios.get.mockRejectedValue({ error: 'failed to get recipe' })
      await expect(api.getRecipe('testUser', 'recipeId')).rejects.toEqual({ error: 'failed to get recipe' })
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith(server + '/recipes/recipeId')
    })
  })

  describe('deleteRecipe', () => {
    it('deletes recipe', async () => {
      axios.delete.mockResolvedValue()
      await expect(api.deleteRecipe('testUser', 'recipeId')).resolves
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.delete).toHaveBeenCalledWith(server + '/recipes/recipeId')
    })

    it('returns error if fetch fails', async () => {
      axios.delete.mockRejectedValue({ error: 'failed to delete recipe' })
      await expect(api.deleteRecipe('testUser', 'recipeId')).rejects.toEqual({ error: 'failed to delete recipe' })
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.delete).toHaveBeenCalledWith(server + '/recipes/recipeId')
    })
  })

  describe('updateRecipe', () => {
    const recipeObject = {
      title: 'new recipe',
      servings: 5
    }
    it('updates recipe', async () => {
      axios.put.mockResolvedValue()
      await expect(api.updateRecipe('testUser', 'recipeId', recipeObject)).resolves
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.put).toHaveBeenCalledWith(server + '/recipes/recipeId', recipeObject)
    })

    it('returns error if fetch fails', async () => {
      axios.put.mockRejectedValue({ error: 'failed to update recipe' })
      await expect(api.updateRecipe('testUser', 'recipeId', recipeObject)).rejects.toEqual({ error: 'failed to update recipe' })
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.put).toHaveBeenCalledWith(server + '/recipes/recipeId', recipeObject)
    })
  })

  describe('getTags', () => {
    const tagsData = {
      data: [
        { _id: 'meat', count: 20 },
        { _id: 'vegetarian', count: 1 }
      ]
    }
    it('gets tags', async () => {
      axios.get.mockResolvedValue(tagsData)
      await expect(api.getTags('testUser')).resolves
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith(server + '/tags')
    })

    it('returns error if fetch fails', async () => {
      axios.get.mockRejectedValue({ error: 'failed to get tags' })
      await expect(api.getTags('testUser')).rejects.toEqual({ error: 'failed to get tags' })
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith(server + '/tags')
    })
  })

  describe('getLists', () => {
    const listsData = {
      data: [{
        _id: 'testId',
        userId: 'testUser',
        title: 'test shopping list',
        items: [
          { _id: 'item1', quantity: 1, unit: 'g', name: 'test ingredient', displayQuantity: '1', recipeId: 'recipe1', servings: 1 }
        ],
        recipes: {
          href: '/api/v1/lists/testId/recipes',
          recipesData: [
            {
              _id: 'recipe1',
              title: 'first recipe',
              image: '/img.png',
              servings: 1,
              href: '/api/v1/lists/testId/recipes/recipe1'
            }
          ]
        }
      }]
    }
    it('gets lists', async () => {
      axios.get.mockResolvedValue(listsData)
      await expect(api.getLists('testUser')).resolves
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith(server + '/lists')
    })

    it('returns error if fetch fails', async () => {
      axios.get.mockRejectedValue({ error: 'failed to get tags' })
      await expect(api.getLists('testUser')).rejects.toEqual({ error: 'failed to get tags' })
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith(server + '/lists')
    })
  })

  describe('createList', () => {
    const listObject = {
      title: 'new list'
    }
    it('creates list', async () => {
      axios.post.mockResolvedValue()
      await expect(api.createList('testUser', listObject)).resolves
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.post).toHaveBeenCalledWith(server + '/lists', listObject)
    })

    it('returns error if create fails', async () => {
      axios.post.mockRejectedValue({ error: 'failed to create list' })
      await expect(api.createList('testUser', listObject)).rejects.toEqual({ error: 'failed to create list' })
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.post).toHaveBeenCalledWith(server + '/lists', listObject)
    })
  })

  describe('addRecipeToList', () => {
    const listObject = {
      recipeId: 'recipeId',
      recipeServings: 10
    }
    it('adds recipe list', async () => {
      axios.post.mockResolvedValue()
      await expect(api.addRecipeToList('testUser', 'listId', listObject)).resolves
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.post).toHaveBeenCalledWith(server + '/lists/listId/recipes', listObject)
    })

    it('returns error if adding recipe fails', async () => {
      axios.post.mockRejectedValue({ error: 'failed to add recipe to list' })
      await expect(api.addRecipeToList('testUser', 'listId', listObject)).rejects.toEqual({ error: 'failed to add recipe to list' })
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.post).toHaveBeenCalledWith(server + '/lists/listId/recipes', listObject)
    })
  })

  describe('getList', () => {
    const listData = {
      data: {
        _id: 'testId',
        userId: 'testUser',
        title: 'test shopping list',
        items: [
          { _id: 'item1', quantity: 1, unit: 'g', name: 'test ingredient', displayQuantity: '1', recipeId: 'recipe1', servings: 1 }
        ],
        recipes: {
          href: '/api/v1/lists/testId/recipes',
          recipesData: [
            {
              _id: 'recipe1',
              title: 'first recipe',
              image: '/img.png',
              servings: 1,
              href: '/api/v1/lists/testId/recipes/recipe1'
            }
          ]
        }
      }
    }
    it('gets list', async () => {
      axios.get.mockResolvedValue(listData)
      await expect(api.getList('testUser', 'listId')).resolves
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith(server + '/lists/listId')
    })

    it('returns error if fetch fails', async () => {
      axios.get.mockRejectedValue({ error: 'failed to get list' })
      await expect(api.getList('testUser', 'listId')).rejects.toEqual({ error: 'failed to get list' })
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith(server + '/lists/listId')
    })
  })

  describe('deleteList', () => {
    it('deletes list', async () => {
      axios.delete.mockResolvedValue()
      await expect(api.deleteList('testUser', 'listId')).resolves
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.delete).toHaveBeenCalledWith(server + '/lists/listId')
    })

    it('returns error if delete fails', async () => {
      axios.delete.mockRejectedValue({ error: 'failed to delete list' })
      await expect(api.deleteList('testUser', 'listId')).rejects.toEqual({ error: 'failed to delete list' })
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.delete).toHaveBeenCalledWith(server + '/lists/listId')
    })
  })

  describe('deleteRecipeFromList', () => {
    it('deletes recipe from list', async () => {
      axios.delete.mockResolvedValue()
      await expect(api.deleteRecipeFromList('testUser', 'listId', 'recipeId')).resolves
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.delete).toHaveBeenCalledWith(server + '/lists/listId/recipes/recipeId')
    })

    it('returns error if delete recipe fails', async () => {
      axios.delete.mockRejectedValue({ error: 'failed to delete recipe from list' })
      await expect(api.deleteRecipeFromList('testUser', 'listId', 'recipeId')).rejects.toEqual({ error: 'failed to delete recipe from list' })
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.delete).toHaveBeenCalledWith(server + '/lists/listId/recipes/recipeId')
    })
  })

  describe('deleteItemFromList', () => {
    it('deletes item from list', async () => {
      axios.delete.mockResolvedValue()
      await expect(api.deleteItemFromList('testUser', 'listId', 'itemId')).resolves
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.delete).toHaveBeenCalledWith(server + '/lists/listId/items/itemId')
    })

    it('returns error if delete item fails', async () => {
      axios.delete.mockRejectedValue({ error: 'failed to delete item from list' })
      await expect(api.deleteItemFromList('testUser', 'listId', 'itemId')).rejects.toEqual({ error: 'failed to delete item from list' })
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.delete).toHaveBeenCalledWith(server + '/lists/listId/items/itemId')
    })
  })

  describe('searchRecipes', () => {
    it('deletes item from list', async () => {
      axios.get.mockResolvedValue()
      await expect(api.searchRecipes('testUser', 'skip=0&limit=70&searchString=sugar flour')).resolves
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith(server + '/recipes?skip=0&limit=70&searchString=sugar flour')
    })

    it('returns error if delete item fails', async () => {
      axios.get.mockRejectedValue({ error: 'failed to search' })
      await expect(api.searchRecipes('testUser', 'skip=0&limit=70&searchString=sugar flour')).rejects.toEqual({ error: 'failed to search' })
      expect(axios.defaults.headers.common.Authorization).toEqual('Bearer testUser')
      expect(axios.get).toHaveBeenCalledWith(server + '/recipes?skip=0&limit=70&searchString=sugar flour')
    })
  })
})
