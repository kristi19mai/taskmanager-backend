import { NotFoundError } from "../errors/index.js";
import Task from "../models/Tasks.js";
import { StatusCodes } from "http-status-codes";

const getAllTasks = async (req, res) => {
  const { important, status, task, dueDate, sort, fields } = req.query;
  console.log(req.user);
  

  const queryObject = { createdBy: req.user.userId };

  if (important) {
    // "important"="true" to get all important tasks
    queryObject.important = important === "true" ? true : false;
  }

  if (status) {
    queryObject.status = status;
  }
  if (task) {
    // regex, case-insensitive task search
    queryObject.task = { $regex: task, $options: "i" };
  }

  //sort tasks
  let result = Task.find(queryObject);
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    // default sort tasks by dueDate.date
    result = result.sort("-dueDate");
  }

  // select fields to show
  // "fields"="task,status,important,dueDate.date,date" to show only these fields
  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }

  // pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 80;
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(limit);

  const tasks = await result;
  res
    .status(StatusCodes.OK)
    .json({ tasks, count: tasks.length, user: req.user });
};

const createTask = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const task = await Task.create(req.body);
  res.status(StatusCodes.CREATED).json({ task });
};

const getOneTask = async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.userId;

  const task = await Task.findOne({ _id: taskId, createdBy: userId });
  if (!task) {
    throw new NotFoundError(`keines Todo with id ${taskId}`);
  }
  res.status(StatusCodes.OK).json({ task });
};

const deleteTask = async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.userId;

  const task = await Task.findByIdAndDelete({ _id: taskId, createdBy: userId });
  if (!task) {
    throw new NotFoundError(`keines Todo with id ${taskId}`);
  }
  res.status(StatusCodes.OK).send();
};

const updateTask = async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.userId;

  const task = await Task.findByIdAndUpdate(
    { _id: taskId, createdBy: userId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!task) {
    throw new NotFoundError(`keines Todo with id ${taskId}`);
  }
  res.status(StatusCodes.OK).json({ task });
};

export { getAllTasks, createTask, updateTask, getOneTask, deleteTask };
