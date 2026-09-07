import { prisma } from "../../config/database";
import { NotFoundError } from "../../utils/AppError";
import { CreateProjectInput, UpdateProjectInput } from "./project.validation";

/**
 * Helper to fetch a project and verify ownership.
 * Throws the exact same NotFoundError if the project doesn't exist OR belongs
 * to another user, preventing user enumeration or existence disclosure.
 */
async function findOwnedProjectOrThrow(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.ownerId !== userId) {
    throw new NotFoundError("Project not found");
  }

  return project;
}

/**
 * Creates a new project owned by the specified user.
 */
export async function createProject(ownerId: string, data: CreateProjectInput) {
  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      ownerId,
    },
  });
}

/**
 * Retrieves all projects owned by the specified user, newest first.
 */
export async function getUserProjects(ownerId: string) {
  return prisma.project.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Retrieves a single project by ID if owned by the user.
 */
export async function getProjectById(projectId: string, userId: string) {
  return findOwnedProjectOrThrow(projectId, userId);
}

/**
 * Partially updates a project if owned by the user.
 */
export async function updateProject(
  projectId: string,
  userId: string,
  data: UpdateProjectInput
) {
  await findOwnedProjectOrThrow(projectId, userId);

  return prisma.project.update({
    where: { id: projectId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });
}

/**
 * Deletes a project if owned by the user.
 * Cascading task deletion is handled automatically at the database level.
 */
export async function deleteProject(
  projectId: string,
  userId: string
): Promise<void> {
  await findOwnedProjectOrThrow(projectId, userId);

  await prisma.project.delete({
    where: { id: projectId },
  });
}
