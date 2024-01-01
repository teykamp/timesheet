import {Router, Request, Response} from "express"
export const  router = Router();
import { handleDatabaseTransaction } from "../queries";
import { url } from "inspector";
/*
  USERS
*/

// Check if user first time login and POST if does not exist
///userFirstTimeLogin/:userId/:email -> /users/FirstTimeLogin/:userId/:email (current)
// /userFirstTimeLogin/:userId/:email -> /user/:userID/:email?FirstTimeLogin=True (thoughts)
router.get('/:userId/:email', async (req, res) => {
    const { userId, email } = req.params;
    /* this query parameter will be determined by whether these is a
    bearer-token/cookie in the request. 
    can be checked using some form of middleware in express
    !yet to implement!
    */
    const firstTime = req.query 
    try {
        if(firstTime){
            const userResponse = await handleDatabaseTransaction(async (client) => {
            const result = await client.query('SELECT * FROM "timesheetuser" WHERE userId = $1', [userId]);
    
            if (!result || !result.rows || result.rows.length === 0) {
            const createUserResult = await client.query(
                'INSERT INTO "timesheetuser" (userId, email) VALUES ($1, $2) RETURNING *',
                [userId, email]
            );
    
            return createUserResult.rows[0];
            }
    
            return result.rows[0];
            res.json(userResponse);
        });
    }else{
        // redirect if already logged in
        res.status(301).json({message: "redirecting to main page"})
    }
  
     
    } catch (error) {
      res.status(500).json({ error: 'Error checking or creating user' });
    }
  });
  
  // POST a user
  router.post('/', async (req, res) => {
    const { username, email, managerId, isManager } = req.body;
  
    if (!username || !email || typeof isManager !== 'boolean') {
      return res.status(400).json({ error: 'Username, email, and isManager are required fields' });
    }
  
    try {
      const result = await handleDatabaseTransaction(async (client) => {
        return await client.query(
          'INSERT INTO "timesheetuser" (userId, email, managerId, isManager) VALUES ($1, $2, $3, $4) RETURNING *',
          [username, email, managerId, isManager]
        );
      });
  
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error inserting user into the database' });
    }
  });
  
  // GET a user by userId
  router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const result = await handleDatabaseTransaction(async (client) => {
        return await client.query('SELECT * FROM "timesheetuser" WHERE userId = $1', [userId]);
      });
  
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving user from the database' });
    }
  });
  
  // GET all users
  router.get('/', async (req, res) => {
    try {
      const result = await handleDatabaseTransaction(async (client) => {
        return await client.query('SELECT * FROM "timesheetuser"');
      });
  
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving users from the database' });
    }
  });
  
  // DELETE a user by userId
  router.delete('/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const result = await handleDatabaseTransaction(async (client) => {
        return await client.query('DELETE FROM "timesheetuser" WHERE userId = $1 RETURNING *', [userId]);
      });
  
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      res.status(500).json({ error: 'Error deleting user from the database' });
    }
  });
  
  // DELETE all users
  router.delete('/', async (req, res) => {
    try {
      const result = await handleDatabaseTransaction(async (client) => {
        return await client.query('DELETE FROM "timesheetuser" RETURNING *');
      });
  
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'No users found' });
      } else {
        res.json(result.rows);
      }
    } catch (error) {
      res.status(500).json({ error: 'Error deleting users from the database' });
    }
  });
  
  // GET all managers
  // from api/managers -> api/users/managers
  router.get('/managers', async (req, res) => {
    try {
      const result = await handleDatabaseTransaction(async (client) => {
        return await client.query('SELECT * FROM "timesheetuser" WHERE isManager = true');
      });
  
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving managers from the database' });
    }
  });
  
  // GET all users of a manager
  router.get('/manager/:managerId', async (req, res) => {
    const { managerId } = req.params;
  
    try {
      const result = await handleDatabaseTransaction(async (client) => {
        return await client.query('SELECT * FROM "timesheetuser" WHERE managerId = $1', [managerId]);
      });
  
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving users of a manager from the database' });
    }
  });
  
  // UPDATE user's manager
  router.put('/:userId/manager', async (req, res) => {
    const { userId } = req.params;
    const { managerId } = req.body;
  
    try {
      const result = await handleDatabaseTransaction(async (client) => {
        return await client.query(
          'UPDATE "timesheetuser" SET managerId = $1 WHERE userId = $2 RETURNING *',
          [managerId, userId]
        );
      });
  
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      res.status(500).json({ error: 'Error updating user\'s manager in the database' });
    }
  });
  
  // UPDATE user's manager status
  router.put('/:userId/manager/status', async (req, res) => {
    const { userId } = req.params;
    const { isManager } = req.body;
  
    try {
      const result = await handleDatabaseTransaction(async (client) => {
        return await client.query(
          'UPDATE "timesheetuser" SET isManager = $1 WHERE userId = $2 RETURNING *',
          [isManager, userId]
        );
      });
  
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      res.status(500).json({ error: 'Error updating user\'s manager status in the database' });
    }
  });