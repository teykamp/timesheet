import { Router, Request, Response } from "express"
export const router = Router();
import { handleDatabaseTransaction } from "../queries";

// POST a timesheetNote
const validateInput = (data: any) => {
  const { timesheetId, incorrectHours, incorrectProject, incorrectTime, commentBody, requireResubmit } = data;
  return (
    timesheetId !== undefined &&
    incorrectHours !== undefined &&
    incorrectProject !== undefined &&
    incorrectTime !== undefined &&
    commentBody !== undefined &&
    requireResubmit !== undefined
  );
};

router.post('/', async (req, res) => {
  const {
    timesheetId,
    incorrectHours,
    incorrectProject,
    incorrectTime,
    commentBody,
    requireResubmit,
  } = req.body;

  if (!validateInput(req.body)) {
    return res.status(400).json({ error: 'All fields are required for TimesheetNote entry' });
  }

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      if (requireResubmit) {
        const updateResult = await client.query(
          'UPDATE Timesheet SET status = $1 WHERE timesheetId = $2 RETURNING *',
          ['revised', timesheetId]
        );

        if (updateResult.rows.length === 0) {
          console.error('Failed to update Timesheet status');
        }
      }
      return await client.query(
        'INSERT INTO TimesheetNote (timesheetId, incorrectHours, incorrectProject, incorrectTime, commentBody, requireResubmit) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [timesheetId, incorrectHours, incorrectProject, incorrectTime, commentBody, requireResubmit]
      );
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inserting TimesheetNote into the database' });
  }
});

// GET timesheetNotes by timesheetId
router.get('/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('SELECT * FROM TimesheetNote WHERE timesheetId = $1', [timesheetId]);
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'TimesheetNotes not found for the given timesheetId... timesheetId likely has no notes' });
    } else {
      res.json(result.rows);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheet notes from the database' });
  }
});

// GET all timesheetNotes
router.get('/', async (req, res) => {
  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('SELECT * FROM TimesheetNote');
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'TimesheetNotes Table is Empty' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheet notes from the database' });
  }
});