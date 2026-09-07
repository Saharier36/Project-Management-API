import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { BadRequestError, NotFoundError } from "../../utils/AppError";
import { CreateTaskInput, TaskQueryInput, UpdateTaskInput } from "./task.validation";

/**
 * Helper to verify that a project exists and is owned by the requesting user.
 * Throws 404 if it does not exist OR is owned by another user.
 */
async function verifyProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.ownerId !== userId) {
    throw new NotFoundError("Project not found");
  }

  return project;
}

/**
 * Helper to fetch a task and verify ownership via its parent project.
 * Throws 404 if the task doesn't exist OR its parent project belongs to another user.
 */
async function findOwnedTaskOrThrow(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (!task || task.project.ownerId !== userId) {
    throw new NotFoundError("Task not found");
  }

  return task;
}

/**
 * Helper to verify that an assigned user exists.
 */
async function verifyAssigneeExists(assignedToId: string | undefined) {
  if (!assignedToId) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: assignedToId },
  });

  if (!user) {
    throw new BadRequestError("Assigned user does not exist");
  }
}

/**
 * Creates a new task inside a project owned by the user.
 */
export async function createTask(
  projectId: string,
  userId: string,
  data: CreateTaskInput
) {
  await verifyProjectOwnership(projectId, userId);
  await verifyAssigneeExists(data.assignedToId);

  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      assignedToId: data.assignedToId,
      projectId,
    },
  });
}

/**
 * Retrieves paginated tasks for a project with optional status/priority filtering.
 */
export async function getProjectTasks(
  projectId: string,
  userId: string,
  query: TaskQueryInput
) {
  await verifyProjectOwnership(projectId, userId);

  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  const where: Prisma.TaskWhereInput = {
    projectId,
    ...(query.status && { status: query.status }),
    ...(query.priority && { priority: query.priority }),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Retrieves a single task by ID if its parent project is owned by the user.
 */
export async function getTaskById(taskId: string, userId: string) {
  const { project, ...task } = await findOwnedTaskOrThrow(taskId, userId);
  return task;
}

/**
 * Updates a task by ID if its parent project is owned by the user.
 */
export async function updateTask(
  taskId: string,
  userId: string,
  data: UpdateTaskInput
) {
  await findOwnedTaskOrThrow(taskId, userId);

  if (data.assignedToId !== undefined) {
    await verifyAssigneeExists(data.assignedToId);
  }

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
    },
  });
}

/**
 * Deletes a task by ID if its parent project is owned by the user.
 */
export async function deleteTask(
  taskId: string,
  userId: string
): Promise<void> {
  await findOwnedTaskOrThrow(taskId, userId);

  await prisma.task.delete({
    where: { id: taskId },
  });
}
