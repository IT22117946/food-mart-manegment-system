const express = require('express')
const {
    createWorkout,
    getWorkout,
    getWorkouts,
    deleteWorkout,
    updateWorkot
} = require('../controllers/workoutController')


const router = express.Router()

//GET all workouts
router.get('/' ,getWorkouts )


//GET a single workouts
router.get('/:id', getWorkout)

//POST a new workouts
router.post('/',createWorkout)

//DELETE a workouts
router.delete('/:id',deleteWorkout)

//UPDAE a workouts
router.patch('/:id',updateWorkot)

module.exports = router