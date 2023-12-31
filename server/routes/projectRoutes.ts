// const express = require("express");
import {Router, Request, Response} from "express"
export const  router = Router();
import { handleDatabaseTransaction } from "../queries";

router.get('/', async (req, res) => {
    try {
      const result = await handleDatabaseTransaction(async (client) => {
        const queryText = 'SELECT * FROM project';
        return await client.query(queryText);
      });
  
      res.status(200).json(result.rows || []);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving projects from the database' });
    }
  });
  
  // GET specific project
  router.get('/:projectId', async (req, res) => {
    const { projectId } = req.params;
  
    try {
      const result = await handleDatabaseTransaction(async (client) => {
        return await client.query('SELECT * FROM project WHERE projectId = $1', [projectId]);
      });
  
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Project not found' });
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving project from the database' });
    }
  });
  
  // POST a project
  router.post('/', async (req, res) => {
    const { projectName } = req.body;
  
    if (!projectName) {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }
  
    try {
      const result = await handleDatabaseTransaction(async (client) => {
        return await client.query('INSERT INTO project (projectName) VALUES ($1) RETURNING *', [projectName]);
      });
  
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error inserting project into the database' });
    }
  });
  
  // DELETE a project by projectId
  router.delete('/:projectId', async (req, res) => {
    const { projectId } = req.params;
  
    try {
      const result = await handleDatabaseTransaction(async (client) => {
        return await client.query('DELETE FROM project WHERE projectId = $1 RETURNING *', [projectId]);
      });
  
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Project not found' });
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      res.status(500).json({ error: 'Error deleting project from the database' });
    }
  });
  
  // DELETE all projects
  router.delete('/', async (req, res) => {
    try {
      const result = await handleDatabaseTransaction(async (client) => {
        return await client.query('DELETE FROM project RETURNING *');
      });
  
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'No projects found' });
      } else {
        res.json(result.rows);
      }
    } catch (error) {
      res.status(500).json({ error: 'Error deleting projects from the database' });
    }
  });
  